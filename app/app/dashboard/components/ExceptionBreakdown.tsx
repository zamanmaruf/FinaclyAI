'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ExceptionBreakdownProps {
  data: Array<{
    exception_type: string
    count: number
    severity: string
  }>
  loading?: boolean
}

const COLORS = {
  critical: '#EF4444',
  high: '#F97316', 
  medium: '#EAB308',
  low: '#3B82F6'
}

const SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308', 
  low: '#3B82F6'
}

export function ExceptionBreakdown({ data, loading }: ExceptionBreakdownProps) {
  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Exception Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(item => ({
    name: item.exception_type.replace('_', ' ').toUpperCase(),
    value: item.count,
    severity: item.severity
  }))

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Exception Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: SEVERITY_COLORS[item.severity as keyof typeof SEVERITY_COLORS] || '#8884d8' }}
                  />
                  <span className="text-sm text-gray-300">
                    {item.exception_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-white">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
