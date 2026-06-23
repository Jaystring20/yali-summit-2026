import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Layers, Info, HandHeart, ArrowRight, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/summit")({
  head: () => ({
    meta: [
      { title: "Summit — YALI Network Nigeria" },
      { name: "description", content: "AIDIFILN: AI, Digital Innovation and the Future of Inclusive Leadership in Nigeria." },
      { property: "og:title", content: "Summit — YALI Network Nigeria" },
      { property: "og:description", content: "Everything you need to know about AIDIFILN 2026." },
    ],
  }),
  component: SummitPage,
});

const HUBS: { to: "/about" | "/schedule" | "/tracks" | "/sponsors"; title: string; body: string; Icon: LucideIcon }[] = [
  { to: "/about", title: "About AIDIFILN", body: "The mission, the theme pillars, the people behind it.", Icon: Info },
  { to: "/schedule", title: "Schedule", body: "Four days, day-by-day programme.", Icon: CalendarDays },
  { to: "/tracks", title: "Sector tracks", body: "Seven curated rooms, from Health to Creative Economy.", Icon: Layers },
  { to: "/sponsors", title: "Sponsor portal", body: "Tiers, benefits, and the inquiry form.", Icon: HandHeart },
];

function SummitPage() {
  return (
    <>
      <section className="px-6 py-16 md:py-20 bg-background text-text-primary">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-accent-cyan font-semibold tracking-widest uppercase text-sm mb-4">
            AIDIFILN 2026 · Lagos
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-6">
            The Summit, end-to-end.
          </h1>
          <p className="text-lg text-text-secondary">
            Use this hub to jump into whichever part of AIDIFILN matters to you most.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 md:pb-28 bg-background text-text-primary">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-5">
          {HUBS.map(({ to, title, body, Icon }) => (
            <Link
              to={to}
              key={to}
              className="group rounded-2xl border border-border-strong bg-surface p-6 hover:border-accent-cyan transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-accent-cyan" />
                </span>
                <div className="flex-1">
                  <h2 className="font-display font-semibold text-xl mb-1">{title}</h2>
                  <p className="text-text-secondary mb-3">{body}</p>
                  <span className="inline-flex items-center gap-1.5 text-accent-cyan font-semibold text-sm group-hover:gap-2.5 transition-all">
                    Open <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}