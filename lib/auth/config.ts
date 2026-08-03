/**
 * Auth configuration, read lazily at request time (never at module load, so
 * `next build` needs no runtime secrets).
 *
 * Defaults target LOCAL HOST-MODE development against a running platform
 * (`make up` in standard-vector-infra): the host reaches Kong on
 * localhost:8000. In-cluster, the ConfigMap/Secret override the internal
 * URLs to the gateway's ClusterIP service. Public URLs (issuer, app) are the
 * same in both modes — the issuer string is part of token validation.
 */

export interface AuthConfig {
  /** Public origin of this app — redirect URIs and cookies. */
  appUrl: string;
  /** Public issuer (browser-facing, and the `iss` every token must carry). */
  issuer: string;
  /** Issuer base on the server-to-server channel (token/JWKS calls). */
  internalIssuer: string;
  /** Gateway base for API calls from the server. */
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  /** 32-byte base64 AES-256-GCM key for the session cookie (JWE). */
  sessionSecret: string;
  /** Cookies must be Secure when the app is served over https. */
  secureCookies: boolean;
}

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

export function getAuthConfig(): AuthConfig {
  const appUrl = env("APP_URL", "http://localhost:3000");
  const issuer = env(
    "KEYCLOAK_ISSUER",
    "http://localhost:8000/auth/realms/standard-vector",
  );
  const internalBase = env("KEYCLOAK_INTERNAL_BASE_URL", "http://localhost:8000/auth");

  // The realm is the issuer's last path segment; the internal issuer is the
  // same realm reached over the backchannel (issuer STRINGS stay public).
  const realm = issuer.split("/realms/")[1];
  if (!realm) {
    throw new Error(
      `KEYCLOAK_ISSUER must look like <base>/realms/<realm>, got: ${issuer}`,
    );
  }

  return {
    appUrl,
    issuer,
    internalIssuer: `${internalBase.replace(/\/$/, "")}/realms/${realm}`,
    apiBaseUrl: env("API_INTERNAL_BASE_URL", "http://localhost:8000"),
    clientId: env("OIDC_CLIENT_ID", "standard-vector-web"),
    clientSecret: env("OIDC_CLIENT_SECRET", "sv-dev-web-client-secret-change-me"),
    sessionSecret: env(
      "SESSION_SECRET",
      // Dev placeholder — 32 bytes, matches infra's web-secrets manifest.
      "c3YtZGV2LXNlc3Npb24ta2V5LTMyLWJ5dGVzLW9rISE=",
    ),
    secureCookies: appUrl.startsWith("https://"),
  };
}
