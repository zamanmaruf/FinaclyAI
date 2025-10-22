'use client'

import { 
  Zap, 
  Shield, 
  DollarSign, 
  BarChart3, 
  Globe, 
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Exception Management',
    description: 'Machine learning algorithms automatically categorize and prioritize reconciliation exceptions with 95%+ accuracy. Intelligent confidence scoring helps your team focus on high-impact discrepancies first.',
    color: 'text-royal-500',
    bgColor: 'bg-royal-100'
  },
  {
    icon: CheckCircle,
    title: 'Enterprise QuickBooks Integration',
    description: 'Seamless two-way sync with QuickBooks Online and Desktop. Automated journal entry creation with full audit trails, approval workflows, and rollback capabilities for enterprise compliance.',
    color: 'text-mint-500',
    bgColor: 'bg-mint-100'
  },
  {
    icon: Shield,
    title: 'SOC 2 Type II Compliance',
    description: 'Bank-grade security with end-to-end encryption, role-based access controls, and immutable audit logs. Full compliance reporting and automated backup systems for enterprise peace of mind.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100'
  },
  {
    icon: DollarSign,
    title: 'Advanced Multi-Currency Engine',
    description: 'Real-time FX rate integration with 150+ currencies. Automated currency conversion with configurable rate sources, hedging strategies, and comprehensive FX impact reporting for global enterprises.',
    color: 'text-royal-500',
    bgColor: 'bg-royal-100'
  },
  {
    icon: BarChart3,
    title: 'Enterprise Workspace Management',
    description: 'Multi-entity support for accounting firms and holding companies. Centralized dashboard with entity switching, shared templates, bulk operations, and client-specific reconciliation rules.',
    color: 'text-mint-500',
    bgColor: 'bg-mint-100'
  },
  {
    icon: Globe,
    title: 'Enterprise Monitoring & Analytics',
    description: 'Real-time system health monitoring with custom alerts, performance analytics, and predictive insights. Advanced reporting suite with executive dashboards and automated compliance reports.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100'
  }
]

export default function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-emerald-950/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Enterprise-Grade Financial Technology
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Built for Fortune 500 companies, accounting firms, and financial institutions. 
            Our platform handles millions of transactions with bank-grade security, 
            regulatory compliance, and enterprise-scale performance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={feature.title} className="glass-card p-8 hover:scale-105 transition-all duration-300">
              <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-heading font-semibold mb-4 text-white">
                {feature.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Strip */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-bold mb-6 text-white">
              Ready to Transform Your Reconciliation?
            </h3>
            <p className="text-gray-300 mb-8">
              Join the early access program and be among the first to experience 
              payout-aware reconciliation.
            </p>
            <a 
              href="#early-access"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center group"
            >
              Get Early Access
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}