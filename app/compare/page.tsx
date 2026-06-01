import type { Metadata } from 'next'
import Link from 'next/link'
import { providers } from '@/data/providers'
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

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
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
          href="/guides/how-to-switch-broadband-uk"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
        >
          <div className="font-semibold text-slate-900 mb-1">How to switch &rarr;</div>
          <div className="text-slate-500">Step-by-step switching guide</div>
        </Link>
      </div>
    </div>
  )
}
