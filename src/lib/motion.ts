/**
 * Shared Framer Motion presets for YALI Summit 2026
 * Design language: cinematic dark, snappy spring physics, directional hierarchy
 *
 * Easing: cubic-bezier(0.16, 1, 0.3, 1) — expo-out, feels premium/snappy
 * Spring: stiffness 400 / damping 30 — responsive without bounce
 */

// ─── Easing tokens ──────────────────────────────────────────────────────────
export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  in: [0.7, 0, 0.84, 0] as [number, number, number, number],
  inOut: [0.87, 0, 0.13, 1] as [number, number, number, number],
} as const;

// ─── Spring presets ──────────────────────────────────────────────────────────
export const spring = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  gentle: { type: "spring" as const, stiffness: 200, damping: 25 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 18 },
  slow:   { type: "spring" as const, stiffness: 120, damping: 20 },
} as const;

// ─── Page / step transitions ─────────────────────────────────────────────────
/** Direction: +1 = forward (slide from right), -1 = back (slide from left) */
export const stepVariants = (direction: number) => ({
  enter: {
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 380, damping: 32 },
      opacity: { duration: 0.2, ease: ease.out },
    },
  },
  exit: {
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: {
      x: { duration: 0.18, ease: ease.in },
      opacity: { duration: 0.14 },
    },
  },
});

// ─── Fade up (general section entrance) ──────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.out },
  },
};

// ─── Stagger container ────────────────────────────────────────────────────────
export const staggerContainer = (staggerSecs = 0.06) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: staggerSecs, delayChildren: 0.05 },
  },
});

// ─── Stagger child ────────────────────────────────────────────────────────────
export const staggerChild = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 380, damping: 28 },
  },
};

// ─── Card micro-interaction ───────────────────────────────────────────────────
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -2,
    transition: { type: "spring" as const, stiffness: 400, damping: 22 },
  },
  tap: {
    scale: 0.97,
    y: 0,
    transition: { type: "spring" as const, stiffness: 500, damping: 30 },
  },
};

// ─── Error shake ─────────────────────────────────────────────────────────────
export const errorShake = {
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.45, ease: "easeInOut" as const },
  },
  idle: { x: 0 },
};

// ─── Success pop ─────────────────────────────────────────────────────────────
export const successPop = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 18 },
  },
};

// ─── Slide-down reveal (error/helper text) ────────────────────────────────────
export const slideDown = {
  hidden: { opacity: 0, y: -6, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: { duration: 0.22, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -4,
    height: 0,
    transition: { duration: 0.16, ease: ease.in },
  },
};

// ─── Button CTA ───────────────────────────────────────────────────────────────
export const ctaButton = {
  rest: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: { type: "spring" as const, stiffness: 400, damping: 20 },
  },
  tap: {
    scale: 0.96,
    transition: { type: "spring" as const, stiffness: 600, damping: 30 },
  },
};
