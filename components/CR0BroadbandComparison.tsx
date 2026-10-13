'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const choices = {
  budget: {
    label: 'Keep the total cost down',
    speed: '30 to 100 Mbps',
    recommendation: 'Start with packages confirmed for the complete CR0 address, then compare the full minimum-term cost rather than the opening monthly price. Include setup fees, guaranteed rewards, stated price rises and the price after the contract ends.',
    checks: ['Total contract cost', 'Price rises and setup fees', 'Out-of-contract price'],
  },
  busy_home: {
    label: 'Support a busy household',
    speed: '100 to 300 Mbps',
    recommendation: 'This is a useful starting range when several people stream, game, study or make video calls at once. Compare the personalised speed estimate, minimum guaranteed speed and router placement before paying for a faster tier.',
    checks: ['Address-level speed estimate', 'Minimum guaranteed speed', 'Whole-home Wi-Fi needs'],
  },
  heavy_use: {
    label: 'Prioritise speed and uploads',
    speed: '500 Mbps to 1 Gbps+',
    recommendation: 'Full fibre or cable can suit frequent large downloads, cloud backups and many simultaneous users. Compare upload speed as well as download speed. CR0 being gigabit-capable at area level does not mean every property can order a gigabit package.',
    checks: ['Upload and download speed', 'Network at the property', 'Installation requirements'],
  },
} as const

type Choice = keyof typeof choices

export default function CR0BroadbandComparison() {
  const [selected, setSelected] = useState<Choice>('busy_home')
  const started = useRef(false)
  const result = choices[selected]

  function choose(choice: Choice) {
    setSelected(choice)
    if (!started.current) {
      started.current = true
      trackEvent('cr0_comparison_started', { area_code: 'cr0', comparison_goal: choice })
    }
  }

  function complete() {
    const parameters = { area_code: 'cr0', comparison_goal: selected, recommended_speed_band: result.speed }
    trackEvent('cr0_comparison_completed', parameters)
    trackEvent('cr0_compare_deals_clicked', { ...parameters, cta_location: 'cr0_household_comparison' })
  }

  return (
    <section className="my-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7" aria-labelledby="cr0-household-comparison">
      <h2 id="cr0-household-comparison" className="text-2xl font-bold text-slate-900">Find the right broadband speed for your Croydon home</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">Choose your main priority for a practical starting range and comparison checklist. Only a complete-address check can confirm an orderable package.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="Croydon broadband comparison priorities">
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
        <Link href="/compare" onClick={complete} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Compare broadband deals in Croydon</Link>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-600">We may earn a commission if you choose a deal through BroadbandPicker. This does not increase the price you pay or change how results are ordered.</p>
    </section>
  )
}
