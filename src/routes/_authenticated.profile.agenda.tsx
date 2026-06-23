import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listBookmarks, toggleBookmark } from "@/lib/portal.functions";
import { SCHEDULE } from "@/lib/event-data";
import { Bookmark, BookmarkCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile/agenda")({
  component: AgendaTab,
});

function AgendaTab() {
  const fetchBookmarks = useServerFn(listBookmarks);
  const toggle = useServerFn(toggleBookmark);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-bookmarks"], queryFn: () => fetchBookmarks({ data: undefined as never }) });
  const m = useMutation({
    mutationFn: (vars: { sessionId: string; on: boolean }) => toggle({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-bookmarks"] }),
  });
  const saved = new Set(data?.ids ?? []);
  return (
    <div className="space-y-8">
      {SCHEDULE.map((day) => (
        <div key={day.day}>
          <h2 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>{day.day} — {day.date}</h2>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--accent-cyan)" }}>{day.theme}</p>
          <ul className="space-y-3">
            {day.blocks.map((b, i) => {
              const id = `${day.day}::${i}`;
              const on = saved.has(id);
              return (
                <li key={id} className="rounded-xl border p-4 flex items-start gap-3" style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.time}</p>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{b.title}</p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{b.description}</p>
                  </div>
                  <button aria-label={on ? "Remove from my schedule" : "Add to my schedule"} onClick={() => m.mutate({ sessionId: id, on: !on })} className="p-2 rounded-full border shrink-0" style={{ borderColor: on ? "var(--accent-cyan)" : "var(--border-strong)", color: on ? "var(--accent-cyan)" : "var(--text-secondary)" }}>
                    {on ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}