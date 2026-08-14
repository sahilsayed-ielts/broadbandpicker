import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { providerComparisons } from '@/data/provider-comparisons'

export const metadata: Metadata = {
  title: 'Broadband Provider Comparisons UK 2026',
  description:
    'Side-by-side broadband provider comparisons from BroadbandPicker. Compare prices, speeds, contracts, coverage, and customer trade-offs before you switch.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/providers/compare' },
  openGraph: {
    title: 'Broadband Provider Comparisons UK 2026 | BroadbandPicker',
    description:
      'Compare UK broadband providers head to head with pricing, speed, coverage, and verdict summaries.',
    url: 'https://broadbandpicker.co.uk/providers/compare',
  },
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Broadband Provider Comparison Guides',
  itemListElement: providerComparisons.map((comparison, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: comparison.title,
    url: `https://broadbandpicker.co.uk/providers/compare/${comparison.slug}`,
  })),
}

export default function ProviderCompareHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Provider reviews', href: '/providers' },
          { name: 'Compare providers', href: '/providers/compare' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        Broadband Provider Comparison Guides
      </h1>
      <p className="max-w-3xl text-slate-600 mb-8">
        These head-to-head guides compare major UK broadband providers on speed, pricing,
        contracts, coverage, and real-world trade-offs. They are designed to help you choose
        between two providers when both are realistic options at your postcode.
      </p>

      <div className="grid grid-cols-1 gap-5">
        {providerComparisons.map((comparison) => (
          <Link
            key={comparison.slug}
            href={`/providers/compare/${comparison.slug}`}
            className="group block rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-2">
                  {comparison.title}
                </h2>
                <p className="text-sm text-slate-600 mb-3">{comparison.excerpt}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                    Best for {comparison.bestForA}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                    Best for {comparison.bestForB}
                  </span>
                </div>
              </div>
              <svg
                className="mt-1 h-5 w-5 flex-shrink-0 text-slate-300 group-hover:text-sky-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-sky-200 bg-sky-50 p-6">
        <h2 className="font-bold text-slate-900 mb-2">Need a broader shortlist first?</h2>
        <p className="text-sm text-slate-600 mb-4">
          Start with our all-provider comparison table, then come back to these head-to-head
          guides once you have narrowed the field.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/compare"
            className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            Compare all providers
          </Link>
          <Link
            href="/guides/best-broadband-providers-uk"
            className="rounded-lg border border-sky-300 px-4 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
          >
            Read provider rankings
          </Link>
        </div>
      </div>
    </div>
  )
}
