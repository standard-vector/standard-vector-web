import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { EnergizeButton } from "@/components/ui/EnergizeButton";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Standard Vector account.",
};

/**
 * Branded entry point for self-registration: hands off to Keycloak's hosted
 * registration page (realm has registrationAllowed) via the same PKCE flow,
 * so a brand-new user lands back here already signed in.
 */
export default function SignUpPage() {
  return (
    <div className="momentum-panel flex min-h-[calc(100vh-8rem)] items-center">
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-md md:ml-[8%]">
          <BrandMark size={48} title="Standard Vector logo" />
          <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight text-text">
            Start your <span className="text-gradient-brand">ascent</span>.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Registration happens on the platform&apos;s identity provider —
            account data is handled by Keycloak through the gateway. You will
            come back signed in.
          </p>

          <div className="mt-8">
            <EnergizeButton href="/api/auth/login?screen=register" tone="orange" size="lg">
              Create your account
            </EnergizeButton>
          </div>

          <p className="mt-8 text-sm text-text-muted">
            Already registered?{" "}
            <Link
              href="/signin"
              className="font-medium text-interactive transition-energize hover:text-text"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
