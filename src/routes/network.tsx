import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Network — YALI Network Nigeria" },
      { name: "description", content: "Member directory — coming in Phase 2." },
    ],
  }),
  component: NetworkPage,
});

function NetworkPage() {
  return (
    <section className="px-6 py-20 md:py-28 bg-background text-text-primary">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-flex w-14 h-14 rounded-2xl bg-accent-cyan/10 items-center justify-center mb-5">
          <Users className="w-7 h-7 text-accent-cyan" />
        </span>
        <p className="text-accent-cyan font-semibold tracking-widest uppercase text-sm mb-3">
          Coming soon
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-4">
          The YALI Nigeria member directory.
        </h1>
        <p className="text-text-secondary mb-8">
          Find delegates by state, sector and interest. Launching alongside member
          accounts after AIDIFILN 2026 registration closes.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center justify-center px-7 min-h-12 rounded-full text-base font-semibold bg-accent-cyan text-brand-navy hover:scale-[1.02] transition-transform"
        >
          Register to be listed
        </Link>
      </div>
    </section>
  );
}