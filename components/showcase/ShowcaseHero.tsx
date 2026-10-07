"use client";

import { m } from "motion/react";
import { useRef } from "react";

import { BRAND_MAIN_PATH, BRAND_VIEWBOX } from "@/components/brand/BrandMark";
import { EnergizeButton } from "@/components/ui/EnergizeButton";
import { cascade, riseIn, useParallax } from "@/lib/motion";

/**
 * Showcase hero: angular momentum-panel background, staggered copy entry,
 * and three oversized ghost zigzags drifting at DIFFERENT parallax depths —
 * the layered-depth principle demonstrated by the page itself.
 */
export function ShowcaseHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const layerSlow = useParallax(sectionRef, 24);
  const layerMid = useParallax(sectionRef, 56);
  const layerFast = useParallax(sectionRef, 96);

  return (
    <section
      ref={sectionRef}
      className="momentum-panel relative overflow-hidden"
    >
      {/* Depth layers — decorative brand strokes, each on its own speed. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <m.div style={{ y: layerSlow }} className="absolute -left-24 top-10 opacity-[0.05]">
          <GhostZigzag size={520} />
        </m.div>
        <m.div style={{ y: layerMid }} className="absolute right-[-8%] top-[-12%] opacity-[0.09]">
          <GhostZigzag size={420} />
        </m.div>
        <m.div style={{ y: layerFast }} className="absolute bottom-[-18%] left-[34%] opacity-[0.07]">
          <GhostZigzag size={340} />
        </m.div>
      </div>

      <m.div
        variants={cascade}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-6xl px-6 py-28 md:py-36"
      >
        <m.p
          variants={riseIn}
          className="inline-flex items-center gap-2 rounded-full border border-ui-borders/70 bg-surface-muted/70 px-4 py-1.5 text-xs font-medium tracking-wide text-text-muted"
        >
          <span className="size-1.5 rounded-full bg-secondary" aria-hidden />
          Dynamic Momentum · design system v1
        </m.p>

        <m.h1
          variants={riseIn}
          className="mt-8 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-text md:text-7xl"
        >
          Momentum you can <span className="text-gradient-brand">measure</span>.
        </m.h1>

        <m.p
          variants={riseIn}
          className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted"
        >
          The visual language of Standard Vector: ascending trajectories,
          layered depth, and interactions that energize instead of switch.
          Every token, easing, and component on this page is the living
          specification.
        </m.p>

        <m.div variants={riseIn} className="mt-10 flex flex-wrap gap-4">
          <EnergizeButton href="#momentum" tone="blue" size="lg">
            Explore the components
            <AscendArrow />
          </EnergizeButton>
          <EnergizeButton href="#tokens" tone="orange" size="lg">
            Token reference
          </EnergizeButton>
        </m.div>
      </m.div>
    </section>
  );
}

function GhostZigzag({ size }: { size: number }) {
  return (
    <svg viewBox={BRAND_VIEWBOX} width={size} height={size} aria-hidden>
      <path
        d={BRAND_MAIN_PATH}
        fill="none"
        stroke="var(--color-interactive)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AscendArrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 13 L13 3 M6 3 h7 v7" />
    </svg>
  );
}
