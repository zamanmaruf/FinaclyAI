'use client'

import { Check, Star } from 'lucide-react'
// import { analytics } from '@/lib/analytics'
import { useState } from 'react'
import EarlyAccessModal from './EarlyAccessModal'

export default function PricingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const plans = [
    {
      name: 'Professional',
      subtitle: 'SMB',
      price: 299,
      originalPrice: 599,
      discount: '50%',
      description: 'Perfect for growing businesses and accounting firms',
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
      popular: false
    },
    {
      name: 'Enterprise',
      subtitle: 'Most Popular',
      price: 799,
      originalPrice: 1599,
      discount: '50%',
      description: 'For mid-market companies and accounting firms',
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
      popular: true
    },
    {
      name: 'Fortune 500',
      subtitle: 'Enterprise',
      price: 2499,
      originalPrice: 4999,
      discount: '50%',
      description: 'For large enterprises and global accounting firms',
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
      popular: false
    }
  ]

  const handleCTAClick = (planName: string) => {
    // analytics.clickPricingCTA(planName)
    if (planName === 'Scale') {
      // For Scale plan, open Calendly or contact form
      window.open('https://calendly.com/finacly-ai-inc/30min', '_blank')
    } else {
      // For Starter and Growth, open Early Access modal
      setIsModalOpen(true)
    }
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-mint-950/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center bg-amber-100 text-amber-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="hidden sm:inline">Founding Discount - Lock pricing for 12 months</span>
            <span className="sm:hidden">Founding Discount</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Choose the plan that fits your business. All plans include our core reconciliation 
            features with founding member pricing locked for 12 months.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`glass-card p-6 sm:p-8 relative ${plan.popular ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-amber-400 font-medium mb-3 sm:mb-4 text-sm sm:text-base">{plan.subtitle}</p>
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{plan.description}</p>
                
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">${plan.price}</span>
                    <span className="text-lg sm:text-xl text-gray-300 ml-1 sm:ml-2">/mo</span>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-sm sm:text-lg text-gray-400 line-through mr-2">${plan.originalPrice}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                      {plan.discount} off
                    </span>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTAClick(plan.name)}
                className={`w-full py-3 sm:py-3 px-4 sm:px-6 rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                  plan.popular
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <div className="glass-card p-6 sm:p-8 max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Launch Offer: Founding Discount
            </h3>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Lock in founding member pricing for 12 months. This discount ends November 30, 2025. 
              No hidden fees, cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2" />
                30-day money back guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Early Access Modal */}
      <EarlyAccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  )
}
