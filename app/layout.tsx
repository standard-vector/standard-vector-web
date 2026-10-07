import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import "./globals.css";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { themeInitScript } from "@/components/theme/theme-script";
import { MotionProvider } from "@/lib/motion";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Standard Vector",
    template: "%s · Standard Vector",
  },
  description:
    "Corporate AI Governance & FinOps platform — measure the ROI of AI initiatives by correlating cost with generated value.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: data-theme is stamped pre-paint by the
    // inline script below, so the server-rendered <html> never matches it.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-surface font-sans text-text antialiased">
        {/* First child of <body>: executes before any content paints —
            this is the FOUC guarantee for theming. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <MotionProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:border focus:border-ui-borders focus:bg-surface-muted focus:px-4 focus:py-2 focus:text-sm focus:text-text"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
