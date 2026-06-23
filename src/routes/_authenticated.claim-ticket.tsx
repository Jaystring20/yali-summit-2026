import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { claimTicket } from "@/lib/portal.functions";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/claim-ticket")({
  head: () => ({ meta: [{ title: "Claim your ticket — AIDIFILN" }, { name: "robots", content: "noindex" }] }),
  component: ClaimPage,
});

function ClaimPage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const claim = useServerFn(claimTicket);
  const [ticketCode, setTicketCode] = useState("");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await claim({ data: { ticketCode: ticketCode.trim(), email: email.trim() } });
      await qc.invalidateQueries({ queryKey: ["my-portal"] });
      navigate({ to: "/profile" });
    } catch (e: any) {
      setErr(e?.message ?? "Could not claim ticket");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>
        Link your registration
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Enter the ticket code from your registration email. We'll connect it to your account.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Ticket code</span>
          <input
            required
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md border bg-transparent font-mono"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
          />
        </label>
        <label className="block text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Registration email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md border bg-transparent"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
          />
        </label>
        {err && <p className="text-sm" style={{ color: "var(--danger, #ef4444)" }}>{err}</p>}
        <button
          disabled={busy}
          type="submit"
          className="w-full px-4 py-2.5 rounded-full text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}
        >
          {busy ? "Linking…" : "Link my ticket"}
        </button>
      </form>
      <p className="mt-6 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
        Haven't registered yet?{" "}
        <a href="/register" style={{ color: "var(--accent-cyan)" }}>
          Register first
        </a>
      </p>
    </section>
  );
}