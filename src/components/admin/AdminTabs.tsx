import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, ScanLine } from "lucide-react";

const tabs = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/registrations", label: "Registrations", icon: Users, exact: false },
  { to: "/admin/check-in", label: "Check-in", icon: ScanLine, exact: false },
] as const;

export function AdminTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="flex flex-wrap gap-1 p-1 rounded-full border mb-6 w-fit"
      style={{ borderColor: "var(--border-strong)", background: "var(--card)" }}
    >
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
        const Icon = t.icon;
        return (
          <Link
            key={t.to}
            to={t.to}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={
              active
                ? { background: "var(--accent-cyan)", color: "var(--brand-navy)" }
                : { color: "var(--text-secondary)" }
            }
          >
            <Icon className="w-4 h-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}