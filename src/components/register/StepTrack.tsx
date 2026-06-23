import { motion, AnimatePresence } from "framer-motion";
import { TRACKS } from "@/lib/register/tracks";
import type { FormState } from "@/lib/register/schema";
import { staggerContainer, staggerChild, ease, spring } from "@/lib/motion";

export function StepTrack({
  value,
  error,
  onChange,
}: {
  value: FormState;
  error?: string;
  onChange: (patch: FormState) => void;
}) {
  return (
    <motion.div
      className="space-y-3"
      variants={staggerContainer(0.05)}
      initial="hidden"
      animate="visible"
    >
      {TRACKS.map((t) => {
        const selected = value.track_selection === t.slug;
        return (
          <motion.button
            key={t.slug}
            type="button"
            onClick={() => onChange({ track_selection: t.slug })}
            variants={staggerChild}
            whileHover={selected ? {} : {
              scale: 1.01,
              y: -1,
              transition: spring.snappy,
            }}
            whileTap={{
              scale: 0.98,
              transition: spring.snappy,
            }}
            className="w-full text-left rounded-xl border p-4 transition-[border-color,background] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)]"
            style={{
              background: selected
                ? "color-mix(in oklab, var(--accent-cyan) 8%, transparent)"
                : "var(--surface)",
              borderColor: selected ? "var(--accent-cyan)" : "var(--border-strong)",
              boxShadow: selected
                ? "0 0 0 1px var(--accent-cyan), 0 0 16px color-mix(in oklab, var(--accent-cyan) 12%, transparent)"
                : "none",
            }}
            aria-pressed={selected}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{
                  color: selected ? "var(--accent-cyan)" : "var(--text-secondary)",
                  scale: selected ? 1.1 : 1,
                }}
                transition={spring.gentle}
                className="w-6 h-6 mt-0.5 shrink-0"
              >
                <t.Icon className="w-full h-full" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.div
                  className="font-semibold"
                  animate={{ color: selected ? "var(--accent-cyan)" : "var(--text-primary)" }}
                  transition={{ duration: 0.18, ease: ease.out }}
                >
                  {t.title}
                </motion.div>

                {/* Always show 2-line preview; expand smoothly when selected */}
                <motion.p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                  animate={{ opacity: 1 }}
                >
                  {/* Truncated preview — always visible */}
                  {!selected && (
                    <span className="line-clamp-2">{t.description}</span>
                  )}

                  {/* Full description — slides open on select */}
                  <AnimatePresence initial={false}>
                    {selected && (
                      <motion.span
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          transition: { duration: 0.28, ease: ease.out },
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          transition: { duration: 0.18, ease: ease.in },
                        }}
                        style={{ display: "block", overflow: "hidden" }}
                      >
                        {t.description}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.p>
              </div>

              {/* Right indicator */}
              <motion.div
                className="shrink-0 w-4 h-4 rounded-full border mt-0.5"
                animate={{
                  borderColor: selected ? "var(--accent-cyan)" : "var(--border-strong)",
                  backgroundColor: selected ? "var(--accent-cyan)" : "transparent",
                  scale: selected ? 1.1 : 1,
                }}
                transition={spring.snappy}
              >
                <AnimatePresence>
                  {selected && (
                    <motion.svg
                      key="check"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-full h-full"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={spring.bouncy}
                    >
                      <path
                        d="M4 8l3 3 5-5"
                        stroke="var(--brand-navy)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.button>
        );
      })}

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: ease.out }}
            className="text-xs"
            style={{ color: "var(--error)" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
