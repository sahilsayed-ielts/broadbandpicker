import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FAQAccordion from '@/components/FAQAccordion'
import NewsletterSignup from '@/components/NewsletterSignup'
import ShareBar from '@/components/ShareBar'
import { JsonLd } from '@/lib/jsonLd'
import {
  STALE_AFTER_DAYS,
  checkRange,
  cheapestProvider,
  latestMonth,
  monthLabel,
  priceIndex,
  providerRows,
  ukDate,
} from '@/lib/priceIndex'
import { SITE_URL } from '@/lib/siteSchema'

const PAGE_URL = `${SITE_URL}/research/broadband-price-index`
const CSV_URL = `${PAGE_URL}/data.csv`

const latest = latestMonth()
const cheapest = cheapestProvider(latest)
const range = checkRange()
const months = priceIndex.months

export const metadata: Metadata = {
  title: `UK Broadband Price Index ${monthLabel(latest.month)}`,
  description: `Median UK home broadband entry price across ${latest.basket.providers} tracked providers: £${latest.basket.median?.toFixed(2)} a month. Cheapest: ${cheapest.name} at £${cheapest.price.toFixed(2)}. Monthly data, free to cite.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `UK Broadband Price Index, ${monthLabel(latest.month)} | BroadbandPicker`,
    description: `Median entry price £${latest.basket.median?.toFixed(2)} a month across ${latest.basket.providers} UK providers.`,
    url: PAGE_URL,
  },
}

function money(value: number | null | undefined) {
  return value == null ? '–' : `£${value.toFixed(2)}`
}

function Change({ from, to }: { from: number | null; to: number }) {
  if (from == null) return <span className="text-slate-400">new</span>
  const diff = to - from
  if (Math.abs(diff) < 0.005) return <span className="text-slate-500">no change</span>
  return (
    <span className={diff < 0 ? 'font-semibold text-green-700' : 'font-semibold text-amber-700'}>
      {diff < 0 ? '−' : '+'}£{Math.abs(diff).toFixed(2)}
    </span>
  )
}

/** Median and cheapest by month, drawn to one shared scale. */
function TrendChart() {
  const w = 640
  const h = 220
  const pad = { l: 48, r: 16, t: 16, b: 32 }
  const series = [
    { key: 'median', label: 'Basket median', color: '#0369a1', values: months.map((m) => m.basket.median ?? 0) },
    { key: 'cheapest', label: 'Cheapest provider', color: '#15803d', values: months.map((m) => m.basket.cheapest ?? 0) },
  ]
  const max = Math.ceil(Math.max(...series.flatMap((s) => s.values)) / 5) * 5 + 5
  const ticks = Array.from({ length: max / 5 + 1 }, (_, i) => i * 5).filter((t) => t % 10 === 0 || max <= 20)
  const x = (i: number) => pad.l + (months.length === 1 ? (w - pad.l - pad.r) / 2 : (i * (w - pad.l - pad.r)) / (months.length - 1))
  const y = (v: number) => pad.t + (h - pad.t - pad.b) * (1 - v / max)
  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-4">
      <figcaption className="mb-2 flex flex-wrap gap-4 text-sm text-slate-600">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span className="inline-block h-0.5 w-5" style={{ background: s.color }} aria-hidden="true" />
            {s.label}
          </span>
        ))}
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Basket median and cheapest entry price by month">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray={t === 0 ? undefined : '2 4'} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">£{t}</text>
          </g>
        ))}
        {months.map((m, i) => (
          <text key={m.month} x={x(i)} y={h - 10} textAnchor="middle" fontSize="11" fill="#64748b">
            {new Date(`${m.month}-01T12:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
          </text>
        ))}
        {series.map((s) => (
          <g key={s.key}>
            <polyline fill="none" stroke={s.color} strokeWidth="2" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="4" fill={s.color} stroke="#fff" strokeWidth="2">
                <title>{`${monthLabel(months[i].month)}: ${s.label} £${v.toFixed(2)}`}</title>
              </circle>
            ))}
            <text x={x(s.values.length - 1) - 6} y={y(s.values[s.values.length - 1]) - 10} textAnchor="end" fontSize="12" fontWeight="600" fill="#0f172a">
              £{s.values[s.values.length - 1].toFixed(2)}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

const faqs = [
  {
    question: 'What does the BroadbandPicker price index measure?',
    answer:
      'The cheapest advertised home broadband package (the entry price) for each UK provider we track, as recorded in our dataset at the end of each month. The headline figure is the median across a fixed basket of providers that appear in every month, so a new provider joining does not move the number on its own.',
  },
  {
    question: 'Why use entry prices rather than all packages?',
    answer:
      'Entry prices are what providers advertise most prominently and what we verify on each provider’s own website. Faster tiers vary more by address and promotion, so we do not publish them as index data.',
  },
  {
    question: 'Can I use this data?',
    answer:
      'Yes. You can quote the figures or use the CSV with a credit and link to this page, for example: “Source: BroadbandPicker UK Broadband Price Index”.',
  },
  {
    question: 'Do these prices include mid-contract rises?',
    answer:
      'No. They are the advertised starting monthly price. Most large providers add a fixed rise each April. Our guide to deals with no mid-contract price rise lists providers that do not.',
  },
]

export default function BroadbandPriceIndexPage() {
  const rows = providerRows()
  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'UK Broadband Price Index',
    description: `Monthly entry price of home broadband for ${latest.providers} UK providers, with a like-for-like basket median. ${priceIndex.method}`,
    url: PAGE_URL,
    creator: { '@type': 'Organization', name: 'BroadbandPicker', url: SITE_URL },
    isAccessibleForFree: true,
    license: `${SITE_URL}/terms`,
    temporalCoverage: `${months[0].month}/${latest.month}`,
    spatialCoverage: { '@type': 'Country', name: 'United Kingdom' },
    variableMeasured: 'Advertised entry monthly price of home broadband (GBP)',
    dateModified: priceIndex.generated,
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: CSV_URL }],
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={datasetJsonLd} />
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Research', href: '/research/uk-broadband-customer-satisfaction' }, { name: 'Broadband price index', href: '/research/broadband-price-index' }]} />
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Monthly research · {monthLabel(latest.month)}</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">UK Broadband Price Index</h1>

      <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-6" aria-labelledby="summary">
        <h2 id="summary" className="text-xl font-bold text-slate-900">The figure for {monthLabel(latest.month)}</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          The median entry price for UK home broadband across {latest.basket.providers} tracked providers was{' '}
          <strong>{money(latest.basket.median)} a month</strong> in {monthLabel(latest.month)}. The cheapest entry price
          was {cheapest.name} at {money(cheapest.price)} a month. Prices were last checked on providers&apos; own websites
          between {range.oldest ? ukDate(range.oldest) : '–'} and {range.newest ? ukDate(range.newest) : '–'}.
        </p>
      </section>

      {(latest.rechecked ?? 0) > 0 && months.length > 1 && (
        <p className="mt-4 rounded-xl border border-sky-200 bg-white p-4 text-sm text-slate-700" role="note">
          We re-checked {latest.rechecked} providers&apos; prices on their own websites in {monthLabel(latest.month)}. Earlier months
          come from our previous check, so a difference from last month can be a correction to a price that had already
          changed, not a change made this month.
        </p>
      )}

      {range.staleCount > 0 && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
          {range.staleCount} of {range.total} prices were checked more than {STALE_AFTER_DAYS} days ago and are due a
          re-check. Months marked “carried” had no recorded price change; that does not mean we confirmed prices stayed the same.
        </p>
      )}

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: 'Basket median', v: money(latest.basket.median) },
          { k: 'Basket average', v: money(latest.basket.average) },
          { k: 'Cheapest entry price', v: money(cheapest.price), sub: cheapest.name },
          { k: 'Providers tracked', v: String(latest.providers) },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-slate-200 bg-white p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.k}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{s.v}</dd>
            {s.sub && <dd className="text-sm text-slate-500">{s.sub}</dd>}
          </div>
        ))}
      </dl>

      <section className="mt-10" aria-labelledby="trend">
        <h2 id="trend" className="mb-4 text-2xl font-bold text-slate-900">Trend</h2>
        <TrendChart />
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="p-3">Month</th><th className="p-3 text-right">Basket median</th><th className="p-3 text-right">Cheapest</th><th className="p-3 text-right">Providers</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className="border-t border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{monthLabel(m.month)}</td>
                  <td className="p-3 text-right tabular-nums">{money(m.basket.median)}</td>
                  <td className="p-3 text-right tabular-nums">{money(m.basket.cheapest)}</td>
                  <td className="p-3 text-right tabular-nums">{m.providers}</td>
                  <td className="p-3 text-slate-500">{m.rechecked ? `Re-checked (${m.rechecked} providers)` : m.carried ? 'Carried (no change recorded)' : 'Recorded'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="providers">
        <h2 id="providers" className="mb-4 text-2xl font-bold text-slate-900">Entry price by provider</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="p-3">Provider</th>
                <th className="p-3 text-right">Entry price</th>
                <th className="p-3 text-right">vs last month</th>
                <th className="p-3 text-right">vs {monthLabel(months[0].month)}</th>
                <th className="p-3">Price checked</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-t border-slate-100">
                  <td className="p-3"><Link href={`/providers/${r.slug}`} className="font-semibold text-slate-900 hover:text-sky-700">{r.name}</Link></td>
                  <td className="p-3 text-right font-semibold tabular-nums">{money(r.current)}</td>
                  <td className="p-3 text-right tabular-nums"><Change from={r.previous} to={r.current} /></td>
                  <td className="p-3 text-right tabular-nums"><Change from={r.first} to={r.current} /></td>
                  <td className={`p-3 ${r.stale ? 'text-amber-700' : 'text-slate-500'}`}>{r.verified ? ukDate(r.verified) : '–'}{r.stale ? ' (due)' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          <a href="/research/broadband-price-index/data.csv" className="font-semibold text-sky-700 hover:underline">Download the data (CSV)</a>
          {' · '}Free to use with a credit and link to this page.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="method">
        <h2 id="method" className="text-xl font-bold text-slate-900">How we build the index</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>For each provider we record the cheapest advertised home broadband package price, checked on the provider&apos;s own website. The check date for each provider is shown above.</li>
          <li>The headline median uses a fixed basket of {priceIndex.basket.length} providers present in every published month, so a provider joining or leaving does not move it.</li>
          <li>Each month uses our dataset as it stood at month end. A month with no recorded change is marked “carried”.</li>
          <li>Prices are national starting prices. What you pay depends on your address, contract length and any promotion.</li>
          <li>The series starts in August 2026, the first month after we verified every provider&apos;s prices. See <Link href="/how-we-review-broadband" className="text-sky-700 hover:underline">how we review broadband</Link>.</li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="cite">
        <h2 id="cite" className="text-xl font-bold text-slate-900">Cite or share</h2>
        <p className="mt-2 select-all rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800">
          Source: BroadbandPicker UK Broadband Price Index, {monthLabel(latest.month)}. {PAGE_URL}
        </p>
        <div className="mt-4">
          <ShareBar
            url="/research/broadband-price-index"
            title={`UK Broadband Price Index, ${monthLabel(latest.month)}`}
            text={`Median UK broadband entry price: ${money(latest.basket.median)} a month (${monthLabel(latest.month)}).`}
            contentType="price_index"
            itemId={latest.month}
            placement="price_index"
          />
        </div>
      </section>

      <section className="mt-10">
        <NewsletterSignup variant="page" source="price-index" />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Questions</h2>
        <FAQAccordion items={faqs} />
      </section>
    </div>
  )
}
