'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { isValidUKPostcode, normalisePostcodeForUrl, sanitizePostcode } from '@/lib/postcode'
import { setStoredPostcode } from '@/lib/postcodeStorage'

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
    router.push(`/postcode/${area}`)
  }

  const inputClass =
    size === 'large'
      ? 'flex-1 px-5 py-4 text-lg rounded-l-xl border-2 border-r-0 border-sky-200 focus:border-sky-500 outline-none font-medium text-slate-900 placeholder:text-slate-400'
      : 'flex-1 px-4 py-3 rounded-l-lg border-2 border-r-0 border-slate-200 focus:border-sky-500 outline-none text-slate-900 placeholder:text-slate-400'

  const btnClass =
    size === 'large'
      ? 'px-7 py-4 text-lg bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-r-xl transition-colors whitespace-nowrap'
      : 'px-5 py-3 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-r-lg transition-colors whitespace-nowrap'

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full">
        <input
          type="text"
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
