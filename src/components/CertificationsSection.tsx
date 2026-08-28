import { motion } from "framer-motion";
import { ArrowUpRight, Database, ShieldCheck } from "lucide-react";
import { certifications } from "@/data/portfolio";

const CertificationsSection = () => (
  <section id="certifications" className="section-shell scroll-mt-[72px]">
    <div className="page-container">
      <div className="section-heading-grid">
        <div>
          <p className="section-kicker">04 / CREDENTIALS</p>
          <h2 className="section-title">Verified foundations behind the systems I build.</h2>
        </div>
        <p className="self-end text-[15px] leading-[1.6] text-smoke">
          Credentials and certifications that support my technical foundation.
        </p>
      </div>

      <div className="mt-12 space-y-4 md:mt-14">
        {certifications.map((certification, index) => (
          <motion.a
            key={certification.id}
            href={certification.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="grid rounded-[8px] border border-graphite transition-colors hover:border-iron md:grid-cols-[120px_1fr_auto]"
          >
            <div className="grid min-h-28 place-items-center border-b border-graphite md:border-b-0 md:border-r">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-graphite">
                <Database size={24} strokeWidth={1.5} className="icon-gold" />
              </div>
            </div>
            <div className="p-7 md:p-8">
              <div className="flex items-center gap-2 text-smoke">
                <ShieldCheck size={14} strokeWidth={1.5} className="icon-gold" />
                <span className="meta-text">{certification.issuerTag}</span>
              </div>
              <h3 className="mt-4 text-[23px] font-normal tracking-[-0.01em] text-chalk">{certification.name}</h3>
              <p className="mt-2 text-[14px] text-smoke">{certification.issuer}</p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
                <p className="meta-text text-smoke">ISSUED {certification.issuedDate}</p>
                {certification.expiryDate && <p className="meta-text text-smoke">EXPIRES {certification.expiryDate}</p>}
                {certification.verificationCode && <p className="meta-text text-smoke">ID {certification.verificationCode}</p>}
              </div>
            </div>
            <div className="flex items-center border-t border-graphite p-7 md:border-l md:border-t-0">
              <span className="ghost-button whitespace-nowrap">VERIFY <ArrowUpRight size={13} /></span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default CertificationsSection;
