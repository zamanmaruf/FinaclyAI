'use client'

import { CreditCard, Building2, Banknote } from 'lucide-react'

export default function IntegrationsSection() {
  const integrations = [
    {
      category: 'Payment Processors',
      icon: CreditCard,
      providers: [
        { name: 'Stripe', status: 'Available', description: 'Day-1 support' },
        { name: 'PayPal', status: 'Coming Soon', description: 'V1 release' },
        { name: 'Square', status: 'Coming Soon', description: 'V1 release' },
      ]
    },
    {
      category: 'Accounting Software',
      icon: Building2,
      providers: [
        { name: 'QuickBooks Online', status: 'Available', description: 'Full integration' },
        { name: 'Xero', status: 'Coming Soon', description: 'Read-only first' },
      ]
    },
    {
      category: 'Bank Connectors',
      icon: Banknote,
      providers: [
        { name: 'Plaid', status: 'Available', description: 'Real-time feeds' },
        { name: 'Flinks', status: 'Available', description: 'Canadian banks' },
      ]
    }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-sage-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Built for Your Stack
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Seamlessly connect your payment processors, accounting software, and bank feeds 
            for automated reconciliation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {integrations.map((category, index) => (
            <div key={index} className="glass-card p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-500/10 rounded-xl mr-4">
                  <category.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {category.category}
                </h3>
              </div>

              <div className="space-y-4">
                {category.providers.map((provider, providerIndex) => (
                  <div key={providerIndex} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{provider.name}</div>
                      <div className="text-sm text-gray-300">{provider.description}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      provider.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {provider.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 mb-4">
            All trademarks belong to their owners; Finacly is an independent product.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Available Now
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
