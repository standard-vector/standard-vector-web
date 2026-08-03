import { cx } from "@/lib/cx";

/**
 * Decorative section delimiter echoing the logo's zigzag: an ascending
 * stroke that blends the blue family into the orange family through their
 * shades (never a hard 50/50 split), with a faint offset echo for depth.
 * Purely presentational (aria-hidden); stretches full-bleed.
 */
export function ZigzagDivider({
  className,
  flip = false,
}: {
  className?: string;
  /** Mirror the ascent (for alternating section rhythm). */
  flip?: boolean;
}) {
  return (
    <div aria-hidden className={cx("relative h-20 w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className={cx("absolute inset-0 size-full", flip && "-scale-x-100")}
      >
        <defs>
          <linearGradient id="sv-zigzag-ascent" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--color-blue-shade-1)" />
            <stop offset="0.45" stopColor="var(--color-blue-primary)" />
            <stop offset="0.75" stopColor="var(--color-orange-shade-1)" />
            <stop offset="1" stopColor="var(--color-orange-tint-1)" />
          </linearGradient>
        </defs>
        <path
          d="M0 72 L180 40 L340 78 L560 24 L720 62 L940 14 L1120 50 L1440 6"
          fill="none"
          stroke="url(#sv-zigzag-ascent)"
          strokeWidth="2.5"
          opacity="0.4"
        />
        <path
          d="M0 72 L180 40 L340 78 L560 24 L720 62 L940 14 L1120 50 L1440 6"
          transform="translate(0 14)"
          fill="none"
          stroke="url(#sv-zigzag-ascent)"
          strokeWidth="2"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}
