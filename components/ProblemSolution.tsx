'use client'

import { AlertTriangle, CheckCircle, Clock, DollarSign, Zap } from 'lucide-react'

export default function ProblemSolution() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            The <span className="gradient-text">Problem</span> Every SMB Faces
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Manual reconciliation is a monthly nightmare that costs time, money, and sanity.
          </p>
        </div>

        {/* Problem vs Solution */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Problem Side */}
          <div className="glass-card p-8 border-red-500/20">
            <div className="flex items-center mb-6">
              <div className="inline-flex p-3 rounded-xl bg-red-500/10 mr-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-red-400">
                Before Finacly AI
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">30+ Hours Monthly</h4>
                  <p className="text-gray-400">Spent on manual reconciliation across multiple systems</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Error-Prone Process</h4>
                  <p className="text-gray-400">Manual data entry leads to costly mistakes and discrepancies</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <DollarSign className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">High Opportunity Cost</h4>
                  <p className="text-gray-400">Time spent on reconciliation could be used for growth activities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Side */}
          <div className="glass-card p-8 border-primary-500/20">
            <div className="flex items-center mb-6">
              <div className="inline-flex p-3 rounded-xl bg-primary-500/10 mr-4">
                <CheckCircle className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-primary-400">
                With Finacly AI
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Zap className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">5 Minutes Daily</h4>
                  <p className="text-gray-400">Just review exceptions and approve AI-suggested matches</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">95%+ Accuracy</h4>
                  <p className="text-gray-400">AI-powered matching eliminates human errors and inconsistencies</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <DollarSign className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Focus on Growth</h4>
                  <p className="text-gray-400">Reclaim 30+ hours monthly for strategic business activities</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-400 mb-2">30+</div>
            <div className="text-gray-300">Hours Saved Monthly</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gold-400 mb-2">95%+</div>
            <div className="text-gray-300">Auto-Match Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-400 mb-2">5min</div>
            <div className="text-gray-300">Daily Review Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}