import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getPostcodeArea,
  getAllPostcodePrefixes,
  postcodeDatasetUpdatedDate,
  postcodeSourceNotes,
} from '@/data/postcodes'
import { providers, getTopDeals, providerDatasetUpdatedDate } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import DealTable from '@/components/DealTable'
import FAQAccordion from '@/components/FAQAccordion'
import AffiliateCTA from '@/components/AffiliateCTA'
import NewsletterSignup from '@/components/NewsletterSignup'

export async function generateStaticParams() {
  return getAllPostcodePrefixes().map((prefix) => ({ area: prefix }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>
}): Promise<Metadata> {
  const { area } = await params
  const postcodeArea = getPostcodeArea(area)
  if (!postcodeArea) return {}

  const prefix = postcodeArea.prefix.toUpperCase()

  return {
    title: { absolute: `${prefix} Broadband Deals | BroadbandPicker` },
    description: `Compare broadband deals in ${postcodeArea.town} (${prefix}). ${postcodeArea.availableProviders.length} providers from £${postcodeArea.cheapestMonthly}/mo. Avg speed ${postcodeArea.avgDownloadSpeed} Mbps.`,
    alternates: { canonical: `https://broadbandpicker.co.uk/postcode/${area.toLowerCase()}` },
    openGraph: {
      title: `${prefix} Broadband Deals | BroadbandPicker`,
      description: `${postcodeArea.availableProviders.length} providers available in ${postcodeArea.town} from £${postcodeArea.cheapestMonthly}/month.`,
      url: `https://broadbandpicker.co.uk/postcode/${area.toLowerCase()}`,
    },
  }
}

export default async function PostcodeAreaPage({
  params,
}: {
  params: Promise<{ area: string }>
}) {
  const { area } = await params
  const postcodeArea = getPostcodeArea(area)
  const pricingVerifiedDateLabel = new Date(providerDatasetUpdatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const postcodeReviewedDateLabel = new Date(postcodeDatasetUpdatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (!postcodeArea) {
    const prefix = area.toUpperCase()
    const nationalDeals = getTopDeals(12).map((d) => ({
      provider: d.provider,
      packageName: `${d.provider.name} Broadband`,
      download: d.download,
      upload: d.upload,
      type: d.type,
      monthlyPrice: d.monthlyPrice,
      contractLength: d.contractLength,
      setupFee: d.setupFee,
    }))
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: `${prefix} broadband`, href: `/postcode/${area.toLowerCase()}` },
          ]}
        />
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-8 flex gap-4 items-start">
          <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-sky-900 text-sm">We&apos;re expanding our {prefix} coverage</p>
            <p className="text-sky-800 text-sm mt-0.5">We don&apos;t have postcode-specific data for {prefix} yet. Below are the best broadband deals available across the UK — all of which serve this area through the Openreach network.</p>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Broadband Deals Available in {prefix}
        </h1>
        <p className="text-slate-600 mb-8 max-w-3xl">
          These providers all operate in the {prefix} area via the UK&apos;s Openreach network. Click any deal to check availability at your specific address on the provider&apos;s website.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
          <span>Area model reviewed {postcodeReviewedDateLabel}</span>
          <span>&middot;</span>
          <span>Prices verified {pricingVerifiedDateLabel}</span>
          <span>&middot;</span>
          <span>Reviewed by BroadbandPicker editorial team</span>
        </div>
        <DealTable deals={nationalDeals} showDisclosure={true} compact={false} />
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial and Source Notes</h2>
          <p className="mb-4 text-sm text-slate-600">
            We do not yet hold postcode-area coverage data for {prefix}, so this page falls back to
            the national provider dataset and asks users to verify address-level availability on the
            provider site before ordering.
          </p>
          <ul className="space-y-2 text-sm">
            {postcodeSourceNotes.map((source) => (
              <li key={source.href}>
                <Link href={source.href} className="text-sky-600 hover:underline">
                  {source.label}
                </Link>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{source.note}</p>
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-8">
          <NewsletterSignup
            variant="postcode"
            source={`postcode-unknown-${area.toLowerCase()}`}
            postcodeArea={prefix}
          />
        </div>
        <div className="mt-10 bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-2">Compare all UK broadband deals</h2>
          <p className="text-sm text-slate-600 mb-4">See every provider side by side, sorted by price, speed or rating.</p>
          <Link href="/compare" className="px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg text-sm hover:bg-sky-600 transition-colors">
            Compare all providers →
          </Link>
        </div>
      </div>
    )
  }

  const prefix = postcodeArea.prefix.toUpperCase()

  const availableProviders = providers.filter((p) =>
    postcodeArea.availableProviders.includes(p.slug)
  )

  const hasFttp = availableProviders.some((p) => p.speeds.some((s) => s.type === 'FTTP'))
  const cheapestProvider = [...availableProviders].sort((a, b) => a.monthlyPriceFrom - b.monthlyPriceFrom)[0]
  const fastestProvider = availableProviders.reduce((a, b) => {
    const aMax = Math.max(...a.speeds.map((s) => s.download))
    const bMax = Math.max(...b.speeds.map((s) => s.download))
    return bMax > aMax ? b : a
  })

  const areaDeals = availableProviders.map((p) => ({
    provider: p,
    packageName: `${p.name} Broadband`,
    download: p.speeds[0].download,
    upload: p.speeds[0].upload,
    type: p.speeds[0].type,
    monthlyPrice: p.monthlyPriceFrom,
    contractLength: p.contractLengths[0],
    setupFee: p.setupFee,
  }))

  const faqItems = [
    {
      question: `Which broadband providers are available in ${postcodeArea.town} (${prefix})?`,
      answer: `${postcodeArea.town} (${prefix}) has ${availableProviders.length} broadband providers available: ${availableProviders.map((p) => p.name).join(', ')}. Availability can vary by specific street or property — use our postcode checker to confirm your address.`,
    },
    {
      question: `What is the cheapest broadband deal in ${prefix}?`,
      answer: `The cheapest broadband in the ${prefix} area currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}. Introductory prices may rise after the initial contract period — always check the out-of-contract price before signing up.`,
    },
    {
      question: `What average broadband speeds can I get in ${postcodeArea.town}?`,
      answer: `The average download speed in the ${prefix} postcode area is ${postcodeArea.avgDownloadSpeed} Mbps. ${hasFttp ? `Full-fibre (FTTP) broadband is available in this area, with speeds of up to ${Math.max(...availableProviders.flatMap((p) => p.speeds.map((s) => s.download)))} Mbps from providers including ${availableProviders.filter((p) => p.speeds.some((s) => s.type === 'FTTP')).slice(0, 2).map((p) => p.name).join(' and ')}.` : `Superfast fibre (FTTC) is the most widely available technology in this area.`}`,
    },
    {
      question: `Who is the fastest broadband provider in ${prefix}?`,
      answer: `${fastestProvider.name} offers the fastest speeds in the ${prefix} area, with packages available up to ${Math.max(...fastestProvider.speeds.map((s) => s.download))} Mbps. Compare all available speeds in the table above to find the right package for your household.`,
    },
    {
      question: `How do I switch broadband in ${postcodeArea.town}?`,
      answer: `Switching broadband in ${postcodeArea.town} is straightforward. Under Ofcom's One Touch Switching rules, you simply sign up with your new provider — they contact your old provider and manage the transfer. Most switches complete within 10–15 working days with no loss of service.`,
    },
  ]

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Best Broadband Deals in ${postcodeArea.town} (${prefix})`,
    description: `Compare broadband deals available in the ${prefix} postcode area of ${postcodeArea.town}, ${postcodeArea.city}`,
    url: `https://broadbandpicker.co.uk/postcode/${area.toLowerCase()}`,
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
  const sourceLinks = [
    ...postcodeSourceNotes,
    {
      label: `${prefix} area comparison page`,
      href: `/postcode/${area.toLowerCase()}`,
      note: `This page uses postcode-area level coverage modelling for ${postcodeArea.town} and is not a property-level availability checker.`,
    },
  ]
  const webPageWithCitationsJsonLd = {
    ...webPageJsonLd,
    dateModified: providerDatasetUpdatedDate,
    citation: [
      `https://broadbandpicker.co.uk/providers`,
      `https://broadbandpicker.co.uk/how-we-review-broadband`,
      `https://broadbandpicker.co.uk/editorial-policy`,
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageWithCitationsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: `${prefix} broadband`, href: `/postcode/${area.toLowerCase()}` },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        Best Broadband Deals in {postcodeArea.town} ({prefix})
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
        <span>Area model reviewed {postcodeReviewedDateLabel}</span>
        <span>&middot;</span>
        <span>Prices verified {pricingVerifiedDateLabel}</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>

      <p className="text-slate-600 mb-6 max-w-3xl leading-relaxed">
        We compared <strong>{availableProviders.length} broadband providers</strong> available in
        the {prefix} postcode area ({postcodeArea.town}, {postcodeArea.city},{' '}
        {postcodeArea.region}). Average download speeds here are{' '}
        <strong>{postcodeArea.avgDownloadSpeed} Mbps</strong>, with deals starting from{' '}
        <strong>£{postcodeArea.cheapestMonthly.toFixed(2)}/month</strong>.{' '}
        {hasFttp
          ? `Full-fibre (FTTP) broadband is available in ${postcodeArea.town}, delivering speeds of up to 1,000 Mbps directly to your property.`
          : `Superfast fibre (FTTC) is the most widely available connection type in this area.`}{' '}
        Use the table below to compare deals, sort by price or speed, and click through to sign
        up directly with your chosen provider.
      </p>

      {/* Area stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Providers available', value: String(availableProviders.length) },
          { label: 'Avg download speed', value: `${postcodeArea.avgDownloadSpeed} Mbps` },
          { label: 'Cheapest deal', value: `£${postcodeArea.cheapestMonthly.toFixed(2)}/mo` },
          { label: 'Region', value: postcodeArea.region },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Deal table */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Broadband Deals Available in {prefix}
      </h2>
      <DealTable deals={areaDeals} showDisclosure={true} compact={false} />

      <p className="text-xs text-slate-400 mt-3">
        Availability is based on postcode area coverage data, not individual property checks.
        Prices verified on {pricingVerifiedDateLabel}. We may earn a commission when you click
        &ldquo;Get Deal&rdquo;.{' '}
        <Link href="/about" className="underline hover:text-slate-600">
          Learn more.
        </Link>
      </p>

      {/* Deal alert signup — contextual to this postcode area */}
      <div className="mt-8">
        <NewsletterSignup
          variant="postcode"
          source={`postcode-${area.toLowerCase()}`}
          postcodeArea={prefix}
          postcodeTown={postcodeArea.town}
        />
      </div>

      {/* Provider cards */}
      <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4">
        Providers Available in {postcodeArea.town}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {availableProviders.map((p) => (
          <div key={p.slug} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-900">{p.name}</span>
              <span className="text-sm font-semibold text-slate-900">
                from £{p.monthlyPriceFrom.toFixed(2)}/mo
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-3">
              Up to {p.speeds[p.speeds.length - 1].download} Mbps &middot;{' '}
              {p.contractLengths.join('/')} month contracts
            </div>
            <div className="flex items-center gap-2">
              <AffiliateCTA
                href={p.affiliateUrl}
                providerName={p.name}
                providerSlug={p.slug}
                size="sm"
              />
              <Link href={`/providers/${p.slug}`} className="text-xs text-sky-600 hover:underline">
                Review &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Broadband in {postcodeArea.town} — Frequently Asked Questions
      </h2>
      <FAQAccordion items={faqItems} />

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial and Source Notes</h2>
        <p className="mb-4 text-sm text-slate-600">
          These postcode pages use area-level coverage modelling and provider review data. They
          are designed to help shortlist realistic providers for a postcode district before you
          confirm exact property availability on a provider checker.
        </p>
        <ul className="space-y-2 text-sm">
          {sourceLinks.map((source) => (
            <li key={source.href}>
              <Link href={source.href} className="text-sky-600 hover:underline">
                {source.label}
              </Link>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{source.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA block */}
      <div className="mt-10 bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-2">
          Not sure which deal is right for you?
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Read our switching guide or compare all UK providers side by side.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/compare"
            className="px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg text-sm hover:bg-sky-600 transition-colors"
          >
            Compare all providers
          </Link>
          <Link
            href="/guides/how-to-switch-broadband-uk"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            How to switch broadband
          </Link>
          <Link
            href="/guides/broadband-speeds-explained"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            What speed do I need?
          </Link>
        </div>
      </div>
    </div>
  )
}
