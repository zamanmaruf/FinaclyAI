import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finacly AI - End the Reconciliation Nightmare',
  description: 'AI-powered financial reconciliation for SMBs. Automatically match transactions across Stripe, QuickBooks, and bank feeds. Built for 2026 Open Banking.',
  keywords: 'financial reconciliation, AI automation, Stripe QuickBooks, SMB finance, open banking, fintech',
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
    title: 'Finacly AI - End the Reconciliation Nightmare',
    description: 'AI-powered financial reconciliation for SMBs. Automatically match transactions across Stripe, QuickBooks, and bank feeds.',
    url: 'https://finacly.ai',
    siteName: 'Finacly AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Finacly AI - AI-powered financial reconciliation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finacly AI - End the Reconciliation Nightmare',
    description: 'AI-powered financial reconciliation for SMBs. Automatically match transactions across Stripe, QuickBooks, and bank feeds.',
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
