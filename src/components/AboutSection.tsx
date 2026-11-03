import SectionHeader from "@/components/SectionHeader";
import { useReveal } from "@/lib/motion";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

const STACK = [
  {
    index: "01",
    label: "Mobile",
    items: ["Flutter", "Dart", "React Native", "Expo"],
  },
  {
    index: "02",
    label: "Frontend",
    items: ["React", "Vue.js", "TypeScript", "Tailwind CSS", "Next.js", "HTML5", "CSS"],
  },
  {
    index: "03",
    label: "Backend & Data",
    items: ["Node.js", "Python", "PHP", "MySQL", "PostgreSQL", "Firebase", "Supabase"],
  },
  {
    index: "04",
    label: "Tools",
    items: ["Git", "GitHub", "Figma", "Docker"],
  },
];

const AboutSection = () => {
  const reveal = useReveal();
  return (
    <section id="about" className="section-shell scroll-mt-6 overflow-hidden">
      {/* ── Connected Section Header Band ── */}
      <SectionHeader number="02" kicker="ABOUT" title="How I approach a build.">
        <p className="text-[15px] leading-[1.65] text-smoke">
          Full-stack and mobile developer based in Tagum City, building operations software, POS systems, and learning tools.
        </p>
      </SectionHeader>

      {/* ── Editorial Statement + Education Split Grid ── */}
      <motion.div
        {...reveal(1)}
        className="grid border-b border-graphite bg-carbon lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]"
      >
        <div className="flex items-center px-5 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-12">
          <p className="max-w-[740px] text-balance text-[22px] leading-[1.32] tracking-[-0.028em] text-smoke sm:text-[26px] lg:text-[30px]">
            I start with the workflow:{" "}
            <span className="text-chalk">
              the paper job orders, the missed downpayments, the payroll done by hand
            </span>
            . Then I pick tools that fit and build interfaces{" "}
            <span className="text-chalk">people don&apos;t need training for</span>.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-6 border-t border-graphite bg-obsidian/30 px-5 py-7 sm:px-8 lg:border-l lg:border-t-0 lg:px-9 lg:py-10">
          <div className="flex items-start gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[4px] border border-graphite bg-carbon">
              <GraduationCap size={19} strokeWidth={1.5} className="icon-gold" aria-hidden="true" />
            </span>
            <div>
              <h3 className="section-kicker">EDUCATION</h3>
              <p className="mt-2 text-[17px] leading-snug tracking-[-0.015em] text-chalk">
                4th Year · BS Computer Science
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-smoke">
                University of Mindanao — Tagum College
              </p>
            </div>
          </div>

          <div className="border-t border-graphite pt-4">
            <p className="meta-text text-smoke">SPECIALIZATION</p>
            <p className="mt-1.5 font-mono-retro text-[13px] text-chalk">
              Artificial Intelligence
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── 4-Column Compact Build Toolkit Strip ── */}
      <div className="grid bg-carbon sm:grid-cols-2 lg:grid-cols-4">
        {STACK.map((group, index) => (
          <article
            key={group.label}
            className={`p-5 sm:p-6 lg:p-7 ${index % 2 === 1 ? "sm:border-l sm:border-graphite" : ""} ${
              index >= 2 ? "border-t border-graphite lg:border-l lg:border-t-0" : index === 1 ? "border-t border-graphite sm:border-t-0" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-mono-retro text-[12px] uppercase tracking-[0.04em] text-chalk">
                {group.label}
              </h3>
              <span className="font-mono-retro text-[10px] tabular-nums text-smoke/50" aria-hidden="true">
                {group.index}
              </span>
            </div>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {group.items.map((name) => (
                <span key={name} className="tech-tag">
                  {name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AboutSection;
