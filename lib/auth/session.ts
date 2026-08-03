/**
 * Server-side session: tokens live in an ENCRYPTED httpOnly cookie (JWE,
 * dir + A256GCM via `jose`) — the browser never sees an access token and no
 * token ever touches localStorage. SameSite=Lax + httpOnly + (Secure on
 * https).
 *
 * Why hand-rolled on `jose` instead of NextAuth/Auth.js: the flow is ~200
 * explicit lines with zero magic, `jose` is already required for ID-token
 * verification, and it avoids taking a framework dependency that has been
 * churning between major versions — "stability over novelty".
 */

import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";

import { getAuthConfig } from "./config";

export const SESSION_COOKIE = "sv_session";

/** Session lifetime — aligned with the realm's SSO idle timeout (30 min). */
const SESSION_TTL_SECONDS = 30 * 60;

/**
 * A sealed session (two JWTs inside a JWE) exceeds the ~4096-byte browser
 * limit for a single cookie, so it is split across `sv_session.0..n`
 * chunks (the same strategy Auth.js uses) and reassembled on read.
 */
const CHUNK_SIZE = 3800;
const MAX_CHUNKS = 6;

export interface SessionData {
  sub: string;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
  /** Kept for the RP-initiated logout (`id_token_hint`). No refresh token
   *  is stored: expiry re-auths silently through Keycloak's SSO session. */
  idToken: string;
  /** Unix seconds — when the access token stops being usable. */
  accessTokenExpiresAt: number;
}

function sessionKey(): Uint8Array {
  const raw = Buffer.from(getAuthConfig().sessionSecret, "base64");
  if (raw.length !== 32) {
    throw new Error("SESSION_SECRET must be exactly 32 bytes of base64 (openssl rand -base64 32)");
  }
  return new Uint8Array(raw);
}

/** Serializes + encrypts session data into the cookie value. */
export async function sealSession(data: SessionData): Promise<string> {
  return new EncryptJWT({ data: data as unknown as Record<string, unknown> })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .encrypt(sessionKey());
}

export function sessionCookieOptions() {
  const { secureCookies } = getAuthConfig();
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: secureCookies,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/** First chunk's cookie name — presence signals "probably signed in". */
export const SESSION_COOKIE_FIRST_CHUNK = `${SESSION_COOKIE}.0`;

/** Splits a sealed session into cookie-sized named chunks. */
export function sessionCookieChunks(sealed: string): Array<{ name: string; value: string }> {
  const chunks: Array<{ name: string; value: string }> = [];
  for (let i = 0; i * CHUNK_SIZE < sealed.length; i += 1) {
    chunks.push({
      name: `${SESSION_COOKIE}.${i}`,
      value: sealed.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
    });
  }
  if (chunks.length > MAX_CHUNKS) {
    throw new Error(`session too large: ${sealed.length} bytes`);
  }
  return chunks;
}

/** Every chunk name that may exist — used to clear a session completely. */
export function allSessionCookieNames(): string[] {
  return Array.from({ length: MAX_CHUNKS }, (_, i) => `${SESSION_COOKIE}.${i}`);
}

/**
 * Reassembles and decrypts the chunked session cookie. Returns null for
 * absent, expired, or tampered sessions — callers redirect to sign-in.
 */
export async function readSession(): Promise<SessionData | null> {
  const store = await cookies();
  let sealed = "";
  for (let i = 0; i < MAX_CHUNKS; i += 1) {
    const chunk = store.get(`${SESSION_COOKIE}.${i}`);
    if (!chunk?.value) break;
    sealed += chunk.value;
  }
  if (!sealed) return null;

  try {
    const { payload } = await jwtDecrypt(sealed, sessionKey(), {
      clockTolerance: 30,
    });
    return payload.data as unknown as SessionData;
  } catch {
    // Wrong key, tampered, or expired — treat all identically.
    return null;
  }
}

/** True when the session's ACCESS token is still fresh enough to use. */
export function accessTokenIsFresh(session: SessionData): boolean {
  return session.accessTokenExpiresAt - 10 > Math.floor(Date.now() / 1000);
}
