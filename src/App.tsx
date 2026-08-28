import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Index from "./pages/Index";

const Certifications = lazy(() => import("./pages/Certifications"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Projects = lazy(() => import("./pages/Projects"));
const Testimonials = lazy(() => import("./pages/Testimonials"));

const queryClient = new QueryClient();

const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const timer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(location.hash);
      if (!target) return;

      const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 64;
      const sectionPaddingTop = Number.parseFloat(window.getComputedStyle(target).paddingTop) || 0;
      const sectionContentTop = window.scrollY + target.getBoundingClientRect().top + sectionPaddingTop;

      window.scrollTo({
        top: Math.max(0, sectionContentTop - headerHeight - 20),
        behavior: "smooth",
      });
    }, 220);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToHash />
        <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Loading page" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<Navigate to="/#about" replace />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
