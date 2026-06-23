import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — YALI Summit" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the reset link is followed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check if session already exists from the hash token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
    setTimeout(() => navigate({ to: "/login" }), 3000);
  }

  if (done) {
    return (
      <section className="max-w-md mx-auto px-6 py-24 text-center">
        <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "var(--success, #22C55E)" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>
          Password updated!
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Redirecting you to sign in…
        </p>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="max-w-md mx-auto px-6 py-24 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--accent-cyan)" }} />
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>
          Verifying reset link…
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          If this takes too long, your link may have expired.{" "}
          <a href="/login" className="underline" style={{ color: "var(--accent-cyan)" }}>Request a new one</a>.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-6 h-6" style={{ color: "var(--accent-cyan)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>
          Set new password
        </h1>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Choose a strong password — at least 8 characters.
      </p>

      <form onSubmit={handleReset} className="space-y-4">
        {/* New password */}
        <label className="block text-sm">
          <span style={{ color: "var(--text-secondary)" }}>New password</span>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              required minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 rounded-md border bg-transparent pr-12 min-h-[48px]"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
              placeholder="Minimum 8 characters"
            />
            <button type="button" tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              style={{ color: "var(--text-secondary)" }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>

        {/* Confirm password */}
        <label className="block text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Confirm password</span>
          <div className="relative mt-1">
            <input
              type={showConfirm ? "text" : "password"}
              required minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-3 rounded-md border bg-transparent pr-12 min-h-[48px]"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
              placeholder="Repeat your new password"
            />
            <button type="button" tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              style={{ color: "var(--text-secondary)" }}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>

        {err && (
          <p className="text-sm px-3 py-2 rounded-md" style={{ color: "#fecaca", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" }}>
            {err}
          </p>
        )}

        <button
          disabled={busy} type="submit"
          className="w-full px-4 py-2.5 rounded-full text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}
        >
          {busy ? "Updating password…" : "Update password"}
        </button>
      </form>
    </section>
  );
}
