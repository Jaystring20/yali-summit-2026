import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listDirectory, connectAttendee } from "@/lib/portal.functions";
import { Linkedin, UserPlus, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile/network")({
  component: NetworkTab,
});

function NetworkTab() {
  const fetchDir = useServerFn(listDirectory);
  const connect = useServerFn(connectAttendee);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["directory"], queryFn: () => fetchDir({ data: undefined as never }) });
  const m = useMutation({ mutationFn: (toUserId: string) => connect({ data: { toUserId } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["directory"] }) });
  if (isLoading) return <p style={{ color: "var(--text-secondary)" }}>Loading directory…</p>;
  if (data?.gated) {
    return (
      <div className="rounded-2xl border p-6 text-center max-w-lg" style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}>
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>Unlocks at check-in</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>The attendee directory becomes available once you've been checked in at the venue. See you in Lagos.</p>
      </div>
    );
  }
  if (!data || data.entries.length === 0) return <p style={{ color: "var(--text-secondary)" }}>No other checked-in attendees yet.</p>;
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {data.entries.map((p) => (
        <li key={p.user_id} className="rounded-2xl border p-5" style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{p.display_name || p.full_name}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.attendee_type} · {p.state}{p.track_selection ? ` · ${p.track_selection}` : ""}</p>
            {p.headline && (<p className="text-sm mt-2" style={{ color: "var(--text-primary)" }}>{p.headline}</p>)}
            {p.bio && (<p className="text-xs mt-1 line-clamp-3" style={{ color: "var(--text-secondary)" }}>{p.bio}</p>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.linkedin_url && (
              <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
            <button onClick={() => m.mutate(p.user_id)} disabled={p.connected || m.isPending} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full disabled:opacity-70" style={p.connected ? { background: "rgba(16,185,129,0.15)", color: "#10b981" } : { background: "var(--accent-cyan)", color: "var(--brand-navy)" }}>
              {p.connected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              {p.connected ? "Connected" : "Connect"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}