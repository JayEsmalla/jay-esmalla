// Vercel serverless function — proxies GitHub GraphQL API safely
// Token is stored in Vercel environment variables, never exposed to the browser.
//
// HOW TO SET UP:
//   1. Create a GitHub PAT: github.com/settings/tokens → "Fine-grained token"
//      Required scopes: read:user (to read public contribution data)
//   2. In Vercel dashboard → Settings → Environment Variables:
//      Name: GITHUB_TOKEN   Value: ghp_xxxxxxxx   Environment: Production + Preview
//   3. Production prefers this authenticated endpoint. Regular Vite local development
//      uses the public contribution feed directly, so a local token is optional.

const USERNAME = "JayEsmalla";

type RequestLike = {
  method?: string;
  query?: { year?: string | string[] };
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ResponseLike;
  end: () => unknown;
  json: (body: unknown) => unknown;
};

type ContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

type GitHubGraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: ContributionCalendar;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

type PublicContribution = {
  date: string;
  count: number;
  level: number;
};

type PublicContributionResponse = {
  contributions?: PublicContribution[];
  total?: Record<string, number>;
};

type NormalizedCalendar = {
  total: number;
  weeks: Array<{
    days: Array<{ date: string; count: number; color: string }>;
  }>;
  source: "github" | "public";
};

const dayOfWeek = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
};

const normalizePublicCalendar = (raw: PublicContributionResponse, yearParam?: string): NormalizedCalendar => {
  if (!Array.isArray(raw.contributions)) {
    throw new Error("Public GitHub activity returned an invalid payload.");
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  let contributions = raw.contributions;

  if (yearParam && yearParam !== "last") {
    contributions = contributions.filter((item) => item.date.startsWith(yearParam) && item.date <= today);
  } else {
    const cutoff = new Date(now);
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const cutoffDate = cutoff.toISOString().slice(0, 10);
    contributions = contributions.filter((item) => item.date >= cutoffDate && item.date <= today);
  }

  const weeks: NormalizedCalendar["weeks"] = [];
  let currentWeek: NormalizedCalendar["weeks"][number]["days"] = [];

  contributions.forEach((item) => {
    if (dayOfWeek(item.date) === 0 && currentWeek.length > 0) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }

    currentWeek.push({ date: item.date, count: item.count, color: "" });
  });

  if (currentWeek.length > 0) weeks.push({ days: currentWeek });

  const total = yearParam && yearParam !== "last"
    ? raw.total?.[yearParam] ?? contributions.reduce((sum, item) => sum + item.count, 0)
    : contributions.reduce((sum, item) => sum + item.count, 0);

  return { total, weeks, source: "public" };
};

const fetchPublicCalendar = async (yearParam?: string): Promise<NormalizedCalendar> => {
  const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}`);
  if (!response.ok) {
    throw new Error(`Public GitHub activity HTTP ${response.status}`);
  }

  const raw = (await response.json()) as PublicContributionResponse;
  return normalizePublicCalendar(raw, yearParam);
};

const QUERY_LAST = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount color }
          }
        }
      }
    }
  }
`;

const QUERY_YEAR = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount color }
          }
        }
      }
    }
  }
`;

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = process.env.GITHUB_TOKEN;
  const rawYear = req.query?.year;
  const yearParam = Array.isArray(rawYear) ? rawYear[0] : rawYear;

  let query: string;
  let variables: Record<string, string>;

  if (yearParam && yearParam !== "last") {
    const year = Number.parseInt(yearParam, 10);
    const now = new Date();
    const currentYear = now.getFullYear();

    if (!/^\d{4}$/.test(yearParam) || !Number.isInteger(year) || year < 2008 || year > currentYear) {
      return res.status(400).json({ error: "Invalid contribution year." });
    }

    const isCurrent = year === currentYear;
    query = QUERY_YEAR;
    variables = {
      login: USERNAME,
      from: `${year}-01-01T00:00:00Z`,
      to: isCurrent ? now.toISOString() : `${year}-12-31T23:59:59Z`,
    };
  } else {
    query = QUERY_LAST;
    variables = { login: USERNAME };
  }

  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");

  if (!token) {
    try {
      const publicCalendar = await fetchPublicCalendar(yearParam);
      return res.status(200).json(publicCalendar);
    } catch (publicError: unknown) {
      const message = publicError instanceof Error ? publicError.message : "Public GitHub activity is unavailable.";
      return res.status(502).json({ error: message });
    }
  }

  try {
    const ghRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "portfolio-contributions-widget/1.0",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!ghRes.ok) {
      throw new Error(`GitHub API HTTP ${ghRes.status}`);
    }

    const json = (await ghRes.json()) as GitHubGraphQLResponse;
    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      throw new Error("GitHub contribution calendar was missing from the response.");
    }

    return res.status(200).json({
      total: calendar.totalContributions,
      weeks: calendar.weeks.map((week) => ({
        days: week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          color: day.color,
        })),
      })),
      source: "github",
    });
  } catch (githubError: unknown) {
    try {
      const publicCalendar = await fetchPublicCalendar(yearParam);
      return res.status(200).json(publicCalendar);
    } catch (publicError: unknown) {
      const githubMessage = githubError instanceof Error ? githubError.message : "GitHub API failed.";
      const publicMessage = publicError instanceof Error ? publicError.message : "Public GitHub activity failed.";
      return res.status(502).json({ error: `${githubMessage} ${publicMessage}` });
    }
  }
}
