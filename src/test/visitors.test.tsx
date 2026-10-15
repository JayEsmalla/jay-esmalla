import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shouldTrackVisitors, startVisitorTracking, VisitorContext } from "@/lib/visitors";
import VisitorCounter from "@/components/VisitorCounter";

let stop: (() => void) | undefined;
const counts = { active: 3, visits: 1240, viewers: ["0123456789abcdef01234567", "fedcba9876543210fedcba98", "a5c31e79b2d4608fa5c31e79"] };
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

  it("keeps visible readers counted and polls new totals every 15 seconds without input", async () => {
    const onCounts = vi.fn();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(0);
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ visits: 1241, active: 4 }) } as Response);
    await vi.advanceTimersByTimeAsync(15000);
    expect(onCounts).toHaveBeenLastCalledWith({ visits: 1241, active: 4 });
    await vi.advanceTimersByTimeAsync(105000);
    expect(fetch).toHaveBeenCalledTimes(9);
    expect(onCounts).not.toHaveBeenCalledWith(null);
    window.dispatchEvent(new Event("pointerdown"));
    await vi.advanceTimersByTimeAsync(0);
    for (let i = 0; i < 10; i++) window.dispatchEvent(new Event("pointermove"));
    expect(fetch).toHaveBeenCalledTimes(9);
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

  it("rejects raw session IDs instead of using them as public icon seeds", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ visits: 1, active: 1, viewers: ["90ecad82-9b50-476f-8cb8-cb493fd93057"] }) } as Response);
    const onCounts = vi.fn();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(0);
    expect(onCounts).toHaveBeenLastCalledWith(null);
  });

  it("keeps displaying totals from an older Worker during deployment", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ visits: 10, active: 2 }) } as Response);
    const onCounts = vi.fn();
    stop = startVisitorTracking(onCounts);
    await vi.advanceTimersByTimeAsync(0);
    expect(onCounts).toHaveBeenLastCalledWith({ visits: 10, active: 2 });
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
  it("gives different viewers distinct glyphs and keeps their identity when the order changes", () => {
    const { container, rerender } = render(<VisitorContext.Provider value={counts}><VisitorCounter /></VisitorContext.Provider>);
    const glyphs = Array.from(container.querySelectorAll("svg")).filter((svg) => svg.querySelector("rect"));
    expect(glyphs).toHaveLength(3);
    expect(new Set(glyphs.map((svg) => svg.innerHTML)).size).toBe(3);
    rerender(<VisitorContext.Provider value={{ ...counts, viewers: [...counts.viewers].reverse() }}><VisitorCounter /></VisitorContext.Provider>);
    const reordered = Array.from(container.querySelectorAll("svg")).filter((svg) => svg.querySelector("rect"));
    expect(reordered[0]).toBe(glyphs[2]);
    expect(reordered[2]).toBe(glyphs[0]);
  });
  it("shows readable counts and visible dashes without inventing unavailable numbers", () => {
    const { rerender, container } = render(<VisitorContext.Provider value={counts}><VisitorCounter /></VisitorContext.Provider>);
    expect(screen.getByText("1,240")).toBeInTheDocument();
    expect(screen.getByText("3+")).toBeInTheDocument();
    expect(screen.getByTitle(/Approximate active sessions/)).toBeInTheDocument();
    rerender(<VisitorContext.Provider value={null}><VisitorCounter /></VisitorContext.Provider>);
    expect(container.textContent).toContain("— active now");
    expect(container.textContent).toContain("— visits");
    expect(screen.getByTitle(/Local previews do not record visits/)).toBeInTheDocument();
    expect(screen.queryByText("1,240")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass("min-h-5");
  });
});
