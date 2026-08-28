import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { socialLinks } from "@/data/portfolio";

const Footer = () => (
  <footer className="border-t border-graphite bg-obsidian">
    <div className="page-container py-8">
      <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[14px] text-chalk">{socialLinks.email}</p>
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
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
