'use client'

import { AlertTriangle, CheckCircle, Clock, DollarSign, Zap, FileText, Users } from 'lucide-react'

export default function ProblemSolution() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-teal-950/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Month-end shouldn't be a triathlon.
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your team chases Stripe/PayPal reports, bank deposits, and QuickBooks entries across tabs and spreadsheets. 
            Batch payouts, fees, multi-currency, and timing differences make it worse. Errors slip through; close gets delayed.
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
                The Problem
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Payouts that don't match deposits</h4>
                  <p className="text-gray-400">Manual reconciliation across multiple systems leads to mismatches</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Deposits missing in QuickBooks</h4>
                  <p className="text-gray-400">Bank deposits not properly recorded in your accounting system</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Manual fee splits and duplicate entries</h4>
                  <p className="text-gray-400">Time-consuming manual work that's prone to errors</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">No single audit trail</h4>
                  <p className="text-gray-400">Scattered records make compliance and auditing difficult</p>
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
                The Solution
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Zap className="w-5 h-5 text-mint-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">A reconciliation engine that thinks in payouts</h4>
                  <p className="text-gray-400">Finacly ingests PSP data, bank feeds, and QuickBooks records to match payouts ↔ deposits</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">One-click fixes with evidence</h4>
                  <p className="text-gray-400">Proposes idempotent fixes and records every step in an audit trail</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Built for accountants and controllers</h4>
                  <p className="text-gray-400">Designed for professionals managing many entities</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Diagram */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-2xl p-6 shadow-md border border-slate-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-royal-100 rounded-xl flex items-center justify-center mb-2">
                <span className="text-royal-600 font-bold">PSP</span>
              </div>
              <div className="text-sm text-slate-600">Stripe/PayPal</div>
            </div>
            
            <div className="text-royal-500 text-2xl">→</div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-mint-100 rounded-xl flex items-center justify-center mb-2">
                <span className="text-mint-600 font-bold">Match</span>
              </div>
              <div className="text-sm text-slate-600">Finacly</div>
            </div>
            
            <div className="text-royal-500 text-2xl">→</div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                <span className="text-amber-600 font-bold">Bank</span>
              </div>
              <div className="text-sm text-slate-600">Deposits</div>
            </div>
            
            <div className="text-royal-500 text-2xl">→</div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                <span className="text-slate-600 font-bold">Fix</span>
              </div>
              <div className="text-sm text-slate-600">QuickBooks</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}