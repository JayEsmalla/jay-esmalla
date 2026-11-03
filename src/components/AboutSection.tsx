import Reveal from "@/components/Reveal";
import { useReveal } from "@/lib/motion";
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
    index: "01",
    label: "Mobile",
    items: ["Flutter", "Dart", "React Native", "Expo"],
  },
  {
    index: "02",
    label: "Frontend",
    items: ["React", "Vue.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS", "JavaScript", "Next.js"],
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
      <div className="section-header-band">
        <Reveal className="section-heading-grid">
          <div>
            <p className="section-kicker">02 / ABOUT</p>
            <h2 className="section-title text-balance">How I approach a build.</h2>
          </div>
          <p className="self-end text-[16px] leading-[1.65] text-smoke">
            I start with the workflow, choose tools that fit, and connect clear interfaces to reliable backend systems.
          </p>
        </Reveal>
      </div>

      {/* ── Connected Education & Focus Matrix ── */}
      <motion.div {...reveal(1)} className="border-b border-graphite bg-carbon">
        <div className="flex items-start gap-4 border-b border-graphite px-5 py-6 sm:px-8 lg:px-10">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[4px] border border-pulse-green/30 bg-pulse-green/5">
            <GraduationCap size={20} strokeWidth={1.5} className="text-pulse-green" aria-hidden="true" />
          </span>
          <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
            <div>
              <h3 className="section-kicker">EDUCATION</h3>
              <p className="mt-2 text-[17px] leading-relaxed tracking-[-0.015em] text-chalk">4th Year · BS Computer Science</p>
              <p className="mt-1 text-[14px] leading-relaxed text-smoke">University of Mindanao — Tagum College</p>
            </div>
            <div className="border-t border-graphite pt-3 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="meta-text text-smoke">SPECIALIZATION</p>
              <p className="mt-1.5 font-mono-retro text-[13px] text-pulse-green">Artificial Intelligence</p>
            </div>
          </div>
        </div>

        <h3 className="sr-only">Focus areas</h3>
        <div className="grid md:grid-cols-3">
          {FOCUS_AREAS.map((area, index) => {
            const Icon = area.icon;
            return (
              <article
                key={area.title}
                className={`relative overflow-hidden p-5 sm:p-8 ${index > 0 ? "border-t border-graphite md:border-l md:border-t-0" : ""}`}
              >
                <div className="flex items-center justify-between border-b border-graphite pb-3">
                  <Icon size={19} strokeWidth={1.5} className="icon-gold" aria-hidden="true" />
                  <span className="font-mono-retro text-[11px] text-pulse-green" aria-hidden="true">
                    {area.index}
                  </span>
                </div>
                <h4 className="mt-4 text-[18px] font-normal tracking-[-0.02em] text-chalk">{area.title}</h4>
                <p className="mt-2.5 text-[14px] leading-[1.65] text-smoke">{area.description}</p>
              </article>
            );
          })}
        </div>
      </motion.div>

      {/* ── Connected Build Toolkit Grid ── */}
      <div className="grid bg-carbon lg:grid-cols-[0.55fr_1.45fr]">
        <div className="flex flex-col justify-between border-b border-graphite p-5 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div>
            <p className="section-kicker">BUILD TOOLKIT</p>
            <h3 className="mt-3 text-[26px] font-normal leading-[1.1] tracking-[-0.03em] text-chalk">
              Tools I work with.
            </h3>
            <p className="mt-3 max-w-md text-[14px] leading-[1.65] text-smoke">
              Technologies from my mobile and web work, grouped by purpose.
            </p>
          </div>
          <p className="meta-text mt-6 hidden text-smoke/50 lg:block">SPECIFICATION // STACK MATRIX</p>
        </div>

        <div className="grid sm:grid-cols-2">
          {STACK.map((group, index) => {
            const LeadIcon = ICON_MAP[group.items[0].toLowerCase()] ?? Code2;
            return (
              <article
                key={group.label}
                className={`p-5 sm:p-6 lg:p-7 ${index % 2 === 1 ? "sm:border-l sm:border-graphite" : ""} ${
                  index >= 2 ? "border-t border-graphite" : index === 1 ? "border-t border-graphite sm:border-t-0" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <LeadIcon size={16} strokeWidth={1.5} className="icon-gold" aria-hidden="true" />
                    <h4 className="font-mono-retro text-[12px] uppercase tracking-[0.04em] text-chalk">{group.label}</h4>
                  </div>
                  <span className="font-mono-retro text-[10px] text-smoke/40" aria-hidden="true">{group.index}</span>
                </div>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {group.items.map((name) => {
                    const Icon = ICON_MAP[name.toLowerCase()] ?? Code2;
                    return (
                      <span key={name} className="tech-tag">
                        <Icon size={12} strokeWidth={1.5} aria-hidden="true" />
                        <span>{name}</span>
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
