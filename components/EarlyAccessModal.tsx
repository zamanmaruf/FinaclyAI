'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
// import { analytics } from '@/lib/analytics'

interface EarlyAccessFormData {
  email: string
  fullName: string
  companyName: string
  role: string
  companySize: string
  stackPsp: string[]
  stackLedger: string[]
  country: string
  phone?: string
}

interface EarlyAccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EarlyAccessModal({ isOpen, onClose }: EarlyAccessModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<EarlyAccessFormData>()

  const watchedStackPsp = watch('stackPsp', [])
  const watchedStackLedger = watch('stackLedger', [])

  const onSubmit = async (data: EarlyAccessFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // analytics.startForm('early_access')
      
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        // analytics.submitLeadSuccess(data.role, data.companySize)
        reset()
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Something went wrong. Please try again.')
        // analytics.submitLeadError(result.error || 'Unknown error')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
      // analytics.submitLeadError('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitStatus !== 'success') {
      // analytics.abandonForm('early_access', 1)
    }
    onClose()
  }

  const handleStackPspChange = (value: string, checked: boolean) => {
    const current = watchedStackPsp || []
    if (checked) {
      setValue('stackPsp', [...current, value])
    } else {
      setValue('stackPsp', current.filter(item => item !== value))
    }
  }

  const handleStackLedgerChange = (value: string, checked: boolean) => {
    const current = watchedStackLedger || []
    if (checked) {
      setValue('stackLedger', [...current, value])
    } else {
      setValue('stackLedger', current.filter(item => item !== value))
    }
  }

  if (!isOpen) return null

  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
        <div className="card p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="inline-flex p-3 sm:p-4 rounded-xl bg-mint-500/10 mb-4 sm:mb-6">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-mint-500" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-navy-950 mb-3 sm:mb-4">
              Welcome to Finacly Early Access!
            </h3>
            
            <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Thank you for joining our early access program. We'll be in touch soon with your 
              exclusive beta access and special founding member pricing.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-amber-800 font-medium text-sm sm:text-base">
                🎉 You're now part of the Finacly revolution!
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
      <div className="card p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-navy-950">
            Get Early Access
          </h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
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
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="your@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
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
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="John Smith"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
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
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Acme Corp"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
              Your Role *
            </label>
            <select
              id="role"
              {...register('role', { required: 'Role is required' })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select your role</option>
              <option value="owner">Owner/Founder</option>
              <option value="accountant">Accountant</option>
              <option value="controller">Controller</option>
              <option value="bookkeeper">Bookkeeper</option>
              <option value="other">Other</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Company Size */}
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-slate-700 mb-2">
              Company Size *
            </label>
            <select
              id="companySize"
              {...register('companySize', { required: 'Company size is required' })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="200+">200+ employees</option>
            </select>
            {errors.companySize && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.companySize.message}
              </p>
            )}
          </div>

          {/* PSP Stack */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Processors (select all that apply)
            </label>
            <div className="space-y-2">
              {['Stripe', 'PayPal', 'Square'].map((psp) => (
                <label key={psp} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={watchedStackPsp.includes(psp.toLowerCase())}
                    onChange={(e) => handleStackPspChange(psp.toLowerCase(), e.target.checked)}
                    className="mr-3 rounded border-slate-300 text-royal-500 focus:ring-royal-500"
                  />
                  <span className="text-slate-700">{psp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ledger Stack */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Accounting Software (select all that apply)
            </label>
            <div className="space-y-2">
              {['QuickBooks Online', 'Xero'].map((ledger) => (
                <label key={ledger} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={watchedStackLedger.includes(ledger.toLowerCase().replace(' ', '_'))}
                    onChange={(e) => handleStackLedgerChange(ledger.toLowerCase().replace(' ', '_'), e.target.checked)}
                    className="mr-3 rounded border-slate-300 text-royal-500 focus:ring-royal-500"
                  />
                  <span className="text-slate-700">{ledger}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">
              Country *
            </label>
            <select
              id="country"
              {...register('country', { required: 'Country is required' })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="other">Other</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Phone (optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 flex items-center">
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
                Joining Early Access...
              </>
            ) : (
              'Get Early Access'
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            By submitting, you agree to receive updates about Finacly. 
            Unsubscribe at any time.
          </p>
        </form>
      </div>
    </div>
  )
}
