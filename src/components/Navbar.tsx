import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, FileText, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motionTokens, useMotionSettings } from "@/lib/motion";
import ThemeSwitch from "./ThemeSwitch";

const NAV_ITEMS = [
  { label: "WORK", sectionId: "projects", pageHref: "/projects" },
  { label: "ABOUT", sectionId: "about", pageHref: "/#about" },
  { label: "CREDENTIALS", sectionId: "certifications", pageHref: "/certifications" },
];

const HOME_SECTIONS = ["home", "projects", "about", "github", "certifications", "contact"];

const Navbar = () => {
  const { reduced } = useMotionSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => setMobileOpen(false), [location.key]);

  useEffect(() => {
    if (!mobileOpen) return;
    mobileNavRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMobileOpen(false);
      toggleRef.current?.focus();
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.scrollY;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

      setScrolled(scrollTop > 28);
      setScrollProgress(scrollableHeight > 0 ? Math.min(1, scrollTop / scrollableHeight) : 0);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    if (!isHome) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    const observedSections = new Set<HTMLElement>();
    const observeAvailableSections = () => {
      HOME_SECTIONS.forEach((id) => {
        const section = document.getElementById(id);
        if (!section || observedSections.has(section)) return;

        observer.observe(section);
        observedSections.add(section);
      });
    };

    observeAvailableSections();

    const sectionLoaderObserver = new MutationObserver(observeAvailableSections);
    sectionLoaderObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      sectionLoaderObserver.disconnect();
      observer.disconnect();
    };
  }, [isHome]);

  const hrefFor = (sectionId: string, pageHref: string) => (isHome ? `/#${sectionId}` : pageHref);

  const isActive = (sectionId: string, pageHref: string) => {
    if (isHome) return activeSection === sectionId;
    return pageHref.startsWith("/#") ? false : location.pathname === pageHref;
  };

  const contactHref = isHome ? "/#contact" : "/contact";
  const contactActive = isHome ? activeSection === "contact" : location.pathname === "/contact";

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-[background-color,border-color] duration-300 ${
        scrolled ? "border-iron bg-carbon/95" : "border-graphite bg-obsidian/90"
      }`}
    >
      <div
        className={`page-container flex items-center justify-between gap-6 transition-[height] duration-300 ${
          scrolled ? "h-[62px]" : "h-[72px]"
        }`}
      >
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="group flex items-center gap-3 text-[18px] font-normal tracking-[-0.02em] text-chalk"
          aria-label="Jay Factolarin Esmalla home"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-graphite bg-graphite text-[10px] text-chalk transition-all group-hover:border-pulse-green group-hover:ring-1 group-hover:ring-pulse-green/40">
            JE
          </span>
          <span className="sm:hidden">Jay F. Esmalla</span>
          <span className="hidden sm:inline">Jay Factolarin Esmalla</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.sectionId, item.pageHref);
            return (
              <Link
                key={item.label}
                to={hrefFor(item.sectionId, item.pageHref)}
                aria-current={active ? isHome ? "location" : "page" : undefined}
                className={`relative py-2 text-[13px] font-normal tracking-[0.02em] transition-colors ${
                  active ? "text-chalk" : "text-smoke hover:text-chalk"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    className="absolute inset-x-0 -bottom-[2px] h-px bg-pulse-green"
                    transition={{ duration: reduced ? 0 : motionTokens.feedback, ease: motionTokens.ease }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeSwitch />
          <a href="/Jay_Esmalla_Resume.pdf" target="_blank" rel="noopener noreferrer" aria-label="View résumé (opens in a new tab)" className="ghost-button">
            RÉSUMÉ <FileText size={13} />
          </a>
          <Link
            to={contactHref}
            aria-current={contactActive ? isHome ? "location" : "page" : undefined}
            className={contactActive ? "ghost-button" : "primary-pill"}
          >
            LET&apos;S CHAT <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <ThemeSwitch />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-graphite text-chalk transition-colors hover:border-iron lg:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-graphite" aria-hidden="true">
        <motion.div
          className="h-full origin-left bg-pulse-green"
          animate={{ scaleX: scrollProgress }}
          transition={{ duration: reduced ? 0 : motionTokens.feedback, ease: "linear" }}
        />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: reduced ? 0 : motionTokens.exit } }}
            transition={{ duration: reduced ? 0 : motionTokens.overlay, ease: motionTokens.ease }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-b border-t border-graphite bg-obsidian lg:hidden"
          >
            <nav ref={mobileNavRef} id="mobile-navigation" aria-label="Mobile navigation" className="page-container flex flex-col py-5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.sectionId, item.pageHref);
                return (
                  <Link
                    key={item.label}
                    to={hrefFor(item.sectionId, item.pageHref)}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? isHome ? "location" : "page" : undefined}
                    className={`flex items-center justify-between border-b border-graphite py-4 text-[14px] transition-colors last:border-b-0 ${
                      active ? "text-chalk" : "text-smoke hover:text-chalk"
                    }`}
                  >
                    {item.label}
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-chalk" : "bg-transparent"}`} aria-hidden="true" />
                  </Link>
                );
              })}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <a href="/Jay_Esmalla_Resume.pdf" target="_blank" rel="noopener noreferrer" aria-label="View résumé (opens in a new tab)" className="ghost-button justify-center" onClick={() => {
                  setMobileOpen(false);
                  toggleRef.current?.focus();
                }}>
                  RÉSUMÉ <FileText size={13} />
                </a>
                <Link to={contactHref} onClick={() => setMobileOpen(false)} className={contactActive ? "ghost-button justify-center" : "primary-pill justify-center"}>
                  LET&apos;S CHAT <ArrowUpRight size={14} />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
