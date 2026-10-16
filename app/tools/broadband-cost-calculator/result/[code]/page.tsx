import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import ShareBar from '@/components/ShareBar'
import { costTotals, parseCostCode } from '@/lib/shareCodes'
import { SITE_URL } from '@/lib/siteSchema'

type Props = { params: Promise<{ code: string }> }
const money = (v: number) => `£${Math.max(0, v).toFixed(2)}`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const c = parseCostCode(code)
  if (!c) return { robots: { index: false, follow: false } }
  const t = costTotals(c)
  const title = `${money(c.monthly)} a month really costs ${money(t.trueMonthlyCost)}`
  const description = `Broadband true-cost calculation: ${money(t.totalContractCost)} over a ${c.months}-month contract including setup and cashback.`
  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/tools/broadband-cost-calculator` },
    openGraph: { title: `${title} | BroadbandPicker`, description, url: `${SITE_URL}/tools/broadband-cost-calculator/result/${code}` },
  }
}

export default async function CostResultPage({ params }: Props) {
  const { code } = await params
  const c = parseCostCode(code)
  if (!c) notFound()
  const t = costTotals(c)
  const rows = [
    { k: 'Advertised monthly price', v: money(c.monthly) },
    { k: 'Contract length', v: `${c.months} months` },
    { k: 'Setup or activation fee', v: money(c.setup) },
    { k: 'Cashback or one-off discount', v: c.cashback > 0 ? `−${money(c.cashback)}` : '£0.00' },
    ...(c.speed ? [{ k: 'Download speed', v: `${c.speed} Mbps` }] : []),
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Tools', href: '/tools' }, { name: 'Cost calculator', href: '/tools/broadband-cost-calculator' }, { name: 'Shared result', href: `/tools/broadband-cost-calculator/result/${code}` }]} />
      <div className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">Shared calculation</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{money(c.monthly)} a month really costs {money(t.trueMonthlyCost)}</h1>
        <p className="mt-2 text-slate-300">
          {money(t.totalContractCost)} over the whole {c.months}-month contract.
          {Math.abs(t.difference) > 0.005 && ` That is ${money(Math.abs(t.difference))} a month ${t.difference > 0 ? 'more' : 'less'} than advertised.`}
        </p>
        <dl className="mt-6 divide-y divide-slate-800 rounded-xl bg-slate-800/60 px-4">
          {rows.map((row) => (
            <div key={row.k} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-slate-400">{row.k}</dt>
              <dd className="font-semibold tabular-nums">{row.v}</dd>
            </div>
          ))}
          {t.costPerMbps !== null && (
            <div className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-slate-400">Cost per Mbps, per month</dt>
              <dd className="font-semibold tabular-nums">£{t.costPerMbps.toFixed(2)}</dd>
            </div>
          )}
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/tools/broadband-cost-calculator" className="flex-1 rounded-xl bg-sky-500 px-6 py-3 text-center font-bold text-white hover:bg-sky-600">Work out my own deal</Link>
          <Link href="/guides/broadband-deals-with-no-mid-contract-price-rise" className="flex-1 rounded-xl border border-slate-600 px-6 py-3 text-center font-semibold text-slate-200 hover:border-slate-400">Deals with no price rises</Link>
        </div>
      </div>
      <div className="mt-6">
        <ShareBar url={`/tools/broadband-cost-calculator/result/${code}`} title="Broadband true-cost calculation" text={`${money(c.monthly)}/month broadband really costs ${money(t.trueMonthlyCost)}/month:`} contentType="cost_calculator_result" placement="cost_result_page" />
      </div>
      <p className="mt-6 text-xs text-slate-500">Uses only the figures entered. It does not include scheduled mid-contract price rises; check each deal&apos;s price-change terms.</p>
    </div>
  )
}
