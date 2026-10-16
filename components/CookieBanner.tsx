'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GOOGLE_CMP_PENDING_EVENT,
  hasPendingGoogleCmp,
  proceedGoogleCmp,
  showGoogleAdChoices,
} from '@/lib/googlefc'

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
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [adsChoicePending, setAdsChoicePending] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) setVisible(true)
    if (stored === 'accepted') updateGoogleConsent('granted')
    if (stored === 'declined') updateGoogleConsent('denied')
    if (hasPendingGoogleCmp()) handleGoogleCmpPending()

    const openPreferences = () => {
      setPreferencesOpen(true)
      setVisible(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, openPreferences)
    window.addEventListener(GOOGLE_CMP_PENDING_EVENT, handleGoogleCmpPending)
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, openPreferences)
      window.removeEventListener(GOOGLE_CMP_PENDING_EVENT, handleGoogleCmpPending)
    }
  }, [])

  function handleGoogleCmpPending() {
    setAdsChoicePending(true)
    if (localStorage.getItem(CONSENT_KEY)) {
      proceedGoogleCmp(true)
      setAdsChoicePending(false)
      return
    }
    setVisible(true)
  }

  function updateGoogleConsent(analyticsStorage: 'granted' | 'denied') {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: analyticsStorage,
      })
    }
  }

  function acceptAnalytics() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    updateGoogleConsent('granted')
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
      })
    }
    window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT))
  }

  function essentialOnly() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    updateGoogleConsent('denied')
    proceedGoogleCmp(false)
    setAdsChoicePending(false)
    setVisible(false)
    window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT))
  }

  function acceptAnalyticsOnly() {
    acceptAnalytics()
    proceedGoogleCmp(false)
    setAdsChoicePending(false)
    setVisible(false)
  }

  function acceptAll() {
    acceptAnalytics()
    proceedGoogleCmp(true)
    setAdsChoicePending(false)
    setVisible(false)
  }

  function changeAdChoices() {
    setVisible(false)
    showGoogleAdChoices()
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-900 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p className="text-sm text-slate-300 flex-1 leading-relaxed">
          We use analytics cookies to understand how visitors use the site. Personalised ads in the
          UK, EEA and Switzerland use Google&apos;s certified IAB TCF consent message, with equal
          accept and reject choices. We do not sell your data.{' '}
          <Link href="/cookie-policy" className="text-sky-400 hover:underline">
            Cookie policy
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={essentialOnly}
            className="min-h-11 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={acceptAnalyticsOnly}
            className={
              adsChoicePending && !preferencesOpen
                ? 'min-h-11 rounded-lg border border-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors'
                : 'min-h-11 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 transition-colors'
            }
          >
            Accept analytics
          </button>
          {adsChoicePending && !preferencesOpen ? (
            <button
              type="button"
              onClick={acceptAll}
              className="min-h-11 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 transition-colors"
            >
              Accept all
            </button>
          ) : null}
          {preferencesOpen ? (
            <button
              type="button"
              onClick={changeAdChoices}
              className="min-h-11 rounded-lg border border-sky-400 px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-slate-800 transition-colors"
            >
              Ad choices
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
