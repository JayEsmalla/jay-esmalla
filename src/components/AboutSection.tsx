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
      {/* ── Connected Section Header Band with Chapter Numeral ── */}
      <SectionHeader number="02" kicker="ABOUT" title="How I approach a build.">
        <p className="text-[16px] leading-[1.65] text-smoke">
          I start with the workflow, choose tools that fit, and connect clear interfaces to reliable backend systems.
        </p>
      </SectionHeader>

      {/* ── Editorial Statement + Education Strip ── */}
      <motion.div {...reveal(1)} className="border-b border-graphite bg-carbon">
        <div className="px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <p className="max-w-[920px] text-balance text-[23px] leading-[1.26] tracking-[-0.03em] text-smoke sm:text-[30px] lg:text-[36px]">
            I start with the workflow:{" "}
            <span className="text-chalk">
              the paper job orders, the missed downpayments, the payroll done by hand
            </span>
            . Then I pick tools that fit and build interfaces{" "}
            <span className="text-chalk">people don&apos;t need training for</span>.
          </p>
        </div>

        <div className="flex items-start gap-4 border-t border-graphite bg-obsidian/30 px-5 py-6 sm:px-8 lg:px-10">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[4px] border border-graphite bg-carbon">
            <GraduationCap size={20} strokeWidth={1.5} className="icon-gold" aria-hidden="true" />
          </span>
          <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
            <div>
              <h3 className="section-kicker">EDUCATION</h3>
              <p className="mt-2 text-[17px] leading-relaxed tracking-[-0.015em] text-chalk">
                4th Year · BS Computer Science
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-smoke">
                University of Mindanao — Tagum College
              </p>
            </div>
            <div className="border-t border-graphite pt-3 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="meta-text text-smoke">SPECIALIZATION</p>
              <p className="mt-1.5 font-mono-retro text-[13px] text-chalk">Artificial Intelligence</p>
            </div>
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
