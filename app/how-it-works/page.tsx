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
    title: 'Connect Your Accounts',
    description: 'Securely link your Stripe, QuickBooks, and bank accounts in under 2 minutes. Enterprise-grade security with OAuth 2.0.',
    details: [
      'OAuth 2.0 secure authentication',
      'QuickBooks Online integration',
      'Stripe & payment processors',
      'Bank feeds via Plaid/Flinks',
      'Multi-account support'
    ],
    icon: Link,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
    timeEstimate: '2 minutes'
  },
  {
    number: '02',
    title: 'AI Auto-Matches Everything',
    description: 'Our AI engine analyzes and matches 95%+ of transactions automatically. Machine learning gets smarter with every match.',
    details: [
      'Machine learning algorithms',
      'Pattern recognition',
      'Amount and date matching',
      'Currency conversion handling',
      'Continuous improvement'
    ],
    icon: Brain,
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10',
    timeEstimate: 'Automatic'
  },
  {
    number: '03',
    title: 'Review & Fix Exceptions',
    description: 'Clean exceptions inbox shows unmatched transactions. One-click fixes for the remaining 5%. Complete audit trail included.',
    details: [
      'Intuitive exceptions dashboard',
      'One-click fix actions',
      'Bulk processing capabilities',
      'Smart suggestions',
      'Complete audit trail'
    ],
    icon: CheckCircle,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
    timeEstimate: '5 minutes'
  }
]

const benefits = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process thousands of transactions in minutes, not hours',
    metric: '95%+ auto-match rate'
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'SOC 2 compliant with end-to-end encryption',
    metric: 'Enterprise security'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Insights',
    description: 'Live dashboards and automated reporting',
    metric: 'Instant results'
  },
  {
    icon: Clock,
    title: 'Time Savings',
    description: 'Save 30+ hours per month on reconciliation',
    metric: '30+ hours saved'
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

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              How <span className="gradient-text">Finacly AI</span> Works
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Transform your reconciliation process from a monthly nightmare into an automated success 
              in just three simple steps.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step Number */}
                <div className="text-6xl font-bold text-white/10 absolute -top-4 -left-4">
                  {step.number}
                </div>
                
                <div className="glass-card p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`inline-flex p-4 rounded-xl ${step.bgColor}`}>
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </div>
                    <div className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                      {step.timeEstimate}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold mb-4 text-white">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {step.description}
                  </p>

                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-primary-400 mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                    <ArrowRight className="w-8 h-8 text-primary-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Why Businesses Choose <span className="gradient-text">Finacly AI</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built specifically for SMBs who need enterprise-grade financial automation 
              without the complexity or cost.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h4 className="text-xl font-heading font-semibold mb-3 text-white">
                  {benefit.title}
                </h4>
                <p className="text-gray-300 mb-4">
                  {benefit.description}
                </p>
                <div className="text-primary-400 font-semibold">
                  {benefit.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Supported <span className="gradient-text">Integrations</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect all your financial systems in one place. More integrations coming soon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <div key={integration.name} className="glass-card p-6 text-center">
                <h4 className="text-lg font-semibold text-white mb-2">
                  {integration.name}
                </h4>
                <p className="text-gray-400 text-sm">
                  {integration.type}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="glass-card p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-heading font-bold mb-4">
                Built for the Future of Finance
              </h3>
              <p className="text-gray-300 mb-6">
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

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-heading font-bold mb-6">
              Ready to Transform Your Reconciliation?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the early access program and be among the first to experience 
              AI-powered financial automation.
            </p>
            <button 
              onClick={() => {
                window.location.href = '/#signup-form'
              }}
              className="btn-primary text-lg px-8 py-4"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}