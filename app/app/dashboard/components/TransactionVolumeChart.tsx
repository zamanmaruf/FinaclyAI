'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TransactionVolumeChartProps {
  data: Array<{
    date: string
    stripe: number
    bank: number
    quickbooks: number
    total: number
  }>
  loading?: boolean
}

export function TransactionVolumeChart({ data, loading }: TransactionVolumeChartProps) {
  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Transaction Volume (7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Bar dataKey="stripe" stackId="a" fill="#635BFF" name="Stripe" />
            <Bar dataKey="bank" stackId="a" fill="#00D9FF" name="Bank" />
            <Bar dataKey="quickbooks" stackId="a" fill="#2E7D32" name="QuickBooks" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
