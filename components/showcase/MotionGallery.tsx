"use client";

import { m } from "motion/react";
import { useState } from "react";

import { BrandLoader } from "@/components/brand/BrandLoader";
import { EnergizeButton } from "@/components/ui/EnergizeButton";
import { cx } from "@/lib/cx";
import { VIEWPORT, cascade, riseIn } from "@/lib/motion";

/**
 * Interaction gallery + the four Dynamic Momentum principles as living
 * documentation. The principle cards sit in offset pairs (fluid asymmetry),
 * never a uniform grid.
 */

const PRINCIPLES = [
  {
    title: "Upward trajectory",
    body: "Layouts, gradients, and entrances suggest ascent: content rises in, gradients climb corner to corner, the loader draws bottom to top.",
    tokens: "riseIn · momentum-panel · --ease-draw",
  },
  {
    title: "Layered depth",
    body: "Depth comes from brand-tinted shadows and parallax layers moving at different speeds — never flat gray elevation.",
    tokens: "--shadow-brand-* · useParallax · useTilt",
  },
  {
    title: "Signature motion",
    body: "Interactions energize: gradients slide, glows deepen, scale grows two percent — all on one shared easing, never an instant swap.",
    tokens: "--ease-energize · energize-surface · transition-energize",
  },
  {
    title: "Fluid asymmetry",
    body: "The 12-column grid is scaffolding, not rhythm: irregular spans, stair-step offsets, and overlapping cards imply trajectory.",
    tokens: "col-start-* · negative margins · hover z-lift",
  },
];

export function MotionGallery() {
  const [loaderRun, setLoaderRun] = useState(0);

  return (
    <section id="components" className="scroll-mt-24 pb-28 pt-8">
      <m.div
        variants={cascade}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="mx-auto max-w-6xl px-6"
      >
        <m.p variants={riseIn} className="text-sm font-semibold tracking-wide text-secondary-text">
          Brand components
        </m.p>
        <m.h2
          variants={riseIn}
          className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-text md:text-5xl"
        >
          The signature, in motion
        </m.h2>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* BrandLoader — self-drawing logo. */}
          <m.div
            variants={riseIn}
            className="rounded-card border border-ui-borders bg-surface-muted p-6 shadow-brand-blue md:col-span-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-text">
                  BrandLoader
                </h3>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-text-muted">
                  The logo draws itself bottom → top, accelerating into the
                  arrow tip; the orange head lands with a glow pulse. Under
                  reduced motion it becomes a gentle fade.
                </p>
              </div>
              <EnergizeButton tone="blue" onClick={() => setLoaderRun((n) => n + 1)}>
                Replay
              </EnergizeButton>
            </div>
            <div key={loaderRun} className="mt-6 flex items-end gap-10">
              <BrandLoader size={40} label="Loading, small" />
              <BrandLoader size={72} label="Loading, medium" />
              <BrandLoader size={104} label="Loading, large" />
            </div>
          </m.div>

          {/* EnergizeButton wall. */}
          <m.div
            variants={riseIn}
            className="rounded-card border border-ui-borders bg-surface-muted p-6 shadow-brand-orange md:col-span-5 md:mt-14"
          >
            <h3 className="font-display text-lg font-semibold text-text">
              EnergizeButton
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              Hover: the gradient slides toward its bright stop while the
              colored shadow deepens — no instant color swaps anywhere.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <EnergizeButton tone="blue">Primary action</EnergizeButton>
              <EnergizeButton tone="orange">Secondary action</EnergizeButton>
              <EnergizeButton tone="blue" size="lg">
                Large
              </EnergizeButton>
              <EnergizeButton tone="orange" size="lg" disabled>
                Disabled
              </EnergizeButton>
            </div>
          </m.div>

          {/* Underline draw demo. */}
          <m.div
            variants={riseIn}
            className="group rounded-card border border-ui-borders bg-surface-muted p-6 md:col-span-4 md:col-start-2 md:-mt-6"
          >
            <h3 className="font-display text-lg font-semibold text-text">
              <span className="underline-draw">Underline, drawn</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Hover this card: titles gain a gradient underline that draws
              itself left to right — transform-only, zero layout shift.
            </p>
          </m.div>

          {/* Principles — offset pairs. */}
          {PRINCIPLES.map((principle, index) => (
            <m.div
              key={principle.title}
              variants={riseIn}
              className={cx(
                "rounded-card border border-ui-borders bg-surface-muted/70 p-6",
                index === 0 && "md:col-span-6 md:col-start-7 md:-mt-24",
                index === 1 && "md:col-span-5 md:col-start-2 md:mt-4",
                index === 2 && "md:col-span-6 md:col-start-7 md:-mt-8",
                index === 3 && "md:col-span-5 md:col-start-3 md:mt-6",
              )}
            >
              <h3 className="font-display text-base font-semibold text-text">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {principle.body}
              </p>
              <code className="mt-3 block font-mono text-xs text-interactive">
                {principle.tokens}
              </code>
            </m.div>
          ))}
        </div>

        <m.p variants={riseIn} className="mt-14 max-w-2xl text-sm leading-relaxed text-text-muted">
          Accessibility guardrails: honor{" "}
          <code className="font-mono text-xs text-text">prefers-reduced-motion</code>{" "}
          (parallax, tilt, and drawing collapse to fades), animate only
          transform and opacity on scroll, and keep every interactive state
          reachable by keyboard with a{" "}
          <span className="text-focus-ring">--color-focus-ring</span> outline.
        </m.p>
      </m.div>
    </section>
  );
}
