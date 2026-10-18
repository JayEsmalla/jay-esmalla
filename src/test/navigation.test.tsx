import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Profiler, useState } from "react";
import { Link, MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollToHash } from "@/App";
import Navbar from "@/components/Navbar";
import PageLayout from "@/components/PageLayout";

const routerFlags = { v7_startTransition: true, v7_relativeSplatPath: true };
const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollTo = vi.fn();
  vi.stubGlobal("scrollTo", scrollTo);
  vi.stubGlobal("scrollY", 0);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(4000);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    const top = this.id === "contact" || this.id === "projects" ? 1000 - window.scrollY : 0;
    const height = this.tagName === "HEADER" ? 72 : 500;
    return { x: 0, y: top, top, bottom: top + height, left: 0, right: 1000, width: 1000, height, toJSON: () => ({}) };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (scrollIntoViewDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scrollIntoViewDescriptor);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

function DelayedSection() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <ScrollToHash />
      <header />
      <main id="main-content" tabIndex={-1}>
        <button onClick={() => setReady(true)}>Load contact</button>
        {ready && <section id="contact"><h2>Contact destination</h2></section>}
      </main>
    </>
  );
}

function NavigationFixture() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <ScrollToHash />
      <header />
      <main id="main-content" tabIndex={-1}>
        <h1>{location.pathname === "/" ? "Home page" : "Contact page"}</h1>
        <section id="contact"><h2>Contact destination</h2></section>
        <Link to="/#contact">Jump to contact</Link>
        <Link to="/contact">Open contact page</Link>
        <button onClick={() => navigate(-1)}>Go back</button>
      </main>
    </>
  );
}

function StaggeredSections() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <ScrollToHash />
      <header />
      <main id="main-content" tabIndex={-1}>
        <button onClick={() => setReady(true)}>Load earlier section</button>
        {ready ? <section id="about">About content</section> : <div data-section-loading />}
        <section id="contact"><h2>Contact destination</h2></section>
      </main>
    </>
  );
}

describe("portfolio navigation", () => {
  it("waits for a lazy hash destination and focuses its heading", async () => {
    render(<MemoryRouter initialEntries={["/#contact"]} future={routerFlags}><DelayedSection /></MemoryRouter>);
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 250)); });
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Load contact" }));
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 908, behavior: "smooth" }));
    expect(screen.getByRole("heading", { name: "Contact destination" })).toHaveFocus();
  });

  it("navigates again when the current hash link is selected", async () => {
    render(<MemoryRouter initialEntries={["/#contact"]} future={routerFlags}><NavigationFixture /></MemoryRouter>);
    await waitFor(() => expect(scrollTo).toHaveBeenCalledOnce());
    const link = screen.getByRole("link", { name: "Jump to contact" });
    link.focus();
    fireEvent.click(link);
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("heading", { name: "Contact destination" })).toHaveFocus();
  });

  it("waits for earlier lazy sections even when the hash target is already mounted", async () => {
    render(<MemoryRouter initialEntries={["/#contact"]} future={routerFlags}><StaggeredSections /></MemoryRouter>);
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 50)); });
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Load earlier section" }));
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 908, behavior: "smooth" }));
    expect(screen.getByRole("heading", { name: "Contact destination" })).toHaveFocus();
  });

  it("does not jump to a delayed anchor after the visitor starts interacting", async () => {
    render(<MemoryRouter initialEntries={["/#contact"]} future={routerFlags}><StaggeredSections /></MemoryRouter>);
    fireEvent.wheel(window);
    fireEvent.click(screen.getByRole("button", { name: "Load earlier section" }));
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 50)); });
    expect(scrollTo).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Contact destination" })).not.toHaveFocus();
  });

  it("restores the previous reading position when going Back", async () => {
    render(<MemoryRouter future={routerFlags}><NavigationFixture /></MemoryRouter>);
    await waitFor(() => expect(scrollTo).toHaveBeenCalledOnce());
    vi.stubGlobal("scrollY", 740);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("link", { name: "Open contact page" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Contact page" })).toHaveFocus());
    vi.stubGlobal("scrollY", 0);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    await waitFor(() => expect(scrollTo).toHaveBeenLastCalledWith({ top: 740, behavior: "instant" }));
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("honors reduced motion for section navigation", async () => {
    const originalMatchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ ...originalMatchMedia(query), matches: true }));
    render(<MemoryRouter initialEntries={["/#contact"]} future={routerFlags}><NavigationFixture /></MemoryRouter>);
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 908, behavior: "instant" }));
  });

  it("restores a shortened page promptly and stops following height changes after interaction", async () => {
    render(<MemoryRouter future={routerFlags}><NavigationFixture /></MemoryRouter>);
    await waitFor(() => expect(scrollTo).toHaveBeenCalledOnce());
    vi.stubGlobal("scrollY", 740);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("link", { name: "Open contact page" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Contact page" })).toHaveFocus());
    vi.stubGlobal("scrollY", 0);
    const height = vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(1000);
    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    await waitFor(() => expect(scrollTo).toHaveBeenLastCalledWith({ top: 1000 - window.innerHeight, behavior: "instant" }));
    vi.stubGlobal("scrollY", 180);
    fireEvent.wheel(window);
    const callsAfterInteraction = scrollTo.mock.calls.length;
    height.mockReturnValue(4000);
    const loadedContent = document.createElement("div");
    screen.getByRole("main").appendChild(loadedContent);
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 50)); });
    expect(scrollTo).toHaveBeenCalledTimes(callsAfterInteraction);
  });

  it("closes mobile navigation for its current destination and returns Escape focus", async () => {
    render(
      <MemoryRouter initialEntries={["/#projects"]} future={routerFlags}>
        <ScrollToHash />
        <Navbar />
        <main id="main-content" tabIndex={-1}><section id="projects"><h2>Selected work</h2></section></main>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByRole("heading", { name: "Selected work" })).toHaveFocus());
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const menu = screen.getByRole("navigation", { name: "Mobile navigation" });
    expect(within(menu).getByRole("link", { name: "WORK" })).toHaveFocus();
    fireEvent.click(within(menu).getByRole("link", { name: "WORK" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Selected work" })).toHaveFocus());
    await waitFor(() => expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  });

  it("updates reading progress without rerendering navigation throughout a scroll", async () => {
    const onRender = vi.fn();
    render(
      <MemoryRouter future={routerFlags}>
        <Profiler id="navigation" onRender={onRender}><Navbar /></Profiler>
      </MemoryRouter>,
    );
    const header = screen.getByRole("banner");
    const progress = header.querySelector<HTMLElement>(".origin-left");

    vi.stubGlobal("scrollY", 160);
    fireEvent.scroll(window);
    await waitFor(() => expect(header).toHaveClass("bg-carbon/95"));
    const rendersAfterThreshold = onRender.mock.calls.length;

    vi.stubGlobal("scrollY", 480);
    fireEvent.scroll(window);
    await waitFor(() => expect(progress?.style.transform).toBe(`scaleX(${480 / (4000 - window.innerHeight)})`));
    expect(onRender).toHaveBeenCalledTimes(rendersAfterThreshold);

    vi.stubGlobal("scrollY", 900);
    fireEvent.scroll(window);
    await waitFor(() => expect(progress?.style.transform).toBe(`scaleX(${900 / (4000 - window.innerHeight)})`));
    expect(onRender).toHaveBeenCalledTimes(rendersAfterThreshold);

    vi.stubGlobal("scrollY", 0);
    fireEvent.scroll(window);
    await waitFor(() => expect(header).toHaveClass("bg-obsidian/90"));
  });

  it("lets keyboard visitors skip repeated navigation", () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    render(<MemoryRouter future={routerFlags}><PageLayout><h1>Portfolio</h1></PageLayout></MemoryRouter>);
    fireEvent.click(screen.getByRole("link", { name: "Skip to content" }));
    expect(screen.getByRole("main")).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "instant" });
  });

  it("replaces route metadata instead of leaving descriptions from the previous page", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]} future={routerFlags}>
        <PageLayout>
          <Link to="/contact">Contact route</Link>
          <Link to="/missing">Missing route</Link>
          <Link to="/">Home route</Link>
        </PageLayout>
      </MemoryRouter>,
    );
    expect(document.title).toBe("Projects | Jay Factolarin Esmalla");
    fireEvent.click(screen.getByRole("link", { name: "Contact route" }));
    expect(document.title).toBe("Contact | Jay Factolarin Esmalla");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", expect.stringContaining("Contact Jay"));
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute("content", document.title);
    expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute("content")).toBe(
      document.querySelector('meta[name="description"]')?.getAttribute("content"),
    );
    fireEvent.click(screen.getByRole("link", { name: "Missing route" }));
    expect(document.title).toBe("Page Not Found | Jay Factolarin Esmalla");
    fireEvent.click(screen.getByRole("link", { name: "Home route" }));
    expect(document.title).toBe("Jay Factolarin Esmalla | Developer Portfolio");
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute("content", document.title);
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });
});
