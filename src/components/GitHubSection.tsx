import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, Loader2 } from "lucide-react";
import { githubConfig } from "@/data/portfolio";

type Day = { date: string; count: number; color: string };
type Week = { days: Day[] };
type CalendarData = { total: number; weeks: Week[]; source?: "github" | "public" };
type JogContribution = { date: string; count: number; level: number };
type JogRaw = { contributions: JogContribution[]; total?: Record<string, number> };

type CalendarResponse = CalendarData & { error?: string };

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_TABS = [
  { key: "last", label: "LAST YEAR" },
  ...Array.from({ length: CURRENT_YEAR - 2023 }, (_, index) => {
    const year = CURRENT_YEAR - index;
    return { key: String(year), label: String(year) };
  }),
];

const CELL = 10;
const LEVELS = ["#171717", "#2a2a2a", "#474747", "#9c9c9c", "#f3f3f3"];

const dayOfWeek = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
};

const countToLevel = (count: number) => {
  if (count === 0) return 0;
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 4) return 2;
  return 1;
};

const jogruberToCalendar = (raw: JogRaw, year: string): CalendarData => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  let contributions = raw.contributions;

  if (year === "last") {
    const cutoff = new Date(now);
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const cutoffDate = cutoff.toISOString().slice(0, 10);
    contributions = contributions.filter((item) => item.date >= cutoffDate && item.date <= today);
  } else {
    contributions = contributions.filter((item) => item.date.startsWith(year) && item.date <= today);
  }

  const weeks: Week[] = [];
  let currentWeek: Day[] = [];
  contributions.forEach((item) => {
    if (dayOfWeek(item.date) === 0 && currentWeek.length > 0) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
    currentWeek.push({ date: item.date, count: item.count, color: LEVELS[Math.min(4, Math.max(0, item.level))] });
  });
  if (currentWeek.length) weeks.push({ days: currentWeek });

  const total = year === "last"
    ? contributions.reduce((sum, item) => sum + item.count, 0)
    : raw.total?.[year] ?? contributions.reduce((sum, item) => sum + item.count, 0);

  return { total, weeks, source: "public" };
};

const buildColumns = (weeks: Week[]): (Day | null)[][] =>
  weeks.map((week, weekIndex) => {
    const column: (Day | null)[] = [];
    if (!week.days.length) return Array(7).fill(null);
    if (weekIndex === 0) {
      for (let index = 0; index < dayOfWeek(week.days[0].date); index += 1) column.push(null);
    }
    week.days.forEach((day) => column.push(day));
    while (column.length < 7) column.push(null);
    return column;
  });

const GitHubSection = () => {
  const [activeTab, setActiveTab] = useState("last");
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    setLoading(true);
    setError(null);
    setData(null);
    setFallback(false);

    const query = activeTab === "last" ? "" : `?year=${activeTab}`;
    const publicUrl = import.meta.env.DEV
      ? `/api/github-public/${githubConfig.username}`
      : `https://github-contributions-api.jogruber.de/v4/${githubConfig.username}`;

    const fetchServerCalendar = async (): Promise<CalendarData> => {
      const response = await fetch(`/api/github-contributions${query}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Portfolio API returned HTTP ${response.status}`);

      const result = (await response.json()) as CalendarResponse;
      if (result.error) throw new Error(result.error);
      if (!Number.isFinite(result.total) || !Array.isArray(result.weeks)) {
        throw new Error("Portfolio API returned an invalid contribution payload.");
      }

      return result;
    };

    const fetchPublicCalendar = async (): Promise<CalendarData> => {
      const response = await fetch(publicUrl, { signal: controller.signal });
      if (!response.ok) throw new Error(`Public GitHub activity returned HTTP ${response.status}`);

      const raw = (await response.json()) as JogRaw;
      if (!Array.isArray(raw.contributions)) {
        throw new Error("Public GitHub activity returned an invalid contribution payload.");
      }

      return jogruberToCalendar(raw, activeTab);
    };

    const load = async () => {
      try {
        if (import.meta.env.DEV) {
          const publicCalendar = await fetchPublicCalendar();
          if (disposed) return;
          setData(publicCalendar);
          setFallback(true);
          return;
        }

        try {
          const serverCalendar = await fetchServerCalendar();
          if (disposed) return;
          setData(serverCalendar);
          setFallback(serverCalendar.source === "public");
        } catch {
          if (controller.signal.aborted) return;
          const publicCalendar = await fetchPublicCalendar();
          if (disposed) return;
          setData(publicCalendar);
          setFallback(true);
        }
      } catch (loadError) {
        if (controller.signal.aborted || disposed) return;
        setError(loadError instanceof Error ? loadError.message : "GitHub activity is temporarily unavailable.");
      } finally {
        if (!disposed) setLoading(false);
      }
    };

    void load();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [activeTab]);

  const columns = useMemo(() => (data ? buildColumns(data.weeks) : []), [data]);

  return (
    <section id="github" className="section-shell scroll-mt-[72px]">
      <div className="page-container">
        <div className="section-heading-grid">
          <div>
            <p className="section-kicker">03 / GITHUB ACTIVITY</p>
            <h2 className="section-title">A public trail of experiments, commits, and shipped code.</h2>
          </div>
          <div className="flex flex-col justify-end gap-5">
            <p className="text-[15px] leading-[1.6] text-smoke">
              Contribution data loads from the portfolio API when available, with a public GitHub fallback for local development.
            </p>
            <a href={githubConfig.profileUrl} target="_blank" rel="noopener noreferrer" className="ghost-button w-fit">
              VIEW GITHUB <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-[8px] border border-graphite p-5 md:mt-14 md:p-8"
        >
          <div className="flex flex-col gap-5 border-b border-graphite pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="meta-text text-smoke">CONTRIBUTIONS</p>
              {!loading && !error && data && (
                <p className="mt-2 text-[34px] font-normal tracking-[-0.02em] text-chalk">{data.total.toLocaleString()}</p>
              )}
              {loading && <p className="mt-3 text-[14px] text-smoke">Loading activity…</p>}
              {error && <p className="mt-3 text-[14px] text-smoke">Unable to load contribution data.</p>}
              {fallback && <p className="meta-text mt-2 text-smoke">PUBLIC CONTRIBUTIONS ONLY</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {YEAR_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-[4px] border px-3 py-2 text-[10px] tracking-[0.03em] ${
                    activeTab === tab.key ? "border-chalk bg-chalk text-obsidian" : "border-graphite text-smoke hover:text-chalk"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex h-40 items-center justify-center gap-3 text-smoke">
              <Loader2 size={16} className="animate-spin" />
              <span className="meta-text">QUERYING GITHUB</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-40 flex-col items-center justify-center gap-4 text-smoke">
              <div className="flex items-center gap-2 text-[14px]"><AlertCircle size={15} /> {error}</div>
              <a href={githubConfig.profileUrl} target="_blank" rel="noopener noreferrer" className="ghost-button">OPEN PROFILE <ArrowUpRight size={13} /></a>
            </div>
          )}

          {!loading && !error && data && (
            <div className="no-scrollbar mt-7 overflow-x-auto pb-2">
              <div className="flex min-w-max gap-[3px]">
                {columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col gap-[3px]">
                    {column.map((day, rowIndex) => (
                      day ? (
                        <div
                          key={`${day.date}-${rowIndex}`}
                          title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                          className="rounded-[2px] border border-graphite"
                          style={{ width: CELL, height: CELL, background: LEVELS[countToLevel(day.count)] }}
                        />
                      ) : (
                        <div key={`empty-${rowIndex}`} style={{ width: CELL, height: CELL }} />
                      )
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-1.5">
                <span className="meta-text mr-1 text-smoke">LESS</span>
                {LEVELS.map((level) => <span key={level} className="rounded-[2px] border border-graphite" style={{ width: CELL, height: CELL, background: level }} />)}
                <span className="meta-text ml-1 text-smoke">MORE</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubSection;
