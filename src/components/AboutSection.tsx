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
  MapPin,
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
  firebase: Flame,
  supabase: Database,
  git: GitBranch,
  github: Github,
  figma: Figma,
  docker: Box,
};

const PROFILE_FACTS = [
  { label: "NAME", value: "Jay Factolarin Esmalla" },
  { label: "PROGRAM", value: "BS Computer Science" },
  { label: "SPECIALIZATION", value: "Artificial Intelligence" },
  { label: "YEAR LEVEL", value: "4th Year" },
  { label: "SCHOOL", value: "University of Mindanao — Tagum College" },
  { label: "BASE", value: "Tagum City, Philippines" },
];

const FOCUS_AREAS = [
  {
    index: "01",
    icon: Braces,
    title: "Product Engineering",
    description:
      "I turn requirements into working mobile and web experiences, connecting interface decisions with the systems and data behind them.",
  },
  {
    index: "02",
    icon: BrainCircuit,
    title: "AI & Intelligent Systems",
    description:
      "My Computer Science major is focused on AI, with an interest in applying machine learning and automation where they improve real workflows.",
  },
  {
    index: "03",
    icon: Sparkles,
    title: "Systems with Clear UX",
    description:
      "I care about structure: clean architecture, readable interaction patterns, and interfaces that make complex systems easier to understand.",
  },
];

const STACK = [
  {
    label: "Mobile",
    description: "Cross-platform application flows and mobile-first product experiences.",
    items: ["Flutter", "Dart"],
  },
  {
    label: "Frontend",
    description: "Responsive, component-driven interfaces for modern web applications.",
    items: ["React", "Vue.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS", "JavaScript", "Next.js"],
  },
  {
    label: "Backend & Data",
    description: "Application services, databases, authentication, and connected data workflows.",
    items: ["Node.js", "Python", "PHP", "MySQL", "Firebase", "Supabase"],
  },
  {
    label: "Tools",
    description: "Version control, interface design, collaboration, and delivery tooling.",
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
          I start with the workflow, choose tools that fit, and connect the interface to reliable backend systems. My focus is software that is easy to use and maintain.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 grid overflow-hidden rounded-[8px] border border-graphite bg-carbon md:mt-14 lg:grid-cols-[0.72fr_1.28fr]"
      >
        <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden border-b border-graphite p-7 sm:p-9 lg:border-b-0 lg:border-r lg:p-10">
          <div className="pointer-events-none absolute -right-5 -top-16 select-none text-[190px] font-normal leading-none tracking-[-0.08em] text-[#141414] sm:text-[230px]" aria-hidden="true">
            04
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-graphite">
                <GraduationCap size={18} strokeWidth={1.5} className="icon-gold" />
              </span>
              <div>
                <p className="meta-text text-smoke">CURRENT CHAPTER</p>
                <p className="mt-1 text-[14px] text-chalk">4th Year · BS Computer Science</p>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-[72px] font-normal leading-none tracking-[-0.06em] text-chalk md:text-[92px]">AI</p>
              <p className="meta-text mt-4 max-w-[240px] leading-[1.6] text-smoke">MAJOR FOCUS / ARTIFICIAL INTELLIGENCE</p>
            </div>
          </div>

          <div className="relative z-10 mt-12 flex items-center gap-2 border-t border-graphite pt-5">
            <MapPin size={14} strokeWidth={1.5} className="icon-gold" />
            <p className="meta-text text-smoke">TAGUM CITY · PHILIPPINES</p>
          </div>
        </div>

        <div className="p-7 sm:p-9 lg:p-10">
          <div className="flex items-center justify-between gap-4 border-b border-graphite pb-5">
            <p className="section-kicker">PROFILE / IDENTITY</p>
            <span className="status-badge shrink-0"><span className="status-dot" /> ACTIVE</span>
          </div>

          <div className="mt-2 divide-y divide-graphite">
            {PROFILE_FACTS.map((fact, index) => (
              <motion.div
                key={fact.label}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="grid gap-2 py-4 sm:grid-cols-[150px_1fr] sm:items-center"
              >
                <p className="meta-text text-smoke">{fact.label}</p>
                <p className="text-[14px] leading-[1.45] text-chalk sm:text-[15px]">{fact.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="mt-16 md:mt-20">
        <div className="flex flex-col gap-5 border-b border-graphite pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">WHAT I BRING TO THE BUILD</p>
            <h3 className="mt-4 max-w-2xl text-[28px] font-normal leading-[1.12] tracking-[-0.02em] text-chalk md:text-[34px]">
              Three areas that shape how I approach software.
            </h3>
          </div>
          <p className="meta-text text-smoke">ENGINEERING / AI / EXPERIENCE</p>
        </div>

        <div className="grid md:grid-cols-3">
          {FOCUS_AREAS.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.article
                key={area.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className={`group border-b border-graphite p-7 md:min-h-[310px] md:p-8 ${index > 0 ? "md:border-l" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-graphite transition-colors group-hover:border-iron">
                    <Icon size={19} strokeWidth={1.5} className="icon-gold" />
                  </span>
                  <span className="meta-text text-smoke">{area.index}</span>
                </div>
                <h4 className="mt-10 text-[20px] font-normal tracking-[-0.01em] text-chalk">{area.title}</h4>
                <p className="mt-4 text-[14px] leading-[1.65] text-smoke">{area.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <div className="grid gap-8 border-y border-graphite py-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14 lg:py-10">
          <div>
            <p className="section-kicker">BUILD TOOLKIT</p>
            <h3 className="mt-4 max-w-md text-[28px] font-normal leading-[1.12] tracking-[-0.02em] text-chalk md:text-[34px]">
              Tools grouped by what they help me deliver.
            </h3>
            <p className="mt-5 max-w-md text-[14px] leading-[1.65] text-smoke">
              The stack changes with the problem. These are the technologies I currently use across mobile, frontend, backend, data, and delivery work.
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            {STACK.map((group, index) => {
              const LeadIcon = ICON_MAP[group.items[0].toLowerCase()] ?? Code2;
              return (
                <motion.article
                  key={group.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className={`p-6 sm:p-7 ${index % 2 === 1 ? "sm:border-l sm:border-graphite" : ""} ${
                    index >= 2 ? "border-t border-graphite" : index === 1 ? "border-t border-graphite sm:border-t-0" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <LeadIcon size={22} strokeWidth={1.5} className="icon-gold" />
                    <span className="meta-text text-smoke">0{index + 1}</span>
                  </div>
                  <h4 className="mt-6 text-[14px] font-normal uppercase tracking-[0.04em] text-chalk">{group.label}</h4>
                  <p className="mt-3 text-[13px] leading-[1.6] text-smoke">{group.description}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {group.items.map((name) => {
                      const Icon = ICON_MAP[name.toLowerCase()] ?? Code2;
                      return (
                        <span key={name} className="tech-tag transition-colors hover:border-iron hover:text-chalk">
                          <Icon size={12} strokeWidth={1.5} /> {name}
                        </span>
                      );
                    })}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
