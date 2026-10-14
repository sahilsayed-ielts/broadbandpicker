'use client'

import { useMemo, useState, type ReactNode } from 'react'
import AffiliateCTA from '@/components/AffiliateCTA'
import PostcodeChecker from '@/components/PostcodeChecker'
import ProviderLogo from '@/components/ProviderLogo'
import { trackEvent } from '@/lib/analytics'
import { tvBundleOptions } from '@/data/tvBroadbandBundles'
import type { CommercialGuideNeed } from '@/data/commercialGuides'
import {
  TV_NEED_EVENT,
  contractTotal,
  gbp,
  speedLabel,
  startMonthOptions,
  totalIsPartial,
  type TvNeedDetail,
} from '@/lib/tvBundleCost'

interface GuideHeroBannerProps {
  eyebrow: string
  title: string
  excerpt: string
  meta: string[]
  /** Server-rendered trust chips (links to methodology and commission policy). */
  trust: ReactNode
  needs: CommercialGuideNeed[]
  affiliateUrls: Record<string, string>
  providers: { slug: string; name: string }[]
  /** When prices and fees were last checked, shown in the logo rail. */
  checkedNote: string
  dealsId: string
  renderedAt: string
}

/**
 * Interactive hero for commercial guides, modelled on the comparison-site
 * pattern (Uswitch, Broadband Genie, MoneySavingExpert): the reader picks the
 * need that matters most, sees our matching editorial pick with its full
 * contract cost, and can apply that choice to the deal list below. The pick
 * per need is fixed editorial judgement from the page's verdict, never
 * placement bought by a provider.
 */
export default function GuideHeroBanner({
  eyebrow,
  title,
  excerpt,
  meta,
  trust,
  needs,
  affiliateUrls,
  providers,
  checkedNote,
  dealsId,
  renderedAt,
}: GuideHeroBannerProps) {
  const [needId, setNeedId] = useState(needs[0].id)
  const need = needs.find((item) => item.id === needId) ?? needs[0]
  const start = useMemo(() => startMonthOptions(new Date(renderedAt))[0].value, [renderedAt])

  const pick = useMemo(() => {
    if (need.packageName) {
      const bundle = tvBundleOptions.find((item) => item.packageName === need.packageName)
      if (bundle) return { bundle, total: contractTotal(bundle, start) }
    }
    return tvBundleOptions
      .map((bundle) => ({ bundle, total: contractTotal(bundle, start) }))
      .reduce((a, b) => (b.total < a.total ? b : a))
  }, [need, start])

  function choose(next: CommercialGuideNeed) {
    setNeedId(next.id)
    trackEvent('guide_hero_need', { need: next.id })
  }

  function showMatching() {
    const detail: TvNeedDetail = { watch: need.watch, sort: need.sort }
    window.dispatchEvent(new CustomEvent(TV_NEED_EVENT, { detail }))
    trackEvent('guide_hero_show_matching', { need: need.id })
    document.getElementById(dealsId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const { bundle, total } = pick
  const affiliateUrl = affiliateUrls[bundle.providerSlug]

  return (
    <section
      aria-labelledby="guide-title"
      className="relative overflow-hidden bg-slate-900 text-white"
      style={{
        backgroundImage:
          'radial-gradient(60rem 30rem at 85% -10%, rgba(14,165,233,0.35), transparent 60%), radial-gradient(40rem 24rem at -10% 110%, rgba(34,197,94,0.18), transparent 60%)',
      }}
    >
      {/* Phone order: intro + selector, pick, postcode. Desktop: pick sits in the right column. */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-x-12 lg:gap-y-5 lg:px-8 lg:py-14">
        <div className="grid min-w-0 gap-5 lg:col-start-1 lg:row-start-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-300">{eyebrow}</p>
          <h1 id="guide-title" className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-300">{excerpt}</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-400">
            {meta.map((item, index) => (
              <span key={item}>
                {index > 0 && <span aria-hidden="true" className="mr-3">&middot;</span>}
                {item}
              </span>
            ))}
          </p>
          {trust}

          <fieldset className="grid gap-3">
            <legend className="mb-3 text-sm font-semibold text-white">What matters most to you?</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {needs.map((item) => {
                const active = item.id === need.id
                return (
                  <label
                    key={item.id}
                    className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-sky-300 ${
                      active
                        ? 'border-sky-300 bg-sky-400 text-slate-900'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="guide-need"
                      value={item.id}
                      checked={active}
                      onChange={() => choose(item)}
                      className="sr-only"
                    />
                    {item.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div
            key={bundle.packageName}
            aria-live="polite"
            className="grid gap-4 rounded-2xl bg-white p-5 text-slate-900 shadow-2xl shadow-sky-950/40 motion-safe:animate-[fadeIn_200ms_ease-out] sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">{need.pickLabel}</span>
              <ProviderLogo slug={bundle.providerSlug} name={bundle.provider} width={64} height={32} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{bundle.provider}</p>
              <p className="text-xl font-bold leading-snug">{bundle.packageName}</p>
              <p className="mt-1 text-sm text-slate-600">{need.reason}</p>
            </div>
            <dl className="grid grid-cols-3 gap-3 border-y border-slate-100 py-3 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Monthly</dt>
                <dd className="text-2xl font-extrabold tabular-nums">{gbp(bundle.monthlyPrice)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Speed</dt>
                <dd className="text-lg font-bold tabular-nums">{speedLabel(bundle.broadbandSpeedMbps)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {bundle.contractMonths}-month total
                </dt>
                <dd className="text-lg font-bold tabular-nums">
                  {gbp(total)}
                  {totalIsPartial(bundle) ? '*' : ''}
                </dd>
              </div>
            </dl>
            <ul className="grid gap-1.5 text-sm text-slate-700">
              {bundle.highlights.slice(0, 2).map((highlight) => (
                <li key={highlight} className="flex gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {highlight}
                </li>
              ))}
            </ul>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              <span className="font-semibold">Price rises: </span>
              {bundle.priceRiseNote}
              {totalIsPartial(bundle) && ' *Total excludes costs the provider has not yet published.'}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {affiliateUrl && (
                <AffiliateCTA
                  href={affiliateUrl}
                  providerName={bundle.provider}
                  providerSlug={bundle.providerSlug}
                  label={`See deal at ${bundle.provider}`}
                  ariaLabel={`See deal at ${bundle.provider} (affiliate link: we may earn a commission)`}
                  placement="guide_hero_pick"
                  className="text-center"
                />
              )}
              <button
                type="button"
                onClick={showMatching}
                className="rounded-lg border-2 border-sky-700 px-5 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-50"
              >
                Show matching bundles &darr;
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Editorial pick. We may earn a commission if you click through. It doesn&apos;t change our picks.
            </p>
          </div>
        </div>
        <div className="grid min-w-0 gap-2 self-start rounded-2xl border border-white/15 bg-white/5 p-4 lg:col-start-1 lg:row-start-2 [&_input]:bg-white">
          <p className="text-sm font-semibold text-white">Check what you can get at your address</p>
          <PostcodeChecker placeholder="Enter your postcode" />
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-950/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 text-sm text-slate-300 sm:px-6 lg:px-8">
          <span className="font-semibold text-white">Bundles compared from</span>
          <ul className="flex flex-wrap items-center gap-3">
            {providers.map((provider) => (
              <li key={provider.slug}>
                <ProviderLogo slug={provider.slug} name={provider.name} width={72} height={34} />
              </li>
            ))}
          </ul>
          <span className="lg:ml-auto">{checkedNote}</span>
        </div>
      </div>
    </section>
  )
}
