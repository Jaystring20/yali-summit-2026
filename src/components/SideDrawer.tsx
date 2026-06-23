import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  BookOpen,
  Users,
  UserCircle,
  Menu,
  Settings,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";

type Item = { to: string; label: string; icon: LucideIcon };

const items: Item[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/summit", label: "Summit", icon: CalendarDays },
  { to: "/network", label: "Network", icon: Users },
  { to: "/tracks", label: "Resources", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function SideDrawer() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const width = collapsed ? 80 : 240;

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-dvh z-40 flex-col border-r border-border-strong bg-surface transition-[width] duration-300"
      style={{ width }}
      aria-label="Primary"
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <span className="text-rainbow font-bold text-2xl font-display">
            YALI NG
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-text-primary"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors relative border-l-2 ${
                active
                  ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan"
                  : "text-text-primary border-transparent hover:bg-white/5"
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 flex items-center gap-2 text-text-secondary">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Settings">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}