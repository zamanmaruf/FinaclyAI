'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { ExceptionsTable } from './components/ExceptionsTable'
import toast from 'react-hot-toast'

interface Exception {
  id: number
  exception_type: string
  severity: string
  description: string
  suggested_action: string
  related_stripe_id?: string
  related_bank_id?: string
  related_qbo_id?: string
  status: string
  created_at: string
  resolved_at?: string
}

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<Exception[]>([])
  const [loading, setLoading] = useState(true)
  const [fixing, setFixing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExceptions()
  }, [])

  const loadExceptions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/app/exceptions?companyId=1')
      const result = await response.json()

      if (result.success) {
        setExceptions(result.data)
        toast.success(`Loaded ${result.data.length} exceptions`)
      } else {
        setError(result.error || 'Failed to load exceptions')
        toast.error('Failed to load exceptions')
      }
    } catch (error) {
      console.error('Error loading exceptions:', error)
      setError('Failed to load exceptions')
      toast.error('Failed to load exceptions')
    } finally {
      setLoading(false)
    }
  }

  const fixException = async (exceptionId: number) => {
    try {
      setFixing(exceptionId)
      setError(null)
      toast.loading('Fixing exception...')

      const response = await fetch('/api/app/exceptions/fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exceptionId,
          fixType: 'create_qbo_entry'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Exception fixed successfully!')
        // Reload exceptions to show updated status
        await loadExceptions()
      } else {
        setError(result.error || 'Failed to fix exception')
        toast.error(`Failed to fix exception: ${result.error}`)
      }
    } catch (error) {
      console.error('Error fixing exception:', error)
      setError('Failed to fix exception')
      toast.error('Failed to fix exception')
    } finally {
      setFixing(null)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
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
          <h1 className="text-3xl font-bold text-white">Exceptions</h1>
          <p className="mt-2 text-gray-300">
            Review and resolve unmatched transactions
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {exceptions.length} exception{exceptions.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadExceptions}
            disabled={loading}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 bg-red-500/10 border-red-500/20"
        >
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2 w-5 h-5" />
            <span className="text-red-300">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {exceptions.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-12 text-center"
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold text-white mb-2">No Exceptions Found</h3>
          <p className="text-gray-400 mb-6">
            All your transactions are reconciled! Great job!
          </p>
          <Button
            onClick={loadExceptions}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Again
          </Button>
        </motion.div>
      ) : (
        /* Exceptions Table */
        <ExceptionsTable
          data={exceptions}
          onFix={fixException}
          fixing={fixing}
          onRefresh={loadExceptions}
        />
      )}
    </div>
  )
}