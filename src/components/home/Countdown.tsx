import { useEffect, useState } from "react";

// Canonical summit start: Sept 10, 2026 (Lagos, WAT)
const TARGET = new Date("2026-09-10T00:00:00+01:00").getTime();

function diff(now: number) {
  const ms = Math.max(0, TARGET - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [t, setT] = useState(() => diff(Date.now()));

  useEffect(() => {
    setMounted(true);
    setT(diff(Date.now()));
    const id = setInterval(() => setT(diff(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  const cells: Array<[string, number]> = [
    ["Days", t.days],
    ["Hours", t.hours],
    ["Minutes", t.minutes],
    ["Seconds", t.seconds],
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-6 flex-nowrap justify-center w-full">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-md flex-1 min-w-0 sm:min-w-[110px] sm:flex-none px-1 sm:px-6 py-3 sm:py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_24px_-12px_rgba(0,217,255,0.35)]"
        >
          <div
            className="tabular-nums font-bold leading-none text-white font-display"
            style={{
              fontSize: "clamp(22px, 6.5vw, 48px)",
            }}
          >
            {mounted ? String(value).padStart(2, "0") : "--"}
          </div>
          <div className="mt-1.5 text-[9px] sm:text-[14px] uppercase tracking-widest text-white/70">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}