import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { SCHEDULE } from "@/lib/event-data";
import {
  Reveal,
  Stagger,
  staggerChild,
  SideLabel,
  HalftoneBackdrop,
  Eyebrow,
} from "@/components/motion-primitives";
import { EditorialImage } from "@/components/editorial/EditorialImage";
import scheduleAudience from "@/assets/editorial/schedule-audience.jpg";

export function ScheduleSection({ id = "schedule" }: { id?: string }) {
  const [active, setActive] = useState(0);
  const day = SCHEDULE[active];
  return (
    <div id={id} className="scroll-mt-24">
      <section className="relative px-5 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-28 bg-background text-text-primary overflow-hidden">
        <HalftoneBackdrop />
        <SideLabel>Programme · Sept 10–13 · Lagos</SideLabel>
        <SideLabel side="right" tone="muted">AIDIFILN / Day 01 → 04</SideLabel>
        <div className="relative max-w-4xl mx-auto text-center">
          <Reveal><Eyebrow>Four-day programme</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mt-5 mb-6 leading-[1.05]">
              The four days, <span className="text-accent-cyan">hour by hour.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Keynotes, parallel sector rooms, hands-on workshops, a hackathon and a closing showcase — in Lagos (venue announced soon). Speaker lineups land closer to event.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Wide editorial hero — what a day in the room looks like */}
      <section className="px-5 sm:px-6 lg:px-8 -mt-6 md:-mt-10 mb-4 md:mb-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <EditorialImage
            src={scheduleAudience}
            alt="A packed Nigerian summit audience in modern conference seating, facing a backlit panel stage"
            aspect="aspect-[16/9] md:aspect-[21/9]"
            caption="Main hall · panel session · summit reportage"
            sizes="(min-width: 1280px) 1200px, (min-width: 768px) 90vw, 100vw"
            width={1920}
            height={1080}
          />
        </div>
      </section>

      <section className="px-5 sm:px-6 lg:px-8 pb-24 md:pb-32 bg-background text-text-primary">
        <div className="max-w-5xl mx-auto">
          <div className="-mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8 py-3 bg-background/85 backdrop-blur-md border-y border-border-strong mb-10">
            <div className="flex gap-1 overflow-x-auto no-scrollbar md:justify-center snap-x">
              {SCHEDULE.map((d, i) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    i === active
                      ? "text-brand-navy"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {i === active && (
                    <motion.span
                      layoutId="day-pill-home"
                      className="absolute inset-0 rounded-full bg-accent-cyan"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{d.day}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-10 flex items-baseline justify-between gap-6 flex-wrap">
                <div>
                  <p className="font-mono text-xs tracking-[0.3em] uppercase text-accent-cyan mb-2">
                    {day.date}
                  </p>
                  <h3 className="font-display font-bold text-3xl md:text-4xl">
                    {day.theme}
                  </h3>
                </div>
                <span className="font-mono text-xs tracking-[0.25em] uppercase text-text-secondary">
                  {day.blocks.length} sessions
                </span>
              </div>

              <Stagger className="relative pl-6 md:pl-10">
                <span
                  aria-hidden
                  className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-accent-cyan via-border-strong to-transparent"
                />
                <ol className="space-y-5">
                  {day.blocks.map((b) => (
                    <motion.li
                      key={b.title}
                      variants={staggerChild}
                      className="relative rounded-2xl border border-border-strong bg-surface p-5 md:p-7 grid md:grid-cols-[160px_1fr] gap-3 md:gap-8 hover:border-accent-cyan/60 transition-colors group"
                    >
                      <span
                        aria-hidden
                        className="absolute -left-[1.65rem] md:-left-[2.65rem] top-7 w-3 h-3 rounded-full bg-accent-cyan ring-4 ring-background group-hover:scale-125 transition-transform"
                      />
                      <div className="font-mono font-semibold text-sm md:text-base text-accent-cyan">
                        {b.time}
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-lg md:text-xl mb-1.5">
                          {b.title}
                        </h4>
                        <p className="text-text-secondary leading-relaxed">
                          {b.description}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </Stagger>
            </motion.div>
          </AnimatePresence>

          <Reveal delay={0.1}>
            <div className="mt-14 text-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 min-h-12 rounded-full text-base font-semibold bg-accent-cyan text-brand-navy hover:scale-[1.03] active:scale-100 transition-transform"
              >
                Claim your seat
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}