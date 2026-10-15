import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeSwitch from "@/components/ThemeSwitch";
import { revealTheme } from "@/lib/theme";

const bootstrap = readFileSync(resolve("public/theme-init.js"), "utf8");
const originalTransition = Object.getOwnPropertyDescriptor(document, "startViewTransition");
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
  Reflect.deleteProperty(document.documentElement, "animate");
});
function initialize() { runInNewContext(bootstrap, { document, localStorage }); }
function Fixture() { return <ThemeProvider><ThemeSwitch /><input aria-label="Draft" defaultValue="A project enquiry" /></ThemeProvider>; }
function mockReveal(finished = Promise.resolve()) {
  const transition = { ready: Promise.resolve(), finished, updateCallbackDone: Promise.resolve(), skipTransition: vi.fn() };
  const start = vi.fn((update: () => void) => { update(); return transition; });
  const animate = vi.fn();
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: start });
  Object.defineProperty(document.documentElement, "animate", { configurable: true, value: animate });
  return { start, animate, transition };
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
    expect(document.documentElement).toHaveClass("dark");
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

describe("circular theme reveal", () => {
  it("reveals the new view from the control and cleans up after finishing", async () => {
    const { start, animate } = mockReveal();
    const update = vi.fn();
    await revealTheme(document.createElement("button"), update, false);
    expect(start).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledWith(expect.objectContaining({ clipPath: expect.any(Array) }), expect.objectContaining({ duration: 500, pseudoElement: "::view-transition-new(root)" }));
    expect(document.documentElement).not.toHaveClass("theme-reveal");
  });
  it("changes instantly for reduced motion without starting the reveal", async () => {
    const { start } = mockReveal();
    const update = vi.fn();
    await revealTheme(document.createElement("button"), update, true);
    expect(update).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
  });
  it("falls back when snapshot creation fails", async () => {
    const { start } = mockReveal();
    start.mockImplementation(() => { throw new Error("snapshot unavailable"); });
    const update = vi.fn();
    await revealTheme(document.createElement("button"), update, false);
    expect(update).toHaveBeenCalledOnce();
    expect(document.documentElement).not.toHaveClass("theme-reveal");
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
