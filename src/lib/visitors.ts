import { createContext } from "react";

export interface VisitorCounts { visits: number; active: number; viewers?: string[] }
export const VisitorContext = createContext<VisitorCounts | null>(null);

export const VISITOR_ENDPOINT = "https://jay-esmalla.jaesmalla1.workers.dev/api/visitors";
const storageKey = "portfolio-visitor-session-v1";
const sessionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const heartbeatMs = 15000;

export function shouldTrackVisitors(production: boolean, origin: string) {
  return production && ["https://jayesmalla.tech", "https://www.jayesmalla.tech"].includes(origin);
}

function getSession() {
  // Fail closed when storage is blocked; otherwise refreshes would inflate visits.
  const saved = localStorage.getItem(storageKey);
  if (saved && sessionPattern.test(saved)) return saved;
  const id = crypto.randomUUID();
  localStorage.setItem(storageKey, id);
  return id;
}

export function startVisitorTracking(onCounts: (counts: VisitorCounts | null) => void) {
  let disposed = false;
  let nextRequest = 0;
  let failures = 0;
  let pending: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout>;
  let staleTimer: ReturnType<typeof setTimeout>;

  async function heartbeat() {
    clearTimeout(timer);
    if (disposed) return;
    if (document.visibilityState !== "visible") {
      onCounts(null);
      return;
    }
    if (pending) return;
    if (Date.now() < nextRequest) {
      timer = setTimeout(heartbeat, nextRequest - Date.now());
      return;
    }
    const controller = new AbortController();
    pending = controller;
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(VISITOR_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: navigator.locks ? await navigator.locks.request(storageKey, getSession) : getSession() }),
        credentials: "omit",
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Counter unavailable");
      const counts = await response.json() as VisitorCounts;
      if (!Number.isSafeInteger(counts?.visits) || !Number.isSafeInteger(counts?.active) || counts.visits < 1 || counts.active < 1 || counts.active > counts.visits) throw new Error("Invalid counts");
      // Older deployments can still supply totals while the Worker is updated.
      if (counts.viewers !== undefined && (!Array.isArray(counts.viewers) || counts.viewers.length !== Math.min(counts.active, 3) || new Set(counts.viewers).size !== counts.viewers.length || counts.viewers.some((seed) => typeof seed !== "string" || !/^[a-f0-9]{24}$/.test(seed)))) throw new Error("Invalid viewers");
      failures = 0;
      if (!disposed && document.visibilityState === "visible") {
        onCounts(counts);
        clearTimeout(staleTimer);
        staleTimer = setTimeout(() => onCounts(null), 90000);
      }
    } catch {
      failures += 1;
      if (!disposed) onCounts(null);
    } finally {
      clearTimeout(timeout);
      pending = null;
      nextRequest = Date.now() + (failures ? Math.min(120000, 30000 * 2 ** Math.min(failures, 2)) : heartbeatMs);
      if (!disposed) timer = setTimeout(heartbeat, nextRequest - Date.now());
    }
  }

  function visibility() {
    if (document.visibilityState === "visible") {
      if (!failures) nextRequest = 0;
      void heartbeat();
    }
    else { clearTimeout(timer); onCounts(null); }
  }
  document.addEventListener("visibilitychange", visibility);
  void heartbeat();
  return () => {
    disposed = true;
    clearTimeout(timer);
    clearTimeout(staleTimer);
    pending?.abort();
    document.removeEventListener("visibilitychange", visibility);
  };
}
