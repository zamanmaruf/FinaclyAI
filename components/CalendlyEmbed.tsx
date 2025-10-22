'use client'

import { useEffect, useRef } from 'react'
// import { analytics } from '@/lib/analytics'

interface CalendlyEmbedProps {
  url: string
  className?: string
}

export default function CalendlyEmbed({ url, className = '' }: CalendlyEmbedProps) {
  const calendlyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    
    // Track when Calendly loads
    script.onload = () => {
      // analytics.clickBookFitCall()
    }
    
    document.head.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const handleCalendlyClick = () => {
    // analytics.clickBookFitCall()
  }

  return (
    <div className={className}>
      <div 
        ref={calendlyRef}
        className="calendly-inline-widget"
        data-url={url}
        style={{ minWidth: '320px', height: '700px' }}
        onClick={handleCalendlyClick}
      />
    </div>
  )
}

// Alternative button component for Calendly link
export function CalendlyButton({ url, children, className = '' }: { 
  url: string
  children: React.ReactNode
  className?: string 
}) {
  const handleClick = () => {
    // analytics.clickBookFitCall()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className={`btn-secondary ${className}`}
    >
      {children}
    </button>
  )
}
