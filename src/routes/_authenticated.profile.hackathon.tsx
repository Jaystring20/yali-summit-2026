import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyHackathon, upsertHackathonEntry, addTeamMember, removeTeamMember } from "@/lib/portal.functions";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile/hackathon")({
  component: HackathonTab,
});

function HackathonTab() {
  const fetchEntry = useServerFn(getMyHackathon);
  const upsert = useServerFn(upsertHackathonEntry);
  const addMember = useServerFn(addTeamMember);
  const removeMember = useServerFn(removeTeamMember);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-hackathon"], queryFn: () => fetchEntry({ data: undefined as never }) });
  const [form, setForm] = useState({ track: "hackathon" as "hackathon" | "pitch", project_name: "", summary: "", problem: "", solution: "", deck_url: "", repo_url: "", video_url: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (data?.entry) setForm({ track: data.entry.track, project_name: data.entry.project_name ?? "", summary: data.entry.summary ?? "", problem: data.entry.problem ?? "", solution: data.entry.solution ?? "", deck_url: data.entry.deck_url ?? "", repo_url: data.entry.repo_url ?? "", video_url: data.entry.video_url ?? "" });
  }, [data?.entry]);
  const save = useMutation({ mutationFn: (submit: boolean) => upsert({ data: { ...form, submit } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["my-hackathon"] }), onError: (e: any) => setErr(e?.message ?? "Save failed") });
  const add = useMutation({ mutationFn: () => addMember({ data: { entryId: data!.entry!.id, email: memberEmail.trim(), full_name: memberName.trim() } }), onSuccess: () => { setMemberEmail(""); setMemberName(""); qc.invalidateQueries({ queryKey: ["my-hackathon"] }); } });
  const remove = useMutation({ mutationFn: (id: string) => removeMember({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["my-hackathon"] }) });
  const submitted = data?.entry?.status === "submitted" || data?.entry?.status === "shortlisted";
  const inputStyle = { borderColor: "var(--border-strong)", color: "var(--text-primary)" };
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <form onSubmit={(e) => { e.preventDefault(); setErr(null); save.mutate(false); }} className="rounded-2xl border p-6 space-y-4" style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>Hackathon / Pitch entry</h2>
          {data?.entry?.status && (<span className="text-xs uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: "rgba(0,217,255,0.12)", color: "var(--accent-cyan)" }}>{data.entry.status}</span>)}
        </div>
        <label className="block text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Track</span>
          <select value={form.track} onChange={(e) => setForm((f) => ({ ...f, track: e.target.value as any }))} disabled={submitted} className="mt-1 w-full px-3 py-2 rounded-md border bg-transparent" style={inputStyle}>
            <option value="hackathon">Hackathon</option>
            <option value="pitch">Pitch Competition</option>
          </select>
        </label>
        {([["project_name","Project name","input"],["summary","One-line summary","input"],["problem","Problem you're solving","textarea"],["solution","Your solution / approach","textarea"],["deck_url","Pitch deck URL","input"],["repo_url","Repository URL (hackathon)","input"],["video_url","Demo video URL","input"]] as const).map(([key,label,kind]) => (
          <label key={key} className="block text-sm">
            <span style={{ color: "var(--text-secondary)" }}>{label}</span>
            {kind === "textarea" ? (
              <textarea rows={3} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} disabled={submitted} className="mt-1 w-full px-3 py-2 rounded-md border bg-transparent" style={inputStyle} />
            ) : (
              <input value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} disabled={submitted} className="mt-1 w-full px-3 py-2 rounded-md border bg-transparent" style={inputStyle} />
            )}
          </label>
        ))}
        {err && <p className="text-sm" style={{ color: "var(--danger, #ef4444)" }}>{err}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={save.isPending || submitted} className="px-5 py-2.5 rounded-full text-sm font-semibold border disabled:opacity-60" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>{save.isPending ? "Saving…" : "Save draft"}</button>
          {!submitted && (<button type="button" onClick={() => save.mutate(true)} disabled={save.isPending} className="px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-60" style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}>Submit entry</button>)}
        </div>
      </form>
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}>
        <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>Team</h3>
        {!data?.entry ? (<p className="text-sm" style={{ color: "var(--text-secondary)" }}>Save your entry first to invite teammates.</p>) : (
          <>
            <ul className="space-y-2 mb-4">
              {data.team.length === 0 && (<li className="text-sm" style={{ color: "var(--text-secondary)" }}>No teammates yet.</li>)}
              {data.team.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border" style={{ borderColor: "var(--border-strong)" }}>
                  <div className="text-sm">
                    <p style={{ color: "var(--text-primary)" }}>{m.full_name || m.email}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{m.email}</p>
                  </div>
                  <button onClick={() => remove.mutate(m.id)} aria-label="Remove teammate" className="p-1.5 rounded-md" style={{ color: "var(--text-secondary)" }}><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <input placeholder="Name" value={memberName} onChange={(e) => setMemberName(e.target.value)} className="w-full px-3 py-2 rounded-md border bg-transparent text-sm" style={inputStyle} />
              <input placeholder="Email" type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} className="w-full px-3 py-2 rounded-md border bg-transparent text-sm" style={inputStyle} />
              <button type="button" onClick={() => add.mutate()} disabled={!memberEmail || add.isPending} className="w-full px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-60" style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}>{add.isPending ? "Inviting…" : "Invite teammate"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}