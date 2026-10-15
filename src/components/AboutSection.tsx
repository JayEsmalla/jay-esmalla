import { motion } from "framer-motion";
import {
  Box,
  BrainCircuit,
  Braces,
  Code2,
  Database,
  Figma,
  Flame,
  GitBranch,
  Github,
  Globe,
  GraduationCap,
  Layers,
  Paintbrush,
  Server,
  Smartphone,
  Sparkles,
  Terminal,
  Wind,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  flutter: Smartphone,
  dart: Terminal,
  "react native": Smartphone,
  expo: Smartphone,
  react: Layers,
  "vue.js": Layers,
  typescript: Code2,
  "tailwind css": Wind,
  html5: Code2,
  css: Paintbrush,
  javascript: Code2,
  "next.js": Globe,
  "node.js": Server,
  python: Code2,
  php: Code2,
  mysql: Database,
  postgresql: Database,
  firebase: Flame,
  supabase: Database,
  git: GitBranch,
  github: Github,
  figma: Figma,
  docker: Box,
};

const FOCUS_AREAS = [
  {
    index: "01",
    icon: Braces,
    title: "Product Engineering",
    description:
      "Turning requirements into mobile and web apps, from the interface to the systems and data behind it.",
  },
  {
    index: "02",
    icon: BrainCircuit,
    title: "AI & Intelligent Systems",
    description:
      "Studying AI, with an interest in machine learning and automation that improve real workflows.",
  },
  {
    index: "03",
    icon: Sparkles,
    title: "Systems with Clear UX",
    description:
      "Clear flows, readable interfaces, and maintainable code that make complex systems easier to use.",
  },
];

const STACK = [
  {
    label: "Mobile",
    items: ["Flutter", "Dart", "React Native", "Expo"],
  },
  {
    label: "Frontend",
    items: ["React", "Vue.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS", "JavaScript", "Next.js"],
  },
  {
    label: "Backend & Data",
    items: ["Node.js", "Python", "PHP", "MySQL", "PostgreSQL", "Firebase", "Supabase"],
  },
  {
    label: "Tools",
    items: ["Git", "GitHub", "Figma", "Docker"],
  },
];

const AboutSection = () => (
  <section id="about" className="section-shell scroll-mt-[72px] overflow-hidden">
    <div className="page-container">
      <div className="section-heading-grid">
        <div>
          <p className="section-kicker">02 / ABOUT</p>
          <h2 className="section-title text-balance">How I approach a build.</h2>
        </div>
        <p className="self-end text-[16px] leading-[1.65] text-smoke">
          I start with the workflow, choose tools that fit, and connect clear interfaces to reliable backend systems.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-8 overflow-hidden rounded-[8px] border border-graphite bg-carbon md:mt-10"
      >
        <div className="flex items-start gap-4 border-b border-graphite p-5 sm:p-7">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-pulse-green/30 bg-pulse-green/5">
            <GraduationCap size={20} strokeWidth={1.5} className="text-pulse-green" aria-hidden="true" />
          </span>
          <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
            <div>
              <h3 className="section-kicker">EDUCATION</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-chalk">4th Year · BS Computer Science</p>
              <p className="mt-1 text-[14px] leading-relaxed text-smoke">University of Mindanao — Tagum College</p>
            </div>
            <div>
              <p className="meta-text text-smoke">SPECIALIZATION</p>
              <p className="mt-2 text-[14px] text-chalk">Artificial Intelligence</p>
            </div>
          </div>
        </div>

        <h3 className="sr-only">Focus areas</h3>
        <div className="grid md:grid-cols-3">
          {FOCUS_AREAS.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.article
                key={area.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className={`relative overflow-hidden p-5 sm:p-7 ${index > 0 ? "border-t border-graphite md:border-l md:border-t-0" : ""}`}
              >
                <span
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none text-[72px] font-normal leading-none tracking-[-0.06em] text-graphite"
                  aria-hidden="true"
                >
                  {area.index}
                </span>
                <div className="relative flex items-center">
                  <Icon size={21} strokeWidth={1.5} className="icon-gold" aria-hidden="true" />
                </div>
                <h4 className="relative mt-4 text-[18px] font-normal tracking-[-0.01em] text-chalk">{area.title}</h4>
                <p className="relative mt-3 text-[14px] leading-[1.65] text-smoke">{area.description}</p>
              </motion.article>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-8 md:mt-10">
        <div className="grid gap-6 border-y border-graphite py-6 lg:grid-cols-[0.6fr_1.4fr] lg:gap-10 lg:py-8">
          <div>
            <p className="section-kicker">BUILD TOOLKIT</p>
            <h3 className="mt-3 text-[26px] font-normal leading-[1.12] tracking-[-0.02em] text-chalk">
              Tools I work with.
            </h3>
            <p className="mt-4 max-w-md text-[14px] leading-[1.65] text-smoke">
              Technologies from my mobile and web work, grouped by purpose.
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            {STACK.map((group, index) => {
              const LeadIcon = ICON_MAP[group.items[0].toLowerCase()] ?? Code2;
              return (
                <article
                  key={group.label}
                  className={`py-5 sm:px-5 ${index % 2 === 1 ? "sm:border-l sm:border-graphite" : ""} ${
                    index >= 2 ? "border-t border-graphite" : index === 1 ? "border-t border-graphite sm:border-t-0" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LeadIcon size={18} strokeWidth={1.5} className="icon-gold" aria-hidden="true" />
                    <h4 className="text-[14px] font-normal text-chalk">{group.label}</h4>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((name) => {
                      const Icon = ICON_MAP[name.toLowerCase()] ?? Code2;
                      return (
                        <span key={name} className="tech-tag">
                          <Icon size={12} strokeWidth={1.5} aria-hidden="true" /> {name}
                        </span>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
