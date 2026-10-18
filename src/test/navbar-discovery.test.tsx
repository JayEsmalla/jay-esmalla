import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "@/components/Navbar";

const sectionIds = ["home", "projects", "about", "github", "certifications", "contact"];
const routerFlags = { v7_startTransition: true, v7_relativeSplatPath: true };
const originalIntersectionObserver = window.IntersectionObserver;
let intersectionCallback: IntersectionObserverCallback;
let observeSection: ReturnType<typeof vi.fn>;
let disconnectSections: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observeSection = vi.fn();
  disconnectSections = vi.fn();
  window.IntersectionObserver = class {
    observe = observeSection;
    disconnect = disconnectSections;
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = "";
    thresholds = [];
    constructor(callback: IntersectionObserverCallback) { intersectionCallback = callback; }
  };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.IntersectionObserver = originalIntersectionObserver;
});

const flushMutations = () => act(async () => { await Promise.resolve(); });

function HomeSections({ excludeContact = false }: { excludeContact?: boolean }) {
  return <main>{sectionIds.filter((id) => !excludeContact || id !== "contact").map((id) => <section id={id} key={id} />)}</main>;
}

function RouteFixture() {
  const location = useLocation();
  return <>
    <Navbar />
    {location.pathname === "/" && <HomeSections />}
    <Link to="/projects">Open collection</Link>
    <Link to="/">Return home</Link>
  </>;
}

function TransitionFixture({ previousPath, exiting }: { previousPath: string; exiting: boolean }) {
  const [homeReady, setHomeReady] = useState(false);
  return <>
    <Navbar />
    <div data-testid="previous-route" data-route-path={previousPath} data-route-exiting={exiting || undefined}>
      <section id="projects" />
      <section id="github" />
    </div>
    {homeReady && <div data-testid="home-route" data-route-path="/"><HomeSections /></div>}
    <Link to="/">Return home</Link>
    <button onClick={() => setHomeReady(true)}>Mount home</button>
  </>;
}

describe("navbar section discovery", () => {
  it("stops discovery after finding every home anchor while keeping active-section tracking", async () => {
    const disconnectDiscovery = vi.spyOn(MutationObserver.prototype, "disconnect");
    const findSection = vi.spyOn(document, "getElementById");
    render(<MemoryRouter future={routerFlags}><Navbar /><HomeSections /></MemoryRouter>);

    expect(observeSection).toHaveBeenCalledTimes(sectionIds.length);
    expect(disconnectDiscovery).toHaveBeenCalledOnce();
    expect(disconnectSections).not.toHaveBeenCalled();
    const discoveryCalls = findSection.mock.calls.length;

    act(() => {
      intersectionCallback([{ isIntersecting: true, intersectionRatio: 0.6, target: document.querySelector("#projects") } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(within(screen.getByRole("navigation", { name: "Primary navigation" })).getByRole("link", { name: "WORK" })).toHaveAttribute("aria-current", "location");
    document.querySelector("main")?.appendChild(document.createElement("div"));
    await flushMutations();
    expect(findSection).toHaveBeenCalledTimes(discoveryCalls);
  });

  it("keeps discovering only missing lazy anchors, then disconnects when the last appears", async () => {
    const disconnectDiscovery = vi.spyOn(MutationObserver.prototype, "disconnect");
    const findSection = vi.spyOn(document, "getElementById");
    render(<MemoryRouter future={routerFlags}><Navbar /><HomeSections excludeContact /></MemoryRouter>);
    expect(observeSection).toHaveBeenCalledTimes(5);
    expect(disconnectDiscovery).not.toHaveBeenCalled();
    findSection.mockClear();

    document.querySelector("main")?.appendChild(document.createElement("div"));
    await flushMutations();
    expect(findSection.mock.calls.map(([id]) => id)).toEqual(["contact"]);

    const contact = document.createElement("section");
    contact.id = "contact";
    document.querySelector("main")?.appendChild(contact);
    await flushMutations();
    expect(observeSection).toHaveBeenLastCalledWith(contact);
    expect(observeSection).toHaveBeenCalledTimes(sectionIds.length);
    expect(disconnectDiscovery).toHaveBeenCalledOnce();
    const discoveryCalls = findSection.mock.calls.length;
    document.querySelector("main")?.appendChild(document.createElement("div"));
    await flushMutations();
    expect(findSection).toHaveBeenCalledTimes(discoveryCalls);
  });

  it("cleans up section tracking on route departure and discovers new home nodes on return", () => {
    render(<MemoryRouter future={routerFlags}><RouteFixture /></MemoryRouter>);
    const previousContact = document.querySelector("#contact");
    expect(observeSection).toHaveBeenCalledTimes(sectionIds.length);

    fireEvent.click(screen.getByRole("link", { name: "Open collection" }));
    expect(disconnectSections).toHaveBeenCalledOnce();
    expect(document.querySelector("#contact")).not.toBeInTheDocument();
    observeSection.mockClear();

    fireEvent.click(screen.getByRole("link", { name: "Return home" }));
    const nextContact = document.querySelector("#contact");
    expect(nextContact).not.toBe(previousContact);
    expect(observeSection).toHaveBeenCalledTimes(sectionIds.length);
    expect(observeSection).toHaveBeenCalledWith(nextContact);
  });

  it.each([
    { previousPath: "/projects", exiting: false },
    { previousPath: "/", exiting: true },
  ])("ignores anchors in a stale $previousPath route (exiting=$exiting) until home enters", async (route) => {
    const disconnectDiscovery = vi.spyOn(MutationObserver.prototype, "disconnect");
    render(<MemoryRouter initialEntries={["/projects"]} future={routerFlags}><TransitionFixture {...route} /></MemoryRouter>);
    const previousProjects = screen.getByTestId("previous-route").querySelector("#projects");
    fireEvent.click(screen.getByRole("link", { name: "Return home" }));
    await flushMutations();
    expect(observeSection).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Mount home" }));
    await flushMutations();
    const homeFrame = screen.getByTestId("home-route");
    expect(observeSection).toHaveBeenCalledTimes(sectionIds.length);
    expect(observeSection.mock.calls.some(([section]) => section === previousProjects)).toBe(false);
    expect(observeSection.mock.calls.every(([section]) => homeFrame.contains(section))).toBe(true);
    expect(disconnectDiscovery).toHaveBeenCalledOnce();
  });
});
