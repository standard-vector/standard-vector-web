/**
 * Minimal OIDC client for the Authorization Code + PKCE flow against
 * Keycloak THROUGH Kong.
 *
 * Why Authorization Code + PKCE (and not credential forms in this app):
 * posting passwords to a first-party form would require Keycloak's
 * direct-access grant (ROPC) — deprecated by OAuth 2.1 and disabled on our
 * client. The spec prefers PKCE; the Sign-in/Sign-up screens launch a
 * redirect to Keycloak's hosted pages and the platform never handles raw
 * credentials. The client is CONFIDENTIAL (this server holds the secret)
 * *plus* PKCE — belt and braces.
 *
 * Channel split: the browser talks to the PUBLIC issuer (localhost:8000 via
 * Kong); this server exchanges codes/fetches JWKS on the INTERNAL channel
 * (kong-proxy in-cluster). Keycloak's fixed hostname keeps `iss` identical
 * on both, so issuer validation pins the public value everywhere.
 */

import { createHash, randomBytes } from "node:crypto";

import { createRemoteJWKSet, decodeJwt, jwtVerify, type JWTPayload } from "jose";

import { getAuthConfig } from "./config";

export const STATE_COOKIE = "sv_oidc_state";
export const VERIFIER_COOKIE = "sv_oidc_verifier";
export const NONCE_COOKIE = "sv_oidc_nonce";

/** Short-lived, httpOnly cookies that carry the flow's one-time secrets. */
export function flowCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: getAuthConfig().secureCookies,
    path: "/api/auth",
    maxAge: 600,
  };
}

const base64url = (buf: Buffer) => buf.toString("base64url");

export interface FlowStart {
  authorizationUrl: string;
  state: string;
  verifier: string;
  nonce: string;
}

/**
 * Builds the Keycloak redirect for sign-in or sign-up. Sign-up deep-links
 * Keycloak's `registrations` endpoint (long-standing Keycloak behavior that
 * renders the self-registration page and then completes the same code
 * flow); if a future Keycloak drops it, the login page's built-in
 * "Register" link (registrationAllowed) is the fallback.
 */
export function beginAuthFlow(screen: "login" | "register"): FlowStart {
  const { issuer, clientId, appUrl } = getAuthConfig();

  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const state = base64url(randomBytes(16));
  const nonce = base64url(randomBytes(16));

  const endpoint =
    screen === "register"
      ? `${issuer}/protocol/openid-connect/registrations`
      : `${issuer}/protocol/openid-connect/auth`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid profile email",
    redirect_uri: `${appUrl}/api/auth/callback`,
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return { authorizationUrl: `${endpoint}?${params}`, state, verifier, nonce };
}

export interface TokenSet {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number; // unix seconds
  claims: {
    sub: string;
    username: string;
    email: string;
    roles: string[];
  };
}

/**
 * Exchanges the authorization code (backchannel, through Kong), verifies
 * the ID token (signature via realm JWKS, issuer, audience, nonce), and
 * extracts display claims.
 */
export async function exchangeCode(code: string, verifier: string, expectedNonce: string): Promise<TokenSet> {
  const { internalIssuer, issuer, clientId, clientSecret, appUrl } = getAuthConfig();

  const response = await fetch(`${internalIssuer}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${appUrl}/api/auth/callback`,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: verifier,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`token exchange failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const body = (await response.json()) as {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  // Verify the ID token cryptographically before trusting any identity
  // claim. The JWKS comes over the internal channel; `iss` must equal the
  // PUBLIC issuer (Keycloak's fixed hostname guarantees it).
  const { payload: idClaims } = await jwtVerify(body.id_token, realmJwks(), {
    issuer,
    audience: clientId,
  });
  if (idClaims.nonce !== expectedNonce) {
    throw new Error("nonce mismatch in ID token");
  }

  // Roles ride on the ACCESS token (realm_access). Decoded for DISPLAY
  // only — the gateway and the Go API are the enforcers of that token.
  const accessClaims = decodeJwt(body.access_token) as JWTPayload & {
    realm_access?: { roles?: string[] };
    preferred_username?: string;
    email?: string;
  };

  return {
    accessToken: body.access_token,
    idToken: body.id_token,
    refreshToken: body.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + body.expires_in,
    claims: {
      sub: String(idClaims.sub),
      username:
        (idClaims.preferred_username as string | undefined) ??
        accessClaims.preferred_username ??
        "",
      email: (idClaims.email as string | undefined) ?? accessClaims.email ?? "",
      roles: accessClaims.realm_access?.roles ?? [],
    },
  };
}

/** RP-initiated logout URL (Keycloak ends the SSO session, then returns). */
export function endSessionUrl(idTokenHint: string): string {
  const { issuer, appUrl, clientId } = getAuthConfig();
  const params = new URLSearchParams({
    id_token_hint: idTokenHint,
    post_logout_redirect_uri: appUrl,
    client_id: clientId,
  });
  return `${issuer}/protocol/openid-connect/logout?${params}`;
}

// Remote JWKS is cached per process (jose handles refresh/cooldown).
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
function realmJwks() {
  if (!jwksCache) {
    const { internalIssuer } = getAuthConfig();
    jwksCache = createRemoteJWKSet(
      new URL(`${internalIssuer}/protocol/openid-connect/certs`),
    );
  }
  return jwksCache;
}
