"use client";

import { m } from "motion/react";
import { useRef, type ReactNode } from "react";

import { Sparkline } from "@/components/ui/Sparkline";
import { cx } from "@/lib/cx";
import {
  VIEWPORT,
  cardItem,
  cardShell,
  useParallax,
  useTilt,
} from "@/lib/motion";

/**
 * <InsightCard /> — the living proof of the Dynamic Momentum system.
 *
 * Behavior
 *  - Scroll: translates with parallax, faster than its background section;
 *    `parallaxDistance` sets layer depth (featured cards pass more, 0 = off).
 *  - Pointer: tilts a few degrees away from the cursor (GPU transform only;
 *    auto-disabled on touch and under reduced motion).
 *  - Hover: energizes — +2% scale, the brand-tinted shadow deepens and
 *    softens, inner elements re-emphasize in a staggered cascade, and the
 *    title underline draws itself.
 *  - Entry: rises into view once, then cascades its data elements in
 *    sequence ("data being processed").
 *  - Theming: semantic tokens only; correct in both themes by construction.
 *
 * Figure contract (stat tile)
 *  - `label` sentence case; `value` pre-formatted & compact ("$12.5K"), worn
 *    in the body sans with proportional figures — never the display face.
 *  - `delta` is signed and read against a NAMED period; its color encodes
 *    direction × sentiment (up is not always good: pass `positive`), and an
 *    arrow + sr-only text keep it legible without color.
 *  - `trend` is a ≤12-point sparkline; recessive body, accented current
 *    period. Decorative — the value/delta text carries the data.
 *
 * Layout: asymmetric placement (spans, offsets, overlaps) belongs to the
 * parent via `className` — see MomentumField for the composition pattern.
 */
export interface InsightCardDelta {
  /** Signed display value, e.g. "+12.4%" or "−48ms". */
  value: string;
  direction: "up" | "down" | "flat";
  /** Whether this movement is good news. Default: `direction === "up"`. */
  positive?: boolean;
  /** The comparison period, e.g. "vs last 30 days". */
  label?: string;
}

export interface InsightCardProps {
  /** Brand tone: colored shadow, wash, and sparkline accent. */
  tone?: "blue" | "orange";
  /** Sentence-case metric name (the card title — gains the drawn underline). */
  label: string;
  /** Compact, pre-formatted reading, e.g. "$12.5K", "3.4×", "92%". */
  value: string;
  delta?: InsightCardDelta;
  /** Sparkline points, oldest → newest (≤12 by convention). */
  trend?: number[];
  /** Supporting sentence under the figure. */
  description?: string;
  /** Small print / provenance row, separated by a hairline. */
  footer?: ReactNode;
  /** Parallax depth in px (± translation across the viewport). 0 disables. */
  parallaxDistance?: number;
  /** Pointer tilt. Default true (self-disables on touch/reduced motion). */
  tilt?: boolean;
  /** Layout hooks from the parent: col spans, offsets, overlaps, z-order. */
  className?: string;
  /** Extra content, participates in the cascade. */
  children?: ReactNode;
}

const TONE = {
  blue: {
    shadow: "shadow-brand-blue hover:shadow-brand-blue-hover",
    border: "hover:border-interactive/50",
    wash: "bg-linear-[150deg] from-accent-blue/10 via-transparent via-55% to-transparent",
  },
  orange: {
    shadow: "shadow-brand-orange hover:shadow-brand-orange-hover",
    border: "hover:border-secondary/50",
    wash: "bg-linear-[150deg] from-accent-orange/10 via-transparent via-55% to-transparent",
  },
} as const;

const DELTA_INK: Record<"positive" | "negative" | "neutral", string> = {
  positive: "text-success-text",
  negative: "text-error-text",
  neutral: "text-text-muted",
};

export function InsightCard({
  tone = "blue",
  label,
  value,
  delta,
  trend,
  description,
  footer,
  parallaxDistance = 24,
  tilt = true,
  className,
  children,
}: InsightCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const parallaxY = useParallax(rootRef, parallaxDistance);
  const pointerTilt = useTilt();
  const toneStyle = TONE[tone];

  return (
    <div ref={rootRef} className={cx("group relative hover:z-20", className)}>
      {/* Parallax on its own wrapper: variants own `y` on the article, so the
          scroll offset must not share that channel. */}
      <m.div style={{ y: parallaxY }}>
        <m.article
          variants={cardShell}
          initial="hidden"
          whileInView="show"
          whileHover="hover"
          viewport={VIEWPORT}
          style={
            tilt && pointerTilt.enabled
              ? {
                  rotateX: pointerTilt.rotateX,
                  rotateY: pointerTilt.rotateY,
                  transformPerspective: 900,
                }
              : undefined
          }
          {...(tilt ? pointerTilt.handlers : {})}
          className={cx(
            "relative overflow-hidden rounded-card border border-ui-borders bg-surface-muted p-6",
            // Shadow/border energize via CSS; transform stays with Motion so
            // the two never fight over the same property.
            "transition-[box-shadow,border-color] duration-500 ease-energize",
            toneStyle.shadow,
            toneStyle.border,
          )}
        >
          <div aria-hidden className={cx("absolute inset-0", toneStyle.wash)} />

          <div className="relative flex h-full flex-col">
            <m.p variants={cardItem} className="text-sm font-medium text-text-muted">
              <span className="underline-draw">{label}</span>
            </m.p>

            <m.p variants={cardItem} className="mt-3 text-4xl font-semibold tracking-tight text-text">
              {value}
            </m.p>

            {delta && <Delta {...delta} />}

            {trend && trend.length >= 2 && (
              <m.div variants={cardItem} className="mt-5">
                <Sparkline points={trend} tone={tone} />
              </m.div>
            )}

            {description && (
              <m.p variants={cardItem} className="mt-4 text-sm leading-relaxed text-text-muted">
                {description}
              </m.p>
            )}

            {children && <m.div variants={cardItem}>{children}</m.div>}

            {footer && (
              <m.div
                variants={cardItem}
                className="mt-5 border-t border-ui-borders/60 pt-3 text-xs text-text-muted"
              >
                {footer}
              </m.div>
            )}
          </div>
        </m.article>
      </m.div>
    </div>
  );
}

function Delta({
  value,
  direction,
  positive = direction === "up",
  label = "vs previous period",
}: InsightCardDelta) {
  const sentiment =
    direction === "flat" ? "neutral" : positive ? "positive" : "negative";
  const srText =
    direction === "up"
      ? "increased"
      : direction === "down"
        ? "decreased"
        : "unchanged";

  return (
    <m.p variants={cardItem} className="mt-2 flex items-baseline gap-1.5 text-sm">
      <span
        className={cx(
          "inline-flex items-center gap-1 font-medium",
          DELTA_INK[sentiment],
        )}
      >
        <DeltaArrow direction={direction} />
        <span className="sr-only">{srText}</span>
        {value}
      </span>
      <span className="text-text-muted">{label}</span>
    </m.p>
  );
}

function DeltaArrow({ direction }: { direction: InsightCardDelta["direction"] }) {
  const d =
    direction === "up"
      ? "M4 12 L12 4 M6 4 h6 v6"
      : direction === "down"
        ? "M4 4 L12 12 M12 6 v6 h-6"
        : "M3 8 h10 M10 5 l3 3 -3 3";

  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 self-center"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
