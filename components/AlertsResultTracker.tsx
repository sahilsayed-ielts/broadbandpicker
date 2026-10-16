'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function AlertsResultTracker({
  event,
  status,
}: {
  event: 'newsletter_signup' | 'newsletter_unsubscribe'
  status: string
}) {
  useEffect(() => {
    trackEvent(event, { status })
  }, [event, status])
  return null
}
