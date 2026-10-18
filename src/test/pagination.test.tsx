import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollToHash } from "@/App";
import ProjectsSection from "@/components/ProjectsSection";
import { projectPageNumbers, projectPagination, projectSearch, readProjectFilter } from "@/lib/project-pagination";

const routerFlags = { v7_startTransition: true, v7_relativeSplatPath: true };
let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollTo = vi.fn();
  vi.stubGlobal("scrollTo", scrollTo);
  vi.stubGlobal("scrollY", 0);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(4000);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    const top = this.id === "project-results" ? 900 - window.scrollY : 0;
    const height = this.tagName === "HEADER" ? 72 : 500;
    return { x: 0, y: top, top, bottom: top + height, left: 0, right: 1000, width: 1000, height, toJSON: () => ({}) };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function CollectionFixture({ homepage = false }: { homepage?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  return <>
    <ScrollToHash />
    <header />
    <main id="main-content" tabIndex={-1}>
      <div data-route-path={location.pathname} data-testid="route-shell">
        <h1>Projects collection</h1>
        <ProjectsSection showAllByDefault={!homepage} />
      </div>
    </main>
    <p data-testid="location">{location.pathname}{location.search}{location.hash}</p>
    <button onClick={() => navigate(-1)}>History back</button>
    <button onClick={() => navigate(1)}>History forward</button>
  </>;
}

function showCollection(url = "/projects", homepage = false) {
  return render(<MemoryRouter initialEntries={[url]} future={routerFlags}><CollectionFixture homepage={homepage} /></MemoryRouter>);
}

describe("project pagination URLs", () => {
  it.each(["", "0", "-1", "1.5", "NaN", "01", "9007199254740993"])("normalizes invalid page %s while preserving unrelated query state", (page) => {
    const state = projectPagination(new URLSearchParams(`page=${page}&filter=web&utm_source=portfolio`), 5);
    expect(state.page).toBe(1);
    expect(state.canonicalSearch).toBe("filter=web&utm_source=portfolio");
  });

  it("clamps oversized pages and handles an empty or larger collection", () => {
    expect(projectPagination(new URLSearchParams("page=100"), 7)).toMatchObject({ page: 2, start: 6, totalPages: 2 });
    expect(projectPagination(new URLSearchParams("page=2"), 0)).toMatchObject({ page: 1, start: 0, totalPages: 1, canonicalSearch: "" });
    const titles = Array.from({ length: 53 }, (_, index) => `Project ${index + 1}`);
    const visited = Array.from({ length: 9 }, (_, index) => {
      const { start } = projectPagination(new URLSearchParams(`page=${index + 1}`), titles.length);
      return titles.slice(start, start + 6);
    }).flat();
    expect(visited).toEqual(titles);
    expect(projectPageNumbers(5, 9)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 9]);
  });

  it("normalizes unknown filters, duplicate parameters, and default state", () => {
    const search = new URLSearchParams("filter=unknown&filter=web&page=2&page=4&campaign=hello");
    expect(readProjectFilter(search)).toBe("all");
    expect(projectSearch(search, "all", 1)).toBe("campaign=hello");
    expect(projectPageNumbers(1, 2)).toEqual([1, 2]);
  });
});

describe("Projects collection pagination", () => {
  it("shows six then one project, preserving global numbering, all links, and the route shell", async () => {
    showCollection();
    const shell = screen.getByTestId("route-shell");
    const firstPage = screen.getAllByRole("heading", { level: 3 }).map((item) => item.textContent);
    expect(firstPage).toHaveLength(6);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1–6 of 7 projects · Page 1 of 2");
    const previous = screen.getByRole("link", { name: "Go to previous page" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(previous).not.toHaveAttribute("href");
    expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("link", { name: "Go to next page" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/projects?page=2");
    expect(screen.getByRole("status")).toHaveTextContent("Showing 7–7 of 7 projects · Page 2 of 2");
    expect(screen.getByTestId("route-shell")).toBe(shell);
    const last = screen.getByRole("heading", { name: "ComLab V3 Egress Simulation" }).closest("article")!;
    expect(within(last).getByText("07")).toBeInTheDocument();
    expect(within(last).getByRole("link", { name: /public source code/ })).toHaveAttribute("href", "https://github.com/JayEsmalla/simulation_comlabV3");
    expect(within(last).getByRole("link", { name: /live project/ })).toHaveAttribute("href", "https://simulation-comlab-v3.vercel.app/");
    const everyTitle = [...firstPage, ...screen.getAllByRole("heading", { level: 3 }).map((item) => item.textContent)];
    expect(new Set(everyTitle).size).toBe(7);
    expect(screen.getByRole("link", { name: "Go to next page" })).toHaveAttribute("aria-disabled", "true");
    await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 808, behavior: "smooth" });
  });

  it("filters before pagination, resets the page, preserves the hash and filter focus", async () => {
    showCollection("/projects?page=2&campaign=shared#projects");
    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
    const mobile = screen.getByRole("button", { name: "MOBILE" });
    mobile.focus();
    const beforeFilter = scrollTo.mock.calls.length;
    fireEvent.click(mobile);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1–2 of 2 mobile projects · Page 1 of 1");
    expect(screen.queryByRole("navigation", { name: "Project pages" })).not.toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/projects?campaign=shared&filter=mobile#projects");
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 40)); });
    expect(mobile).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledTimes(beforeFilter);
    fireEvent.click(screen.getByRole("button", { name: "WEB" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "ALL WORK" }));
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1–6 of 7 projects");
  });

  it("restores page/filter history and saved reading positions without remounting", async () => {
    showCollection();
    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
    const shell = screen.getByTestId("route-shell");
    vi.stubGlobal("scrollY", 640);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("link", { name: "Page 2" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
    vi.stubGlobal("scrollY", 300);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("button", { name: "WEB" }));
    expect(screen.getByRole("button", { name: "WEB" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "History back" }));
    expect(screen.getByRole("status")).toHaveTextContent("Page 2 of 2");
    await waitFor(() => expect(scrollTo).toHaveBeenLastCalledWith({ top: 300, behavior: "instant" }));
    fireEvent.click(screen.getByRole("button", { name: "History back" }));
    await waitFor(() => expect(scrollTo).toHaveBeenLastCalledWith({ top: 640, behavior: "instant" }));
    expect(screen.getByRole("status")).toHaveTextContent("Page 1 of 2");
    fireEvent.click(screen.getByRole("button", { name: "History forward" }));
    expect(screen.getByRole("status")).toHaveTextContent("Page 2 of 2");
    expect(screen.getByTestId("route-shell")).toBe(shell);
  });

  it("supports direct links and replaces out-of-range filtered pages without losing the hash", async () => {
    showCollection("/projects?filter=web&page=99&utm_source=link#projects");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/projects?filter=web&utm_source=link#projects"));
    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "WEB" })).toHaveAttribute("aria-pressed", "true");
  });

  it("closes a case study through history when its originating card disappears", async () => {
    showCollection();
    fireEvent.click(screen.getByRole("link", { name: "Page 2" }));
    fireEvent.click(screen.getByRole("button", { name: "View ComLab V3 Egress Simulation case study" }));
    expect(screen.getByRole("dialog", { name: "ComLab V3 Egress Simulation" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("History back"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveFocus();
  });

  it("keeps homepage selection and local filters independent of collection query parameters", () => {
    showCollection("/?page=2&filter=web", true);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
    expect(screen.getByRole("link", { name: "VIEW ALL 7 PROJECTS" })).toHaveAttribute("href", "/projects");
    expect(screen.queryByRole("navigation", { name: "Project pages" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "MOBILE" }));
    expect(screen.getByRole("status")).toHaveTextContent("Showing 2 of 2 mobile projects");
    expect(screen.getByTestId("location")).toHaveTextContent("/?page=2&filter=web");
  });
});
