import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import AboutSection from "@/components/AboutSection";
import ActivitySticker from "@/components/ActivitySticker";
import FocusCursor from "@/components/FocusCursor";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import PageLayout from "@/components/PageLayout";
import ProjectsSection from "@/components/ProjectsSection";
import { clearLatestCommitCache, FALLBACK_COMMIT, fetchLatestCommit, formatRelativeAge } from "@/lib/github-latest";
import { formatManilaTime } from "@/lib/local-time";
import ProjectDetail from "@/pages/ProjectDetail";

const routerFlags = { v7_startTransition: true, v7_relativeSplatPath: true };

afterEach(() => {
  cleanup();
  clearLatestCommitCache();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("HeroSection, SignalStrip, and Navbar Local Time Sticker", () => {
  it("renders the headline without hero buttons and shows the 3-cell live signal strip", () => {
    render(
      <MemoryRouter future={routerFlags}>
        <HeroSection ready />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /Practical apps\. Clear interfaces\./i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("LAST COMMIT")).toBeInTheDocument();
    expect(screen.getByText("NOW BUILDING")).toBeInTheDocument();
    expect(screen.getByText("VIEWING NOW")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Aralytics v2" })).toHaveAttribute("href", "/projects/aralytics");
  });

  it("maps Manila time ranges to the 4 activity stickers (sleeping, studying, workout, coding)", () => {
    const sleeping = formatManilaTime(new Date("2026-11-03T17:15:00Z")); // 01:15 PHT
    expect(sleeping).toMatchObject({
      time: "01:15",
      awake: false,
      activity: "sleeping",
      label: "SLEEPING",
      sticker: "/stickers/sleeping.webp",
    });

    const studying = formatManilaTime(new Date("2026-11-04T02:30:00Z")); // 10:30 PHT
    expect(studying).toMatchObject({
      time: "10:30",
      awake: true,
      activity: "studying",
      label: "STUDYING",
      sticker: "/stickers/studying.webp",
    });

    const workout = formatManilaTime(new Date("2026-11-04T08:00:00Z")); // 16:00 PHT
    expect(workout).toMatchObject({
      time: "16:00",
      awake: true,
      activity: "workout",
      label: "WORKOUT",
      sticker: "/stickers/workout.webp",
    });

    const coding = formatManilaTime(new Date("2026-11-04T12:45:00Z")); // 20:45 PHT
    expect(coding).toMatchObject({
      time: "20:45",
      awake: true,
      activity: "coding",
      label: "CODING",
      sticker: "/stickers/coding.webp",
    });
  });

  it("renders the living chibi sticker inside the Navbar and supports click-to-poke", () => {
    render(
      <MemoryRouter future={routerFlags}>
        <Navbar />
      </MemoryRouter>,
    );

    const card = screen.getByTestId("navbar-local-time");
    expect(card).toBeInTheDocument();
    const stickerSvg = within(card).getByRole("img", { name: /status sticker/i });
    expect(stickerSvg).toHaveAttribute(
      "data-sticker-mode",
      expect.stringMatching(/^(sleeping|studying|workout|coding)$/),
    );

    const pokeBtn = within(card).getByRole("button", { name: /poke .* sticker/i });
    fireEvent.click(pokeBtn);
    expect(pokeBtn).toBeInTheDocument();
  });

  it("renders all 4 living chibi sticker scenes (sleeping, studying, workout, coding)", () => {
    const { rerender } = render(<ActivitySticker activity="sleeping" label="SLEEPING" />);
    expect(screen.getByRole("img", { name: "SLEEPING status sticker" })).toHaveAttribute(
      "data-sticker-mode",
      "sleeping",
    );

    rerender(<ActivitySticker activity="studying" label="STUDYING" />);
    expect(screen.getByRole("img", { name: "STUDYING status sticker" })).toHaveAttribute(
      "data-sticker-mode",
      "studying",
    );

    rerender(<ActivitySticker activity="workout" label="WORKOUT" />);
    expect(screen.getByRole("img", { name: "WORKOUT status sticker" })).toHaveAttribute(
      "data-sticker-mode",
      "workout",
    );

    rerender(<ActivitySticker activity="coding" label="CODING" />);
    expect(screen.getByRole("img", { name: "CODING status sticker" })).toHaveAttribute(
      "data-sticker-mode",
      "coding",
    );
  });
});

describe("latest GitHub commit helper", () => {
  it("reads the serverless payload, falls back to public events, and degrades to FALLBACK_COMMIT", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          repo: "vulshop",
          message: "fix: payroll overtime rounding",
          pushedAt: "2026-11-03T14:00:00Z",
          url: "https://github.com/JayEsmalla/vulshop",
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const first = await fetchLatestCommit();
    expect(first).toEqual({
      repo: "vulshop",
      message: "fix: payroll overtime rounding",
      pushedAt: "2026-11-03T14:00:00Z",
      url: "https://github.com/JayEsmalla/vulshop",
    });

    clearLatestCommitCache();
    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            type: "PushEvent",
            created_at: "2026-11-03T12:00:00Z",
            repo: { name: "JayEsmalla/thryfto-app" },
            payload: { commits: [{ message: "feat: chat image attachments\n\nDetails" }] },
          },
        ],
      });

    const fromEvents = await fetchLatestCommit();
    expect(fromEvents).toEqual({
      repo: "thryfto-app",
      message: "feat: chat image attachments",
      pushedAt: "2026-11-03T12:00:00Z",
      url: "https://github.com/JayEsmalla/thryfto-app",
    });

    clearLatestCommitCache();
    fetchMock.mockReset();
    fetchMock.mockRejectedValue(new Error("offline"));
    expect(await fetchLatestCommit()).toEqual(FALLBACK_COMMIT);

    const now = new Date("2026-11-03T16:00:00Z");
    expect(formatRelativeAge("2026-11-03T13:00:00Z", now)).toBe("3h ago");
    expect(formatRelativeAge(null, now)).toBe("recent");
  });
});

describe("AboutSection and Footer", () => {
  it("presents the 3-column Focus Matrix, Icon Stack Matrix, and clean single-row footer without redundant email", () => {
    render(
      <MemoryRouter future={routerFlags}>
        <AboutSection />
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Product Engineering" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI & Intelligent Systems" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Systems with Clear UX" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mobile" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Frontend" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Backend & Data" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tools" })).toBeInTheDocument();
    expect(screen.getByText(/JAY ESMALLA · TAGUM CITY, PH/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /jaesmalla1@gmail\.com/i })).not.toBeInTheDocument();
  });
});

describe("ProjectsSection index view and FocusCursor preview", () => {
  it("toggles between Grid and Index views on /projects and exposes cursor preview attributes", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]} future={routerFlags}>
        <ProjectsSection showAllByDefault />
      </MemoryRouter>,
    );

    const gridBtn = screen.getByRole("button", { name: "GRID" });
    const indexBtn = screen.getByRole("button", { name: "INDEX" });
    expect(gridBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(indexBtn);
    expect(indexBtn).toHaveAttribute("aria-pressed", "true");
    const vulshopLink = screen.getByRole("link", { name: "1561 VULSHOP" });
    expect(vulshopLink).toHaveAttribute("href", "/projects/vulshop");
    expect(vulshopLink).toHaveAttribute("data-cursor-preview", "/projects/vulshop-800.webp");
  });

  it("activates the floating screenshot preview inside FocusCursor when hovering a preview link", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: !query.includes("reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as MediaQueryList);

    render(
      <>
        <FocusCursor enabled />
        <a
          href="/projects/vulshop"
          data-cursor="project"
          data-cursor-preview="/projects/vulshop-800.webp"
          data-cursor-bg="#e5e7e9"
        >
          1561 VULSHOP
        </a>
      </>,
    );

    const link = screen.getByRole("link", { name: "1561 VULSHOP" });
    const event = new Event("pointermove", { bubbles: true });
    Object.assign(event, { pointerType: "mouse", clientX: 200, clientY: 220 });
    fireEvent(link, event);

    const cursor = document.querySelector(".focus-cursor") as HTMLElement;
    expect(cursor).toHaveAttribute("data-mode", "project");
    expect(cursor).toHaveAttribute("data-preview", "true");
    expect(cursor.querySelector(".focus-cursor-preview img")).toHaveAttribute("src", "/projects/vulshop-800.webp");
  });
});

describe("ProjectDetail route", () => {
  it("renders dedicated case study pages, updates document title, and links to the next project", async () => {
    render(
      <MemoryRouter initialEntries={["/projects/vulshop"]} future={routerFlags}>
        <PageLayout>
          <Routes>
            <Route path="/projects/:id" element={<ProjectDetail />} />
          </Routes>
        </PageLayout>
      </MemoryRouter>,
    );

    expect(document.title).toBe("1561 VULSHOP | Jay Esmalla");
    expect(screen.getByRole("heading", { level: 1, name: "1561 VULSHOP" })).toBeInTheDocument();
    expect(screen.getByText("Four-stage job queue & split payments")).toBeInTheDocument();
    const nextLink = screen.getByRole("link", { name: /NEXT CASE STUDY/i });
    expect(nextLink).toHaveAttribute("href", "/projects/aralytics");
    fireEvent.click(nextLink);
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Aralytics" })).toBeInTheDocument());
    expect(document.title).toBe("Aralytics | Jay Esmalla");
  });
});
