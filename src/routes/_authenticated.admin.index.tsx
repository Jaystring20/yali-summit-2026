import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Users, CheckCircle2, ShieldCheck, CreditCard, Clock, TrendingUp, RefreshCw,
} from "lucide-react";
import { getAdminDashboard, type DashboardStats } from "@/lib/tickets.functions";
import { AdminTabs } from "@/components/admin/AdminTabs";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

const STATUS_COLORS: Record<string, string> = {
  verified: "#22c55e",
  pending: "#eab308",
  suspicious: "#f59e0b",
  rejected: "#ef4444",
  error: "#94a3b8",
  paid: "#22c55e",
  failed: "#ef4444",
  delegate: "#06b6d4",
  sponsor: "#a855f7",
  media: "#f59e0b",
  volunteer: "#22c55e",
};

function fmtNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    (kobo ?? 0) / 100,
  );
}

function KpiCard({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string | number; sub?: string; icon: any; accent?: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{label}</span>
        <Icon className="w-4 h-4" style={{ color: accent ?? "var(--accent-cyan)" }} />
      </div>
      <div className="text-3xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</div>}
    </div>
  );
}

function BreakdownCard({
  title, rows, total, linkBuilder, colorMap,
}: {
  title: string;
  rows: Array<{ key: string; count: number }>;
  total: number;
  linkBuilder?: (key: string) => { to: string; search?: Record<string, string> } | null;
  colorMap?: Record<string, string>;
}) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <ul className="space-y-2">
        {rows.length === 0 && <li className="text-xs" style={{ color: "var(--text-secondary)" }}>No data</li>}
        {rows.map((r) => {
          const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
          const color = colorMap?.[r.key] ?? "var(--accent-cyan)";
          const link = linkBuilder?.(r.key);
          const content = (
            <>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="capitalize" style={{ color: "var(--text-primary)" }}>{r.key}</span>
                <span style={{ color: "var(--text-secondary)" }}>{r.count.toLocaleString()} · {pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.15)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </>
          );
          return (
            <li key={r.key}>
              {link ? (
                <Link to={link.to as any} search={link.search as any} className="block hover:opacity-80 transition-opacity">
                  {content}
                </Link>
              ) : content}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const color = STATUS_COLORS[s] ?? "#94a3b8";
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: `${color}22`, color }}>
      {s}
    </span>
  );
}

function AdminDashboard() {
  const fetcher = useServerFn(getAdminDashboard);
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetcher({ data: undefined as never }),
    refetchOnWindowFocus: true,
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "Space Grotesk, sans-serif" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Registration overview across every level.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border disabled:opacity-50"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      <AdminTabs />

      {isLoading && (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}>
          Loading dashboard…
        </div>
      )}
      {isError && (
        <div className="rounded-2xl border p-6 text-sm" style={{ borderColor: "#ef4444", background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
          Failed to load: {(error as Error)?.message}
        </div>
      )}

      {data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <KpiCard label="Total registrations" value={data.totals.total.toLocaleString()} icon={Users} />
            <KpiCard label="Revenue (paid)" value={fmtNaira(data.totals.revenue_kobo)} sub={`${data.totals.paid.toLocaleString()} paid`} icon={CreditCard} accent="#22c55e" />
            <KpiCard label="Pending payment" value={data.totals.pending_payment.toLocaleString()} icon={Clock} accent="#eab308" />
            <KpiCard label="Verified" value={data.totals.verified.toLocaleString()} icon={ShieldCheck} accent="#22c55e" />
            <KpiCard
              label="Checked in"
              value={data.totals.checked_in.toLocaleString()}
              sub={data.totals.total > 0 ? `${Math.round((data.totals.checked_in / data.totals.total) * 100)}% of total` : undefined}
              icon={CheckCircle2}
              accent="#06b6d4"
            />
            <KpiCard label="Last 24 hours" value={data.totals.last_24h.toLocaleString()} icon={TrendingUp} accent="#a855f7" />
          </div>

          {/* Trend chart */}
          <div className="rounded-2xl border p-5 mb-6" style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Registrations — last 30 days</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <AreaChart data={data.trend30d} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-strong)" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--accent-cyan)" strokeWidth={2} fill="url(#trendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <BreakdownCard
              title="By attendee type"
              rows={data.byAttendeeType}
              total={data.totals.total}
              colorMap={STATUS_COLORS}
            />
            <BreakdownCard
              title="By verification"
              rows={data.byVerification}
              total={data.totals.total}
              colorMap={STATUS_COLORS}
              linkBuilder={(k) => ({ to: "/admin/registrations", search: { verification: k } })}
            />
            <BreakdownCard
              title="By payment"
              rows={data.byPayment}
              total={data.totals.total}
              colorMap={STATUS_COLORS}
            />
            <BreakdownCard title="By track" rows={data.byTrack.slice(0, 7)} total={data.totals.total} />
            <BreakdownCard title="By state (top 15)" rows={data.byState} total={data.totals.total} />
            <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Quick actions</h3>
              <div className="flex flex-col gap-2">
                <Link to="/admin/registrations" className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
                  → All registrations
                </Link>
                <Link to="/admin/check-in" className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
                  → Check-in scanner
                </Link>
                <Link to="/admin/registrations" search={{ checkedIn: "no", verification: "verified" } as any} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
                  → Verified · awaiting check-in
                </Link>
              </div>
            </div>
          </div>

          {/* Recent */}
          <div className="rounded-2xl border overflow-x-auto" style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Most recent registrations</h3>
              <Link to="/admin/registrations" className="text-xs underline" style={{ color: "var(--accent-cyan)" }}>View all</Link>
            </div>
            <table className="w-full text-sm">
              <thead style={{ color: "var(--text-secondary)" }}>
                <tr className="text-left">
                  <th className="px-5 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Verification</th>
                  <th className="px-3 py-2 font-medium">Payment</th>
                  <th className="px-3 py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--text-primary)" }}>
                {data.recent.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: "var(--border-strong)" }}>
                    <td className="px-5 py-2">
                      <Link to="/admin/registrations" search={{ search: r.email } as any} className="hover:underline">
                        <div className="font-medium">{r.full_name}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.email}</div>
                      </Link>
                    </td>
                    <td className="px-3 py-2 capitalize">{r.attendee_type}</td>
                    <td className="px-3 py-2"><StatusPill s={r.verification_status} /></td>
                    <td className="px-3 py-2"><StatusPill s={r.payment_status} /></td>
                    <td className="px-3 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {data.recent.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-xs" style={{ color: "var(--text-secondary)" }}>No registrations yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}