import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { projects } from "@/data/portfolio";

const SITE_ORIGIN = "https://jayesmalla.tech";

const HOME_SECTION_TITLES: Record<string, string> = {
  home: "Jay Esmalla | Full-Stack Developer",
  projects: "Projects | Jay Esmalla",
  about: "About | Jay Esmalla",
  github: "GitHub | Jay Esmalla",
  certifications: "Certifications | Jay Esmalla",
  contact: "Contact | Jay Esmalla",
};

const PAGE_METADATA: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Jay Esmalla | Full-Stack Developer",
    description: "Jay Esmalla — 4th-year Computer Science student majoring in AI at UMTC, Flutter mobile developer, and React/TypeScript engineer in Tagum City, Philippines.",
  },
  "/projects": {
    title: "Projects | Jay Esmalla",
    description: "Explore Jay Esmalla's mobile and web projects, including 1561 VULSHOP, Aralytics, LakBai, PRISM, Thryfto, LolasKusina, and ComLab V3 Egress Simulation built with Flutter, React, and TypeScript.",
  },
  "/certifications": {
    title: "Certifications | Jay Esmalla",
    description: "Explore Jay Esmalla's certifications, IT Specialist Databases credential, and technical innovation recognition in software development and computer science.",
  },
  "/contact": {
    title: "Contact | Jay Esmalla",
    description: "Contact Jay Esmalla in Tagum City, Philippines to discuss mobile and web projects, freelance work, or collaboration.",
  },
};

const NOT_FOUND_METADATA = {
  title: "Page Not Found | Jay Esmalla",
  description: "This page could not be found. Return to Jay Esmalla's site to explore projects, credentials, and contact information.",
};

const PageLayout = ({ children }: { children: ReactNode }) => {
  const { pathname, search, hash } = useLocation();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const normalizedPath = pathname.replace(/\/$/, "") || "/";
    if (normalizedPath !== "/") return;
    const hashSection = hash.replace(/^#/, "");
    if (hashSection && HOME_SECTION_TITLES[hashSection]) {
      setActiveSection(hashSection);
    } else if (!hash) {
      setActiveSection("home");
    }
  }, [pathname, hash]);

  useEffect(() => {
    const normalizedPath = pathname.replace(/\/$/, "") || "/";
    const projectMatch = normalizedPath.startsWith("/projects/")
      ? projects.find((project) => `/projects/${project.id}` === normalizedPath)
      : undefined;
    const metadata = projectMatch
      ? {
          title: `${projectMatch.title} | Jay Esmalla`,
          description: projectMatch.description,
        }
      : PAGE_METADATA[normalizedPath] ?? NOT_FOUND_METADATA;
    let resolvedTitle = metadata.title;

    if (normalizedPath === "/") {
      const hashSection = hash.replace(/^#/, "");
      const sectionKey = hashSection && HOME_SECTION_TITLES[hashSection] ? hashSection : activeSection;
      resolvedTitle = HOME_SECTION_TITLES[sectionKey] ?? metadata.title;
    } else if (normalizedPath === "/projects" && search) {
      const params = new URLSearchParams(search);
      const filter = params.get("filter");
      if (filter === "mobile") resolvedTitle = "Mobile Projects | Jay Esmalla";
      else if (filter === "web") resolvedTitle = "Web Projects | Jay Esmalla";
    }

    const canonicalUrl = `${SITE_ORIGIN}${normalizedPath === "/" ? "/" : normalizedPath}`;
    document.title = resolvedTitle;
    const tags = [
      ["name", "description", metadata.description],
      ["property", "og:title", resolvedTitle],
      ["property", "og:description", metadata.description],
      ["property", "og:url", canonicalUrl],
      ["name", "twitter:title", resolvedTitle],
      ["name", "twitter:description", metadata.description],
    ];
    tags.forEach(([attribute, key, content]) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname, search, hash, activeSection]);

  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[4px] focus:bg-chalk focus:px-5 focus:py-3 focus:text-obsidian"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus({ preventScroll: true });
          main?.scrollIntoView({ block: "start", behavior: "instant" });
        }}
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-screen max-w-[1380px] flex-col border-x border-graphite bg-carbon lg:grid lg:grid-cols-[216px_minmax(0,1fr)]">
        <Navbar onSectionChange={setActiveSection} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main-content" tabIndex={-1} className="flex-1 scroll-mt-6">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
