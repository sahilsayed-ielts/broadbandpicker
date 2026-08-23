'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPostcodeArea } from '@/data/postcodes'
import { getStoredPostcode, type StoredPostcode } from '@/lib/postcodeStorage'

export default function ProviderAvailabilityBadge({ providerSlug, providerName }: { providerSlug: string; providerName: string }) {
  const [stored, setStored] = useState<StoredPostcode | null>(null)

  useEffect(() => {
    const sync = () => setStored(getStoredPostcode())
    sync()
    window.addEventListener('bp-postcode-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('bp-postcode-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (!stored) return null

  // We only hold a real per-provider availability list for a curated set of
  // postcode areas — for anywhere outside that set, saying yes/no would be a
  // guess, so say nothing rather than fabricate a claim.
  const area = getPostcodeArea(stored.area)
  if (!area) return null

  const isAvailable = area.availableProviders.includes(providerSlug)

  return isAvailable ? (
    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
      <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span>
        <strong>{providerName}</strong> is listed as available in {area.town} ({stored.postcode}). Confirm your
        exact address on the provider&apos;s own checker before ordering.
      </span>
    </div>
  ) : (
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <svg className="h-5 w-5 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span>
        <strong>{providerName}</strong> isn&apos;t in our list of providers for {area.town} ({stored.postcode}). See{' '}
        <Link href={`/postcode/${stored.area}`} className="font-semibold underline">
          what is available there
        </Link>
        , or check {providerName}&apos;s own site directly.
      </span>
    </div>
  )
}
