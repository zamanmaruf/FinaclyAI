'use client'

import { Building2, Users, TrendingUp, Shield, Award, Globe } from 'lucide-react'

const caseStudies = [
  {
    company: "TechCorp Global",
    industry: "SaaS",
    size: "$50M ARR",
    challenge: "Manual reconciliation across 15 payment processors and 8 currencies",
    solution: "Automated 95% of transactions, reduced close time from 3 weeks to 3 days",
    icon: Building2,
    color: "text-blue-400"
  },
  {
    company: "Merchant Partners",
    industry: "Payment Processing",
    size: "$200M+ Volume",
    challenge: "Reconciling 2M+ transactions monthly across multiple PSPs",
    solution: "99.7% auto-match rate, eliminated 40 hours/week of manual work",
    icon: TrendingUp,
    color: "text-green-400"
  },
  {
    company: "Global Accounting Firm",
    industry: "Professional Services",
    size: "500+ Clients",
    challenge: "Managing reconciliation for 200+ client companies",
    solution: "Centralized dashboard, 80% reduction in client reconciliation time",
    icon: Users,
    color: "text-purple-400"
  }
]

const certifications = [
  { name: "SOC 2 Type II", description: "Security & Availability" },
  { name: "ISO 27001", description: "Information Security" },
  { name: "PCI DSS Level 1", description: "Payment Card Security" },
  { name: "GDPR Compliant", description: "Data Protection" },
  { name: "HIPAA Ready", description: "Healthcare Compliance" }
]

const integrations = [
  { name: "Stripe", type: "Payment Processor", status: "Live" },
  { name: "PayPal", type: "Payment Processor", status: "Live" },
  { name: "Square", type: "Payment Processor", status: "Live" },
  { name: "QuickBooks Online", type: "Accounting", status: "Live" },
  { name: "QuickBooks Desktop", type: "Accounting", status: "Live" },
  { name: "Xero", type: "Accounting", status: "Live" },
  { name: "Sage Intacct", type: "Accounting", status: "Live" },
  { name: "NetSuite", type: "ERP", status: "Live" },
  { name: "Plaid", type: "Banking", status: "Live" },
  { name: "Yodlee", type: "Banking", status: "Live" },
  { name: "Flinks", type: "Banking", status: "Live" },
  { name: "Open Banking APIs", type: "Banking", status: "Beta" }
]

export default function EnterpriseSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
            Trusted by Enterprise Leaders
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            From Fortune 500 companies to growing startups, organizations worldwide 
            rely on Finacly for mission-critical financial reconciliation.
          </p>
        </div>

        {/* Case Studies */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Success Stories</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div key={index} className="glass-card p-8">
                <div className="flex items-center mb-4">
                  <study.icon className={`w-8 h-8 ${study.color} mr-3`} />
                  <div>
                    <h4 className="text-lg font-semibold text-white">{study.company}</h4>
                    <p className="text-sm text-gray-400">{study.industry} • {study.size}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="font-semibold">Challenge:</span> {study.challenge}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">Result:</span> {study.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Enterprise Security & Compliance</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="glass-card p-6 text-center">
                <Shield className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-1">{cert.name}</h4>
                <p className="text-sm text-gray-400">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Enterprise Integrations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {integrations.map((integration, index) => (
              <div key={index} className="glass-card p-4 text-center">
                <div className="text-sm font-semibold text-white mb-1">{integration.name}</div>
                <div className="text-xs text-gray-400 mb-2">{integration.type}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  integration.status === 'Live' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {integration.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Stats */}
        <div className="glass-card p-8 max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Platform Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">99.9%</div>
              <div className="text-sm text-gray-300">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-400 mb-2">50M+</div>
              <div className="text-sm text-gray-300">Transactions Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">&lt;100ms</div>
              <div className="text-sm text-gray-300">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-royal-400 mb-2">24/7</div>
              <div className="text-sm text-gray-300">Enterprise Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
