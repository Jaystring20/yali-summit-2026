import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyPortal } from "@/lib/portal.functions";
import { useSession } from "@/hooks/use-session";
import { Download, BookOpen } from "lucide-react";
import { TRACKS } from "@/lib/register/tracks";

const ATTENDEE_LABELS: Record<string, string> = {
  delegate: "YALI Delegate",
  sponsor: "Sponsor Representative",
  media: "Media",
  public: "General Public",
  volunteer: "Volunteer",
};

export const Route = createFileRoute("/_authenticated/profile/ticket")({
  component: TicketTab,
});

function TicketTab() {
  const { session } = useSession();
  const fetchPortal = useServerFn(getMyPortal);
  const { data } = useQuery({
    queryKey: ["my-portal", session?.user.id],
    queryFn: () => fetchPortal(),
    enabled: !!session,
  });
  if (!data?.registration) return null;
  const reg = data.registration;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(reg.ticket_code)}`;
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Your ticket</p>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>{reg.full_name}</h2>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt style={{ color: "var(--text-secondary)" }}>Attendee type</dt>
          <dd style={{ color: "var(--text-primary)" }}>{ATTENDEE_LABELS[reg.attendee_type] ?? reg.attendee_type}</dd>
          <dt style={{ color: "var(--text-secondary)" }}>Track</dt>
          <dd style={{ color: "var(--text-primary)" }}>{TRACKS.find(t => t.slug === reg.track_selection)?.title ?? reg.track_selection ?? "—"}</dd>
          <dt style={{ color: "var(--text-secondary)" }}>Verification</dt>
          <dd style={{ color: "var(--text-primary)" }} className="capitalize">{reg.verification_status}</dd>
          <dt style={{ color: "var(--text-secondary)" }}>Check-in</dt>
          <dd style={{ color: "var(--text-primary)" }}>{reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleString() : "Not yet"}</dd>
          <dt style={{ color: "var(--text-secondary)" }}>Ticket code</dt>
          <dd className="font-mono text-xs break-all" style={{ color: "var(--text-primary)" }}>{reg.ticket_code}</dd>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/brochure.pdf" download className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}>
            <BookOpen className="w-4 h-4" /> Event brochure
          </a>
          <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(reg.ticket_code))}`} download="aidifiln-2026.ics" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
            <Download className="w-4 h-4" /> Add to calendar
          </a>
        </div>
      </div>
      <div className="rounded-2xl border p-4 flex flex-col items-center justify-center" style={{ borderColor: "var(--border-strong)", background: "white" }}>
        <img src={qrUrl} alt="Ticket QR code" className="w-full max-w-[240px] h-auto" />
        <p className="mt-2 text-[10px] font-mono break-all text-center" style={{ color: "#111" }}>{reg.ticket_code}</p>
      </div>
    </div>
  );
}

function buildIcs(ticket: string) {
  return [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//YALI Nigeria//AIDIFILN//EN",
    "BEGIN:VEVENT",`UID:${ticket}@aidifiln`,"SUMMARY:AIDIFILN 2026 — YALI Network Nigeria Summit",
    "DTSTART:20260910T110000Z","DTEND:20260913T160000Z","LOCATION:Lagos, Nigeria",
    "DESCRIPTION:Your AIDIFILN attendance.","END:VEVENT","END:VCALENDAR",
  ].join("\r\n");
}