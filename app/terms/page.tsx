import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Finacly AI',
  description: 'Terms of Service for Finacly AI - Our terms and conditions for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-white mb-8">
          Terms of Service
        </h1>
        
        <div className="glass-card p-8 space-y-6 text-gray-300">
          <p className="text-sm text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Finacly AI, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily use Finacly AI for personal, non-commercial 
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              3. Disclaimer
            </h2>
            <p>
              The materials on Finacly AI are provided on an 'as is' basis. Finacly AI makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              4. Limitations
            </h2>
            <p>
              In no event shall Finacly AI or its suppliers be liable for any damages arising out 
              of the use or inability to use the materials on Finacly AI.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              5. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@finacly.ai" className="text-primary-400 hover:underline">
                legal@finacly.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
