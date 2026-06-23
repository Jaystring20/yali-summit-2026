import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: keyof typeof motion;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[Tag] as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </Comp>
  );
}

export const staggerParent: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Vertical "PRESENTS:" / "THEME:" style side label from the summit poster.
 * Lives absolute against a relatively-positioned section.
 */
export function SideLabel({
  children,
  side = "left",
  tone = "cyan",
}: {
  children: ReactNode;
  side?: "left" | "right";
  tone?: "cyan" | "muted";
}) {
  return (
    <div
      aria-hidden
      className={`hidden xl:flex absolute top-1/2 ${
        side === "left" ? "left-6 2xl:left-10" : "right-6 2xl:right-10"
      } -translate-y-1/2 origin-center ${
        side === "left" ? "-rotate-90" : "rotate-90"
      } select-none pointer-events-none`}
    >
      <span
        className={`font-mono text-[10px] tracking-[0.4em] uppercase whitespace-nowrap max-w-[40vh] ${
          tone === "cyan" ? "text-accent-cyan" : "text-text-secondary/60"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * Halftone dot backdrop — echoes the wave halftone on the summit poster.
 * Subtle, sits behind hero content. Pure CSS radial gradient.
 */
export function HalftoneBackdrop({
  className = "",
  intensity = "soft",
}: {
  className?: string;
  intensity?: "soft" | "strong";
}) {
  const size = intensity === "strong" ? "14px 14px" : "18px 18px";
  const opacity = intensity === "strong" ? 0.22 : 0.14;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1.2px)",
          backgroundSize: size,
          color: "var(--accent-cyan)",
          opacity,
          maskImage:
            "radial-gradient(ellipse 85% 65% at 50% 40%, black, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 65% at 50% 40%, black, transparent 78%)",
        }}
      />
    </div>
  );
}

/**
 * Eyebrow tag — "PRESENTS:" style cyan chip from poster.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-accent-cyan font-mono text-[11px] tracking-[0.32em] uppercase">
      <span className="h-px w-6 bg-accent-cyan" />
      {children}
    </span>
  );
}