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
    title: 'AI-Powered Matching',
    description: 'Advanced machine learning algorithms with 95%+ accuracy',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with bank-grade encryption',
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    icon: DollarSign,
    title: 'Multi-Currency Support',
    description: 'Handle international transactions with real-time rates',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep insights and customizable reporting',
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    icon: Globe,
    title: 'Multi-Source Integration',
    description: 'Connect Stripe, QuickBooks, banks, and more',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    icon: CheckCircle,
    title: 'One-Click Exceptions',
    description: 'Clean exceptions inbox with smart suggestions',
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  }
]

export default function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Everything You Need to{' '}
            <span className="gradient-text">Automate Reconciliation</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built specifically for SMBs who need enterprise-grade financial automation 
            without the complexity or cost.
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

        {/* Trust Signals */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-bold mb-6">
              Trusted by Forward-Thinking Businesses
            </h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
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