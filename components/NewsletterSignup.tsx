'use client'

import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'

interface NewsletterSignupProps {
  source?: string
  postcodeArea?: string
}

export default function NewsletterSignup({ source = 'footer', postcodeArea }: NewsletterSignupProps) {
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
        if (error.code === '23505') {
          setMessage("You're already subscribed — we'll be in touch with the best deals.")
        } else {
          setMessage('Something went wrong. Please try again.')
        }
        setStatus('error')
      } else {
        setMessage("You're subscribed! We'll send you the best broadband deals.")
        setStatus('success')
        setEmail('')
      }
    } catch {
      setMessage('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl px-6 py-8">
      <h3 className="text-white font-bold text-lg mb-1">Get deal alerts by email</h3>
      <p className="text-slate-400 text-sm mb-4">
        We&apos;ll send you the best new broadband deals — no spam, unsubscribe any time.
      </p>
      {status === 'success' ? (
        <p className="text-green-400 font-medium text-sm">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
