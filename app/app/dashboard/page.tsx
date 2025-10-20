'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, AlertTriangle, BarChart3, Clock, TrendingUp, RefreshCw } from 'lucide-react'
import { StatsCard } from './components/StatsCard'
import { MatchRateChart } from './components/MatchRateChart'
import { ExceptionBreakdown } from './components/ExceptionBreakdown'
import { TransactionVolumeChart } from './components/TransactionVolumeChart'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalMatches: number
  openExceptions: number
  lastSyncDate: string | null
  matchRate: number
}

interface RecentMatch {
  id: string
  type: string
  amount: number
  currency: string
  date: string
  confidence: number
}

interface ChartData {
  matchRateTrend: Array<{
    date: string
    matches: number
    match_rate: number
  }>
  exceptionBreakdown: Array<{
    exception_type: string
    count: number
    severity: string
  }>
  transactionVolume: Array<{
    date: string
    stripe: number
    bank: number
    quickbooks: number
    total: number
  }>
  syncHistory: Array<{
    service: string
    status: string
    created_at: string
    records_processed: number
    error_message?: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMatches: 0,
    openExceptions: 0,
    lastSyncDate: null,
    matchRate: 0
  })
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadDashboardData()
    loadChartData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData()
      loadChartData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Fetch real dashboard data from API
      const response = await fetch('/api/app/dashboard/stats?companyId=1')
      const result = await response.json()

      if (result.success) {
        setStats({
          totalMatches: result.data.totalMatches,
          openExceptions: result.data.openExceptions,
          lastSyncDate: result.data.lastSyncDate,
          matchRate: result.data.matchRate
        })
        
        setRecentMatches(result.data.recentMatches)
        setLastUpdated(new Date())
      } else {
        console.error('Error fetching dashboard stats:', result.error)
        toast.error('Failed to load dashboard data')
        // Set empty state on error
        setStats({
          totalMatches: 0,
          openExceptions: 0,
          lastSyncDate: null,
          matchRate: 0
        })
        setRecentMatches([])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
      // Set empty state on error
      setStats({
        totalMatches: 0,
        openExceptions: 0,
        lastSyncDate: null,
        matchRate: 0
      })
      setRecentMatches([])
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    try {
      setChartsLoading(true)
      const response = await fetch('/api/app/dashboard/charts?companyId=1')
      const result = await response.json()

      if (result.success) {
        setChartData(result.data)
      } else {
        console.error('Error fetching chart data:', result.error)
        toast.error('Failed to load chart data')
      }
    } catch (error) {
      console.error('Error loading chart data:', error)
      toast.error('Failed to load chart data')
    } finally {
      setChartsLoading(false)
    }
  }

  const syncService = async (service: string) => {
    try {
      setSyncing(service)
      toast.loading(`Syncing ${service}...`)
      
      const response = await fetch(`/api/app/${service}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: 1 })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`${service} synced successfully!`)
        // Reload dashboard data after successful sync
        await loadDashboardData()
        await loadChartData()
      } else {
        toast.error(`Failed to sync ${service}: ${result.error}`)
      }
    } catch (error) {
      console.error(`Error syncing ${service}:`, error)
      toast.error(`Failed to sync ${service}`)
    } finally {
      setSyncing(null)
    }
  }

  const runReconciliation = async () => {
    try {
      setSyncing('reconcile')
      toast.loading('Running reconciliation...')
      
      const response = await fetch('/api/app/reconcile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: 1 })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Reconciliation completed! Found ${result.data?.matchesFound || 0} matches and ${result.data?.exceptionsFound || 0} exceptions.`)
        // Reload dashboard data after successful reconciliation
        await loadDashboardData()
        await loadChartData()
      } else {
        toast.error(`Reconciliation failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error running reconciliation:', error)
      toast.error('Reconciliation failed')
    } finally {
      setSyncing(null)
    }
  }

  const runSync = async () => {
    try {
      setSyncing('all')
      toast.loading('Syncing all services...')

      // Sync all services
      const syncPromises = []

      // Sync Stripe
      syncPromises.push(
        fetch('/api/app/stripe/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: 1,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          })
        })
      )

      // Sync QuickBooks
      syncPromises.push(
        fetch('/api/app/quickbooks/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: 1,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          })
        })
      )

      // Sync Plaid
      syncPromises.push(
        fetch('/api/app/plaid/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: 1
          })
        })
      )

      const responses = await Promise.all(syncPromises)
      const results = await Promise.all(responses.map(r => r.json()))

      let successCount = 0
      let totalTransactions = 0
      let errors: string[] = []

      results.forEach((result, index) => {
        const service = ['Stripe', 'QuickBooks', 'Plaid'][index]
        if (result.success) {
          successCount++
          if (result.data) {
            if (result.data.chargesCount && result.data.payoutsCount) {
              totalTransactions += result.data.chargesCount + result.data.payoutsCount
            } else if (result.data.transactionsCount) {
              totalTransactions += result.data.transactionsCount
            } else if (result.data.paymentsCount || result.data.depositsCount || result.data.invoicesCount || result.data.salesReceiptsCount) {
              totalTransactions += (result.data.paymentsCount || 0) + (result.data.depositsCount || 0) + (result.data.invoicesCount || 0) + (result.data.salesReceiptsCount || 0)
            }
          }
        } else {
          errors.push(`${service}: ${result.error}`)
        }
      })

      if (successCount === results.length) {
        toast.success(`Sync completed successfully! Processed ${totalTransactions} transactions across all services.`)
      } else {
        toast.error(`Sync completed with some issues. ${successCount}/${results.length} services synced successfully.`)
      }

      // Refresh dashboard data
      await loadDashboardData()
      await loadChartData()
    } catch (error) {
      console.error('Error running sync:', error)
      toast.error('Error running sync. Please try again.')
    } finally {
      setSyncing(null)
    }
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-300">
            Overview of your financial reconciliation status
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={runSync}
            disabled={syncing === 'all'}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            {syncing === 'all' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All Services
              </>
            )}
          </Button>
          <Button
            onClick={runReconciliation}
            disabled={syncing === 'reconcile'}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {syncing === 'reconcile' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Reconciling...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Run Reconciliation
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Matches"
          value={stats.totalMatches}
          trend={{ value: 12, period: "vs last week" }}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          color="green"
        />
        <StatsCard
          title="Open Exceptions"
          value={stats.openExceptions}
          trend={{ value: -5, period: "vs last week" }}
          icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
          color="yellow"
        />
        <StatsCard
          title="Match Rate"
          value={`${stats.matchRate}%`}
          trend={{ value: 8, period: "vs last week" }}
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
          color="blue"
        />
        <StatsCard
          title="Last Sync"
          value={stats.lastSyncDate ? new Date(stats.lastSyncDate).toLocaleDateString() : 'Never'}
          icon={<Clock className="w-5 h-5 text-purple-500" />}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MatchRateChart 
          data={chartData?.matchRateTrend || []} 
          loading={chartsLoading}
        />
        <ExceptionBreakdown 
          data={chartData?.exceptionBreakdown || []} 
          loading={chartsLoading}
        />
      </div>

      {/* Transaction Volume Chart */}
      <TransactionVolumeChart 
        data={chartData?.transactionVolume || []} 
        loading={chartsLoading}
      />

      {/* Recent Matches */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Recent Matches</CardTitle>
            <a
              href="/app/exceptions"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              View All
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {recentMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No recent matches found</p>
              <p className="text-sm">Run reconciliation to find matches</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <motion.div 
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{match.type}</p>
                    <p className="text-sm text-gray-300">
                      {match.currency} {match.amount.toFixed(2)} • {new Date(match.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-green-400 bg-green-400/20">
                      {match.confidence}% confidence
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              asChild
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <a href="/app/connections">
                Manage Connections
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <a href="/app/exceptions">
                Review Exceptions
              </a>
            </Button>
            <Button
              onClick={runSync}
              disabled={syncing === 'all'}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              {syncing === 'all' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync All Services'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
