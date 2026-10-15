import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ContactSection from "@/components/ContactSection";
import ProjectsSection from "@/components/ProjectsSection";
import { projects, socialLinks } from "@/data/portfolio";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("portfolio credibility links", () => {
  it("uses the provided LinkedIn profile and accessible public repositories", () => {
    expect(socialLinks.linkedin).toBe("https://www.linkedin.com/in/jay-esmalla-1703bb381/");
    expect(projects.find((project) => project.id === "thryfto")?.githubUrl).toBe("https://github.com/JayEsmalla/thryfto-app");
    expect(projects.find((project) => project.id === "simulation-comlab-v3")).toMatchObject({
      githubUrl: "https://github.com/JayEsmalla/simulation_comlabV3",
      liveUrl: "https://simulation-comlab-v3.vercel.app/",
    });
    expect(projects.some((project) => project.id === "rimworks")).toBe(false);
    expect(projects.find((project) => project.id === "lolas-kusina")?.githubUrl).toBeUndefined();
  });
});

describe("ProjectsSection", () => {
  it("shows truthful source actions and filters the project list", async () => {
    render(<MemoryRouter><ProjectsSection showAllByDefault /></MemoryRouter>);

    expect(screen.getByRole("link", { name: "Thryfto public source code" })).toHaveAttribute(
      "href",
      "https://github.com/JayEsmalla/thryfto-app",
    );
    expect(screen.getByRole("link", { name: "ComLab V3 Egress Simulation public source code" })).toHaveAttribute(
      "href",
      "https://github.com/JayEsmalla/simulation_comlabV3",
    );
    expect(screen.getByRole("link", { name: "ComLab V3 Egress Simulation live project" })).toHaveAttribute(
      "href",
      "https://simulation-comlab-v3.vercel.app/",
    );

    const lolasCard = screen.getByRole("heading", { name: "LolasKusina" }).closest("article");
    expect(lolasCard).not.toBeNull();
    expect(within(lolasCard as HTMLElement).queryByRole("link", { name: /source/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "MOBILE" }));
    expect(screen.getByRole("heading", { name: "Thryfto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "LakBai" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "LolasKusina" })).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "ComLab V3 Egress Simulation" })).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Aralytics" })).not.toBeInTheDocument();
    });
  });

  it("opens a project case study with imagery and restores the originating focus", async () => {
    render(<MemoryRouter><ProjectsSection /></MemoryRouter>);
    const thryftoCard = screen.getByRole("heading", { name: "Thryfto" }).closest("article");
    expect(thryftoCard).not.toBeNull();

    const trigger = within(thryftoCard as HTMLElement).getByRole("button", { name: "View Thryfto case study" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Thryfto" });
    expect(within(dialog).getByText("Real-time feed")).toBeInTheDocument();
    expect(within(dialog).getByRole("img", { name: /Thryfto mobile app/ })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /View full-size Thryfto image/ })).toHaveAttribute("href", "/thryfto.png");
    expect(within(dialog).getByRole("link", { name: "PUBLIC SOURCE" })).toHaveAttribute(
      "href",
      "https://github.com/JayEsmalla/thryfto-app",
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("features the new projects while keeping all work discoverable", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ProjectsSection />} />
          <Route path="/projects" element={<ProjectsSection showAllByDefault />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Aralytics", "LakBai", "PRISM", "Thryfto",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 4 of 6 projects");
    const allProjectsLink = screen.getByRole("link", { name: "VIEW ALL 6 PROJECTS" });
    expect(allProjectsLink).toHaveAttribute("href", "/projects");
    fireEvent.click(allProjectsLink);
    expect(screen.getByRole("heading", { name: "All projects. One place." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "LolasKusina" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Showing 6 of 6 projects");
    fireEvent.click(screen.getByRole("button", { name: "WEB" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "LakBai" })).not.toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("Showing 4 of 4 web projects");
  });
});

describe("ContactSection", () => {
  it("submits the message directly and clears the form after delivery", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Juan Dela Cruz" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "juan@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I would like to discuss a web project." } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = request.body as FormData;

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.web3forms.com/submit");
    expect(request.method).toBe("POST");
    expect(body.get("access_key")).toBe("e89329f9-ed99-4cb5-82e5-27be3bc74979");
    expect(body.get("subject")).toBe("Portfolio Contact from Juan Dela Cruz");
    expect(await screen.findByRole("status")).toHaveTextContent("Message sent successfully");
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });
});
