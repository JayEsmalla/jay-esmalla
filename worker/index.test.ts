import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./index";
import { heartbeatScript } from "./script";

const endpoint = "https://jay-esmalla.jaesmalla1.workers.dev/api/visitors";
const env = { UPSTASH_REDIS_REST_URL: "https://test.upstash.io", UPSTASH_REDIS_REST_TOKEN: "test-secret-not-a-real-token" };
const sessionId = "90ecad82-9b50-476f-8cb8-cb493fd93057";
const headers = { Origin: "https://jayesmalla.tech", "Content-Type": "application/json", "CF-Connecting-IP": "192.0.2.1" };
const request = (body = JSON.stringify({ sessionId }), overrides: Record<string, string> = {}) => new Request(endpoint, { method: "POST", headers: { ...headers, ...overrides }, body });
const redis = (result: unknown = [120, 3]) => vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ result })));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("visitor Worker boundary", () => {
  it("uses one atomic Redis operation and keeps credentials and raw addresses out of data", async () => {
    redis();
    const response = await worker.fetch(request(), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ visits: 120, active: 3 });
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(headers.Origin);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(env.UPSTASH_REDIS_REST_URL);
    const command = JSON.parse(String(options?.body));
    expect(command.slice(0, 3)).toEqual(["EVAL", heartbeatScript, "5"]);
    expect(command[3]).toBe(`portfolio:{visitors}:session:${sessionId}`);
    expect(command[6]).toMatch(/^portfolio:\{visitors\}:rate:[a-f0-9]{64}$/);
    expect(String(options?.body)).not.toContain("192.0.2.1");
    expect(String(options?.body)).not.toContain(env.UPSTASH_REDIS_REST_TOKEN);
  });

  it.each(["https://evil.example", "http://localhost:5174", "null"])("rejects origin %s before contacting Redis", async (Origin) => {
    redis();
    expect((await worker.fetch(request(undefined, { Origin }), env)).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects previews even when they have production secrets", async () => {
    redis();
    const preview = new Request(endpoint.replace("jay-esmalla.", "preview-jay-esmalla."), { method: "POST", headers, body: JSON.stringify({ sessionId }) });
    expect((await worker.fetch(preview, env)).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers preflight without recording a visit", async () => {
    redis();
    const response = await worker.fetch(new Request(endpoint, { method: "OPTIONS", headers }), env);
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["{}", "null", "bad json", JSON.stringify({ sessionId: "anything" }), "x".repeat(257)])("rejects invalid or oversized input without Redis", async (body) => {
    redis();
    expect((await worker.fetch(request(body), env)).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("excludes known bots, GETs, and unexpected paths", async () => {
    redis();
    expect((await worker.fetch(request(undefined, { "User-Agent": "Googlebot" }), env)).status).toBe(403);
    expect((await worker.fetch(new Request(endpoint, { headers }), env)).status).toBe(405);
    expect((await worker.fetch(new Request(endpoint.replace("visitors", "unknown"), { headers }), env)).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns retry guidance when Redis limits traffic", async () => {
    redis([-1, -1]);
    const response = await worker.fetch(request(), env);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it.each([[0, 0], [1, 2], [12, "2"], null])("does not expose invalid counts", async (result) => {
    redis(result);
    const response = await worker.fetch(request(), env);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Counter unavailable" });
  });

  it("does not leak upstream failures or secret values", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(env.UPSTASH_REDIS_REST_TOKEN)));
    const response = await worker.fetch(request(), env);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain(env.UPSTASH_REDIS_REST_TOKEN);
    expect((await worker.fetch(request(), { ...env, UPSTASH_REDIS_REST_URL: "" })).status).toBe(503);
  });
});
