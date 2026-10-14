import { existsSync } from 'node:fs'
import path from 'node:path'
import { LOGO_URL, SITE_URL } from '@/lib/siteSchema'

/**
 * Image for a provider's Product structured data. Google's merchant listings
 * require an "image" on every Product with an Offer, and do not reliably
 * accept SVG, so each provider has an 800x800 PNG copy of its logo in
 * public/logos/png/. Falls back to the BroadbandPicker logo for a provider
 * without one, so the field is never missing. Server-only (reads the disk at
 * build time).
 */
export function providerSchemaImage(slug: string): string {
  const file = path.join(process.cwd(), 'public', 'logos', 'png', `${slug}.png`)
  return existsSync(file) ? `${SITE_URL}/logos/png/${slug}.png` : LOGO_URL
}
