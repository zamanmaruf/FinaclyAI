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
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4">
              <Image
                src="/logo.jpg"
                alt="Finacly AI Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white">
              Finacly AI
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold mb-4 sm:mb-6 leading-tight px-2">
            Close your books{' '}
            <span className="gradient-text">8× faster</span> with payout-aware reconciliation.
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Finacly automatically matches payment-processor payouts to bank deposits, 
            proposes one-click fixes in QuickBooks Online, and leaves an immutable audit trail.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-4">
            <button
              onClick={handleGetEarlyAccess}
              className="btn-primary text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 flex items-center group w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Get Early Access - Limited Spots</span>
              <span className="sm:hidden">Get Early Access</span>
              <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <CalendlyButton 
              url="https://calendly.com/finacly-ai-inc/30min"
              className="btn-secondary text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 flex items-center group w-full sm:w-auto"
            >
              <Calendar className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="hidden sm:inline">Book a 15-min Fit Call</span>
              <span className="sm:hidden">Book Call</span>
            </CalendlyButton>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-400 px-4">
            <div className="flex items-center">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-primary-400" />
              SOC 2 Compliant
            </div>
            <div className="flex items-center">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gold-400" />
              95%+ Auto-Match Rate
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-primary-400" />
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