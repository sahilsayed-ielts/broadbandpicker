'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { SITE_URL } from '@/lib/siteSchema'

interface ShareBarProps {
  /** Absolute URL or a site path such as /compare/shared/bt-vs-sky. */
  url: string
  title: string
  /** Lead-in text for WhatsApp and email; the URL is appended. */
  text: string
  /** GA4 `share` content_type, e.g. speed_test_result, comparison. */
  contentType: string
  itemId?: string
  placement: string
  tone?: 'light' | 'dark'
  label?: string
}

/**
 * Share a result or comparison. Fires GA4's recommended `share` event with
 * method / content_type / item_id. WhatsApp first because UK household
 * broadband decisions are usually made with someone else.
 */
export default function ShareBar({
  url, title, text, contentType, itemId, placement, tone = 'light', label = 'Share',
}: ShareBarProps) {
  const absolute = url.startsWith('http') ? url : `${SITE_URL}${url}`
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  function track(method: string) {
    trackEvent('share', { method, content_type: contentType, item_id: itemId ?? absolute, placement })
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url: absolute })
      track('native')
    } catch {
      // Dismissed by the user.
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(absolute)
      setCopied(true)
      track('copy_link')
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copy this link', absolute)
    }
  }

  const dark = tone === 'dark'
  const btn = `inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
    dark
      ? 'border-slate-600 text-slate-200 hover:border-slate-400 hover:bg-slate-800'
      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
  }`
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text} ${absolute}`)}`
  const mail = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${absolute}`)}`

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className={`mr-1 text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label}:</span>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} className={btn}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0-12l-4 4m4-4l4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
          </svg>
          Share
        </button>
      )}
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp')} className={btn}>
        WhatsApp
      </a>
      <a href={mail} onClick={() => track('email')} className={btn}>
        Email
      </a>
      <button type="button" onClick={copy} className={btn} aria-live="polite">
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  )
}
