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
  vi.unstubAllGlobals();
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
  const animate = vi.fn((_frames: PropertyIndexedKeyframes, _options: KeyframeAnimationOptions) => ({ startTime: null as CSSNumberish | null, cancel: vi.fn() }));
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: start });
  Object.defineProperty(document.documentElement, "animate", { configurable: true, value: animate });
  return { start, animate, transition };
}
function portraitAt(top = 100) {
  const { container } = render(<figure className="portrait-frame" />);
  const frame = container.querySelector("figure")!;
  vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
    top, bottom: top + 320, left: 20, right: 260, width: 240, height: 320,
  } as DOMRect);
  return frame;
}
function triggerAt(left = 578, top = 378, width = 44, height = 44, icon = false) {
  const { container } = render(<button>{icon && <span className="theme-toggle-glyph" />}</button>);
  const trigger = container.querySelector("button")!;
  vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
    left, top, right: left + width, bottom: top + height, width, height,
  } as DOMRect);
  return trigger;
}
function viewport(width: number, height: number) {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("innerHeight", height);
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

describe("theme reveal from the toggle", () => {
  it("reveals the whole new page from the toggle center and cleans up after finishing", async () => {
    viewport(1200, 800);
    const { start, animate } = mockReveal();
    const update = vi.fn();
    const trigger = triggerAt();
    await revealTheme(trigger, update, false);
    expect(start).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledWith({ clipPath: ["circle(0px at 600px 400px)", "circle(724px at 600px 400px)"] }, expect.objectContaining({
      duration: 480, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "both", pseudoElement: "::view-transition-new(root)",
    }));
    expect(animate.mock.results[0].value.cancel).toHaveBeenCalledOnce();
    expect(trigger).not.toHaveAttribute("aria-busy");
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });
  it.each([
    { width: 1200, height: 500, left: 78, top: 58, x: 100, y: 80, radius: 1180 },
    { width: 300, height: 400, left: -80, top: -90, x: 0, y: 0, radius: 502 },
    { width: 300, height: 400, left: 350, top: 450, x: 300, y: 400, radius: 502 },
  ])("covers every corner of a $width×$height viewport, including offscreen origins", async ({ width, height, left, top, x, y, radius }) => {
    viewport(width, height);
    const { animate } = mockReveal();

    await revealTheme(triggerAt(left, top), vi.fn(), false);

    expect(animate).toHaveBeenCalledWith({ clipPath: [
      `circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`,
    ] }, expect.objectContaining({ pseudoElement: "::view-transition-new(root)" }));
  });
  it("changes instantly for reduced motion without starting the reveal", async () => {
    const { start } = mockReveal();
    const update = vi.fn();
    const trigger = triggerAt(578, 378, 44, 44, true);
    await revealTheme(trigger, update, true);
    expect(update).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
    expect(trigger.querySelector(".theme-toggle-glyph")).not.toHaveClass("theme-reveal-icon");
  });
  it("starts the root reveal and icon effects on the same animation clock", async () => {
    viewport(1200, 800);
    const { animate } = mockReveal();
    const timeline = { currentTime: 125 };
    Object.defineProperty(document, "timeline", { configurable: true, value: timeline });

    const trigger = triggerAt(578, 378, 44, 44, true);
    await revealTheme(trigger, vi.fn(), false);

    expect(animate.mock.calls.map(([, options]) => options.pseudoElement)).toEqual([
      "::view-transition-new(root)", "::view-transition-old(theme-icon)", "::view-transition-new(theme-icon)",
    ]);
    for (const [, options] of animate.mock.calls) expect(options).toMatchObject({ timeline });
    expect(animate.mock.results.map(({ value }) => value.startTime)).toEqual([125, 125, 125]);
    expect(trigger.querySelector(".theme-toggle-glyph")).not.toHaveClass("theme-reveal-icon");
  });
  it("keeps all snapshot animations until the reveal finishes, then releases their effects", async () => {
    let finish: () => void;
    const { animate } = mockReveal(new Promise<void>((resolve) => { finish = resolve; }));
    const trigger = triggerAt(578, 378, 44, 44, true);
    const pending = revealTheme(trigger, vi.fn(), false);
    await Promise.resolve();
    expect(animate).toHaveBeenCalledTimes(3);
    const animations = animate.mock.results.map(({ value }) => value);
    for (const animation of animations) expect(animation.cancel).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute("aria-busy", "true");

    finish!();
    await pending;

    for (const animation of animations) expect(animation.cancel).toHaveBeenCalledOnce();
    expect(trigger).not.toHaveAttribute("aria-busy");
    expect(trigger.querySelector(".theme-toggle-glyph")).not.toHaveClass("theme-reveal-icon");
  });
  it("uses the shorter radial reveal on mobile", async () => {
    viewport(390, 844);
    const { animate } = mockReveal();
    await revealTheme(triggerAt(328, 14), vi.fn(), false, { compact: true });
    expect(animate).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledWith({ clipPath: ["circle(0px at 350px 36px)", "circle(883px at 350px 36px)"] }, expect.objectContaining({
      duration: 400, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "both",
    }));
  });
  it.each([100, -400, 2000])("keeps the portrait inside the root reveal at vertical position %i", async (top) => {
    viewport(1200, 800);
    const { animate } = mockReveal();
    const portrait = portraitAt(top);
    await revealTheme(triggerAt(), vi.fn(), false);
    expect(animate).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledWith(expect.objectContaining({ clipPath: expect.any(Array) }), expect.objectContaining({ pseudoElement: "::view-transition-new(root)" }));
    expect(portrait.getBoundingClientRect).not.toHaveBeenCalled();
  });
  it("uses the button rectangle for a keyboard click instead of zero pointer coordinates", async () => {
    viewport(1200, 800);
    const { animate } = mockReveal();
    render(<Fixture />);
    const toggle = screen.getByRole("button", { name: "Switch to light mode" });
    vi.spyOn(toggle, "getBoundingClientRect").mockReturnValue({ left: 1078, top: 18, width: 44, height: 44, right: 1122, bottom: 62 } as DOMRect);
    toggle.focus();

    fireEvent.click(toggle, { detail: 0, clientX: 0, clientY: 0 });

    await waitFor(() => expect(animate).toHaveBeenCalled());
    expect(animate.mock.calls[0][0]).toEqual({ clipPath: ["circle(0px at 1100px 40px)", "circle(1340px at 1100px 40px)"] });
    expect(toggle).toHaveFocus();
    await waitFor(() => expect(document.documentElement).not.toHaveClass("theme-reveal"));
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
    const trigger = triggerAt(578, 378, 44, 44, true);
    await revealTheme(trigger, update, false);
    expect(update).toHaveBeenCalledOnce();
    expect(trigger.querySelector(".theme-toggle-glyph")).not.toHaveClass("theme-reveal-icon");
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });
  it("cleans up both snapshots if the browser rejects transition readiness", async () => {
    const { start, transition, animate } = mockReveal();
    start.mockImplementation((update: () => void) => {
      update();
      return { ...transition, ready: Promise.reject(new Error("snapshot skipped")) };
    });
    const trigger = triggerAt(578, 378, 44, 44, true);
    const update = vi.fn();

    await revealTheme(trigger, update, false);

    expect(update).toHaveBeenCalledOnce();
    expect(animate).not.toHaveBeenCalled();
    expect(transition.skipTransition).toHaveBeenCalledOnce();
    expect(trigger).not.toHaveAttribute("aria-busy");
    expect(trigger.querySelector(".theme-toggle-glyph")).not.toHaveClass("theme-reveal-icon");
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });
  it("cancels already created effects and preserves the committed theme if a later animation fails", async () => {
    const { animate, transition } = mockReveal();
    const rootAnimation = { startTime: null as CSSNumberish | null, cancel: vi.fn() };
    const oldIconAnimation = { startTime: null as CSSNumberish | null, cancel: vi.fn() };
    animate.mockImplementation(() => { throw new Error("animation unavailable"); });
    animate.mockReturnValueOnce(rootAnimation).mockReturnValueOnce(oldIconAnimation);
    const update = vi.fn();
    const trigger = triggerAt(578, 378, 44, 44, true);
    await revealTheme(trigger, update, false);
    expect(update).toHaveBeenCalledOnce();
    expect(transition.skipTransition).toHaveBeenCalledOnce();
    expect(rootAnimation.cancel).toHaveBeenCalledOnce();
    expect(oldIconAnimation.cancel).toHaveBeenCalledOnce();
    expect(trigger).not.toHaveAttribute("aria-busy");
    expect(trigger.querySelector(".theme-toggle-glyph")).not.toHaveClass("theme-reveal-icon");
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
  it("skips a reveal when viewport geometry changes and releases its resize listener", async () => {
    let finish: () => void;
    const { transition } = mockReveal(new Promise<void>((resolve) => { finish = resolve; }));
    const trigger = triggerAt(578, 378, 44, 44, true);
    const pending = revealTheme(trigger, vi.fn(), false);
    await Promise.resolve();
    expect(trigger.querySelector(".theme-toggle-glyph")).toHaveClass("theme-reveal-icon");

    window.dispatchEvent(new Event("resize"));

    expect(transition.skipTransition).toHaveBeenCalledOnce();
    finish!();
    await pending;
    expect(trigger).not.toHaveAttribute("aria-busy");
    expect(trigger.querySelector(".theme-toggle-glyph")).not.toHaveClass("theme-reveal-icon");
    expect(document.documentElement).not.toHaveClass("theme-reveal");
    window.dispatchEvent(new Event("resize"));
    expect(transition.skipTransition).toHaveBeenCalledOnce();
  });
});
