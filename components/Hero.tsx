'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Calendar, CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import EarlyAccessModal from './EarlyAccessModal'
import { CalendlyButton } from './CalendlyEmbed'

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleGetEarlyAccess = () => {
    analytics.clickGetEarlyAccess()
    setIsModalOpen(true)
  }

  const handleBookFitCall = () => {
    analytics.clickBookFitCall()
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950">
          <div className="absolute inset-0 bg-white/5 opacity-40"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute top-20 left-10 text-primary-400/20">
          <Zap className="w-8 h-8" />
        </div>

        <div className="absolute top-32 right-16 text-gold-400/20">
          <Shield className="w-6 h-6" />
        </div>

        <div className="absolute bottom-32 left-20 text-primary-400/20">
          <TrendingUp className="w-7 h-7" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-16 h-16 mr-4">
              <Image
                src="/logo.jpg"
                alt="Finacly AI Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-4xl font-heading font-bold text-white">
              Finacly AI
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
            Close your books{' '}
            <span className="gradient-text">8× faster</span> with payout-aware reconciliation.
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Finacly automatically matches payment-processor payouts to bank deposits, 
            proposes one-click fixes in QuickBooks Online, and leaves an immutable audit trail.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={handleGetEarlyAccess}
              className="btn-primary text-xl px-12 py-5 flex items-center group"
            >
              Get Early Access - Limited Spots
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <CalendlyButton 
              url="https://calendly.com/finacly-ai-inc/30min"
              className="btn-secondary text-xl px-12 py-5 flex items-center group"
            >
              <Calendar className="mr-3 w-6 h-6" />
              Book a 15-min Fit Call
            </CalendlyButton>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-primary-400" />
              SOC 2 Compliant
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-gold-400" />
              95%+ Auto-Match Rate
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary-400" />
              2026 Open Banking Ready
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Modal */}
      <EarlyAccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}