import { motion } from "framer-motion";
import { projects } from "@/data/portfolio";
import { motionTokens, useMotionSettings } from "@/lib/motion";
import VisitorCounter from "./VisitorCounter";
import Portrait from "./Portrait";

const HERO_STATS = [
  { value: String(projects.length), label: "PROJECTS", detail: "Selected academic & independent work" },
  { value: "3+", label: "FRAMEWORKS", detail: "Flutter · React · React Native" },
  { value: "4th", label: "CS / AI", detail: "UMTC · Tagum College" },
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

            <motion.div {...entrance(0.18, 0)}><VisitorCounter /></motion.div>
          </div>

          {/* ── Right: portrait ── */}
          <motion.aside
            {...entrance(0.1)}
            className="order-2 w-full lg:ml-auto"
            aria-label="Profile portrait"
          >
            <Portrait />
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
