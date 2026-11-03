import SectionHeader from "@/components/SectionHeader";
import { useReveal, useMotionSettings, motionTokens } from "@/lib/motion";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check, CheckCircle2, Copy, Facebook, Github, Linkedin, Mail, MapPin, Send, XCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { socialLinks } from "@/data/portfolio";

const initialForm = { name: "", email: "", subject: "", message: "" };
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = "e89329f9-ed99-4cb5-82e5-27be3bc74979";
const SEND_TIMEOUT_MS = 15_000;
const MESSAGE_MAX = 1200;
type FormErrors = Partial<Record<keyof typeof initialForm, string>>;
type SubmissionStatus = { type: "idle" | "sending" | "success" | "error"; message: string };

const SOCIALS = [
  { icon: Github,   href: socialLinks.github,                      label: "GitHub",   sub: "@JayEsmalla" },
  { icon: Linkedin, href: socialLinks.linkedin,                    label: "LinkedIn", sub: "Jay Esmalla" },
  { icon: Facebook, href: "https://www.facebook.com/jaecoleeee/", label: "Facebook", sub: "@jaecoleeee" },
  { icon: Mail,     href: `mailto:${socialLinks.email}`,           label: "Email",    sub: socialLinks.email },
].filter(({ href }) => href && href !== "https://linkedin.com");

const ContactSection = () => {
  const reveal = useReveal();
  const { reduced } = useMotionSettings();
  const [form, setForm]     = useState(initialForm);
  const [status, setStatus] = useState<SubmissionStatus>({ type: "idle", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [copied, setCopied] = useState(false);
  const requestController   = useRef<AbortController | null>(null);
  const isSending           = status.type === "sending";
  const emailFallback       = `mailto:${socialLinks.email}?subject=${encodeURIComponent(form.subject.trim() || "Project enquiry")}&body=${encodeURIComponent(form.message)}`;
  const charsLeft           = MESSAGE_MAX - form.message.length;

  useEffect(() => () => { requestController.current?.abort(); requestController.current = null; }, []);

  const handle = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = field === "message" ? event.target.value.slice(0, MESSAGE_MAX) : event.target.value;
    setForm((c) => ({ ...c, [field]: val }));
    setErrors((c) => ({ ...c, [field]: undefined }));
    if (status.type === "success") setStatus({ type: "idle", message: "" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestController.current) return;

    const nextErrors: FormErrors = {};
    if (!form.name.trim())                                            nextErrors.name    = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))       nextErrors.email   = "Enter a valid email address.";
    if (form.message.trim().length < 10)                              nextErrors.message = "Write at least 10 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("name",      form.name.trim());
    formData.set("email",     form.email.trim());
    formData.set("message",   form.message.trim());
    formData.set("access_key", WEB3FORMS_ACCESS_KEY);
    formData.set("from_name", "Jay Esmalla");
    formData.set("subject",   form.subject.trim() || `Website contact from ${form.name.trim()}`);

    setStatus({ type: "sending", message: "" });
    const controller = new AbortController();
    requestController.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, SEND_TIMEOUT_MS);

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, { method: "POST", body: formData, signal: controller.signal });
      const result = (await res.json()) as { success?: boolean };
      if (!res.ok || !result.success) throw new Error("failed");
      if (requestController.current !== controller) return;
      setForm(initialForm);
      setStatus({ type: "success", message: "Message sent. I'll get back to you soon." });
    } catch {
      if (requestController.current !== controller) return;
      setStatus({
        type: "error",
        message: timedOut
          ? "Sending timed out. Your message is still here — try again or email me directly."
          : "Delivery couldn't be confirmed. Try again or email me directly.",
      });
    } finally {
      window.clearTimeout(timeout);
      if (requestController.current === controller) requestController.current = null;
    }
  };

  return (
    <section id="contact" className="section-shell scroll-mt-6">
      {/* ── Connected Section Header Band ── */}
      <SectionHeader
        number="05"
        kicker="CONTACT"
        title="Have a project, collaboration, or idea worth building?"
      >
        <div className="flex flex-col justify-end gap-4">
          <div className="flex items-start gap-3">
            <MapPin size={16} strokeWidth={1.5} className="icon-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-[14px] text-chalk">Based in Tagum City</p>
              <p className="meta-text mt-1 text-smoke">DAVAO DEL NORTE, PHILIPPINES</p>
            </div>
          </div>
          <p className="text-[15px] leading-[1.6] text-smoke">
            Reach out directly or use the form below. I typically respond within 24 hours.
          </p>
        </div>
      </SectionHeader>

      {/* ── Connected Split Contact Grid ── */}
      <div className="lg:grid lg:grid-cols-[310px_1fr]">
        {/* ── Left: socials ── */}
        <div className="flex flex-col border-b border-graphite bg-obsidian/50 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="section-kicker mb-5">FIND ME ONLINE</p>
          <div className="flex flex-col gap-1">
            {SOCIALS.map(({ icon: Icon, href, label, sub }) => (
              <a
                key={label}
                href={href}
                target={label === "Email" ? undefined : "_blank"}
                rel={label === "Email" ? undefined : "noopener noreferrer"}
                className="group flex items-center gap-3 rounded-[4px] border border-transparent px-3 py-3 transition-colors hover:border-graphite hover:bg-signal-white/[0.03]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[3px] border border-graphite bg-carbon text-smoke transition-colors group-hover:border-pulse-green/50 group-hover:text-pulse-green">
                  <Icon size={14} strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-chalk">{label}</p>
                  <p className="meta-text mt-0.5 truncate text-smoke">{sub}</p>
                </div>
                <ArrowUpRight size={13} className="shrink-0 text-smoke/40 transition-colors group-hover:text-pulse-green" />
              </a>
            ))}
          </div>

          <div className="mt-auto border-t border-graphite pt-5">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <p className="meta-text text-smoke">OR EMAIL DIRECTLY</p>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(socialLinks.email).catch(() => undefined);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1800);
                }}
                aria-label="Copy email address"
                className={`inline-flex items-center gap-1 rounded-[2px] border px-2 py-0.5 font-mono-retro text-[10px] uppercase tracking-[0.04em] transition-colors ${
                  copied
                    ? "border-pulse-green text-pulse-green"
                    : "border-iron text-smoke hover:border-chalk hover:text-chalk"
                }`}
              >
                {copied ? <Check size={10} /> : <Copy size={10} />}
                <span>{copied ? "COPIED ✓" : "COPY"}</span>
              </button>
            </div>
            <a
              href={`mailto:${socialLinks.email}`}
              className="block truncate font-mono-retro text-[12px] text-chalk underline decoration-iron underline-offset-4 hover:decoration-pulse-green hover:text-pulse-green"
            >
              {socialLinks.email}
            </a>
          </div>
        </div>

        {/* ── Right: form ── */}
        <motion.form
          {...reveal(1, 8)}
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSending}
          className="bg-carbon p-6 sm:p-8 lg:p-10"
        >
          <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <p className="section-kicker mb-5">SEND A MESSAGE</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-1.5 block text-[13px] text-smoke">
                Name <span className="text-pulse-green">*</span>
              </label>
              <input
                id="contact-name" type="text" name="name" autoComplete="name"
                value={form.name} onChange={handle("name")}
                className="field-control disabled:opacity-50"
                placeholder="Your name"
                required disabled={isSending}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
              />
              {errors.name && <p id="contact-name-error" className="mt-1.5 text-[12px] text-error" role="alert">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block text-[13px] text-smoke">
                Email <span className="text-pulse-green">*</span>
              </label>
              <input
                id="contact-email" type="email" name="email" autoComplete="email"
                value={form.email} onChange={handle("email")}
                className="field-control disabled:opacity-50"
                placeholder="you@email.com"
                required disabled={isSending}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
              />
              {errors.email && <p id="contact-email-error" className="mt-1.5 text-[12px] text-error" role="alert">{errors.email}</p>}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="contact-subject" className="text-[13px] text-smoke">Subject</label>
              <span className="text-[11px] text-smoke/50">Optional</span>
            </div>
            <input
              id="contact-subject" type="text" name="subject"
              value={form.subject} onChange={handle("subject")}
              className="field-control disabled:opacity-50"
              placeholder="What's this about?"
              disabled={isSending}
            />
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="contact-message" className="text-[13px] text-smoke">
                Message <span className="text-pulse-green">*</span>
              </label>
              <span className={`font-mono text-[11px] tabular-nums transition-colors ${charsLeft < 100 ? "text-warning" : "text-smoke/40"}`}>
                {charsLeft}
              </span>
            </div>
            <textarea
              id="contact-message" name="message" rows={5} minLength={10}
              value={form.message} onChange={handle("message")}
              className="field-control min-h-[140px] resize-y disabled:opacity-50"
              placeholder="Tell me about your project, idea, or question…"
              required disabled={isSending}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
            />
            {errors.message && <p id="contact-message-error" className="mt-1.5 text-[12px] text-error" role="alert">{errors.message}</p>}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="primary-pill justify-center disabled:cursor-wait disabled:opacity-50"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <circle cx={12} cy={12} r={10} strokeOpacity={0.25} />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  SENDING…
                </>
              ) : status.type === "error" ? (
                <>TRY AGAIN <Send size={13} /></>
              ) : (
                <>SEND MESSAGE <Send size={13} /></>
              )}
            </button>
            <a href={emailFallback} className="inline-flex min-h-11 items-center gap-1.5 font-mono-retro text-[11px] uppercase tracking-[0.04em] text-smoke underline decoration-iron underline-offset-4 hover:text-chalk">
              Email directly <ArrowUpRight size={13} />
            </a>
          </div>

          <AnimatePresence>
            {status.message && (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : motionTokens.overlay, ease: motionTokens.ease }}
                className={`mt-4 flex items-start gap-2.5 rounded-[4px] border px-4 py-3 text-[13px] leading-relaxed ${
                  status.type === "success"
                    ? "border-pulse-green/20 bg-pulse-green/5 text-pulse-green"
                    : "border-error/20 bg-error/5 text-error"
                }`}
                role={status.type === "error" ? "alert" : "status"}
              >
                {status.type === "success"
                  ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  : <XCircle     size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                }
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
