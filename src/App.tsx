import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Certifications from "./pages/Certifications";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Testimonials from "./pages/Testimonials";

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
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<Navigate to="/#about" replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
