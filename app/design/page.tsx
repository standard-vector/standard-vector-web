import type { Metadata } from "next";

import { MomentumField } from "@/components/showcase/MomentumField";
import { MotionGallery } from "@/components/showcase/MotionGallery";
import { ShowcaseHero } from "@/components/showcase/ShowcaseHero";
import { TokenGallery } from "@/components/showcase/TokenGallery";
import { ZigzagDivider } from "@/components/ui/ZigzagDivider";

export const metadata: Metadata = {
  title: "Design system — Dynamic Momentum",
  description:
    "Living documentation for the Dynamic Momentum design system: tokens, themes, motion signature, and brand components.",
};

/**
 * /design — the living documentation route. Every section is rendered by
 * the system it documents: tokens paint the swatches, the motion layer
 * animates the galleries, and InsightCard proves parallax, tilt, energize
 * hover, colored shadows, and staggered data entry in one place.
 */
export default function DesignPage() {
  return (
    <>
      <ShowcaseHero />
      <ZigzagDivider className="-mt-10" />
      <MomentumField />
      <ZigzagDivider flip className="my-4" />
      <TokenGallery />
      <MotionGallery />
    </>
  );
}
