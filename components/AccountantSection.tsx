'use client'

import { Users, BarChart3, FileText, Zap, ArrowRight } from 'lucide-react'
import { analytics } from '@/lib/analytics'

export default function AccountantSection() {
  const features = [
    {
      icon: Users,
      title: 'Multi-Client Workspace',
      description: 'Switch between client companies seamlessly with shared mappings and templates'
    },
    {
      icon: BarChart3,
      title: 'Batch Processing',
      description: 'Process multiple client reconciliations simultaneously with bulk actions'
    },
    {
      icon: FileText,
      title: 'Audit-Ready Exports',
      description: 'Generate comprehensive audit trails and reports your clients will love'
    },
    {
      icon: Zap,
      title: 'Standardized Workflows',
      description: 'Create posting templates and rules that work across all your clients'
    }
  ]

  const handleAccountantProgramClick = () => {
    analytics.clickAccountantProgram()
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            For Accounting Firms
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Run 50 client reconciliations like it's five. Multi-client workspace, 
            standard posting templates, and exports your auditors will actually like.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex p-4 bg-royal-500/20 rounded-2xl mb-4">
                <feature.icon className="w-8 h-8 text-royal-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Join the Accountant Partner Program
              </h3>
              <p className="text-slate-300 mb-6">
                Get early access, special pricing, and dedicated support for your firm. 
                Help shape the product and get priority access to new features.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-mint-500 rounded-full mr-3"></div>
                  Partner pricing (up to 60% off)
                </li>
                <li className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-mint-500 rounded-full mr-3"></div>
                  Dedicated success manager
                </li>
                <li className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-mint-500 rounded-full mr-3"></div>
                  White-label options
                </li>
                <li className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-mint-500 rounded-full mr-3"></div>
                  Priority feature requests
                </li>
              </ul>

              <button
                onClick={handleAccountantProgramClick}
                className="bg-royal-500 hover:bg-royal-600 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 flex items-center group"
              >
                Join Partner Program
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="bg-white/10 rounded-xl p-6">
              <h4 className="font-semibold mb-4">Partner Benefits</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Standard Pricing</span>
                  <span className="text-slate-400 line-through">$399/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Partner Pricing</span>
                  <span className="text-mint-400 font-semibold">$159/mo</span>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">You Save</span>
                    <span className="text-mint-400 font-semibold">$240/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
