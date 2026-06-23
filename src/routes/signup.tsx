import { useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  validateSearch: z.object({ redirect: z.string().optional() }).parse,
  head: () => ({
    meta: [
      { title: "Create your AIDIFILN account" },
      { name: "description", content: "Sign up to access your ticket, agenda, hackathon entry and networking." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/signup" });
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const target = redirect ?? "/profile";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}${target}`,
      },
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <section className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>
          Check your email
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          We sent a magic sign-in link to <strong>{email}</strong>. Click it to access your ticket and profile —
          we'll automatically link your registration.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm underline"
          style={{ color: "var(--accent-cyan)" }}
        >
          Use a different email
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>
        Sign in with a magic link
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Enter the email you used to register. We'll send you a one-click sign-in link — no password needed.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Registration email</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-3 rounded-md border bg-transparent min-h-[48px]"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
          />
        </label>
        {err && (
          <p className="text-sm px-3 py-2 rounded-md" role="alert" style={{ color: "#fecaca", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" }}>
            {err}
          </p>
        )}
        <button
          disabled={busy}
          type="submit"
          className="w-full px-4 py-3 rounded-full text-sm font-semibold disabled:opacity-60 min-h-[48px]"
          style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}
        >
          {busy ? "Sending link…" : "Email me a sign-in link"}
        </button>
      </form>
      <p className="mt-6 text-sm text-center" style={{ color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "var(--accent-cyan)" }}>
          Sign in
        </Link>
      </p>
    </section>
  );
}