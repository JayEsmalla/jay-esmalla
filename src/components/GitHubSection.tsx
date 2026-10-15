import { useEffect, useMemo, useRef, useState } from "react";
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
  { key: "last", label: "PAST 12 MONTHS" },
  ...Array.from({ length: CURRENT_YEAR - 2023 }, (_, index) => {
    const year = CURRENT_YEAR - index;
    return { key: String(year), label: String(year) };
  }),
];

const CELL = 10;
const REQUEST_TIMEOUT_MS = 12_000;
const UNAVAILABLE_MESSAGE = "Activity is temporarily unavailable. You can still explore my repositories on GitHub.";
const LEVELS = ["#171717", "#2a2a2a", "#1a3a0a", "#3d7a18", "#98ff38"];
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
  month: "short", day: "numeric", year: "numeric",
});

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

const groupChronologicalDays = (days: Day[]): Week[] => {
  const orderedDays = [...days].sort((first, second) => first.date.localeCompare(second.date));
  const weeks: Week[] = [];
  let currentWeek: Day[] = [];
  orderedDays.forEach((day) => {
    if (dayOfWeek(day.date) === 0 && currentWeek.length > 0) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length) weeks.push({ days: currentWeek });
  return weeks;
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

  const weeks = groupChronologicalDays(contributions.map((item) => ({
    date: item.date,
    count: item.count,
    color: LEVELS[Math.min(4, Math.max(0, item.level))],
  })));

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
  const [displayTotal, setDisplayTotal] = useState(0);
  const countUpRef = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    setLoading(true);
    setError(null);
    setData(null);
    setFallback(false);

    const timeout = window.setTimeout(() => {
      if (disposed) return;
      controller.abort();
      setError(UNAVAILABLE_MESSAGE);
      setLoading(false);
    }, REQUEST_TIMEOUT_MS);

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

      return { ...result, weeks: groupChronologicalDays(result.weeks.flatMap((week) => week.days)) };
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
          if (disposed || controller.signal.aborted) return;
          setData(publicCalendar);
          setFallback(true);
          return;
        }

        try {
          const serverCalendar = await fetchServerCalendar();
          if (disposed || controller.signal.aborted) return;
          setData(serverCalendar);
          setFallback(serverCalendar.source === "public");
        } catch {
          if (controller.signal.aborted) return;
          const publicCalendar = await fetchPublicCalendar();
          if (disposed || controller.signal.aborted) return;
          setData(publicCalendar);
          setFallback(true);
        }
      } catch {
        if (controller.signal.aborted || disposed) return;
        setError(UNAVAILABLE_MESSAGE);
      } finally {
        window.clearTimeout(timeout);
        if (!disposed) setLoading(false);
      }
    };

    void load();

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [activeTab]);

  // Count-up animation when total changes
  useEffect(() => {
    if (!data) return;
    const target = data.total;
    if (countUpRef.current) window.cancelAnimationFrame(countUpRef.current);
    const duration = 900;
    const startTime = performance.now();
    const startValue = displayTotal;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayTotal(Math.round(startValue + (target - startValue) * eased));
      if (progress < 1) countUpRef.current = window.requestAnimationFrame(animate);
    };
    countUpRef.current = window.requestAnimationFrame(animate);
    return () => { if (countUpRef.current) window.cancelAnimationFrame(countUpRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const columns = useMemo(() => (data ? buildColumns(data.weeks) : []), [data]);
  const days = useMemo(() => data?.weeks.flatMap((week) => week.days) ?? [], [data]);
  const firstDate = days[0]?.date;
  const lastDate = days[days.length - 1]?.date;
  const activeDays = days.filter((day) => day.count > 0).length;

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
              Recent public activity across product work, technical experiments, and steady improvements to shipped repositories.
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
          className="mt-8 rounded-[8px] border border-graphite p-4 md:mt-10 md:p-5"
        >
          {/* ── Header: number + label + tabs in one compact row ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite pb-3">
            <div className="flex items-baseline gap-2.5">
              <p className="text-[26px] font-normal tracking-[-0.03em] text-chalk leading-none">
                {loading ? "—" : error ? "—" : displayTotal.toLocaleString()}
              </p>
              <div className="leading-none">
                <span className="meta-text text-smoke">CONTRIBUTIONS</span>
                {fallback && !loading && !error && (
                  <span className="meta-text ml-2 text-smoke/50">· PUBLIC ONLY</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Contribution period">
              {YEAR_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-[4px] border px-2.5 py-1 text-[11px] tracking-[0.03em] transition-colors ${
                    activeTab === tab.key
                      ? "border-pulse-green text-pulse-green"
                      : "border-graphite text-smoke hover:border-iron hover:text-chalk"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div role="status" className="flex h-[120px] items-center justify-center gap-2.5 text-smoke">
              <Loader2 size={13} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              <span className="meta-text">QUERYING GITHUB</span>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div role="status" className="flex min-h-[120px] flex-col items-center justify-center gap-3 py-4 text-smoke">
              <div className="flex max-w-md items-start gap-2 text-[13px] leading-relaxed">
                <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
              </div>
              <a href={githubConfig.profileUrl} target="_blank" rel="noopener noreferrer" className="ghost-button">
                OPEN PROFILE <ArrowUpRight size={13} />
              </a>
            </div>
          )}

          {/* ── Calendar ── */}
          {!loading && !error && data && (
            <div className="mt-3">
              {/* Hidden accessibility hint */}
              <p id="github-calendar-help" className="sr-only">
                Swipe or use the arrow keys to scroll the calendar.
              </p>

              {days.length > 0 ? (
                <>
                  <div
                    role="region"
                    aria-label="Contribution calendar"
                    aria-describedby="github-calendar-summary github-calendar-help"
                    tabIndex={0}
                    className="scroll-fade-right overflow-x-auto rounded-[2px] pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pulse-green"
                  >
                    <div aria-hidden="true" className="flex min-w-max gap-[3px]">
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
                  </div>

                  {/* ── Footer: summary + legend on same row ── */}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p id="github-calendar-summary" className="text-[12px] text-smoke">
                      {firstDate && lastDate
                        ? `${activeDays} active day${activeDays === 1 ? "" : "s"} · ${formatDate(firstDate)} – ${formatDate(lastDate)}`
                        : "No activity recorded for this period."}
                    </p>
                    <div aria-hidden="true" className="flex items-center gap-1">
                      <span className="meta-text mr-1 text-smoke">LESS</span>
                      {LEVELS.map((level) => (
                        <span
                          key={level}
                          className="rounded-[2px] border border-graphite"
                          style={{ width: CELL, height: CELL, background: level }}
                        />
                      ))}
                      <span className="meta-text ml-1 text-smoke">MORE</span>
                    </div>
                  </div>
                </>
              ) : (
                <p id="github-calendar-summary" className="py-4 text-[13px] text-smoke">
                  No activity recorded for this period yet.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubSection;
