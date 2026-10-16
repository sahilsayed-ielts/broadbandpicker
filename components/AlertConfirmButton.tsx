'use client'

import Link from 'next/link'
import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'

type Outcome = 'confirmed' | 'already' | 'cancelled' | 'invalid' | 'expired' | 'unavailable'

const COPY: Record<'price' | 'contract', { action: string; done: string; doneBody: string }> = {
  price: {
    action: 'Confirm my price-drop alert',
    done: 'Price-drop alert is on',
    doneBody: 'We will email you once each time one of these deals gets cheaper. Every email has a link to stop the alerts.',
  },
  contract: {
    action: 'Confirm my contract reminder',
    done: 'Reminder set',
    doneBody: 'We will send one email 30 days before your contract ends, with deals worth comparing. That is the only email this sets up.',
  },
}

const OUTCOME_COPY: Record<Exclude<Outcome, 'confirmed'>, { title: string; body: string }> = {
  already: { title: 'Already confirmed', body: 'This alert was already switched on. There is nothing else to do.' },
  cancelled: { title: 'This alert was cancelled', body: 'Set up a new one if you want it back.' },
  invalid: { title: 'That link is not valid', body: 'Use the button in the most recent BroadbandPicker email, or set the alert up again.' },
  expired: { title: 'That link has expired', body: 'Confirmation links last seven days. Set the alert up again and we will send a fresh email.' },
  unavailable: { title: 'Something went wrong on our side', body: 'Please try the button again in a few minutes.' },
}

export default function AlertConfirmButton({ kind, token }: { kind: 'price' | 'contract'; token: string }) {
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const copy = COPY[kind]
  const retryHref = kind === 'price' ? '/saved-deals#price-alerts' : '/tools/contract-end-reminder'

  async function confirm() {
    setBusy(true)
    try {
      const res = await fetch('/api/alerts/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, token }),
      })
      const data = (await res.json()) as { outcome?: Outcome }
      const result = data.outcome ?? 'unavailable'
      setOutcome(result)
      trackEvent(kind === 'price' ? 'price_alert_confirmed' : 'contract_reminder_confirmed', { status: result })
    } catch {
      setOutcome('unavailable')
    } finally {
      setBusy(false)
    }
  }

  if (outcome === 'confirmed') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">{copy.done}</h1>
        <p className="mt-3 leading-relaxed text-slate-600">{copy.doneBody}</p>
        <p className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/deals" className="font-semibold text-sky-700 hover:underline">See current deals</Link>
          <Link href="/research/broadband-price-index" className="font-semibold text-sky-700 hover:underline">Broadband price index</Link>
        </p>
      </div>
    )
  }

  if (outcome && outcome !== 'unavailable') {
    const msg = OUTCOME_COPY[outcome]
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">{msg.title}</h1>
        <p className="mt-3 leading-relaxed text-slate-600">{msg.body}</p>
        <p className="mt-6">
          <Link href={retryHref} className="font-semibold text-sky-700 hover:underline">Set up an alert</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-slate-900">One more click</h1>
      <p className="mt-3 leading-relaxed text-slate-600">Press the button to switch the alert on.</p>
      <button
        type="button"
        onClick={confirm}
        disabled={busy}
        className="mt-6 rounded-xl bg-sky-600 px-6 py-3 font-bold text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {busy ? 'Confirming…' : copy.action}
      </button>
      {outcome === 'unavailable' && (
        <p className="mt-4 text-sm text-red-700" role="alert">{OUTCOME_COPY.unavailable.body}</p>
      )}
    </div>
  )
}
