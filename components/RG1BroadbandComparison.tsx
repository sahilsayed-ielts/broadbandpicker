'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const choices = {
  lowest_cost: {
    label: 'Lowest total cost',
    speed: '30 to 100 Mbps',
    recommendation: 'Compare entry-level full-fibre and superfast packages confirmed for the RG1 address. Add every monthly payment and setup fee, then subtract guaranteed rewards. A cheap opening price is not the cheapest Reading broadband deal if scheduled rises make the full contract cost higher.',
    checks: ['Full minimum-term cost', 'Setup fees and rewards', 'Post-contract monthly price'],
  },
  busy_home: {
    label: 'Busy shared home',
    speed: '100 to 300 Mbps',
    recommendation: 'This is a practical range for several people streaming, gaming and joining video calls at once. RG1 has strong gigabit-capable coverage, but check the complete flat or house address because CityFibre, Openreach and Virgin Media do not have identical footprints.',
    checks: ['Exact-address availability', 'Minimum guaranteed speed', 'Router position and Wi-Fi reach'],
  },
  heavy_uploads: {
    label: 'Heavy use and uploads',
    speed: '500 Mbps to 1 Gbps',
    recommendation: 'Frequent cloud backups, large file transfers and many simultaneous users can justify a faster full-fibre plan. Compare upload speed and the physical network as well as the download headline, because Reading providers using different networks can sell packages with different upload performance.',
    checks: ['Stated upload speed', 'Network serving the property', 'Ethernet for fixed workstations'],
  },
} as const

type Choice = keyof typeof choices

export default function RG1BroadbandComparison() {
  const [selected, setSelected] = useState<Choice>('busy_home')
  const started = useRef(false)
  const result = choices[selected]

  function choose(choice: Choice) {
    setSelected(choice)
    if (!started.current) {
      started.current = true
      trackEvent('rg1_comparison_started', { area_code: 'rg1', comparison_goal: choice })
    }
  }

  function complete() {
    const parameters = {
      area_code: 'rg1',
      comparison_goal: selected,
      recommended_speed_band: result.speed,
    }
    trackEvent('rg1_comparison_completed', parameters)
    trackEvent('rg1_compare_deals_clicked', { ...parameters, cta_location: 'rg1_household_comparison' })
  }

  return (
    <section className="my-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7" aria-labelledby="rg1-household-comparison">
      <h2 id="rg1-household-comparison" className="text-2xl font-bold text-slate-900">
        Compare Reading broadband by household need
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        Choose the closest priority for a speed range and comparison checklist. The result is guidance, not confirmation that a package reaches your address.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="RG1 broadband comparison priorities">
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
          Compare broadband deals in Reading
        </Link>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-600">
        Static guide: 30 to 100 Mbps can suit light use, 100 to 300 Mbps is a useful starting point for a busy shared home, and 500 Mbps to 1 Gbps suits sustained heavy use or large uploads. Availability and estimated speed remain property-specific.
      </p>
    </section>
  )
}
