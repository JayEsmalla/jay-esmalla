import { useEffect } from "react";
import ProjectsSection from "@/components/ProjectsSection";
import GitHubSection from "@/components/GitHubSection";

const Projects = () => {
  useEffect(() => {
    document.title = "Projects | Jay Factolarin Esmalla";
  }, []);
  return (
    <>
      <ProjectsSection showAllByDefault />
      <GitHubSection />
    </>
  );
};

export default Projects;
