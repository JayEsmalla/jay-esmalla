import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { socialLinks } from "@/data/portfolio";

const Footer = () => (
  <footer className="border-t border-graphite bg-obsidian/60">
    <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <p className="meta-text text-smoke">
        © {new Date().getFullYear()} JAY ESMALLA · TAGUM CITY, PH
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono-retro text-[11px] uppercase tracking-[0.05em] text-smoke">
        <a
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-chalk"
        >
          GITHUB <ArrowUpRight size={11} />
        </a>
        {socialLinks.linkedin && socialLinks.linkedin !== "https://linkedin.com" && (
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-chalk"
          >
            LINKEDIN <ArrowUpRight size={11} />
          </a>
        )}
        <Link to="/contact" className="hover:text-chalk">
          CONTACT
        </Link>
        <a
          href="#home"
          className="inline-flex items-center gap-1.5 rounded-[3px] border border-graphite px-3 py-1.5 transition-colors hover:border-pulse-green hover:text-pulse-green"
          aria-label="Back to top"
        >
          TOP <ArrowUp size={11} />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
