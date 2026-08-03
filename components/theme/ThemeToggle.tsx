"use client";

import { cx } from "@/lib/cx";

import { useTheme } from "./ThemeProvider";

/**
 * Theme switch. Both icons are always in the DOM and CSS (the `dark:`
 * variant, driven by [data-theme]) decides which one shows — so the button
 * is correct at first paint with zero hydration mismatch and no
 * mounted-state flicker. Shows the theme you will GET (sun while dark).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className={cx(
        "inline-flex size-9 items-center justify-center rounded-control border border-ui-borders bg-surface-muted text-text transition-energize hover:scale-[1.06] hover:border-interactive hover:text-interactive",
        className,
      )}
    >
      {/* Sun — offered while in dark theme */}
      <svg
        viewBox="0 0 24 24"
        className="hidden size-4.5 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
      </svg>
      {/* Moon — offered while in light theme */}
      <svg
        viewBox="0 0 24 24"
        className="block size-4.5 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.2 14.5A8.3 8.3 0 0 1 9.5 3.8a8.3 8.3 0 1 0 10.7 10.7Z" />
      </svg>
    </button>
  );
}
