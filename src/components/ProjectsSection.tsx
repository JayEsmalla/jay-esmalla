import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Github, LayoutGrid, Smartphone } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { projects, type Project } from "@/data/portfolio";

type Filter = "all" | "flutter" | "web";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "ALL WORK" },
  { key: "flutter", label: "MOBILE" },
  { key: "web", label: "WEB" },
];

const ProjectsSection = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const filtered = filter === "all" ? projects : projects.filter((project) => project.category === filter);

  return (
    <section id="projects" className="section-shell scroll-mt-[72px]">
      <div className="page-container">
        <div className="section-heading-grid">
          <div>
            <p className="section-kicker">02 / SELECTED WORK</p>
            <h2 className="section-title">Projects shaped around a clear problem, a practical build, and a usable result.</h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="max-w-md text-[16px] leading-[1.6] text-smoke">
              Mobile and web work spanning marketplaces, ordering systems, and interactive product experiences.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
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

        <motion.div layout className="mt-12 border-t border-graphite md:mt-14">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => {
              const ProjectIcon = project.category === "flutter" ? Smartphone : LayoutGrid;
              return (
                <motion.article
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-7 border-b border-graphite py-8 md:grid-cols-[80px_minmax(0,1fr)_minmax(240px,0.55fr)] md:gap-10 md:py-10"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-graphite">
                    <ProjectIcon size={20} strokeWidth={1.5} className="icon-gold" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="meta-text text-smoke">0{index + 1}</p>
                      <p className="meta-text text-smoke">{project.category}</p>
                    </div>
                    <h3 className="mt-3 text-[28px] font-normal tracking-[-0.02em] text-chalk md:text-[34px]">{project.title}</h3>
                    <p className="mt-4 max-w-2xl text-[15px] leading-[1.65] text-smoke">{project.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-7 border-t border-graphite pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                    <div>
                      <p className="meta-text text-smoke">ROLE</p>
                      <p className="mt-2 text-[14px] leading-[1.5] text-chalk">{project.role}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setSelectedProject(project)} className="ghost-button">
                        DETAILS <ArrowUpRight size={13} />
                      </button>
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="ghost-button" aria-label={`${project.title} source code`}>
                          <Github size={13} />
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
          <DialogContent className="max-h-[90vh] overflow-y-auto border-graphite bg-carbon text-chalk shadow-none sm:max-w-2xl">
            {selectedProject && (
              <>
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
                    <p className="meta-text text-smoke">STACK</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech) => <span key={tech} className="tech-tag">{tech}</span>)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {selectedProject.liveUrl && selectedProject.liveUrl !== selectedProject.githubUrl && (
                    <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="primary-pill">
                      OPEN PROJECT <ExternalLink size={13} />
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="ghost-button">
                      SOURCE <Github size={13} />
                    </a>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ProjectsSection;
