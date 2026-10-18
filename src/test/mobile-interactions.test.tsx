import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProjectsSection from "@/components/ProjectsSection";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("compact project interactions", () => {
  it.each([false, true])("keeps filters and dialog focus responsive with reduced motion %s", async (reduced) => {
    const originalMatchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...originalMatchMedia(query),
      matches: query.includes("reduced-motion") ? reduced : query.includes("max-width: 767px"),
    }));
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProjectsSection showAllByDefault />
      </MemoryRouter>,
    );

    const mobileFilter = screen.getByRole("button", { name: "MOBILE" });
    mobileFilter.focus();
    fireEvent.click(mobileFilter);
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual(["LakBai", "Thryfto"]));
    expect(mobileFilter).toHaveAttribute("aria-pressed", "true");
    expect(mobileFilter).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1–2 of 2 mobile projects");

    const trigger = screen.getByRole("button", { name: "View Thryfto case study" });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Thryfto" });
    expect(within(dialog).getByRole("heading", { name: "Thryfto" })).toHaveFocus();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(trigger).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: "WEB" }));
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5));
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1–5 of 5 web projects");
    expect(screen.queryByRole("heading", { name: "Thryfto" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "LakBai" })).not.toBeInTheDocument();

    fireEvent.click(mobileFilter);
    fireEvent.click(screen.getByRole("button", { name: "ALL WORK" }));
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6));
    expect(screen.getByRole("button", { name: "ALL WORK" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("link", { name: "Page 2" }));
    expect(screen.getByRole("status")).toHaveTextContent("Showing 7–7 of 7 projects");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  });
});
