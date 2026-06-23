import { Link, useRouterState } from "@tanstack/react-router";
import { Home, CalendarDays, BookOpen, Users, UserCircle, type LucideIcon } from "lucide-react";

type Tab = { to: string; label: string; icon: LucideIcon };

const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/summit", label: "Summit", icon: CalendarDays },
  { to: "/network", label: "Network", icon: Users },
  { to: "/tracks", label: "Resources", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border-strong bg-surface flex pb-safe"
      aria-label="Primary"
    >
      {tabs.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 min-w-12 h-16 transition-colors active:scale-95 ${
              active ? "text-accent-cyan" : "text-text-secondary"
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-accent-cyan" />
            )}
            <Icon className="w-6 h-6" strokeWidth={active ? 2.4 : 2} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}