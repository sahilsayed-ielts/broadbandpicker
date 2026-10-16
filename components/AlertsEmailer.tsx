'use client'

import { useEffect, useState, type FormEvent } from 'react'

type Status = {
  mailConfigured: boolean
  confirmedCount: number
  weekKey: string
  subject: string
  checklist: string[]
  sendDay?: string
  sendWhen?: string
  nextSendAt?: string
}

export default function AlertsEmailer() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const [testTo, setTestTo] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadStatus() {
    const res = await fetch('/api/admin/alerts/status')
    if (!res.ok) {
      setAuthed(false)
      return
    }
    setAuthed(true)
    setStatus(await res.json())
  }

  useEffect(() => {
    void loadStatus()
  }, [])

  async function login(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/alerts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Could not sign in.')
        return
      }
      setSecret('')
      await loadStatus()
    } finally {
      setBusy(false)
    }
  }

  async function send(mode: 'test' | 'all') {
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, testTo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Send failed.')
        return
      }
      setMessage(
        data.skipped
          ? `Skipped: ${data.skipped}`
          : `Sent ${data.sent} of week ${data.weekKey}. Failed: ${data.failed}.`,
      )
      await loadStatus()
    } finally {
      setBusy(false)
    }
  }

  if (!authed) {
    return (
      <form onSubmit={login} className="max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Open the weekly emailer</h2>
        <p className="text-sm text-slate-600">
          This desk is private. Use the ALERTS_ADMIN_SECRET from Vercel. It is not a public newsletter signup.
        </p>
        <input
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
          placeholder="Admin secret"
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Checking…' : 'Open emailer'}
        </button>
        {message && <p className="text-sm text-red-600">{message}</p>}
      </form>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">This week</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{status?.subject}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Issue {status?.weekKey}. Automatic send: every {status?.sendDay} at {status?.sendWhen}.
            Next fire {status?.nextSendAt ? new Date(status.nextSendAt).toLocaleString('en-GB', { timeZone: 'Europe/London' }) : 'once cron is live'}.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-slate-500">Confirmed list</dt>
              <dd className="font-bold text-slate-900">{status?.confirmedCount ?? 0}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-slate-500">Domain SMTP</dt>
              <dd className="font-bold text-slate-900">{status?.mailConfigured ? 'Ready' : 'Not set'}</dd>
            </div>
          </dl>
          {!status?.mailConfigured && (
            <p className="mt-3 text-sm text-amber-800">
              Preview works. Sending waits for MAIL_SMTP_HOST as noreply@broadbandpicker.co.uk. Gmail is not used for the list.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900">Compliance desk</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {status?.checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-sky-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          <h3 className="font-bold text-slate-900">Send</h3>
          <label className="block text-sm text-slate-600">
            Test address
            <input
              type="email"
              value={testTo}
              onChange={(event) => setTestTo(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-sky-500"
              placeholder="you@example.com"
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => void send('test')}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              Send test
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Send this week’s roundup to ${status?.confirmedCount ?? 0} confirmed addresses?`)) {
                  void send('all')
                }
              }}
              className="flex-1 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              Send to confirmed list
            </button>
          </div>
          {message && <p className="text-sm text-slate-700">{message}</p>}
        </div>
      </div>

      <div className="min-h-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <iframe title="Live weekly email preview" src="/api/newsletter/preview" className="h-full min-h-[640px] w-full bg-white" />
      </div>
    </div>
  )
}
