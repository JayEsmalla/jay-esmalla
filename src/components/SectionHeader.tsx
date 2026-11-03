import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

type SectionHeaderProps = {
  /** Two-digit chapter number rendered inline with the section kicker. */
  number: string;
  kicker: string;
  title: ReactNode;
  /** Right-hand column: lede copy, filters, or actions. */
  children?: ReactNode;
  titleClassName?: string;
};

/** Shared chapter header so every home section opens with the same left alignment and rhythm. */
export default function SectionHeader({ number, kicker, title, children, titleClassName = "" }: SectionHeaderProps) {
  return (
    <div className="section-header-band">
      <Reveal className="section-heading-grid lg:items-end">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono-retro text-[11px] tabular-nums tracking-[0.06em] text-pulse-green">
              {number}
            </span>
            <span aria-hidden="true" className="h-px w-3.5 bg-iron" />
            <p className="section-kicker">{kicker}</p>
          </div>
          <h2 className={`section-title text-balance ${titleClassName}`}>{title}</h2>
        </div>
        {children && <div className="flex flex-col justify-end">{children}</div>}
      </Reveal>
    </div>
  );
}
