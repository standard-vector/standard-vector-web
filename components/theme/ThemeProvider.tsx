"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { THEME_STORAGE_KEY } from "./theme-script";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  /** Resolved theme. `null` during SSR — `<html data-theme>` (stamped by the
   *  pre-paint script) is the source of truth, and React only mirrors it. */
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readDomTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** The data-theme attribute IS the store; subscribers re-render whenever
 *  anything (toggle, OS change, another tab) mutates it. */
function subscribeToThemeAttribute(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/**
 * Owns the theme lifecycle after the pre-paint script has done its job:
 * explicit choices persist to localStorage and crossfade via the View
 * Transitions API (skipped under prefers-reduced-motion and in browsers
 * without the API — those switch instantly). While the user has made no
 * explicit choice, live OS scheme changes are followed; explicit choices
 * sync across tabs through the `storage` event.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToThemeAttribute,
    readDomTheme,
    () => null,
  );

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode) — the choice still applies for
      // this page lifetime.
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Typed via cast so we do not depend on lib.dom shipping the View
    // Transitions API types.
    const doc = document as Document & {
      startViewTransition?: (update: () => void) => void;
    };
    if (!reduceMotion && typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => applyTheme(next));
    } else {
      applyTheme(next);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readDomTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");

    const onSystemChange = () => {
      try {
        if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      } catch {
        // Fall through: with no readable preference, follow the OS.
      }
      applyTheme(media.matches ? "light" : "dark");
    };

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === THEME_STORAGE_KEY &&
        (event.newValue === "light" || event.newValue === "dark")
      ) {
        applyTheme(event.newValue);
      }
    };

    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return context;
}
