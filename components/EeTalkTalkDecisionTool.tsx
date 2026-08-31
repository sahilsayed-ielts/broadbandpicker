'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const priorities = {
  lowest_cost: {
    label: 'Lowest entry cost',
    provider: 'TalkTalk',
    reason:
      'TalkTalk is the better starting point on the standard entry plans checked on 29 August 2026. Full Fibre 150 was £25 a month with no setup fee, while EE Core Broadband 100 was £26.99 a month plus £30 upfront. Confirm both checkout totals because address-level offers can differ.',
  },
  service_record: {
    label: 'Current service evidence',
    provider: 'EE',
    reason:
      'EE has the stronger current regulatory evidence. Ofcom recorded 6 broadband complaints per 100,000 customers for EE in Q1 2026, equal to the industry average, compared with 10 for TalkTalk, the highest rate among the major providers included.',
  },
  fastest_speed: {
    label: 'Highest available speed',
    provider: 'EE',
    reason:
      'EE is the better provider to check first for speeds above 900 Mbps. Its standard range reaches 1.6 Gbps where available, while its 2.3 and 8 Gbps Advanced Full Fibre plans launched only in eligible Guildford, Woking and nearby postcodes. TalkTalk’s fixed-speed range reaches 900 Mbps.',
  },
  home_wifi: {
    label: 'Router and home Wi-Fi',
    provider: 'EE',
    reason:
      'EE includes its WiFi 7-enabled Smart Hub 7 Plus on the current Core Broadband range. TalkTalk includes a router and offers Total Home Wi-Fi in eligible areas, but its exact equipment and booster eligibility should be confirmed for the selected address and package.',
  },
  clear_rises: {
    label: 'Clear future price schedule',
    provider: 'TalkTalk',
    reason:
      'Both publish pounds-and-pence increases. TalkTalk makes the next two prices especially visible on each deal: its £25 plan rises to £29 in April 2027 and £33 in April 2028. EE’s £26.99 plan rises to £30.99 in March 2027 and £34.99 in March 2028.',
  },
  connection_backup: {
    label: 'Backup if the line fails',
    provider: 'EE',
    reason:
      'EE is the provider to investigate for a mobile-backup option, but do not assume every current package includes it. Check the exact bundle at checkout and confirm that EE mobile coverage is strong inside your home before paying extra for this protection.',
  },
} as const

type Priority = keyof typeof priorities

export default function EeTalkTalkDecisionTool() {
  const [selected, setSelected] = useState<Priority>('lowest_cost')
  const [result, setResult] = useState<Priority | null>(null)
  const started = useRef(false)

  function selectPriority(priority: Priority) {
    setSelected(priority)
    setResult(null)
    if (!started.current) {
      started.current = true
      trackEvent('ee_talktalk_comparison_started', { priority })
    }
  }

  function completeComparison() {
    setResult(selected)
    trackEvent('ee_talktalk_comparison_completed', {
      priority: selected,
      recommended_provider: priorities[selected].provider.toLowerCase(),
    })
  }

  const recommendation = result ? priorities[result] : null

  return (
    <section
      className="mb-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7"
      aria-labelledby="ee-talktalk-decision-heading"
    >
      <h2 id="ee-talktalk-decision-heading" className="text-xl font-bold text-slate-900">
        Which provider fits your main priority?
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        Choose the one factor you care about most. The result uses published national offers and
        service evidence, so it is a shortlist rather than an address-level availability result.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-slate-900">Your main broadband priority</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(priorities) as Priority[]).map((priority) => (
            <label
              key={priority}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold outline-none transition-colors focus-within:ring-2 focus-within:ring-sky-700 focus-within:ring-offset-2 motion-reduce:transition-none ${
                selected === priority
                  ? 'border-sky-700 bg-sky-700 text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-sky-500'
              }`}
            >
              <input
                type="radio"
                name="ee-talktalk-priority"
                value={priority}
                checked={selected === priority}
                onChange={() => selectPriority(priority)}
                className="h-4 w-4 shrink-0 accent-sky-700"
              />
              {priorities[priority].label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={completeComparison}
        className="mt-5 min-h-11 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Show my starting point
      </button>

      <div className="mt-5 min-h-32 rounded-xl bg-white p-5 shadow-sm" aria-live="polite" aria-atomic="true">
        {recommendation ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Start with</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{recommendation.provider}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.reason}</p>
            <Link
              href="/compare"
              onClick={() =>
                trackEvent('ee_talktalk_compare_deals_clicked', {
                  priority: result ?? 'not_selected',
                  recommended_provider: recommendation.provider.toLowerCase(),
                  cta_location: 'ee_talktalk_decision_tool',
                })
              }
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              Compare available deals
            </Link>
          </>
        ) : (
          <p className="text-sm leading-6 text-slate-600">
            Select a priority, then show the result. You can change your answer without entering
            personal details.
          </p>
        )}
      </div>
    </section>
  )
}
