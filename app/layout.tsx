import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finacly — Payout-Aware Reconciliation for QuickBooks (Launching Dec 1, 2025)',
  description: 'Automate payout-to-bank-to-ledger reconciliation with one-click fixes and an audit trail. Early Access open until Nov 30. Founding discount 30-50% off.',
  keywords: 'payout reconciliation, QuickBooks automation, Stripe reconciliation, financial reconciliation, SMB finance, accounting automation, fintech',
  authors: [{ name: 'Finacly AI' }],
  creator: 'Finacly AI',
  publisher: 'Finacly AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://finacly.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Finacly — Payout-Aware Reconciliation for QuickBooks (Launching Dec 1, 2025)',
    description: 'Automate payout-to-bank-to-ledger reconciliation with one-click fixes and an audit trail. Early Access open until Nov 30.',
    url: 'https://finacly.ai',
    siteName: 'Finacly',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Finacly - Payout-aware reconciliation for QuickBooks',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finacly — Payout-Aware Reconciliation for QuickBooks (Launching Dec 1, 2025)',
    description: 'Automate payout-to-bank-to-ledger reconciliation with one-click fixes and an audit trail. Early Access open until Nov 30.',
    images: ['/og-image.jpg'],
    creator: '@finaclyai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
