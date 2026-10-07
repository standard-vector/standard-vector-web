import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Global chrome: brand lockup, primary nav, theme switch. Server component —
 * only the toggle hydrates.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ui-borders/60 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-control"
        >
          <BrandMark size={26} idPrefix="sv-header" />
          <span className="font-display text-[15px] font-semibold tracking-tight text-text">
            Standard&nbsp;Vector
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <nav aria-label="Primary" className="flex items-center gap-5">
            <Link
              href="/design"
              className="group inline-block rounded-control text-sm font-medium text-text-muted transition-energize hover:text-text"
            >
              <span className="underline-draw">Design system</span>
            </Link>
            <Link
              href="/dashboard"
              className="group hidden rounded-control text-sm font-medium text-text-muted transition-energize hover:text-text sm:inline-block"
            >
              <span className="underline-draw">Dashboard</span>
            </Link>
            <Link
              href="/signin"
              className="group inline-block rounded-control text-sm font-medium text-interactive transition-energize hover:text-text"
            >
              <span className="underline-draw">Sign in</span>
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
