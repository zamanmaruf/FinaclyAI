'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  trend?: {
    value: number
    period: string
  }
  icon: React.ReactNode
  color: string
  onClick?: () => void
}

export function StatsCard({ title, value, trend, icon, color, onClick }: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return <Minus className="w-3 h-3" />
    if (trend.value > 0) return <TrendingUp className="w-3 h-3" />
    if (trend.value < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getTrendColor = () => {
    if (!trend) return 'text-gray-400'
    if (trend.value > 0) return 'text-green-400'
    if (trend.value < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`glass-card cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-${color}/25`}
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            {title}
          </CardTitle>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${color}/20`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">
            {value}
          </div>
          {trend && (
            <div className={`flex items-center text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(trend.value)}% {trend.period}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
