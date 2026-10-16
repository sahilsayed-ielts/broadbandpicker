'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'
import { CONSENT_TEXT } from '@/lib/newsletterCopy'
import { NEWSLETTER_PUBLIC } from '@/lib/newsletterPublic'

interface NewsletterSignupProps {
  variant?: 'footer' | 'inline' | 'postcode' | 'page'
  source?: string
  postcodeArea?: string
  postcodeTown?: string
}

const SUCCESS_COPY =
  'Check your inbox to confirm. We will not send deal emails until you click the link.'

export default function NewsletterSignup({
  variant = 'footer',
  source = 'footer',
  postcodeArea,
  postcodeTown,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [postcode, setPostcode] = useState(postcodeArea ?? '')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const renderedAt = useRef(Date.now())
  const areaLabel = postcodeTown ?? postcodeArea?.toUpperCase() ?? 'your area'
  if (!NEWSLETTER_PUBLIC) return null

  const showPostcodeField = variant === 'page' || variant === 'inline' || variant === 'footer'
  const lockPostcode = variant === 'postcode'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.includes('@')) {
      setMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }
    if (!consent) {
      setMessage('Tick the box if you want BroadbandPicker to email you.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setMessage('')
    const form = e.currentTarget
    const honeypot = String(new FormData(form).get('website') || '')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          postcode: lockPostcode ? postcodeArea : postcode,
          consent: true,
          consentText: CONSENT_TEXT,
          website: honeypot,
          renderedAt: renderedAt.current,
          source,
          sourcePath: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setMessage(result.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('success')
      setMessage(SUCCESS_COPY)
      setEmail('')
      setConsent(false)
      trackEvent('newsletter_signup_request', { source, variant })
    } catch {
      setMessage('Something went wrong. Please check your connection and try again.')
      setStatus('error')
    }
  }

  const honeypot = (
    <div className="sr-only" aria-hidden="true">
      <label htmlFor={`alerts-website-${variant}`}>Leave this field blank</label>
      <input type="text" id={`alerts-website-${variant}`} name="website" tabIndex={-1} autoComplete="off" />
    </div>
  )

  const consentBox = (tone: 'light' | 'dark') => (
    <label className={`flex items-start gap-2 text-left ${tone === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-xs leading-relaxed`}>
      <input
        type="checkbox"
        checked={consent}
        onChange={(e) => {
          setConsent(e.target.checked)
          if (status === 'error') setStatus('idle')
        }}
        className="mt-0.5 h-4 w-4 rounded border-slate-400 text-sky-600 focus:ring-sky-500"
        required
      />
      <span>
        {CONSENT_TEXT}{' '}
        <Link
          href="/privacy-policy"
          className={tone === 'dark' ? 'text-sky-400 hover:underline' : 'text-sky-700 hover:underline'}
        >
          Privacy policy
        </Link>
        .
      </span>
    </label>
  )

  if (variant === 'postcode') {
    return (
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="font-semibold text-slate-900 text-sm">Get deal alerts for {areaLabel}</span>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          Optional weekly emails when we publish cheaper or faster packages that can serve this postcode area. Confirm in your inbox first.
        </p>
        {status === 'success' ? (
          <p className="text-green-700 font-medium text-sm">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {honeypot}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-lg border border-sky-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500 outline-none text-sm"
                aria-label="Email address for broadband deal alerts"
                autoComplete="email"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending…' : 'Alert me'}
              </button>
            </div>
            {consentBox('light')}
          </form>
        )}
        {status === 'error' && <p className="mt-2 text-red-600 text-xs">{message}</p>}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <section className="bg-slate-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sky-400 text-xs font-semibold uppercase tracking-wide">Free weekly deal alerts</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Get BroadbandPicker emails</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
            A weekly roundup of UK broadband deals worth checking, plus occasional switching guides. Confirm in your inbox. Unsubscribe any time.
          </p>
          {status === 'success' ? (
            <p className="text-green-400 font-medium">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3 text-left">
              {honeypot}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === 'error') setStatus('idle')
                  }}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:border-sky-500 outline-none text-sm"
                  aria-label="Email address for weekly broadband deal alerts"
                  autoComplete="email"
                  required
                />
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Postcode (optional)"
                  className="sm:w-40 px-4 py-3 rounded-xl bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:border-sky-500 outline-none text-sm"
                  aria-label="UK postcode, optional"
                  autoComplete="postal-code"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending confirmation…' : 'Email me alerts'}
              </button>
              {consentBox('dark')}
            </form>
          )}
          {status === 'error' && <p className="mt-3 text-red-400 text-xs">{message}</p>}
          <p className="text-slate-600 text-xs mt-3">
            <Link href="/alerts" className="text-slate-500 hover:text-sky-400">
              What we send, and what we do not
            </Link>
          </p>
        </div>
      </section>
    )
  }

  if (variant === 'page') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {status === 'success' ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="font-bold text-green-900">Check your inbox</p>
            <p className="mt-1 text-sm text-green-800">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {honeypot}
            <div>
              <label htmlFor="alerts-email" className="block text-sm font-semibold text-slate-900 mb-1">
                Email address
              </label>
              <input
                id="alerts-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 outline-none"
                autoComplete="email"
                required
              />
            </div>
            {showPostcodeField && (
              <div>
                <label htmlFor="alerts-postcode" className="block text-sm font-semibold text-slate-900 mb-1">
                  UK postcode <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="alerts-postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g. M1 1AE"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 outline-none"
                  autoComplete="postal-code"
                />
                <p className="mt-1 text-xs text-slate-500">
                  We store the outward code only, so later emails can mention deals that can serve your area. We do not need your street address for alerts.
                </p>
              </div>
            )}
            {consentBox('light')}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {status === 'loading' ? 'Sending confirmation…' : 'Send me a confirmation email'}
            </button>
            {status === 'error' && <p className="text-red-600 text-sm">{message}</p>}
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl px-6 py-8">
      <h3 className="text-white font-bold text-lg mb-1">Get deal alerts by email</h3>
      <p className="text-slate-300 text-sm mb-4">
        Weekly UK broadband deals from BroadbandPicker, plus occasional guides. Confirm in your inbox. Unsubscribe any time.
      </p>
      {status === 'success' ? (
        <p className="text-green-400 font-medium text-sm">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {honeypot}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              placeholder="Your email address"
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 text-white placeholder:text-slate-400 border border-slate-600 focus:border-sky-500 outline-none text-sm"
              aria-label="Email address for broadband deal alerts"
              autoComplete="email"
              required
            />
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Postcode (optional)"
              className="sm:w-40 px-4 py-2.5 rounded-lg bg-slate-700 text-white placeholder:text-slate-400 border border-slate-600 focus:border-sky-500 outline-none text-sm"
              aria-label="UK postcode, optional"
              autoComplete="postal-code"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {status === 'loading' ? 'Sending…' : 'Get alerts'}
            </button>
          </div>
          {consentBox('dark')}
        </form>
      )}
      {status === 'error' && <p className="mt-2 text-red-400 text-xs">{message}</p>}
    </div>
  )
}
