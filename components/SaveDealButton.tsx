'use client'

import { useEffect, useState } from 'react'
import { dealId, isDealSaved, toggleSavedDeal } from '@/lib/savedDeals'
import { trackEvent } from '@/lib/analytics'

interface SaveDealButtonProps {
  providerSlug: string
  providerName: string
  packageName: string
  monthlyPrice: number
  download: number
  contractLength: number
  className?: string
}

/**
 * Bookmark a deal for later without an account. Drop this next to any Get
 * Deal CTA in a deal-listing component — see lib/savedDeals.ts.
 */
export default function SaveDealButton({
  providerSlug, providerName, packageName, monthlyPrice, download, contractLength, className,
}: SaveDealButtonProps) {
  const id = dealId(providerSlug, packageName)
  const [saved, setSaved] = useState(false)

  // Read after mount only: localStorage state must not affect SSR/CSR markup.
  useEffect(() => {
    setSaved(isDealSaved(id))
  }, [id])

  function handleClick() {
    const nowSaved = toggleSavedDeal({
      id, providerSlug, providerName, packageName, monthlyPrice, download, contractLength,
    })
    setSaved(nowSaved)
    trackEvent(nowSaved ? 'deal_saved' : 'deal_unsaved', { provider_slug: providerSlug, package_name: packageName })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${providerName} ${packageName} from saved deals` : `Save ${providerName} ${packageName} for later`}
      title={saved ? 'Saved — click to remove' : 'Save for later'}
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition-colors ${
        saved ? 'text-red-500 hover:text-red-600' : 'text-slate-300 hover:text-slate-500'
      } ${className ?? ''}`}
    >
      <svg
        className="h-5 w-5"
        fill={saved ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.25c-.318 0-.635-.088-.912-.266C7.29 17.492 3 14.06 3 9.75 3 7.13 5.13 5 7.75 5c1.44 0 2.809.66 3.712 1.734l.538.64.538-.64C13.44 5.66 14.81 5 16.25 5 18.87 5 21 7.13 21 9.75c0 4.31-4.29 7.742-8.088 10.234-.277.178-.594.266-.912.266z"
        />
      </svg>
    </button>
  )
}
