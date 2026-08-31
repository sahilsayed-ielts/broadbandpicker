'use client'

import { trackAffiliateClick } from '@/lib/affiliate'
import { outboundHost, trackEvent } from '@/lib/analytics'
import { buildAffiliateTrackingUrl } from '@/lib/awinTracking'
import type { MouseEvent } from 'react'

interface AffiliateCTAProps {
  href: string
  providerName: string
  providerSlug?: string
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline'
  placement?: string
  campaign?: string
}

export default function AffiliateCTA({
  href,
  providerName,
  providerSlug,
  label,
  className = '',
  size = 'md',
  variant = 'primary',
  placement = 'affiliate_cta',
  campaign = 'onsite_affiliate',
}: AffiliateCTAProps) {
  const slug = providerSlug ?? href.replace('#awin-', '').replace(/^.*\/providers\//, '').split('?')[0]

  const sizeClass = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }[size]

  const variantClass =
    variant === 'primary'
      ? 'bg-green-700 hover:bg-green-800 text-white font-semibold'
      : 'border-2 border-sky-700 text-sky-700 hover:bg-sky-50 font-semibold'

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const sourcePage = typeof window !== 'undefined' ? window.location.pathname : '/'
    const tracked = buildAffiliateTrackingUrl(href, {
      sourceUrl: typeof window !== 'undefined' ? window.location.href : `https://broadbandpicker.co.uk${sourcePage}`,
      providerSlug: slug,
      placement,
      label: label ?? 'Get Deal',
      campaign,
    })
    // The destination is updated synchronously so new-tab and modified clicks retain Awin attribution.
    event.currentTarget.href = tracked.href
    trackEvent('outbound_provider_click', {
      provider_slug: slug,
      source_page: sourcePage,
      outbound_host: outboundHost(tracked.href),
      link_label: label ?? 'Get Deal',
      affiliate_network: tracked.network,
      affiliate_placement: tracked.clickRefs[0],
      content_type: tracked.contentType,
      awin_advertiser_id: tracked.advertiserId,
      awin_campaign: tracked.campaign,
      awin_clickref: tracked.clickRefs[0],
      awin_clickref2: tracked.clickRefs[1],
      awin_clickref3: tracked.clickRefs[2],
      awin_clickref4: tracked.clickRefs[3],
      awin_clickref5: tracked.clickRefs[4],
      awin_clickref6: tracked.clickRefs[5],
    })
    trackAffiliateClick({
      providerSlug: slug,
      sourcePage,
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
      aria-label={`Get deal from ${providerName} (affiliate link: we may earn a commission)`}
    >
      {label ?? `Get Deal →`}
    </a>
  )
}
