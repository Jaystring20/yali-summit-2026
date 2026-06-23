import { motion } from "framer-motion";
import { spring, ease } from "@/lib/motion";

const labels = ["Type", "Personal", "Track", "Logistics", "Payment"];

export function ProgressIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Registration progress" className="mb-8">
      <ol className="flex items-center">
        {labels.map((label, i) => {
          const step = i + 1;
          const isActive = step === current;
          const isDone = step < current;
          const isLast = step === labels.length;

          return (
            <li key={label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                {/* Bubble */}
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 relative"
                  animate={{
                    backgroundColor:
                      isDone
                        ? "var(--accent-cyan)"
                        : isActive
                        ? "var(--accent-cyan)"
                        : "var(--surface)",
                    color:
                      isActive || isDone ? "var(--brand-navy)" : "var(--text-secondary)",
                    borderColor:
                      isActive || isDone ? "var(--accent-cyan)" : "var(--border-strong)",
                  }}
                  transition={spring.snappy}
                  style={{
                    border: "1.5px solid",
                    boxShadow: isActive
                      ? "0 0 0 3px color-mix(in oklab, var(--accent-cyan) 22%, transparent), 0 0 12px color-mix(in oklab, var(--accent-cyan) 20%, transparent)"
                      : isDone
                      ? "0 0 8px color-mix(in oklab, var(--accent-cyan) 25%, transparent)"
                      : "none",
                  }}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isDone ? (
                    <motion.svg
                      key="check"
                      className="w-4 h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={spring.bouncy}
                    >
                      <path
                        d="M3 8l3.5 3.5L13 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  ) : (
                    <motion.span
                      key="number"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {step}
                    </motion.span>
                  )}
                </motion.div>

                {/* Label */}
                <motion.span
                  className="text-[10px] sm:text-xs whitespace-nowrap"
                  animate={{
                    color: isActive
                      ? "var(--accent-cyan)"
                      : isDone
                      ? "var(--text-secondary)"
                      : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  transition={{ duration: 0.2, ease: ease.out }}
                >
                  {label}
                </motion.span>
              </div>

              {/* Connector line with fill animation */}
              {!isLast && (
                <div
                  className="flex-1 mx-1 sm:mx-2 mb-5 h-px relative overflow-hidden rounded-full"
                  style={{ background: "var(--border-strong)" }}
                >
                  <motion.div
                    className="absolute inset-0 h-full rounded-full"
                    style={{ background: "var(--accent-cyan)" }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: isDone ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: ease.out }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
