import { motion } from "framer-motion";
import {
  Box,
  Code2,
  Database,
  Figma,
  Flame,
  GitBranch,
  Github,
  Globe,
  Layers,
  Paintbrush,
  Server,
  Smartphone,
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

const STACK = [
  { label: "Mobile", description: "Cross-platform mobile experiences and application flows.", items: ["Flutter", "Dart"] },
  {
    label: "Frontend",
    description: "Responsive interfaces with modern component-driven web tooling.",
    items: ["React", "Vue.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS", "JavaScript", "Next.js"],
  },
  {
    label: "Backend & Data",
    description: "Application services, databases, authentication, and connected data.",
    items: ["Node.js", "Python", "PHP", "MySQL", "Firebase", "Supabase"],
  },
  { label: "Tools", description: "Design, version control, collaboration, and delivery tooling.", items: ["Git", "GitHub", "Figma", "Docker"] },
];

const AboutSection = () => (
  <section id="about" className="section-shell scroll-mt-[72px]">
    <div className="page-container">
      <div className="section-heading-grid">
        <div>
          <p className="section-kicker">01 / ABOUT</p>
          <h2 className="section-title">A developer focused on useful systems, not visual noise.</h2>
        </div>
        <div className="space-y-5 text-[16px] leading-[1.6] text-smoke">
          <p>
            I'm a third-year Computer Science student majoring in Artificial Intelligence at the University of Mindanao
            Tagum College. I specialize in Flutter mobile apps and modern web solutions built with React & TypeScript.
          </p>
          <p>
            I focus on clean architecture, pixel-perfect design, and shipping products that solve real problems. Beyond
            coding I explore AI/ML, open-source, and retro gaming culture.
          </p>
          <div className="grid grid-cols-2 border border-graphite">
            <div className="p-5">
              <p className="text-[34px] font-normal tracking-[-0.02em] text-chalk">3+</p>
              <p className="meta-text mt-2 text-smoke">PROJECTS SHIPPED</p>
            </div>
            <div className="border-l border-graphite p-5">
              <p className="text-[34px] font-normal tracking-[-0.02em] text-chalk">AI</p>
              <p className="meta-text mt-2 text-smoke">CS MAJOR FOCUS</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-graphite md:mt-14">
        <div className="grid md:grid-cols-2">
          {STACK.map((group, index) => {
            const LeadIcon = ICON_MAP[group.items[0].toLowerCase()] ?? Code2;
            return (
              <motion.article
                key={group.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className={`p-8 md:p-10 ${index % 2 === 1 ? "md:border-l md:border-graphite" : ""} ${
                  index >= 2 ? "border-t border-graphite" : index === 1 ? "border-t border-graphite md:border-t-0" : ""
                }`}
              >
                <LeadIcon size={28} strokeWidth={1.5} className="icon-gold" />
                <h3 className="mt-7 text-[14px] font-normal uppercase tracking-[0.04em] text-chalk">{group.label}</h3>
                <p className="mt-3 max-w-md text-[14px] leading-[1.6] text-smoke">{group.description}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {group.items.map((name) => {
                    const Icon = ICON_MAP[name.toLowerCase()] ?? Code2;
                    return (
                      <span key={name} className="tech-tag">
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
  </section>
);

export default AboutSection;
