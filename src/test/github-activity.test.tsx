import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GitHubSection from "@/components/GitHubSection";
import { githubConfig } from "@/data/portfolio";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("GitHub activity", () => {
  it.each([
    { dev: true, url: `/api/github-public/${githubConfig.username}` },
    { dev: false, url: `https://github-contributions-api.jogruber.de/v4/${githubConfig.username}` },
  ])("loads the public feed directly with DEV=$dev", async ({ dev, url }) => {
    vi.stubEnv("DEV", dev);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ contributions: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<GitHubSection />);

    expect(await screen.findByText("No activity recorded for this period yet.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(url, expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(screen.getByText("· PUBLIC ONLY")).toBeInTheDocument();
  });

  it("offers a labelled period and accessible calendar summary without daily controls", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayDate = today.toISOString().slice(0, 10);
    const yesterdayDate = yesterday.toISOString().slice(0, 10);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ contributions: [
        { date: yesterdayDate, count: 0, level: 0 },
        { date: todayDate, count: 4, level: 2 },
      ] }),
    }));

    render(<GitHubSection />);
    expect(screen.getByRole("button", { name: "PAST 12 MONTHS", pressed: true })).toBeInTheDocument();
    const calendar = await screen.findByRole("region", { name: "Contribution calendar" });
    expect(screen.getByText(/^1 active day · /)).toBeInTheDocument();
    expect(within(calendar).getByTitle(`4 contributions on ${todayDate}`)).toBeInTheDocument();
    expect(within(calendar).getByTitle(`0 contributions on ${yesterdayDate}`)).toBeInTheDocument();
    expect(calendar).toHaveAttribute("tabindex", "0");
    expect(within(calendar).queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryByLabelText("Inspect a day")).not.toBeInTheDocument();
  });

  it.each(["network", "http", "invalid"])("provides a useful profile link for a %s failure", async (failure) => {
    vi.stubEnv("DEV", false);
    const fetchMock = failure === "network"
      ? vi.fn().mockRejectedValue(new Error("Internal service error details"))
      : vi.fn().mockResolvedValue({ ok: failure !== "http", status: 503, json: async () => ({ error: "Internal service error details" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<GitHubSection />);

    expect(await screen.findByText(/Activity is temporarily unavailable/)).toBeInTheDocument();
    expect(screen.queryByText("Internal service error details")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "OPEN PROFILE" })).toHaveAttribute("href", githubConfig.profileUrl);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([true, false])("orders cross-year public activity with DEV=%s before rendering the calendar", async (dev) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-03T12:00:00Z"));
    vi.stubEnv("DEV", dev);
    const contributions = [
      { date: "2026-01-02", count: 4, level: 2, color: "" },
      { date: "2026-01-01", count: 1, level: 1, color: "" },
      { date: "2025-12-31", count: 2, level: 1, color: "" },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ contributions }) }));

    render(<GitHubSection />);
    const calendar = await screen.findByRole("region", { name: "Contribution calendar" });
    const startDate = new Date("2025-12-31T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const endDate = new Date("2026-01-02T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    expect(screen.getByText(`3 active days · ${startDate} – ${endDate}`)).toBeInTheDocument();
    expect(Array.from(calendar.querySelectorAll("[title]"), (day) => day.getAttribute("title"))).toEqual([
      "2 contributions on 2025-12-31", "1 contribution on 2026-01-01", "4 contributions on 2026-01-02",
    ]);
    expect(contributions[0].date).toBe("2026-01-02");
  });

  it("filters the selected year and cancels the previous period request", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-03T12:00:00Z"));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ contributions: [
      { date: "2026-01-04", count: 9, level: 2 },
      { date: "2026-01-02", count: 4, level: 2 },
      { date: "2025-12-31", count: 2, level: 1 },
      { date: "2024-12-31", count: 1, level: 1 },
    ] }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<GitHubSection />);

    const calendar = await screen.findByRole("region", { name: "Contribution calendar" });
    expect(within(calendar).queryByTitle("9 contributions on 2026-01-04")).not.toBeInTheDocument();
    expect(within(calendar).queryByTitle("1 contribution on 2024-12-31")).not.toBeInTheDocument();
    const [, previousRequest] = fetchMock.mock.calls[0] as [string, RequestInit];

    fireEvent.click(screen.getByRole("button", { name: "2025" }));

    const selectedCalendar = await screen.findByRole("region", { name: "Contribution calendar" });
    expect(screen.getByRole("button", { name: "2025", pressed: true })).toBeInTheDocument();
    expect(previousRequest.signal?.aborted).toBe(true);
    expect(Array.from(selectedCalendar.querySelectorAll("[title]"), (day) => day.getAttribute("title"))).toEqual([
      "2 contributions on 2025-12-31",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ignores a previous period response that arrives after the selected year", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-03T12:00:00Z"));
    let resolvePrevious!: (response: unknown) => void;
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { resolvePrevious = resolve; }))
      .mockResolvedValue({ ok: true, json: async () => ({ contributions: [{ date: "2025-12-31", count: 2, level: 1 }] }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<GitHubSection />);

    fireEvent.click(screen.getByRole("button", { name: "2025" }));
    await screen.findByTitle("2 contributions on 2025-12-31");
    await act(async () => {
      resolvePrevious({ ok: true, json: async () => ({ contributions: [{ date: "2026-01-02", count: 9, level: 2 }] }) });
    });

    expect(screen.getByTitle("2 contributions on 2025-12-31")).toBeInTheDocument();
    expect(screen.queryByTitle("9 contributions on 2026-01-02")).not.toBeInTheDocument();
  });

  it("ends a stalled request with a useful unavailable state", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    render(<GitHubSection />);

    await act(async () => { await vi.advanceTimersByTimeAsync(12_000); });

    expect(screen.getByText(/Activity is temporarily unavailable/)).toBeInTheDocument();
    expect(screen.queryByText("QUERYING GITHUB")).not.toBeInTheDocument();
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.signal?.aborted).toBe(true);
    expect(screen.getByRole("link", { name: "OPEN PROFILE" })).toHaveAttribute("href", githubConfig.profileUrl);
  });
});
