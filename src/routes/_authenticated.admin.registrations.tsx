import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileCheck, FileX, RotateCcw } from "lucide-react";
import { z } from "zod";
import { listRegistrations, overrideVerification, getCertificateSignedUrl } from "@/lib/tickets.functions";
import { AdminTabs } from "@/components/admin/AdminTabs";

const searchSchema = z.object({
  verification: z.enum(["all", "pending", "verified", "suspicious", "rejected", "error"]).optional(),
  checkedIn: z.enum(["all", "yes", "no"]).optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/admin/registrations")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Registrations — Admin" }, { name: "robots", content: "noindex" }] }),
  component: RegistrationsPage,
});

function StatusPill({ s }: { s: string }) {
  const colors: Record<string, string> = {
    verified: "#22c55e",
    pending: "#eab308",
    suspicious: "#f59e0b",
    rejected: "#ef4444",
    error: "#94a3b8",
  };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${colors[s] ?? "#94a3b8"}22`, color: colors[s] ?? "#94a3b8" }}>
      {s}
    </span>
  );
}

function RegistrationsPage() {
  const list = useServerFn(listRegistrations);
  const override = useServerFn(overrideVerification);
  const sign = useServerFn(getCertificateSignedUrl);
  const qc = useQueryClient();
  const initial = Route.useSearch();
  const [verification, setVerification] = useState<"all" | "pending" | "verified" | "suspicious" | "rejected" | "error">(initial.verification ?? "all");
  const [checkedIn, setCheckedIn] = useState<"all" | "yes" | "no">(initial.checkedIn ?? "all");
  const [search, setSearch] = useState(initial.search ?? "");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-regs", verification, checkedIn, search],
    queryFn: () => list({ data: { verification, checkedIn, search: search || undefined } }),
  });

  async function openCert(url: string | null) {
    if (!url) return;
    try {
      // url is a storage path: "<bucket>/path" stored in DB? Or full URL? Try as path.
      const path = url.includes("/yali-certificates/") ? url.split("/yali-certificates/")[1] : url;
      const { url: signed } = await sign({ data: { path } });
      window.open(signed, "_blank", "noopener");
    } catch {
      window.open(url, "_blank", "noopener");
    }
  }

  async function setStatus(id: string, status: "verified" | "rejected" | "pending") {
    await override({ data: { id, status } });
    qc.invalidateQueries({ queryKey: ["admin-regs"] });
  }

  const rows = data?.rows ?? [];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>Registrations</h1>
      <AdminTabs />

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <select value={verification} onChange={(e) => setVerification(e.target.value as any)} className="px-3 py-2 rounded border bg-transparent" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
          <option value="all">All verification</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="suspicious">Suspicious</option>
          <option value="rejected">Rejected</option>
          <option value="error">Error</option>
        </select>
        <select value={checkedIn} onChange={(e) => setCheckedIn(e.target.value as any)} className="px-3 py-2 rounded border bg-transparent" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
          <option value="all">All attendees</option>
          <option value="yes">Checked in</option>
          <option value="no">Not checked in</option>
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, code…" className="flex-1 min-w-[200px] px-3 py-2 rounded border bg-transparent" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }} />
      </div>

      <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}>
        <table className="w-full text-sm">
          <thead style={{ color: "var(--text-secondary)" }}>
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">YALI ID</th>
              <th className="px-3 py-2 font-medium">Verification</th>
              <th className="px-3 py-2 font-medium">Check-in</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody style={{ color: "var(--text-primary)" }}>
            {isLoading && (<tr><td colSpan={6} className="px-3 py-6 text-center" style={{ color: "var(--text-secondary)" }}>Loading…</td></tr>)}
            {!isLoading && rows.length === 0 && (<tr><td colSpan={6} className="px-3 py-6 text-center" style={{ color: "var(--text-secondary)" }}>No registrations match.</td></tr>)}
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--border-strong)" }}>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.full_name}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.email}</div>
                </td>
                <td className="px-3 py-2 capitalize">{r.attendee_type}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.yali_id ?? "—"}</td>
                <td className="px-3 py-2">
                  <StatusPill s={r.verification_status} />
                  {r.verification_reason && <div className="text-xs mt-1 max-w-xs" style={{ color: "var(--text-secondary)" }}>{r.verification_reason}</div>}
                </td>
                <td className="px-3 py-2 text-xs">{r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {r.yali_certificate_url && (
                      <button onClick={() => openCert(r.yali_certificate_url)} title="View certificate" className="px-2 py-1 rounded border text-xs inline-flex items-center gap-1" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}><ExternalLink className="w-3 h-3" /> Cert</button>
                    )}
                    <a href={`/ticket/${r.ticket_code}`} target="_blank" rel="noopener" className="px-2 py-1 rounded border text-xs inline-flex items-center gap-1" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}><ExternalLink className="w-3 h-3" /> Ticket</a>
                    <button onClick={() => setStatus(r.id, "verified")} className="px-2 py-1 rounded text-xs inline-flex items-center gap-1" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}><FileCheck className="w-3 h-3" /> Verify</button>
                    <button onClick={() => setStatus(r.id, "rejected")} className="px-2 py-1 rounded text-xs inline-flex items-center gap-1" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}><FileX className="w-3 h-3" /> Reject</button>
                    <button onClick={() => setStatus(r.id, "pending")} className="px-2 py-1 rounded text-xs inline-flex items-center gap-1" style={{ background: "rgba(148,163,184,0.15)", color: "var(--text-secondary)" }}><RotateCcw className="w-3 h-3" /> Reset</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}