import type { Metadata } from 'next'
import Link from 'next/link'
import { providers, providerDatasetUpdatedDate } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import PostcodeChecker from '@/components/PostcodeChecker'
import DealsClient from '@/components/DealsClient'
import PostcodeContextBar from '@/components/PostcodeContextBar'
import { buildDealListJsonLd, buildOfferCatalogJsonLd } from '@/lib/dealSchema'
import { JsonLd } from '@/lib/jsonLd'
import CiteableAnswer from '@/components/CiteableAnswer'

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

const dealsPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'UK Broadband Deals',
  description:
    'BroadbandPicker broadband deals index covering package price, speed, contract length, and provider review context for major UK providers.',
  url: 'https://broadbandpicker.co.uk/deals',
  dateModified: providerDatasetUpdatedDate,
  citation: [
    'https://broadbandpicker.co.uk/providers',
    'https://broadbandpicker.co.uk/how-we-review-broadband',
    'https://broadbandpicker.co.uk/editorial-policy',
  ],
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
  const dealListJsonLd = buildDealListJsonLd(allDeals.slice(0, 30), 'UK Broadband Deals')
  const offerCatalogJsonLd = buildOfferCatalogJsonLd(allDeals.slice(0, 30), 'UK Broadband Deals')
  const verifiedDateLabel = new Date(providerDatasetUpdatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const sourceNotes = [
    {
      label: 'BroadbandPicker provider reviews',
      href: '/providers',
      note: 'Each deal row inherits package context, contract terms, coverage signals, and customer-sentiment notes from our provider review dataset.',
    },
    {
      label: 'BroadbandPicker review methodology',
      href: '/how-we-review-broadband',
      note: 'Explains how we review pricing, speed tiers, contract length, setup costs, coverage, and overall value across commercial pages.',
    },
    {
      label: 'BroadbandPicker editorial policy',
      href: '/editorial-policy',
      note: 'Sets out our editorial independence, correction standards, and how commercial relationships are handled.',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={dealListJsonLd} />
      <JsonLd data={offerCatalogJsonLd} />
      <JsonLd data={dealsPageJsonLd} />
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Broadband deals', href: '/deals' },
        ]}
      />

      <PostcodeContextBar />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">All UK Broadband Deals</h1>
      <CiteableAnswer>
        This table is a UK snapshot of packages we track, sorted so you can shortlist by price,
        speed or contract. Availability still depends on the address, so enter a postcode before
        you treat any row as orderable. Prices on this page were verified {verifiedDateLabel}.
        Rankings are not sold.
      </CiteableAnswer>
      <p className="text-slate-600 mb-6 max-w-2xl">
        Browse every broadband package from every major UK provider. Filter by speed, price, or
        contract length.
      </p>
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
        <span>Deals dataset reviewed {verifiedDateLabel}</span>
        <span>&middot;</span>
        <span>Prices verified {verifiedDateLabel}</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>

      <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-800">
        <strong>Want deals at your address?</strong> Enter your postcode to see which providers
        are available in your area.
        <div className="mt-3 max-w-sm">
          <PostcodeChecker />
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Prices verified {verifiedDateLabel}. We may earn a commission when you click
        &ldquo;Get Deal&rdquo;{' '}
        <Link href="/about" className="underline hover:text-slate-600">
          See how we make money.
        </Link>
      </p>

      <DealsClient allDeals={allDeals} />

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial and Source Notes</h2>
        <p className="mb-4 text-sm text-slate-600">
          This deals page is built from BroadbandPicker&apos;s provider review dataset and is meant
          to help users shortlist packages quickly before visiting provider pages for deeper
          context on value, coverage, and support trade-offs.
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
