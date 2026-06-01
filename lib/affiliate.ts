'use server'

import { createServerClient } from './supabase'
import { createHash } from 'crypto'

export async function trackAffiliateClick({
  providerSlug,
  sourcePage,
  postcodeArea,
  userAgent,
  ip,
}: {
  providerSlug: string
  sourcePage: string
  postcodeArea?: string
  userAgent?: string
  ip?: string
}) {
  try {
    const supabase = createServerClient()
    const ipHash = ip
      ? createHash('sha256').update(ip).digest('hex').slice(0, 16)
      : null

    await supabase.from('affiliate_clicks').insert({
      provider_slug: providerSlug,
      source_page: sourcePage,
      postcode_area: postcodeArea ?? null,
      user_agent: userAgent ?? null,
      ip_hash: ipHash,
    })
  } catch {
    // Non-critical — do not throw
  }
}

