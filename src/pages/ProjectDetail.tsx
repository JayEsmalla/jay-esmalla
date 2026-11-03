import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { projects } from "@/data/portfolio";
import NotFound from "./NotFound";

const featuredOrder = ["vulshop", "aralytics", "lakbai", "prism", "thryfto"];
const projectRank = (id: string) => {
  const rank = featuredOrder.indexOf(id);
  return rank === -1 ? featuredOrder.length : rank;
};
const orderedProjects = [...projects].sort((a, b) => projectRank(a.id) - projectRank(b.id));

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const currentIndex = orderedProjects.findIndex((item) => item.id === id);
  const project = currentIndex >= 0 ? orderedProjects[currentIndex] : undefined;

  if (!project) {
    return <NotFound />;
  }

  const projectNumber = String(currentIndex + 1).padStart(2, "0");
  const totalCount = String(orderedProjects.length).padStart(2, "0");
  const nextProject = orderedProjects[(currentIndex + 1) % orderedProjects.length];
  const isMobile = project.category === "flutter" || project.category === "mobile";

  return (
    <article className="section-shell">
      {/* ── Top Breadcrumb & Index Strip ── */}
      <div className="flex min-h-14 items-center justify-between gap-4 border-b border-graphite bg-obsidian/40 px-5 py-2.5 sm:px-8 lg:px-10">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 font-mono-retro text-[11px] uppercase tracking-[0.05em] text-ash transition-colors hover:text-pulse-green"
        >
          <ArrowLeft size={13} />
          <span>ALL PROJECTS</span>
        </Link>
        <span className="meta-text tabular-nums text-smoke">
          {projectNumber} / {totalCount}
        </span>
      </div>

      {/* ── Case Study Hero Header ── */}
      <header className="editorial-grid-bg border-b border-graphite bg-carbon px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <p className="section-kicker">
          CASE STUDY · {isMobile ? "MOBILE APP" : "WEB APP"} · {project.year ?? "2026"}
        </p>
        <h1 className="mt-4 max-w-[860px] text-balance text-[38px] font-normal leading-[0.98] tracking-[-0.045em] text-chalk sm:text-[52px] lg:text-[64px]">
          {project.title}
        </h1>
        <p className="mt-5 max-w-[680px] text-[17px] leading-[1.6] text-smoke sm:text-[19px]">
          {project.description}
        </p>

        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-7 flex flex-wrap gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="primary-pill">
                OPEN LIVE PROJECT <ExternalLink size={13} />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="ghost-button">
                PUBLIC SOURCE <Github size={13} />
              </a>
            )}
          </div>
        )}
      </header>

      {/* ── 4-Cell Specification Strip ── */}
      <div className="grid grid-cols-2 border-b border-graphite bg-carbon lg:grid-cols-4">
        <div className="p-5 sm:p-6">
          <p className="meta-text text-smoke">MY ROLE</p>
          <p className="mt-2 text-[15px] leading-snug text-chalk">{project.role}</p>
        </div>
        <div className="border-l border-graphite p-5 sm:p-6">
          <p className="meta-text text-smoke">CONTEXT</p>
          <p className="mt-2 text-[15px] leading-snug text-chalk">
            {project.client ?? (isMobile ? "Mobile application" : "Web application")}
          </p>
        </div>
        <div className="border-t border-graphite p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="meta-text text-smoke">CORE STACK</p>
          <p className="mt-2 truncate text-[15px] leading-snug text-chalk">
            {project.technologies.slice(0, 3).join(" · ")}
          </p>
        </div>
        <div className="border-l border-t border-graphite p-5 sm:p-6 lg:border-t-0">
          <p className="meta-text text-smoke">DELIVERY</p>
          <p className="mt-2 font-mono-retro text-[13px] tabular-nums text-chalk">
            {project.year ?? "2026"} · {project.liveUrl ? "LIVE" : project.githubUrl ? "PUBLIC REPO" : "SHIPPED"}
          </p>
        </div>
      </div>

      {/* ── Large Annotated Interface Figure ── */}
      <figure className="border-b border-graphite bg-obsidian/60 p-5 sm:p-8 lg:p-10">
        <div
          className="relative mx-auto flex h-[240px] w-full items-center justify-center overflow-hidden rounded-[4px] border border-graphite sm:h-[360px] lg:h-[440px]"
          style={{ backgroundColor: project.imageBackground ?? "#121212" }}
        >
          <img
            src={project.image}
            srcSet={project.imageSrcSet}
            sizes="(min-width: 1200px) 1040px, calc(100vw - 64px)"
            alt={project.imageAlt ?? `${project.title} interface preview`}
            loading="eager"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
        <figcaption className="meta-text mt-3.5 flex flex-wrap items-center justify-between gap-2 text-smoke">
          <span>FIG. 01 — {project.previewLabel}</span>
          <span>{project.title.toUpperCase()}</span>
        </figcaption>
      </figure>

      {/* ── 3-Column Problem / Approach / Implemented Band ── */}
      <div className="grid border-b border-graphite bg-carbon lg:grid-cols-3">
        <section className="p-6 sm:p-8">
          <p className="meta-text text-pulse-green">01 · PROBLEM</p>
          <h2 className="mt-3 text-[20px] font-normal tracking-[-0.02em] text-chalk">What needed solving</h2>
          <p className="mt-3 text-[15px] leading-[1.65] text-smoke">{project.problemSolved}</p>
        </section>

        <section className="border-t border-graphite p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="meta-text text-pulse-green">02 · WHAT I BUILT</p>
          <h2 className="mt-3 text-[20px] font-normal tracking-[-0.02em] text-chalk">Architecture &amp; outcome</h2>
          <p className="mt-3 text-[15px] leading-[1.65] text-smoke">{project.outcome}</p>
        </section>

        <section className="border-t border-graphite p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="meta-text text-pulse-green">03 · IMPLEMENTED</p>
          <h2 className="mt-3 text-[20px] font-normal tracking-[-0.02em] text-chalk">Key capabilities &amp; stack</h2>
          <ul className="mt-3 space-y-2">
            {project.proofPoints.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-[14px] text-chalk">
                <span className="h-1.5 w-1.5 shrink-0 bg-pulse-green" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-1.5 border-t border-graphite pt-4">
            {project.technologies.map((tech) => (
              <span key={tech} className="tech-tag">
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* ── Next Case Study Handoff ── */}
      <Link
        to={`/projects/${nextProject.id}`}
        data-cursor="project"
        className="group flex items-end justify-between gap-6 bg-obsidian/40 px-5 py-8 transition-colors hover:bg-obsidian sm:px-8 sm:py-10 lg:px-10"
      >
        <div>
          <p className="meta-text text-smoke">NEXT CASE STUDY</p>
          <p className="mt-2 text-[28px] font-normal leading-tight tracking-[-0.035em] text-chalk transition-colors group-hover:text-pulse-green sm:text-[38px]">
            {nextProject.title}
          </p>
          <p className="mt-1 text-[14px] text-smoke">{nextProject.summary}</p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[4px] border border-graphite text-pulse-green transition-transform group-hover:translate-x-1 group-hover:border-pulse-green">
          <ArrowRight size={20} />
        </span>
      </Link>
    </article>
  );
}

