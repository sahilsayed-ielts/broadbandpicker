'use client'

import { useState, useRef, type FormEvent } from 'react'
import { trackEvent } from '@/lib/analytics'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const REASONS = [
  { value: 'general', label: 'General question' },
  { value: 'editorial', label: 'Editorial enquiry' },
  { value: 'partnerships', label: 'Affiliate partnership' },
]

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const renderedAt = useRef(Date.now())

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      reason: String(data.get('reason') || ''),
      message: String(data.get('message') || ''),
      website: String(data.get('website') || ''), // honeypot
      renderedAt: renderedAt.current,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('sent')
      trackEvent('contact_form_submit', { reason: payload.reason })
      form.reset()
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-bold text-green-900">Message sent</p>
        <p className="mt-1 text-sm text-green-800">
          Thanks for getting in touch — we aim to respond within 2 business days.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-semibold text-sky-700 hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      {/* Honeypot — visually hidden from real visitors, bots that fill every field get caught */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-900">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={200}
          className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-900">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={320}
          className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-500"
        />
      </div>

      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-semibold text-slate-900">Reason</label>
        <select
          id="reason"
          name="reason"
          required
          defaultValue=""
          className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-500"
        >
          <option value="" disabled>Select a reason</option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-semibold text-slate-900">Message</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-sky-700 px-5 py-3 font-bold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
