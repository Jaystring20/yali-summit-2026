import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyPortal } from "@/lib/portal.functions";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/profile/payments")({
  component: PaymentsTab,
});

function PaymentsTab() {
  const { session } = useSession();
  const fetchPortal = useServerFn(getMyPortal);
  const { data } = useQuery({
    queryKey: ["my-portal", session?.user.id],
    queryFn: () => fetchPortal(),
    enabled: !!session,
  });
  const reg = data?.registration;
  if (!reg) return null;
  const naira = reg.amount_kobo != null ? `₦${(reg.amount_kobo / 100).toLocaleString()}` : "—";
  const paid = reg.payment_status === "paid";
  const pendingManual = reg.payment_status !== "paid" && reg.amount_kobo;
  return (
    <div className="rounded-2xl border p-6 max-w-2xl" style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}>
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Payment</p>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-3xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>{naira}</span>
        <span className="text-xs uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: paid ? "rgba(16,185,129,0.15)" : "rgba(234,179,8,0.15)", color: paid ? "#10b981" : "#eab308" }}>{reg.payment_status}</span>
      </div>
      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        <dt style={{ color: "var(--text-secondary)" }}>Paystack reference</dt>
        <dd style={{ color: "var(--text-primary)" }} className="font-mono text-xs break-all">{reg.paystack_reference ?? "—"}</dd>
        <dt style={{ color: "var(--text-secondary)" }}>Registered</dt>
        <dd style={{ color: "var(--text-primary)" }}>{new Date(reg.created_at).toLocaleDateString()}</dd>
      </dl>
      {pendingManual ? (
        <p className="mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Payment is being handled manually by the summit team. Your registration is already on record.
        </p>
      ) : null}
    </div>
  );
}