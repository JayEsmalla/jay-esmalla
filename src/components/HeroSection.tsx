import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const HERO_STATS = [
  { label: "3+ PROJECTS", detail: "Selected academic & independent work" },
  { label: "FLUTTER + REACT", detail: "Mobile and web development" },
  { label: "AI / COMPUTER SCIENCE", detail: "UMTC · 3rd year" },
];

type PortraitState = "loading" | "ready" | "missing";

const HeroSection = () => {
  const [portraitState, setPortraitState] = useState<PortraitState>("loading");

  return (
    <section id="home" className="border-b border-graphite bg-carbon">
      <div className="page-container pb-0 pt-10 md:pt-14 lg:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.68fr)] lg:gap-16 xl:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 py-4 lg:pt-6"
          >
            <div className="status-badge mb-7 w-fit">
              <span className="status-dot" />
              OPEN TO PROJECTS & COLLABORATION
            </div>

            <p className="meta-text mb-5 text-ash">FULL-STACK DEVELOPER · FLUTTER · REACT · TYPESCRIPT</p>
            <h1 className="display-title max-w-[760px] text-balance">
              I build practical digital products with clear interfaces and dependable systems.
            </h1>
            <p className="mt-7 max-w-[650px] text-[17px] leading-[1.65] text-smoke md:text-[19px]">
              I&apos;m Jay Esmalla, a third-year Computer Science student majoring in Artificial Intelligence at the University of Mindanao Tagum College, focused on Flutter mobile apps and modern React & TypeScript web solutions.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            className="order-2 mx-auto w-full max-w-[500px] lg:mx-0 lg:max-w-none"
            aria-label="Profile portrait"
          >
            <div className="relative border-l border-t border-graphite pl-4 pt-4 sm:pl-5 sm:pt-5">
              <div className="absolute -left-[3px] -top-[3px] h-[5px] w-[5px] bg-compass-gold" aria-hidden="true" />
              <div className="relative aspect-[4/5] overflow-hidden bg-[#0c0c0c]">
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
                <img
                  src="/profile.webp"
                  alt="Portrait of Jay Esmalla"
                  onLoad={() => setPortraitState("ready")}
                  onError={() => setPortraitState("missing")}
                  className={`absolute inset-0 h-full w-full object-cover object-center grayscale contrast-[1.04] brightness-[0.92] transition-[opacity,filter] duration-500 hover:grayscale-0 hover:brightness-100 ${
                    portraitState === "ready" ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

              <div className="grid border-x border-b border-graphite sm:grid-cols-2">
                <div className="px-4 py-4">
                  <p className="meta-text text-smoke">JAY ESMALLA</p>
                  <p className="mt-1 text-[13px] text-chalk">Computer Science · AI</p>
                </div>
                <div className="border-t border-graphite px-4 py-4 sm:border-l sm:border-t-0 sm:text-right">
                  <p className="meta-text text-smoke">BASED IN</p>
                  <p className="mt-1 text-[13px] text-chalk">Tagum City, Philippines</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        <div className="mt-10 grid border-y border-graphite md:mt-12 md:grid-cols-3">
          {HERO_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-6 py-7 text-left ${index > 0 ? "border-t border-graphite md:border-l md:border-t-0" : ""}`}
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
