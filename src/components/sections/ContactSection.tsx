import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MapPin, Phone, Check } from "lucide-react";
import { submitContactMessage } from "@/lib/inquiries.functions";
import {
  Reveal,
  SideLabel,
  HalftoneBackdrop,
  Eyebrow,
} from "@/components/motion-primitives";

export function ContactSection({ id = "contact" }: { id?: string }) {
  const submit = useServerFn(submitContactMessage);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries()) as Record<string, string>;
    try {
      await submit({ data: payload as never });
      setStatus("ok");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
      setStatus("error");
    }
  }

  return (
    <div id={id} className="scroll-mt-24">
      <section className="relative px-5 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-28 bg-background text-text-primary overflow-hidden">
        <HalftoneBackdrop />
        <SideLabel>Reach out · yalinetworknig@gmail.com</SideLabel>
        <SideLabel side="right" tone="muted">Reply within 2 business days</SideLabel>
        <div className="relative max-w-4xl mx-auto text-center">
          <Reveal><Eyebrow>Get in touch</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mt-5 mb-6 leading-[1.05]">
              Talk to a <span className="text-accent-cyan">real human, fast.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Registration, sponsorship, media accreditation, partnerships — drop a note and we'll route it to the right person the same day.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 sm:px-6 lg:px-8 pb-24 md:pb-32 bg-background text-text-primary">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-8">
          <Reveal as="aside" className="space-y-4">
            <InfoCard
              Icon={Mail}
              label="Email"
              value="yalinetworknig@gmail.com"
              href="mailto:yalinetworknig@gmail.com"
            />
            <InfoCard
              Icon={Phone}
              label="Phone"
              value={"+234 803 520 9226\n+234 803 883 8094"}
              href="tel:+2348035209226"
            />
            <InfoCard
              Icon={MapPin}
              label="Venue"
              value="Lagos, Nigeria · Sept 10–13, 2026"
            />
          </Reveal>

          {status === "ok" ? (
            <div className="rounded-2xl border border-accent-cyan bg-surface p-10 text-center flex flex-col items-center justify-center">
              <Check className="w-10 h-10 text-accent-cyan mb-3" />
              <h3 className="font-display font-semibold text-xl mb-1">
                Message sent.
              </h3>
              <p className="text-text-secondary">
                Got it. A real person will reply within 2 business days.
              </p>
            </div>
          ) : (
            <Reveal delay={0.1}>
              <form
                onSubmit={onSubmit}
                className="rounded-3xl border border-border-strong bg-surface p-6 md:p-8 space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <Field label="Subject" name="subject" required />
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    minLength={10}
                    maxLength={2000}
                    className="w-full rounded-xl border border-border-strong bg-background p-3 text-text-primary focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                {error && <p className="text-sm text-error">{error}</p>}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full px-7 py-3 rounded-full text-base font-semibold bg-accent-cyan text-brand-navy hover:scale-[1.01] transition-transform disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending…" : "Send it over"}
                </button>
              </form>
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <div className="rounded-2xl border border-border-strong bg-surface p-5 flex items-start gap-3 h-full">
      <span className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-accent-cyan" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-widest text-text-secondary">
          {label}
        </p>
        <p className="font-semibold text-text-primary whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:opacity-90 transition-opacity">
      {body}
    </a>
  ) : (
    body
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        maxLength={255}
        className="w-full rounded-xl border border-border-strong bg-background p-3 text-text-primary focus:outline-none focus:border-accent-cyan"
      />
    </div>
  );
}