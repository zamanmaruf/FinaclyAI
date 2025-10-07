import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppThemeProvider from "./theme-provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finacly AI — Automated Reconciliation for Stripe, Banks & QuickBooks",
  description: "Finacly AI auto-matches payouts, charges, and accounting entries so month-end takes minutes, not days. Bank-level security • SOC 2 in progress • Built for accountants.",
  keywords: ["reconciliation", "stripe", "quickbooks", "banking", "accounting", "automation", "AI"],
  authors: [{ name: "Finacly AI" }],
  creator: "Finacly AI",
  publisher: "Finacly AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://finaclyai.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Finacly AI — Automated Reconciliation for Stripe, Banks & QuickBooks",
    description: "Finacly AI auto-matches payouts, charges, and accounting entries so month-end takes minutes, not days.",
    url: "/",
    siteName: "Finacly AI",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Finacly AI - Automated Reconciliation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finacly AI — Automated Reconciliation for Stripe, Banks & QuickBooks",
    description: "Finacly AI auto-matches payouts, charges, and accounting entries so month-end takes minutes, not days.",
    images: ["/og.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#2e7d32" />
      </head>
      <body className={`min-h-screen ${inter.className}`}>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}