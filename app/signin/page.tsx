import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { EnergizeButton } from "@/components/ui/EnergizeButton";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Standard Vector platform.",
};

const ERROR_MESSAGES: Record<string, string> = {
  state_mismatch: "The sign-in attempt could not be verified. Please try again.",
  flow_expired: "The sign-in attempt expired. Please try again.",
  missing_code: "The identity provider returned an incomplete response.",
  exchange_failed: "We could not complete the sign-in. Please try again.",
  access_denied: "The sign-in was cancelled.",
};

/**
 * Branded entry point for the Authorization Code + PKCE flow. Credentials
 * are NEVER typed into this app — the button hands off to Keycloak's hosted
 * login page through the gateway, and the callback returns with a session.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const params = await searchParams;
  const error = params.error
    ? (ERROR_MESSAGES[params.error] ?? "Something went wrong. Please try again.")
    : params.from
      ? "Please sign in to continue."
      : null;

  return (
    <div className="momentum-panel flex min-h-[calc(100vh-8rem)] items-center">
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-md md:ml-[8%]">
          <BrandMark size={48} title="Standard Vector logo" />
          <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight text-text">
            Welcome <span className="text-gradient-brand">back</span>.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Sign in continues on the platform&apos;s identity provider — your
            credentials go to Keycloak through the gateway, never to this
            application.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-control border border-error-text/40 bg-surface-muted px-4 py-3 text-sm text-error-text"
            >
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <EnergizeButton href="/api/auth/login" tone="blue" size="lg">
              Sign in with Standard Vector ID
            </EnergizeButton>
          </div>

          <p className="mt-8 text-sm text-text-muted">
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-interactive transition-energize hover:text-text"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
