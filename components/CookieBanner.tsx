'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export type ConsentState = 'accepted' | 'declined' | null

export const CONSENT_KEY = 'bbp_cookie_consent'

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(CONSENT_KEY) as ConsentState) ?? null
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    // Update GA4 Consent Mode v2 — analytics_storage granted
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      })
    }
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
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
          We do not use advertising cookies or sell your data.{' '}
          <Link href="/privacy-policy" className="text-sky-400 hover:underline">
            Privacy policy
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
