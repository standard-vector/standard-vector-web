import { NextResponse } from "next/server";

import { getAuthConfig } from "@/lib/auth/config";
import { endSessionUrl } from "@/lib/auth/oidc";
import { allSessionCookieNames, readSession } from "@/lib/auth/session";

/**
 * GET /api/auth/logout — clears the local session cookies AND ends the
 * Keycloak SSO session (RP-initiated logout with id_token_hint), then
 * returns to the public home page.
 */
export async function GET() {
  const { appUrl } = getAuthConfig();
  const session = await readSession();

  const target = session ? endSessionUrl(session.idToken) : appUrl;
  const response = NextResponse.redirect(target, 303);
  for (const name of allSessionCookieNames()) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return response;
}
