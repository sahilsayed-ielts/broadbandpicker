'use client'

import { trackAffiliateClick } from '@/lib/affiliate'

interface AffiliateCTAProps {
  href: string
  providerName: string
  providerSlug?: string
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline'
}

export default function AffiliateCTA({
  href,
  providerName,
  providerSlug,
  label,
  className = '',
  size = 'md',
  variant = 'primary',
}: AffiliateCTAProps) {
  const slug = providerSlug ?? href.replace('#awin-', '').replace(/^.*\/providers\//, '').split('?')[0]

  const sizeClass = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }[size]

  const variantClass =
    variant === 'primary'
      ? 'bg-green-500 hover:bg-green-600 text-white font-semibold'
      : 'border-2 border-sky-500 text-sky-600 hover:bg-sky-50 font-semibold'

  function handleClick() {
    trackAffiliateClick({
      providerSlug: slug,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
    }).catch(() => {
      // Non-critical — swallow errors silently
    })
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={`inline-block rounded-lg transition-colors ${sizeClass} ${variantClass} ${className}`}
      aria-label={`Get deal from ${providerName} (affiliate link — we may earn a commission)`}
    >
      {label ?? `Get Deal →`}
    </a>
  )
}
