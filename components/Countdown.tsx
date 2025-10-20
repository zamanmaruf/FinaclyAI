'use client'

import { useState, useEffect } from 'react'

interface CountdownProps {
  targetDate: Date
  onComplete?: () => void
  className?: string
}

export default function Countdown({ targetDate, onComplete, className = '' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsComplete(true)
        onComplete?.()
      }
    }

    const timer = setInterval(calculateTimeLeft, 1000)
    
    // Calculate immediately
    calculateTimeLeft()

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (isComplete) {
    return (
      <div className={`tabular-nums ${className}`}>
        <span className="text-amber-500 font-bold">Public Beta Now Open!</span>
      </div>
    )
  }

  return (
    <div className={`tabular-nums ${className}`}>
      <div className="flex items-center gap-1 text-sm">
        <span className="font-bold text-amber-800">
          {timeLeft.days.toString().padStart(2, '0')}:
        </span>
        <span className="font-bold text-amber-800">
          {timeLeft.hours.toString().padStart(2, '0')}:
        </span>
        <span className="font-bold text-amber-800">
          {timeLeft.minutes.toString().padStart(2, '0')}:
        </span>
        <span className="font-bold text-amber-800">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
