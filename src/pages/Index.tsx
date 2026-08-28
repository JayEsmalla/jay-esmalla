import { lazy, Suspense, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import PageLayout from "@/components/PageLayout";
import ProjectsSection from "@/components/ProjectsSection";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const CertificationsSection = lazy(() => import("@/components/CertificationsSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const GitHubSection = lazy(() => import("@/components/GitHubSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));

const SectionFallback = () => <div className="min-h-[260px] border-b border-graphite bg-obsidian" aria-hidden="true" />;

const Index = () => {
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
    <PageLayout>
      <HeroSection />
      <ProjectsSection />
      <Suspense fallback={<SectionFallback />}><AboutSection /></Suspense>
      <Suspense fallback={<SectionFallback />}><GitHubSection /></Suspense>
      <Suspense fallback={<SectionFallback />}><CertificationsSection /></Suspense>
      <Suspense fallback={<SectionFallback />}><TestimonialsSection /></Suspense>
      <Suspense fallback={<SectionFallback />}><ContactSection /></Suspense>
    </PageLayout>
  );
};

export default Index;
