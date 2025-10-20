'use client'

import { 
  Link, 
  Brain, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Users,
  Target
} from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Connect Stripe, QuickBooks Online, and your bank',
    description: 'Link your payment processor, accounting software, and bank via Plaid/Flinks.',
    icon: Link,
    color: 'text-royal-500',
    bgColor: 'bg-royal-100'
  },
  {
    number: '02',
    title: 'Match payouts to deposits automatically',
    description: 'Exceptions are surfaced with evidence and confidence scores.',
    icon: Brain,
    color: 'text-mint-500',
    bgColor: 'bg-mint-100'
  },
  {
    number: '03',
    title: 'Fix with one click',
    description: 'Create Deposits, mark invoices paid, and export an audit file.',
    icon: CheckCircle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100'
  }
]

const integrations = [
  { name: 'Stripe', type: 'Payment Processor' },
  { name: 'PayPal', type: 'Payment Processor' },
  { name: 'Square', type: 'Payment Processor' },
  { name: 'QuickBooks Online', type: 'Accounting' },
  { name: 'Xero', type: 'Accounting' },
  { name: 'Bank Feeds (Plaid)', type: 'Banking' },
  { name: 'Bank Feeds (Flinks)', type: 'Banking' }
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-forest-950/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Three simple steps to transform your reconciliation process from a monthly nightmare 
            into an automated success.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Step Number */}
              <div className="text-6xl font-bold text-slate-100 absolute -top-4 -left-4">
                {step.number}
              </div>
              
              <div className="glass-card p-8 relative z-10">
                <div className={`inline-flex p-4 rounded-xl ${step.bgColor} mb-6`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                
                <h3 className="text-2xl font-heading font-bold mb-4 text-white">
                  {step.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-8 h-8 text-royal-500" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Integrations */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-heading font-bold mb-8">
            Supported <span className="gradient-text">Integrations</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration, index) => (
              <div key={integration.name} className="glass-card p-4 text-center">
                <h4 className="text-lg font-semibold text-white mb-1">
                  {integration.name}
                </h4>
                <p className="text-gray-400 text-sm">
                  {integration.type}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-bold mb-6">
              Built for the Future of Finance
            </h3>
            <p className="text-gray-300 mb-8">
              Finacly AI is designed for the 2026 Open Banking revolution, 
              giving you a competitive advantage today with direct bank API integration.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-400 mb-2">SOC 2</div>
                <div className="text-gray-300">Compliant Security</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gold-400 mb-2">95%+</div>
                <div className="text-gray-300">Auto-Match Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-400 mb-2">2026</div>
                <div className="text-gray-300">Open Banking Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}