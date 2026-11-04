import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import {
  ArrowUpRight,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLocalTime } from "@/lib/local-time";
import { motionTokens, useMotionSettings } from "@/lib/motion";
import ActivitySticker from "./ActivitySticker";
import ThemeSwitch from "./ThemeSwitch";

const NAV_ITEMS = [
  { label: "WORK", index: "01", sectionId: "projects", pageHref: "/projects" },
  { label: "ABOUT", index: "02", sectionId: "about", pageHref: "/#about" },
  { label: "GITHUB", index: "03", sectionId: "github", pageHref: "/#github" },
  { label: "CREDENTIALS", index: "04", sectionId: "certifications", pageHref: "/certifications" },
];

const HOME_SECTIONS = ["home", "projects", "about", "github", "certifications", "contact"];

const NavbarLocalTimeCard = memo(function NavbarLocalTimeCard() {
  const localTime = useLocalTime();
  return (
    <div
      data-testid="navbar-local-time"
      data-activity={localTime.activity}
      className="flex w-full min-w-0 items-center gap-2.5 border-t border-graphite bg-obsidian/40 px-3.5 py-3"
      aria-label={`Local time in Tagum City: ${localTime.time} PHT, currently ${localTime.label.toLowerCase()}`}
    >
      <ActivitySticker
        activity={localTime.activity}
        label={localTime.label}
        size="md"
        interactive
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="font-mono-retro text-[12px] leading-none tabular-nums text-chalk">
            {localTime.time} <span className="text-[9px] text-smoke">PHT</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 font-mono-retro text-[9px] uppercase tracking-[0.03em] text-pulse-green">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                localTime.awake
                  ? "bg-pulse-green shadow-[0_0_6px_var(--color-pulse-green)]"
                  : "bg-compass-gold"
              }`}
              aria-hidden="true"
            />
            {localTime.label}
          </span>
        </div>
        <p className="mt-1.5 truncate font-mono-retro text-[9.5px] leading-tight text-smoke">
          {localTime.status}
        </p>
      </div>
    </div>
  );
});

const NavbarLocalTimePill = memo(function NavbarLocalTimePill() {
  const localTime = useLocalTime();
  return (
    <div
      className="hidden items-center gap-2 rounded-[4px] border border-graphite bg-carbon py-1 pl-1 pr-2.5 sm:inline-flex"
      aria-label={`Local time ${localTime.time} PHT · ${localTime.label}`}
    >
      <ActivitySticker
        activity={localTime.activity}
        label={localTime.label}
        size="sm"
        interactive={false}
      />
      <span className="font-mono-retro text-[11px] tabular-nums text-chalk">
        {localTime.time} <span className="text-smoke">PHT</span>
      </span>
      <span className="font-mono-retro text-[10px] text-pulse-green">{localTime.label}</span>
    </div>
  );
});

const Navbar = ({ onSectionChange }: { onSectionChange?: (sectionId: string) => void } = {}) => {
  const { reduced } = useMotionSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollProgress = useMotionValue(0);
  const [activeSection, setActiveSection] = useState("home");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const onSectionChangeRef = useRef(onSectionChange);
  onSectionChangeRef.current = onSectionChange;
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
    let scrollFrame: number | null = null;
    let wasScrolled = false;
    const updateScrollState = () => {
      scrollFrame = null;
      const scrollTop = window.scrollY;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextScrolled = scrollTop > 28;

      if (nextScrolled !== wasScrolled) {
        wasScrolled = nextScrolled;
        setScrolled(nextScrolled);
      }
      scrollProgress.set(scrollableHeight > 0 ? Math.max(0, Math.min(1, scrollTop / scrollableHeight)) : 0);
    };
    const scheduleScrollUpdate = () => {
      if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleScrollUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.removeEventListener("resize", scheduleScrollUpdate);
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
    };
  }, [scrollProgress]);

  useEffect(() => {
    if (!isHome) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
          onSectionChangeRef.current?.(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    const pendingSections = new Set(HOME_SECTIONS);
    const observeAvailableSections = () => {
      // An outgoing collection can still own the same IDs during the route fade.
      const homeFrame = document.querySelector<HTMLElement>('[data-route-path="/"]:not([data-route-exiting])');
      const hasRouteFrame = Boolean(homeFrame || document.querySelector("[data-route-path]"));
      pendingSections.forEach((id) => {
        const section = homeFrame
          ? homeFrame.querySelector<HTMLElement>(`#${id}`)
          : hasRouteFrame ? null : document.getElementById(id);
        if (!section) return;

        observer.observe(section);
        pendingSections.delete(id);
      });
      if (pendingSections.size === 0) sectionLoaderObserver.disconnect();
    };

    const sectionLoaderObserver = new MutationObserver(observeAvailableSections);
    sectionLoaderObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-route-path", "data-route-exiting"],
    });
    observeAvailableSections();

    return () => {
      sectionLoaderObserver.disconnect();
      observer.disconnect();
    };
  }, [isHome]);

  const hrefFor = (sectionId: string, pageHref: string) => (isHome ? `/#${sectionId}` : pageHref);

  const isActive = (sectionId: string, pageHref: string) => {
    if (isHome) return activeSection === sectionId;
    if (pageHref.startsWith("/#")) return false;
    return location.pathname === pageHref || (pageHref === "/projects" && location.pathname.startsWith("/projects/"));
  };

  const contactHref = isHome ? "/#contact" : "/contact";
  const contactActive = isHome ? activeSection === "contact" : location.pathname === "/contact";
  const homeActive = isHome && activeSection === "home";

  return (
    <header
      data-floating-nav
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300 max-lg:backdrop-blur-md lg:flex lg:h-screen lg:flex-col lg:justify-between lg:border-b-0 lg:border-r lg:border-graphite ${
        scrolled ? "border-iron bg-carbon/95" : "border-graphite bg-obsidian/90"
      }`}
    >
      {/* ── Desktop Connected Editorial Spine ── */}
      <div className="hidden lg:flex lg:h-full lg:w-full lg:min-w-0 lg:flex-col lg:justify-between">
        {/* Top Identity Cell (aligned with Hero h-14 status bar) */}
        <div className="flex h-14 shrink-0 items-center border-b border-graphite px-5">
          <Link
            to={isHome ? "/#home" : "/"}
            onClick={() => setMobileOpen(false)}
            className="group flex items-center gap-3 font-heading text-[15px] font-bold tracking-[-0.025em] text-chalk"
            aria-label="Jay Esmalla home"
          >
            <span
              aria-hidden="true"
              className={`grid h-6 w-6 place-items-center rounded-[2px] border font-mono-retro text-[10px] transition-colors ${
                homeActive
                  ? "border-pulse-green bg-pulse-green/10 text-pulse-green"
                  : "border-graphite bg-carbon text-chalk group-hover:border-pulse-green"
              }`}
            >
              JE
            </span>
            <span>Jay Esmalla</span>
          </Link>
        </div>

        {/* Middle Continuous Flow Track */}
        <div className="flex flex-1 flex-col justify-center px-5 py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="meta-text text-smoke/60">INDEX</span>
            <span className="font-mono-retro text-[10px] tabular-nums text-smoke/50">01–04</span>
          </div>

          <nav className="relative flex flex-col" aria-label="Primary navigation">
            {/* Continuous vertical spine track */}
            <div className="pointer-events-none absolute bottom-3 left-[4px] top-3 w-px bg-graphite" aria-hidden="true">
              <motion.div
                className="h-full w-full origin-top bg-pulse-green"
                style={{ scaleY: scrollProgress }}
              />
            </div>

            {NAV_ITEMS.map((item) => {
              const active = isActive(item.sectionId, item.pageHref);
              return (
                <Link
                  key={item.label}
                  to={hrefFor(item.sectionId, item.pageHref)}
                  aria-current={active ? isHome ? "location" : "page" : undefined}
                  className={`group relative flex items-center gap-3.5 py-3 pl-5 font-mono-retro text-[11px] tracking-[0.06em] transition-colors ${
                    active ? "text-chalk" : "text-smoke hover:text-chalk"
                  }`}
                >
                  {/* Node point on the spine */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-[1px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-[1px] border transition-colors ${
                      active
                        ? "border-pulse-green bg-pulse-green shadow-[0_0_8px_var(--color-pulse-green)]"
                        : "border-iron bg-carbon group-hover:border-chalk"
                    }`}
                  />
                  <span aria-hidden="true" className={active ? "text-pulse-green" : "text-smoke/50 group-hover:text-smoke"}>
                    {item.index}
                  </span>
                  <span>{item.label}</span>

                  {/* Active bridge line on the right shared border */}
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-active"
                      className="absolute -right-5 bottom-1.5 top-1.5 w-[2px] bg-pulse-green"
                      transition={{ duration: reduced ? 0 : motionTokens.feedback, ease: motionTokens.ease }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dedicated Local Time & Activity Sticker Card */}
        <NavbarLocalTimeCard />

        {/* Bottom Actions Cell */}
        <div className="border-t border-graphite p-4">
          <Link
            to={contactHref}
            aria-current={contactActive ? isHome ? "location" : "page" : undefined}
            className={`w-full justify-between px-3.5 py-2.5 ${contactActive ? "ghost-button" : "primary-pill"}`}
          >
            <span>LET&apos;S CHAT</span>
            <ArrowUpRight size={13} />
          </Link>

          <div className="mt-2.5 flex items-center gap-2">
            <a
              href="/Jay_Esmalla_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View CV (opens in a new tab)"
              className="ghost-button min-h-10 flex-1 justify-between px-3 py-2 text-[11px]"
            >
              <span>VIEW CV</span>
              <FileText size={12} />
            </a>
            <ThemeSwitch />
          </div>
        </div>
      </div>

      {/* ── Mobile & Tablet Connected Header Bar ── */}
      <div className="flex h-14 items-center justify-between gap-4 px-5 lg:hidden">
        <Link
          to={isHome ? "/#home" : "/"}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 font-heading text-[15px] font-bold tracking-[-0.025em] text-chalk"
          aria-label="Jay Esmalla home"
        >
          <span className="grid h-6 w-6 place-items-center rounded-[2px] border border-graphite bg-carbon font-mono-retro text-[10px] text-pulse-green">
            JE
          </span>
          <span>Jay Esmalla</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <NavbarLocalTimePill />
          <ThemeSwitch />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[4px] border border-graphite text-chalk transition-colors hover:border-iron"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* ── Reading Progress Bar ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-graphite" aria-hidden="true">
        <motion.div
          className="h-full origin-left bg-pulse-green"
          style={{ scaleX: scrollProgress }}
        />
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: reduced ? 0 : motionTokens.exit } }}
            transition={{ duration: reduced ? 0 : motionTokens.overlay, ease: motionTokens.ease }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-56px)] overflow-y-auto overscroll-contain border-b border-t border-graphite bg-carbon lg:hidden"
          >
            <nav ref={mobileNavRef} id="mobile-navigation" aria-label="Mobile navigation" className="flex flex-col px-5 py-4">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.sectionId, item.pageHref);
                return (
                  <Link
                    key={item.label}
                    to={hrefFor(item.sectionId, item.pageHref)}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? isHome ? "location" : "page" : undefined}
                    className={`flex items-center justify-between border-b border-graphite py-3.5 font-mono-retro text-[12px] tracking-[0.05em] transition-colors last:border-b-0 ${
                      active ? "text-chalk" : "text-smoke hover:text-chalk"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span aria-hidden="true" className="text-[11px] text-pulse-green">{item.index}</span>
                      <span>{item.label}</span>
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-pulse-green" : "bg-transparent"}`} aria-hidden="true" />
                  </Link>
                );
              })}
              <div className="mt-3 overflow-hidden rounded-[4px] border border-graphite">
                <NavbarLocalTimeCard />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <a
                  href="/Jay_Esmalla_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View CV (opens in a new tab)"
                  className="ghost-button justify-center"
                  onClick={() => {
                    setMobileOpen(false);
                    toggleRef.current?.focus();
                  }}
                >
                  VIEW CV <FileText size={13} />
                </a>
                <Link
                  to={contactHref}
                  onClick={() => setMobileOpen(false)}
                  className={contactActive ? "ghost-button justify-center" : "primary-pill justify-center"}
                >
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
