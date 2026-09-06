'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { trackEvent, type AnalyticsValue } from '@/lib/analytics'

interface TrackedLinkProps {
  href: string
  event: string
  params?: Record<string, AnalyticsValue>
  className?: string
  children: ReactNode
}

/**
 * A next/link that fires a GA4 event on click. Renders a normal server-crawlable
 * anchor; the tracking is progressive enhancement only. No personal data.
 */
export default function TrackedLink({ href, event, params, className, children }: TrackedLinkProps) {
  return (
    <Link href={href} className={className} onClick={() => trackEvent(event, params ?? {})}>
      {children}
    </Link>
  )
}
