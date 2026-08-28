import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Download, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "ABOUT", sectionId: "about", pageHref: "/#about" },
  { label: "WORK", sectionId: "projects", pageHref: "/projects" },
  { label: "CREDENTIALS", sectionId: "certifications", pageHref: "/certifications" },
  { label: "TESTIMONIALS", sectionId: "testimonials", pageHref: "/testimonials" },
];

const HOME_SECTIONS = ["home", "about", "projects", "github", "certifications", "testimonials", "contact"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => setMobileOpen(false), [location.pathname, location.hash]);

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

    const sections = HOME_SECTIONS
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return undefined;

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

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
          className="group flex items-center gap-3 text-[18px] font-normal tracking-[-0.02em] text-chalk"
          aria-label="Jay Esmalla home"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-graphite text-[10px] text-smoke transition-colors group-hover:border-iron group-hover:text-chalk">
            JE
          </span>
          <span>Jay Esmalla</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.sectionId, item.pageHref);
            return (
              <Link
                key={item.label}
                to={hrefFor(item.sectionId, item.pageHref)}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-[13px] font-normal tracking-[0.02em] transition-colors ${
                  active ? "text-chalk" : "text-smoke hover:text-chalk"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    className="absolute inset-x-0 -bottom-[2px] h-px bg-chalk"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="/cv.pdf" download="Esmalla_Jay_CV.pdf" className="ghost-button">
            CV <Download size={13} />
          </a>
          <Link
            to={contactHref}
            aria-current={contactActive ? "page" : undefined}
            className={contactActive ? "ghost-button" : "primary-pill"}
          >
            LET&apos;S CHAT <ArrowUpRight size={14} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-[8px] border border-graphite text-chalk transition-colors hover:border-iron lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-graphite" aria-hidden="true">
        <motion.div
          className="h-full origin-left bg-chalk"
          animate={{ scaleX: scrollProgress }}
          transition={{ duration: 0.12, ease: "linear" }}
        />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-graphite bg-obsidian lg:hidden"
          >
            <div className="page-container flex flex-col py-5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.sectionId, item.pageHref);
                return (
                  <Link
                    key={item.label}
                    to={hrefFor(item.sectionId, item.pageHref)}
                    aria-current={active ? "page" : undefined}
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
                <a href="/cv.pdf" download="Esmalla_Jay_CV.pdf" className="ghost-button justify-center">
                  CV <Download size={13} />
                </a>
                <Link to={contactHref} className={contactActive ? "ghost-button justify-center" : "primary-pill justify-center"}>
                  LET&apos;S CHAT <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
