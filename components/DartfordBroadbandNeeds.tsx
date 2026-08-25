'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const needs = {
  everyday: {
    label: 'Everyday use',
    speed: '30 to 70 Mbps',
    advice: 'A superfast package should cover browsing, video calls and HD streaming for one or two people. Compare the total contract cost before paying extra for gigabit speed.',
  },
  family: {
    label: 'Busy household',
    speed: '100 to 300 Mbps',
    advice: 'A full-fibre package in this range gives several people room to stream, work and play online together. Check the guaranteed speed for your exact DA1 address.',
  },
  power: {
    label: 'Gaming and heavy use',
    speed: '500 Mbps to 1 Gbps',
    advice: 'Prioritise full fibre, upload speed and a wired router connection. Gigabit availability is high across DA1, but the result still varies by property and network.',
  },
} as const

type Need = keyof typeof needs

export default function DartfordBroadbandNeeds() {
  const [selected, setSelected] = useState<Need>('family')
  const recommendation = needs[selected]

  function chooseNeed(need: Need) {
    setSelected(need)
    trackEvent('local_speed_need_selected', {
      area_code: 'da1',
      household_need: need,
      recommended_speed_band: needs[need].speed,
    })
  }

  return (
    <section className="my-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7" aria-labelledby="dartford-speed-planner">
      <h2 id="dartford-speed-planner" className="text-xl font-bold text-slate-900">
        Choose a sensible broadband speed for your Dartford home
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        Pick the closest household type for a practical starting point. This is guidance, not an address-level availability result.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="Household broadband needs">
        {(Object.keys(needs) as Need[]).map((need) => (
          <button
            key={need}
            type="button"
            aria-pressed={selected === need}
            onClick={() => chooseNeed(need)}
            className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 ${
              selected === need
                ? 'border-sky-700 bg-sky-700 text-white'
                : 'border-slate-300 bg-white text-slate-800 hover:border-sky-500'
            }`}
          >
            {needs[need].label}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-white p-5 shadow-sm" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Suggested speed range</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">{recommendation.speed}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.advice}</p>
        <Link
          href="/compare"
          onClick={() => trackEvent('local_speed_plan_completed', {
            area_code: 'da1',
            household_need: selected,
            recommended_speed_band: recommendation.speed,
          })}
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
        >
          Compare deals for this speed
        </Link>
      </div>
    </section>
  )
}
