export type PublicContribution = { date: string; count: number; level: number };
export type PublicContributionFeed = { contributions: PublicContribution[]; total?: Record<string, number> };

export const CONTRIBUTION_CACHE_MAX_AGE_MS = 5 * 60_000;
const REQUEST_TIMEOUT_MS = 12_000;

type PendingFeed = {
  controller: AbortController;
  promise: Promise<PublicContributionFeed>;
  consumers: number;
};
type FeedEntry = { data?: PublicContributionFeed; fetchedAt?: number; pending?: PendingFeed };
const feeds = new Map<string, FeedEntry>();
const abortError = () => new DOMException("The activity request was cancelled.", "AbortError");

export function readContributionFeed(url: string): PublicContributionFeed | null {
  const entry = feeds.get(url);
  return entry?.data && Date.now() - (entry.fetchedAt ?? 0) < CONTRIBUTION_CACHE_MAX_AGE_MS
    ? entry.data
    : null;
}

function startFeed(url: string, entry: FeedEntry): PendingFeed {
  const controller = new AbortController();
  const pending: PendingFeed = { controller, consumers: 0, promise: null! };
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Abort must settle the shared request even if a transport ignores its signal.
  const response = new Promise<PublicContributionFeed>((resolve, reject) => {
    controller.signal.addEventListener("abort", () => reject(abortError()), { once: true });
    void fetch(url, { signal: controller.signal })
      .then(async (result) => {
        if (!result.ok) throw new Error(`Public GitHub activity returned HTTP ${result.status}`);
        const raw = (await result.json()) as PublicContributionFeed;
        if (!Array.isArray(raw.contributions)) throw new Error("Invalid public contribution payload.");
        return raw;
      })
      .then(resolve, reject);
  });

  pending.promise = response.then((data) => {
    if (controller.signal.aborted) throw abortError();
    entry.data = data;
    entry.fetchedAt = Date.now();
    return data;
  }).finally(() => {
    window.clearTimeout(timeout);
    if (entry.pending === pending) entry.pending = undefined;
    if (!entry.data && !entry.pending && feeds.get(url) === entry) feeds.delete(url);
  });
  entry.pending = pending;
  return pending;
}

export function loadContributionFeed(url: string, signal: AbortSignal): Promise<PublicContributionFeed> {
  if (signal.aborted) return Promise.reject(abortError());
  const cached = readContributionFeed(url);
  if (cached) return Promise.resolve(cached);

  const entry = feeds.get(url) ?? {};
  feeds.set(url, entry);
  const pending = entry.pending ?? startFeed(url, entry);
  pending.consumers += 1;

  return new Promise((resolve, reject) => {
    let settled = false;
    const release = () => {
      if (settled) return false;
      settled = true;
      signal.removeEventListener("abort", cancel);
      pending.consumers -= 1;
      return true;
    };
    const cancel = () => {
      if (!release()) return;
      reject(abortError());
      // One unmounted section must not cancel another section's shared request.
      if (pending.consumers === 0 && entry.pending === pending) {
        entry.pending = undefined;
        pending.controller.abort();
      }
    };
    signal.addEventListener("abort", cancel, { once: true });
    pending.promise.then(
      (data) => { if (release()) resolve(data); },
      (error: unknown) => { if (release()) reject(error); },
    );
  });
}

export function clearContributionFeedCache() {
  feeds.forEach((entry) => entry.pending?.controller.abort());
  feeds.clear();
}
