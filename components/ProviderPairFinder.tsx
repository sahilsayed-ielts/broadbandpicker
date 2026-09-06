'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

export interface PairFinderComparison {
  slug: string
  a: string
  b: string
}

interface ProviderPairFinderProps {
  comparisons: PairFinderComparison[]
  providerNames: Record<string, string>
  providerNetwork: Record<string, string>
}

type Result =
  | { kind: 'idle' }
  | { kind: 'matched'; slug: string; aName: string; bName: string }
  | {
      kind: 'unmatched'
      aSlug: string
      bSlug: string
      aName: string
      bName: string
      closest: { slug: string; label: string } | null
    }

export default function ProviderPairFinder({
  comparisons,
  providerNames,
  providerNetwork,
}: ProviderPairFinderProps) {
  const options = useMemo(
    () =>
      Object.entries(providerNames)
        .map(([slug, name]) => ({ slug, name }))
        .sort((x, y) => x.name.localeCompare(y.name)),
    [providerNames],
  )

  const [providerA, setProviderA] = useState('')
  const [providerB, setProviderB] = useState('')
  const [result, setResult] = useState<Result>({ kind: 'idle' })
  const [error, setError] = useState('')
  const started = useRef(false)

  function noteStart() {
    if (!started.current) {
      started.current = true
      trackEvent('provider_filter_used', { control: 'provider_pair_finder' })
    }
  }

  function selectA(value: string) {
    noteStart()
    setProviderA(value)
    setResult({ kind: 'idle' })
    setError('')
    if (value) trackEvent('provider_pair_selected', { position: 'provider_a', provider_slug: value })
  }

  function selectB(value: string) {
    noteStart()
    setProviderB(value)
    setResult({ kind: 'idle' })
    setError('')
    if (value) trackEvent('provider_pair_selected', { position: 'provider_b', provider_slug: value })
  }

  function findComparison() {
    if (!providerA || !providerB) {
      setError('Choose a provider in both menus.')
      return
    }
    if (providerA === providerB) {
      setError('Choose two different providers.')
      return
    }
    setError('')

    const exact = comparisons.find(
      (c) =>
        (c.a === providerA && c.b === providerB) || (c.a === providerB && c.b === providerA),
    )
    const aName = providerNames[providerA] ?? providerA
    const bName = providerNames[providerB] ?? providerB

    if (exact) {
      setResult({ kind: 'matched', slug: exact.slug, aName, bName })
      trackEvent('provider_pair_selected', {
        matchup: `${providerA}__${providerB}`,
        outcome: 'matched',
        comparison_slug: exact.slug,
      })
      return
    }

    const sharesProvider = comparisons.filter(
      (c) => c.a === providerA || c.b === providerA || c.a === providerB || c.b === providerB,
    )
    const sameNetworkFirst = sharesProvider.sort((c1, c2) => {
      const target = providerNetwork[providerA]
      const score = (c: PairFinderComparison) =>
        (providerNetwork[c.a] === target ? 1 : 0) + (providerNetwork[c.b] === target ? 1 : 0)
      return score(c2) - score(c1)
    })
    const near = sameNetworkFirst[0]
    const closest = near
      ? {
          slug: near.slug,
          label: `${providerNames[near.a] ?? near.a} vs ${providerNames[near.b] ?? near.b}`,
        }
      : null

    setResult({ kind: 'unmatched', aSlug: providerA, bSlug: providerB, aName, bName, closest })
    trackEvent('provider_pair_selected', {
      matchup: `${providerA}__${providerB}`,
      outcome: 'unavailable',
      closest_slug: closest?.slug ?? 'none',
    })
    trackEvent('unavailable_matchup_shown', {
      matchup: `${providerA}__${providerB}`,
      closest_slug: closest?.slug ?? 'none',
    })
  }

  return (
    <section
      id="pair-finder"
      className="mb-12 scroll-mt-24 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7"
      aria-labelledby="pair-finder-heading"
    >
      <h2 id="pair-finder-heading" className="text-xl font-bold text-slate-900">
        Build your own comparison
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        Choose two providers to jump straight to their head-to-head guide. If we do not cover that
        exact matchup yet, you will get the nearest guide plus both provider reviews. No personal
        details are needed and nothing is sent anywhere.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label htmlFor="pair-finder-a" className="block text-sm font-semibold text-slate-900">
            First provider
          </label>
          <select
            id="pair-finder-a"
            value={providerA}
            onChange={(event) => selectA(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
          >
            <option value="">Select a provider</option>
            {options.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <p className="hidden pb-2 text-center text-sm font-bold text-slate-500 sm:block" aria-hidden="true">
          vs
        </p>
        <div>
          <label htmlFor="pair-finder-b" className="block text-sm font-semibold text-slate-900">
            Second provider
          </label>
          <select
            id="pair-finder-b"
            value={providerB}
            onChange={(event) => selectB(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
          >
            <option value="">Select a provider</option>
            {options.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={findComparison}
        className="mt-5 min-h-11 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Show comparison
      </button>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div
        className="mt-5 min-h-24 rounded-xl bg-white p-5 shadow-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {result.kind === 'matched' ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Guide found</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">
              {result.aName} vs {result.bName}
            </p>
            <Link
              href={`/providers/compare/${result.slug}`}
              onClick={() =>
                trackEvent('comparison_card_clicked', {
                  comparison_slug: result.slug,
                  source: 'pair_finder_result',
                })
              }
              className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              Open the {result.aName} vs {result.bName} comparison
            </Link>
          </>
        ) : result.kind === 'unmatched' ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Not covered yet</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              We do not have a dedicated {result.aName} vs {result.bName} guide yet. These are the
              most useful next steps.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {result.closest ? (
                <li>
                  Nearest guide:{' '}
                  <Link
                    href={`/providers/compare/${result.closest.slug}`}
                    className="font-semibold text-sky-700 underline"
                  >
                    {result.closest.label}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link href={`/providers/${result.aSlug}`} className="font-semibold text-sky-700 underline">
                  {result.aName} review
                </Link>
                {' and '}
                <Link href={`/providers/${result.bSlug}`} className="font-semibold text-sky-700 underline">
                  {result.bName} review
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  onClick={() =>
                    trackEvent('compare_all_providers_clicked', { location: 'pair_finder_unavailable' })
                  }
                  className="font-semibold text-sky-700 underline"
                >
                  Compare both against every other UK provider
                </Link>
              </li>
            </ul>
          </>
        ) : (
          <p className="text-sm leading-6 text-slate-600">
            Pick two providers and select Show comparison. The full directory below works without
            this tool.
          </p>
        )}
      </div>
    </section>
  )
}
