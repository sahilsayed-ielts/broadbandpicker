'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { isValidUKPostcode, normalisePostcodeForUrl, sanitizePostcode } from '@/lib/postcode'
import { setStoredPostcode } from '@/lib/postcodeStorage'
import { trackEvent } from '@/lib/analytics'

interface PostcodeCheckerProps {
  size?: 'large' | 'default'
  placeholder?: string
}

export default function PostcodeChecker({
  size = 'default',
  placeholder = 'Enter your postcode e.g. SW1A 1AA',
}: PostcodeCheckerProps) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const sanitized = sanitizePostcode(value)
    if (!isValidUKPostcode(sanitized)) {
      setError('Please enter a valid UK postcode, e.g. SW1A 1AA')
      return
    }
    setError('')
    const area = normalisePostcodeForUrl(sanitized)
    setStoredPostcode(sanitized, area)
    trackEvent('postcode_submit', {
      postcode_area: area.toUpperCase(),
      component_size: size,
      destination_path: `/postcode/${area}`,
    })
    router.push(`/postcode/${area}`)
  }

  const inputClass =
    size === 'large'
      ? 'min-h-12 w-full flex-1 px-5 py-4 text-base sm:text-lg sm:rounded-l-xl sm:rounded-r-none rounded-xl border-2 sm:border-r-0 border-sky-200 focus:border-sky-500 outline-none font-medium text-slate-900 placeholder:text-slate-400'
      : 'min-h-12 w-full flex-1 px-4 py-3 text-base sm:rounded-l-lg sm:rounded-r-none rounded-lg border-2 sm:border-r-0 border-slate-200 focus:border-sky-500 outline-none text-slate-900 placeholder:text-slate-400'

  const btnClass =
    size === 'large'
      ? 'min-h-12 w-full sm:w-auto px-7 py-4 text-base sm:text-lg bg-sky-700 hover:bg-sky-800 text-white font-bold sm:rounded-r-xl sm:rounded-l-none rounded-xl transition-colors whitespace-nowrap'
      : 'min-h-12 w-full sm:w-auto px-5 py-3 text-base bg-sky-700 hover:bg-sky-800 text-white font-semibold sm:rounded-r-lg sm:rounded-l-none rounded-lg transition-colors whitespace-nowrap'

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-0">
        <input
          type="text"
          inputMode="text"
          enterKeyHint="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError('')
          }}
          placeholder={placeholder}
          className={inputClass}
          aria-label="Enter your UK postcode"
          autoComplete="postal-code"
          maxLength={8}
        />
        <button type="submit" className={btnClass}>
          Find Deals
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
