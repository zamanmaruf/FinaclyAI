'use client'

import { 
  Target, 
  Users, 
  Zap, 
  Shield,
  ArrowRight,
  Clock,
  Globe,
  Brain,
  CheckCircle,
  TrendingUp
} from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'Eliminating the reconciliation nightmare for SMBs through AI-powered automation',
    details: 'We believe every business deserves enterprise-grade financial automation without the complexity or cost.'
  },
  {
    icon: Zap,
    title: 'Innovation First',
    description: 'Leveraging cutting-edge AI and machine learning for financial operations',
    details: 'Built with the latest technology to deliver 95%+ auto-match rates and real-time processing.'
  },
  {
    icon: Users,
    title: 'Customer-Centric',
    description: 'Built by accountants, for accountants and business owners',
    details: 'We understand your pain points because we\'ve lived them. Every feature is designed to solve real problems.'
  },
  {
    icon: Shield,
    title: 'Security & Trust',
    description: 'Bank-grade security with SOC 2 compliance and enterprise standards',
    details: 'Your financial data is protected with the highest security standards and complete transparency.'
  }
]

const milestones = [
  {
    year: '2025',
    title: 'Finacly AI Founded',
    description: 'Started with a vision to eliminate manual reconciliation for SMBs'
  },
  {
    year: 'Q4 2025',
    title: 'MVP Development',
    description: 'Built core AI matching engine with Stripe and QuickBooks integration'
  },
  {
    year: 'Q1 2026',
    title: 'Beta Launch',
    description: 'Early access program with 200+ businesses signed up'
  },
  {
    year: '2026',
    title: 'Open Banking Ready',
    description: 'Full Open Banking API integration for Canadian market'
  }
]

const team = [
  {
    name: 'Founding Team',
    role: 'AI & Finance Experts',
    description: 'Combined 20+ years in fintech, accounting, and AI development'
  },
  {
    name: 'Advisory Board',
    role: 'Industry Veterans',
    description: 'Former executives from major fintech and accounting companies'
  },
  {
    name: 'Development Team',
    role: 'Full-Stack Engineers',
    description: 'Experienced developers specializing in AI and financial systems'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              About <span className="gradient-text">Finacly AI</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to revolutionize financial reconciliation for small and medium businesses 
              through AI-powered automation, built for the future of finance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Our <span className="gradient-text">Mission</span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              To eliminate the manual reconciliation nightmare that plagues SMBs worldwide. 
              We believe every business deserves enterprise-grade financial automation without 
              the complexity, cost, or technical barriers.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Our <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do at Finacly AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={value.title} className="glass-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="inline-flex p-3 rounded-xl bg-primary-500/10 flex-shrink-0">
                    <value.icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-semibold text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-primary-400 font-medium mb-3">
                      {value.description}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      {value.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Our <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From vision to reality, building the future of financial reconciliation.
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="flex-1">
                  <div className="glass-card p-8">
                    <div className="flex items-center mb-4">
                      <div className="w-4 h-4 bg-primary-400 rounded-full mr-4"></div>
                      <span className="text-primary-400 font-bold text-lg">
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-white mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-8 h-8 bg-primary-400 rounded-full mx-8 flex-shrink-0"></div>
                <div className="hidden md:block flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Our <span className="gradient-text">Team</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experienced professionals from fintech, accounting, and AI backgrounds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={member.name} className="glass-card p-8 text-center">
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-400 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-300">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Our <span className="gradient-text">Vision</span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto mb-8">
              To become the global standard for AI-powered financial reconciliation, 
              empowering every business with enterprise-grade automation and insights.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-4">
                  <Globe className="w-8 h-8 text-primary-400" />
                </div>
                <h4 className="text-lg font-heading font-semibold text-white mb-2">
                  Global Impact
                </h4>
                <p className="text-gray-300 text-sm">
                  Serving businesses worldwide with localized solutions
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-gold-500/10 mb-4">
                  <Brain className="w-8 h-8 text-gold-400" />
                </div>
                <h4 className="text-lg font-heading font-semibold text-white mb-2">
                  AI Innovation
                </h4>
                <p className="text-gray-300 text-sm">
                  Leading the industry in AI-powered financial automation
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary-500/10 mb-4">
                  <TrendingUp className="w-8 h-8 text-primary-400" />
                </div>
                <h4 className="text-lg font-heading font-semibold text-white mb-2">
                  Continuous Growth
                </h4>
                <p className="text-gray-300 text-sm">
                  Evolving with the changing landscape of finance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-heading font-bold mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Be part of the future of financial reconciliation. 
              Start your free trial and experience the difference AI can make.
            </p>
            <button 
              onClick={() => {
                window.location.href = '/#signup-form'
              }}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}