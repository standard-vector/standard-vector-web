import { NextResponse, type NextRequest } from "next/server";

import {
  NONCE_COOKIE,
  STATE_COOKIE,
  VERIFIER_COOKIE,
  beginAuthFlow,
  flowCookieOptions,
} from "@/lib/auth/oidc";

/**
 * GET /api/auth/login            → redirect to Keycloak's login page
 * GET /api/auth/login?screen=register → redirect to the registration page
 *
 * Starts the Authorization Code + PKCE flow: the one-time state/verifier/
 * nonce are parked in short-lived httpOnly cookies scoped to /api/auth and
 * checked by the callback. If Keycloak still holds an SSO session, this
 * round-trips silently — which is also how an expired-access-token visit to
 * the dashboard re-authenticates without prompting.
 */
export function GET(request: NextRequest) {
  const screen =
    request.nextUrl.searchParams.get("screen") === "register"
      ? "register"
      : "login";

  const flow = beginAuthFlow(screen);

  const response = NextResponse.redirect(flow.authorizationUrl, 302);
  const options = flowCookieOptions();
  response.cookies.set(STATE_COOKIE, flow.state, options);
  response.cookies.set(VERIFIER_COOKIE, flow.verifier, options);
  response.cookies.set(NONCE_COOKIE, flow.nonce, options);
  return response;
}
