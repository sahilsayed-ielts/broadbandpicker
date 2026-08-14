import type { Metadata } from 'next'
import Link from 'next/link'
import { providers, providerDatasetUpdatedDate } from '@/data/providers'
import ComparisonTable from '@/components/ComparisonTable'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import PostcodeChecker from '@/components/PostcodeChecker'

export const metadata: Metadata = {
  title: 'Compare All UK Broadband Providers 2026',
  description:
    'Compare broadband deals from every major UK provider side by side. BT, Sky, Virgin Media, EE, TalkTalk and more — speeds, prices, contracts and ratings.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/compare' },
  openGraph: {
    title: 'Compare All UK Broadband Providers 2026 | BroadbandPicker',
    description: 'Compare broadband deals side by side from every major UK provider.',
    url: 'https://broadbandpicker.co.uk/compare',
  },
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'UK Broadband Provider Comparison',
  itemListElement: providers.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: p.name,
    url: `https://broadbandpicker.co.uk/providers/${p.slug}`,
  })),
}

const comparePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Compare UK Broadband Providers',
  description:
    'BroadbandPicker comparison table for UK broadband providers covering price, speed, contract length, setup fee, coverage, and customer sentiment signals.',
  url: 'https://broadbandpicker.co.uk/compare',
  dateModified: providerDatasetUpdatedDate,
  citation: [
    'https://broadbandpicker.co.uk/providers',
    'https://broadbandpicker.co.uk/how-we-review-broadband',
    'https://broadbandpicker.co.uk/editorial-policy',
  ],
}

export default function ComparePage() {
  const verifiedDateLabel = new Date(providerDatasetUpdatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const sourceNotes = [
    {
      label: 'BroadbandPicker provider reviews',
      href: '/providers',
      note: 'Each row in this table inherits its price, speed, contract, setup-fee, and support context from the provider review dataset.',
    },
    {
      label: 'BroadbandPicker review methodology',
      href: '/how-we-review-broadband',
      note: 'Explains how we weigh price, speed, coverage, customer sentiment, and use-case fit across commercial comparison pages.',
    },
    {
      label: 'BroadbandPicker editorial policy',
      href: '/editorial-policy',
      note: 'Sets out our editorial independence, corrections standards, and how commercial relationships are handled.',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparePageJsonLd) }}
      />
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Compare providers', href: '/compare' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        Compare UK Broadband Providers
      </h1>
      <p className="text-slate-600 mb-6 max-w-2xl">
        Every major UK broadband provider compared side by side — including price, maximum speed,
        contract length, setup fee, coverage, and customer satisfaction rating.
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
        <span>Comparison dataset reviewed {verifiedDateLabel}</span>
        <span>&middot;</span>
        <span>Prices verified {verifiedDateLabel}</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>

      <div className="mb-8 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-800">
        <strong>Want deals tailored to your postcode?</strong> Enter your postcode below — we&apos;ll show which providers are available at your address.
        <div className="mt-3 max-w-sm">
          <PostcodeChecker />
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        We may earn a commission when you click &ldquo;Get Deal&rdquo;. This does not affect our editorial independence.
      </p>

      <ComparisonTable providers={providers} />

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial and Source Notes</h2>
        <p className="mb-4 text-sm text-slate-600">
          This comparison table is built from the same provider review dataset used across
          BroadbandPicker. It is intended to help users compare mainstream trade-offs quickly,
          then click through to provider reviews for deeper evidence and source notes.
        </p>
        <ul className="space-y-2 text-sm">
          {sourceNotes.map((source) => (
            <li key={source.href}>
              <Link href={source.href} className="text-sky-600 hover:underline">
                {source.label}
              </Link>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{source.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <Link
          href="/deals"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
        >
          <div className="font-semibold text-slate-900 mb-1">Browse all deals &rarr;</div>
          <div className="text-slate-500">Filterable deals table with every package</div>
        </Link>
        <Link
          href="/providers"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
        >
          <div className="font-semibold text-slate-900 mb-1">Provider reviews &rarr;</div>
          <div className="text-slate-500">In-depth reviews of every major UK ISP</div>
        </Link>
        <Link
          href="/providers/compare"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
        >
          <div className="font-semibold text-slate-900 mb-1">Head-to-head comparisons &rarr;</div>
          <div className="text-slate-500">Compare BT vs Sky, BT vs Virgin Media, and more</div>
        </Link>
      </div>
    </div>
  )
}
