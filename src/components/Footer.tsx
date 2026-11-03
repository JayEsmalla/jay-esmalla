import { ArrowUp, ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { socialLinks } from "@/data/portfolio";
import { useLocalTime } from "@/lib/local-time";

const Footer = () => {
  const [copied, setCopied] = useState(false);
  const localTime = useLocalTime();

  const handleCopyEmail = () => {
    void navigator.clipboard?.writeText(socialLinks.email).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <footer className="border-t border-graphite bg-obsidian/60">
      <div className="px-5 pt-8 pb-6 sm:px-8 sm:pt-10 lg:px-10">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="meta-text text-smoke">OPEN TO OPPORTUNITIES &amp; FREELANCE</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${socialLinks.email}`}
                className="inline-flex min-h-11 items-center text-[18px] tracking-[-0.02em] text-chalk underline decoration-iron underline-offset-4 transition-colors hover:decoration-pulse-green hover:text-pulse-green sm:text-[22px]"
              >
                {socialLinks.email}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy email address"
                className={`inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 font-mono-retro text-[11px] uppercase tracking-[0.05em] transition-colors ${
                  copied
                    ? "border-pulse-green text-pulse-green"
                    : "border-iron text-ash hover:border-chalk hover:text-chalk"
                }`}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "COPIED ✓" : "COPY"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono-retro text-[11px] uppercase tracking-[0.05em] text-smoke">
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
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-graphite px-3 py-1.5 transition-colors hover:border-pulse-green hover:text-pulse-green"
              aria-label="Back to top"
            >
              TOP <ArrowUp size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* Signature Wordmark echoing the intro screen */}
      <div className="overflow-hidden px-5 pb-3 sm:px-8 lg:px-10" aria-hidden="true">
        <p className="footer-wordmark">
          <span className="text-chalk">Jay</span> Esmalla
        </p>
      </div>

      {/* Bottom Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-graphite px-5 py-3.5 sm:px-8 lg:px-10">
        <p className="meta-text text-smoke">
          © {new Date().getFullYear()} JAY ESMALLA · TAGUM CITY, PH
        </p>
        <p className="meta-text tabular-nums text-smoke">
          {localTime.time} PHT · {localTime.status.toUpperCase()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
