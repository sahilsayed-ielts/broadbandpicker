'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AffiliateCTA from '@/components/AffiliateCTA'
import ProviderLogo from '@/components/ProviderLogo'
import SaveDealButton from '@/components/SaveDealButton'
import { trackEvent } from '@/lib/analytics'
import {
  tvBundleOptions,
  tvBundleContentTagLabels,
  type TvBundleContentTag,
} from '@/data/tvBroadbandBundles'
import {
  TV_NEED_EVENT,
  checkedLabel,
  contractTotal,
  gbp,
  speedLabel,
  startMonthOptions,
  totalIsPartial,
  type TvBundleSortKey,
  type TvNeedDetail,
} from '@/lib/tvBundleCost'

type SortKey = TvBundleSortKey

interface TvBundleDealCardsProps {
  /** Provider slug -> tracked affiliate URL, resolved on the server from data/providers.ts. */
  affiliateUrls: Record<string, string>
  /** Package name -> editorial "Our pick" label, matching the page's verdict. */
  picks?: Record<string, string>
  /** ISO date the page was rendered on the server; the browser swaps in today after mount. */
  renderedAt: string
}

const SPEED_OPTIONS = [0, 100, 300, 900]

// Only offer content filters that at least one listed bundle can satisfy.
const TAGS = (Object.keys(tvBundleContentTagLabels) as TvBundleContentTag[]).filter((tag) =>
  tvBundleOptions.some((bundle) => bundle.contentTags.includes(tag)),
)
const PROVIDERS = Array.from(new Set(tvBundleOptions.map((bundle) => bundle.provider)))

export default function TvBundleDealCards({ affiliateUrls, picks = {}, renderedAt }: TvBundleDealCardsProps) {
  // Static pages are rendered at build time, so start from the server's date to
  // keep hydration stable, then move to the visitor's current month.
  const [months, setMonths] = useState(() => startMonthOptions(new Date(renderedAt)))
  const [watch, setWatch] = useState<TvBundleContentTag[]>([])
  const [minSpeed, setMinSpeed] = useState(0)
  const [provider, setProvider] = useState('')
  const [start, setStart] = useState(months[0].value)
  const [sort, setSort] = useState<SortKey>('monthly')
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    function applyNeed(event: Event) {
      const detail = (event as CustomEvent<TvNeedDetail>).detail
      setWatch(detail.watch)
      setSort(detail.sort)
      setMinSpeed(0)
      setProvider('')
    }
    window.addEventListener(TV_NEED_EVENT, applyNeed)
    return () => window.removeEventListener(TV_NEED_EVENT, applyNeed)
  }, [])

  useEffect(() => {
    const current = startMonthOptions(new Date())
    if (current[0].value !== months[0].value) {
      setMonths(current)
      setStart(current[0].value)
    }
    // Only re-anchor once, after mount.
  }, [])

  function noteInteraction(control: string, value: string) {
    if (!interacted) {
      setInteracted(true)
      trackEvent('tv_bundle_tool_started', { first_control: control })
    }
    trackEvent(control === 'sort' ? 'tv_bundle_sort_change' : 'tv_bundle_filter_change', {
      control,
      value: value || 'none',
    })
  }

  function toggleTag(tag: TvBundleContentTag) {
    const next = watch.includes(tag) ? watch.filter((t) => t !== tag) : [...watch, tag]
    setWatch(next)
    noteInteraction('watch', next.join(','))
  }

  function clearFilters() {
    setWatch([])
    setMinSpeed(0)
    setProvider('')
  }

  const withTotals = useMemo(
    () => tvBundleOptions.map((bundle) => ({ bundle, total: contractTotal(bundle, start) })),
    [start],
  )

  const badges = useMemo(() => {
    const cheapest = withTotals.reduce((a, b) => (b.bundle.monthlyPrice < a.bundle.monthlyPrice ? b : a))
    const lowestTotal = withTotals.reduce((a, b) => (b.total < a.total ? b : a))
    const fastest = withTotals.reduce((a, b) =>
      b.bundle.broadbandSpeedMbps > a.bundle.broadbandSpeedMbps ? b : a,
    )
    return { cheapest: cheapest.bundle, lowestTotal: lowestTotal.bundle, fastest: fastest.bundle }
  }, [withTotals])

  const results = useMemo(() => {
    const filtered = withTotals.filter(({ bundle }) => {
      if (minSpeed && bundle.broadbandSpeedMbps < minSpeed) return false
      if (provider && bundle.provider !== provider) return false
      if (watch.length && !watch.some((tag) => bundle.contentTags.includes(tag))) return false
      return true
    })
    return filtered.sort((a, b) => {
      if (sort === 'total') return a.total - b.total
      if (sort === 'speed') {
        return b.bundle.broadbandSpeedMbps - a.bundle.broadbandSpeedMbps || a.bundle.monthlyPrice - b.bundle.monthlyPrice
      }
      return a.bundle.monthlyPrice - b.bundle.monthlyPrice
    })
  }, [withTotals, minSpeed, provider, watch, sort])

  const selectClass =
    'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none'

  return (
    <div>
      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">I mainly watch</span>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={watch.includes(tag)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  watch.includes(tag)
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {tvBundleContentTagLabels[tag]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            Speed
            <select
              className={selectClass}
              value={minSpeed}
              onChange={(e) => {
                setMinSpeed(Number(e.target.value))
                noteInteraction('speed', e.target.value)
              }}
            >
              {SPEED_OPTIONS.map((speed) => (
                <option key={speed} value={speed}>
                  {speed ? `${speedLabel(speed)}+` : 'Any'}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Provider
            <select
              className={selectClass}
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value)
                noteInteraction('provider', e.target.value)
              }}
            >
              <option value="">All</option>
              {PROVIDERS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Start
            <select
              className={selectClass}
              value={start}
              onChange={(e) => {
                setStart(e.target.value)
                noteInteraction('start_month', e.target.value)
              }}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Sort
            <select
              className={selectClass}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey)
                noteInteraction('sort', e.target.value)
              }}
            >
              <option value="monthly">Lowest monthly price</option>
              <option value="total">Lowest total cost</option>
              <option value="speed">Fastest broadband</option>
            </select>
          </label>
          <span className="ml-auto text-slate-500" aria-live="polite">
            Showing {results.length} of {tvBundleOptions.length} bundles
          </span>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No bundles match these filters.{' '}
          <button type="button" onClick={clearFilters} className="font-semibold text-sky-700 underline">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map(({ bundle, total }) => {
            const matches = watch.length > 0 && watch.every((tag) => bundle.contentTags.includes(tag))
            const affiliateUrl = affiliateUrls[bundle.providerSlug]
            const pick = picks[bundle.packageName]
            const avg = total / bundle.contractMonths
            return (
              <li
                key={bundle.packageName}
                className={`flex flex-col gap-3 rounded-xl border bg-white p-4 ${
                  matches ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <ProviderLogo slug={bundle.providerSlug} name={bundle.provider} width={64} height={32} />
                  <div className="min-w-0">
                    <Link href={bundle.reviewHref} className="text-xs font-semibold text-slate-500 hover:underline">
                      {bundle.provider}
                    </Link>
                    <p className="font-bold leading-snug text-slate-900">{bundle.packageName}</p>
                  </div>
                </div>

                <div className="flex min-h-6 flex-wrap gap-1.5">
                  {pick && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">{pick}</span>
                  )}
                  {bundle === badges.cheapest && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Lowest monthly price</span>
                  )}
                  {bundle === badges.lowestTotal && bundle !== badges.cheapest && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Lowest total cost</span>
                  )}
                  {bundle === badges.fastest && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Fastest broadband</span>
                  )}
                  {matches && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Matches what you watch</span>
                  )}
                </div>

                <dl className="grid grid-cols-3 gap-2 border-y border-slate-100 py-2.5 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Speed</dt>
                    <dd className="font-bold tabular-nums text-slate-900">{speedLabel(bundle.broadbandSpeedMbps)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Contract</dt>
                    <dd className="font-bold tabular-nums text-slate-900">{bundle.contractMonths} months</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Avg / month</dt>
                    <dd className="font-bold tabular-nums text-slate-900">{gbp(avg)}</dd>
                  </div>
                </dl>

                <div className="flex items-end justify-between gap-2">
                  <p className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900">
                    {gbp(bundle.monthlyPrice)}
                    <span className="text-sm font-medium text-slate-500">/mo</span>
                  </p>
                  <p className="text-right text-xs text-slate-500">
                    Total over {bundle.contractMonths} months
                    <span className="block text-base font-bold tabular-nums text-slate-900">
                      {gbp(total)}
                      {totalIsPartial(bundle) ? '*' : ''}
                    </span>
                  </p>
                </div>

                <div className="grid gap-1.5 text-xs leading-relaxed">
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                    <span className="font-semibold">Price rises: </span>
                    {bundle.priceRiseNote}
                  </p>
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                    <span className="font-semibold">
                      Setup: {bundle.setup.fee === null ? 'not confirmed' : bundle.setup.fee === 0 ? '£0 upfront' : gbp(bundle.setup.fee)}
                      {bundle.setup.fee !== null && ' (included in total)'}.{' '}
                    </span>
                    {bundle.setup.note} Checked {checkedLabel(bundle.setup.checkedDate)}.
                  </p>
                  {totalIsPartial(bundle) && (
                    <p className="text-slate-500">
                      *Total excludes{' '}
                      {[
                        bundle.priceRise.type === 'unconfirmed' && 'any price rise',
                        bundle.setup.fee === null && 'any setup fee',
                      ]
                        .filter(Boolean)
                        .join(' and ')}{' '}
                      the provider has not yet published.
                    </p>
                  )}
                </div>

                <details className="text-sm text-slate-600">
                  <summary className="cursor-pointer font-semibold text-sky-700">What&apos;s included</summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {bundle.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </details>

                <div className="mt-auto flex items-center gap-2">
                  {affiliateUrl ? (
                    <AffiliateCTA
                      href={affiliateUrl}
                      providerName={bundle.provider}
                      providerSlug={bundle.providerSlug}
                      label={`See deal at ${bundle.provider}`}
                      ariaLabel={`See deal at ${bundle.provider} (affiliate link: we may earn a commission)`}
                      placement="tv_bundle_card"
                      className="flex-1 text-center"
                    />
                  ) : (
                    <Link
                      href={bundle.reviewHref}
                      className="flex-1 rounded-lg border-2 border-sky-700 px-5 py-2.5 text-center text-sm font-semibold text-sky-700"
                    >
                      Read our {bundle.provider} review
                    </Link>
                  )}
                  <SaveDealButton
                    providerSlug={bundle.providerSlug}
                    providerName={bundle.provider}
                    packageName={bundle.packageName}
                    monthlyPrice={bundle.monthlyPrice}
                    download={bundle.broadbandSpeedMbps}
                    contractLength={bundle.contractMonths}
                    className="border border-slate-200"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
