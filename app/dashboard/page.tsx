import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EnergizeButton } from "@/components/ui/EnergizeButton";
import { getAuthConfig } from "@/lib/auth/config";
import { accessTokenIsFresh, readSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

interface SecureDataResponse {
  message: string;
  user: { id: string; username: string; email: string; roles: string[] };
  token: { issuer: string; audience: string[] | string; expires_at: string };
  gateway_context: Record<string, unknown>;
}

/**
 * The Milestone 1 proof page. Server-side it:
 *   1. decrypts the session cookie (tokens never reach the browser),
 *   2. calls GET /api/v1/secure-data THROUGH Kong with the Bearer token,
 *   3. renders the API's verified view of the user.
 * An expired access token bounces through /api/auth/login — Keycloak's SSO
 * session makes that a silent round trip.
 */
export default async function DashboardPage() {
  const session = await readSession();
  if (!session) redirect("/signin?from=/dashboard");
  if (!accessTokenIsFresh(session)) redirect("/api/auth/login");

  const { apiBaseUrl } = getAuthConfig();
  const response = await fetch(`${apiBaseUrl}/api/v1/secure-data`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    redirect("/api/auth/login");
  }
  if (!response.ok) {
    throw new Error(`secure-data call failed with ${response.status}`);
  }
  const data = (await response.json()) as SecureDataResponse;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold tracking-wide text-secondary-text">
            Milestone 1 — authenticated round trip
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text">
            Signed in as{" "}
            <span className="text-gradient-brand">{data.user.username}</span>
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            User ID:{" "}
            <span className="font-mono text-text" data-e2e="user-id">
              {data.user.id}
            </span>
          </p>
        </div>
        <EnergizeButton href="/api/auth/logout" tone="orange">
          Sign out
        </EnergizeButton>
      </header>

      <p className="mt-8 max-w-2xl rounded-control border border-ui-borders bg-surface-muted px-4 py-3 text-sm leading-relaxed text-text">
        {data.message}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
        <section className="rounded-card border border-ui-borders bg-surface-muted p-6 shadow-brand-blue md:col-span-5">
          <h2 className="font-display text-lg font-semibold text-text">
            Identity (verified by the API)
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Username" value={data.user.username} />
            <Row label="Email" value={data.user.email} />
            <Row label="Roles" value={data.user.roles.join(", ")} />
            <Row label="Issuer" value={data.token.issuer} />
            <Row
              label="Audience"
              value={
                Array.isArray(data.token.audience)
                  ? data.token.audience.join(", ")
                  : data.token.audience
              }
            />
            <Row label="Token expires" value={data.token.expires_at} />
          </dl>
        </section>

        <section className="rounded-card border border-ui-borders bg-surface-muted p-6 shadow-brand-orange md:col-span-7 md:mt-10">
          <h2 className="font-display text-lg font-semibold text-text">
            Raw <code className="font-mono text-base">/api/v1/secure-data</code>{" "}
            response
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Web (server) → Kong (JWT verified, X-User-* injected) → Go API
            (JWT re-verified) → back.
          </p>
          <pre
            data-e2e="secure-data"
            className="mt-4 overflow-x-auto rounded-control border border-ui-borders/60 bg-surface p-4 font-mono text-xs leading-relaxed text-text"
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
      <dt className="w-32 shrink-0 text-text-muted">{label}</dt>
      <dd className="min-w-0 break-all font-medium text-text">{value || "—"}</dd>
    </div>
  );
}
