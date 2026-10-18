import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactSection from "@/components/ContactSection";
import { socialLinks } from "@/data/portfolio";

const fillDraft = () => {
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Juan Dela Cruz" } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "juan@example.com" } });
  fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Mobile app enquiry" } });
  fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: "I would like to discuss a mobile project." } });
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("contact validation and recovery", () => {
  it("explains invalid fields and focuses the first one without sending", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "   " } });
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "invalid-address" } });
    fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: "          " } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^Name/)).toHaveFocus();
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^Email/)).toHaveAccessibleDescription("Enter a valid email address.");
    expect(screen.getByLabelText(/^Message/)).toHaveAccessibleDescription(/Write at least 10 characters/);
  });

  it("preserves a failed draft, provides an email fallback, and allows a successful retry", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error("Connection lost"))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactSection />);
    fillDraft();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Delivery couldn't be confirmed");
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Juan Dela Cruz");
    expect(screen.getByLabelText(/^Message/)).toHaveValue("I would like to discuss a mobile project.");
    const emailLink = screen.getByRole("link", { name: /email directly/i }).getAttribute("href");
    expect(emailLink).toContain(`mailto:${socialLinks.email}`);
    expect(decodeURIComponent(emailLink!)).toContain("body=I would like to discuss a mobile project.");

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Message sent. I'll get back to you soon."));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText(/^Message/)).toHaveValue("");
  });

  it("ends a stalled request after 15 seconds and keeps the draft available", async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_url: string, request: RequestInit) => new Promise((_resolve, reject) => {
      requestSignal = request.signal as AbortSignal;
      requestSignal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactSection />);
    fillDraft();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });

    expect(requestSignal?.aborted).toBe(true);
    expect(screen.getByRole("alert")).toHaveTextContent("Sending timed out");
    expect(screen.getByRole("button", { name: /try again/i })).toBeEnabled();
    expect(screen.getByLabelText(/^Message/)).toHaveValue("I would like to discuss a mobile project.");
  });
});

