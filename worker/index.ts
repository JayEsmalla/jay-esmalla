import { heartbeatScript } from "./script";

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

const origins = new Set(["https://jayesmalla.tech", "https://www.jayesmalla.tech"]);
const productionHost = "jay-esmalla.jaesmalla1.workers.dev";
const sessionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function reply(status: number, data: unknown, origin: string | null = null) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  });
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  if (status === 429) headers.set("Retry-After", "60");
  return new Response(JSON.stringify(data), { status, headers });
}

async function addressKey(address: string, secret: string, now: number) {
  // Daily rotating HMAC: raw addresses are never sent to Redis or logged.
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`${Math.floor(now / 86400000)}:${address}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function readSession(request: Request): Promise<string | null> {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return null;
  if (Number(request.headers.get("content-length")) > 256) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 256) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const body: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (!body || typeof body !== "object" || !("sessionId" in body)) return null;
  return typeof body.sessionId === "string" && sessionPattern.test(body.sessionId) ? body.sessionId.toLowerCase() : null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // Preview Worker URLs and local development must never mutate production data.
    if (url.hostname !== productionHost) return reply(403, { error: "Production only" });
    if (url.pathname !== "/api/visitors") return reply(404, { error: "Not found" });
    const origin = request.headers.get("Origin");
    if (!origin || !origins.has(origin)) return reply(403, { error: "Origin not allowed" });
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      } });
    }
    if (request.method !== "POST") return reply(405, { error: "Method not allowed" }, origin);
    if (/bot|crawler|spider|headless/i.test(request.headers.get("User-Agent") ?? "")) return reply(403, { error: "Automated traffic excluded" }, origin);

    let sessionId: string | null;
    try { sessionId = await readSession(request); } catch { sessionId = null; }
    if (!sessionId) return reply(400, { error: "Invalid session" }, origin);

    try {
      const redisUrl = new URL(env.UPSTASH_REDIS_REST_URL);
      if (redisUrl.protocol !== "https:" || !redisUrl.hostname.endsWith(".upstash.io") || !env.UPSTASH_REDIS_REST_TOKEN) throw new Error("Missing configuration");
      const now = Date.now();
      const address = request.headers.get("CF-Connecting-IP");
      if (!address) return reply(503, { error: "Counter unavailable" }, origin);
      const hash = await addressKey(address, env.UPSTASH_REDIS_REST_TOKEN, now);
      const prefix = "portfolio:{visitors}:";
      const response = await fetch(redisUrl.origin, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          "EVAL", heartbeatScript, "5",
          `${prefix}session:${sessionId}`, `${prefix}total`, `${prefix}active`,
          `${prefix}rate:${hash}`, `${prefix}new:${hash}`, String(now), sessionId,
        ]),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error("Redis unavailable");
      const body = await response.json() as { result?: unknown };
      if (!Array.isArray(body.result) || body.result.length !== 2) throw new Error("Invalid result");
      const [visits, active] = body.result as unknown[];
      if (visits === -1 && active === -1) return reply(429, { error: "Too many requests" }, origin);
      if (!Number.isSafeInteger(visits) || !Number.isSafeInteger(active) || Number(visits) < 1 || Number(active) < 1 || Number(active) > Number(visits)) throw new Error("Invalid counts");
      return reply(200, { visits, active }, origin);
    } catch {
      // Neither credentials nor upstream error bodies belong in public responses.
      return reply(503, { error: "Counter unavailable" }, origin);
    }
  },
};
