'use client'

import { 
  Brain, 
  Database, 
  CheckCircle, 
  Globe, 
  BarChart3, 
  FileText,
  Shield,
  Zap,
  TrendingUp,
  Lock,
  Clock,
  Target
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Matching Engine',
    description: 'Advanced machine learning algorithms automatically match transactions across all your financial systems with 95%+ accuracy.',
    details: [
      'Machine learning pattern recognition',
      'Continuous improvement from user data',
      'Handles complex matching scenarios',
      'Reduces false positives and negatives'
    ],
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    icon: Database,
    title: 'Multi-Source Integration',
    description: 'Connect Stripe, PayPal, Square, banks, QuickBooks, and Xero in one unified platform. No more switching between systems.',
    details: [
      'Stripe & payment processors',
      'QuickBooks Online & Xero',
      'Bank feeds via Plaid/Flinks',
      'Future: Open Banking APIs'
    ],
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    icon: CheckCircle,
    title: 'One-Click Exception Fixes',
    description: 'Review unmatched transactions in a clean exceptions inbox and fix them with a single click. No more manual data entry.',
    details: [
      'Intuitive exceptions dashboard',
      'Smart suggestions for matches',
      'Bulk processing capabilities',
      'One-click approval workflow'
    ],
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    icon: Globe,
    title: 'Multi-Currency Support',
    description: 'Handle international transactions with automatic currency conversion and real-time exchange rates. Perfect for global businesses.',
    details: [
      'Real-time exchange rate updates',
      'Automatic currency conversion',
      'Multi-currency reporting',
      'Historical rate tracking'
    ],
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get deep insights into your financial data with customizable reports, trends analysis, and predictive insights.',
    details: [
      'Custom report builder',
      'Trend analysis and forecasting',
      'Export to Excel/PDF',
      'Scheduled report delivery'
    ],
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    icon: FileText,
    title: 'Complete Audit Trail',
    description: 'Every action is logged with full audit trails. Perfect for compliance, tax preparation, and financial reviews.',
    details: [
      'Complete transaction history',
      'User action logging',
      'Compliance-ready reports',
      'Export capabilities'
    ],
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with SOC 2 compliance, end-to-end encryption, and secure API connections.',
    details: [
      'SOC 2 Type II compliant',
      'End-to-end encryption',
      'Secure API connections',
      'Regular security audits'
    ],
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  },
  {
    icon: Zap,
    title: 'Real-Time Processing',
    description: 'Transactions are processed and matched in real-time as they flow into your systems. No more waiting for batch processing.',
    details: [
      'Real-time data synchronization',
      'Instant transaction matching',
      'Live dashboard updates',
      'Webhook notifications'
    ],
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10'
  },
  {
    icon: TrendingUp,
    title: 'Scalable Architecture',
    description: 'Built to grow with your business. Handle thousands of transactions with the same performance, whether you\'re a startup or enterprise.',
    details: [
      'Auto-scaling infrastructure',
      'High-volume transaction handling',
      '99.9% uptime guarantee',
      'Enterprise SLA support'
    ],
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10'
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Powerful <span className="gradient-text">Features</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Everything you need to automate financial reconciliation with enterprise-grade precision. 
              Built for the future of finance.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-8 hover:scale-105 transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-heading font-semibold mb-4 text-white">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <ul className="space-y-3">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-primary-400 mr-2 mt-0.5 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Why Choose <span className="gradient-text">Finacly AI</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built specifically for SMBs who need enterprise-grade financial automation 
              without the complexity or cost.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-4">
                <Clock className="w-8 h-8 text-primary-400" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-3 text-white">
                Save 30+ Hours/Month
              </h4>
              <p className="text-gray-300">
                Eliminate manual reconciliation and focus on growing your business
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-gold-500/10 mb-4">
                <Target className="w-8 h-8 text-gold-400" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-3 text-white">
                95%+ Auto-Match Rate
              </h4>
              <p className="text-gray-300">
                Industry-leading accuracy with machine learning algorithms
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-4">
                <Lock className="w-8 h-8 text-primary-400" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-3 text-white">
                Enterprise Security
              </h4>
              <p className="text-gray-300">
                SOC 2 compliant with bank-grade encryption and security
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-gold-500/10 mb-4">
                <TrendingUp className="w-8 h-8 text-gold-400" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-3 text-white">
                Future-Ready
              </h4>
              <p className="text-gray-300">
                Built for Open Banking and the future of financial automation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-heading font-bold mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the early access program and be among the first to experience 
              AI-powered financial reconciliation.
            </p>
            <button 
              onClick={() => {
                window.location.href = '/#signup-form'
              }}
              className="btn-primary text-lg px-8 py-4"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}