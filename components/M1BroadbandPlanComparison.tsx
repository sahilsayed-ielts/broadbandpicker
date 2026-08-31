'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const scenarios = {
  everyday: {
    label: 'Everyday use',
    speed: '30 to 70 Mbps',
    advice: 'A superfast plan can cover browsing, video calls and HD streaming for one or two people. In M1, 86% of the sampled postcode units were superfast-capable, but the provider must still confirm your flat or building.',
    checks: ['Compare the full minimum-term cost', 'Check the guaranteed speed', 'Place the router away from thick walls'],
  },
  shared: {
    label: 'Shared home',
    speed: '100 to 300 Mbps',
    advice: 'This is a practical starting range for several people streaming, gaming and working at once. Prioritise FTTP where your M1 address can order it, then compare contract cost and upload speed rather than paying for 1 Gbps by default.',
    checks: ['Confirm FTTP at the exact address', 'Compare upload as well as download speed', 'Check router coverage across the property'],
  },
  upload: {
    label: 'Upload-heavy work',
    speed: '500 Mbps to 1 Gbps',
    advice: 'Frequent cloud backups, large media uploads and many simultaneous users can justify a faster full-fibre plan. Compare upload speeds carefully because packages with similar downloads can differ, and some M1 apartment blocks have building-specific networks.',
    checks: ['Ask which network enters the building', 'Compare stated upload speeds', 'Use Ethernet for a fixed work setup'],
  },
} as const

type Scenario = keyof typeof scenarios

export default function M1BroadbandPlanComparison() {
  const [selected, setSelected] = useState<Scenario>('shared')
  const started = useRef(false)
  const recommendation = scenarios[selected]

  function selectScenario(scenario: Scenario) {
    setSelected(scenario)
    if (!started.current) {
      started.current = true
      trackEvent('m1_plan_comparison_started', {
        area_code: 'm1',
        plan_scenario: scenario,
      })
    }
  }

  function completeComparison() {
    const parameters = {
      area_code: 'm1',
      plan_scenario: selected,
      speed_band: recommendation.speed,
    }
    trackEvent('m1_plan_comparison_completed', parameters)
    trackEvent('m1_compare_deals_clicked', {
      ...parameters,
      cta_location: 'm1_plan_comparison',
    })
  }

  return (
    <section className="my-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7" aria-labelledby="m1-plan-comparison">
      <h2 id="m1-plan-comparison" className="text-2xl font-bold text-slate-900">
        Compare M1 internet plans by household need
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        Choose the closest scenario to get a useful speed range and a building-check list. This planner does not claim that a package is available at your address.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="M1 broadband plan scenarios">
        {(Object.keys(scenarios) as Scenario[]).map((scenario) => (
          <button
            key={scenario}
            type="button"
            aria-pressed={selected === scenario}
            onClick={() => selectScenario(scenario)}
            className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 motion-reduce:transition-none ${
              selected === scenario
                ? 'border-sky-800 bg-sky-800 text-white'
                : 'border-slate-300 bg-white text-slate-800 hover:border-sky-600'
            }`}
          >
            {scenarios[scenario].label}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-white p-5 shadow-sm" aria-live="polite" aria-atomic="true">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Suggested download range</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">{recommendation.speed}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{recommendation.advice}</p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          {recommendation.checks.map((check) => (
            <li key={check} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span aria-hidden="true" className="mr-2 font-bold text-green-700">✓</span>{check}
            </li>
          ))}
        </ul>
        <Link
          href="/compare"
          onClick={completeComparison}
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
        >
          Compare M1 broadband deals
        </Link>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-600">
        Static guide: 30 to 70 Mbps suits light use, 100 to 300 Mbps gives a shared home more capacity, and 500 Mbps to 1 Gbps is most useful for heavy simultaneous use or large transfers. Exact availability, minimum speed and Wi-Fi performance remain property-specific.
      </p>
    </section>
  )
}
