import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import IntroScreen from "./components/IntroScreen";
import FocusCursor from "./components/FocusCursor";
import ThemeProvider from "./components/ThemeProvider";
import VisitorProvider from "./components/VisitorProvider";
import PageLayout from "./components/PageLayout";
import PageTransition, { PageEntrance } from "./components/PageTransition";
import Index from "./pages/Index";
import { shouldPlayIntro } from "./lib/intro";

const Certifications = lazy(() => import("./pages/Certifications"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Projects = lazy(() => import("./pages/Projects"));

const queryClient = new QueryClient();

export const ScrollToHash = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map<string, number>());

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previousRestoration; };
  }, []);

  useEffect(() => {
    const savedTop = navigationType === "POP" ? positions.current.get(location.key) : undefined;
    let frame = 0;
    let settled = false;
    let restorationStarted = false;
    let hashId = location.hash.slice(1);
    try { hashId = decodeURIComponent(hashId); } catch { /* Treat malformed fragments as literal IDs. */ }

    const recordPosition = () => {
      if (settled || restorationStarted) positions.current.set(location.key, window.scrollY);
    };

    const navigateToDestination = (allowFallback = false) => {
      if (settled) return;
      const main = document.getElementById("main-content");
      const route = main?.querySelector<HTMLElement>("[data-route-path]");
      if (route && (route.dataset.routePath !== location.pathname || route.hasAttribute("data-route-exiting"))) return;
      const target = hashId ? document.getElementById(hashId) : main;
      if (!main || (!target && savedTop === undefined && !allowFallback)) return;
      const hasPendingSections = Boolean(main.querySelector("[data-section-loading]"));
      if (main.querySelector("[data-page-loading]")) return;
      // Concurrent lazy sections above an anchor can still move its final position.
      if (hashId && savedTop === undefined && hasPendingSections && !allowFallback) return;

      const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      // Restore what is available immediately, then follow lazy content growth.
      const awaitingHeight = savedTop !== undefined && (maxTop < savedTop || hasPendingSections) && !allowFallback;

      const destination = target ?? main;
      const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 72;
      const sectionPaddingTop = Number.parseFloat(window.getComputedStyle(destination).paddingTop) || 0;
      const sectionContentTop = window.scrollY + destination.getBoundingClientRect().top + sectionPaddingTop;
      const top = savedTop !== undefined
        ? Math.min(savedTop, maxTop)
        : hashId && target ? Math.max(0, sectionContentTop - headerHeight - 20) : 0;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!restorationStarted && (hashId || savedTop !== undefined || navigationType !== "POP")) {
        const focusTarget = savedTop !== undefined ? main : destination.querySelector<HTMLElement>("h1, h2") ?? destination;
        if (!focusTarget.hasAttribute("tabindex")) {
          focusTarget.setAttribute("tabindex", "-1");
          focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
        }
        focusTarget.focus({ preventScroll: true });
      }
      window.scrollTo({ top, behavior: reduceMotion || savedTop !== undefined || !hashId ? "instant" : "smooth" });
      positions.current.set(location.key, top);
      restorationStarted = savedTop !== undefined;
      if (awaitingHeight) return;
      settled = true;
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };

    const scheduleNavigation = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => navigateToDestination());
    };
    const mutationObserver = new MutationObserver(scheduleNavigation);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleNavigation);
    const stopPendingNavigationOnInteraction = () => {
      if (settled) return;
      settled = true;
      recordPosition();
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
    mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-route-exiting"] });
    resizeObserver?.observe(document.body);
    window.addEventListener("scroll", recordPosition, { passive: true });
    window.addEventListener("pointerdown", stopPendingNavigationOnInteraction, { passive: true });
    window.addEventListener("wheel", stopPendingNavigationOnInteraction, { passive: true });
    window.addEventListener("keydown", stopPendingNavigationOnInteraction);
    scheduleNavigation();
    const fallbackTimer = window.setTimeout(() => navigateToDestination(true), 10000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallbackTimer);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", recordPosition);
      window.removeEventListener("pointerdown", stopPendingNavigationOnInteraction);
      window.removeEventListener("wheel", stopPendingNavigationOnInteraction);
      window.removeEventListener("keydown", stopPendingNavigationOnInteraction);
    };
  }, [location.key, location.pathname, location.hash, navigationType]);

  return null;
};

function PortfolioRoutes({ heroReady }: { heroReady: boolean }) {
  const location = useLocation();
  return (
    <PageTransition>
      <Suspense fallback={<div data-page-loading className="min-h-[70vh] bg-background p-8 text-smoke" role="status">Loading page…</div>}>
        <PageEntrance>
        <Routes location={location}>
          <Route path="/" element={<Index heroReady={heroReady} />} />
          <Route path="/about" element={<Navigate to="/#about" replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/testimonials" element={<Navigate to="/" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </PageEntrance>
      </Suspense>
    </PageTransition>
  );
}

const App = () => {
  const [introPhase, setIntroPhase] = useState<"playing" | "revealing" | "complete">(() => shouldPlayIntro() ? "playing" : "complete");
  const introActive = introPhase !== "complete";
  const introWasShown = useRef(introActive);

  useLayoutEffect(() => {
    if (!introActive) {
      if (introWasShown.current) {
        document.getElementById("main-content")?.focus({ preventScroll: true });
        introWasShown.current = false;
      }
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [introActive]);

  const handleIntroComplete = () => {
    try { sessionStorage.setItem("intro-seen", "1"); } catch { /* ignore */ }
    setIntroPhase("complete");
  };

  return (
    <ThemeProvider><MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <FocusCursor enabled={!introActive} />
          {introActive && <IntroScreen onReveal={() => setIntroPhase("revealing")} onComplete={handleIntroComplete} />}
          <div data-intro-phase={introPhase} {...(introActive ? { inert: "" } : {})} aria-hidden={introActive ? true : undefined}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToHash />
            <VisitorProvider><PageLayout><PortfolioRoutes heroReady={introPhase !== "playing"} /></PageLayout></VisitorProvider>
          </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </MotionConfig></ThemeProvider>
  );
};

export default App;
