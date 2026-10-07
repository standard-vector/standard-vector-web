import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cx } from "@/lib/cx";

/**
 * Primary action component with the signature "energization" hover: the
 * oversized brand gradient slides toward its bright arrow-tip stop, the
 * brand-tinted shadow deepens and softens, and the button scales +2% —
 * one shared easing (--ease-energize), never an instant color swap.
 *
 * Deliberately CSS-only (server-renderable, zero JS): every state is a
 * transition on paint/transform properties, and the global reduced-motion
 * rule collapses them to instant state changes.
 *
 * Contrast constraints baked into the tones (see README):
 *  - blue: white ink; the gradient spans shade→primary and only *leans*
 *    toward the tint (78/22 mix) because white on pure tint fails AA.
 *  - orange: dark warm ink (--color-secondary-fg); white on orange is 2.8:1.
 */
export interface EnergizeButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /** Brand tone: gradient family, ink, and shadow. Default "blue". */
  tone?: "blue" | "orange";
  size?: "md" | "lg";
  /** When set, renders a Next.js <Link> styled identically. Only visual and
   *  aria props apply in link mode (button-specific props are dropped). */
  href?: string;
  children: ReactNode;
}

const TONE_CLASSES: Record<NonNullable<EnergizeButtonProps["tone"]>, string> = {
  blue: cx(
    "text-primary-fg shadow-brand-blue hover:shadow-brand-blue-hover",
    "[--energize-from:var(--color-blue-shade-1)]",
    "[--energize-mid:var(--color-primary)]",
    "[--energize-to:color-mix(in_oklab,var(--color-primary)_78%,var(--color-blue-tint-1))]",
  ),
  orange: cx(
    "text-secondary-fg shadow-brand-orange hover:shadow-brand-orange-hover",
    "[--energize-from:var(--color-secondary)]",
    "[--energize-mid:color-mix(in_oklab,var(--color-secondary)_55%,var(--color-orange-tint-1))]",
    "[--energize-to:var(--color-orange-tint-1)]",
  ),
};

const SIZE_CLASSES: Record<NonNullable<EnergizeButtonProps["size"]>, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const BASE_CLASSES = cx(
  "inline-flex select-none items-center justify-center gap-2 rounded-control",
  "font-medium tracking-[-0.01em] energize-surface transition-energize",
  "hover:scale-[1.02] active:scale-[0.99]",
  "disabled:pointer-events-none disabled:opacity-50",
);

export function EnergizeButton({
  tone = "blue",
  size = "md",
  href,
  className,
  children,
  type = "button",
  ...buttonProps
}: EnergizeButtonProps) {
  const classes = cx(
    BASE_CLASSES,
    TONE_CLASSES[tone],
    SIZE_CLASSES[size],
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={buttonProps["aria-label"]}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
