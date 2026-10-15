import Reveal from "@/components/Reveal";
import { useReveal } from "@/lib/motion";
import { motion } from "framer-motion";
import { certifications } from "@/data/portfolio";

const CertificationsSection = () => {
  const reveal = useReveal();
  return (
  <section id="certifications" className="section-shell scroll-mt-[72px]">
    <div className="page-container">
      <Reveal className="section-heading-grid">
        <div>
          <p className="section-kicker">04 / CREDENTIALS</p>
          <h2 className="section-title">Certifications &amp; participation.</h2>
        </div>
        <p className="self-end text-[15px] leading-[1.6] text-smoke">
          Technical certification and participation in local innovation events. Select a certificate to view it full size.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((certification, index) => (
          <motion.article
            key={certification.id}
            {...reveal(index)}
            className="flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-graphite bg-carbon transition-colors hover:border-iron"
          >
            {/* Top accent bar */}
            <div
              className="h-[3px] w-full shrink-0"
              style={{ background: certification.type === "Certification" ? "var(--color-pulse-green)" : "var(--color-compass-gold)" }}
              aria-hidden="true"
            />
            <a
              href={certification.fullImage}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View full-size ${certification.name} certificate (opens in a new tab)`}
              className="block aspect-[4/3] min-h-11 shrink-0 border-b border-graphite bg-[#f5f3ef] focus-visible:outline-offset-[-4px]"
            >
              <img
                src={certification.image}
                srcSet={certification.imageSrcSet}
                sizes="(min-width: 1200px) 365px, (min-width: 1024px) calc((100vw - 104px) / 3), (min-width: 640px) calc((100vw - 84px) / 2), calc(100vw - 40px)"
                alt={certification.imageAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </a>
            <div className="flex flex-1 flex-col p-5">
              <span
                className={`inline-flex w-fit items-center rounded-[4px] px-2 py-0.5 text-[10px] font-normal uppercase tracking-[0.05em] ${
                  certification.type === "Certification"
                    ? "bg-pulse-green/10 text-pulse-green"
                    : "bg-compass-gold/10 text-compass-gold"
                }`}
              >
                {certification.type}
              </span>
              <h3 className="mt-3 text-[20px] font-normal leading-tight tracking-[-0.01em] text-chalk">{certification.name}</h3>
              {certification.recognition && <p className="mt-2 text-[14px] leading-relaxed text-ash">{certification.recognition}</p>}
              <p className="mt-3 text-[14px] leading-relaxed text-smoke">{certification.issuer}</p>
              <div className="mt-auto space-y-1 pt-5 text-[13px] leading-relaxed text-smoke">
                <p>Issued {certification.issuedDate}</p>
                {certification.expiryDate && <p>Valid through {certification.expiryDate}</p>}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
  );
};

export default CertificationsSection;
