import { useEffect, useState } from "react";
import { githubConfig } from "@/data/portfolio";

export interface LatestCommit {
  repo: string;
  message: string;
  pushedAt: string | null;
  url: string;
}

export const FALLBACK_COMMIT: LatestCommit = {
  repo: "1561-vulshop",
  message: "Workshop job queue, split payments & stock ledger",
  pushedAt: null,
  url: githubConfig.profileUrl,
};

const CACHE_TTL_MS = 10 * 60_000;
let cached: { value: LatestCommit; fetchedAt: number } | null = null;

type PublicEvent = {
  type?: string;
  created_at?: string;
  repo?: { name?: string };
  payload?: {
    commits?: Array<{ message?: string }>;
  };
};

const cleanRepoName = (name: string) => name.replace(/^[^/]+\//, "");
const firstLine = (message: string) => message.split(/\r?\n/)[0].trim();

export function formatRelativeAge(isoDate: string | null, now: Date = new Date()): string {
  if (!isoDate) return "recent";
  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) return "recent";
  const diffSeconds = Math.max(0, Math.floor((now.getTime() - timestamp) / 1000));
  if (diffSeconds < 90) return "just now";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function parseEventsPayload(raw: unknown): LatestCommit | null {
  if (!Array.isArray(raw)) return null;
  const events = raw as PublicEvent[];
  for (const event of events) {
    const repo = event.repo?.name ? cleanRepoName(event.repo.name) : "";
    if (!repo) continue;
    const commits = event.payload?.commits;
    if (event.type === "PushEvent" && Array.isArray(commits) && commits.length > 0) {
      const latest = commits[commits.length - 1];
      const message = firstLine(latest?.message ?? "");
      if (message) {
        return {
          repo,
          message,
          pushedAt: event.created_at ?? null,
          url: `https://github.com/${githubConfig.username}/${repo}`,
        };
      }
    }
  }
  const fallbackEvent = events.find(
    (event) => (event.type === "PushEvent" || event.type === "CreateEvent") && event.repo?.name,
  );
  if (fallbackEvent?.repo?.name) {
    const repo = cleanRepoName(fallbackEvent.repo.name);
    return {
      repo,
      message: `Updated ${repo}`,
      pushedAt: fallbackEvent.created_at ?? null,
      url: `https://github.com/${githubConfig.username}/${repo}`,
    };
  }
  return null;
}

export async function fetchLatestCommit(signal?: AbortSignal): Promise<LatestCommit> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  // In local Vite dev (`:8080`), `vercel dev` (:3000) is usually not running, so call GitHub's CORS-enabled public Events API directly.
  const isLocalViteDev = Boolean(import.meta.env.DEV && !import.meta.env.VITEST);
  const publicEventsUrl = `https://api.github.com/users/${githubConfig.username}/events/public?per_page=20`;
  const endpoints = isLocalViteDev
    ? [publicEventsUrl]
    : ["/api/github-latest", publicEventsUrl];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { signal });
      if (!response.ok) continue;
      const body = (await response.json()) as unknown;

      if (body && typeof body === "object" && !Array.isArray(body) && "repo" in body && "message" in body) {
        const record = body as Record<string, unknown>;
        if (typeof record.repo === "string" && typeof record.message === "string") {
          const commit: LatestCommit = {
            repo: record.repo,
            message: record.message,
            pushedAt: typeof record.pushedAt === "string" ? record.pushedAt : null,
            url: typeof record.url === "string" ? record.url : githubConfig.profileUrl,
          };
          cached = { value: commit, fetchedAt: Date.now() };
          return commit;
        }
      }

      const parsed = parseEventsPayload(body);
      if (parsed) {
        cached = { value: parsed, fetchedAt: Date.now() };
        return parsed;
      }
    } catch {
      if (signal?.aborted) break;
    }
  }

  return FALLBACK_COMMIT;
}

export function clearLatestCommitCache() {
  cached = null;
}

export function useLatestCommit(enabled = true): LatestCommit {
  const [commit, setCommit] = useState<LatestCommit>(() => cached?.value ?? FALLBACK_COMMIT);

  useEffect(() => {
    if (!enabled || typeof fetch !== "function") return;
    const controller = new AbortController();
    void fetchLatestCommit(controller.signal).then((result) => {
      if (!controller.signal.aborted) setCommit(result);
    });
    return () => controller.abort();
  }, [enabled]);

  return commit;
}

