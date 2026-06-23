import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { CheckCircle2, Calendar, Share2, Home, Ticket } from "lucide-react";
import { getRegistrationById } from "@/lib/registrations.functions";
import { TRACKS } from "@/lib/register/tracks";
import { staggerContainer, staggerChild, spring, ease, successPop } from "@/lib/motion";

const ATTENDEE_LABELS: Record<string, string> = {
  delegate: "YALI Delegate",
  sponsor: "Sponsor Representative",
  media: "Media",
  public: "General Public",
  volunteer: "Volunteer",
};

export const Route = createFileRoute("/register/$id")({
  head: () => ({
    meta: [
      { title: "Registration confirmed — YALI Summit 2026" },
      { name: "description", content: "Your ticket for the YALI Network Nigeria Summit 2026." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id } = useParams({ from: "/register/$id" });
  const fetchReg = useServerFn(getRegistrationById);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [icsUrl, setIcsUrl] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["registration", id],
    queryFn: () => fetchReg({ data: { id } }),
  });

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = JSON.stringify({
      id: data.id,
      ticket: data.ticket_code,
      name: data.full_name,
      url: `${origin}/register/${data.id}`,
    });
    QRCode.toCanvas(canvasRef.current, payload, {
      width: 200,
      margin: 1,
      color: { dark: "#0A1128", light: "#FFFFFF" },
    });
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const ics = buildIcs(data.full_name);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    setIcsUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [data]);

  if (isLoading) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14 animate-pulse">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full" style={{ background: "var(--surface)" }} />
          <div className="h-8 w-48 rounded-lg" style={{ background: "var(--surface)" }} />
          <div className="h-4 w-64 rounded" style={{ background: "var(--surface)" }} />
        </div>
        <div
          className="rounded-2xl border p-6 sm:p-8 flex flex-col items-center gap-4"
          style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}
        >
          <div className="w-[220px] h-[220px] rounded-xl" style={{ background: "var(--surface)" }} />
          <div className="h-4 w-40 rounded" style={{ background: "var(--surface)" }} />
          <div className="h-4 w-32 rounded" style={{ background: "var(--surface)" }} />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          We couldn't find this registration
        </h1>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          Please check the link or register again.
        </p>
        <Link
          to="/register"
          className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}
        >
          Back to registration
        </Link>
      </section>
    );
  }

  const track = TRACKS.find((t) => t.slug === data.track_selection);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/register/${data.id}`;
  const firstName = data.full_name.split(" ")[0];
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `I just registered for YALI Summit 2026! Join me at ${shareUrl}`,
  )}`;

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      {/* Hero celebration header */}
      <motion.div
        className="flex flex-col items-center text-center mb-8"
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
      >
        {/* Animated checkmark — spring pop with glow ring */}
        <motion.div
          className="relative mb-4"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: spring.bouncy,
            },
          }}
        >
          {/* Pulsing glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--success)" }}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.2, ease: ease.out, delay: 0.3, repeat: Infinity, repeatDelay: 1.8 }}
          />
          <CheckCircle2
            className="w-16 h-16 relative z-10"
            style={{ color: "var(--success)" }}
          />
        </motion.div>

        <motion.h1
          variants={staggerChild}
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "var(--text-primary)",
            fontWeight: 700,
          }}
        >
          You're in, {firstName}! 🎉
        </motion.h1>

        <motion.p variants={staggerChild} className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Your registration for AIDIFILN 2026 is confirmed.
        </motion.p>

        {data.email && (
          <motion.p variants={staggerChild} className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            We've emailed your ticket to{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{data.email}</span>.
          </motion.p>
        )}

        <motion.div variants={staggerChild}>
          <Link
            to="/ticket/$code"
            params={{ code: data.ticket_code }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
            style={{ color: "var(--accent-cyan)" }}
          >
            <Ticket className="w-3.5 h-3.5" />
            Open shareable ticket page →
          </Link>
        </motion.div>
      </motion.div>

      {/* Ticket card with staggered details */}
      <motion.div
        className="rounded-2xl border p-6 sm:p-8 mb-6 overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: ease.out }}
      >
        {/* QR Code — delayed fade-in after card appears */}
        <motion.div
          className="flex justify-center mb-5"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: ease.out }}
        >
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <canvas ref={canvasRef} aria-label="Ticket QR code" />
          </div>
        </motion.div>

        {/* Ticket code */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.3 }}
        >
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
            Ticket code
          </div>
          <div
            className="font-mono text-sm break-all px-4 py-2 rounded-lg inline-block"
            style={{
              color: "var(--accent-cyan)",
              background: "color-mix(in oklab, var(--accent-cyan) 8%, transparent)",
              border: "1px solid color-mix(in oklab, var(--accent-cyan) 20%, transparent)",
            }}
          >
            {data.ticket_code}
          </div>
        </motion.div>

        {/* Detail rows — staggered */}
        <motion.dl
          className="grid grid-cols-2 gap-3 w-full text-sm border-t pt-4"
          style={{ borderColor: "var(--border-strong)" }}
          variants={staggerContainer(0.07)}
          initial="hidden"
          animate="visible"
          custom={0.7}
        >
          {[
            { label: "Name", value: data.full_name },
            { label: "Track", value: track?.title ?? data.track_selection },
            { label: "Attendee type", value: ATTENDEE_LABELS[data.attendee_type ?? ""] ?? data.attendee_type },
            { label: "State", value: data.state },
          ].map(({ label, value }) =>
            value ? (
              <motion.div key={label} variants={staggerChild}>
                <dt style={{ color: "var(--text-secondary)" }}>{label}</dt>
                <dd className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                  {value}
                </dd>
              </motion.div>
            ) : null,
          )}
        </motion.dl>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="visible"
      >
        {icsUrl && (
          <motion.a
            href={icsUrl}
            download="yali-summit-2026.ics"
            variants={staggerChild}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={spring.snappy}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border min-h-[48px]"
            style={{ borderColor: "var(--accent-cyan)", color: "var(--accent-cyan)" }}
          >
            <Calendar className="w-4 h-4" /> Add to calendar
          </motion.a>
        )}
        <motion.a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          variants={staggerChild}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold min-h-[48px]"
          style={{ background: "var(--success)", color: "#FFFFFF" }}
        >
          <Share2 className="w-4 h-4" /> Share on WhatsApp
        </motion.a>
        <motion.div variants={staggerChild} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border min-h-[48px]"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function buildIcs(name: string) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YALI Network Nigeria//Summit 2026//EN",
    "BEGIN:VEVENT",
    `UID:yali-summit-2026-${Date.now()}@yalinetwork.ng`,
    `DTSTAMP:${stamp}`,
    "DTSTART:20260911T080000",
    "DTEND:20260914T180000",
    "SUMMARY:YALI Network Nigeria National Summit (AIDIFILN) 2026",
    `DESCRIPTION:Registered as ${name}. AI\\, Digital Innovation and the Future of Inclusive Leadership in Nigeria.`,
    "LOCATION:Lagos, Nigeria (venue TBA)",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
