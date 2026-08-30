'use client'

import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'

interface NewsletterSignupProps {
  variant?: 'footer' | 'inline' | 'postcode'
  source?: string
  postcodeArea?: string
  postcodeTown?: string
}

export default function NewsletterSignup({
  variant = 'footer',
  source = 'footer',
  postcodeArea,
  postcodeTown,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const { error } = await supabase.from('email_subscribers').insert({
        email,
        postcode_area: postcodeArea ?? null,
        source,
      })
      if (error) {
        setMessage(
          error.code === '23505'
            ? "You're already subscribed. We'll be in touch with the best deals."
            : 'Something went wrong. Please try again.'
        )
        setStatus('error')
      } else {
        setMessage(
          postcodeArea
            ? `Done. We'll alert you when deals in ${postcodeTown ?? postcodeArea.toUpperCase()} improve.`
            : "You're subscribed. We'll send you the best broadband deals."
        )
        setStatus('success')
        setEmail('')
      }
    } catch {
      setMessage('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (variant === 'postcode') {
    return (
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="font-semibold text-slate-900 text-sm">
                Get deal alerts for {postcodeTown ?? postcodeArea?.toUpperCase() ?? 'your area'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              We&apos;ll email you when cheaper deals become available in this area. No spam, unsubscribe any time.
            </p>
          </div>
          {status === 'success' ? (
            <p className="text-green-700 font-medium text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 sm:min-w-[340px]">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-lg border border-sky-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500 outline-none text-sm"
                aria-label="Email address for broadband deal alerts"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {status === 'loading' ? 'Saving…' : 'Alert me'}
              </button>
            </form>
          )}
        </div>
        {status === 'error' && (
          <p className="mt-2 text-red-600 text-xs">{message}</p>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <section className="bg-slate-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5 mb-4">
            <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 9v2.093c0 1.183.49 2.286 1.336 3.05a1.5 1.5 0 01-1.283-.977L6.5 11.5H6A1.5 1.5 0 014.5 10v-1.5A1.5 1.5 0 016 7h.5V6A1.5 1.5 0 018 4.5V3.5a.5.5 0 00-.495-.5z" />
            </svg>
            <span className="text-sky-400 text-xs font-semibold uppercase tracking-wide">Free weekly deal alerts</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Never miss a better deal
          </h2>
          <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
            Broadband prices drop every week. We&apos;ll send you a roundup of the best new deals, free, once a week. No spam, cancel any time.
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-green-400 font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:border-sky-500 outline-none text-sm"
                aria-label="Email address for weekly broadband deal alerts"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {status === 'loading' ? 'Subscribing…' : 'Get free alerts →'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="mt-3 text-red-400 text-xs">{message}</p>
          )}
          <p className="text-slate-600 text-xs mt-3">Join thousands of UK households saving on broadband</p>
        </div>
      </section>
    )
  }

  // variant === 'footer'
  return (
    <div className="bg-slate-800 rounded-xl px-6 py-8">
      <h3 className="text-white font-bold text-lg mb-1">Get deal alerts by email</h3>
      <p className="text-slate-300 text-sm mb-4">
        We&apos;ll send you the best new broadband deals. No spam, unsubscribe any time.
      </p>
      {status === 'success' ? (
        <p className="text-green-400 font-medium text-sm">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
            placeholder="Your email address"
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 text-white placeholder:text-slate-400 border border-slate-600 focus:border-sky-500 outline-none text-sm"
            aria-label="Email address for broadband deal alerts"
            required
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Subscribing…' : 'Get alerts'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-2 text-red-400 text-xs">{message}</p>
      )}
    </div>
  )
}
