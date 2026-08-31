'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

type Deal = { monthly: string; months: string; setup: string; reward: string }

const initialDeals: [Deal, Deal] = [
  { monthly: '23.99', months: '24', setup: '30', reward: '100' },
  { monthly: '20', months: '24', setup: '0', reward: '0' },
]

function amount(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export default function CashbackDealComparison() {
  const [deals, setDeals] = useState<[Deal, Deal]>(initialDeals)
  const [claimReward, setClaimReward] = useState(true)
  const [complete, setComplete] = useState(false)
  const started = useRef(false)

  const results = useMemo(() => deals.map((deal) => {
    const months = Math.max(1, Math.round(amount(deal.months)))
    const gross = amount(deal.monthly) * months + amount(deal.setup)
    const reward = claimReward ? Math.min(amount(deal.reward), gross) : 0
    const net = gross - reward
    return { gross, net, months, monthly: net / months }
  }), [claimReward, deals])

  function updateDeal(index: 0 | 1, field: keyof Deal, value: string) {
    setDeals((current) => {
      const next: [Deal, Deal] = [{ ...current[0] }, { ...current[1] }]
      next[index][field] = value
      return next
    })
    setComplete(false)
    if (!started.current) {
      started.current = true
      trackEvent('cashback_comparison_started', { first_field: field })
    }
  }

  function compare() {
    setComplete(true)
    const winner = results[0].net === results[1].net ? 'tie' : results[0].net < results[1].net ? 'deal_a' : 'deal_b'
    trackEvent('cashback_comparison_completed', { reward_claimed: claimReward, lower_cost_option: winner })
  }

  return (
    <section className="mb-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7" aria-labelledby="cashback-comparison-heading">
      <h2 id="cashback-comparison-heading" className="text-xl font-bold text-slate-900">Compare two broadband rewards by real contract cost</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Enter the advertised monthly price, minimum term, setup fee and reward for two offers. The result subtracts the reward only when you say you expect to claim it. Scheduled price rises are not calculated here, so add their total to the setup-fee field or use the full cost shown at checkout.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {deals.map((deal, index) => (
          <fieldset key={index} className="rounded-xl border border-slate-200 bg-white p-4">
            <legend className="px-1 font-bold text-slate-900">Deal {index === 0 ? 'A' : 'B'}</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {([
                ['monthly', 'Monthly price (£)'], ['months', 'Contract (months)'],
                ['setup', 'Setup and rises (£)'], ['reward', 'Reward value (£)'],
              ] as const).map(([field, label]) => (
                <label key={field} className="text-sm font-medium text-slate-700">
                  {label}
                  <input type="number" min="0" step={field === 'months' ? '1' : '0.01'} inputMode="decimal" value={deal[field]}
                    onChange={(event) => updateDeal(index as 0 | 1, field, event.target.value)}
                    className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-1" />
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <label className="mt-4 flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
        <input type="checkbox" checked={claimReward} onChange={(event) => { setClaimReward(event.target.checked); setComplete(false) }} className="h-5 w-5 accent-sky-700" />
        Include rewards because I expect to claim and use them
      </label>
      <button type="button" onClick={compare} className="mt-4 min-h-11 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
        Compare real costs
      </button>
      <div className="mt-5 min-h-28 rounded-xl bg-white p-5" role="status" aria-live="polite" aria-atomic="true">
        {complete ? (
          <>
            <p className="font-bold text-slate-900">{results[0].net === results[1].net ? 'The two deals cost the same.' : `Deal ${results[0].net < results[1].net ? 'A' : 'B'} has the lower calculated cost.`}</p>
            <ul className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              {results.map((result, index) => <li key={index}><strong>Deal {index === 0 ? 'A' : 'B'}:</strong> £{result.net.toFixed(2)} total, or £{result.monthly.toFixed(2)} a month after the included reward.</li>)}
            </ul>
            <Link href="/compare" onClick={() => trackEvent('cashback_compare_deals_clicked', { cta_location: 'cashback_cost_comparison', reward_claimed: claimReward })}
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">
              Check deals available at your address
            </Link>
          </>
        ) : <p className="text-sm leading-6 text-slate-600">Adjust either offer, choose whether to count the rewards, then compare. No personal details are collected.</p>}
      </div>
    </section>
  )
}
