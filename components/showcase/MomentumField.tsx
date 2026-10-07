"use client";

import { m } from "motion/react";

import { InsightCard } from "@/components/ui/InsightCard";
import { VIEWPORT, cascade, riseIn } from "@/lib/motion";

/**
 * The asymmetric dashboard field — the composition pattern for InsightCard.
 *
 * A 12-column grid is only the scaffold: irregular spans, stair-step top
 * margins, negative pulls between rows, and per-card parallax depths break
 * the uniform rhythm so the section reads as an ascending trajectory
 * (bottom-left mass → top-right energy). Featured cards carry more parallax
 * than background cards; overlaps resolve on hover via z-lift.
 *
 * All figures are static sample data for the design showcase — no business
 * logic lives here.
 */
export function MomentumField() {
  return (
    <section id="momentum" className="relative scroll-mt-24 overflow-x-clip py-24">
      {/* Angular gradient band sweeping behind the field. */}
      <div
        aria-hidden
        className="momentum-panel absolute inset-x-0 top-40 -z-10 h-[26rem] -skew-y-3 border-y border-ui-borders/40"
      />

      <m.div
        variants={cascade}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="mx-auto max-w-6xl px-6"
      >
        <m.p variants={riseIn} className="text-sm font-semibold tracking-wide text-secondary-text">
          Reference component
        </m.p>
        <m.h2
          variants={riseIn}
          className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-text md:text-5xl"
        >
          InsightCard, composed with momentum
        </m.h2>
        <m.p variants={riseIn} className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">
          Scroll to feel the layers move at different speeds; hover a card to
          energize it — scale, colored shadow, staggered re-emphasis, and the
          drawn underline. Sample data, real system.
        </m.p>
      </m.div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-12 md:gap-y-0">
        <InsightCard
          className="md:col-span-5"
          tone="orange"
          parallaxDistance={48}
          label="Return on AI investment"
          value="3.4×"
          delta={{ value: "+0.6×", direction: "up", label: "vs last quarter" }}
          trend={[1.8, 2.1, 2.0, 2.4, 2.2, 2.6, 2.9, 2.7, 3.0, 3.2, 3.1, 3.4]}
          description="Value generated per unit of AI infrastructure and token spend, portfolio-wide."
          footer="Sample data · updated hourly in production"
        />

        <InsightCard
          className="md:col-span-4 md:col-start-6 md:mt-14"
          tone="blue"
          parallaxDistance={20}
          label="Token spend, 30 days"
          value="$12.5K"
          delta={{
            value: "+8.2%",
            direction: "up",
            positive: false,
            label: "vs prior 30 days",
          }}
          trend={[7.2, 7.8, 8.1, 8.0, 8.9, 9.4, 9.1, 10.2, 10.8, 11.4, 12.1, 12.5]}
        />

        <InsightCard
          className="md:col-span-3 md:col-start-10 md:-ml-8 md:mt-28"
          tone="blue"
          parallaxDistance={12}
          label="Policy coverage"
          value="92%"
          delta={{ value: "+4 pts", direction: "up", label: "vs last audit" }}
        />

        <InsightCard
          className="md:col-span-4 md:col-start-2 md:-mt-10"
          tone="blue"
          parallaxDistance={30}
          label="Gateway latency, p95"
          value="812ms"
          delta={{
            value: "−9.6%",
            direction: "down",
            positive: true,
            label: "vs prior week",
          }}
          description="Faster is better: downward movement reads as success."
        />

        <InsightCard
          className="md:col-span-5 md:col-start-7 md:-mt-24"
          tone="orange"
          parallaxDistance={60}
          label="Value generated, 30 days"
          value="$41.2K"
          delta={{ value: "+18.9%", direction: "up", label: "vs prior 30 days" }}
          trend={[22, 24, 23, 26, 28, 27, 31, 33, 32, 36, 39, 41.2]}
          footer="Sample data · correlates cost with financial outcomes"
        />
      </div>
    </section>
  );
}
