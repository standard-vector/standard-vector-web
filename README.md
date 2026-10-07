# standard-vector-web

Web client for **Standard Vector** — a corporate AI Governance & FinOps
platform. Ships the **Dynamic Momentum design system** (living documentation
at `/design`) and the **Milestone 1 screens**: Home, Sign-in, Sign-up and the
authenticated Dashboard, wired to Keycloak through Kong.

- **Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4
  · Motion 12 (the current distribution of Framer Motion — the only animation
  dependency)
- **Living documentation:** [`/design`](http://localhost:3000/design) — every
  token, component, and motion rule below is rendered by the system itself.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000  (showcase at /design)

npm run lint       # ESLint (core-web-vitals + TS rules)
npm run build      # production build (type-checks; all routes prerender)
npm run start      # serve the production build
```

## Repository map

```
app/
  globals.css                 ← THE token layer (single home of raw hex)
  layout.tsx                  ← fonts, pre-paint theme script, providers
  page.tsx                    ← public landing (Milestone 1 placeholder)
  icon.svg                    ← brand favicon (static asset, hex allowed)
  design/
    page.tsx                  ← /design showcase (living documentation)
    loading.tsx               ← route loading state → <BrandLoader />
components/
  theme/                      ← ThemeProvider, ThemeToggle, theme-script
  brand/                      ← BrandMark (static logo), BrandLoader (drawn)
  ui/                         ← EnergizeButton, InsightCard, Sparkline, ZigzagDivider
  site/                       ← SiteHeader, SiteFooter
  showcase/                   ← /design sections (hero, tokens, cards, motion)
lib/
  motion.tsx                  ← durations, easings, variants, hooks, provider
  cx.ts                       ← className joiner (zero-dependency)
```

---

## Design tokens

### Architecture (three tiers)

Raw hex values exist **only** in `app/globals.css`:

1. **Brand primitives** (`@theme static`) — logo-derived constants:
   `--color-blue-primary #1E40AF`, `--color-orange-secondary #F97316`, the
   shade/tint depth steps, and status auxiliaries. Tailwind emits each as a
   CSS custom property on `:root` **and** generates utilities
   (`bg-blue-primary`, …) — the v4-native equivalent of mapping
   `theme.extend.colors` to `var(...)`, so tokens and utilities cannot drift.
   Primitives are allowed **only** in brand art (logo strokes, gradients).
2. **Semantic layer** (`--sv-*` on `:root` / `:root[data-theme="light"]`) —
   the values that flip with the theme. The extra prefix exists because a
   Tailwind v4 theme key *is* a CSS variable: `--color-surface` cannot
   reference itself.
3. **Public mapping** (`@theme inline`) — re-exports each semantic variable
   under its public `--color-*` name and generates the semantic utilities.
   Compiled result: `.bg-surface { background-color: var(--sv-surface) }` —
   one hop, theme-correct everywhere, shadow-DOM-safe.

The Tailwind default palette and gray shadows are **removed**
(`--color-*: initial; --shadow-*: initial`): `bg-red-500` or `shadow-md`
simply do not exist, which enforces "semantic tokens only" at build level.

### Semantic tokens (both themes)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--color-surface` | `#000000` | `#FFFFFF` | Page background (`bg-surface`) |
| `--color-surface-muted` | `#1A1A1A` | `#F0F0F0` | Cards & secondary sections |
| `--color-ui-borders` | `#333333` | `#CCCCCC` | Hairlines & dividers |
| `--color-text` | `#E0E0E0` | `#2D2D2D` | Primary text (`text-text`) |
| `--color-text-muted` | `#999999` | `#666666` | Secondary text |
| `--color-primary` | `#1E40AF` | `#1E40AF` | Primary action fills (+ `--color-primary-fg` white ink) |
| `--color-secondary` | `#F97316` | `#F97316` | Highlight fills (+ `--color-secondary-fg` dark warm ink) |
| `--color-accent-blue` / `--color-accent-orange` | `#1E40AF` / `#F97316` | same | Non-interactive brand elements |

**AA-derived tokens** (documented deviations — the shared brand values above
cannot serve as *text* on every surface, so these flip):

| Token | Dark | Light | Why |
|---|---|---|---|
| `--color-interactive` | `#3B82F6` | `#1E40AF` | `#1E40AF` is 2.41:1 on black — links/interactive text need the tint on dark |
| `--color-focus-ring` | `#3B82F6` | `#1E40AF` | Focus outline ≥3:1 on both surfaces, derived from the primary family |
| `--color-secondary-text` | `#FB923C` | `#C2410C` | Orange as text: tint on dark, shade on light |
| `--color-success-text` | `#16A34A` | `#166534` | Spec `#16A34A` is 4.02:1 on the light muted card — darkened to pass |
| `--color-warning-text` | `#CA8A04` | `#854D0E` | Same derivation |
| `--color-error-text` | `#EF4444` | `#B91C1C` | Spec `#DC2626` is 4.24:1 on the light muted card |

### WCAG AA verification (computed, not eyeballed)

All ratios measured against the *strictest* background each token sits on
(`surface-muted` for card content):

| Pair | Dark | Light |
|---|---|---|
| text / surface | 15.91 | 13.77 |
| text / surface-muted | 13.18 | 12.08 |
| text-muted / surface-muted | 6.11 | 5.04 |
| interactive / surface-muted | 4.73 | 7.65 |
| secondary-text / surface-muted | 7.69 | 4.54 |
| success-text / surface-muted | 5.28 | 6.26 |
| error-text / surface-muted | 4.62 | 5.68 |
| primary-fg / primary (buttons) | 8.72 | 8.72 |
| secondary-fg / secondary (buttons) | 6.31 | 6.31 |

Two contrast constraints are **load-bearing in component design**:

- **Blue buttons** keep white ink, so their gradient spans shade→primary and
  only *leans* toward the tint (78/22 `color-mix`) — white on pure
  `#3B82F6` is 3.68:1 and fails AA.
- **Orange buttons** wear dark warm ink (`--color-secondary-fg #2A1205`) —
  white on `#F97316` is 2.80:1.

### Colored elevation

No gray shadows exist. Blue elements cast `#152E7A`-tinted shadows and orange
elements `#C2410C`-tinted ones (`shadow-brand-blue`, `shadow-brand-orange`),
with `-hover` variants that **deepen and soften** (larger blur, adjusted
alpha). On the near-black dark surface, pigment shadows are invisible, so
dark elevation = black depth + a tint-family glow — same brand identity,
perceptually equivalent.

### Theming behavior

- The theme is `data-theme` on `<html>`, stamped **pre-paint** by an inline
  script (first child of `<body>`): stored choice → OS preference → dark.
  No FOUC by construction; `localStorage` holds only the preference flag.
- `ThemeProvider` treats the DOM attribute as the store
  (`useSyncExternalStore` + `MutationObserver`); switches crossfade via the
  View Transitions API on the signature easing (instant under
  reduced-motion or where unsupported). OS changes are followed live until
  the user chooses explicitly; choices sync across tabs.
- The `dark:` variant is remapped to `[data-theme="dark"]` — components
  rarely need it, because semantic tokens flip by themselves.
- No-JS fallback is the brand-default dark theme (this app requires JS).

---

## Motion — the "Dynamic Momentum" signature

Centralized in `lib/motion.tsx` (JS) and mirrored as CSS tokens
(`--ease-energize`, `--ease-draw`, `--sv-duration-*`). **Keep the two in
sync** — they cannot import each other.

| Signature | Value | Rule |
|---|---|---|
| `--ease-energize` | `cubic-bezier(0.33, 1, 0.24, 1)` | *Every* interaction: hovers, entrances, underlines, theme crossfade |
| `--ease-draw` | `cubic-bezier(0.6, 0.04, 0.85, 0.3)` | Stroke drawing — accelerates toward the arrow tip |
| durations | 160 / 280 / 500 / 1500 ms | quick feedback / state change / energize / draw |

**Rules future contributors must follow**

1. **Never define one-off timings.** Compose `DURATION`, `EASE`, the shared
   variants (`riseIn`, `cascade`, `cardShell`, `cardItem`, `drawPath`), or
   the CSS utilities (`transition-energize`, `energize-surface`,
   `underline-draw`).
2. **States energize; they never swap.** Hover = gradient slide + shadow
   deepen + ≤2% scale on the shared easing.
3. **Scroll animates `transform`/`opacity` only.** Parallax and tilt are
   `useParallax`/`useTilt` — GPU transforms, no layout reads per frame
   (tilt caches its rect on pointer-enter).
4. **Reduced motion is non-negotiable, in two layers:** `MotionConfig
   reducedMotion="user"` strips transform animation from variants; hooks
   gate themselves via `useMotionSafe`; a global media query collapses CSS
   transitions. New continuous effects must consult `useMotionSafe`.
5. **CSS transitions and Motion must not share `transform`** on one element
   — Motion-driven elements transition `box-shadow`/`border-color` via CSS
   and leave transform to Motion (see `InsightCard`).
6. **Use `m.` components only** (LazyMotion `strict` + `domAnimation` keeps
   the bundle slice small); everything lives inside `<MotionProvider>`.
7. **Layouts stay asymmetric.** The 12-column grid is scaffolding: irregular
   spans, stair-step offsets, deliberate overlaps, per-card parallax depth
   (featured cards move faster). No uniform card grids.

## Adding a themed component (checklist)

1. Colors: semantic utilities/tokens only (`bg-surface-muted`,
   `text-text-muted`, `shadow-brand-*`). If you type a hex value outside
   `globals.css`, it is a bug — and off-palette utilities do not compile.
2. New color needed? Add the `--sv-*` pair (dark + light) in `globals.css`,
   map it in `@theme inline`, and verify ≥4.5:1 (text) / ≥3:1 (UI) against
   `surface` **and** `surface-muted` in both themes before use.
3. Motion via the shared layer (rules above); entrances use
   `whileInView` + `VIEWPORT` so content rises in once.
4. Interactive states: visible keyboard focus comes from the global
   `:focus-visible` outline — do not suppress it; hovers ride
   `transition-energize`.
5. Data display follows the stat-tile contract (`InsightCard`): values wear
   the body sans in text ink (never series color, never the display face),
   deltas pair color with an icon + named period, sparklines stay recessive
   with an accented current period.
   *Note:* the blue/orange tone pair is validated for single-series accents
   (contrast + CVD separation). It is **not** a categorical multi-series
   palette — if a future chart needs ≥2 series in one plot, derive a proper
   categorical set first.

## Accessibility & performance guardrails

- WCAG AA verified in both themes (tables above); focus ring ≥3:1.
- `prefers-reduced-motion` reduces parallax/tilt/drawing to fades or nothing.
- Scroll/hover animation is transform/opacity (+ paint-only
  `background-position`/`box-shadow` on CSS-only controls); nothing animates
  layout, and overlaps come from static margins — zero CLS by construction.
- Loaders own their box (`size × size`), so swapping content causes no shift.
- Semantic HTML: skip-link, landmarks, `role="status"` loaders, sr-only
  delta directions, decorative SVG hidden from AT.

## Authentication (Milestone 1)

```
app/signin, app/signup        ← branded entry points (no credential forms here)
app/api/auth/login            ← starts Authorization Code + PKCE (S256)
app/api/auth/callback         ← state check → code exchange → ID-token verify → session
app/api/auth/logout           ← clears session + RP-initiated Keycloak logout
app/dashboard                 ← protected SSR page: calls secure-data via Kong
lib/auth/{config,oidc,session}.ts
proxy.ts                      ← cookie-presence guard for /dashboard
```

**Flow & decisions (each justified in the source):**

- **Authorization Code + PKCE via Keycloak's hosted pages.** Embedding
  credential forms in this app would require the deprecated direct-access
  grant (ROPC) — flagged and avoided; the spec itself prefers PKCE. The
  client is **confidential** (this server holds the secret) *plus* PKCE.
  Sign-up deep-links Keycloak's `registrations` endpoint, so a new user
  returns already signed in.
- **Sessions: encrypted httpOnly cookie** (`jose` JWE, `dir`+A256GCM,
  32-byte key) holding the token set server-side — the browser never sees a
  token and **nothing auth-related touches localStorage** (the only client
  storage in the app is the `sv-theme` UI flag). SameSite=Lax; Secure
  automatically on https. Because two JWTs inside a JWE exceed the ~4 KB
  per-cookie browser limit, the sealed session is **chunked across
  `sv_session.0..n`** (the Auth.js strategy) and reassembled on read. No
  refresh token is stored — an expired access token re-auths silently via
  Keycloak's SSO session. Hand-rolled on `jose` rather than NextAuth: ~200
  explicit lines, no beta-channel framework dependency, and `jose` is needed
  for ID-token verification anyway.
- **Two channels, one issuer.** Browser redirects use the public issuer
  (`http://localhost:8000/auth/realms/…` through Kong); token exchange +
  JWKS use the in-cluster gateway URL. Keycloak's fixed hostname keeps `iss`
  identical on both, and the callback verifies the ID token (signature,
  issuer, audience, nonce) before any claim is trusted.
- **Expired access tokens** (5 min lifetime) bounce the dashboard through
  `/api/auth/login`; Keycloak's SSO session (30 min idle) makes that a
  silent round trip — no credentials re-asked, no refresh-token plumbing in
  the milestone.

**Environment:** see [.env.example](.env.example) — local defaults are baked
in, so `npm run dev` works against a running platform with no `.env` file.

**Docker:** multi-stage `node:22-alpine`, Next `standalone` output, non-root
`nextjs` (uid 1001): `docker build -t standard-vector/web:dev .` —
orchestrated by [`standard-vector-infra`](../standard-vector-infra)
(`make up`, Web on `http://localhost:3000`).

**Known advisory note:** `npm audit` currently reports findings only in
build-time tooling bundled by `next@16.2.12` itself (sharp/postcss/
brace-expansion); the runtime auth path (`jose`) is clean, and the forced
"fix" would downgrade Next to 9.x — tracked for the next Next.js patch
instead.
