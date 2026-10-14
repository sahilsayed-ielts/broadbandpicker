'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { getSavedDeals, onSavedDealsChange } from '@/lib/savedDeals'
import type { TocEntry } from '@/lib/extractHeadings'

/** Mobile replacement for the jump-link list: one select, no wrapping list of links. */
export function GuideJumpSelect({ toc }: { toc: TocEntry[] }) {
  return (
    <label className="block lg:hidden">
      <span className="sr-only">Jump to section</span>
      <select
        defaultValue=""
        onChange={(e) => {
          const target = document.getElementById(e.target.value)
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            trackEvent('guide_jump_nav', { section: e.target.value })
          }
        }}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
      >
        <option value="" disabled>
          Jump to section…
        </option>
        {toc.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.text}
          </option>
        ))}
      </select>
    </label>
  )
}

// Fixed reasons only: a free-text box could collect personal data, which must
// not be sent to GA4 (Google's terms and UK GDPR).
const NOT_HELPFUL_REASONS = [
  'A provider I want is missing',
  'Prices look out of date',
  'Too long to find the answer',
  'Hard to understand',
] as const

/** Two-tap feedback at the end of a guide, sent to GA4 as guide_feedback. */
export function GuideHelpfulPrompt({ slug }: { slug: string }) {
  const [state, setState] = useState<'idle' | 'more' | 'done'>('idle')

  function send(helpful: 'yes' | 'no', reason?: string) {
    trackEvent('guide_feedback', { guide_slug: slug, helpful, reason: reason ?? 'not given' })
    setState('done')
  }

  if (state === 'done') {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700" role="status">
        Thanks. Your answer helps us improve this guide.
      </p>
    )
  }

  return (
    <section aria-label="Feedback" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5">
      <p className="font-bold text-slate-900">
        {state === 'idle' ? 'Did this help you choose?' : 'What would have helped?'}
      </p>
      <div className="flex flex-wrap gap-2">
        {state === 'idle' ? (
          <>
            <button
              type="button"
              onClick={() => send('yes')}
              className="rounded-lg border-2 border-sky-700 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setState('more')}
              className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Not really
            </button>
          </>
        ) : (
          NOT_HELPFUL_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => send('no', reason)}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {reason}
            </button>
          ))
        )}
      </div>
    </section>
  )
}

/** WhatsApp share and copy-link: household broadband decisions are often shared. */
export function GuideShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="font-semibold text-slate-700">Share this guide:</span>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('guide_share', { method: 'whatsapp' })}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-300"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            trackEvent('guide_share', { method: 'copy_link' })
          } catch {
            setCopied(false)
          }
        }}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-300"
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  )
}

/**
 * Single sticky action on phones. Appears once the reader has scrolled past
 * the hero and hides whenever the deal list itself is on screen.
 */
export function GuideMobileDealBar({ dealsId, heroId, label }: { dealsId: string; heroId: string; label: string }) {
  const [pastHero, setPastHero] = useState(false)
  const [dealsVisible, setDealsVisible] = useState(false)
  const [saved, setSaved] = useState(0)

  useEffect(() => {
    const deals = document.getElementById(dealsId)
    const hero = document.getElementById(heroId)
    if (!deals || !hero || !('IntersectionObserver' in window)) return
    const dealsObserver = new IntersectionObserver(([entry]) => setDealsVisible(entry.isIntersecting))
    const heroObserver = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting))
    dealsObserver.observe(deals)
    heroObserver.observe(hero)
    return () => {
      dealsObserver.disconnect()
      heroObserver.disconnect()
    }
  }, [dealsId, heroId])

  useEffect(() => {
    const sync = () => setSaved(getSavedDeals().length)
    sync()
    return onSavedDealsChange(sync)
  }, [])

  const show = pastHero && !dealsVisible

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 pt-2.5 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] transition-transform lg:hidden ${
        show ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center gap-3">
        {saved > 0 && (
          <a href="/saved-deals" tabIndex={show ? 0 : -1} className="whitespace-nowrap text-sm font-semibold text-slate-600">
            {saved} saved
          </a>
        )}
        <a
          href={`#${dealsId}`}
          tabIndex={show ? 0 : -1}
          onClick={() => trackEvent('guide_sticky_cta', { target: dealsId })}
          className="flex-1 rounded-lg bg-sky-700 px-4 py-3 text-center text-sm font-bold text-white"
        >
          {label}
        </a>
      </div>
    </div>
  )
}
