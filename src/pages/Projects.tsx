import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import ProjectsSection from "@/components/ProjectsSection";
import GitHubSection from "@/components/GitHubSection";

const Projects = () => {
  useEffect(() => {
    document.title = "Projects | Jay Factolarin Esmalla";
  }, []);
  return (
    <PageLayout>
      <ProjectsSection />
      <GitHubSection />
    </PageLayout>
  );
};

export default Projects;
