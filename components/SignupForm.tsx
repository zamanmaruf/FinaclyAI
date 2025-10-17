'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface SignupFormData {
  email: string
  fullName: string
  companyName: string
  currentTools: string
  referralSource: string
}

export default function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignupFormData>()

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        reset()
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="glass-card p-8 max-w-2xl mx-auto text-center">
        <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-6">
          <CheckCircle className="w-12 h-12 text-primary-400" />
        </div>
        
        <h3 className="text-2xl font-heading font-bold text-white mb-4">
          Welcome to the Future of Reconciliation!
        </h3>
        
        <p className="text-gray-300 mb-6">
          Thank you for joining our early access program. We'll be in touch soon with your 
          exclusive beta access and special founding member pricing.
        </p>
        
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
          <p className="text-primary-400 font-medium">
            🎉 You're now part of the Finacly AI revolution!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-heading font-bold text-white mb-4">
          Reserve Your Beta Spot
        </h3>
        <p className="text-gray-300">
          Join 200+ businesses already signed up for early access. Limited spots available.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="your@company.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            {...register('fullName', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="John Smith"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-white mb-2">
            Company Name *
          </label>
          <input
            type="text"
            id="companyName"
            {...register('companyName', {
              required: 'Company name is required',
              minLength: {
                value: 2,
                message: 'Company name must be at least 2 characters'
              }
            })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Acme Corp"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* Current Tools */}
        <div>
          <label htmlFor="currentTools" className="block text-sm font-medium text-white mb-2">
            Current Tools Used
          </label>
          <select
            id="currentTools"
            {...register('currentTools')}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select current tools</option>
            <option value="manual-excel">Manual Excel</option>
            <option value="quickbooks-only">QuickBooks Only</option>
            <option value="stripe-only">Stripe Only</option>
            <option value="multiple-systems">Multiple Systems</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Referral Source */}
        <div>
          <label htmlFor="referralSource" className="block text-sm font-medium text-white mb-2">
            How did you hear about us?
          </label>
          <select
            id="referralSource"
            {...register('referralSource')}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select source</option>
            <option value="google">Google Search</option>
            <option value="social-media">Social Media</option>
            <option value="referral">Referral</option>
            <option value="conference">Conference/Event</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {errorMessage}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Reserving Your Spot...
            </>
          ) : (
            'Reserve My Beta Spot'
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          By submitting, you agree to receive updates about Finacly AI. 
          Unsubscribe at any time.
        </p>
      </form>
    </div>
  )
}