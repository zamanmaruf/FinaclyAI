'use client'

import { 
  CreditCard, 
  Building, 
  Database, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  Globe,
  TrendingUp
} from 'lucide-react'

const integrationCategories = [
  {
    title: 'Payment Processors',
    description: 'Connect your payment processing systems',
    icon: CreditCard,
    integrations: [
      {
        name: 'Stripe',
        description: 'Full Stripe integration with charges, payouts, and fees',
        status: 'Available',
        features: ['Charges & Refunds', 'Payouts', 'Fees Tracking', 'Multi-Currency']
      },
      {
        name: 'PayPal',
        description: 'Complete PayPal business account integration',
        status: 'Available',
        features: ['Payments', 'Payouts', 'Fees', 'Refunds']
      },
      {
        name: 'Square',
        description: 'Square payments and transaction data',
        status: 'Coming Soon',
        features: ['Payments', 'Refunds', 'Fees', 'Reporting']
      }
    ]
  },
  {
    title: 'Accounting Software',
    description: 'Sync with your accounting systems',
    icon: Building,
    integrations: [
      {
        name: 'QuickBooks Online',
        description: 'Full QBO integration with invoices, payments, and deposits',
        status: 'Available',
        features: ['Invoices', 'Payments', 'Deposits', 'Customers']
      },
      {
        name: 'Xero',
        description: 'Complete Xero accounting platform integration',
        status: 'Coming Soon',
        features: ['Invoices', 'Payments', 'Bank Feeds', 'Reports']
      }
    ]
  },
  {
    title: 'Banking & Financial Data',
    description: 'Connect your bank accounts and financial data',
    icon: Database,
    integrations: [
      {
        name: 'Plaid',
        description: 'Secure bank account connection via Plaid',
        status: 'Available',
        features: ['Account Connection', 'Transaction Data', 'Balance Info', 'Real-time Updates']
      },
      {
        name: 'Flinks',
        description: 'Canadian bank data integration via Flinks',
        status: 'Available',
        features: ['Canadian Banks', 'Transaction Data', 'Account Info', 'Open Banking Ready']
      },
      {
        name: 'Open Banking APIs',
        description: 'Direct bank API connections (2026)',
        status: '2026',
        features: ['Direct Bank APIs', 'Real-time Data', 'Enhanced Security', 'Lower Costs']
      }
    ]
  }
]

const benefits = [
  {
    icon: Zap,
    title: 'Instant Setup',
    description: 'Connect accounts in under 2 minutes with OAuth 2.0'
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Enterprise security with encrypted connections'
  },
  {
    icon: Clock,
    title: 'Real-Time Sync',
    description: 'Data flows in real-time as transactions happen'
  },
  {
    icon: Globe,
    title: 'Multi-Currency',
    description: 'Handle international transactions and conversions'
  }
]

const upcomingIntegrations = [
  'Wise (formerly TransferWise)',
  'Shopify Payments',
  'WooCommerce',
  'Amazon Pay',
  'Apple Pay',
  'Google Pay',
  'Sage Intacct',
  'NetSuite',
  'FreshBooks',
  'Wave Accounting'
]

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Powerful <span className="gradient-text">Integrations</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Connect all your financial systems in one place. From payment processors to accounting software, 
              we've got you covered with secure, real-time integrations.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {integrationCategories.map((category, categoryIndex) => (
            <div key={category.title} className="mb-16">
              <div className="flex items-center mb-8">
                <div className="inline-flex p-3 rounded-xl bg-primary-500/10 mr-4">
                  <category.icon className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">
                    {category.title}
                  </h2>
                  <p className="text-gray-300">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.integrations.map((integration, integrationIndex) => (
                  <div key={integration.name} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-heading font-semibold text-white">
                        {integration.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        integration.status === 'Available' 
                          ? 'bg-primary-500/10 text-primary-400' 
                          : integration.status === 'Coming Soon'
                          ? 'bg-gold-500/10 text-gold-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {integration.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      {integration.description}
                    </p>

                    <ul className="space-y-2">
                      {integration.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-400">
                          <CheckCircle className="w-4 h-4 text-primary-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Why Our <span className="gradient-text">Integrations</span> Are Different
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with enterprise-grade security and real-time processing for seamless financial operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h4 className="text-xl font-heading font-semibold mb-3 text-white">
                  {benefit.title}
                </h4>
                <p className="text-gray-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Integrations */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Coming <span className="gradient-text">Soon</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're constantly adding new integrations based on user feedback. 
              Request an integration or vote on upcoming ones.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {upcomingIntegrations.map((integration, index) => (
              <div key={integration} className="glass-card p-4 text-center">
                <h4 className="text-white font-medium">
                  {integration}
                </h4>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="glass-card p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-heading font-bold mb-4">
                Don't See Your Integration?
              </h3>
              <p className="text-gray-300 mb-6">
                We're always adding new integrations based on user requests. 
                Contact us to request a specific integration or vote on upcoming ones.
              </p>
              <button 
                onClick={() => {
                  window.location.href = '/contact'
                }}
                className="btn-primary"
              >
                Request Integration
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-heading font-bold mb-6">
              Ready to Connect Your Systems?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start your free trial and connect your first integration in under 2 minutes.
            </p>
            <button 
              onClick={() => {
                window.location.href = '/#signup-form'
              }}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}