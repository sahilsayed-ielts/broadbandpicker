'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export type ConsentState = 'accepted' | 'declined' | null

export const CONSENT_KEY = 'bbp_cookie_consent'
export const OPEN_CONSENT_EVENT = 'bbp:open-cookie-preferences'
export const CONSENT_UPDATED_EVENT = 'bbp:analytics-consent-updated'

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(CONSENT_KEY) as ConsentState) ?? null
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) setVisible(true)
    if (stored === 'accepted') updateGoogleConsent('granted')
    if (stored === 'declined') updateGoogleConsent('denied')

    const openPreferences = () => setVisible(true)
    window.addEventListener(OPEN_CONSENT_EVENT, openPreferences)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, openPreferences)
  }, [])

  function updateGoogleConsent(analyticsStorage: 'granted' | 'denied') {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('consent', 'update', {
        analytics_storage: analyticsStorage,
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    }
  }

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    updateGoogleConsent('granted')
    // The initial GA configuration may have run while consent was denied.
    // Send the first consented page view immediately so Realtime starts without
    // requiring the visitor to navigate or reload.
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
      })
    }
    window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT))
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    updateGoogleConsent('denied')
    setVisible(false)
    window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT))
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-slate-300 flex-1 leading-relaxed">
          We use analytics cookies to understand how visitors use our site so we can improve it.
          Advertising cookies remain disabled unless a separate certified advertising-consent
          message is introduced. We do not sell your data.{' '}
          <Link href="/cookie-policy" className="text-sky-400 hover:underline">
            Cookie policy
          </Link>
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Essential only
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  )
}
