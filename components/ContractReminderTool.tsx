'use client'

import { useEffect, useMemo, useState } from 'react'
import AlertEmailForm from './AlertEmailForm'
import { trackEvent } from '@/lib/analytics'
import { NEWSLETTER_PUBLIC } from '@/lib/newsletterPublic'
import { CONTRACT_CONSENT_TEXT } from '@/lib/newsletterCopy'

interface ProviderOption {
  slug: string
  name: string
}

const REMIND_DAYS_BEFORE = 30
const OTHER = '__other'

function isoToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function ukDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Two all-day events: a reminder 30 days before, and the end date itself. Built in the browser; nothing is sent to us. */
function buildIcs(providerName: string, contractEnd: string, remindOn: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const day = (iso: string) => iso.replace(/-/g, '')
  const url = 'https://broadbandpicker.co.uk/compare?utm_source=calendar&utm_medium=ics&utm_campaign=contract_end'
  const event = (uid: string, date: string, summary: string, description: string) => [
    'BEGIN:VEVENT',
    `UID:${uid}@broadbandpicker.co.uk`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day(date)}`,
    `DTEND;VALUE=DATE:${day(addDays(date, 1))}`,
    `SUMMARY:${icsEscape(summary)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'TRIGGER:PT9H',
    `DESCRIPTION:${icsEscape(summary)}`,
    'END:VALARM',
    'END:VEVENT',
  ]
  const id = `${day(contractEnd)}-${Math.random().toString(36).slice(2, 10)}`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BroadbandPicker//Contract reminder//EN',
    'CALSCALE:GREGORIAN',
    ...event(`remind-${id}`, remindOn, `Compare broadband: ${providerName} contract ends ${ukDate(contractEnd)}`,
      `Your ${providerName} contract ends on ${ukDate(contractEnd)}. Compare deals now, before you move to the out-of-contract price: ${url}`),
    ...event(`end-${id}`, contractEnd, `${providerName} broadband contract ends today`,
      `If you have not switched or re-contracted, you are now on the out-of-contract price. Compare deals: ${url}`),
    'END:VCALENDAR',
  ].join('\r\n')
}

export default function ContractReminderTool({ providers }: { providers: ProviderOption[] }) {
  const [providerSlug, setProviderSlug] = useState('')
  const [otherName, setOtherName] = useState('')
  const [contractEnd, setContractEnd] = useState('')

  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get('provider')
    if (fromLink && providers.some((p) => p.slug === fromLink)) setProviderSlug(fromLink)
  }, [providers])

  const today = isoToday()
  const providerName = providerSlug === OTHER ? otherName.trim() : providers.find((p) => p.slug === providerSlug)?.name ?? ''
  const dateError = contractEnd && contractEnd <= today
    ? 'That date has passed, so you may already be out of contract. Compare deals today.'
    : ''
  const ready = Boolean(providerName && contractEnd && !dateError)
  const remindOn = useMemo(() => {
    if (!contractEnd) return ''
    const target = addDays(contractEnd, -REMIND_DAYS_BEFORE)
    return target < today ? today : target
  }, [contractEnd, today])

  function downloadIcs() {
    if (!ready) return
    const blob = new Blob([buildIcs(providerName, contractEnd, remindOn)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'broadband-contract-reminder.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    trackEvent('contract_reminder_calendar', { provider_slug: providerSlug || 'other' })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cr-provider" className="mb-1 block text-sm font-semibold text-slate-800">Current provider</label>
          <select
            id="cr-provider"
            value={providerSlug}
            onChange={(e) => setProviderSlug(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Choose your provider</option>
            {providers.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            <option value={OTHER}>Another provider</option>
          </select>
          {providerSlug === OTHER && (
            <input
              aria-label="Provider name"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              maxLength={60}
              placeholder="Provider name"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          )}
        </div>
        <div>
          <label htmlFor="cr-end" className="mb-1 block text-sm font-semibold text-slate-800">Contract end date</label>
          <input
            id="cr-end"
            type="date"
            min={addDays(today, 1)}
            max={addDays(today, 3 * 365)}
            value={contractEnd}
            onChange={(e) => setContractEnd(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <p className="mt-1 text-xs text-slate-500">On your bill, in your provider account or app, or in your contract summary.</p>
        </div>
      </div>

      {dateError && <p className="text-sm font-semibold text-amber-700" role="alert">{dateError}</p>}

      {ready && (
        <div className="rounded-xl bg-slate-900 p-4 text-white" aria-live="polite">
          <p className="text-sm text-slate-300">Your {providerName} contract ends on</p>
          <p className="text-xl font-bold">{ukDate(contractEnd)}</p>
          <p className="mt-2 text-sm text-slate-300">
            We will remind you on <strong className="text-white">{ukDate(remindOn)}</strong>
            {remindOn === today ? ' (that is today, because the end date is less than 30 days away)' : ''}.
          </p>
        </div>
      )}

      <div className={`grid gap-4 ${NEWSLETTER_PUBLIC ? 'lg:grid-cols-2' : ''}`}>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-900">Add it to my calendar</h3>
          <p className="mt-1 mb-4 text-sm text-slate-600">No email needed. Works with Google, Apple and Outlook calendars. Nothing is sent to us.</p>
          <button
            type="button"
            onClick={downloadIcs}
            disabled={!ready}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download calendar reminder
          </button>
        </div>
        {NEWSLETTER_PUBLIC && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
            <h3 className="font-bold text-slate-900">Email me a reminder</h3>
            <p className="mt-1 mb-4 text-sm text-slate-600">One email 30 days before the end date, with the cheapest deals that day.</p>
            <AlertEmailForm
              endpoint="/api/alerts/contract-reminder"
              consentText={CONTRACT_CONSENT_TEXT}
              submitLabel="Email me a reminder"
              successTitle="Check your inbox"
              successBody="We sent a confirmation email. Click the button in it and your reminder is set."
              event="contract_reminder_requested"
              blockedMessage={dateError || 'Choose your provider and contract end date first.'}
              payload={() => (ready ? {
                providerSlug: providerSlug === OTHER ? undefined : providerSlug,
                providerName,
                contractEnd,
              } : null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
