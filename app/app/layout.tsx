import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finacly AI - Production App',
  description: 'Automated financial reconciliation for SMBs',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-navy-900">
          <nav className="bg-navy-800 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold text-white">
                      Finacly AI
                    </h1>
                  </div>
                  <div className="hidden md:ml-6 md:flex md:space-x-8">
                    <a
                      href="/app/dashboard"
                      className="text-white hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/app/connections"
                      className="text-white hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Connections
                    </a>
                    <a
                      href="/app/exceptions"
                      className="text-white hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Exceptions
                    </a>
                    <a
                      href="/app/settings"
                      className="text-white hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Settings
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-300">
                    Production App
                  </span>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
