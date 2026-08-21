import type { Provider } from '@/types'

interface DealForSchema {
  provider: Provider
  packageName: string
  monthlyPrice: number
  download: number
  contractLength: number
}

const SITE_URL = 'https://broadbandpicker.co.uk'

/**
 * Product + Offer structured data for a list of broadband deals, matching
 * Google's guidance for product rich results. Price mirrors what the page
 * already displays for that row — this must never diverge from visible
 * content. No aggregateRating: the data model has a Trustpilot score but no
 * real review count, and Google requires ratingCount/reviewCount for a
 * valid AggregateRating, so fabricating one would be worse than omitting it.
 */
export function buildDealListJsonLd(deals: DealForSchema[], listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: deals.map((deal, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: deal.packageName,
        brand: { '@type': 'Brand', name: deal.provider.name },
        url: `${SITE_URL}/providers/${deal.provider.slug}`,
        offers: {
          '@type': 'Offer',
          price: deal.monthlyPrice.toFixed(2),
          priceCurrency: 'GBP',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/providers/${deal.provider.slug}`,
          seller: { '@type': 'Organization', name: deal.provider.name },
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: deal.monthlyPrice.toFixed(2),
            priceCurrency: 'GBP',
            unitText: 'MONTH',
            referenceQuantity: {
              '@type': 'QuantitativeValue',
              value: deal.contractLength,
              unitText: 'MONTH',
            },
          },
        },
      },
    })),
  }
}

/** Single-Product Offer for one provider's page, using its advertised "from" price. */
export function buildProviderOfferJsonLd(provider: Provider) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${provider.name} Broadband`,
    brand: { '@type': 'Brand', name: provider.name },
    url: `${SITE_URL}/providers/${provider.slug}`,
    offers: {
      '@type': 'Offer',
      price: provider.monthlyPriceFrom.toFixed(2),
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/providers/${provider.slug}`,
      seller: { '@type': 'Organization', name: provider.name },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: provider.monthlyPriceFrom.toFixed(2),
        priceCurrency: 'GBP',
        unitText: 'MONTH',
      },
    },
  }
}
