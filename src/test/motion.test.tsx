import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Link, Routes, Route, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PageTransition, { PageEntrance } from "@/components/PageTransition";
import PageLayout from "@/components/PageLayout";
import { ScrollToHash } from "@/App";
import { useReveal, PageEntranceContext } from "@/lib/motion";

beforeEach(() => vi.stubGlobal("scrollTo", vi.fn()));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function Fixture() {
  const location = useLocation();
  return <><ScrollToHash /><PageLayout>
    <Link to="/projects">Projects route</Link>
    <Link to="/contact">Contact route</Link>
    <Link to="/#detail">Home section</Link>
    <PageTransition><PageEntrance><Routes location={location}>
      <Route path="/" element={<section id="detail"><h1>Home content</h1></section>} />
      <Route path="/projects" element={<h1>Projects content</h1>} />
      <Route path="/contact" element={<h1>Contact content</h1>} />
    </Routes></PageEntrance></PageTransition>
  </PageLayout></>;
}

describe("shared motion and navigation", () => {
  it("preserves the shell and focuses the incoming page after the outgoing page exits", async () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Fixture /></MemoryRouter>);
    const header = screen.getByRole("banner");
    fireEvent.click(screen.getByRole("link", { name: "Projects route" }));
    expect(document.querySelector('[data-route-path="/"]')).toHaveAttribute("inert");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Projects content" })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("heading", { name: "Projects content" })).toHaveFocus());
    expect(screen.getByRole("banner")).toBe(header);
    expect(document.querySelectorAll("[data-route-path]")).toHaveLength(1);
  });

  it("keeps the same page mounted for hash navigation", async () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Fixture /></MemoryRouter>);
    const page = document.querySelector("[data-route-path]");
    fireEvent.click(screen.getByRole("link", { name: "Home section" }));
    expect(document.querySelector("[data-route-path]")).toBe(page);
    expect(page).not.toHaveAttribute("data-route-exiting");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Home content" })).toHaveFocus());
  });

  it("settles on the latest destination during rapid navigation", async () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Fixture /></MemoryRouter>);
    fireEvent.click(screen.getByRole("link", { name: "Projects route" }));
    fireEvent.click(screen.getByRole("link", { name: "Contact route" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Contact content" })).toHaveFocus());
    expect(screen.queryByRole("heading", { name: "Projects content" })).not.toBeInTheDocument();
    expect(document.querySelectorAll("main")).toHaveLength(1);
  });

  it("removes reveals when reduced motion changes and shortens movement on mobile", () => {
    let reduced = false;
    const listeners = new Set<() => void>();
    const originalMatchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...originalMatchMedia(query),
      matches: query.includes("reduced") ? reduced : true,
      addEventListener: (_: string, listener: () => void) => { listeners.add(listener); },
      removeEventListener: (_: string, listener: () => void) => { listeners.delete(listener); },
    }) as unknown as MediaQueryList);
    const { result } = renderHook(() => useReveal());
    expect(result.current(8).initial).toEqual({ opacity: 0, y: 6 });
    expect(result.current(8).transition).toMatchObject({ delay: 0.09 });
    act(() => { reduced = true; listeners.forEach((notify) => notify()); });
    expect(result.current().initial).toBe(false);
    expect(result.current().transition).toMatchObject({ duration: 0, delay: 0 });
  });

  it("avoids stacking section entrances onto a page entrance", () => {
    const { result } = renderHook(() => useReveal(), {
      wrapper: ({ children }) => <PageEntranceContext.Provider value>{children}</PageEntranceContext.Provider>,
    });
    expect(result.current().initial).toBe(false);
    expect(result.current().transition).toMatchObject({ duration: 0, delay: 0 });
  });
});
