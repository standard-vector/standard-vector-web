import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_FIRST_CHUNK } from "@/lib/auth/session";

/**
 * Edge guard for protected routes: no session cookie → straight to the
 * sign-in screen. Deliberately a cheap PRESENCE check only — the dashboard
 * decrypts and validates the session server-side (and the API re-validates
 * the JWT anyway); this just short-circuits obviously anonymous visits.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.get(SESSION_COOKIE_FIRST_CHUNK)?.value) {
    const signin = new URL("/signin", request.url);
    signin.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(signin);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
