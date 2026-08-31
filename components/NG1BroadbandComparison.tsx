'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const choices = {
  budget: {
    label: 'Lowest total cost',
    speed: '30 to 70 Mbps',
    recommendation: 'Start with superfast and entry-level full-fibre plans confirmed for your NG1 address. Compare the full minimum-term cost after setup fees, rewards and stated price rises. Paying for gigabit service rarely makes sense for one or two light users.',
    checks: ['Total contract cost', 'Setup and exit fees', 'Price after the minimum term'],
  },
  shared: {
    label: 'Shared flat or house',
    speed: '100 to 300 Mbps',
    recommendation: 'This range gives several people room for streaming, video calls and gaming at the same time. In an NG1 flat, check the complete address and flat number because fibre availability and installation permission can differ within the same building.',
    checks: ['Exact flat availability', 'Minimum guaranteed speed', 'Router position and Wi-Fi reach'],
  },
  heavy: {
    label: 'Heavy use and uploads',
    speed: '500 Mbps to 1 Gbps',
    recommendation: 'A faster full-fibre or cable plan is most useful for large transfers, frequent cloud backups and many simultaneous users. Compare upload speed as well as download speed, and confirm which physical network reaches the property before choosing a retailer.',
    checks: ['Upload speed', 'Network at the building', 'Ethernet for fixed workstations'],
  },
} as const

type Choice = keyof typeof choices

export default function NG1BroadbandComparison() {
  const [selected, setSelected] = useState<Choice>('shared')
  const started = useRef(false)
  const result = choices[selected]

  function choose(choice: Choice) {
    setSelected(choice)
    if (!started.current) {
      started.current = true
      trackEvent('ng1_comparison_started', { area_code: 'ng1', comparison_goal: choice })
    }
  }

  function complete() {
    const parameters = {
      area_code: 'ng1',
      comparison_goal: selected,
      recommended_speed_band: result.speed,
    }
    trackEvent('ng1_comparison_completed', parameters)
    trackEvent('ng1_compare_deals_clicked', { ...parameters, cta_location: 'ng1_household_comparison' })
  }

  return (
    <section className="my-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7" aria-labelledby="ng1-household-comparison">
      <h2 id="ng1-household-comparison" className="text-2xl font-bold text-slate-900">
        Compare NG1 broadband by what matters most
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        Choose one priority for a sensible speed range and a short comparison checklist. This does not replace a provider&apos;s full-address availability check.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="NG1 broadband comparison priorities">
        {(Object.keys(choices) as Choice[]).map((choice) => (
          <button
            key={choice}
            type="button"
            aria-pressed={selected === choice}
            onClick={() => choose(choice)}
            className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 motion-reduce:transition-none ${
              selected === choice
                ? 'border-sky-800 bg-sky-800 text-white'
                : 'border-slate-300 bg-white text-slate-800 hover:border-sky-600'
            }`}
          >
            {choices[choice].label}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-white p-5 shadow-sm" aria-live="polite" aria-atomic="true">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Suggested download range</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">{result.speed}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{result.recommendation}</p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          {result.checks.map((check) => (
            <li key={check} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span aria-hidden="true" className="mr-2 font-bold text-green-700">✓</span>{check}
            </li>
          ))}
        </ul>
        <Link
          href="/compare"
          onClick={complete}
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
        >
          Compare broadband deals in Nottingham
        </Link>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-600">
        Static guide: 30 to 70 Mbps can suit light use, 100 to 300 Mbps is a useful starting point for a shared home, and 500 Mbps to 1 Gbps suits sustained heavy use. Availability, estimated speed and installation requirements remain property-specific.
      </p>
    </section>
  )
}
