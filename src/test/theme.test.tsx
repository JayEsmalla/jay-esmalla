import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeSwitch from "@/components/ThemeSwitch";
import Portrait from "@/components/Portrait";
import { revealTheme } from "@/lib/theme";

const bootstrap = readFileSync(resolve("public/theme-init.js"), "utf8");
const originalTransition = Object.getOwnPropertyDescriptor(document, "startViewTransition");
const originalTimeline = Object.getOwnPropertyDescriptor(document, "timeline");
let darkPreference = false;
let systemListeners: Set<(query: MediaQueryList) => void>;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.head.innerHTML = '<meta name="theme-color" content="#101010">';
  darkPreference = false;
  systemListeners = new Set();
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    get matches() { return query === "(prefers-color-scheme: dark)" && darkPreference; },
    media: query, onchange: null,
    addListener: (listener) => systemListeners.add(listener),
    removeListener: (listener) => systemListeners.delete(listener),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList));
});
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); document.documentElement.className = ""; localStorage.clear();
  if (originalTransition) Object.defineProperty(document, "startViewTransition", originalTransition);
  else Reflect.deleteProperty(document, "startViewTransition");
  if (originalTimeline) Object.defineProperty(document, "timeline", originalTimeline);
  else Reflect.deleteProperty(document, "timeline");
  Reflect.deleteProperty(document.documentElement, "animate");
});
function initialize() { runInNewContext(bootstrap, { document, localStorage }); }
function Fixture() { return <ThemeProvider><ThemeSwitch /><input aria-label="Draft" defaultValue="A project enquiry" /></ThemeProvider>; }
function mockReveal(finished = Promise.resolve()) {
  const transition = { ready: Promise.resolve(), finished, updateCallbackDone: Promise.resolve(), skipTransition: vi.fn() };
  const start = vi.fn((update: () => void) => { update(); return transition; });
  const animate = vi.fn((_frames: PropertyIndexedKeyframes, _options: KeyframeAnimationOptions) => ({ startTime: null as CSSNumberish | null }));
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: start });
  Object.defineProperty(document.documentElement, "animate", { configurable: true, value: animate });
  return { start, animate, transition };
}
function visiblePortrait(name = "theme-portrait", top = 100) {
  const { container } = render(<figure className="portrait-frame" />);
  const frame = container.querySelector("figure")!;
  vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
    top, bottom: top + 320, left: 20, right: 260, width: 240, height: 320,
  } as DOMRect);
  vi.spyOn(window, "getComputedStyle").mockReturnValue({ viewTransitionName: name } as CSSStyleDeclaration);
  return frame;
}

describe("first paint", () => {
  it.each(["light", "dark"])("applies saved %s before React and the intro", (theme) => {
    localStorage.setItem("portfolio-theme", theme);
    initialize();
    expect(document.documentElement).toHaveClass(theme);
    expect(document.documentElement.style.colorScheme).toBe(theme);
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", theme === "light" ? "#f5f4f0" : "#101010");
  });
  it.each([null, "system", "invalid"])("uses the original dark theme for preference %s", (saved) => {
    if (saved) localStorage.setItem("portfolio-theme", saved);
    initialize();
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("portfolio-theme")).toBeNull();
  });
  it("still loads dark when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    initialize();
    expect(document.documentElement).toHaveClass("dark");
  });
});

describe("direct theme toggle", () => {
  it("switches in one click, remembers the choice, and preserves mounted content", async () => {
    render(<Fixture />);
    const input = screen.getByRole("textbox", { name: "Draft" });
    fireEvent.change(input, { target: { value: "Keep this draft" } });
    const toggle = screen.getByRole("button", { name: "Switch to light mode" });
    toggle.focus();
    fireEvent.click(toggle);
    await waitFor(() => expect(document.documentElement).toHaveClass("light"));
    expect(localStorage.getItem("portfolio-theme")).toBe("light");
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
    expect(input).toHaveValue("Keep this draft");
    expect(toggle).toHaveFocus();
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", "#f5f4f0");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(localStorage.getItem("portfolio-theme")).toBe("dark");
  });
  it("does not follow device preference changes", async () => {
    render(<Fixture />);
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    darkPreference = false;
    act(() => systemListeners.forEach((listener) => listener(window.matchMedia("(prefers-color-scheme: dark)"))));
    expect(document.documentElement).toHaveClass("dark");
  });
  it("synchronizes another tab's selection", async () => {
    render(<Fixture />);
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: "portfolio-theme", newValue: "light" })));
    await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  });
  it("allows toggling even if saving preferences fails", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    render(<Fixture />);
    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  });
});

describe("synchronized theme fade", () => {
  it("fades the new page without a clip-path wipe and cleans up after finishing", async () => {
    const { start, animate } = mockReveal();
    const update = vi.fn();
    await revealTheme(document.createElement("button"), update, false);
    expect(start).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledWith({ opacity: [0, 1] }, expect.objectContaining({ duration: 260, pseudoElement: "::view-transition-new(root)" }));
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });
  it("changes instantly for reduced motion without starting the reveal", async () => {
    const { start } = mockReveal();
    const update = vi.fn();
    await revealTheme(document.createElement("button"), update, true);
    expect(update).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
  });
  it("starts the page and visible portrait fades together with identical timing", async () => {
    const { animate } = mockReveal();
    visiblePortrait();
    const timeline = { currentTime: 125 };
    Object.defineProperty(document, "timeline", { configurable: true, value: timeline });

    await revealTheme(document.createElement("button"), vi.fn(), false);

    expect(animate.mock.calls).toEqual([
      [{ opacity: [0, 1] }, { duration: 260, easing: "cubic-bezier(.22, 1, .36, 1)", pseudoElement: "::view-transition-new(root)", timeline }],
      [{ opacity: [0, 1] }, { duration: 260, easing: "cubic-bezier(.22, 1, .36, 1)", pseudoElement: "::view-transition-new(theme-portrait)", timeline }],
    ]);
    expect(animate.mock.results.map(({ value }) => value.startTime)).toEqual([125, 125]);
  });
  it("uses the same shorter fade for page and portrait on mobile", async () => {
    const { animate } = mockReveal();
    visiblePortrait();
    await revealTheme(document.createElement("button"), vi.fn(), false, { compact: true });
    expect(animate).toHaveBeenCalledTimes(2);
    for (const [frames, options] of animate.mock.calls) {
      expect(frames).toEqual({ opacity: [0, 1] });
      expect(options).toMatchObject({ duration: 220, easing: "cubic-bezier(.22, 1, .36, 1)" });
    }
  });
  it.each([["none", 100], ["theme-portrait", -400], ["theme-portrait", 2000]])("only fades the root for unnamed or offscreen portraits (%s, %i)", async (name, top) => {
    const { animate } = mockReveal();
    visiblePortrait(name, top);
    await revealTheme(document.createElement("button"), vi.fn(), false);
    expect(animate).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledWith({ opacity: [0, 1] }, expect.objectContaining({ pseudoElement: "::view-transition-new(root)" }));
  });
  it("starts on click without waiting for or decoding an unready image", async () => {
    const { start } = mockReveal();
    render(<ThemeProvider><ThemeSwitch /><Portrait /></ThemeProvider>);
    const light = document.querySelector<HTMLImageElement>('[data-theme-portrait="light"]')!;
    const decode = vi.fn(() => new Promise<void>(() => {}));
    Object.defineProperty(light, "decode", { configurable: true, value: decode });

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    expect(start).toHaveBeenCalledOnce();
    expect(document.documentElement).toHaveClass("light");
    expect(decode).not.toHaveBeenCalled();
    await waitFor(() => expect(document.documentElement).not.toHaveClass("theme-reveal"));
  });
  it("captures the matching portrait and palette together, keeping both image nodes mounted", async () => {
    const { start } = mockReveal();
    render(<ThemeProvider><ThemeSwitch /><Portrait /></ThemeProvider>);
    const figure = screen.getByRole("figure", { name: "Portrait of Jay Factolarin Esmalla" });
    const images = Array.from(figure.querySelectorAll("img"));
    await act(async () => { images.forEach((image) => fireEvent.load(image)); });
    start.mockImplementation((update: () => void) => {
      update();
      expect(document.documentElement).toHaveClass("light");
      expect(figure).toHaveAttribute("data-portrait-theme", "light");
      expect(figure.querySelector('[data-theme-portrait="light"]')).toHaveAttribute("data-portrait-state", "ready");
      return { ready: Promise.resolve(), finished: Promise.resolve(), updateCallbackDone: Promise.resolve(), skipTransition: vi.fn() };
    });
    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    await waitFor(() => expect(start).toHaveBeenCalledOnce());
    expect(Array.from(figure.querySelectorAll("img"))).toEqual(images);
    await waitFor(() => expect(document.documentElement).not.toHaveClass("theme-reveal"));
  });
  it("falls back when snapshot creation fails", async () => {
    const { start } = mockReveal();
    start.mockImplementation(() => { throw new Error("snapshot unavailable"); });
    const update = vi.fn();
    await revealTheme(document.createElement("button"), update, false);
    expect(update).toHaveBeenCalledOnce();
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });
  it("cleans up and preserves the committed theme when animation creation fails", async () => {
    const { animate, transition } = mockReveal();
    animate.mockImplementation(() => { throw new Error("animation unavailable"); });
    const update = vi.fn();
    const trigger = document.createElement("button");
    await revealTheme(trigger, update, false);
    expect(update).toHaveBeenCalledOnce();
    expect(transition.skipTransition).toHaveBeenCalledOnce();
    expect(trigger).not.toHaveAttribute("aria-busy");
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });
  it("commits immediately when view transitions are unsupported", async () => {
    Reflect.deleteProperty(document, "startViewTransition");
    const update = vi.fn();
    const trigger = document.createElement("button");
    const pending = revealTheme(trigger, update, false);
    expect(update).toHaveBeenCalledOnce();
    expect(trigger).not.toHaveAttribute("aria-busy");
    await pending;
  });
  it("ignores rapid repeat clicks until the current reveal has finished", async () => {
    let finish: () => void;
    mockReveal(new Promise<void>((resolve) => { finish = resolve; }));
    const update = vi.fn();
    const first = revealTheme(document.createElement("button"), update, false);
    await Promise.resolve();
    await revealTheme(document.createElement("button"), update, false);
    expect(update).toHaveBeenCalledOnce();
    finish!();
    await first;
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });
});
