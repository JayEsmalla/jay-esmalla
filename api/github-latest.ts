// Vercel serverless function — returns the most recent public commit for JayEsmalla.
// Uses GITHUB_TOKEN when available; falls back to the public GitHub Events API.

const USERNAME = "JayEsmalla";

type RequestLike = {
  method?: string;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ResponseLike;
  end: () => unknown;
  json: (body: unknown) => unknown;
};

export type LatestCommitPayload = {
  repo: string;
  message: string;
  pushedAt: string;
  url: string;
  source: "graphql" | "events";
};

type GraphQLResponse = {
  data?: {
    user?: {
      repositories?: {
        nodes?: Array<{
          name: string;
          url: string;
          pushedAt: string | null;
          defaultBranchRef?: {
            target?: {
              messageHeadline?: string;
              committedDate?: string;
              url?: string;
            };
          } | null;
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

type PublicEvent = {
  type?: string;
  created_at?: string;
  repo?: { name?: string };
  payload?: {
    commits?: Array<{ message?: string; sha?: string }>;
  };
};

const QUERY_LATEST = `
  query($login: String!) {
    user(login: $login) {
      repositories(
        first: 6
        ownerAffiliations: OWNER
        privacy: PUBLIC
        isFork: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          url
          pushedAt
          defaultBranchRef {
            target {
              ... on Commit {
                messageHeadline
                committedDate
                url
              }
            }
          }
        }
      }
    }
  }
`;

const cleanRepoName = (name: string) => name.replace(/^[^/]+\//, "");
const firstLine = (message: string) => message.split(/\r?\n/)[0].trim();

async function fetchFromEvents(): Promise<LatestCommitPayload> {
  const response = await fetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=30`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "jay-esmalla-portfolio/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`Public GitHub events HTTP ${response.status}`);
  }
  const events = (await response.json()) as PublicEvent[];
  if (!Array.isArray(events)) {
    throw new Error("Invalid public GitHub events payload.");
  }

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
          pushedAt: event.created_at ?? new Date().toISOString(),
          url: `https://github.com/${USERNAME}/${repo}`,
          source: "events",
        };
      }
    }
  }

  const pushOrCreate = events.find((event) => (event.type === "PushEvent" || event.type === "CreateEvent") && event.repo?.name);
  if (pushOrCreate?.repo?.name) {
    const repo = cleanRepoName(pushOrCreate.repo.name);
    return {
      repo,
      message: `Updated ${repo}`,
      pushedAt: pushOrCreate.created_at ?? new Date().toISOString(),
      url: `https://github.com/${USERNAME}/${repo}`,
      source: "events",
    };
  }

  throw new Error("No recent public push events found.");
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
  const token = process.env.GITHUB_TOKEN;

  if (token) {
    try {
      const ghRes = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "jay-esmalla-portfolio/1.0",
        },
        body: JSON.stringify({ query: QUERY_LATEST, variables: { login: USERNAME } }),
      });

      if (!ghRes.ok) throw new Error(`GitHub GraphQL HTTP ${ghRes.status}`);
      const json = (await ghRes.json()) as GraphQLResponse;
      if (json.errors?.length) throw new Error(json.errors[0].message);

      const nodes = json.data?.user?.repositories?.nodes ?? [];
      const node = nodes.find((item) => item?.defaultBranchRef?.target?.messageHeadline) ?? nodes[0];
      if (node) {
        const target = node.defaultBranchRef?.target;
        return res.status(200).json({
          repo: node.name,
          message: firstLine(target?.messageHeadline ?? `Updated ${node.name}`),
          pushedAt: target?.committedDate ?? node.pushedAt ?? new Date().toISOString(),
          url: target?.url ?? node.url,
          source: "graphql",
        } satisfies LatestCommitPayload);
      }
    } catch {
      // Fall back to public events API below.
    }
  }

  try {
    const fallback = await fetchFromEvents();
    return res.status(200).json(fallback);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Latest GitHub activity is unavailable.";
    return res.status(502).json({ error: message });
  }
}

