'use client'

import Link from 'next/link'
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { trackEvent } from '@/lib/analytics'

interface AlertEmailFormProps {
  endpoint: '/api/alerts/price-drop' | '/api/alerts/contract-reminder'
  consentText: string
  submitLabel: string
  successTitle: string
  successBody: string
  /** GA4 event fired on a successful request (before the email is confirmed). */
  event: string
  /** Extra fields sent with the request. Return null to block submit with `blockedMessage`. */
  payload: () => Record<string, unknown> | null
  blockedMessage?: string
  children?: ReactNode
}

/**
 * Email + consent + honeypot form shared by the self-serve alerts. The
 * server repeats every check (lib/alertRequest.ts); this only gives fast,
 * friendly feedback.
 */
export default function AlertEmailForm({
  endpoint, consentText, submitLabel, successTitle, successBody, event, payload, blockedMessage, children,
}: AlertEmailFormProps) {
  const uid = useId()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const renderedAt = useRef(Date.now())

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const extra = payload()
    if (!extra) {
      setStatus('error')
      setMessage(blockedMessage || 'Please complete the form.')
      return
    }
    if (!email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }
    if (!consent) {
      setStatus('error')
      setMessage('Tick the box so we know you want these emails.')
      return
    }
    setStatus('loading')
    setMessage('')
    const honeypot = String(new FormData(e.currentTarget).get('website') || '')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...extra,
          email,
          consent: true,
          consentText,
          website: honeypot,
          renderedAt: renderedAt.current,
          sourcePath: window.location.pathname,
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
      trackEvent(event, { form_endpoint: endpoint })
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4" role="status">
        <p className="font-bold text-green-900">{successTitle}</p>
        <p className="mt-1 text-sm text-green-800">{successBody}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {children}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Leave this field blank</label>
        <input type="text" id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor={`${uid}-email`} className="mb-1 block text-sm font-semibold text-slate-800">Email address</label>
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>
      <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-400 text-sky-600 focus:ring-sky-500"
        />
        <span>
          {consentText}{' '}
          <Link href="/privacy-policy" className="text-sky-700 hover:underline">Privacy policy</Link>.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-60 sm:w-auto"
      >
        {status === 'loading' ? 'Sending…' : submitLabel}
      </button>
      {status === 'error' && <p className="text-sm text-red-700" role="alert">{message}</p>}
      <p className="text-xs text-slate-500">We send a confirmation email first. Nothing else happens until you click it.</p>
    </form>
  )
}
