import { afterEach, describe, expect, it, vi } from "vitest";
import { clearContributionFeedCache, CONTRIBUTION_CACHE_MAX_AGE_MS, loadContributionFeed, readContributionFeed } from "@/lib/github-activity";

const url = "https://example.test/public-activity";
const feed = { contributions: [{ date: "2026-01-01", count: 1, level: 1 }] };
const response = (data = feed) => ({ ok: true, json: async () => data });

afterEach(() => {
  clearContributionFeedCache();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("public contribution feed cache", () => {
  it("shares one request and lets one subscriber cancel independently", async () => {
    let finish!: (value: unknown) => void;
    const fetchMock = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const first = new AbortController();
    const second = new AbortController();
    const abandoned = loadContributionFeed(url, first.signal);
    const retained = loadContributionFeed(url, second.signal);
    const cancelled = expect(abandoned).rejects.toMatchObject({ name: "AbortError" });
    first.abort();
    await cancelled;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(options.signal?.aborted).toBe(false);
    finish(response());
    expect(await retained).toEqual(feed);
    expect(await loadContributionFeed(url, new AbortController().signal)).toEqual(feed);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("aborts abandoned requests and prevents their late responses from replacing newer data", async () => {
    let finishAbandoned!: (value: unknown) => void;
    const updated = { contributions: [{ date: "2026-01-02", count: 4, level: 2 }] };
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { finishAbandoned = resolve; }))
      .mockResolvedValue(response(updated));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    const abandoned = loadContributionFeed(url, controller.signal);
    const cancelled = expect(abandoned).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await cancelled;
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.signal?.aborted).toBe(true);

    expect(await loadContributionFeed(url, new AbortController().signal)).toEqual(updated);
    finishAbandoned(response());
    await Promise.resolve();
    await Promise.resolve();
    expect(readContributionFeed(url)).toEqual(updated);
  });

  it("expires cached feeds and deduplicates the refresh", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const fetchMock = vi.fn().mockResolvedValue(response());
    vi.stubGlobal("fetch", fetchMock);
    await loadContributionFeed(url, new AbortController().signal);
    expect(readContributionFeed(url)).toEqual(feed);
    vi.setSystemTime(Date.now() + CONTRIBUTION_CACHE_MAX_AGE_MS);
    expect(readContributionFeed(url)).toBeNull();
    await Promise.all([
      loadContributionFeed(url, new AbortController().signal),
      loadContributionFeed(url, new AbortController().signal),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(readContributionFeed(url)).toEqual(feed);
  });

  it("times out an unresponsive transport and allows the next request to recover", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValue(response());
    vi.stubGlobal("fetch", fetchMock);
    const stalled = loadContributionFeed(url, new AbortController().signal);
    const timeout = expect(stalled).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(12_000);
    await timeout;
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.signal?.aborted).toBe(true);
    expect(await loadContributionFeed(url, new AbortController().signal)).toEqual(feed);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache failures or start requests for an already cancelled consumer", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(response());
    vi.stubGlobal("fetch", fetchMock);
    const cancelled = new AbortController();
    cancelled.abort();
    await expect(loadContributionFeed(url, cancelled.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(loadContributionFeed(url, new AbortController().signal)).rejects.toThrow("Offline");
    expect(readContributionFeed(url)).toBeNull();
    expect(await loadContributionFeed(url, new AbortController().signal)).toEqual(feed);
  });
});
