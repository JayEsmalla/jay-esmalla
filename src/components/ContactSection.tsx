import { motion } from "framer-motion";
import { ArrowUpRight, Facebook, Github, Linkedin, Mail, MapPin, Send } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { socialLinks } from "@/data/portfolio";

const initialForm = { name: "", email: "", subject: "", message: "" };

const SOCIALS = [
  { icon: Github, href: socialLinks.github, label: "GitHub", sub: "@JayEsmalla" },
  { icon: Linkedin, href: socialLinks.linkedin, label: "LinkedIn", sub: "Jay Esmalla" },
  { icon: Facebook, href: "https://www.facebook.com/jaecoleeee/", label: "Facebook", sub: "@jaecoleeee" },
  { icon: Mail, href: `mailto:${socialLinks.email}`, label: "Email", sub: socialLinks.email },
].filter(({ href }) => href && href !== "https://linkedin.com");

const ContactSection = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");

  const handle = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const subject = form.subject.trim() || `Portfolio Contact from ${form.name.trim()}`;
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      form.subject.trim() ? `Subject: ${form.subject.trim()}` : "",
      "",
      form.message.trim(),
    ].filter(Boolean).join("\n");

    window.location.href = `mailto:${socialLinks.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Opening your email client…");
  };

  return (
    <section id="contact" className="section-shell scroll-mt-[72px]">
      <div className="page-container">
        <div className="section-heading-grid">
          <div>
            <p className="section-kicker">06 / CONTACT</p>
            <h2 className="section-title">Have a project, collaboration, or idea worth building?</h2>
            <a href={`mailto:${socialLinks.email}`} className="primary-pill mt-8">
              LET'S CHAT <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="self-end">
            <div className="flex items-start gap-3 border-b border-graphite pb-5">
              <MapPin size={18} strokeWidth={1.5} className="icon-gold mt-0.5" />
              <div>
                <p className="text-[14px] text-chalk">Based in Tagum City</p>
                <p className="meta-text mt-2 text-smoke">DAVAO DEL NORTE, PHILIPPINES</p>
              </div>
            </div>
            <p className="mt-5 text-[15px] leading-[1.6] text-smoke">
              Reach out directly or use the form below. Submitting the form opens your default email client with the message prepared.
            </p>
          </div>
        </div>

        <div className="mt-12 grid rounded-[8px] border border-graphite md:mt-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="border-b border-graphite p-7 lg:border-b-0 lg:border-r lg:p-8">
            <p className="section-kicker">FIND ME ONLINE</p>
            <div className="mt-6 divide-y divide-graphite border-y border-graphite">
              {SOCIALS.map(({ icon: Icon, href, label, sub }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-5 group">
                  <Icon size={18} strokeWidth={1.5} className="icon-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-chalk">{label}</p>
                    <p className="meta-text mt-1 truncate text-smoke">{sub}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-smoke transition-colors group-hover:text-chalk" />
                </a>
              ))}
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="p-7 lg:p-8"
          >
            <p className="section-kicker">SEND A MESSAGE</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input type="text" placeholder="Name" aria-label="Name" autoComplete="name" value={form.name} onChange={handle("name")} className="field-control" required />
              <input type="email" placeholder="Email" aria-label="Email" autoComplete="email" value={form.email} onChange={handle("email")} className="field-control" required />
            </div>
            <input type="text" placeholder="Subject" aria-label="Subject" value={form.subject} onChange={handle("subject")} className="field-control mt-4" />
            <textarea placeholder="Message" aria-label="Message" rows={6} minLength={10} value={form.message} onChange={handle("message")} className="field-control mt-4 resize-none" required />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" className="primary-pill justify-center">
                SEND MESSAGE <Send size={13} />
              </button>
              {status && <p className="meta-text text-smoke" role="status">{status}</p>}
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
