"use client";

import { m } from "motion/react";
import { useId } from "react";

import {
  BRAND_HEAD_PATH,
  BRAND_MAIN_PATH,
  BRAND_VIEWBOX,
} from "@/components/brand/BrandMark";
import { cx } from "@/lib/cx";
import { EASE, useMotionSafe } from "@/lib/motion";

/**
 * Signature loader: the logo draws itself.
 *
 * Choreography (one 2.6s cycle, looped):
 *  1. The zigzag strokes in bottom→top with the accelerating `draw` ease —
 *     the pen gains speed as it approaches the arrow tip.
 *  2. The orange arrowhead snaps in at the moment of arrival.
 *  3. A brief blue glow pulses over the whole mark (the "energization"),
 *     then the mark fades and the cycle restarts.
 *
 * Every animated value shares the same duration/repeat so the loop can
 * never drift out of sync. Only pathLength and opacity are animated.
 *
 * Reduced motion: the fully drawn mark with a gentle opacity pulse — no
 * drawing, no glow burst.
 *
 * The box is statically sized (size × size), so swapping a loader for
 * content never causes layout shift.
 */
export interface BrandLoaderProps {
  /** Rendered width/height in px (square). Default 64. */
  size?: number;
  /** Announced to screen readers via role="status". Default "Loading". */
  label?: string;
  className?: string;
}

const CYCLE_SECONDS = 2.6;

export function BrandLoader({
  size = 64,
  label = "Loading",
  className,
}: BrandLoaderProps) {
  const uid = useId();
  const gradientId = `${uid}-ascent`;
  const glowId = `${uid}-glow`;
  const motionSafe = useMotionSafe();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx("inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox={BRAND_VIEWBOX} width={size} height={size} aria-hidden>
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="14"
            y1="104"
            x2="100"
            y2="16"
          >
            <stop offset="0" stopColor="var(--color-blue-shade-1)" />
            <stop offset="0.55" stopColor="var(--color-blue-primary)" />
            <stop offset="1" stopColor="var(--color-blue-tint-1)" />
          </linearGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {motionSafe ? (
          <m.g animate={{ opacity: [1, 1, 0] }} transition={cycle([0, 0.92, 1])}>
            {/* Static glow layer; only its opacity animates (GPU-friendly). */}
            <m.path
              d={`${BRAND_MAIN_PATH} ${BRAND_HEAD_PATH}`}
              fill="none"
              stroke="var(--color-blue-tint-1)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowId})`}
              animate={{ opacity: [0, 0, 0.5, 0, 0] }}
              transition={cycle([0, 0.56, 0.7, 0.86, 1])}
            />
            {/* Main zigzag: accelerating draw into the tip. */}
            <m.path
              d={BRAND_MAIN_PATH}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ pathLength: [0, 1, 1] }}
              transition={{
                ...cycle([0, 0.5, 1]),
                ease: [EASE.draw, "linear"],
              }}
            />
            {/* Arrowhead: lands the moment the ascent completes. */}
            <m.path
              d={BRAND_HEAD_PATH}
              fill="none"
              stroke="var(--color-secondary-text)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{
                pathLength: [0, 0, 1, 1],
                opacity: [0, 0, 1, 1],
              }}
              transition={{
                pathLength: {
                  ...cycle([0, 0.5, 0.66, 1]),
                  ease: ["linear", "easeOut", "linear"],
                },
                opacity: cycle([0, 0.5, 0.52, 1]),
              }}
            />
          </m.g>
        ) : (
          <m.g
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d={BRAND_MAIN_PATH}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={BRAND_HEAD_PATH}
              fill="none"
              stroke="var(--color-secondary-text)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </m.g>
        )}
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Keyframe timing helper: same duration + infinite repeat everywhere. */
function cycle(times: number[]) {
  return { duration: CYCLE_SECONDS, times, repeat: Infinity };
}
