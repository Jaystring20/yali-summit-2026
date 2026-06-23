import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, CheckCircle2, AlertTriangle, ShieldCheck, XCircle, Clock } from "lucide-react";
import { checkInTicket } from "@/lib/tickets.functions";
import { AdminTabs } from "@/components/admin/AdminTabs";

export const Route = createFileRoute("/_authenticated/admin/check-in")({
  head: () => ({ meta: [{ title: "Check-in scanner — Admin" }, { name: "robots", content: "noindex" }] }),
  component: CheckInPage,
});

type Result = {
  alreadyCheckedIn: boolean;
  registration: {
    id: string;
    full_name: string;
    attendee_type: string;
    track_selection: string | null;
    verification_status: string;
    checked_in_at: string | null;
  };
};

function CheckInPage() {
  const checkIn = useServerFn(checkInTicket);
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const lastScanned = useRef<{ code: string; at: number } | null>(null);
  const [scanning, setScanning] = useState(false);

  async function submitCode(code: string) {
    setError(null);
    setBusy(true);
    try {
      const r = await checkIn({ data: { code } });
      setResult(r as Result);
    } catch (e: any) {
      setError(e?.message ?? "Failed to check in");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!scanning) return;
    let html5: any;
    let cancelled = false;
    (async () => {
      const mod = await import("html5-qrcode");
      if (cancelled) return;
      html5 = new mod.Html5Qrcode("qr-reader");
      try {
        await html5.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded: string) => {
            const now = Date.now();
            if (lastScanned.current && lastScanned.current.code === decoded && now - lastScanned.current.at < 3000) return;
            lastScanned.current = { code: decoded, at: now };
            submitCode(decoded.trim());
          },
          () => {},
        );
      } catch (e: any) {
        setError(`Camera error: ${e?.message ?? e}`);
        setScanning(false);
      }
    })();
    return () => {
      cancelled = true;
      if (html5) html5.stop().catch(() => {}).then(() => html5.clear?.());
    };
  }, [scanning]);

  const r = result;
  const status = r?.registration.verification_status ?? "pending";
  const verifiedOk = status === "verified";

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>Check-in</h1>
      <AdminTabs />

      <div className="rounded-2xl border p-4 mb-4" style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}>
        <button onClick={() => setScanning((s) => !s)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold" style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}>
          <Camera className="w-4 h-4" /> {scanning ? "Stop scanner" : "Start camera scanner"}
        </button>
        {scanning && <div id="qr-reader" ref={scannerRef} className="mt-3 mx-auto" style={{ maxWidth: 360 }} />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manualCode.trim()) submitCode(manualCode.trim());
        }}
        className="rounded-2xl border p-4 mb-4 flex gap-2"
        style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}
      >
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Enter ticket code"
          className="flex-1 px-3 py-2 rounded-md border bg-transparent text-sm font-mono"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
        />
        <button disabled={busy || !manualCode.trim()} className="px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50" style={{ background: "var(--text-primary)", color: "var(--card)" }}>Check in</button>
      </form>

      {error && (
        <div className="rounded-xl border p-4 mb-4 text-sm" style={{ borderColor: "#ef4444", background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>{error}</div>
      )}

      {r && (
        <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: r.alreadyCheckedIn ? "var(--accent-cyan)" : "#22c55e" }}>
          <div className="flex items-center gap-2 mb-2">
            {r.alreadyCheckedIn ? (
              <><Clock className="w-5 h-5" style={{ color: "var(--accent-cyan)" }} /> <span className="font-semibold" style={{ color: "var(--accent-cyan)" }}>Already checked in</span></>
            ) : (
              <><CheckCircle2 className="w-5 h-5" style={{ color: "#22c55e" }} /> <span className="font-semibold" style={{ color: "#22c55e" }}>Checked in</span></>
            )}
          </div>
          <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{r.registration.full_name}</div>
          <div className="text-sm mt-1 capitalize" style={{ color: "var(--text-secondary)" }}>
            {r.registration.attendee_type} · {r.registration.track_selection ?? "no track"}
          </div>
          {r.registration.checked_in_at && (
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              At {new Date(r.registration.checked_in_at).toLocaleString()}
            </div>
          )}
          {!verifiedOk && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg text-xs" style={{ background: "rgba(234,179,8,0.12)", color: "#fbbf24" }}>
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Certificate is <strong>{status}</strong>. Confirm YALI ID before granting access.</span>
            </div>
          )}
          {verifiedOk && (
            <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "#22c55e" }}>
              <ShieldCheck className="w-4 h-4" /> Certificate verified
            </div>
          )}
        </div>
      )}
    </section>
  );
}