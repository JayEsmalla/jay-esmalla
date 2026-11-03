import Reveal from "@/components/Reveal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { certifications, type Certification } from "@/data/portfolio";
import { useReveal } from "@/lib/motion";
import { motion } from "framer-motion";
import { ArrowUpRight, Expand } from "lucide-react";
import { useRef, useState } from "react";

const CertificationsSection = () => {
  const reveal = useReveal();
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement | null>(null);

  return (
    <section id="certifications" className="section-shell scroll-mt-6">
      {/* ── Connected Section Header Band ── */}
      <div className="section-header-band">
        <Reveal className="section-heading-grid">
          <div>
            <p className="section-kicker">04 / CREDENTIALS</p>
            <h2 className="section-title">Certifications &amp; participation.</h2>
          </div>
          <p className="self-end text-[15px] leading-[1.6] text-smoke">
            Technical certification and participation in local innovation events. Select a credential to inspect it full size.
          </p>
        </Reveal>
      </div>

      {/* ── Connected 1px Hairline Credential Grid ── */}
      <div className="grid gap-px bg-graphite sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((certification, index) => {
          const certIndex = String(index + 1).padStart(2, "0");
          return (
            <motion.article
              key={certification.id}
              {...reveal(index)}
              className="group flex min-w-0 flex-col overflow-hidden bg-carbon transition-colors hover:bg-obsidian/80"
            >
              <div
                className="h-[2px] w-full shrink-0"
                style={{ background: certification.type === "Certification" ? "var(--color-pulse-green)" : "var(--color-compass-gold)" }}
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setSelectedCert(certification);
                }}
                aria-label={`Inspect ${certification.name} certificate`}
                className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-graphite bg-obsidian p-4 text-left focus-visible:outline-offset-[-4px]"
              >
                <div className="h-full w-full overflow-hidden rounded-[2px] bg-[#f5f3ef]">
                  <img
                    src={certification.image}
                    srcSet={certification.imageSrcSet}
                    sizes="(min-width: 1200px) 365px, (min-width: 1024px) calc((100vw - 104px) / 3), (min-width: 640px) calc((100vw - 84px) / 2), calc(100vw - 40px)"
                    alt={certification.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="absolute bottom-6 right-6 grid h-8 w-8 place-items-center rounded-[3px] border border-iron bg-carbon/90 text-chalk opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Expand size={14} />
                </span>
              </button>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex w-fit items-center rounded-[2px] px-2 py-0.5 font-mono-retro text-[10px] font-normal uppercase tracking-[0.05em] ${
                      certification.type === "Certification"
                        ? "border border-pulse-green/30 bg-pulse-green/10 text-pulse-green"
                        : "border border-compass-gold/30 bg-compass-gold/10 text-compass-gold"
                    }`}
                  >
                    {certification.type}
                  </span>
                  <span className="font-mono-retro text-[11px] text-smoke/50" aria-hidden="true">{certIndex}</span>
                </div>

                <h3 className="mt-3.5 text-[20px] font-normal leading-tight tracking-[-0.02em] text-chalk">{certification.name}</h3>
                {certification.recognition && <p className="mt-2 text-[14px] leading-relaxed text-ash">{certification.recognition}</p>}
                <p className="mt-2.5 text-[14px] leading-relaxed text-smoke">{certification.issuer}</p>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-graphite pt-4 text-[12px] leading-relaxed text-smoke">
                  <div className="font-mono-retro text-[11px]">
                    <p>ISSUED {certification.issuedDate.toUpperCase()}</p>
                    {certification.expiryDate && <p className="text-smoke/60">VALID TO {certification.expiryDate.toUpperCase()}</p>}
                  </div>
                  <a
                    href={certification.fullImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View full-size ${certification.name} certificate (opens in a new tab)`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-graphite text-smoke transition-colors hover:border-iron hover:text-chalk"
                    title="Open raw certificate in new tab"
                  >
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <Dialog open={Boolean(selectedCert)} onOpenChange={(open) => !open && setSelectedCert(null)}>
        <DialogContent
          className="flex max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] flex-col gap-0 overflow-hidden rounded-[6px] border-iron bg-carbon p-0 text-chalk shadow-none sm:max-w-3xl"
          onOpenAutoFocus={(event) => { event.preventDefault(); dialogTitleRef.current?.focus(); }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus({ preventScroll: true });
          }}
        >
          {selectedCert && (
            <>
              <DialogHeader className="shrink-0 border-b border-graphite p-5 pr-16 text-left sm:px-7 sm:py-5">
                <p className="section-kicker">{selectedCert.type}</p>
                <DialogTitle ref={dialogTitleRef} tabIndex={-1} className="mt-2 text-[22px] font-normal leading-tight tracking-[-0.02em] text-chalk sm:text-[28px]">
                  {selectedCert.name}
                </DialogTitle>
                <DialogDescription className="mt-1 text-[13px] text-smoke">
                  {selectedCert.issuer} · Issued {selectedCert.issuedDate}
                </DialogDescription>
              </DialogHeader>
              <div className="no-scrollbar min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7">
                <div className="overflow-hidden rounded-[4px] border border-graphite bg-[#f5f3ef]">
                  <img
                    src={selectedCert.fullImage}
                    alt={selectedCert.imageAlt}
                    className="max-h-[62dvh] w-full object-contain"
                  />
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="font-mono-retro text-[11px] text-smoke">
                    {selectedCert.recognition ? `${selectedCert.recognition} · ` : ""}
                    {selectedCert.expiryDate ? `Valid through ${selectedCert.expiryDate}` : `Issued ${selectedCert.issuedDate}`}
                  </div>
                  <a
                    href={selectedCert.fullImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ghost-button"
                  >
                    OPEN ORIGINAL <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CertificationsSection;
