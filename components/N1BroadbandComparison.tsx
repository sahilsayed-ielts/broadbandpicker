'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const choices = {
  flexible: {
    label: 'Renting or likely to move',
    speed: '30 to 150 Mbps',
    recommendation: 'Start with packages available at the complete flat address, then match the minimum term to your tenancy. A lower monthly price can be poor value if an early move creates exit charges or the provider cannot transfer service.',
    checks: ['Contract length', 'Home-moving terms', 'Building installation rules'],
  },
  busy_home: {
    label: 'Busy shared home',
    speed: '100 to 300 Mbps',
    recommendation: 'This is a practical starting range for several people streaming, gaming, studying and making video calls. Compare the personalised estimate, upload speed and minimum guaranteed speed rather than buying the largest headline number.',
    checks: ['Address-level estimate', 'Upload speed', 'Whole-home Wi-Fi'],
  },
  heavy_use: {
    label: 'Heavy use and large uploads',
    speed: '500 Mbps to 1 Gbps+',
    recommendation: 'A full-fibre or cable plan can suit large transfers, cloud backup and many simultaneous users. N1 has several physical networks, but the building—not the postcode district alone—determines which one you can order.',
    checks: ['Network in the building', 'Wired and Wi-Fi capability', 'Total contract cost'],
  },
} as const

type Choice = keyof typeof choices

export default function N1BroadbandComparison() {
  const [selected, setSelected] = useState<Choice>('busy_home')
  const started = useRef(false)
  const result = choices[selected]

  function choose(choice: Choice) {
    setSelected(choice)
    if (!started.current) {
      started.current = true
      trackEvent('n1_comparison_started', { area_code: 'n1', comparison_goal: choice })
    }
  }

  function complete() {
    const parameters = { area_code: 'n1', comparison_goal: selected, recommended_speed_band: result.speed }
    trackEvent('n1_comparison_completed', parameters)
    trackEvent('n1_compare_deals_clicked', { ...parameters, cta_location: 'n1_household_comparison' })
  }

  return (
    <section className="my-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7" aria-labelledby="n1-household-comparison">
      <h2 id="n1-household-comparison" className="text-2xl font-bold text-slate-900">Choose broadband for your N1 home</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">Choose the situation closest to yours for a sensible starting speed and the checks that matter. This guidance cannot confirm availability at one property.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="N1 broadband comparison priorities">
        {(Object.keys(choices) as Choice[]).map((choice) => (
          <button key={choice} type="button" aria-pressed={selected === choice} onClick={() => choose(choice)} className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-700 ${selected === choice ? 'border-sky-800 bg-sky-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:border-sky-600'}`}>
            {choices[choice].label}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-white p-5 shadow-sm" aria-live="polite" aria-atomic="true">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Suggested download range</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">{result.speed}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{result.recommendation}</p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          {result.checks.map((check) => <li key={check} className="rounded-lg border border-slate-200 bg-slate-50 p-3"><span aria-hidden="true" className="mr-2 font-bold text-green-700">✓</span>{check}</li>)}
        </ul>
        <Link href="/compare" onClick={complete} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Compare broadband deals in Islington</Link>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-600">We may earn a commission if you choose a deal through BroadbandPicker. This does not increase the price you pay or change how results are ordered.</p>
    </section>
  )
}
