'use client'

import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Database,
  Globe,
  FileText,
  Award,
  Clock,
  Zap
} from 'lucide-react'

const securityFeatures = [
  {
    icon: Shield,
    title: 'SOC 2 Type II Compliance',
    description: 'Annual third-party audits ensure our security controls meet the highest industry standards for availability, confidentiality, and processing integrity.',
    details: [
      'Annual SOC 2 Type II audits by independent certified public accountants',
      'Comprehensive security control testing and validation',
      'Detailed audit reports available to enterprise customers',
      'Continuous monitoring and improvement of security posture'
    ]
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption with FIPS 140-2 Level 3 certified hardware security modules.',
    details: [
      'AES-256 encryption for data at rest',
      'TLS 1.3 for all data in transit',
      'FIPS 140-2 Level 3 certified HSMs for key management',
      'Perfect Forward Secrecy (PFS) for all connections',
      'Encrypted database backups with separate encryption keys'
    ]
  },
  {
    icon: Users,
    title: 'Identity & Access Management',
    description: 'Enterprise-grade identity management with multi-factor authentication, role-based access controls, and single sign-on integration.',
    details: [
      'Multi-factor authentication (MFA) enforcement',
      'Role-based access control (RBAC) with granular permissions',
      'Single Sign-On (SSO) integration with SAML 2.0 and OAuth 2.0',
      'Just-in-time (JIT) access provisioning',
      'Privileged access management (PAM) for administrative functions'
    ]
  },
  {
    icon: Database,
    title: 'Data Protection & Privacy',
    description: 'Comprehensive data protection measures including data classification, retention policies, and privacy-by-design architecture.',
    details: [
      'Data classification and labeling system',
      'Automated data discovery and classification',
      'Data retention and deletion policies',
      'Privacy-by-design architecture',
      'Right to be forgotten implementation',
      'Data minimization principles'
    ]
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    description: 'Secure cloud infrastructure with network segmentation, intrusion detection, and comprehensive monitoring.',
    details: [
      'AWS/Azure/GCP with enterprise security configurations',
      'Network segmentation and micro-segmentation',
      'Intrusion detection and prevention systems (IDS/IPS)',
      'Web Application Firewall (WAF) protection',
      'DDoS mitigation and traffic filtering',
      'Secure API gateway with rate limiting'
    ]
  },
  {
    icon: Eye,
    title: 'Security Monitoring & Incident Response',
    description: '24/7 security operations center with real-time threat detection, automated response, and comprehensive incident management.',
    details: [
      '24/7 Security Operations Center (SOC)',
      'Security Information and Event Management (SIEM)',
      'Automated threat detection and response',
      'Incident response playbooks and procedures',
      'Forensic analysis capabilities',
      'Regular penetration testing and vulnerability assessments'
    ]
  }
]

const complianceStandards = [
  {
    name: 'SOC 2 Type II',
    description: 'Security, Availability, and Confidentiality',
    status: 'Certified',
    icon: Award,
    details: 'Annual third-party audits of our security controls, availability, and confidentiality practices.'
  },
  {
    name: 'ISO 27001',
    description: 'Information Security Management System',
    status: 'Certified',
    icon: Award,
    details: 'International standard for information security management systems with comprehensive risk management.'
  },
  {
    name: 'PCI DSS Level 1',
    description: 'Payment Card Industry Data Security',
    status: 'Certified',
    icon: Award,
    details: 'Highest level of PCI compliance for organizations processing over 6 million transactions annually.'
  },
  {
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    status: 'Compliant',
    icon: FileText,
    details: 'Full compliance with EU data protection regulations including data subject rights and privacy by design.'
  },
  {
    name: 'CCPA',
    description: 'California Consumer Privacy Act',
    status: 'Compliant',
    icon: FileText,
    details: 'Compliance with California privacy laws including consumer rights and data transparency requirements.'
  },
  {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability',
    status: 'Ready',
    icon: Shield,
    details: 'Infrastructure and controls ready for healthcare data processing with business associate agreements.'
  }
]

const securityMeasures = [
  {
    category: 'Physical Security',
    measures: [
      'Data centers with 24/7 security personnel',
      'Biometric access controls and multi-factor authentication',
      'Video surveillance and access logging',
      'Environmental controls and fire suppression systems',
      'Redundant power and cooling systems'
    ]
  },
  {
    category: 'Network Security',
    measures: [
      'Zero-trust network architecture',
      'Network segmentation and micro-segmentation',
      'Intrusion detection and prevention systems',
      'Distributed denial-of-service (DDoS) protection',
      'Secure VPN access for remote workers'
    ]
  },
  {
    category: 'Application Security',
    measures: [
      'Secure software development lifecycle (SDLC)',
      'Automated security testing in CI/CD pipelines',
      'Static and dynamic application security testing',
      'Dependency vulnerability scanning',
      'Regular security code reviews'
    ]
  },
  {
    category: 'Data Security',
    measures: [
      'Data encryption at rest and in transit',
      'Database encryption with separate keys',
      'Secure key management and rotation',
      'Data loss prevention (DLP) systems',
      'Secure data disposal and destruction'
    ]
  }
]

export default function SecurityPage() {
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
              Enterprise <span className="gradient-text">Security</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Bank-grade security infrastructure protecting your most sensitive financial data. 
              Our comprehensive security framework ensures the highest levels of protection, 
              compliance, and trust for enterprise customers.
            </p>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Comprehensive Security Framework
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Multi-layered security approach protecting every aspect of your financial data 
              with enterprise-grade controls and continuous monitoring.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="glass-card p-8">
                <div className="flex items-start mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-primary-500/10 mr-4 flex-shrink-0">
                    <feature.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {feature.details.map((detail, detailIndex) => (
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

      {/* Compliance Standards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Compliance & Certifications
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Rigorous compliance with international security standards and regulations 
              to ensure your data meets the highest security requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="glass-card p-8 text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-6">
                  <standard.icon className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  {standard.name}
                </h3>
                <p className="text-gray-400 mb-4">{standard.description}</p>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  standard.status === 'Certified' 
                    ? 'bg-green-100 text-green-800' 
                    : standard.status === 'Compliant'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {standard.status}
                </div>
                <p className="text-gray-300 text-sm">
                  {standard.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Security Measures & Controls
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive security controls across all layers of our infrastructure 
              to protect against evolving threats and ensure data integrity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {securityMeasures.map((category, index) => (
              <div key={index} className="glass-card p-8">
                <h3 className="text-2xl font-heading font-bold text-white mb-6">
                  {category.category}
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

      {/* Security Metrics */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
              Security Performance Metrics
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time security metrics demonstrating our commitment to protecting 
              your data with industry-leading security performance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="glass-card p-8 text-center">
              <div className="text-4xl font-bold text-primary-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime SLA</div>
            </div>
            <div className="glass-card p-8 text-center">
              <div className="text-4xl font-bold text-mint-400 mb-2">&lt;1min</div>
              <div className="text-gray-300">Mean Time to Detection</div>
            </div>
            <div className="glass-card p-8 text-center">
              <div className="text-4xl font-bold text-amber-400 mb-2">&lt;15min</div>
              <div className="text-gray-300">Mean Time to Response</div>
            </div>
            <div className="glass-card p-8 text-center">
              <div className="text-4xl font-bold text-royal-400 mb-2">Zero</div>
              <div className="text-gray-300">Security Breaches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Security Team */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-heading font-bold mb-6 text-white">
              Security Questions or Concerns?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Our dedicated security team is available 24/7 to address any security 
              questions or concerns. Contact us for security audits, compliance reports, 
              or custom security requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/contact'}
                className="btn-primary text-lg px-8 py-4"
              >
                Contact Security Team
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:security@finacly.ai'}
                className="btn-secondary text-lg px-8 py-4"
              >
                security@finacly.ai
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
