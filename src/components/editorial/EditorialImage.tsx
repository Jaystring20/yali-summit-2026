import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

type Props = {
  src: string;
  alt: string;
  /** Tailwind aspect class, e.g. "aspect-[21/9]" or "aspect-[4/3]" */
  aspect?: string;
  /** Apply a subtle navy/cyan duotone to harmonize with the design system. */
  duotone?: boolean;
  /** Eager-load (set true only for above-the-fold imagery). */
  priority?: boolean;
  className?: string;
  /** Optional rounded corners (default 2xl) */
  rounded?: string;
  /** Caption shown below image, small mono uppercase. */
  caption?: string;
  /** Sizes attribute for responsive picture. */
  sizes?: string;
  width?: number;
  height?: number;
};

/**
 * Editorial image with optional cyan duotone overlay, soft fade-in,
 * and consistent rounded surface. Strictly presentational.
 */
export function EditorialImage({
  src,
  alt,
  aspect = "aspect-[16/9]",
  duotone = true,
  priority = false,
  className = "",
  rounded = "rounded-2xl",
  caption,
  sizes = "(min-width: 1024px) 1024px, 100vw",
  width,
  height,
}: Props) {
  const reduce = useReducedMotion();

  const overlayStyle: CSSProperties = duotone
    ? {
        background:
          "linear-gradient(135deg, rgba(10,17,40,0.45) 0%, rgba(10,17,40,0.15) 45%, rgba(0,217,255,0.18) 100%)",
        mixBlendMode: "multiply",
      }
    : {};

  return (
    <figure className={className}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`relative overflow-hidden ${rounded} ${aspect} bg-surface ring-1 ring-border-strong`}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes={sizes}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {duotone && (
          <span aria-hidden="true" className="absolute inset-0" style={overlayStyle} />
        )}
        {/* subtle bottom gradient for legibility when used behind text */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,17,40,0.55) 0%, transparent 100%)",
          }}
        />
      </motion.div>
      {caption && (
        <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-secondary">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}