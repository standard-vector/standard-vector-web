import { NextResponse, type NextRequest } from "next/server";

import { getAuthConfig } from "@/lib/auth/config";
import {
  NONCE_COOKIE,
  STATE_COOKIE,
  VERIFIER_COOKIE,
  exchangeCode,
} from "@/lib/auth/oidc";
import {
  allSessionCookieNames,
  sealSession,
  sessionCookieChunks,
  sessionCookieOptions,
} from "@/lib/auth/session";

/**
 * GET /api/auth/callback — Keycloak redirects here with ?code&state.
 *
 * Validates state (CSRF), exchanges the code on the backchannel (PKCE
 * verifier + client secret), verifies the ID token, then seals the token
 * set into the encrypted httpOnly session cookie and lands on /dashboard.
 * Every failure path degrades to /signin?error=… with the flow cookies
 * cleared — no partial sessions.
 */
export async function GET(request: NextRequest) {
  const { appUrl } = getAuthConfig();
  const params = request.nextUrl.searchParams;

  const fail = (code: string) => {
    const response = NextResponse.redirect(
      `${appUrl}/signin?error=${encodeURIComponent(code)}`,
      303,
    );
    clearFlowCookies(response);
    return response;
  };

  // The IdP can bounce back with an explicit error (e.g. user cancelled).
  const idpError = params.get("error");
  if (idpError) return fail(idpError);

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) return fail("missing_code");

  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const verifier = request.cookies.get(VERIFIER_COOKIE)?.value;
  const nonce = request.cookies.get(NONCE_COOKIE)?.value;
  if (!expectedState || !verifier || !nonce) return fail("flow_expired");
  if (state !== expectedState) return fail("state_mismatch");

  try {
    const tokens = await exchangeCode(code, verifier, nonce);

    const sealed = await sealSession({
      sub: tokens.claims.sub,
      username: tokens.claims.username,
      email: tokens.claims.email,
      roles: tokens.claims.roles,
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
      accessTokenExpiresAt: tokens.expiresAt,
    });

    const response = NextResponse.redirect(`${appUrl}/dashboard`, 303);
    clearFlowCookies(response);
    // Chunked set: clear every possible chunk first (a re-login may need
    // fewer chunks than the previous session), then write the new ones.
    const options = sessionCookieOptions();
    for (const name of allSessionCookieNames()) {
      response.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
    for (const chunk of sessionCookieChunks(sealed)) {
      response.cookies.set(chunk.name, chunk.value, options);
    }
    return response;
  } catch (error) {
    console.error("auth callback failed:", error);
    return fail("exchange_failed");
  }
}

function clearFlowCookies(response: NextResponse) {
  for (const name of [STATE_COOKIE, VERIFIER_COOKIE, NONCE_COOKIE]) {
    response.cookies.set(name, "", { path: "/api/auth", maxAge: 0 });
  }
}
