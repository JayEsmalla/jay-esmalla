import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FocusCursor from "@/components/FocusCursor";

const point = (target: Element, pointerType = "mouse") => {
  const event = new Event("pointermove", { bubbles: true });
  Object.assign(event, { pointerType, clientX: 120, clientY: 160 });
  fireEvent(target, event);
};

function setup({ reduced = false, fine = true, enabled = true } = {}) {
  const changes = new Map<string, () => void>();
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: query.includes("reduced-motion") ? reduced : fine,
    media: query,
    addEventListener: (_: string, callback: () => void) => changes.set(query, callback),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList);
  const view = render(<><FocusCursor enabled={enabled} /><button data-cursor="project">Case study</button><input aria-label="Email" /><p>Readable text</p></>);
  return { ...view, changes, cursor: document.querySelector(".focus-cursor") as HTMLElement };
}

afterEach(() => vi.restoreAllMocks());

describe("FocusCursor", () => {
  it("tracks the exact pointer, responds to actions, and restores native input over text", () => {
    const { cursor } = setup();
    point(screen.getByRole("button"));
    expect(cursor).toHaveAttribute("data-mode", "project");
    expect(document.documentElement).toHaveClass("focus-cursor-active");
    expect(cursor.querySelector(".focus-cursor-position")).toHaveStyle({ transform: "translate3d(120px, 160px, 0)" });
    fireEvent.pointerDown(screen.getByRole("button"));
    expect(cursor).toHaveAttribute("data-pressed", "true");
    fireEvent.pointerUp(screen.getByRole("button"));
    expect(cursor).toHaveAttribute("data-pressed", "false");
    point(screen.getByRole("textbox"));
    expect(document.documentElement).not.toHaveClass("focus-cursor-active");
    point(screen.getByRole("button"));
    point(screen.getByText("Readable text"));
    expect(cursor).toHaveAttribute("data-visible", "false");
  });

  it.each([{ reduced: true }, { fine: false }, { enabled: false }])("preserves native cursors when unavailable: %o", (options) => {
    const { cursor } = setup(options);
    point(screen.getByRole("button"));
    expect(cursor).toHaveAttribute("data-visible", "false");
    expect(document.documentElement).not.toHaveClass("focus-cursor-active");
  });

  it("clears on touch, keyboard navigation, preference changes, and unmount", () => {
    const { cursor, changes, unmount } = setup();
    const button = screen.getByRole("button");
    point(button);
    point(button, "touch");
    expect(cursor).toHaveAttribute("data-visible", "false");
    point(button);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.documentElement).not.toHaveClass("focus-cursor-active");
    point(button);
    button.addEventListener("keydown", (event) => event.stopPropagation(), { once: true });
    fireEvent.keyDown(button, { key: "Escape" });
    expect(document.documentElement).not.toHaveClass("focus-cursor-active");
    point(button);
    act(() => changes.get("(prefers-reduced-motion: reduce)")?.());
    expect(document.documentElement).not.toHaveClass("focus-cursor-active");
    point(button);
    unmount();
    expect(document.documentElement).not.toHaveClass("focus-cursor-active");
  });
});
