"use client";

import { m } from "motion/react";

import { cx } from "@/lib/cx";
import { drawPath, fadeIn, useMotionSafe } from "@/lib/motion";

/**
 * Stat-tile trend line (≤12 points by convention). Follows the dataviz
 * figure contract: the line body wears the recessive data hue — the number
 * above carries the reading — while the CURRENT period (last segment + end
 * dot) wears the tone's AA accent ink. The end dot is an HTML overlay so it
 * stays perfectly round (the SVG stretches to fill) and keeps a 2px surface
 * ring. Decorative: aria-hidden; the value/delta text carries the data.
 *
 * Draw-in animation participates in the owning card's cascade (variants
 * propagate); under reduced motion it becomes a plain fade.
 */
export interface SparklineProps {
  points: number[];
  tone?: "blue" | "orange";
  className?: string;
}

const VIEW_W = 100;
const VIEW_H = 32;
const PAD_Y = 4;

const TONE_ACCENT: Record<NonNullable<SparklineProps["tone"]>, string> = {
  blue: "var(--color-interactive)",
  orange: "var(--color-secondary-text)",
};

export function Sparkline({ points, tone = "blue", className }: SparklineProps) {
  const motionSafe = useMotionSafe();

  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((value, index) => ({
    x: (index / (points.length - 1)) * VIEW_W,
    y: PAD_Y + (1 - (value - min) / range) * (VIEW_H - PAD_Y * 2),
  }));
  const body = coords.map(({ x, y }) => `${x},${y}`).join(" ");
  const current = coords.slice(-2);
  const last = coords[coords.length - 1];
  const accent = TONE_ACCENT[tone];
  const lineVariants = motionSafe ? drawPath : fadeIn;

  return (
    <div aria-hidden className={cx("relative h-10 w-full", className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        <m.polyline
          points={body}
          fill="none"
          stroke="var(--color-data-dim)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          variants={lineVariants}
        />
        <m.polyline
          points={current.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          variants={lineVariants}
        />
      </svg>
      {/* Current-period marker: ≥8px hit, 2px surface ring per mark specs. */}
      <m.span
        variants={fadeIn}
        className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface-muted"
        style={{
          left: `${(last.x / VIEW_W) * 100}%`,
          top: `${(last.y / VIEW_H) * 100}%`,
          backgroundColor: accent,
        }}
      />
    </div>
  );
}
