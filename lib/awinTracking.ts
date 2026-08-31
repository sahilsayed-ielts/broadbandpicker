export type AffiliateNetwork = 'awin' | 'direct'

export interface AffiliateTrackingContext {
  sourceUrl: string
  providerSlug: string
  placement: string
  label: string
  campaign?: string
}

export interface AffiliateTrackingResult {
  href: string
  network: AffiliateNetwork
  advertiserId?: string
  campaign: string
  contentType: string
  clickRefs: [string, string, string, string, string, string]
}

const AWIN_HOSTS = new Set(['www.awin1.com', 'awin1.com', 'www.awin.com', 'awin.com'])

function hash32(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** Awin click references are limited to 50 characters. */
export function awinRef(value: string, fallback = 'unknown') {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\-.]+|[_\-.]+$/g, '') || fallback

  if (cleaned.length <= 50) return cleaned
  return `${cleaned.slice(0, 41)}_${hash32(cleaned)}`
}

export function contentTypeForPath(pathname: string) {
  if (pathname === '/') return 'home'
  if (pathname === '/deals') return 'deals'
  if (pathname.startsWith('/postcode/')) return 'postcode'
  if (pathname.startsWith('/providers/compare/')) return 'comparison'
  if (pathname.startsWith('/providers/')) return 'provider'
  if (pathname.startsWith('/guides/')) return 'guide'
  if (pathname.startsWith('/tools/') || pathname === '/speed-test') return 'tool'
  return 'other'
}

export function buildAffiliateTrackingUrl(
  href: string,
  context: AffiliateTrackingContext,
): AffiliateTrackingResult {
  const campaign = awinRef(context.campaign ?? 'onsite_affiliate')
  const source = new URL(context.sourceUrl)
  const sourcePage = awinRef(source.pathname === '/' ? 'home' : source.pathname.slice(1))
  const contentType = contentTypeForPath(source.pathname)
  const refs: AffiliateTrackingResult['clickRefs'] = [
    awinRef(context.placement, 'affiliate_cta'),
    sourcePage,
    awinRef(context.providerSlug),
    contentType,
    awinRef(context.label, 'get_deal'),
    'tracking_v1',
  ]

  let url: URL
  try {
    url = new URL(href)
  } catch {
    return { href, network: 'direct', campaign, contentType, clickRefs: refs }
  }

  if (!AWIN_HOSTS.has(url.hostname.toLowerCase())) {
    return { href, network: 'direct', campaign, contentType, clickRefs: refs }
  }

  const destination = url.searchParams.get('ued')
  const preserved = Array.from(url.searchParams.entries()).filter(
    ([key]) => !['campaign', 'clickref', 'clickref2', 'clickref3', 'clickref4', 'clickref5', 'clickref6', 'extr', 'ued'].includes(key.toLowerCase()),
  )
  url.search = ''
  preserved.forEach(([key, value]) => url.searchParams.append(key, value))
  url.searchParams.append('campaign', campaign)
  refs.forEach((value, index) => url.searchParams.append(index === 0 ? 'clickref' : `clickref${index + 1}`, value))
  // Use only origin + path. Query strings can contain postcodes, emails or campaign data.
  url.searchParams.append('extr', `${source.origin}${source.pathname}`)
  if (destination) url.searchParams.append('ued', destination)

  return {
    href: url.toString(),
    network: 'awin',
    advertiserId: url.searchParams.get('awinmid') ?? undefined,
    campaign,
    contentType,
    clickRefs: refs,
  }
}
