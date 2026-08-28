import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectsSection from "@/components/ProjectsSection";
import { projects, socialLinks } from "@/data/portfolio";

describe("portfolio credibility links", () => {
  it("uses the provided LinkedIn profile and accessible public repositories", () => {
    expect(socialLinks.linkedin).toBe("https://www.linkedin.com/in/jay-esmalla-1703bb381/");
    expect(projects.find((project) => project.id === "thryfto")?.githubUrl).toBe("https://github.com/JayEsmalla/thryfto-app");
    expect(projects.find((project) => project.id === "rimworks")?.githubUrl).toBe("https://github.com/JayEsmalla/rim-works");
    expect(projects.find((project) => project.id === "lolas-kusina")?.githubUrl).toBeUndefined();
  });
});

describe("ProjectsSection", () => {
  it("shows truthful source actions and filters the project list", async () => {
    render(<ProjectsSection />);

    expect(screen.getByRole("link", { name: "Thryfto public source code" })).toHaveAttribute(
      "href",
      "https://github.com/JayEsmalla/thryfto-app",
    );
    expect(screen.getByRole("link", { name: "RimWorks PH public source code" })).toHaveAttribute(
      "href",
      "https://github.com/JayEsmalla/rim-works",
    );

    const lolasCard = screen.getByRole("heading", { name: "LolasKusina" }).closest("article");
    expect(lolasCard).not.toBeNull();
    expect(within(lolasCard as HTMLElement).queryByRole("link", { name: /source/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "MOBILE" }));
    expect(screen.getByRole("heading", { name: "Thryfto" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "LolasKusina" })).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "RimWorks PH" })).not.toBeInTheDocument();
    });
  });

  it("opens a project case study with implemented proof", () => {
    render(<ProjectsSection />);
    const thryftoCard = screen.getByRole("heading", { name: "Thryfto" }).closest("article");
    expect(thryftoCard).not.toBeNull();

    fireEvent.click(within(thryftoCard as HTMLElement).getByRole("button", { name: "CASE STUDY" }));
    const dialog = screen.getByRole("dialog", { name: "Thryfto" });
    expect(within(dialog).getByText("Real-time feed")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "PUBLIC SOURCE" })).toHaveAttribute(
      "href",
      "https://github.com/JayEsmalla/thryfto-app",
    );
  });
});
