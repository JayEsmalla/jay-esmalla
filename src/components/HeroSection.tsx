import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { projects } from "@/data/portfolio";
import { motionTokens, useMotionSettings } from "@/lib/motion";

const HERO_STATS = [
  { value: String(projects.length), label: "PROJECTS", detail: "Selected academic & independent work" },
  { value: "3+", label: "FRAMEWORKS", detail: "Flutter · React · React Native" },
  { value: "4th", label: "CS / AI", detail: "UMTC · Tagum College" },
];

type PortraitState = "loading" | "ready" | "missing";
type PortraitMode = "real" | "anime";

const HeroSection = ({ ready = true }: { ready?: boolean }) => {
  const { reduced, compact, pageEntrance } = useMotionSettings();
  const immediate = reduced || pageEntrance;
  const shown = ready || immediate;
  const entrance = (delay = 0, distance = 8) => ({
    initial: immediate ? false as const : { opacity: 0, y: compact ? distance / 2 : distance },
    animate: { opacity: shown ? 1 : 0, y: shown ? 0 : compact ? distance / 2 : distance },
    transition: { duration: immediate ? 0 : motionTokens.reveal, delay: shown && !immediate ? delay : 0, ease: motionTokens.ease },
  });
  const [portraitStates, setPortraitStates] = useState<Record<PortraitMode, PortraitState>>({ real: "loading", anime: "loading" });
  const [portraitMode, setPortraitMode] = useState<PortraitMode>("real");
  const portraitState = portraitStates[portraitMode];
  const isAnime = portraitMode === "anime";

  return (
    <section id="home" className="border-b border-graphite bg-carbon">
      <div className="page-container pb-0 pt-8 md:pt-10 lg:pt-14">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.52fr)] lg:gap-10 xl:gap-16">

          {/* ── Left: text content ── */}
          <div
            className="order-1 flex flex-col justify-center py-2 lg:py-10"
          >
            <motion.div {...entrance()} className="status-badge mb-5 w-fit">
              <span className="status-dot shrink-0" />
              OPEN TO OPPORTUNITIES &amp; FREELANCE
            </motion.div>

            <motion.p {...entrance(0.03)} className="meta-text mb-3 text-ash">MOBILE + WEB DEVELOPER</motion.p>

            <h1 className="max-w-[680px] text-balance text-[38px] font-normal leading-[1.02] tracking-[-0.035em] text-chalk sm:text-[46px] md:text-[52px] lg:text-[56px]">
              {["Practical apps.", "Clear interfaces."].map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                  <motion.span
                    className="block"
                    initial={immediate ? false : { opacity: 0, y: "105%" }}
                    animate={{ opacity: shown ? 1 : 0, y: shown ? "0%" : "105%" }}
                    transition={{ duration: immediate ? 0 : motionTokens.headline, delay: shown && !immediate ? index * (compact ? 0.04 : 0.07) : 0, ease: motionTokens.ease }}
                  >{line}{index === 0 ? " " : ""}</motion.span>
                </span>
              ))}
            </h1>

            <motion.p {...entrance(0.12)} className="mt-5 max-w-[580px] text-[16px] leading-[1.65] text-smoke md:mt-6 md:text-[17px]">
              I&apos;m Jay, a full-stack developer building mobile and web apps with Flutter, React, React Native, and TypeScript.
            </motion.p>

            <motion.div {...entrance(0.18, 6)} className="mt-7 flex flex-wrap items-center gap-3 md:mt-8">
              <Link to="/#projects" className="primary-pill justify-center">
                VIEW WORK <ArrowUpRight size={14} />
              </Link>
              <Link to="/#contact" className="ghost-button justify-center">
                CONTACT <ArrowDownRight size={13} />
              </Link>
              <a
                href="/cv.pdf"
                download="Esmalla_Jay_CV.pdf"
                className="inline-flex min-h-11 items-center gap-2 px-1 text-[13px] text-ash underline decoration-iron underline-offset-4 hover:text-chalk"
              >
                DOWNLOAD CV <Download size={13} />
              </a>
            </motion.div>
          </div>

          {/* ── Right: portrait ── */}
          <motion.aside
            {...entrance(0.1)}
            className="order-2 w-full lg:ml-auto"
            aria-label="Profile portrait"
          >
            <button
              type="button"
              className="group relative block w-full select-none overflow-hidden rounded-[8px] border border-graphite bg-[#0c0c0c] text-left transition-colors hover:border-iron"
              style={{ aspectRatio: "3 / 4" }}
              onMouseEnter={() => setPortraitMode("anime")}
              onMouseLeave={() => setPortraitMode("real")}
              onClick={() => setPortraitMode((prev) => (prev === "real" ? "anime" : "real"))}
              aria-label="Toggle anime alter-ego portrait"
              data-cursor="portrait"
              aria-pressed={isAnime}
            >
              {/* Fallback monogram */}
              {portraitState !== "ready" && (
                <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
                  <span className="text-center">
                    <span className="block text-[52px] font-normal tracking-[-0.05em] text-chalk">JE</span>
                    <span className="mt-2 block text-[12px] text-smoke">
                      {portraitState === "missing" ? "Portrait unavailable" : "Loading portrait"}
                    </span>
                  </span>
                </span>
              )}

              {/* Portrait image */}
              <img
                key={portraitMode}
                src={isAnime ? "/gunpark_v2.jpg" : "/profile.webp"}
                alt={isAnime ? "Gun Park, Jay's anime alter-ego" : "Portrait of Jay Factolarin Esmalla"}
                {...{ fetchpriority: isAnime ? "auto" : "high" }}
                loading="eager"
                decoding="async"
                onLoad={() => setPortraitStates((current) => ({ ...current, [portraitMode]: "ready" }))}
                onError={() => setPortraitStates((current) => ({ ...current, [portraitMode]: "missing" }))}
                className={[
                  "absolute inset-0 h-full w-full object-cover object-center",
                  isAnime ? "contrast-[1.06] brightness-[0.96]" : "grayscale contrast-[1.04] brightness-[0.92]",
                  "transition-opacity duration-300",
                  portraitState === "ready" ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />

              {/* Bottom gradient overlay with name + toggle hint */}
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 pb-4 pt-14">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-normal leading-snug text-white/90">
                      {isAnime ? "Gun Park / Lookism" : "Jay Factolarin Esmalla"}
                    </p>
                    <p className="meta-text mt-1 text-white/50">
                      {isAnime ? "Alter ego · CS / AI" : "CS / AI · Tagum City, PH"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-[4px] border border-white/20 bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/70 backdrop-blur-sm">
                    {isAnime ? "← BACK" : "ALTER EGO"}
                  </span>
                </div>
              </div>
            </button>
          </motion.aside>
        </div>

        {/* ── Stats bar ── */}
        <div className="mt-8 grid grid-cols-3 border-t border-graphite">
          {HERO_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-3 py-4 md:px-5 md:py-5 ${index > 0 ? "border-l border-graphite" : ""}`}
            >
              <p className="text-[22px] font-normal tracking-[-0.03em] text-chalk sm:text-[28px]">
                {stat.value}
              </p>
              <p className="meta-text mt-1 text-smoke">{stat.label}</p>
              <p className="meta-text mt-1 hidden text-smoke/50 sm:block">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
