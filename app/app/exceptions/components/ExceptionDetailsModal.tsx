'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { X, Calendar, DollarSign, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
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

interface ExceptionDetailsModalProps {
  exception: Exception | null
  isOpen: boolean
  onClose: () => void
  onFix: (id: number) => void
  fixing: boolean
}

export function ExceptionDetailsModal({ 
  exception, 
  isOpen, 
  onClose, 
  onFix, 
  fixing 
}: ExceptionDetailsModalProps) {
  if (!exception) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500 text-white'
      case 'resolved':
        return 'bg-green-500 text-white'
      case 'in_progress':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const handleFix = async () => {
    try {
      await onFix(exception.id)
      toast.success('Exception fixed successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to fix exception')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              Exception Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Exception ID</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white font-mono text-lg">#{exception.id}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getSeverityColor(exception.severity)}>
                  {exception.severity.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(exception.status)}>
                  {exception.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{exception.description}</p>
            </CardContent>
          </Card>

          {/* Suggested Action */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Suggested Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{exception.suggested_action}</p>
            </CardContent>
          </Card>

          {/* Related Transactions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Related Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exception.related_stripe_id && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Stripe Charge</p>
                        <p className="text-gray-400 text-sm">{exception.related_stripe_id}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                )}

                {exception.related_bank_id && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Bank Transaction</p>
                        <p className="text-gray-400 text-sm">{exception.related_bank_id}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                )}

                {exception.related_qbo_id && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">QuickBooks Transaction</p>
                        <p className="text-gray-400 text-sm">{exception.related_qbo_id}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                )}

                {!exception.related_stripe_id && !exception.related_bank_id && !exception.related_qbo_id && (
                  <p className="text-gray-400 text-center py-4">No related transactions found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Created</span>
                  <span className="text-white">
                    {new Date(exception.created_at).toLocaleString()}
                  </span>
                </div>
                {exception.resolved_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Resolved</span>
                    <span className="text-white">
                      {new Date(exception.resolved_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {exception.status === 'open' && (
              <Button
                onClick={handleFix}
                disabled={fixing}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                {fixing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Fixing...
                  </>
                ) : (
                  'Fix Exception'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
