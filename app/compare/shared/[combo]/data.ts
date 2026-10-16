import { providers } from '@/data/providers'
import { parseComparison } from '@/lib/shareCodes'
import type { Provider } from '@/types'

const VALID = new Set(providers.filter((p) => !p.retiredDate).map((p) => p.slug))

export function providersForCombo(combo: string): Provider[] | null {
  const slugs = parseComparison(combo, VALID)
  if (!slugs) return null
  return slugs.map((slug) => providers.find((p) => p.slug === slug)!)
}

export function maxDownload(provider: Provider): number {
  return Math.max(...provider.speeds.map((s) => s.download))
}
