'use client'

import { Shield, Lock, Eye, FileText, Globe, CheckCircle } from 'lucide-react'

export default function SecuritySection() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Encryption at Rest',
      description: 'AES-256-GCM encryption with KMS envelope encryption for all sensitive data'
    },
    {
      icon: Shield,
      title: 'PIPEDA Compliant',
      description: 'Canadian privacy law compliance with data residency options available'
    },
    {
      icon: Eye,
      title: 'Role-Based Access',
      description: 'Granular permissions and access controls for team members'
    },
    {
      icon: FileText,
      title: 'Immutable Audit Log',
      description: 'Every action is logged with cryptographic integrity verification'
    },
    {
      icon: Globe,
      title: 'Data Residency',
      description: 'Canadian data centers with options for other regions'
    },
    {
      icon: CheckCircle,
      title: 'SOC 2 Roadmap',
      description: 'SOC 2 Type I/II certification in progress for enterprise customers'
    }
  ]

  const trustBadges = [
    { name: 'SOC 2 Type I', status: 'In Progress', color: 'amber' },
    { name: 'PIPEDA Compliant', status: 'Certified', color: 'mint' },
    { name: 'AES-256 Encryption', status: 'Active', color: 'mint' },
    { name: 'Canadian Data Centers', status: 'Active', color: 'mint' }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-teal-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Security & Compliance
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your financial data is protected with enterprise-grade security, 
            compliance standards, and transparent audit trails.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="glass-card p-6">
              <div className="flex items-start">
                <div className="p-3 bg-green-500/10 rounded-xl mr-4">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Trust & Compliance
            </h3>
            <p className="text-gray-300">
              We're committed to maintaining the highest security standards 
              and regulatory compliance for your peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-3 ${
                  badge.color === 'mint' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {badge.status}
                </div>
                <div className="font-medium text-white">{badge.name}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/20">
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Questions about our security practices?
              </p>
              <a 
                href="/security" 
                className="text-green-400 hover:text-green-300 font-medium transition-colors"
              >
                View our Security page →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
