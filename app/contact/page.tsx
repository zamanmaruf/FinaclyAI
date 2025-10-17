'use client'

import { 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin,
  ArrowRight,
  Clock,
  CheckCircle,
  Users,
  Zap
} from 'lucide-react'

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help with your account or technical questions',
    contact: 'finacly.ai.inc@gmail.com',
    responseTime: 'Within 24 hours',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    icon: MessageSquare,
    title: 'Sales Inquiries',
    description: 'Talk to our sales team about enterprise plans',
    contact: 'sales@finacly.ai',
    responseTime: 'Within 4 hours',
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    icon: Users,
    title: 'Partnerships',
    description: 'Explore integration and partnership opportunities',
    contact: 'partners@finacly.ai',
    responseTime: 'Within 2 business days',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  }
]

const faq = [
  {
    question: "How quickly can I get started?",
    answer: "You can start your free trial immediately after signup. Most users have their first integration connected within 5 minutes."
  },
  {
    question: "Do you offer custom integrations?",
    answer: "Yes! We work with enterprise customers to build custom integrations. Contact our sales team to discuss your specific needs."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer email support for all plans, with priority support for Growth and Scale plans. Enterprise customers get dedicated account managers."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We're SOC 2 compliant with bank-grade encryption, secure API connections, and regular security audits."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees."
  }
]

export default function ContactPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Thank you for your message! We\'ll get back to you soon.')
        e.currentTarget.reset()
      } else {
        alert(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Have questions? Need support? Want to discuss a partnership? 
              We're here to help you succeed with Finacly AI.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div key={method.title} className="glass-card p-8 text-center">
                <div className={`inline-flex p-4 rounded-xl ${method.bgColor} mb-6`}>
                  <method.icon className={`w-8 h-8 ${method.color}`} />
                </div>
                
                <h3 className="text-xl font-heading font-semibold text-white mb-3">
                  {method.title}
                </h3>
                
                <p className="text-gray-300 mb-6">
                  {method.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    {method.responseTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Send Us a <span className="gradient-text">Message</span>
            </h2>
            <p className="text-xl text-gray-300">
              Prefer to send a message? Fill out the form below and we'll get back to you quickly.
            </p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="partnership">Partnership</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-lg py-4"
              >
                Send Message
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </form>
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
            <p className="text-xl text-gray-300">
              Quick answers to common questions about Finacly AI.
            </p>
          </div>

          <div className="space-y-6">
            {faq.map((item, index) => (
              <div key={index} className="glass-card p-6">
                <h3 className="text-lg font-heading font-semibold text-white mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {item.answer}
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
              Join 200+ businesses already using Finacly AI to automate their financial reconciliation.
            </p>
            <button 
              onClick={() => {
                window.location.href = '/#signup-form'
              }}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Free Trial
              <Zap className="w-5 h-5 ml-2 inline" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}