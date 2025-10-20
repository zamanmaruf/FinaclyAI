'use client'

import { useState, useEffect } from 'react'
import Countdown from './Countdown'

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Target date: December 1, 2025 00:00:00 America/Halifax
  const targetDate = new Date('2025-12-01T00:00:00-04:00') // Halifax timezone offset
  
  const handleCountdownComplete = () => {
    // Switch to "Public Beta now open" message
  }

  if (!isVisible) return null

  return (
    <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Desktop layout */}
        <div className="hidden md:flex items-center justify-between py-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-amber-800">
              Launching December 1, 2025 • Founding discount ends Nov 30
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Countdown 
              targetDate={targetDate}
              onComplete={handleCountdownComplete}
              className="text-sm"
            />
            
            <button
              onClick={() => setIsVisible(false)}
              className="text-amber-600 hover:text-amber-800 transition-colors"
              aria-label="Close announcement"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-amber-800 truncate">
                Launching Dec 1, 2025 • Discount ends Nov 30
              </div>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="text-amber-600 hover:text-amber-800 transition-colors ml-2 flex-shrink-0"
              aria-label="Close announcement"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-center pb-2">
            <Countdown 
              targetDate={targetDate}
              onComplete={handleCountdownComplete}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
