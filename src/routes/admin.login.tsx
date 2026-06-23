import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Portal — YALI Summit" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function sendPasswordReset() {
    if (!email.trim()) {
      setErr("Enter your email above first, then click Forgot password.");
      return;
    }
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setResetSent(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) { setBusy(false); setErr(error.message); return; }
    try {
      const uid = signInData.user?.id;
      if (!uid) throw new Error("No user session");
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const list = (roles ?? []).map((r: { role: string }) => r.role);
      if (list.includes("admin") || list.includes("staff")) {
        navigate({ to: "/admin" });
        return;
      }
      await supabase.auth.signOut();
      setBusy(false);
      setErr("You do not have admin access.");
    } catch (e: unknown) {
      await supabase.auth.signOut();
      setBusy(false);
      setErr(e instanceof Error ? e.message : "Unable to verify admin access.");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: "radial-gradient(ellipse at top, rgba(10,17,40,0.95) 0%, #050914 60%, #02040A 100%)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 shadow-2xl backdrop-blur-xl"
        style={{ background: "rgba(10, 17, 40, 0.75)", borderColor: "rgba(0, 217, 255, 0.18)", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00D9FF22, #00D9FF08)", border: "1px solid rgba(0,217,255,0.35)" }}>
            <ShieldCheck className="w-5 h-5" style={{ color: "#00D9FF" }} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "#00D9FF" }}>YALI Summit</p>
            <h1 className="text-xl font-bold leading-tight" style={{ color: "white", fontFamily: "Space Grotesk, sans-serif" }}>Admin Portal</h1>
          </div>
        </div>

        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          Restricted access. Sign in with your assigned admin or staff credentials.
        </p>

        {resetSent && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(0,217,255,0.1)", border: "1px solid rgba(0,217,255,0.35)", color: "#00D9FF" }}>
            ✅ Password reset email sent — check your inbox.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            <span style={{ color: "rgba(255,255,255,0.7)" }}>Work email</span>
            <input
              type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-md border bg-transparent"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "white" }}
            />
          </label>

          <label className="block text-sm">
            <div className="flex items-center justify-between mb-1">
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Password</span>
              <button
                type="button"
                onClick={sendPasswordReset}
                disabled={busy}
                className="text-xs underline disabled:opacity-50"
                style={{ color: "#00D9FF" }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border bg-transparent pr-10"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "white" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                style={{ color: "rgba(255,255,255,0.7)" }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            className="w-full px-4 py-2.5 rounded-full text-sm font-semibold disabled:opacity-60 transition-transform active:scale-[0.98]"
            style={{ background: "#00D9FF", color: "#0A1128" }}
          >
            {busy ? "Verifying access…" : "Sign in to Admin"}
          </button>
        </form>

        <p className="mt-6 text-xs text-center" style={{ color: "rgba(255,255,255,0.45)" }}>
          Admin accounts are issued manually by the summit team.
        </p>
      </div>
    </div>
  );
}
