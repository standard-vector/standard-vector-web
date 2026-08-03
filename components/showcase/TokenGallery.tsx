"use client";

import { m } from "motion/react";

import { cx } from "@/lib/cx";
import { VIEWPORT, cascade, riseIn } from "@/lib/motion";

/**
 * Living token reference: every semantic color, both shadow families, the
 * two type voices, and the motion signature — rendered BY the tokens they
 * document, so drift is impossible. Laid out as an asymmetric split
 * (7/5 columns, offset right rail), not a uniform grid.
 */

type SwatchKind = "fill" | "ink";

interface TokenEntry {
  token: string;
  cls: string;
  role: string;
  kind: SwatchKind;
}

const SEMANTIC_TOKENS: TokenEntry[] = [
  { token: "--color-surface", cls: "bg-surface", role: "Page background", kind: "fill" },
  { token: "--color-surface-muted", cls: "bg-surface-muted", role: "Cards & secondary sections", kind: "fill" },
  { token: "--color-ui-borders", cls: "bg-ui-borders", role: "Hairlines & dividers", kind: "fill" },
  { token: "--color-text", cls: "text-text", role: "Primary text (AA on both surfaces)", kind: "ink" },
  { token: "--color-text-muted", cls: "text-text-muted", role: "Secondary text & captions", kind: "ink" },
  { token: "--color-primary", cls: "bg-primary", role: "Primary actions (with --color-primary-fg ink)", kind: "fill" },
  { token: "--color-secondary", cls: "bg-secondary", role: "Secondary highlight (with --color-secondary-fg ink)", kind: "fill" },
  { token: "--color-interactive", cls: "text-interactive", role: "Links & interactive text — flips per theme to hold AA", kind: "ink" },
  { token: "--color-secondary-text", cls: "text-secondary-text", role: "Orange as text — tint on dark, shade on light", kind: "ink" },
  { token: "--color-success-text", cls: "text-success-text", role: "Positive deltas (with icon, never color alone)", kind: "ink" },
  { token: "--color-error-text", cls: "text-error-text", role: "Negative deltas (with icon, never color alone)", kind: "ink" },
  { token: "--color-focus-ring", cls: "bg-focus-ring", role: "Keyboard focus outline (≥3:1 on both surfaces)", kind: "fill" },
];

const PRIMITIVES = [
  { token: "--color-blue-shade-1", cls: "bg-blue-shade-1" },
  { token: "--color-blue-primary", cls: "bg-blue-primary" },
  { token: "--color-blue-tint-1", cls: "bg-blue-tint-1" },
  { token: "--color-orange-shade-1", cls: "bg-orange-shade-1" },
  { token: "--color-orange-secondary", cls: "bg-orange-secondary" },
  { token: "--color-orange-tint-1", cls: "bg-orange-tint-1" },
];

const MOTION_TOKENS = [
  { name: "--ease-energize", value: "cubic-bezier(0.33, 1, 0.24, 1)", role: "Every interaction — the signature" },
  { name: "--ease-draw", value: "cubic-bezier(0.6, 0.04, 0.85, 0.3)", role: "Stroke drawing — accelerates into the tip" },
  { name: "--sv-duration-quick", value: "160ms", role: "Micro feedback" },
  { name: "--sv-duration-base", value: "280ms", role: "State changes" },
  { name: "--sv-duration-slow", value: "500ms", role: "Energize hovers, underlines" },
  { name: "--sv-duration-draw", value: "1500ms", role: "Loader stroke" },
];

export function TokenGallery() {
  return (
    <section id="tokens" className="scroll-mt-24 py-24">
      <m.div
        variants={cascade}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="mx-auto max-w-6xl px-6"
      >
        <m.p variants={riseIn} className="text-sm font-semibold tracking-wide text-secondary-text">
          Token reference
        </m.p>
        <m.h2
          variants={riseIn}
          className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-text md:text-5xl"
        >
          Semantic by decree, branded by construction
        </m.h2>
        <m.p variants={riseIn} className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">
          Components may only reference these semantic tokens — raw hex exists
          solely in <code className="font-mono text-sm text-text">globals.css</code>.
          Toggle the theme: every swatch below re-resolves live.
        </m.p>

        {/* Brand primitives ribbon: the logo's ramp, shade → tint. */}
        <m.div variants={riseIn} className="mt-12">
          <h3 className="text-sm font-medium text-text-muted">
            Brand primitives (allowed only in brand art & gradients)
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {PRIMITIVES.map(({ token, cls }) => (
              <span
                key={token}
                className="flex items-center gap-2.5 rounded-control border border-ui-borders/60 bg-surface-muted/60 py-2 pl-2.5 pr-4"
              >
                <span aria-hidden className={cx("size-6 rounded-[0.4rem]", cls)} />
                <code className="font-mono text-xs text-text-muted">{token}</code>
              </span>
            ))}
          </div>
        </m.div>

        {/* Asymmetric 7/5 split with an offset right rail. */}
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
          <m.ul variants={riseIn} className="space-y-2.5 md:col-span-7">
            {SEMANTIC_TOKENS.map((entry) => (
              <TokenRow key={entry.token} {...entry} />
            ))}
          </m.ul>

          <div className="space-y-10 md:col-span-5 md:mt-16">
            {/* Colored elevation — hover to deepen & soften. */}
            <m.div variants={riseIn}>
              <h3 className="text-sm font-medium text-text-muted">
                Brand-tinted elevation (hover)
              </h3>
              <div className="mt-4 space-y-5">
                <div className="rounded-card border border-ui-borders bg-surface-muted p-5 shadow-brand-blue transition-energize hover:-translate-y-0.5 hover:shadow-brand-blue-hover">
                  <code className="font-mono text-xs text-text-muted">--shadow-brand-blue</code>
                  <p className="mt-1 text-sm text-text">
                    Blue elements cast blue-shade shadows — never gray.
                  </p>
                </div>
                <div className="ml-6 rounded-card border border-ui-borders bg-surface-muted p-5 shadow-brand-orange transition-energize hover:-translate-y-0.5 hover:shadow-brand-orange-hover">
                  <code className="font-mono text-xs text-text-muted">--shadow-brand-orange</code>
                  <p className="mt-1 text-sm text-text">
                    Orange elements answer with orange-shade depth.
                  </p>
                </div>
              </div>
            </m.div>

            {/* Type voices */}
            <m.div variants={riseIn}>
              <h3 className="text-sm font-medium text-text-muted">Type voices</h3>
              <div className="mt-4 rounded-card border border-ui-borders bg-surface-muted p-5">
                <p className="font-display text-2xl font-semibold tracking-tight text-text">
                  Display: Space Grotesk
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Body &amp; data: Inter. Stat values wear the body sans with
                  proportional figures — 1,284 / 12.9K / $4.2M — never the
                  display face.
                </p>
              </div>
            </m.div>

            {/* Motion signature */}
            <m.div variants={riseIn}>
              <h3 className="text-sm font-medium text-text-muted">Motion signature</h3>
              <ul className="mt-4 divide-y divide-ui-borders/60 rounded-card border border-ui-borders bg-surface-muted px-5">
                {MOTION_TOKENS.map(({ name, value, role }) => (
                  <li key={name} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
                    <code className="font-mono text-xs text-text">{name}</code>
                    <code className="font-mono text-xs text-text-muted">{value}</code>
                    <span className="w-full text-xs text-text-muted">{role}</span>
                  </li>
                ))}
              </ul>
            </m.div>
          </div>
        </div>
      </m.div>
    </section>
  );
}

function TokenRow({ token, cls, role, kind }: TokenEntry) {
  return (
    <li className="flex items-center gap-4 rounded-control border border-ui-borders/60 bg-surface-muted/60 px-4 py-3">
      {kind === "fill" ? (
        <span
          aria-hidden
          className={cx("size-9 shrink-0 rounded-control border border-ui-borders", cls)}
        />
      ) : (
        <span
          aria-hidden
          className={cx(
            "grid size-9 shrink-0 place-items-center rounded-control border border-ui-borders bg-surface text-base font-semibold",
            cls,
          )}
        >
          Ag
        </span>
      )}
      <span className="min-w-0 flex-1">
        <code className="font-mono text-[13px] text-text">{token}</code>
        <span className="mt-0.5 block text-xs text-text-muted">{role}</span>
      </span>
    </li>
  );
}
