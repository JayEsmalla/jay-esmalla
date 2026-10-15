import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import IntroScreen from "@/components/IntroScreen";
import { shouldPlayIntro } from "@/lib/intro";

vi.mock("@/pages/Index", () => ({
  default: ({ heroReady }: { heroReady: boolean }) => (
    <section>
      <h1 data-ready={heroReady}>Portfolio hero</h1>
      <a href="/#projects">View work</a>
    </section>
  ),
}));

beforeEach(() => {
  vi.useFakeTimers();
  window.history.replaceState({}, "", "/");
  sessionStorage.clear();
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  window.history.replaceState({}, "", "/");
  sessionStorage.clear();
});

describe("intro entry policy", () => {
  it("plays only on a first ordinary homepage entry", () => {
    expect(shouldPlayIntro()).toBe(true);
    sessionStorage.setItem("intro-seen", "1");
    expect(shouldPlayIntro()).toBe(false);
    sessionStorage.clear();
    for (const destination of ["/projects", "/certifications", "/contact", "/#projects"]) {
      window.history.replaceState({}, "", destination);
      expect(shouldPlayIntro()).toBe(false);
    }
  });

  it("honors reduced motion even when session storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    expect(shouldPlayIntro()).toBe(true);
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    expect(shouldPlayIntro()).toBe(false);
  });
});

describe("intro lifecycle", () => {
  it("holds the hero until the soft handoff, then restores access and remembers completion", () => {
    document.body.style.overflow = "auto";
    render(<StrictMode><App /></StrictMode>);
    const main = document.getElementById("main-content")!;
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(main.closest("[inert]")).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog")).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Portfolio hero" })).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1699); });
    expect(main.querySelector("h1")).toHaveAttribute("data-ready", "false");
    act(() => { vi.advanceTimersByTime(1); });
    expect(main.querySelector("h1")).toHaveAttribute("data-ready", "true");
    expect(main.closest("[inert]")).not.toBeNull();
    act(() => { vi.advanceTimersByTime(700); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(main.closest("[inert]")).toBeNull();
    expect(main).toHaveFocus();
    expect(document.body.style.overflow).toBe("auto");
    expect(sessionStorage.getItem("intro-seen")).toBe("1");
    document.body.style.overflow = "";
  });

  it.each(["Tab", "Escape"])("allows immediate %s continuation and prevents a later duplicate completion", (key) => {
    const onComplete = vi.fn();
    const onReveal = vi.fn();
    render(<IntroScreen onComplete={onComplete} onReveal={onReveal} />);
    expect(screen.getByRole("dialog")).toHaveFocus();
    fireEvent.keyDown(window, { key });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onReveal).not.toHaveBeenCalled();
  });

  it("cancels callbacks on early unmount", () => {
    const onComplete = vi.fn();
    const onReveal = vi.fn();
    const { unmount } = render(<IntroScreen onComplete={onComplete} onReveal={onReveal} />);
    unmount();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onReveal).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("restores the previous scroll setting when the app unmounts mid-intro", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(<App />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });

  it("dismisses the intro when reduced motion is enabled mid-sequence", () => {
    let reduced = false;
    let onChange: () => void;
    vi.spyOn(window, "matchMedia").mockReturnValue({
      get matches() { return reduced; },
      addEventListener: (_event: string, callback: () => void) => { onChange = callback; },
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    const onComplete = vi.fn();
    render(<IntroScreen onComplete={onComplete} onReveal={vi.fn()} />);
    reduced = true;
    act(() => { onChange(); });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("still releases the page when session storage cannot be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    render(<App />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector("[inert]")).toBeNull();
    expect(document.getElementById("main-content")).toHaveFocus();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
