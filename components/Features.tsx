'use client'

import { 
  Zap, 
  Shield, 
  DollarSign, 
  BarChart3, 
  Globe, 
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Exceptions Inbox',
    description: 'Actionable cards with confidence scores and proposed postings',
    color: 'text-royal-500',
    bgColor: 'bg-royal-100'
  },
  {
    icon: CheckCircle,
    title: 'One-Click to QuickBooks',
    description: 'Idempotent creates with external refs; preview before commit',
    color: 'text-mint-500',
    bgColor: 'bg-mint-100'
  },
  {
    icon: Shield,
    title: 'Audit Trail',
    description: 'Hash-chained events; CSV/JSONL export for compliance',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100'
  },
  {
    icon: DollarSign,
    title: 'Multi-Currency Aware',
    description: 'Stores original and home amounts; flags FX for review',
    color: 'text-royal-500',
    bgColor: 'bg-royal-100'
  },
  {
    icon: BarChart3,
    title: 'Accountant Workspace',
    description: 'Switch companies, shared mappings, batch actions',
    color: 'text-mint-500',
    bgColor: 'bg-mint-100'
  },
  {
    icon: Globe,
    title: 'Observability',
    description: 'Sync status, retry queues, provider health banners',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100'
  }
]

export default function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-emerald-950/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Feature Deep-Dive
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built specifically for accountants and controllers who need enterprise-grade 
            reconciliation without the complexity or cost.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={feature.title} className="glass-card p-8 hover:scale-105 transition-all duration-300">
              <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-heading font-semibold mb-4 text-white">
                {feature.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Strip */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-bold mb-6 text-white">
              Ready to Transform Your Reconciliation?
            </h3>
            <p className="text-gray-300 mb-8">
              Join the early access program and be among the first to experience 
              payout-aware reconciliation.
            </p>
            <a 
              href="#early-access"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center group"
            >
              Get Early Access
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}