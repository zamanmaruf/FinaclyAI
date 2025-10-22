'use client'

import { 
  Check, 
  Star, 
  Zap, 
  Crown,
  ArrowRight,
  Clock,
  Shield,
  Users
} from 'lucide-react'

const pricingTiers = [
  {
    name: 'Professional',
    subtitle: 'SMB',
    description: 'Perfect for growing businesses and accounting firms',
    price: '$299',
    originalPrice: '$599',
    discount: '50%',
    period: '/month',
    features: [
      'Up to 3 Payment Processors',
      'Up to 2 Accounting Systems',
      'Up to 5 Bank Connections',
      'Up to 25k transactions/month',
      'Priority Email Support',
      'Advanced Audit Trail',
      'Multi-Currency Support',
      'Basic API Access',
      'Standard Security'
    ],
    cta: 'Get Early Access',
    popular: false,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    name: 'Enterprise',
    subtitle: 'Most Popular',
    description: 'For mid-market companies and accounting firms',
    price: '$799',
    originalPrice: '$1599',
    discount: '50%',
    period: '/month',
    features: [
      'Unlimited Payment Processors',
      'Unlimited Accounting Systems',
      'Unlimited Bank Connections',
      'Up to 100k transactions/month',
      '24/7 Phone & Chat Support',
      'Advanced AI Matching',
      'Custom Reconciliation Rules',
      'Full API Access',
      'SOC 2 Type II Compliance',
      'SSO Integration',
      'Dedicated Account Manager'
    ],
    cta: 'Get Early Access',
    popular: true,
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    name: 'Fortune 500',
    subtitle: 'Enterprise',
    description: 'For large enterprises and global accounting firms',
    price: '$2499',
    originalPrice: '$4999',
    discount: '50%',
    period: '/month',
    features: [
      'Unlimited Everything',
      'Unlimited transactions',
      'White-label Solutions',
      'Custom Integrations',
      'Dedicated Infrastructure',
      '99.9% SLA Guarantee',
      'Advanced Analytics & Reporting',
      'Custom Workflows',
      'Multi-tenant Architecture',
      'Dedicated Success Team',
      'On-premise Deployment Options',
      'Custom Security Requirements'
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  }
]

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Matching',
    description: 'Advanced machine learning with 95%+ accuracy'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with bank-grade encryption'
  },
  {
    icon: Clock,
    title: 'Real-Time Processing',
    description: 'Instant reconciliation as transactions flow in'
  },
  {
    icon: Users,
    title: 'Multi-User Support',
    description: 'Role-based access for your entire team'
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Choose the plan that fits your business. All plans include a 30-day free trial. 
              No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`glass-card p-8 relative ${tier.popular ? 'ring-2 ring-gold-400' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gold-400 text-navy-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-xl ${tier.bgColor} mb-4`}>
                    <Crown className={`w-8 h-8 ${tier.color}`} />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">{tier.subtitle}</p>
                  <p className="text-gray-300 mb-6">
                    {tier.description}
                  </p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-white">
                      {tier.price}
                    </span>
                    <span className="text-gray-400 ml-1">
                      {tier.period}
                    </span>
                  </div>
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-lg text-gray-400 line-through mr-2">{tier.originalPrice}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium">
                      {tier.discount} off
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    tier.popular 
                      ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 hover:from-gold-500 hover:to-gold-600' 
                      : 'btn-primary'
                  }`}
                  onClick={() => {
                    if (tier.name === 'Fortune 500') {
                      window.location.href = '/contact'
                    } else {
                      window.location.href = '/#signup-form'
                    }
                  }}
                >
                  {tier.cta}
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              What's <span className="gradient-text">Included</span> in Every Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              All plans include our core features with enterprise-grade security and support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-4">
                  <feature.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h4 className="text-xl font-heading font-semibold mb-3 text-white">
                  {feature.title}
                </h4>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                question: "Is there really a 30-day free trial?",
                answer: "Yes! All plans include a 30-day free trial with full access to all features. No credit card required to start."
              },
              {
                question: "Can I change plans later?",
                answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "What happens if I exceed my transaction limit?",
                answer: "We'll notify you when you're approaching your limit. You can upgrade your plan or purchase additional transaction blocks."
              },
              {
                question: "Do you offer custom enterprise plans?",
                answer: "Yes! Contact our sales team for custom pricing, dedicated support, and enterprise-specific features."
              },
              {
                question: "Is my data secure?",
                answer: "Yes. We're SOC 2 compliant with bank-grade encryption, secure API connections, and regular security audits."
              }
            ].map((faq, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-xl font-heading font-semibold text-white mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-heading font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start your 30-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  window.location.href = '/#signup-form'
                }}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => {
                  window.location.href = '/contact'
                }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}