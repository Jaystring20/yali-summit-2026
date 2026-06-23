import { Link, useRouterState } from "@tanstack/react-router";
import { Ticket, Receipt, CalendarDays, Rocket, Users, Settings } from "lucide-react";

const tabs = [
  { to: "/profile/ticket", label: "Ticket", icon: Ticket },
  { to: "/profile/payments", label: "Payments", icon: Receipt },
  { to: "/profile/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/profile/hackathon", label: "Hackathon", icon: Rocket },
  { to: "/profile/network", label: "Network", icon: Users },
  { to: "/profile/settings", label: "Settings", icon: Settings },
] as const;

export function ProfileTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="-mx-2 px-2 mb-6 flex gap-1 overflow-x-auto no-scrollbar"
      aria-label="Profile sections"
    >
      {tabs.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
            style={
              active
                ? { background: "var(--accent-cyan)", color: "var(--brand-navy)", borderColor: "var(--accent-cyan)" }
                : { color: "var(--text-secondary)", borderColor: "var(--border-strong)" }
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}