import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";

export function SiteFooter() {
  return (
    <footer className="border-t border-ui-borders/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-text-muted sm:flex-row sm:items-center">
        <p className="flex items-center gap-2">
          <BrandMark size={18} idPrefix="sv-footer" />
          <span>
            Standard Vector — AI Governance &amp; FinOps ·{" "}
            <span className="text-text">Dynamic Momentum</span> design system
          </span>
        </p>
        <Link
          href="/design"
          className="rounded-control font-medium text-interactive transition-energize hover:text-text"
        >
          Living documentation →
        </Link>
      </div>
    </footer>
  );
}
