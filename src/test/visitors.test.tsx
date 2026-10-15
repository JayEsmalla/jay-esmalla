import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shouldTrackVisitors, startVisitorTracking, VisitorContext } from "@/lib/visitors";
import VisitorCounter from "@/components/VisitorCounter";

let stop: (() => void) | undefined;
const counts = { active: 3, visits: 1240 };
const respond = () => Promise.resolve({ ok: true, json: async () => counts });
beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  vi.stubGlobal("fetch", vi.fn(respond));
});
afterEach(() => { stop?.(); stop = undefined; cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("visitor lifecycle", () => {
  it("only enables production on the portfolio domains", () => {
    expect(shouldTrackVisitors(true, "https://jayesmalla.tech")).toBe(true);
    expect(shouldTrackVisitors(true, "https://www.jayesmalla.tech")).toBe(true);
    expect(shouldTrackVisitors(false, "https://jayesmalla.tech")).toBe(false);
    expect(shouldTrackVisitors(true, "http://localhost:5174")).toBe(false);
    expect(shouldTrackVisitors(true, "https://preview.example")).toBe(false);
  });

  it("reuses one anonymous session across refreshes and parallel tabs", async () => {
    const onCounts = vi.fn();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(0);
    stop();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(0);
    const anotherTab = startVisitorTracking(vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    anotherTab();
    const bodies = vi.mocked(fetch).mock.calls.map(([, options]) => JSON.parse(String(options?.body)).sessionId);
    expect(bodies).toHaveLength(3);
    expect(new Set(bodies).size).toBe(1);
    expect(onCounts).toHaveBeenLastCalledWith(counts);
  });

  it("pauses when hidden and resumes with the existing session", async () => {
    const onCounts = vi.fn();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(0);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(120000);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onCounts).toHaveBeenLastCalledWith(null);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("stops idle heartbeats and resumes after interaction without request bursts", async () => {
    const onCounts = vi.fn();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(120000);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(onCounts).toHaveBeenLastCalledWith(null);
    window.dispatchEvent(new Event("pointerdown"));
    await vi.advanceTimersByTimeAsync(0);
    for (let i = 0; i < 10; i++) window.dispatchEvent(new Event("pointermove"));
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("hides failed counts and backs off instead of displaying zero", async () => {
    const onCounts = vi.fn();
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(30000);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onCounts).toHaveBeenLastCalledWith(null);
    window.dispatchEvent(new Event("keydown"));
    await vi.advanceTimersByTimeAsync(30000);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("avoids counting when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    const onCounts = vi.fn();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).not.toHaveBeenCalled();
    expect(onCounts).toHaveBeenLastCalledWith(null);
  });

  it("rejects malformed server responses", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ visits: 0, active: 7 }) } as Response);
    const onCounts = vi.fn();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(0);
    expect(onCounts).toHaveBeenLastCalledWith(null);
  });

  it("cleans up timers and event listeners", async () => {
    stop = startVisitorTracking(vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    stop();
    window.dispatchEvent(new Event("pointerdown"));
    await vi.advanceTimersByTimeAsync(120000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("hero counter", () => {
  it("shows readable counts and visible dashes without inventing unavailable numbers", () => {
    const { rerender, container } = render(<VisitorContext.Provider value={counts}><VisitorCounter /></VisitorContext.Provider>);
    expect(screen.getByText("1,240")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTitle(/Approximate active sessions/)).toBeInTheDocument();
    rerender(<VisitorContext.Provider value={null}><VisitorCounter /></VisitorContext.Provider>);
    expect(container.textContent).toContain("— active now");
    expect(container.textContent).toContain("— visits");
    expect(screen.getByTitle(/Local previews do not record visits/)).toBeInTheDocument();
    expect(screen.queryByText("1,240")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass("min-h-5");
  });
});
