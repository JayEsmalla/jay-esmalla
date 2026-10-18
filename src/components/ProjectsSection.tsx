import Reveal from "@/components/Reveal";
import { useReveal, useMotionSettings, motionTokens } from "@/lib/motion";
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
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { projects, type Project } from "@/data/portfolio";
import { PROJECTS_PER_PAGE, projectPageNumbers, projectPagination, projectSearch, readProjectFilter, type ProjectFilter } from "@/lib/project-pagination";

const filters: { key: ProjectFilter; label: string }[] = [
  { key: "all", label: "ALL WORK" },
  { key: "mobile", label: "MOBILE" },
  { key: "web", label: "WEB" },
];

const featuredOrder = ["vulshop", "aralytics", "lakbai", "prism", "thryfto"];
const projectRank = (project: Project) => {
  const rank = featuredOrder.indexOf(project.id);
  return rank === -1 ? featuredOrder.length : rank;
};
const orderedProjects = [...projects].sort((a, b) => projectRank(a) - projectRank(b));

const FLOW_ICONS = {
  "mobile-flow": [ShoppingBag, Upload, MessageCircle],
  "simulation-flow": [Users, Route, BarChart3],
} as const;

const ProjectPreview = ({ project }: { project: Project }) => {
  if (project.preview === "screen" && project.imageFit === "contain") {
    return (
      <figure className="flex min-w-0 shrink-0 flex-col bg-preview-surface">
        <div className="h-40 overflow-hidden bg-[#f5f3f5] sm:h-44" style={{ backgroundColor: project.imageBackground }}>
          <img
            src={project.image}
            srcSet={project.imageSrcSet}
            sizes="(min-width: 1200px) 366px, (min-width: 1024px) calc((100vw - 104px) / 3), (min-width: 768px) calc((100vw - 84px) / 2), calc(100vw - 40px)"
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
      <div className="relative h-[190px] shrink-0 overflow-hidden bg-preview-surface">
        <img
          src={project.image}
          alt={project.imageAlt ?? `${project.title} authentication and order-entry screen`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.18] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
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
    <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden bg-preview-surface p-5 sm:p-6 md:min-h-[320px]">
      <div className="project-grid pointer-events-none absolute inset-0 opacity-45" aria-hidden="true" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <p className="meta-text text-smoke">{project.previewLabel}</p>
        <p className="meta-text text-ash">{project.category === "flutter" || project.category === "mobile" ? "MOBILE" : "WEB"}</p>
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
        <span className="text-[40px] font-normal leading-none tracking-[-0.06em] text-preview-mark">{project.title.slice(0, 2).toUpperCase()}</span>
      </div>
    </div>
  );
};

export interface ProjectsSectionProps {
  initialVisibleCount?: number;
  showAllByDefault?: boolean;
}

const ProjectsSection = ({ initialVisibleCount = 6, showAllByDefault = false }: ProjectsSectionProps = {}) => {
  const reveal = useReveal();
  const { reduced, compact } = useMotionSettings();
  const animateLayout = !reduced && !compact && !showAllByDefault;
  const [localFilter, setLocalFilter] = useState<ProjectFilter>("all");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const filter = showAllByDefault ? readProjectFilter(searchParams) : localFilter;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement | null>(null);
  const resultsRef = useRef<HTMLParagraphElement | null>(null);

  const filtered = useMemo(() => filter === "all" ? orderedProjects : orderedProjects.filter((project) =>
    filter === "mobile" ? project.category === "flutter" || project.category === "mobile" : project.category === filter,
  ), [filter]);
  const { page, totalPages, start, canonicalSearch } = projectPagination(searchParams, filtered.length);
  const visibleProjects = useMemo(() => showAllByDefault
    ? filtered.slice(start, start + PROJECTS_PER_PAGE)
    : filtered.slice(0, initialVisibleCount), [showAllByDefault, filtered, start, initialVisibleCount]);

  useEffect(() => {
    if (showAllByDefault && searchParams.toString() !== canonicalSearch) {
      navigate({ pathname: location.pathname, search: canonicalSearch, hash: location.hash }, { replace: true, state: { ...location.state, projectNavigation: "normalize" } });
    }
  }, [showAllByDefault, searchParams, canonicalSearch, navigate, location.pathname, location.hash, location.state]);

  useEffect(() => {
    if (selectedProject && !visibleProjects.some((project) => project.id === selectedProject.id)) setSelectedProject(null);
  }, [visibleProjects, selectedProject]);

  const selectFilter = (next: ProjectFilter) => {
    if (next === filter) return;
    if (showAllByDefault) navigate({ pathname: location.pathname, search: projectSearch(searchParams, next, 1), hash: location.hash }, { state: { projectNavigation: "filter" } });
    else setLocalFilter(next);
  };
  const pageDestination = (next: number) => ({
    pathname: location.pathname,
    search: projectSearch(searchParams, filter, next),
    hash: location.hash,
  });

  return (
    <section id="projects" className="section-shell scroll-mt-[72px]">
      <div className="page-container">
        <Reveal className="section-heading-grid">
          <div>
            <p className="section-kicker">{showAllByDefault ? "01 / PROJECT COLLECTION" : "01 / SELECTED WORK"}</p>
            <h2 className="section-title">{showAllByDefault ? "All projects. One place." : "Selected work. Real-world problems."}</h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="max-w-md text-[16px] leading-[1.6] text-smoke">
              {projects.length} mobile and web builds for local businesses, study, travel, hospital teams, and safety simulation.
            </p>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => selectFilter(item.key)}
                  aria-pressed={filter === item.key}
                  aria-controls="project-list"
                  className={`min-h-11 rounded-[4px] border px-4 py-2 text-[12px] font-normal tracking-[0.03em] transition-colors ${
                    filter === item.key
                      ? "border-pulse-green text-pulse-green"
                      : "border-graphite text-smoke hover:border-iron hover:text-chalk"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <p ref={resultsRef} id="project-results" tabIndex={-1} className="meta-text mt-6 scroll-mt-24 text-smoke" role="status" aria-live="polite" aria-atomic="true">
          Showing {showAllByDefault && filtered.length > 0 ? `${start + 1}–${start + visibleProjects.length}` : visibleProjects.length} of {filtered.length} {filter === "all" ? "projects" : `${filter} projects`}
          {showAllByDefault && ` · Page ${page} of ${totalPages}`}
        </p>
        <motion.div
          key={showAllByDefault ? `${filter}-${page}` : "selected-work"}
          id="project-list" layout={animateLayout}
          initial={showAllByDefault && !reduced ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : motionTokens.feedback, ease: motionTokens.ease }}
          className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode={animateLayout ? "popLayout" : "sync"}>
            {visibleProjects.map((project, index) => {
              const projectNumber = String(orderedProjects.findIndex((item) => item.id === project.id) + 1).padStart(2, "0");
              const cardReveal = showAllByDefault ? { initial: false as const, transition: undefined } : reveal(index, compact ? 0 : 12);
              return (
                <motion.article
                  layout={animateLayout}
                  key={project.id}
                  {...cardReveal}
                  exit={{ opacity: 0, transition: { duration: animateLayout ? motionTokens.exit : 0 } }}
                  transition={{
                    ...cardReveal.transition,
                    ...(compact && cardReveal.initial !== false ? { duration: motionTokens.feedback, delay: 0 } : {}),
                    layout: { duration: animateLayout ? motionTokens.page : 0, ease: motionTokens.ease },
                  }}
                  className="motion-feedback group flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-graphite bg-carbon transition-[border-color,box-shadow] hover:border-iron hover:shadow-[0_8px_32px_rgb(var(--signal)/0.06)] focus-within:border-iron"
                >
                  <ProjectPreview project={project} />

                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <p className="meta-text text-smoke">{projectNumber}</p>
                        <span className="h-px w-8 bg-graphite" aria-hidden="true" />
                        <p className="meta-text text-smoke">{project.category === "flutter" || project.category === "mobile" ? "Mobile app" : "Web app"}</p>
                      </div>
                    </div>

                    <h3 className="mt-2 text-[20px] font-normal leading-tight tracking-[-0.025em] text-chalk">{project.title}</h3>
                    <p className="mt-2 text-[14px] leading-[1.6] text-smoke">{project.summary}</p>

                    <div className="mb-4 mt-3 flex flex-wrap items-center gap-1.5">
                      {project.technologies.slice(0, 3).map((tech) => <span key={tech} className="tech-tag">{tech}</span>)}
                      {project.technologies.length > 3 && <span className="px-1 text-[12px] text-smoke">+{project.technologies.length - 3}</span>}
                    </div>

                    <div className="mt-auto flex items-center gap-1 border-t border-graphite pt-2">
                      <button type="button" data-cursor="project" onClick={(event) => { triggerRef.current = event.currentTarget; setSelectedProject(project); }} className="mr-auto inline-flex min-h-11 items-center gap-2 rounded-sm pr-3 text-[12px] text-chalk transition-colors hover:text-compass-gold" aria-label={`View ${project.title} case study`}>
                        CASE STUDY <ArrowUpRight size={15} className="text-compass-gold" />
                      </button>
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-smoke transition-colors hover:bg-signal-white/5 hover:text-chalk" aria-label={`${project.title} live project`} title="Open live project">
                          <ExternalLink size={17} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-smoke transition-colors hover:bg-signal-white/5 hover:text-chalk" aria-label={`${project.title} public source code`} title="View source on GitHub">
                          <Github size={17} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {showAllByDefault && totalPages > 1 && (
          <Pagination className="mt-8" aria-label="Project pages">
            <PaginationContent className="flex-wrap gap-1.5">
              <PaginationItem>
                <PaginationPrevious disabled={page === 1} to={page > 1 ? pageDestination(page - 1) : undefined} state={{ projectNavigation: "page" }} aria-controls="project-list" />
              </PaginationItem>
              {projectPageNumbers(page, totalPages).map((item, index) => (
                <PaginationItem key={item === "ellipsis" ? `gap-${index}` : item}>
                  {item === "ellipsis" ? <PaginationEllipsis /> : (
                    <PaginationLink
                      to={pageDestination(item)} state={{ projectNavigation: "page" }}
                      isActive={page === item} aria-label={`Page ${item}`} aria-controls="project-list"
                      onClick={(event) => {
                        if (page === item && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) event.preventDefault();
                      }}
                      className={page === item ? "border-pulse-green bg-pulse-green/5 text-pulse-green hover:bg-pulse-green/10" : "text-smoke hover:text-chalk"}
                    >{item}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext disabled={page === totalPages} to={page < totalPages ? pageDestination(page + 1) : undefined} state={{ projectNavigation: "page" }} aria-controls="project-list" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {!showAllByDefault && (
          <div className="mt-8 flex justify-center">
            <Link to="/projects" className="ghost-button">
              VIEW ALL {projects.length} PROJECTS <ArrowRight size={15} />
            </Link>
          </div>
        )}

        <Dialog open={Boolean(selectedProject)} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent
            className="flex max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] flex-col gap-0 overflow-hidden rounded-lg border-iron bg-carbon p-0 text-chalk shadow-none sm:max-w-4xl"
            onOpenAutoFocus={(event) => { event.preventDefault(); dialogTitleRef.current?.focus(); }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              (triggerRef.current?.isConnected ? triggerRef.current : resultsRef.current)?.focus({ preventScroll: true });
            }}
          >
            {selectedProject && (
              <>
                  <DialogHeader className="shrink-0 border-b border-graphite p-5 pr-16 text-left sm:px-8 sm:py-6">
                    <p className="section-kicker">PROJECT CASE STUDY</p>
                    <DialogTitle ref={dialogTitleRef} tabIndex={-1} className="mt-2 text-[26px] font-normal leading-tight tracking-[-0.02em] text-chalk sm:text-[34px]">{selectedProject.title}</DialogTitle>
                    <DialogDescription className="sr-only">{selectedProject.description}</DialogDescription>
                  </DialogHeader>
                <div className="no-scrollbar min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-8">
                  <p className="text-[16px] leading-relaxed text-chalk">{selectedProject.description}</p>
                  <div className="mt-6 divide-y divide-graphite border-y border-graphite">
                    <div className="grid gap-3 py-5 sm:grid-cols-[140px_1fr]">
                      <p className="meta-text text-smoke">MY ROLE</p>
                      <p className="text-[14px] leading-[1.6] text-chalk">{selectedProject.role}</p>
                    </div>
                    <div className="grid gap-3 py-5 sm:grid-cols-[140px_1fr]">
                      <p className="meta-text text-smoke">PROBLEM</p>
                      <p className="text-[14px] leading-[1.6] text-smoke">{selectedProject.problemSolved}</p>
                    </div>
                    <div className="grid gap-3 py-5 sm:grid-cols-[140px_1fr]">
                      <p className="meta-text text-smoke">WHAT I BUILT</p>
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
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ProjectsSection;
