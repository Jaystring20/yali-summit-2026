import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sun, Moon, Menu } from "lucide-react";
import logoRainbow from "@/assets/aidifiln-logo-rainbow.png";
import lockupFull from "@/assets/aidifiln-lockup-full.png";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";

const items = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#schedule", label: "Schedule" },
  { href: "#tracks", label: "Tracks" },
  { href: "#sponsors", label: "Sponsors" },
  { href: "#contact", label: "Contact" },
] as const;

function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark =
      stored === null
        ? window.matchMedia("(prefers-color-scheme: dark)").matches || true
        : stored === "dark";
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {}
      return next;
    });
  };

  return { isDark, toggle };
}

function NavLinks({
  onNavigate,
  vertical,
  activeId,
  onLinkClick,
}: {
  onNavigate?: () => void;
  vertical?: boolean;
  activeId?: string;
  onLinkClick?: (id: string) => void;
}) {
  return (
    <nav className={vertical ? "flex flex-col gap-1" : "flex items-center gap-1"}>
      {items.map(({ href, label }) => {
        const id = href.slice(1);
        const isActive = activeId === id;
        return (
          <a
            key={href}
            href={href}
            onClick={(e) => {
              const el = typeof document !== "undefined" ? document.getElementById(id) : null;
              if (el) {
                e.preventDefault();
                onLinkClick?.(id);
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                if (typeof history !== "undefined") {
                  history.replaceState(null, "", `#${id}`);
                }
              }
              onNavigate?.();
            }}
            aria-current={isActive ? "page" : undefined}
            className={`${
              vertical ? "px-3 py-3 text-base" : "px-4 py-2 text-sm"
            } font-medium uppercase tracking-wide transition-colors ${
              vertical
                ? isActive
                  ? "text-accent-cyan"
                  : "text-text-primary hover:text-accent-cyan"
                : isActive
                  ? "text-accent-cyan dark:text-[#00D9FF]"
                  : "text-brand-navy/80 hover:text-accent-cyan dark:text-white/80 dark:hover:text-[#00D9FF]"
            } relative after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:bg-accent-cyan after:transition-transform ${
              isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
            }`}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}

function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");
  const lockUntilRef = (useState<{ t: number }>(() => ({ t: 0 }))[0]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntilRef.t) {
          // Ignore intersection updates while a programmatic scroll is in flight
          for (const entry of entries) {
            visibility.set(entry.target.id, entry.intersectionRatio);
          }
          return;
        }
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId = activeId;
        let bestRatio = 0;
        for (const [id, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestRatio > 0 && bestId !== activeId) setActiveId(bestId);
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);

  const setActive = (id: string) => {
    // Lock observer briefly so the clicked link stays highlighted through smooth scroll
    lockUntilRef.t = Date.now() + 900;
    setActiveId(id);
  };

  return [activeId, setActive] as const;
}

export function TopNav() {
  const { isDark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useScrollSpy(items.map((i) => i.href.slice(1)));

  return (
    <header className="fixed top-3 md:top-5 inset-x-0 z-40 px-3 md:px-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-[1180px] flex items-center justify-between gap-4 px-3 md:px-5 h-14 md:h-16 rounded-full border border-brand-navy/10 dark:border-white/10 bg-white/85 dark:bg-[#0A1128]/70 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(15,27,61,0.18)] dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]">
        <a href="#home" aria-label="AIDIFILN — Home" className="flex items-center shrink-0">
          <img
            src={lockupFull}
            alt="AIDIFILN"
            className="block dark:hidden h-9 md:h-11 w-auto select-none"
            loading="eager"
            decoding="async"
          />
          <img
            src={logoRainbow}
            alt="AIDIFILN"
            className="hidden dark:block h-10 md:h-12 w-auto select-none"
            loading="eager"
            decoding="async"
          />
        </a>

        <div className="hidden lg:block">
          <NavLinks activeId={activeId} onLinkClick={setActiveId} />
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-accent-cyan/10 transition-colors text-brand-navy/70 dark:text-white/80"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link
            to="/login"
            className="px-4 py-2 rounded-full text-sm font-semibold text-brand-navy/80 hover:text-accent-cyan dark:text-white/80 dark:hover:text-[#00D9FF] transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95 bg-accent-cyan text-brand-navy shadow-elegant"
          >
            Register
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-accent-cyan/10 transition-colors text-brand-navy/70 dark:text-white/80"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-accent-cyan/10 transition-colors text-brand-navy dark:text-white"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-sm bg-surface border-border-strong"
            >
              <SheetHeader>
                <SheetTitle className="text-left">
                  <img
                    src={lockupFull}
                    alt="AIDIFILN"
                    className="block dark:hidden w-full max-w-[240px] h-auto"
                  />
                  <img
                    src={logoRainbow}
                    alt="AIDIFILN"
                    className="hidden dark:block h-10 w-auto"
                  />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6">
                <NavLinks
                  vertical
                  onNavigate={() => setOpen(false)}
                  activeId={activeId}
                  onLinkClick={setActiveId}
                />
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="px-5 py-3 rounded-full text-sm font-semibold text-center border border-brand-navy/20 dark:border-white/20 text-brand-navy dark:text-white active:scale-95"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="px-5 py-3 rounded-full text-sm font-semibold text-center bg-accent-cyan text-brand-navy active:scale-95"
                  >
                    Register
                  </Link>
                  <a
                    href="#sponsors"
                    onClick={() => setOpen(false)}
                    className="px-5 py-3 rounded-full text-sm font-semibold text-center border border-accent-cyan text-accent-cyan"
                  >
                    Sponsor
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}