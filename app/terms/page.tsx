'use client'

import { 
  FileText, 
  Scale, 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Globe,
  Key,
  Database,
  Server,
  Zap
} from 'lucide-react'

const serviceTerms = [
  {
    icon: Users,
    title: 'Service Description',
    description: 'Finacly AI provides automated financial reconciliation services for businesses and accounting firms.',
    details: [
      'Automated matching of payment processor transactions with bank deposits',
      'Integration with accounting systems including QuickBooks, Xero, and Sage',
      'Real-time reconciliation and exception management',
      'Audit trail generation and compliance reporting',
      'Multi-currency support and foreign exchange handling',
      'API access for custom integrations and workflows'
    ]
  },
  {
    icon: Key,
    title: 'User Accounts & Access',
    description: 'Account creation, management, and security responsibilities for all users.',
    details: [
      'Users must provide accurate and complete information during registration',
      'Account credentials must be kept secure and confidential',
      'Users are responsible for all activities under their account',
      'Multi-factor authentication may be required for enhanced security',
      'Account access may be suspended for security or compliance reasons',
      'Users must notify us immediately of any unauthorized access'
    ]
  },
  {
    icon: Database,
    title: 'Data Processing & Ownership',
    description: 'Rights and responsibilities regarding data processing, ownership, and usage.',
    details: [
      'Users retain ownership of their financial data',
      'Finacly processes data only for service delivery and legitimate business purposes',
      'Data is encrypted in transit and at rest using industry-standard methods',
      'Users grant necessary licenses for service operation and improvement',
      'Data processing is subject to our Privacy Policy and applicable laws',
      'Users may request data export or deletion subject to legal requirements'
    ]
  },
  {
    icon: Shield,
    title: 'Security & Compliance',
    description: 'Security obligations, compliance requirements, and data protection measures.',
    details: [
      'SOC 2 Type II compliance with annual third-party audits',
      'GDPR and CCPA compliance for data protection and privacy',
      'PCI DSS Level 1 certification for payment data security',
      'Regular security assessments and penetration testing',
      'Incident response procedures and breach notification protocols',
      'Compliance with applicable financial services regulations'
    ]
  }
]

const serviceLevels = [
  {
    tier: 'Professional',
    uptime: '99.5%',
    support: 'Business Hours',
    sla: '24 hours',
    features: [
      'Standard security controls',
      'Email support during business hours',
      'Basic audit trail and reporting',
      'Standard data retention (7 years)'
    ]
  },
  {
    tier: 'Enterprise',
    uptime: '99.9%',
    support: '24/7',
    sla: '4 hours',
    features: [
      'Enhanced security controls and monitoring',
      '24/7 phone and chat support',
      'Advanced audit trail and compliance reporting',
      'Extended data retention options',
      'Dedicated account manager',
      'Custom integration support'
    ]
  },
  {
    tier: 'Fortune 500',
    uptime: '99.99%',
    support: '24/7 Premium',
    sla: '1 hour',
    features: [
      'Enterprise-grade security and compliance',
      '24/7 premium support with dedicated team',
      'Comprehensive audit trail and regulatory reporting',
      'Flexible data retention and archival options',
      'Dedicated success team and technical resources',
      'Custom security requirements and on-premise options'
    ]
  }
]

const userObligations = [
  {
    category: 'Legal Compliance',
    obligations: [
      'Comply with all applicable laws and regulations',
      'Obtain necessary licenses and permissions for data processing',
      'Ensure data accuracy and completeness',
      'Respect intellectual property rights',
      'Maintain appropriate insurance coverage',
      'Report any regulatory changes affecting service usage'
    ]
  },
  {
    category: 'Data Security',
    obligations: [
      'Implement appropriate security measures for data access',
      'Use strong authentication and access controls',
      'Regularly update security software and systems',
      'Report security incidents immediately',
      'Conduct regular security assessments',
      'Train personnel on data security best practices'
    ]
  },
  {
    category: 'Service Usage',
    obligations: [
      'Use services only for legitimate business purposes',
      'Not attempt to reverse engineer or compromise our systems',
      'Respect rate limits and usage guidelines',
      'Not use services for illegal or prohibited activities',
      'Maintain accurate and up-to-date account information',
      'Cooperate with security and compliance audits'
    ]
  }
]

const limitations = [
  {
    category: 'Service Limitations',
    items: [
      'Services are provided "as is" without warranties of any kind',
      'We do not guarantee 100% accuracy of reconciliation results',
      'Service availability may be affected by third-party dependencies',
      'Data processing is subject to regulatory and legal requirements',
      'Custom integrations may require additional development time',
      'Service features may be updated or modified with notice'
    ]
  },
  {
    category: 'Liability Limitations',
    items: [
      'Liability is limited to the amount paid for services in the preceding 12 months',
      'We are not liable for indirect, incidental, or consequential damages',
      'Force majeure events may affect service availability',
      'Third-party service disruptions are beyond our control',
      'Users are responsible for their own data backup and recovery',
      'Regulatory changes may require service modifications'
    ]
  }
]

const termination = [
  {
    scenario: 'User-Initiated Termination',
    description: 'Users may terminate their account at any time with 30 days notice',
    process: [
      'Submit termination request through account settings',
      'Export all data within 30 days of termination',
      'Settle any outstanding invoices or charges',
      'Data will be securely deleted after retention period',
      'Confirmation of account closure will be provided'
    ]
  },
  {
    scenario: 'Service-Initiated Termination',
    description: 'We may terminate accounts for violations or non-payment',
    process: [
      'Written notice of termination with specific reasons',
      '30-day cure period for remediable violations',
      'Immediate termination for serious security breaches',
      'Data export period before account closure',
      'Appeal process for disputed terminations'
    ]
  },
  {
    scenario: 'Force Majeure Termination',
    description: 'Termination due to circumstances beyond our control',
    process: [
      'Notice of force majeure event and expected duration',
      'Efforts to restore service as quickly as possible',
      'Alternative arrangements if available',
      'Refund or credit for service interruption period',
      'Data protection during service interruption'
    ]
  }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-6">
              <Scale className="w-12 h-12 text-primary-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-white">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              These comprehensive terms govern your use of Finacly AI's financial reconciliation services. 
              Please read these terms carefully as they contain important information about your rights and obligations.
            </p>
            <div className="mt-8 text-sm text-gray-400">
              Last updated: December 2024 | Effective date: January 1, 2025
            </div>
          </div>
        </div>
      </section>

      {/* Service Terms */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Service Terms & Conditions
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive terms covering service description, user responsibilities, 
              and operational requirements for our financial reconciliation platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {serviceTerms.map((term, index) => (
              <div key={index} className="glass-card p-8">
                <div className="flex items-start mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-primary-500/10 mr-4 flex-shrink-0">
                    <term.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-white mb-3">
                      {term.title}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {term.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {term.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Level Agreements */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Service Level Agreements
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Guaranteed service levels and support commitments based on your subscription tier. 
              All SLAs include service credits for performance below guaranteed levels.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {serviceLevels.map((level, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-2xl font-heading font-bold text-white mb-6">
                  {level.tier}
                </h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Uptime SLA</h4>
                    <p className="text-2xl font-bold text-primary-400">{level.uptime}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Support Level</h4>
                    <p className="text-gray-300">{level.support}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Response Time</h4>
                    <p className="text-gray-300">{level.sla}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {level.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Obligations */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              User Obligations & Responsibilities
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Important obligations and responsibilities that users must fulfill 
              to maintain service access and ensure compliance with applicable laws.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userObligations.map((category, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-2xl font-heading font-bold text-white mb-6">
                  {category.category}
                </h3>
                <ul className="space-y-4">
                  {category.obligations.map((obligation, obligationIndex) => (
                    <li key={obligationIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{obligation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limitations & Liability */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Limitations & Liability
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Important limitations on our liability and service guarantees. 
              These terms help ensure fair and sustainable service delivery.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {limitations.map((category, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-2xl font-heading font-bold text-white mb-6">
                  {category.category}
                </h3>
                <ul className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Termination Procedures */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Termination Procedures
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Clear procedures for account termination under various circumstances, 
              including data protection and transition requirements.
            </p>
          </div>

          <div className="space-y-8">
            {termination.map((scenario, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-2xl font-heading font-bold text-white mb-4">
                  {scenario.scenario}
                </h3>
                <p className="text-gray-300 mb-6">
                  {scenario.description}
                </p>
                <ul className="space-y-3">
                  {scenario.process.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Information */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-heading font-bold mb-6 text-white">
              Legal Information & Contact
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              For questions about these terms, legal matters, or to exercise your rights, 
              please contact our legal team. We respond to all legal inquiries within 5 business days.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Legal Department</h3>
                <p className="text-gray-300 mb-4">legal@finacly.ai</p>
                <button 
                  onClick={() => window.location.href = 'mailto:legal@finacly.ai'}
                  className="btn-primary"
                >
                  Contact Legal Team
                </button>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">General Counsel</h3>
                <p className="text-gray-300 mb-4">counsel@finacly.ai</p>
                <button 
                  onClick={() => window.location.href = 'mailto:counsel@finacly.ai'}
                  className="btn-secondary"
                >
                  Contact General Counsel
                </button>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                These terms are governed by the laws of [Jurisdiction] and any disputes 
                will be resolved through binding arbitration. By using our services, 
                you agree to these terms and our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}