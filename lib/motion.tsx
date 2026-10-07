"use client";

/**
 * DYNAMIC MOMENTUM — MOTION LAYER
 * ----------------------------------------------------------------------------
 * The single home for every duration, easing, variant, and motion hook.
 * Components never define one-off timings: they compose these exports so all
 * movement shares the brand signature (fast attack, long confident settle,
 * always ascending).
 *
 * Library choice: Motion (the current distribution of Framer Motion) —
 * hybrid engine, first-class React 19 support, and `LazyMotion` keeps the
 * runtime slice small. It is the ONLY animation dependency.
 *
 * Reduced-motion strategy (two layers):
 *  1. <MotionConfig reducedMotion="user"> strips transform/layout animation
 *     from every variant automatically, leaving opacity fades.
 *  2. Continuous effects that bypass variants (scroll parallax, pointer
 *     tilt, SVG stroke drawing) gate themselves through `useMotionSafe`.
 * CSS-only interactions are collapsed by the global media query in
 * app/globals.css.
 *
 * `.tsx` rather than `.ts` only because MotionProvider returns JSX.
 */

import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

/* ----------------------------------------------------------------------------
 * Tokens — mirrors --sv-duration-* and --ease-* in app/globals.css.
 * Keep both files in sync; CSS cannot import JS and vice versa.
 * ------------------------------------------------------------------------- */

/** Durations in seconds (Motion convention). */
export const DURATION = {
  quick: 0.16,
  base: 0.28,
  slow: 0.5,
  draw: 1.5,
} as const;

type Bezier = [number, number, number, number];

/** Cubic-bézier signatures. `energize` is THE brand easing; `draw` is the
 *  accelerating ease-in used for stroke drawing (speeds up toward the tip). */
export const EASE: Record<"energize" | "draw", Bezier> = {
  energize: [0.33, 1, 0.24, 1],
  draw: [0.6, 0.04, 0.85, 0.3],
};

/** Shared whileInView viewport contract: animate once, when a quarter of the
 *  element is visible — enough to feel intentional without popping early. */
export const VIEWPORT = { once: true, amount: 0.25 } as const;

/* ----------------------------------------------------------------------------
 * Variants
 * ------------------------------------------------------------------------- */

/** Default entrance: rise + fade along the brand's upward trajectory. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.energize },
  },
};

/** Stagger orchestrator for groups of `riseIn`/`cardItem` children. */
export const cascade: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/**
 * InsightCard shell. `show` runs the staggered data-entry cascade;
 * `hover` = energize (2% scale) and re-runs a faster cascade through any
 * child using `cardItem`. Colored-shadow deepening rides on CSS (box-shadow
 * is not transform-driven), scale lives here so reduced-motion strips it.
 */
export const cardShell: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION.slow,
      ease: EASE.energize,
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: DURATION.base,
      ease: EASE.energize,
      staggerChildren: 0.045,
    },
  },
};

/** Inner data elements of a card: staggered entry, subtle lift on hover. */
export const cardItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE.energize },
  },
  hover: {
    y: -2,
    transition: { duration: DURATION.quick, ease: EASE.energize },
  },
};

/** SVG stroke draw-in (sparklines, decorative paths). */
export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, ease: EASE.draw },
      opacity: { duration: 0.01 },
    },
  },
};

/** Fade-only stand-in for `drawPath` when motion is reduced. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base } },
};

/* ----------------------------------------------------------------------------
 * Hooks
 * ------------------------------------------------------------------------- */

/** True when it is OK to move things (user has not requested reduced motion). */
export function useMotionSafe(): boolean {
  return !useReducedMotion();
}

/**
 * Scroll parallax: maps the target's journey through the viewport onto a
 * ±distance translateY. Deeper `distance` = faster layer — featured cards
 * pass a larger value than background cards. Returns a frozen MotionValue
 * under reduced motion. Transform-only; never animates layout.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  distance = 28,
): MotionValue<number> {
  const safe = useMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallax = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const still = useMotionValue(0);
  return safe ? parallax : still;
}

/**
 * Pointer tilt: the card leans a few degrees away from the cursor
 * (spring-smoothed, GPU-only — rotateX/rotateY). Auto-disabled on coarse
 * pointers/touch and under reduced motion; the returned handlers become
 * inert so callers can spread them unconditionally.
 */
export function useTilt(maxDegrees = 3.5) {
  const safe = useMotionSafe();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const enabled = safe && finePointer;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const spring = { stiffness: 180, damping: 22, mass: 0.4 };
  const rotateX = useSpring(rawX, spring);
  const rotateY = useSpring(rawY, spring);
  // Rect captured on enter so pointermove never forces a layout read.
  const rectRef = useRef<DOMRect | null>(null);

  const onPointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      rectRef.current = event.currentTarget.getBoundingClientRect();
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || !rectRef.current) return;
      const rect = rectRef.current;
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rawY.set(px * 2 * maxDegrees);
      rawX.set(-py * 2 * maxDegrees);
    },
    [enabled, maxDegrees, rawX, rawY],
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    rectRef.current = null;
  }, [rawX, rawY]);

  return {
    rotateX,
    rotateY,
    enabled,
    handlers: { onPointerEnter, onPointerMove, onPointerLeave },
  };
}

/* ----------------------------------------------------------------------------
 * Provider
 * ------------------------------------------------------------------------- */

/**
 * Mount once in the root layout. LazyMotion (strict) keeps the bundle to the
 * `domAnimation` feature slice — use the `m.` components everywhere, never
 * `motion.`. MotionConfig injects the signature transition as the default
 * and enforces the OS reduced-motion preference on all variants.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: DURATION.base, ease: EASE.energize }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
