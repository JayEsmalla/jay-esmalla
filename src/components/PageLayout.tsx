import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const PAGE_METADATA: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Jay Factolarin Esmalla | Developer Portfolio",
    description: "Portfolio of Jay Factolarin Esmalla — 4th-year Computer Science student majoring in AI at UMTC, Flutter mobile developer, and React/TypeScript engineer.",
  },
  "/projects": {
    title: "Projects | Jay Factolarin Esmalla",
    description: "Explore Jay Factolarin Esmalla's mobile and web projects, including Aralytics, LakBai, Thryfto, and practical apps built with Flutter, React, and TypeScript.",
  },
  "/certifications": {
    title: "Certifications | Jay Factolarin Esmalla",
    description: "Explore Jay Factolarin Esmalla's certifications, technical training, and continued learning in software development and computer science.",
  },
  "/contact": {
    title: "Contact | Jay Factolarin Esmalla",
    description: "Contact Jay Factolarin Esmalla in Tagum City, Philippines to discuss mobile and web projects, freelance work, or collaboration.",
  },
};

const NOT_FOUND_METADATA = {
  title: "Page Not Found | Jay Factolarin Esmalla",
  description: "This portfolio page could not be found. Return to Jay Factolarin Esmalla's portfolio to explore projects, credentials, and contact information.",
};

const PageLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = PAGE_METADATA[pathname.replace(/\/$/, "") || "/"] ?? NOT_FOUND_METADATA;
    document.title = metadata.title;
    const tags = [
      ["name", "description", metadata.description],
      ["property", "og:title", metadata.title],
      ["property", "og:description", metadata.description],
      ["name", "twitter:title", metadata.title],
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
  }, [pathname]);

  return (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-chalk focus:px-5 focus:py-3 focus:text-obsidian"
      onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById("main-content");
        main?.focus({ preventScroll: true });
        main?.scrollIntoView({ block: "start", behavior: "instant" });
      }}
    >
      Skip to content
    </a>
    <Navbar />
    <main id="main-content" tabIndex={-1} className="flex-1 scroll-mt-[88px]">{children}</main>
    <Footer />
  </div>
  );
};

export default PageLayout;
