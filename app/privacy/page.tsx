import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Finacly AI',
  description: 'Privacy Policy for Finacly AI - How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-white mb-8">
          Privacy Policy
        </h1>
        
        <div className="glass-card p-8 space-y-6 text-gray-300">
          <p className="text-sm text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include your name, email address, 
              company information, and financial data necessary for reconciliation services.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, communicate with you, and ensure the security of our platform.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              3. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              4. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@finacly.ai" className="text-primary-400 hover:underline">
                privacy@finacly.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
