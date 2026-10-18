import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Portrait from "@/components/Portrait";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeSwitch from "@/components/ThemeSwitch";

// Use the production visibility rules to detect a wrong-theme image or empty frame.
const portraitCss = readFileSync(resolve("src/index.css"), "utf8").match(/\.portrait-image\s*\{[^}]+\}[\s\S]*?(?=\.portrait-caption)/)?.[0] ?? "";
let style: HTMLStyleElement;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "dark";
  style = document.createElement("style");
  style.textContent = portraitCss;
  document.head.append(style);
});

afterEach(() => {
  cleanup();
  style.remove();
  localStorage.clear();
  document.documentElement.className = "";
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function Fixture() { return <ThemeProvider><ThemeSwitch /><Portrait /></ThemeProvider>; }

function setup() {
  const view = render(<Fixture />);
  const frame = screen.getByRole("figure", { name: "Portrait of Jay Factolarin Esmalla" });
  const dark = frame.querySelector<HTMLImageElement>('[data-theme-portrait="dark"]')!;
  const light = frame.querySelector<HTMLImageElement>('[data-theme-portrait="light"]')!;
  return { ...view, frame, dark, light };
}

function decodeWith(image: HTMLImageElement, implementation: () => Promise<void>) {
  const decode = vi.fn(implementation);
  Object.defineProperty(image, "decode", { configurable: true, value: decode });
  return decode;
}

async function load(image: HTMLImageElement) {
  await act(async () => { fireEvent.load(image); });
}

describe("theme portrait", () => {
  it("removes the portrait toggle and keeps both equal image frames mounted across theme changes", async () => {
    const { frame, dark, light } = setup();
    const decodeDark = decodeWith(dark, () => Promise.resolve());
    const decodeLight = decodeWith(light, () => Promise.resolve());
    await load(dark);
    await load(light);

    expect(within(frame).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText(/alter ego|gun park/i)).not.toBeInTheDocument();
    expect(dark).toHaveAttribute("src", "/profile.webp");
    expect(light).toHaveAttribute("src", "/white-ver.jpg");
    expect(dark.width).toBe(light.width);
    expect(dark.height).toBe(light.height);
    expect(dark).toHaveAttribute("loading", "eager");
    expect(light).toHaveAttribute("loading", "eager");
    expect(dark).toHaveAttribute("fetchpriority", "high");
    expect(light).toHaveAttribute("fetchpriority", "high");
    expect(frame).toHaveAttribute("data-portrait-theme", "dark");
    expect(getComputedStyle(dark).opacity).toBe("1");
    expect(getComputedStyle(light).opacity).toBe("0");

    fireEvent.mouseEnter(frame);
    fireEvent.click(frame);
    fireEvent.mouseLeave(frame);
    expect(frame).toHaveAttribute("data-portrait-theme", "dark");

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    await waitFor(() => expect(frame).toHaveAttribute("data-portrait-theme", "light"));
    expect(document.documentElement).toHaveClass("light");
    expect(frame.querySelector('[data-theme-portrait="dark"]')).toBe(dark);
    expect(frame.querySelector('[data-theme-portrait="light"]')).toBe(light);
    expect(getComputedStyle(dark).opacity).toBe("0");
    expect(getComputedStyle(light).opacity).toBe("1");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    await waitFor(() => expect(frame).toHaveAttribute("data-portrait-theme", "dark"));
    expect(document.documentElement).toHaveClass("dark");
    expect(frame.querySelector('[data-theme-portrait="light"]')).toBe(light);
    expect(decodeDark).toHaveBeenCalledTimes(1);
    expect(decodeLight).toHaveBeenCalledTimes(1);
  });

  it("restores the light portrait when the saved theme is reloaded", async () => {
    localStorage.setItem("portfolio-theme", "light");
    const first = setup();
    expect(first.frame).toHaveAttribute("data-portrait-theme", "light");
    expect(first.light).toHaveAttribute("fetchpriority", "high");
    first.unmount();

    const reloaded = setup();
    decodeWith(reloaded.light, () => Promise.resolve());
    await load(reloaded.light);

    expect(document.documentElement).toHaveClass("light");
    expect(reloaded.frame).toHaveAttribute("data-portrait-theme", "light");
    expect(reloaded.light).toHaveAttribute("data-portrait-state", "ready");
    expect(getComputedStyle(reloaded.light).opacity).toBe("1");
    expect(getComputedStyle(reloaded.dark).opacity).toBe("0");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("changes the palette immediately and reveals the selected portrait when decoding completes", async () => {
    const { frame, dark, light } = setup();
    decodeWith(dark, () => Promise.resolve());
    await load(dark);
    let finishDecode!: () => void;
    const decoding = new Promise<void>((resolve) => { finishDecode = resolve; });
    decodeWith(light, () => decoding);
    await load(light);

    const toggle = screen.getByRole("button", { name: "Switch to light mode" });
    fireEvent.click(toggle);
    expect(toggle).not.toHaveAttribute("aria-busy");
    expect(document.documentElement).toHaveClass("light");
    expect(frame).toHaveAttribute("data-portrait-theme", "light");
    expect(light).toHaveAttribute("data-portrait-state", "loading");
    expect(getComputedStyle(dark).opacity).toBe("0");
    expect(getComputedStyle(light).opacity).toBe("0");
    expect(within(frame).getByRole("status")).toHaveTextContent("JELoading portrait");
    expect(within(frame).getByRole("status")).toBeVisible();

    await act(async () => { finishDecode(); });
    expect(document.documentElement).toHaveClass("light");
    expect(frame).toHaveAttribute("data-portrait-theme", "light");
    expect(light).toHaveAttribute("data-portrait-state", "ready");
    expect(getComputedStyle(dark).opacity).toBe("0");
    expect(getComputedStyle(light).opacity).toBe("1");
    expect(toggle).not.toHaveAttribute("aria-busy");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each(["network", "decode"])("keeps a visible fallback in the selected theme after a %s failure", async (failure) => {
    const { frame, dark, light } = setup();
    decodeWith(dark, () => Promise.resolve());
    await load(dark);
    if (failure === "network") fireEvent.error(light);
    else {
      decodeWith(light, () => Promise.reject(new Error("Cannot decode target portrait")));
      await load(light);
    }

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("light"));

    expect(frame).toHaveAttribute("data-portrait-theme", "light");
    expect(light).toHaveAttribute("data-portrait-state", "missing");
    expect(getComputedStyle(dark).opacity).toBe("0");
    expect(getComputedStyle(light).opacity).toBe("0");
    expect(within(frame).getByRole("status")).toHaveTextContent("JEPortrait unavailable");
    expect(within(frame).getByRole("status")).toBeVisible();
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).not.toHaveAttribute("aria-busy");
  });

  it("allows the theme to change with a loading fallback when target decoding stalls", async () => {
    const { frame, dark, light } = setup();
    decodeWith(dark, () => Promise.resolve());
    await load(dark);
    decodeWith(light, () => new Promise(() => {}));
    await load(light);

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    expect(document.documentElement).toHaveClass("light");
    expect(frame).toHaveAttribute("data-portrait-theme", "light");
    expect(light).toHaveAttribute("data-portrait-state", "loading");
    expect(getComputedStyle(dark).opacity).toBe("0");
    expect(getComputedStyle(light).opacity).toBe("0");
    expect(within(frame).getByRole("status")).toHaveTextContent("JELoading portrait");
    expect(within(frame).getByRole("status")).toBeVisible();
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).not.toHaveAttribute("aria-busy");
  });
});
