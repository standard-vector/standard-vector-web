/**
 * Pre-paint theme bootstrap.
 *
 * Injected as a blocking inline <script> as the FIRST child of <body>
 * (app/layout.tsx), so it runs before any content is painted — this is what
 * makes the theme FOUC-free without moving the preference into a cookie.
 *
 * Resolution order: stored choice ("sv-theme" in localStorage — a UI
 * preference flag only, never an auth token) → OS `prefers-color-scheme` →
 * brand default (dark). The resolved value is stamped on
 * `<html data-theme="…">`, which drives every `--sv-*` semantic token and
 * the `dark:` variant.
 */
export const THEME_STORAGE_KEY = "sv-theme";

export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()`;
