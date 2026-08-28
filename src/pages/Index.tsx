import { useEffect } from "react";
import AboutSection from "@/components/AboutSection";
import CertificationsSection from "@/components/CertificationsSection";
import ContactSection from "@/components/ContactSection";
import GitHubSection from "@/components/GitHubSection";
import HeroSection from "@/components/HeroSection";
import PageLayout from "@/components/PageLayout";
import ProjectsSection from "@/components/ProjectsSection";
import TestimonialsSection from "@/components/TestimonialsSection";

const Index = () => {
  useEffect(() => {
    document.title = "Jay Esmalla | Developer Portfolio";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        "Portfolio of Jay Esmalla — Flutter mobile developer, React/TypeScript engineer, and Computer Science student majoring in AI at UMTC."
      );
  }, []);

  return (
    <PageLayout>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <GitHubSection />
      <CertificationsSection />
      <TestimonialsSection />
      <ContactSection />
    </PageLayout>
  );
};

export default Index;
