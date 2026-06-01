import type { Metadata } from 'next'
import Link from 'next/link'
import { providers } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import PostcodeChecker from '@/components/PostcodeChecker'
import DealsClient from '@/components/DealsClient'

export const metadata: Metadata = {
  title: 'Best Broadband Deals UK June 2026',
  description:
    'Compare all UK broadband deals. Filter by speed, price, and contract length. Find the cheapest broadband from BT, Sky, Virgin Media, EE and more.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/deals' },
  openGraph: {
    title: 'Best Broadband Deals UK June 2026 | BroadbandPicker',
    description: 'Compare all UK broadband deals — filter by speed, price and contract.',
    url: 'https://broadbandpicker.co.uk/deals',
  },
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'UK Broadband Deals',
  itemListElement: providers.slice(0, 10).map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `${p.name} Broadband`,
    url: `https://broadbandpicker.co.uk/providers/${p.slug}`,
  })),
}

function getAllDeals() {
  return providers.flatMap((p) =>
    p.speeds.map((s, i) => ({
      provider: p,
      packageName: `${p.name} ${s.type} ${s.download}Mbps`,
      download: s.download,
      upload: s.upload,
      type: s.type,
      monthlyPrice: i === 0 ? p.monthlyPriceFrom : p.monthlyPriceFrom + i * 5,
      contractLength: p.contractLengths[0],
      setupFee: p.setupFee,
    }))
  )
}

export default function DealsPage() {
  const allDeals = getAllDeals()
  const updatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Broadband deals', href: '/deals' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">All UK Broadband Deals</h1>
      <p className="text-slate-600 mb-6 max-w-2xl">
        Browse every broadband package from every major UK provider. Filter by speed, price, or
        contract length.
      </p>

      <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-800">
        <strong>Want deals at your address?</strong> Enter your postcode to see which providers
        are available in your area.
        <div className="mt-3 max-w-sm">
          <PostcodeChecker />
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Updated: {updatedDate}. We may earn a commission when you click &ldquo;Get Deal&rdquo;.{' '}
        <Link href="/about" className="underline hover:text-slate-600">
          See how we make money.
        </Link>
      </p>

      <DealsClient allDeals={allDeals} />

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <Link
          href="/compare"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
        >
          <div className="font-semibold text-slate-900 mb-1">Compare providers &rarr;</div>
          <div className="text-slate-500">Side-by-side comparison table</div>
        </Link>
        <Link
          href="/providers"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
        >
          <div className="font-semibold text-slate-900 mb-1">Provider reviews &rarr;</div>
          <div className="text-slate-500">In-depth reviews of every major UK ISP</div>
        </Link>
        <Link
          href="/guides/cheapest-broadband-uk"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
        >
          <div className="font-semibold text-slate-900 mb-1">Cheapest broadband &rarr;</div>
          <div className="text-slate-500">Our guide to the best budget packages</div>
        </Link>
      </div>
    </div>
  )
}
