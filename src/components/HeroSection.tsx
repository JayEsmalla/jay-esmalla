import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { projects } from "@/data/portfolio";
import { motionTokens, useMotionSettings } from "@/lib/motion";
import VisitorCounter from "./VisitorCounter";
import Portrait from "./Portrait";

const HERO_STATS = [
  { index: "01", value: String(projects.length), label: "PROJECTS", detail: "Selected academic & independent work" },
  { index: "02", value: "3+", label: "FRAMEWORKS", detail: "Flutter · React · React Native" },
  { index: "03", value: "4th", label: "CS / AI", detail: "UMTC · Tagum College" },
];

const HeroSection = ({ ready = true }: { ready?: boolean }) => {
  const { reduced, compact, pageEntrance } = useMotionSettings();
  const immediate = reduced || pageEntrance;
  const shown = ready || immediate;
  const entrance = (delay = 0, distance = 8) => ({
    initial: immediate ? false as const : { opacity: 0, y: compact ? distance / 2 : distance },
    animate: { opacity: shown ? 1 : 0, y: shown ? 0 : compact ? distance / 2 : distance },
    transition: { duration: immediate ? 0 : motionTokens.reveal, delay: shown && !immediate ? delay : 0, ease: motionTokens.ease },
  });

  return (
    <section id="home" className="border-b border-graphite bg-carbon">
      {/* ── Top Status Bar (aligned with Spine h-14 header) ── */}
      <motion.div
        {...entrance(0, 4)}
        className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-graphite bg-obsidian/40 px-5 py-2.5 sm:px-8 lg:px-10"
      >
        <div className="flex items-center gap-3">
          <span className="meta-text text-smoke">00 // PORTFOLIO OVERVIEW</span>
          <span className="hidden h-3 w-px bg-graphite sm:inline-block" aria-hidden="true" />
          <span className="meta-text hidden text-smoke/60 sm:inline">TAGUM CITY, PH</span>
        </div>

        <div className="status-badge">
          <span className="status-dot shrink-0" />
          OPEN TO OPPORTUNITIES &amp; FREELANCE
        </div>
      </motion.div>

      {/* ── Main Connected Editorial Grid ── */}
      <div className="grid border-b border-graphite bg-carbon lg:grid-cols-[minmax(0,1.42fr)_minmax(260px,0.58fr)]">
        {/* ── Left: Editorial Headline + Bio + CTAs ── */}
        <div className="editorial-grid-bg relative flex flex-col justify-between p-6 sm:p-8 lg:p-11">
          <div>
            <motion.p {...entrance(0.03)} className="section-kicker">
              MOBILE + WEB DEVELOPER
            </motion.p>

            <h1 className="mt-5 max-w-[680px] text-balance text-[42px] font-normal leading-[0.96] tracking-[-0.045em] text-chalk sm:text-[54px] md:text-[62px] lg:text-[68px]">
              {["Practical apps.", "Clear interfaces."].map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                  <motion.span
                    className="block"
                    initial={immediate ? false : { opacity: 0, y: "105%" }}
                    animate={{ opacity: shown ? 1 : 0, y: shown ? "0%" : "105%" }}
                    transition={{
                      duration: immediate ? 0 : motionTokens.headline,
                      delay: shown && !immediate ? index * (compact ? 0.04 : 0.07) : 0,
                      ease: motionTokens.ease,
                    }}
                  >
                    {line}
                    {index === 0 ? " " : ""}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              {...entrance(0.12)}
              className="mt-6 max-w-[560px] text-[16px] leading-[1.65] text-smoke md:text-[17px]"
            >
              I&apos;m Jay, a full-stack developer building mobile and web apps with Flutter, React, React Native, and TypeScript.
            </motion.p>
          </div>

          {/* ── Prominent Hero CTAs ── */}
          <motion.div
            {...entrance(0.16)}
            className="mt-8 flex flex-wrap items-center gap-3 border-t border-graphite pt-6 sm:mt-10"
          >
            <Link to="/#contact" className="primary-pill">
              LET&apos;S CHAT <ArrowUpRight size={14} />
            </Link>
            <a
              href="/Jay_Esmalla_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View CV (opens in a new tab)"
              className="ghost-button"
            >
              VIEW CV <FileText size={13} />
            </a>
            <Link
              to="/#projects"
              className="ml-auto inline-flex min-h-11 items-center gap-1.5 px-2 font-mono-retro text-[11px] uppercase tracking-[0.05em] text-smoke transition-colors hover:text-pulse-green"
            >
              SELECTED WORK <ArrowDownRight size={14} className="text-pulse-green" />
            </Link>
          </motion.div>
        </div>

        {/* ── Right: Framed Portrait Cell ── */}
        <motion.aside
          {...entrance(0.1)}
          className="flex flex-col justify-between border-t border-graphite bg-obsidian/40 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8"
          aria-label="Profile portrait"
        >
          <div className="mb-4 flex items-center justify-between border-b border-graphite pb-2.5">
            <span className="meta-text text-smoke">PROFILE // 01</span>
            <span className="meta-text text-compass-gold">CS · AI</span>
          </div>
          <div className="my-auto w-full">
            <Portrait />
          </div>
        </motion.aside>
      </div>

      {/* ── Bottom 4-Cell Connected Telemetry & Stats Bar ── */}
      <div className="grid grid-cols-2 bg-carbon lg:grid-cols-4">
        {HERO_STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`p-5 sm:p-6 ${index % 2 === 1 ? "border-l border-graphite" : ""} ${
              index >= 2 ? "border-t border-graphite lg:border-l lg:border-t-0" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="meta-text text-smoke">{stat.label}</p>
              <span className="font-mono-retro text-[10px] text-smoke/40">{stat.index}</span>
            </div>
            <p className="mt-2.5 text-[28px] font-normal leading-none tracking-[-0.04em] text-chalk sm:text-[34px]">
              {stat.value}
            </p>
            <p className="meta-text mt-2 hidden text-smoke/60 sm:block">{stat.detail}</p>
          </div>
        ))}

        <motion.div
          {...entrance(0.18, 0)}
          className="border-l border-t border-graphite p-5 sm:p-6 lg:border-t-0"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="meta-text text-smoke">TELEMETRY</p>
            <span className="font-mono-retro text-[10px] text-pulse-green">LIVE</span>
          </div>
          <VisitorCounter />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
