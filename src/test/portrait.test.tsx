import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Portrait from "@/components/Portrait";

afterEach(cleanup);
const setup = () => {
  render(<Portrait />);
  const real = screen.getByAltText("Portrait of Jay Factolarin Esmalla");
  const anime = screen.getByAltText("Gun Park, Jay's anime alter-ego");
  const button = screen.getByRole("button", { name: "Toggle anime alter-ego portrait" });
  fireEvent.load(real);
  return { real, anime, button };
};

describe("portrait reveal", () => {
  it("keeps the real portrait visible until the alternate image has loaded", () => {
    const { real, anime, button } = setup();
    fireEvent.mouseEnter(button);
    expect(real).toHaveAttribute("aria-hidden", "false");
    expect(anime).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByText("Loading portrait")).not.toBeInTheDocument();
    fireEvent.load(anime);
    expect(anime).toHaveAttribute("aria-hidden", "false");
    expect(real).toHaveAttribute("aria-hidden", "true");
  });
  it("keeps both bitmap nodes mounted through hover reversals", () => {
    const { real, anime, button } = setup();
    fireEvent.load(anime);
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    fireEvent.mouseEnter(button);
    expect(screen.getByAltText("Portrait of Jay Factolarin Esmalla")).toBe(real);
    expect(screen.getByAltText("Gun Park, Jay's anime alter-ego")).toBe(anime);
    fireEvent.mouseLeave(button);
    expect(real).toHaveAttribute("aria-hidden", "false");
  });
  it("allows touch/keyboard clicks to toggle the portrait without hover", () => {
    const { anime, button } = setup();
    fireEvent.load(anime);
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(anime).toHaveAttribute("aria-hidden", "true");
  });
  it("lets a click retain the hovered alter ego until the next click", () => {
    const { anime, button } = setup();
    fireEvent.load(anime);
    fireEvent.mouseEnter(button);
    fireEvent.click(button);
    fireEvent.mouseLeave(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(anime).toHaveAttribute("aria-hidden", "false");
    fireEvent.click(button);
    expect(anime).toHaveAttribute("aria-hidden", "true");
  });
  it("retains the real photo when the alternate asset fails", () => {
    const { real, anime, button } = setup();
    fireEvent.error(anime);
    fireEvent.mouseEnter(button);
    expect(real).toHaveAttribute("aria-hidden", "false");
    expect(anime).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("UNAVAILABLE")).toBeInTheDocument();
    expect(screen.queryByText("Portrait unavailable")).not.toBeInTheDocument();
  });
});
