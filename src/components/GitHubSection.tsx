import Reveal from "@/components/Reveal";
import { useMotionSettings, useReveal } from "@/lib/motion";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, Loader2 } from "lucide-react";
import { githubConfig } from "@/data/portfolio";
import { loadContributionFeed, readContributionFeed, type PublicContributionFeed } from "@/lib/github-activity";

type Day = { date: string; count: number; color: string };
type Week = { days: Day[] };
type CalendarData = { total: number; weeks: Week[] };

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_TABS = [
  { key: "last", label: "PAST 12 MONTHS" },
  ...Array.from({ length: CURRENT_YEAR - 2023 }, (_, index) => {
    const year = CURRENT_YEAR - index;
    return { key: String(year), label: String(year) };
  }),
];

const CELL = 10;
const UNAVAILABLE_MESSAGE = "Activity is temporarily unavailable. You can still explore my repositories on GitHub.";
const LEVELS = Array.from({ length: 5 }, (_, level) => `var(--graph-${level})`);
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

const jogruberToCalendar = (raw: PublicContributionFeed, year: string): CalendarData => {
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

  return { total, weeks };
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

// Counter state stays here so each animation frame leaves the calendar untouched.
const ContributionTotal = ({ total }: { total: number }) => {
  const { reduced } = useMotionSettings();
  const [displayTotal, setDisplayTotal] = useState(reduced ? total : 0);
  const displayed = useRef(displayTotal);
  useEffect(() => {
    if (reduced) {
      displayed.current = total;
      setDisplayTotal(total);
      return;
    }
    let frame = 0;
    const startTime = performance.now();
    const startValue = displayed.current;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / 900, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      displayed.current = Math.round(startValue + (total - startValue) * eased);
      setDisplayTotal(displayed.current);
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    if (startValue !== total) frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [total, reduced]);
  return <>{displayTotal.toLocaleString()}</>;
};

const GitHubSection = () => {
  const reveal = useReveal();
  const [activeTab, setActiveTab] = useState("last");
  // GitHub Pages serves static files, so production uses the public feed directly.
  const publicUrl = import.meta.env.DEV
    ? `/api/github-public/${githubConfig.username}`
    : `https://github-contributions-api.jogruber.de/v4/${githubConfig.username}`;
  const [raw, setRaw] = useState(() => readContributionFeed(publicUrl));
  const [loading, setLoading] = useState(!raw);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

  const loadFeed = useCallback(() => {
    if (request.current) return;
    const cached = readContributionFeed(publicUrl);
    if (cached) {
      setRaw(cached);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    void loadContributionFeed(publicUrl, controller.signal)
      .then((feed) => { if (!controller.signal.aborted) setRaw(feed); })
      .catch(() => { if (!controller.signal.aborted) setError(UNAVAILABLE_MESSAGE); })
      .finally(() => {
        if (request.current === controller) request.current = null;
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [publicUrl]);

  useEffect(() => {
    loadFeed();
    const refreshVisible = () => { if (!document.hidden) loadFeed(); };
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
      request.current?.abort();
      request.current = null;
    };
  }, [loadFeed]);

  const data = useMemo(() => raw ? jogruberToCalendar(raw, activeTab) : null, [raw, activeTab]);

  const columns = useMemo(() => (data ? buildColumns(data.weeks) : []), [data]);
  const days = useMemo(() => data?.weeks.flatMap((week) => week.days) ?? [], [data]);
  const firstDate = days[0]?.date;
  const lastDate = days[days.length - 1]?.date;
  const activeDays = days.filter((day) => day.count > 0).length;

  return (
    <section id="github" className="section-shell scroll-mt-[72px]">
      <div className="page-container">
        <Reveal className="section-heading-grid">
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
        </Reveal>

        <motion.div
          {...reveal(1, 8)}
          className="mt-8 rounded-[8px] border border-graphite p-4 md:mt-10 md:p-5"
        >
          {/* ── Header: number + label + tabs in one compact row ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite pb-3">
            <div className="flex items-baseline gap-2.5">
              <p className="text-[26px] font-normal tracking-[-0.03em] text-chalk leading-none">
                {loading || error ? "—" : <ContributionTotal total={data?.total ?? 0} />}
              </p>
              <div className="leading-none">
                <span className="meta-text text-smoke">CONTRIBUTIONS</span>
                {!loading && !error && (
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
                  onClick={() => { setActiveTab(tab.key); loadFeed(); }}
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

export default memo(GitHubSection);
