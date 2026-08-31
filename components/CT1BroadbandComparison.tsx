'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const choices = {
  light_use: {
    label: 'One or two light users',
    speed: '30 to 70 Mbps',
    recommendation: 'Start with superfast and entry-level full-fibre packages confirmed for the CT1 address. Compare the total minimum-term cost, not only the opening monthly price. This range can cover browsing, video calls and one 4K stream without paying for capacity the household is unlikely to use.',
    checks: ['Total contract cost', 'Minimum guaranteed speed', 'Price after the minimum term'],
  },
  shared_home: {
    label: 'Shared or family home',
    speed: '100 to 300 Mbps',
    recommendation: 'This is a useful starting range when several people stream, study, game or make video calls at once. CT1 coverage varies by property, so check the full address and flat number before comparing installation, upload speed and contract terms.',
    checks: ['Exact-address availability', 'Upload speed', 'Router position and Wi-Fi reach'],
  },
  heavy_use: {
    label: 'Heavy use and uploads',
    speed: '500 Mbps to 1 Gbps',
    recommendation: 'A faster full-fibre or cable package is most useful for frequent large transfers, cloud backups and many simultaneous users. Ofcom-derived CT1 data shows a meaningful gigabit coverage gap, so keep a lower-speed fallback and confirm the physical network serving the property.',
    checks: ['Network at the property', 'Stated upload speed', 'Setup work and permissions'],
  },
} as const

type Choice = keyof typeof choices

export default function CT1BroadbandComparison() {
  const [selected, setSelected] = useState<Choice>('shared_home')
  const started = useRef(false)
  const result = choices[selected]

  function choose(choice: Choice) {
    setSelected(choice)
    if (!started.current) {
      started.current = true
      trackEvent('ct1_comparison_started', { area_code: 'ct1', household_type: choice })
    }
  }

  function complete() {
    const parameters = {
      area_code: 'ct1',
      household_type: selected,
      recommended_speed_band: result.speed,
    }
    trackEvent('ct1_comparison_completed', parameters)
    trackEvent('ct1_compare_deals_clicked', { ...parameters, cta_location: 'ct1_household_comparison' })
  }

  return (
    <section className="my-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7" aria-labelledby="ct1-household-comparison">
      <h2 id="ct1-household-comparison" className="text-2xl font-bold text-slate-900">
        Compare Canterbury broadband by household use
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        Choose the closest household type for a practical speed range and checklist. The result is guidance, not confirmation that a package is available at your address.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="CT1 household broadband choices">
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
          Compare broadband deals in Canterbury
        </Link>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-600">
        Static guide: 30 to 70 Mbps can suit light use, 100 to 300 Mbps is a sensible starting point for a shared home, and 500 Mbps to 1 Gbps suits sustained heavy use. Availability, estimated speed and installation requirements remain property-specific.
      </p>
    </section>
  )
}
