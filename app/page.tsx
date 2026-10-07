import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { EnergizeButton } from "@/components/ui/EnergizeButton";

/**
 * Public landing (Milestone 1 scope: placeholder until the Home / Sign-in /
 * Sign-up screens are built on top of this design system).
 */
export default function Home() {
  return (
    <div className="momentum-panel flex min-h-[calc(100vh-8rem)] items-center">
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <BrandMark size={72} title="Standard Vector logo" />
        <h1 className="mt-8 max-w-2xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-text md:text-6xl">
          AI governance with{" "}
          <span className="text-gradient-brand">financial gravity</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
          Standard Vector correlates AI infrastructure and token costs with the
          value they generate — full visibility into the viability of your AI
          operations.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <EnergizeButton href="/signup" tone="blue" size="lg">
            Create an account
          </EnergizeButton>
          <EnergizeButton href="/signin" tone="orange" size="lg">
            Sign in
          </EnergizeButton>
        </div>
        <p className="mt-6 text-sm text-text-muted">
          Built on the{" "}
          <Link
            href="/design"
            className="font-medium text-interactive transition-energize hover:text-text"
          >
            Dynamic Momentum design system
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
