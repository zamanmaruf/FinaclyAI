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
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: '$149',
    period: '/month',
    features: [
      'Up to 1,000 transactions/month',
      'Basic AI matching',
      'Stripe & QuickBooks integration',
      'Email support',
      'Basic reporting',
      'Standard security'
    ],
    cta: 'Start Free Trial',
    popular: false,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    name: 'Growth',
    description: 'For growing businesses with higher transaction volumes',
    price: '$399',
    period: '/month',
    features: [
      'Up to 10,000 transactions/month',
      'Advanced AI matching',
      'All integrations included',
      'Priority support',
      'Advanced analytics',
      'Multi-currency support',
      'API access',
      'Custom reporting'
    ],
    cta: 'Start Free Trial',
    popular: true,
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    name: 'Scale',
    description: 'For enterprise businesses with complex needs',
    price: '$999',
    period: '/month',
    features: [
      'Unlimited transactions',
      'Premium AI matching',
      'All integrations + custom',
      'Dedicated account manager',
      'Enterprise analytics',
      'Advanced security',
      'Custom integrations',
      'On-premise deployment',
      'SLA guarantee'
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
                  <p className="text-gray-300 mb-6">
                    {tier.description}
                  </p>
                  <div className="flex items-baseline justify-center mb-6">
                    <span className="text-5xl font-bold text-white">
                      {tier.price}
                    </span>
                    <span className="text-gray-400 ml-1">
                      {tier.period}
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
                    if (tier.name === 'Scale') {
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