'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { analytics } from '@/lib/analytics'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs: FAQItem[] = [
    {
      question: "What do I need on day 1?",
      answer: "You'll need a Stripe account, QuickBooks Online, and a bank connection via Plaid or Flinks. We'll guide you through the setup process."
    },
    {
      question: "Do you support PayPal, Square, or Xero?",
      answer: "PayPal and Square support is coming in V1. Xero will be read-only initially, with full integration planned for later releases."
    },
    {
      question: "How does multi-currency work?",
      answer: "We store both original and home currency amounts, flag foreign exchange transactions for review, and support automatic FX postings in QuickBooks."
    },
    {
      question: "What's your security posture?",
      answer: "We use AES-256-GCM encryption at rest, least-privilege access controls, immutable audit logs, and are working toward SOC 2 Type I/II certification."
    },
    {
      question: "Where is my data stored?",
      answer: "We prefer Canadian data residency and offer options for other regions. All data is encrypted and stored in secure, compliant data centers."
    },
    {
      question: "How accurate is the auto-matching?",
      answer: "Our AI achieves 95%+ auto-match rates on test datasets. Remaining exceptions are surfaced with confidence scores and proposed fixes."
    },
    {
      question: "Can I try before I buy?",
      answer: "Yes! We offer a 30-day money-back guarantee and will provide a demo environment for qualified prospects."
    },
    {
      question: "Do you offer custom pricing?",
      answer: "Yes, for accounting firms and enterprises with 200k+ transactions/month. Contact our sales team for custom pricing and white-label options."
    }
  ]

  const toggleItem = (index: number) => {
    const isOpen = openItems.includes(index)
    if (isOpen) {
      setOpenItems(openItems.filter(i => i !== index))
    } else {
      setOpenItems([...openItems, index])
      analytics.openFAQ(faqs[index].question)
    }
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-forest-900/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about Finacly's reconciliation platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card">
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6">
                  <p className="text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="glass-card p-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our team is here to help. Book a 15-minute fit call to discuss your specific needs.
            </p>
            <a 
              href="https://calendly.com/finacly-ai-inc/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Book a Fit Call
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
