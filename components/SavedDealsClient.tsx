'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AffiliateCTA from './AffiliateCTA'
import AlertEmailForm from './AlertEmailForm'
import ShareBar from './ShareBar'
import { getProviderBySlug } from '@/data/providers'
import { findDealById } from '@/lib/deals'
import { NEWSLETTER_PUBLIC } from '@/lib/newsletterPublic'
import { PRICE_DROP_CONSENT_TEXT } from '@/lib/newsletterCopy'
import { getSavedDeals, onSavedDealsChange, removeSavedDeal, type SavedDeal } from '@/lib/savedDeals'

function PriceChange({ deal }: { deal: SavedDeal }) {
  const current = findDealById(deal.id)
  if (!current) {
    return <p className="mt-1 text-xs font-semibold text-amber-700">No longer listed. Check the provider for its current deals.</p>
  }
  const diff = current.monthlyPrice - deal.monthlyPrice
  if (Math.abs(diff) < 0.005) {
    return <p className="mt-1 text-xs text-slate-500">Same price as when you saved it.</p>
  }
  return (
    <p className={`mt-1 text-xs font-semibold ${diff < 0 ? 'text-green-700' : 'text-amber-700'}`}>
      {diff < 0 ? 'Cheaper' : 'Dearer'} now: £{current.monthlyPrice.toFixed(2)}/mo (was £{deal.monthlyPrice.toFixed(2)} when you saved it)
    </p>
  )
}

export default function SavedDealsClient() {
  const [deals, setDeals] = useState<SavedDeal[] | null>(null)

  useEffect(() => {
    setDeals(getSavedDeals())
    return onSavedDealsChange(() => setDeals(getSavedDeals()))
  }, [])

  // null = not yet read from localStorage; render nothing to avoid a hydration flash.
  if (deals === null) return null

  if (deals.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="font-semibold text-slate-800">No saved deals yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Tap the heart icon next to any deal to save it here for later.
        </p>
        <Link
          href="/deals"
          className="mt-4 inline-block rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
        >
          Browse deals
        </Link>
      </div>
    )
  }

  const sortedBySavedDate = [...deals].sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  const watchable = sortedBySavedDate.filter((deal) => findDealById(deal.id))
  const providerSlugs = [...new Set(sortedBySavedDate.map((deal) => deal.providerSlug))]
    .filter((slug) => getProviderBySlug(slug))
    .slice(0, 3)

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {sortedBySavedDate.map((deal) => {
          const provider = getProviderBySlug(deal.providerSlug)
          return (
            <div
              key={deal.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {deal.providerName} &middot; {deal.packageName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {deal.download} Mbps &middot; £{deal.monthlyPrice.toFixed(2)}/mo &middot;{' '}
                  {deal.contractLength} month contract
                </p>
                <PriceChange deal={deal} />
                <p className="mt-1 text-xs text-slate-400">
                  Saved {new Date(deal.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  Check the live offer at your address before you switch.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {provider && (
                  <AffiliateCTA
                    href={provider.affiliateUrl}
                    providerName={provider.name}
                    providerSlug={provider.slug}
                    placement="saved_deals"
                    size="sm"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeSavedDeal(deal.id)}
                  className="text-sm font-medium text-slate-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {NEWSLETTER_PUBLIC && watchable.length > 0 && (
        <section id="price-alerts" aria-labelledby="price-alerts-heading" className="scroll-mt-24 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h2 id="price-alerts-heading" className="text-lg font-bold text-slate-900">Get an email if these deals get cheaper</h2>
          <p className="mt-1 mb-4 text-sm text-slate-600">
            We check every day and email you once per price drop on the {watchable.length === 1 ? 'deal' : `${watchable.length} deals`} above. No newsletter, no other emails.
          </p>
          <AlertEmailForm
            endpoint="/api/alerts/price-drop"
            consentText={PRICE_DROP_CONSENT_TEXT}
            submitLabel="Email me price drops"
            successTitle="Check your inbox"
            successBody="We sent a confirmation email. Click the button in it and the alert switches on."
            event="price_alert_requested"
            payload={() => ({ dealIds: watchable.map((deal) => deal.id) })}
          />
        </section>
      )}

      {providerSlugs.length >= 2 && (
        <section aria-labelledby="share-shortlist-heading" className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 id="share-shortlist-heading" className="text-lg font-bold text-slate-900">Deciding with someone else?</h2>
          <p className="mt-1 mb-3 text-sm text-slate-600">Send them a side-by-side comparison of the providers you saved.</p>
          <ShareBar
            url={`/compare/shared/${providerSlugs.join('-vs-')}`}
            title={`Broadband comparison: ${providerSlugs.map((slug) => getProviderBySlug(slug)?.name).join(' vs ')}`}
            text="Here are the broadband providers I'm looking at:"
            contentType="comparison"
            itemId={providerSlugs.join(',')}
            placement="saved_deals"
          />
        </section>
      )}
    </div>
  )
}
