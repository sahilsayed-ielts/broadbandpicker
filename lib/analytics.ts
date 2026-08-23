'use client'

export type AnalyticsValue = string | number | boolean

type AnalyticsParameters = Record<string, AnalyticsValue | null | undefined>

interface JourneyAttribution {
  journey_id: string
  landing_page: string
  referrer_host: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const ATTRIBUTION_KEY = 'bbp_analytics_attribution'

function safeHost(value: string): string {
  if (!value) return 'direct'
  try {
    return new URL(value).hostname || 'direct'
  } catch {
    return 'direct'
  }
}

function newJourneyId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function attribution(): JourneyAttribution | null {
  if (typeof window === 'undefined') return null

  try {
    const existing = window.sessionStorage.getItem(ATTRIBUTION_KEY)
    if (existing) return JSON.parse(existing) as JourneyAttribution

    const params = new URLSearchParams(window.location.search)
    const value: JourneyAttribution = {
      journey_id: newJourneyId(),
      landing_page: window.location.pathname,
      referrer_host: safeHost(document.referrer),
      utm_source: params.get('utm_source') || '(not set)',
      utm_medium: params.get('utm_medium') || '(not set)',
      utm_campaign: params.get('utm_campaign') || '(not set)',
    }
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value))
    return value
  } catch {
    return null
  }
}

export function trackEvent(name: string, parameters: AnalyticsParameters = {}): void {
  if (typeof window === 'undefined') return

  const cleanParameters = Object.fromEntries(
    Object.entries(parameters).filter((entry): entry is [string, AnalyticsValue] => entry[1] != null),
  )
  const eventParameters = {
    ...attribution(),
    page_path: window.location.pathname,
    ...cleanParameters,
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, eventParameters)
    return
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(['event', name, eventParameters])
}

export function outboundHost(href: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return new URL(href, window.location.href).hostname
  } catch {
    return ''
  }
}
