'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clearStoredPostcode, getStoredPostcode, type StoredPostcode } from '@/lib/postcodeStorage'

export default function PostcodeContextBar() {
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
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-sky-50 border border-sky-200 text-sm">
      <p className="text-sky-900">
        Showing results for{' '}
        <Link href={`/postcode/${stored.area}`} className="font-semibold underline decoration-sky-400 underline-offset-2">
          {stored.postcode}
        </Link>
      </p>
      <div className="flex items-center gap-3">
        <Link href={`/postcode/${stored.area}`} className="text-sky-700 font-medium hover:text-sky-900">
          View this address&apos;s deals
        </Link>
        <button
          type="button"
          onClick={() => {
            clearStoredPostcode()
            setStored(null)
          }}
          className="text-slate-500 hover:text-slate-700"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
