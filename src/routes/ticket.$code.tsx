import { useEffect, useRef } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import { CheckCircle2, AlertTriangle, ShieldCheck, Clock, XCircle, Calendar, Share2, Home, Printer } from "lucide-react";
import { getTicketByCode } from "@/lib/tickets.functions";
import { TRACKS } from "@/lib/register/tracks";

export const Route = createFileRoute("/ticket/$code")({
  head: () => ({
    meta: [
      { title: "Your ticket — YALI Summit 2026" },
      { name: "description", content: "Your QR ticket for the YALI Network Nigeria Summit 2026." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TicketPage,
});

function VerificationBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; fg: string; Icon: any; hint: string }> = {
    verified: { label: "Verified", bg: "rgba(34,197,94,0.15)", fg: "#22c55e", Icon: ShieldCheck, hint: "YALI certificate verified" },
    pending: { label: "Pending review", bg: "rgba(234,179,8,0.15)", fg: "#eab308", Icon: Clock, hint: "Awaiting certificate review" },
    suspicious: { label: "Needs review", bg: "rgba(234,179,8,0.18)", fg: "#f59e0b", Icon: AlertTriangle, hint: "Flagged for manual review" },
    rejected: { label: "Rejected", bg: "rgba(239,68,68,0.18)", fg: "#ef4444", Icon: XCircle, hint: "Certificate rejected" },
    error: { label: "Check pending", bg: "rgba(148,163,184,0.18)", fg: "#94a3b8", Icon: Clock, hint: "Verification will retry" },
  };
  const v = map[status] ?? map.pending;
  const Icon = v.Icon;
  return (
    <span
      title={v.hint}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: v.bg, color: v.fg }}
    >
      <Icon className="w-3.5 h-3.5" /> {v.label}
    </span>
  );
}

function TicketPage() {
  const { code } = useParams({ from: "/ticket/$code" });
  const fetchTicket = useServerFn(getTicketByCode);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ticket", code],
    queryFn: () => fetchTicket({ data: { code } }),
    retry: false,
  });

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, data.ticket_code, {
      width: 260,
      margin: 1,
      color: { dark: "#0A1128", light: "#FFFFFF" },
    });
  }, [data]);

  if (isLoading) {
    return <section className="max-w-2xl mx-auto px-6 py-16 text-center" style={{ color: "var(--text-secondary)" }}>Loading your ticket…</section>;
  }

  if (error || !data) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Ticket not found</h1>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>Double-check the code in your URL or confirmation email.</p>
        <Link to="/register" className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold" style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}>Register</Link>
      </section>
    );
  }

  const track = TRACKS.find((t) => t.slug === data.track_selection);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/ticket/${data.ticket_code}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`I'm attending YALI Summit 2026 — ${shareUrl}`)}`;
  const ics = buildIcs(data.full_name, data.ticket_code);
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14 print:py-0">
      <style>{`@media print { nav, footer, .no-print { display:none !important } body { background:#fff !important } }`}</style>

      <div className="flex flex-col items-center text-center mb-6 no-print">
        <CheckCircle2 className="w-12 h-12 mb-2" style={{ color: "var(--success)" }} />
        <h1 className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(26px, 4vw, 36px)", color: "var(--text-primary)" }}>
          {data.checked_in_at ? "Checked in" : "Your ticket"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {data.checked_in_at
            ? `Welcomed at ${new Date(data.checked_in_at).toLocaleString()}`
            : "Show this QR at the door for check-in."}
        </p>
      </div>

      <div className="rounded-2xl border p-6 sm:p-8 flex flex-col items-center gap-4 mb-6" style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}>
        <div className="flex items-center justify-between w-full">
          <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>YALI Summit 2026</div>
          <VerificationBadge status={data.verification_status} />
        </div>

        <div className="bg-white p-3 rounded-xl">
          <canvas ref={canvasRef} aria-label="Ticket QR code" />
        </div>

        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{data.full_name}</div>
          <div className="font-mono text-xs mt-1 break-all" style={{ color: "var(--text-secondary)" }}>{data.ticket_code}</div>
        </div>

        <dl className="grid grid-cols-2 gap-3 w-full text-sm mt-2">
          <div>
            <dt style={{ color: "var(--text-secondary)" }}>Track</dt>
            <dd className="font-medium" style={{ color: "var(--text-primary)" }}>{track?.title ?? data.track_selection ?? "—"}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--text-secondary)" }}>Type</dt>
            <dd className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>{data.attendee_type}</dd>
          </div>
          <div className="col-span-2">
            <dt style={{ color: "var(--text-secondary)" }}>When & where</dt>
            <dd className="font-medium" style={{ color: "var(--text-primary)" }}>11–14 Sep 2026 · Lagos (venue TBA)</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
        <a href={icsHref} download="yali-summit-2026.ics" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-semibold border" style={{ borderColor: "var(--accent-cyan)", color: "var(--accent-cyan)" }}>
          <Calendar className="w-4 h-4" /> Calendar
        </a>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-semibold" style={{ background: "var(--success)", color: "#fff" }}>
          <Share2 className="w-4 h-4" /> Share
        </a>
        <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-semibold border" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
          <Printer className="w-4 h-4" /> Save PDF
        </button>
        <Link to="/" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-semibold border" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
          <Home className="w-4 h-4" /> Home
        </Link>
      </div>
    </section>
  );
}

function buildIcs(name: string, code: string) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YALI Network Nigeria//Summit 2026//EN",
    "BEGIN:VEVENT",
    `UID:yali-summit-${code}@yalinetwork.ng`,
    `DTSTAMP:${stamp}`,
    "DTSTART:20260911T080000",
    "DTEND:20260914T180000",
    "SUMMARY:YALI Network Nigeria Summit (AIDIFILN) 2026",
    `DESCRIPTION:Ticket holder: ${name}. Ticket code: ${code}`,
    "LOCATION:Lagos, Nigeria (venue TBA)",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}