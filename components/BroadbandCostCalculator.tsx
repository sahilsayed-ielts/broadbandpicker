'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

function parseNumber(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function formatMoney(value: number): string {
  return `£${value.toFixed(2)}`
}

export default function BroadbandCostCalculator() {
  const [monthlyPrice, setMonthlyPrice] = useState('30.00')
  const [contractLength, setContractLength] = useState('24')
  const [setupFee, setSetupFee] = useState('0')
  const [cashback, setCashback] = useState('0')
  const [speed, setSpeed] = useState('')

  const result = useMemo(() => {
    const price = parseNumber(monthlyPrice)
    const months = Math.max(1, parseNumber(contractLength))
    const setup = parseNumber(setupFee)
    const cash = parseNumber(cashback)
    const mbps = parseNumber(speed)

    const totalContractCost = price * months + setup - cash
    const trueMonthlyCost = totalContractCost / months
    const difference = trueMonthlyCost - price
    const costPerMbps = mbps > 0 ? trueMonthlyCost / mbps : null

    return { price, months, totalContractCost, trueMonthlyCost, difference, costPerMbps }
  }, [monthlyPrice, contractLength, setupFee, cashback, speed])

  const fields: {
    label: string
    hint: string
    value: string
    setValue: (v: string) => void
    prefix?: string
    suffix?: string
  }[] = [
    { label: 'Advertised monthly price', hint: 'The headline price shown on the deal', value: monthlyPrice, setValue: setMonthlyPrice, prefix: '£' },
    { label: 'Contract length', hint: 'In months — e.g. 24 for a 24-month contract', value: contractLength, setValue: setContractLength, suffix: 'months' },
    { label: 'One-off setup or activation fee', hint: 'Enter 0 if none', value: setupFee, setValue: setSetupFee, prefix: '£' },
    { label: 'Cashback or one-off discount', hint: 'Only count this if you are confident you will claim it', value: cashback, setValue: setCashback, prefix: '£' },
    { label: 'Download speed (optional)', hint: 'Enter the package speed to see cost per Mbps', value: speed, setValue: setSpeed, suffix: 'Mbps' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <label key={field.label} className="block">
            <span className="block text-sm font-semibold text-white mb-1">{field.label}</span>
            <div className="relative">
              {field.prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{field.prefix}</span>
              )}
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={field.value}
                onChange={(e) => field.setValue(e.target.value)}
                className={`w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm py-2.5 ${field.prefix ? 'pl-7' : 'pl-3'} ${field.suffix ? 'pr-16' : 'pr-3'} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
              {field.suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{field.suffix}</span>
              )}
            </div>
            <span className="block text-xs text-slate-500 mt-1">{field.hint}</span>
          </label>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-slate-800/60 p-6 sm:p-7">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/60 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total contract cost</div>
            <div className="text-2xl font-black text-white tabular-nums">{formatMoney(Math.max(0, result.totalContractCost))}</div>
            <div className="text-xs text-slate-500 mt-1">over {result.months} months</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 ring-1 ring-sky-500/40">
            <div className="text-xs text-sky-400 uppercase tracking-wide mb-1">True average monthly cost</div>
            <div className="text-2xl font-black text-white tabular-nums">{formatMoney(Math.max(0, result.trueMonthlyCost))}</div>
            <div className={`text-xs mt-1 ${result.difference > 0.005 ? 'text-amber-400' : result.difference < -0.005 ? 'text-green-400' : 'text-slate-500'}`}>
              {result.difference > 0.005
                ? `${formatMoney(result.difference)}/mo more than advertised`
                : result.difference < -0.005
                  ? `${formatMoney(Math.abs(result.difference))}/mo less than advertised`
                  : 'Matches the advertised price'}
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Cost per Mbps</div>
            <div className="text-2xl font-black text-white tabular-nums">
              {result.costPerMbps !== null ? `${formatMoney(result.costPerMbps)}` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">{result.costPerMbps !== null ? 'per Mbps, per month' : 'enter a speed to see this'}</div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-5 leading-relaxed">
          This is a general calculation using the figures you enter. It does not include scheduled mid-contract
          price rises, which many UK providers apply annually — check the deal&apos;s price-change terms separately.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link
          href="/compare"
          className="flex-1 text-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-colors"
        >
          Compare broadband deals →
        </Link>
        <Link
          href="/guides/broadband-price-rises-2026"
          className="flex-1 text-center px-6 py-3 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
        >
          Understand mid-contract price rises
        </Link>
      </div>
    </div>
  )
}
