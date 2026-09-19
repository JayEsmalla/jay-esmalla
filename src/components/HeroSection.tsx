import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { projects } from "@/data/portfolio";

const HERO_STATS = [
  { label: `${projects.length} PROJECTS`, detail: "Selected academic & independent work" },
  { label: "FLUTTER + REACT", detail: "Mobile and web development" },
  { label: "AI / COMPUTER SCIENCE", detail: "UMTC · 4th Year" },
];

type PortraitState = "loading" | "ready" | "missing";
type PortraitMode = "real" | "anime";

const HeroSection = () => {
  const [portraitState, setPortraitState] = useState<PortraitState>("loading");
  const [portraitMode, setPortraitMode] = useState<PortraitMode>("real");
  const [isHovered, setIsHovered] = useState(false);

  const isAnimeActive = portraitMode === "anime" || isHovered;

  return (
    <section id="home" className="border-b border-graphite bg-carbon">
      <div className="page-container pb-0 pt-8 md:pt-10 lg:pt-12">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.62fr)] lg:gap-12 xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 py-4 lg:pt-6"
          >
            <div className="status-badge mb-5 w-fit">
              <span className="status-dot" />
              OPEN TO INTERNSHIPS, ROLES & COLLABORATION
            </div>

            <p className="meta-text mb-5 text-ash">FLUTTER + REACT DEVELOPER · FULL-STACK PRODUCT BUILDER</p>
            <h1 className="display-title max-w-[760px] text-balance">
              Practical apps. Clear interfaces.
            </h1>
            <p className="mt-5 max-w-[650px] text-[16px] leading-[1.65] text-smoke md:text-[17px]">
              I&apos;m Jay, a full-stack developer building mobile and web apps with Flutter, React, and TypeScript.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/projects" className="primary-pill justify-center sm:min-w-[154px]">
                VIEW WORK <ArrowUpRight size={14} />
              </Link>
              <a href="/cv.pdf" download="Esmalla_Jay_CV.pdf" className="ghost-button justify-center sm:min-w-[154px]">
                DOWNLOAD CV <Download size={13} />
              </a>
              <Link to="/contact" className="ghost-button justify-center sm:min-w-[138px]">
                CONTACT <ArrowDownRight size={13} />
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 mx-auto w-full max-w-[340px] lg:ml-auto lg:mr-0"
            aria-label="Profile portrait"
          >
            <div className="relative border-l border-t border-graphite pl-4 pt-4 sm:pl-5 sm:pt-5">
              <div className="absolute -left-[3px] -top-[3px] h-[5px] w-[5px] bg-compass-gold" aria-hidden="true" />
              <div
                className="group relative aspect-[4/5] cursor-pointer select-none overflow-hidden bg-[#0c0c0c]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setPortraitMode((prev) => (prev === "real" ? "anime" : "real"))}
                role="button"
                tabIndex={0}
                aria-label="Toggle anime alter-ego portrait"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPortraitMode((prev) => (prev === "real" ? "anime" : "real"));
                  }
                }}
              >
                {portraitState !== "ready" && (
                  <div className="absolute inset-0 grid place-items-center border border-graphite px-6 text-center">
                    <div>
                      <p className="text-[52px] font-normal tracking-[-0.05em] text-chalk">JE</p>
                      <p className="meta-text mt-3 text-smoke">
                        {portraitState === "missing" ? "PORTRAIT UNAVAILABLE" : "LOADING PORTRAIT"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Real Portrait */}
                <img
                  src="/profile.webp"
                  alt="Portrait of Jay Factolarin Esmalla"
                  onLoad={() => setPortraitState("ready")}
                  onError={() => setPortraitState("missing")}
                  className={`absolute inset-0 h-full w-full object-cover object-center grayscale contrast-[1.04] brightness-[0.92] transition-all duration-700 ease-out ${
                    portraitState === "ready" ? "opacity-100" : "opacity-0"
                  } ${isAnimeActive ? "scale-105 opacity-0 blur-[0.5px]" : "scale-100 opacity-100"}`}
                />

                {/* Gun Park Anime Alter-Ego Portrait */}
                <img
                  src="/gunpark.jpg"
                  alt="Gun Park anime alter-ego"
                  className={`absolute inset-0 h-full w-full object-cover object-top contrast-[1.06] brightness-[0.96] transition-all duration-700 ease-out ${
                    isAnimeActive ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
                  }`}
                />

                {/* Corner Status Pill */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-[4px] border border-graphite/90 bg-carbon/80 px-2.5 py-1 backdrop-blur-md transition-all duration-300">
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      isAnimeActive ? "bg-compass-gold" : "bg-pulse-green"
                    }`}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-chalk">
                    {isAnimeActive ? "ALTER EGO · GUN PARK" : "HOVER / TAP · ALTER EGO"}
                  </span>
                </div>
              </div>

              <div className="grid border-x border-b border-graphite sm:grid-cols-2">
                <div className="px-4 py-3 sm:py-4">
                  <p className="meta-text text-smoke">
                    {isAnimeActive ? "ALTER EGO / LOOKISM" : "JAY FACTOLARIN ESMALLA"}
                  </p>
                  <p className="mt-1 text-[13px] text-chalk transition-all">
                    {isAnimeActive ? "Park Jonggun (Gun Park)" : "Computer Science · AI"}
                  </p>
                </div>
                <div className="border-t border-graphite px-4 py-3 sm:border-l sm:border-t-0 sm:py-4 sm:text-right">
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <span className="meta-text text-smoke">MODE</span>
                    <div className="inline-flex rounded border border-graphite p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPortraitMode("real");
                        }}
                        aria-pressed={portraitMode === "real"}
                        className={`rounded px-2 py-0.5 transition-colors ${
                          portraitMode === "real" ? "bg-chalk font-medium text-obsidian" : "text-smoke hover:text-chalk"
                        }`}
                      >
                        REAL
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPortraitMode("anime");
                        }}
                        aria-pressed={portraitMode === "anime"}
                        className={`rounded px-2 py-0.5 transition-colors ${
                          portraitMode === "anime" ? "bg-chalk font-medium text-obsidian" : "text-smoke hover:text-chalk"
                        }`}
                      >
                        ANIME
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        <div className="mt-8 grid border-y border-graphite md:mt-10 md:grid-cols-3">
          {HERO_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-5 py-5 text-left ${index > 0 ? "border-t border-graphite md:border-l md:border-t-0" : ""}`}
            >
              <p className="text-[14px] font-normal text-chalk">{stat.label}</p>
              <p className="meta-text mt-2 text-smoke">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
