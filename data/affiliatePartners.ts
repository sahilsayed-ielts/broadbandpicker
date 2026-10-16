/**
 * Awin affiliate partners that are not broadband providers and so do not belong
 * in data/providers.ts. Each entry is a joined Awin programme with a live
 * publisher-specific tracking link (awinaffid=2942019). These render through the
 * shared <AffiliateCTA> component, so click tracking, the Awin ClickRef taxonomy
 * and the outbound_provider_click GA4 event stay consistent with provider links.
 */

export interface AffiliatePartner {
  slug: string
  name: string
  awinProgramId: string
  /** Awin cread.php deep link, ued-encoded to the partner's landing page. */
  affiliateUrl: string
  /** One-line, honest description of what the partner does and when it helps. */
  role: string
}

export const affiliatePartners: Record<string, AffiliatePartner> = {
  'broadband-genie': {
    slug: 'broadband-genie',
    name: 'Broadband Genie',
    awinProgramId: '12213',
    affiliateUrl:
      'https://www.awin1.com/cread.php?awinmid=12213&awinaffid=2942019&ued=https%3A%2F%2Fwww.broadbandgenie.co.uk%2F',
    role:
      'an independent UK broadband comparison site with wide market coverage, useful for deals, providers or segments BroadbandPicker does not list',
  },
}

export function getAffiliatePartner(slug: string): AffiliatePartner | undefined {
  return affiliatePartners[slug]
}
