import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { socialLinks } from "@/data/portfolio";

const Footer = () => (
  <footer className="border-t border-graphite bg-obsidian">
    <div className="page-container py-8">
      <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="meta-text text-smoke">OPEN TO OPPORTUNITIES &amp; FREELANCE</p>
          <a href={`mailto:${socialLinks.email}`} className="mt-2 inline-flex min-h-11 items-center text-[14px] text-chalk underline decoration-iron underline-offset-4 hover:decoration-chalk">{socialLinks.email}</a>
          <p className="meta-text mt-2 text-smoke">© {new Date().getFullYear()} JAY FACTOLARIN ESMALLA · TAGUM CITY, PH</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-smoke">
          <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-chalk">
            GITHUB <ArrowUpRight size={11} />
          </a>
          {socialLinks.linkedin && socialLinks.linkedin !== "https://linkedin.com" && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-chalk">
              LINKEDIN <ArrowUpRight size={11} />
            </a>
          )}
          <Link to="/contact" className="hover:text-chalk">CONTACT</Link>
          <a
            href="#home"
            className="inline-flex items-center gap-1.5 border border-graphite rounded-[4px] px-3 py-1.5 transition-colors hover:border-iron hover:text-chalk"
            aria-label="Back to top"
          >
            TOP <ArrowUp size={11} />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
