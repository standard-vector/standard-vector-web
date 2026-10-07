/**
 * Static Standard Vector logo: an ascending zigzag that resolves into an
 * upward arrow. Server-safe (no motion) — use it in headers, footers, and
 * anywhere the mark should not animate. The animated variant is
 * <BrandLoader />.
 *
 * The stroke climbs the brand blue ramp from shade (base) to tint (tip) —
 * userSpaceOnUse pins the gradient to the ascent axis. The arrowhead wears
 * the per-theme orange ink so it stays visible on both surfaces.
 */

export const BRAND_MAIN_PATH = "M14 104 L40 58 L58 84 L100 16";
export const BRAND_HEAD_PATH = "M81 27.1 L100 16 L98.6 37.9";
export const BRAND_VIEWBOX = "0 0 120 120";

export interface BrandMarkProps {
  /** Rendered width/height in px (square). */
  size?: number;
  /** Accessible name. Omit for decorative uses (aria-hidden). */
  title?: string;
  className?: string;
  /** Namespace for SVG defs ids — override when two differently-styled
   *  marks could collide in one document. */
  idPrefix?: string;
}

export function BrandMark({
  size = 32,
  title,
  className,
  idPrefix = "sv-mark",
}: BrandMarkProps) {
  const gradientId = `${idPrefix}-ascent`;

  return (
    <svg
      viewBox={BRAND_VIEWBOX}
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
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
      </defs>
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
    </svg>
  );
}
