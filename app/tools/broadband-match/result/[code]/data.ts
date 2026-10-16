import { providers } from '@/data/providers'
import { parseMatchCode } from '@/lib/shareCodes'

const VALID = new Set(providers.filter((p) => !p.retiredDate).map((p) => p.slug))

export function matchFromCode(code: string) {
  const parsed = parseMatchCode(code, VALID)
  if (!parsed) return null
  return { minSpeed: parsed.minSpeed, providers: parsed.slugs.map((slug) => providers.find((p) => p.slug === slug)!) }
}
