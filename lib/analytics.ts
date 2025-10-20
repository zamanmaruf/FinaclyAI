// Analytics event tracking helpers for launch landing page

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: number
}

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer?: string
}

// Extract UTM parameters from URL
export function extractUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {}
  
  const urlParams = new URLSearchParams(window.location.search)
  const referrer = document.referrer || ''
  
  return {
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_term: urlParams.get('utm_term') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,
    referrer: referrer || undefined,
  }
}

// Track analytics events
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  
  const utmParams = extractUTMParams()
  const eventData: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      ...utmParams,
      page: window.location.pathname,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventData)
  }
  
  // Send to analytics providers
  // Add your analytics provider here (e.g., Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', event, {
      event_category: 'engagement',
      event_label: properties?.label || '',
      value: properties?.value || 0,
    })
  }
  
  // Send to custom endpoint
  fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  }).catch(error => {
    console.error('Analytics tracking failed:', error)
  })
}

// Predefined event tracking functions
export const analytics = {
  // Hero section events
  viewHero: () => trackEvent('view_hero'),
  clickGetEarlyAccess: () => trackEvent('click_cta_get_early_access'),
  clickBookFitCall: () => trackEvent('click_cta_book_fit_call'),
  
  // Lead capture events
  openEarlyAccessModal: () => trackEvent('open_early_access_modal'),
  submitLeadSuccess: (role?: string, companySize?: string) => 
    trackEvent('submit_lead_success', { role, company_size: companySize }),
  submitLeadError: (error: string) => 
    trackEvent('submit_lead_error', { error }),
  
  // Accountant program events
  clickAccountantProgram: () => trackEvent('click_accountant_program'),
  submitAccountantPartner: () => trackEvent('submit_accountant_partner'),
  
  // Pricing events
  clickPricingCTA: (plan: string) => trackEvent('pricing_cta_click', { plan }),
  viewPricing: () => trackEvent('view_pricing'),
  
  // FAQ events
  openFAQ: (question: string) => trackEvent('faq_open', { question }),
  
  // Exit intent
  showExitIntent: () => trackEvent('exit_intent_seen'),
  
  // Webinar/ICS download
  downloadWebinarICS: () => trackEvent('webinar_ics_download'),
  
  // Video events
  playVideo: () => trackEvent('video_play'),
  pauseVideo: () => trackEvent('video_pause'),
  completeVideo: () => trackEvent('video_complete'),
  
  // Scroll tracking
  scrollToSection: (section: string) => trackEvent('scroll_to_section', { section }),
  
  // Form interactions
  startForm: (formType: string) => trackEvent('form_start', { form_type: formType }),
  abandonForm: (formType: string, step: number) => 
    trackEvent('form_abandon', { form_type: formType, step }),
}

// Initialize analytics on page load
export function initAnalytics() {
  if (typeof window === 'undefined') return
  
  // Track page view
  trackEvent('page_view', {
    page: window.location.pathname,
    title: document.title,
  })
  
  // Track hero view
  analytics.viewHero()
  
  // Track scroll depth
  let maxScroll = 0
  const trackScroll = () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent
      if (scrollPercent >= 25) trackEvent('scroll_25')
      if (scrollPercent >= 50) trackEvent('scroll_50')
      if (scrollPercent >= 75) trackEvent('scroll_75')
      if (scrollPercent >= 90) trackEvent('scroll_90')
    }
  }
  
  window.addEventListener('scroll', trackScroll, { passive: true })
  
  // Track exit intent
  let exitIntentShown = false
  const trackExitIntent = (e: MouseEvent) => {
    if (e.clientY <= 0 && !exitIntentShown) {
      exitIntentShown = true
      analytics.showExitIntent()
    }
  }
  
  document.addEventListener('mouseleave', trackExitIntent)
  
  // Cleanup
  return () => {
    window.removeEventListener('scroll', trackScroll)
    document.removeEventListener('mouseleave', trackExitIntent)
  }
}
