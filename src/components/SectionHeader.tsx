import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

type SectionHeaderProps = {
  /** Two-digit chapter number rendered as a large outlined anchor. */
  number: string;
  kicker: string;
  title: ReactNode;
  /** Right-hand column: lede copy, filters, or actions. */
  children?: ReactNode;
  titleClassName?: string;
};

/** Shared chapter header so every home section opens with the same anchor and rhythm. */
export default function SectionHeader({ number, kicker, title, children, titleClassName = "" }: SectionHeaderProps) {
  return (
    <div className="section-header-band">
      <Reveal className="grid gap-6 lg:grid-cols-[auto_minmax(0,1.08fr)_minmax(280px,0.75fr)] lg:items-end lg:gap-10">
        <span aria-hidden="true" className="outline-numeral hidden sm:block">{number}</span>
        <div>
          <p className="section-kicker">{kicker}</p>
          <h2 className={`section-title text-balance ${titleClassName}`}>{title}</h2>
        </div>
        {children && <div className="flex flex-col justify-end">{children}</div>}
      </Reveal>
    </div>
  );
}

