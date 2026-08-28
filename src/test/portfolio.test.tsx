import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactSection from "@/components/ContactSection";
import ProjectsSection from "@/components/ProjectsSection";
import { projects, socialLinks, testimonials } from "@/data/portfolio";

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
    expect(testimonials.map((testimonial) => testimonial.name)).toEqual(["M. Santos", "D. Reyes", "A. Cruz"]);
  });
});

describe("ProjectsSection", () => {
  it("shows truthful source actions and filters the project list", async () => {
    render(<ProjectsSection />);

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
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "LolasKusina" })).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "ComLab V3 Egress Simulation" })).not.toBeInTheDocument();
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
