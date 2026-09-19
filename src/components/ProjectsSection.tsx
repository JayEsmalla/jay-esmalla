import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ExternalLink,
  Github,
  MessageCircle,
  Route,
  ShoppingBag,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { projects, type Project } from "@/data/portfolio";

type Filter = "all" | "flutter" | "web";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "ALL WORK" },
  { key: "flutter", label: "MOBILE" },
  { key: "web", label: "WEB" },
];

const FLOW_ICONS = {
  "mobile-flow": [ShoppingBag, Upload, MessageCircle],
  "simulation-flow": [Users, Route, BarChart3],
} as const;

const ProjectPreview = ({ project }: { project: Project }) => {
  if (project.preview === "screen" && project.imageFit === "contain") {
    return (
      <figure className="flex h-[190px] min-w-0 shrink-0 flex-col bg-[#0b0b0b]">
        <div className="flex min-h-0 flex-1 items-center bg-[#f5f3f5]" style={{ backgroundColor: project.imageBackground }}>
          <img
            src={project.image}
            alt={project.imageAlt ?? project.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
        <figcaption className="meta-text border-t border-graphite px-4 py-2 text-smoke">
          {project.previewLabel}
        </figcaption>
      </figure>
    );
  }
  if (project.preview === "screen") {
    return (
      <div className="relative h-[190px] shrink-0 overflow-hidden bg-[#0b0b0b]">
        <img
          src={project.image}
          alt={project.imageAlt ?? `${project.title} authentication and order-entry screen`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.18] transition duration-700 group-hover:scale-[1.015] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 px-5 py-4 backdrop-blur-sm">
          <p className="meta-text text-white/75">{project.previewLabel}</p>
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const icons = FLOW_ICONS[project.preview];

  return (
    <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden bg-[#0b0b0b] p-5 sm:p-6 md:min-h-[320px]">
      <div className="project-grid pointer-events-none absolute inset-0 opacity-45" aria-hidden="true" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <p className="meta-text text-smoke">{project.previewLabel}</p>
        <p className="meta-text text-ash">{project.category === "flutter" ? "MOBILE" : "WEB"}</p>
      </div>

      <div className="relative my-7 flex items-center justify-between gap-2">
        {project.proofPoints.map((point, index) => {
          const Icon = icons[index];
          return (
            <div key={point} className="contents">
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-iron bg-carbon text-chalk sm:h-12 sm:w-12">
                  <Icon size={19} strokeWidth={1.4} />
                </span>
                <span className="meta-text mt-4 max-w-[110px] leading-[1.45] text-smoke">{point}</span>
              </div>
              {index < project.proofPoints.length - 1 && <ArrowRight size={15} strokeWidth={1.3} className="shrink-0 text-compass-gold" aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      <div className="relative flex items-end justify-between gap-5 border-t border-graphite pt-5">
        <p className="max-w-[250px] text-[13px] leading-[1.55] text-smoke">System map based on the implemented repository.</p>
        <span className="text-[40px] font-normal leading-none tracking-[-0.06em] text-[#242424]">{project.title.slice(0, 2).toUpperCase()}</span>
      </div>
    </div>
  );
};

const ProjectsSection = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const filtered = filter === "all" ? projects : projects.filter((project) => project.category === filter);

  return (
    <section id="projects" className="section-shell scroll-mt-[72px]">
      <div className="page-container">
        <div className="section-heading-grid">
          <div>
            <p className="section-kicker">01 / SELECTED WORK</p>
            <h2 className="section-title">Practical products built around real workflows.</h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="max-w-md text-[16px] leading-[1.6] text-smoke">
              {projects.length} selected mobile and web builds spanning commerce, hospital staff management, and safety simulation.
            </p>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter projects">
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  aria-pressed={filter === item.key}
                  className={`rounded-[4px] border px-3 py-2 text-[11px] font-normal tracking-[0.03em] transition-colors ${
                    filter === item.key
                      ? "border-chalk bg-chalk text-obsidian"
                      : "border-graphite text-smoke hover:border-iron hover:text-chalk"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div layout className="mt-7 grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => {
              const projectNumber = String(projects.findIndex((item) => item.id === project.id) + 1).padStart(2, "0");
              return (
                <motion.article
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-graphite bg-carbon"
                >
                  <ProjectPreview project={project} />

                  <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <p className="meta-text text-smoke">{projectNumber}</p>
                        <span className="h-px w-8 bg-graphite" aria-hidden="true" />
                        <p className="meta-text text-smoke">{project.category}</p>
                      </div>
                      <span className="status-badge">
                        <span className={`h-1.5 w-1.5 rounded-full ${project.githubUrl ? "bg-pulse-green" : "bg-compass-gold"}`} />
                        {project.githubUrl ? "PUBLIC REPOSITORY" : "PRIVATE BUILD"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[22px] font-normal leading-tight tracking-[-0.035em] text-chalk">{project.title}</h3>
                    <p className="mt-2 text-[14px] leading-[1.6] text-smoke">{project.description}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => <span key={tech} className="tech-tag">{tech}</span>)}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      <button type="button" onClick={() => setSelectedProject(project)} className="primary-pill">
                        CASE STUDY <ArrowUpRight size={13} />
                      </button>
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="ghost-button" aria-label={`${project.title} live project`}>
                          LIVE <ExternalLink size={13} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="ghost-button" aria-label={`${project.title} public source code`}>
                          SOURCE <Github size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <Dialog open={Boolean(selectedProject)} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent className="max-h-[90vh] overflow-hidden border-graphite bg-carbon p-0 text-chalk shadow-none sm:max-w-2xl">
            {selectedProject && (
              <ScrollArea className="max-h-[90vh]">
                <div className="p-6 pr-8 sm:p-8 sm:pr-10">
                  <DialogHeader className="text-left">
                    <p className="section-kicker">PROJECT CASE STUDY</p>
                    <DialogTitle className="mt-2 text-[34px] font-normal tracking-[-0.02em] text-chalk">{selectedProject.title}</DialogTitle>
                    <DialogDescription className="text-[14px] leading-[1.5] text-smoke">{selectedProject.description}</DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 divide-y divide-graphite border-y border-graphite">
                    <div className="grid gap-3 py-5 sm:grid-cols-[140px_1fr]">
                      <p className="meta-text text-smoke">ROLE</p>
                      <p className="text-[14px] leading-[1.6] text-chalk">{selectedProject.role}</p>
                    </div>
                    <div className="grid gap-3 py-5 sm:grid-cols-[140px_1fr]">
                      <p className="meta-text text-smoke">PROBLEM</p>
                      <p className="text-[14px] leading-[1.6] text-smoke">{selectedProject.problemSolved}</p>
                    </div>
                    <div className="grid gap-3 py-5 sm:grid-cols-[140px_1fr]">
                      <p className="meta-text text-smoke">OUTCOME</p>
                      <p className="text-[14px] leading-[1.6] text-smoke">{selectedProject.outcome}</p>
                    </div>
                    <div className="grid gap-3 py-5 sm:grid-cols-[140px_1fr]">
                      <p className="meta-text text-smoke">IMPLEMENTED</p>
                      <div className="space-y-2">
                        {selectedProject.proofPoints.map((point) => (
                          <p key={point} className="flex items-center gap-2 text-[14px] text-chalk">
                            <span className="h-1 w-1 rounded-full bg-compass-gold" aria-hidden="true" /> {point}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 py-5 sm:grid-cols-[140px_1fr]">
                      <p className="meta-text text-smoke">STACK</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech) => <span key={tech} className="tech-tag">{tech}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {selectedProject.liveUrl && (
                      <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="primary-pill">
                        OPEN PROJECT <ExternalLink size={13} />
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="ghost-button">
                        PUBLIC SOURCE <Github size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ProjectsSection;
