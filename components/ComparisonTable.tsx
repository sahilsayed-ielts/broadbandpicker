'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { Provider } from '@/types'
import { trackEvent } from '@/lib/analytics'
import AffiliateCTA from './AffiliateCTA'
import SpeedBadge from './SpeedBadge'
import ProviderLogo from './ProviderLogo'

interface ComparisonTableProps {
  providers: Provider[]
}

const STORAGE_KEY = 'bbp_provider_shortlist'
const MAX_SELECTIONS = 3

function Stars({ score }: { score: number }) {
  const stars = Math.round(score)
  return (
    <span className="flex items-center gap-0.5" aria-label={`${score} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`h-3.5 w-3.5 ${n <= stars ? 'text-amber-400' : 'text-slate-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034a1 1 0 01-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-slate-500">{score.toFixed(1)}</span>
    </span>
  )
}

function maxDownload(provider: Provider) {
  return Math.max(...provider.speeds.map((speed) => speed.download))
}

function formatSetupFee(fee: number) {
  return fee === 0 ? 'Free' : `£${fee.toFixed(2)}`
}

export default function ComparisonTable({ providers }: ComparisonTableProps) {
  const validSlugs = useMemo(() => new Set(providers.map((provider) => provider.slug)), [providers])
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [selectionLimitMessage, setSelectionLimitMessage] = useState('')

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
      if (Array.isArray(stored)) {
        setSelectedSlugs(
          stored
            .filter((slug): slug is string => typeof slug === 'string' && validSlugs.has(slug))
            .slice(0, MAX_SELECTIONS),
        )
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [validSlugs])

  const selectedProviders = selectedSlugs
    .map((slug) => providers.find((provider) => provider.slug === slug))
    .filter((provider): provider is Provider => Boolean(provider))

  function saveSelection(next: string[]) {
    setSelectedSlugs(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function toggleProvider(provider: Provider) {
    const isSelected = selectedSlugs.includes(provider.slug)
    if (!isSelected && selectedSlugs.length >= MAX_SELECTIONS) {
      setSelectionLimitMessage('You can compare up to three providers. Remove one to add another.')
      trackEvent('compare_shortlist_limit_reached', { shortlist_size: selectedSlugs.length })
      return
    }

    const next = isSelected
      ? selectedSlugs.filter((slug) => slug !== provider.slug)
      : [...selectedSlugs, provider.slug]

    setSelectionLimitMessage('')
    saveSelection(next)
    trackEvent(isSelected ? 'compare_shortlist_removed' : 'compare_shortlist_added', {
      provider_slug: provider.slug,
      shortlist_size: next.length,
    })
  }

  function clearSelection() {
    saveSelection([])
    setSelectionLimitMessage('')
    trackEvent('compare_shortlist_cleared')
  }

  function focusComparison() {
    document.getElementById('provider-finalists')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    trackEvent('compare_basket_viewed', {
      shortlist_size: selectedProviders.length,
      provider_slugs: selectedProviders.map((provider) => provider.slug).join(','),
    })
  }

  return (
    <div>
      <section
        aria-labelledby="shortlist-heading"
        className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="shortlist-heading" className="text-lg font-bold text-slate-900">
                Your comparison shortlist
              </h2>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-sky-800">
                {selectedSlugs.length}/{MAX_SELECTIONS}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Select two or three providers below to compare your finalists side by side.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSlugs.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear shortlist
              </button>
            )}
            <button
              type="button"
              onClick={focusComparison}
              disabled={selectedSlugs.length < 2}
              className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Compare selected
            </button>
          </div>
        </div>

        {selectedProviders.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-live="polite">
            {selectedProviders.map((provider) => (
              <button
                key={provider.slug}
                type="button"
                onClick={() => toggleProvider(provider)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white py-1.5 pl-3 pr-2 text-sm font-semibold text-slate-800 hover:border-red-300"
                aria-label={`Remove ${provider.name} from shortlist`}
              >
                {provider.name}
                <span aria-hidden="true" className="text-lg leading-none text-slate-400">×</span>
              </button>
            ))}
          </div>
        )}
        {selectionLimitMessage && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">
            {selectionLimitMessage}
          </p>
        )}
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Shortlist</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Provider</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">From</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Max speed</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Contract</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Setup</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Coverage</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Rating</th>
              <th className="px-4 py-3"><span className="sr-only">Deal link</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {providers.map((provider) => {
              const maximumSpeed = maxDownload(provider)
              const selected = selectedSlugs.includes(provider.slug)
              return (
                <tr
                  key={provider.slug}
                  className={`transition-colors ${selected ? 'bg-sky-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  <td className="px-4 py-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-sky-800">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleProvider(provider)}
                        className="h-5 w-5 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                      />
                      <span>{selected ? 'Selected' : 'Compare'}</span>
                    </label>
                  </td>
                  <td className="px-4 py-4">
                    <ProviderLogo slug={provider.slug} name={provider.name} width={72} height={36} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-900">£{provider.monthlyPriceFrom.toFixed(2)}</span>
                    <span className="text-xs text-slate-400">/mo</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold">{maximumSpeed} Mbps</div>
                    <SpeedBadge download={maximumSpeed} className="mt-1" />
                  </td>
                  <td className="px-4 py-4 text-slate-600">{provider.contractLengths.join(' / ')} mo</td>
                  <td className="px-4 py-4">
                    {provider.setupFee === 0 ? (
                      <span className="font-medium text-green-700">Free</span>
                    ) : (
                      `£${provider.setupFee.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{provider.coveragePercent}%</td>
                  <td className="px-4 py-4"><Stars score={provider.trustpilotScore} /></td>
                  <td className="px-4 py-4">
                    <AffiliateCTA
                      href={provider.affiliateUrl}
                      providerName={provider.name}
                      providerSlug={provider.slug}
                      placement="comparison_table"
                      size="sm"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <section id="provider-finalists" aria-labelledby="finalists-heading" className="scroll-mt-24 pt-8">
        <div className="mb-4">
          <h2 id="finalists-heading" className="text-2xl font-bold text-slate-900">
            Compare your shortlisted providers
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            The figures below are provider-level starting points. Check your postcode and the provider site for the exact package available at your address.
          </p>
        </div>

        {selectedProviders.length < 2 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-800">Choose at least two providers to create your comparison.</p>
            <p className="mt-1 text-sm text-slate-500">You can add a maximum of three.</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${selectedProviders.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {selectedProviders.map((provider) => {
              const maximumSpeed = maxDownload(provider)
              return (
                <article key={provider.slug} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <ProviderLogo slug={provider.slug} name={provider.name} width={104} height={52} />
                    <button
                      type="button"
                      onClick={() => toggleProvider(provider)}
                      className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-red-700"
                      aria-label={`Remove ${provider.name} from comparison`}
                    >
                      Remove
                    </button>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{provider.name}</h3>
                  <dl className="mt-4 divide-y divide-slate-100 border-y border-slate-100 text-sm">
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-slate-500">Price from</dt>
                      <dd className="font-bold text-slate-900">£{provider.monthlyPriceFrom.toFixed(2)}/mo</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-slate-500">Maximum speed</dt>
                      <dd className="font-bold text-slate-900">{maximumSpeed} Mbps</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-slate-500">Contract options</dt>
                      <dd className="font-semibold text-slate-800">{provider.contractLengths.join(' / ')} months</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-slate-500">Setup fee</dt>
                      <dd className="font-semibold text-slate-800">{formatSetupFee(provider.setupFee)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-slate-500">UK coverage</dt>
                      <dd className="font-semibold text-slate-800">{provider.coveragePercent}%</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-slate-500">Customer rating</dt>
                      <dd><Stars score={provider.trustpilotScore} /></dd>
                    </div>
                  </dl>
                  <div className="mt-auto grid gap-2 pt-5">
                    <AffiliateCTA
                      href={provider.affiliateUrl}
                      providerName={provider.name}
                      providerSlug={provider.slug}
                      label={`Check ${provider.name} deals`}
                      placement="comparison_finalist"
                      className="w-full text-center"
                    />
                    <Link
                      href={`/providers/${provider.slug}`}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Read our {provider.name} review
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
