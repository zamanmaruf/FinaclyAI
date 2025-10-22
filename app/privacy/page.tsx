'use client'

import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Users, 
  Globe, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Key,
  Server
} from 'lucide-react'

const privacyPrinciples = [
  {
    icon: Shield,
    title: 'Data Minimization',
    description: 'We collect only the data necessary to provide our services and process it for legitimate business purposes.',
    details: [
      'Collection limited to essential financial reconciliation data',
      'No collection of unnecessary personal information',
      'Regular data minimization audits',
      'Purpose limitation for all data processing activities'
    ]
  },
  {
    icon: Lock,
    title: 'Data Protection by Design',
    description: 'Privacy considerations are integrated into every aspect of our system architecture and development processes.',
    details: [
      'Privacy-by-design architecture principles',
      'Data protection impact assessments',
      'Privacy-enhancing technologies implementation',
      'Default privacy settings and configurations'
    ]
  },
  {
    icon: Eye,
    title: 'Transparency & Control',
    description: 'Clear information about data processing with granular controls for users to manage their privacy preferences.',
    details: [
      'Comprehensive privacy notices and disclosures',
      'Granular consent management',
      'User-friendly privacy controls',
      'Regular privacy policy updates and notifications'
    ]
  },
  {
    icon: Key,
    title: 'Data Subject Rights',
    description: 'Full support for individual privacy rights including access, rectification, erasure, and data portability.',
    details: [
      'Right to access personal data',
      'Right to rectification of inaccurate data',
      'Right to erasure (right to be forgotten)',
      'Right to data portability',
      'Right to restrict processing',
      'Right to object to processing'
    ]
  }
]

const dataCategories = [
  {
    category: 'Financial Data',
    description: 'Bank account information, transaction data, and financial records',
    purpose: 'Core reconciliation services and financial analysis',
    retention: '7 years (regulatory requirement)',
    legalBasis: 'Contract performance and legitimate interest'
  },
  {
    category: 'Identity Data',
    description: 'Name, email address, phone number, and authentication credentials',
    purpose: 'Account management, authentication, and customer support',
    retention: 'Account lifetime + 3 years',
    legalBasis: 'Contract performance and consent'
  },
  {
    category: 'Usage Data',
    description: 'System logs, access patterns, and feature usage analytics',
    purpose: 'Service improvement, security monitoring, and performance optimization',
    retention: '2 years',
    legalBasis: 'Legitimate interest and consent'
  },
  {
    category: 'Technical Data',
    description: 'IP addresses, device information, and browser data',
    purpose: 'Security monitoring, fraud prevention, and service delivery',
    retention: '1 year',
    legalBasis: 'Legitimate interest and legal obligation'
  }
]

const dataSharing = [
  {
    category: 'Service Providers',
    description: 'Trusted third-party vendors who assist in service delivery',
    examples: ['AWS (cloud infrastructure)', 'Stripe (payment processing)', 'QuickBooks (accounting integration)'],
    safeguards: 'Data processing agreements, security assessments, and regular audits'
  },
  {
    category: 'Financial Partners',
    description: 'Banks, payment processors, and financial institutions',
    examples: ['Plaid (banking data)', 'Yodlee (financial aggregation)', 'Bank APIs'],
    safeguards: 'Encrypted connections, minimal data sharing, and regulatory compliance'
  },
  {
    category: 'Legal Requirements',
    description: 'Government authorities and regulatory bodies when legally required',
    examples: ['Tax authorities', 'Financial regulators', 'Law enforcement'],
    safeguards: 'Legal review, data minimization, and appropriate legal basis'
  }
]

const securityMeasures = [
  {
    title: 'Encryption',
    measures: [
      'AES-256 encryption for data at rest',
      'TLS 1.3 for data in transit',
      'End-to-end encryption for sensitive data',
      'Encrypted database backups'
    ]
  },
  {
    title: 'Access Controls',
    measures: [
      'Multi-factor authentication (MFA)',
      'Role-based access controls (RBAC)',
      'Principle of least privilege',
      'Regular access reviews and audits'
    ]
  },
  {
    title: 'Monitoring & Detection',
    measures: [
      '24/7 security monitoring',
      'Automated threat detection',
      'Intrusion detection systems',
      'Regular security assessments'
    ]
  },
  {
    title: 'Data Governance',
    measures: [
      'Data classification and labeling',
      'Data retention policies',
      'Secure data disposal',
      'Privacy impact assessments'
    ]
  }
]

const userRights = [
  {
    right: 'Right to Access',
    description: 'Request a copy of all personal data we hold about you',
    process: 'Submit request through your account or contact our privacy team',
    timeframe: '30 days maximum response time'
  },
  {
    right: 'Right to Rectification',
    description: 'Correct inaccurate or incomplete personal data',
    process: 'Update information directly in your account or contact support',
    timeframe: 'Immediate for account updates, 30 days for complex requests'
  },
  {
    right: 'Right to Erasure',
    description: 'Request deletion of your personal data (right to be forgotten)',
    process: 'Submit deletion request through your account or privacy team',
    timeframe: '30 days maximum, subject to legal retention requirements'
  },
  {
    right: 'Right to Portability',
    description: 'Receive your data in a structured, machine-readable format',
    process: 'Request data export through your account settings',
    timeframe: '30 days maximum response time'
  },
  {
    right: 'Right to Restrict Processing',
    description: 'Limit how we process your personal data',
    process: 'Contact our privacy team with specific restrictions',
    timeframe: '30 days maximum response time'
  },
  {
    right: 'Right to Object',
    description: 'Object to processing based on legitimate interests',
    process: 'Submit objection through your account or privacy team',
    timeframe: '30 days maximum response time'
  }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-6">
              <Shield className="w-12 h-12 text-primary-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-white">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Your privacy is fundamental to our mission. This comprehensive privacy policy 
              explains how we collect, use, protect, and share your personal information 
              in compliance with GDPR, CCPA, and other privacy regulations.
            </p>
            <div className="mt-8 text-sm text-gray-400">
              Last updated: December 2024 | Effective date: January 1, 2025
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Our Privacy Principles
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We are committed to protecting your privacy through transparent practices, 
              robust security measures, and respect for your privacy rights.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {privacyPrinciples.map((principle, index) => (
              <div key={index} className="glass-card p-8">
                <div className="flex items-start mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-primary-500/10 mr-4 flex-shrink-0">
                    <principle.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-white mb-3">
                      {principle.title}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {principle.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {principle.details.map((detail, detailIndex) => (
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

      {/* Data Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Data We Collect
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We collect only the data necessary to provide our financial reconciliation services. 
              All data collection is transparent, lawful, and limited to legitimate business purposes.
            </p>
          </div>

          <div className="space-y-8">
            {dataCategories.map((category, index) => (
              <div key={index} className="glass-card p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-white mb-4">
                      {category.category}
                    </h3>
                    <p className="text-gray-300 mb-6">
                      {category.description}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Purpose</h4>
                      <p className="text-gray-300">{category.purpose}</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Retention Period</h4>
                      <p className="text-gray-300">{category.retention}</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Legal Basis</h4>
                      <p className="text-gray-300">{category.legalBasis}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sharing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Data Sharing & Third Parties
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We share data only when necessary and with appropriate safeguards. 
              All data sharing is conducted under strict contractual and legal protections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dataSharing.map((category, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-xl font-heading font-bold text-white mb-4">
                  {category.category}
                </h3>
                <p className="text-gray-300 mb-6">
                  {category.description}
                </p>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Examples</h4>
                  <ul className="space-y-2">
                    {category.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="text-gray-300 text-sm">
                        • {example}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Safeguards</h4>
                  <p className="text-gray-300 text-sm">
                    {category.safeguards}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Data Protection Measures
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive security measures to protect your personal data against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {securityMeasures.map((category, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-2xl font-heading font-bold text-white mb-6">
                  {category.title}
                </h3>
                <ul className="space-y-4">
                  {category.measures.map((measure, measureIndex) => (
                    <li key={measureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Rights */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Your Privacy Rights
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              You have comprehensive rights regarding your personal data. 
              We provide easy-to-use tools and processes to exercise these rights.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {userRights.map((right, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-xl font-heading font-bold text-white mb-4">
                  {right.right}
                </h3>
                <p className="text-gray-300 mb-4">
                  {right.description}
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">How to Exercise</h4>
                    <p className="text-gray-300 text-sm">{right.process}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Response Time</h4>
                    <p className="text-gray-300 text-sm">{right.timeframe}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-heading font-bold mb-6 text-white">
              Privacy Questions or Concerns?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Our dedicated privacy team is available to address any questions about 
              your data, privacy rights, or this policy. We respond to all privacy 
              inquiries within 30 days.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Privacy Officer</h3>
                <p className="text-gray-300 mb-4">privacy@finacly.ai</p>
                <button 
                  onClick={() => window.location.href = 'mailto:privacy@finacly.ai'}
                  className="btn-primary"
                >
                  Contact Privacy Team
                </button>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Data Protection Officer</h3>
                <p className="text-gray-300 mb-4">dpo@finacly.ai</p>
                <button 
                  onClick={() => window.location.href = 'mailto:dpo@finacly.ai'}
                  className="btn-secondary"
                >
                  Contact DPO
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}