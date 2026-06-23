import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { TRACK_DETAILS } from "@/lib/event-data";
import {
  Reveal,
  Stagger,
  staggerChild,
  SideLabel,
  HalftoneBackdrop,
  Eyebrow,
} from "@/components/motion-primitives";

export function TracksSection({ id = "tracks" }: { id?: string }) {
  return (
    <div id={id} className="scroll-mt-24">
      <section className="relative px-5 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-28 bg-background text-text-primary overflow-hidden">
        <HalftoneBackdrop />
        <SideLabel>Seven sectors · One stage</SideLabel>
        <SideLabel side="right" tone="muted">Tracks / 01 → 07</SideLabel>
        <div className="relative max-w-4xl mx-auto text-center">
          <Reveal><Eyebrow>Seven sector tracks</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mt-5 mb-6 leading-[1.05]">
              Pick the room you want to{" "}
              <span className="text-accent-cyan">shape.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Seven sector rooms. Each one ends with named commitments — not closing remarks. Pick the one you can move.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 sm:px-6 lg:px-8 pb-20 md:pb-28 bg-background text-text-primary">
        <Stagger className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-5 lg:gap-6">
          {TRACK_DETAILS.map(({ slug, title, long, sessions, Icon }, i) => (
            <motion.article
              key={slug}
              variants={staggerChild}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="group relative rounded-3xl border border-border-strong p-6 md:p-8 bg-surface flex flex-col overflow-hidden hover:border-accent-cyan/70 transition-colors"
            >
              <span
                aria-hidden
                className="absolute -top-2 -right-2 font-display font-bold text-[5rem] md:text-[7rem] leading-none text-accent-cyan/[0.06] select-none pointer-events-none"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="relative flex items-center gap-3 mb-5">
                <span className="w-12 h-12 rounded-2xl bg-accent-cyan/10 ring-1 ring-accent-cyan/30 flex items-center justify-center group-hover:bg-accent-cyan/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent-cyan" />
                </span>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-secondary">
                    Track {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display font-semibold text-xl md:text-2xl">
                    {title}
                  </h3>
                </div>
              </div>

              <p className="relative text-text-secondary mb-6 leading-relaxed">
                {long}
              </p>

              <div className="relative mb-6 pt-5 border-t border-border-strong/70">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-secondary mb-3">
                  Sample sessions
                </p>
                <ul className="space-y-2 text-text-primary">
                  {sessions.map((s) => (
                    <li key={s} className="text-sm flex gap-2.5 leading-snug">
                      <span className="text-accent-cyan font-mono mt-px">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/register"
                className="relative mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-accent-cyan/60 text-accent-cyan hover:bg-accent-cyan hover:text-brand-navy transition-colors self-start"
              >
                Hold a seat in this room
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.article>
          ))}
        </Stagger>
      </section>
    </div>
  );
}