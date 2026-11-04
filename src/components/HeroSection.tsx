import { motion } from "framer-motion";
import { motionTokens, useMotionSettings } from "@/lib/motion";
import Portrait from "./Portrait";
import SignalStrip from "./SignalStrip";

const HERO_LINES = ["Practical apps.", "Clear interfaces."];

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
          <span className="meta-text text-smoke">00 // OVERVIEW</span>
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
        {/* ── Left: Editorial Headline + Bio (No buttons) ── */}
        <div className="editorial-grid-bg relative flex flex-col justify-center p-6 sm:p-8 lg:p-11">
          <motion.p {...entrance(0.03)} className="section-kicker">
            MOBILE + WEB DEVELOPER
          </motion.p>

          <h1 className="mt-5 max-w-[680px] font-display text-balance text-[42px] font-bold leading-[0.95] tracking-[-0.04em] text-chalk [font-variation-settings:'opsz'_96] sm:text-[54px] md:text-[62px] lg:text-[68px]">
            {HERO_LINES.map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                <motion.span
                  className="block text-chalk"
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

        {/* ── Right: Framed Portrait Cell ── */}
        <motion.aside
          {...entrance(0.1)}
          className="flex flex-col justify-center border-t border-graphite bg-obsidian/40 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8"
          aria-label="Profile portrait"
        >
          <div className="my-auto w-full">
            <Portrait />
          </div>
        </motion.aside>
      </div>

      {/* ── Bottom 3-Cell Connected Live Signal Strip ── */}
      <motion.div {...entrance(0.18, 0)}>
        <SignalStrip />
      </motion.div>
    </section>
  );
};

export default HeroSection;
