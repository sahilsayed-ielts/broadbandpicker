'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStoredPostcode, type StoredPostcode } from '@/lib/postcodeStorage'

export default function ReturningVisitorBanner() {
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

  return (
    <Link
      href={`/postcode/${stored.area}`}
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-white/10 px-4 py-2 text-sm text-sky-100 backdrop-blur-sm transition-colors hover:bg-white/20"
    >
      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
      Welcome back. See deals for <strong className="font-semibold">{stored.postcode}</strong> &rarr;
    </Link>
  )
}
