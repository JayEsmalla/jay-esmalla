import { lazy, Suspense, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import ProjectsSection from "@/components/ProjectsSection";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const CertificationsSection = lazy(() => import("@/components/CertificationsSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const GitHubSection = lazy(() => import("@/components/GitHubSection"));

const SectionFallback = () => <div data-section-loading className="min-h-[260px] border-b border-graphite bg-obsidian" aria-hidden="true" />;

const Index = ({ heroReady = true }: { heroReady?: boolean }) => {
  useEffect(() => {
    document.title = "Jay Factolarin Esmalla | Developer Portfolio";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        "Portfolio of Jay Factolarin Esmalla — 4th-year Computer Science student majoring in AI at UMTC, Flutter mobile developer, and React/TypeScript engineer."
      );
  }, []);

  return (
    <>
      <HeroSection ready={heroReady} />
      <ProjectsSection />
      <Suspense fallback={<SectionFallback />}><AboutSection /></Suspense>
      <Suspense fallback={<SectionFallback />}><GitHubSection /></Suspense>
      <Suspense fallback={<SectionFallback />}><CertificationsSection /></Suspense>
      <Suspense fallback={<SectionFallback />}><ContactSection /></Suspense>
    </>
  );
};

export default Index;
