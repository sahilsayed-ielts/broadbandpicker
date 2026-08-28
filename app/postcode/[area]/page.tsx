import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getPostcodeArea,
  getAllPostcodePrefixes,
  postcodeDatasetUpdatedDate,
  postcodeSourceNotes,
} from '@/data/postcodes'
import { providers, getTopDeals, providerDatasetUpdatedDate } from '@/data/providers'
import {
  getDistrictCoverage,
  districtCoverageSourceDataDate,
  districtCoverageSourceLabel,
  districtCoverageSourcePage,
} from '@/data/postcodeDistrictCoverage'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import DealTable from '@/components/DealTable'
import FAQAccordion from '@/components/FAQAccordion'
import AffiliateCTA from '@/components/AffiliateCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import RatingStars from '@/components/RatingStars'
import DartfordBroadbandNeeds from '@/components/DartfordBroadbandNeeds'
import { getPostcodeLocalIntel } from '@/data/postcodeLocalIntel'
import { buildDealListJsonLd } from '@/lib/dealSchema'

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
  const canonical = `https://broadbandpicker.co.uk/postcode/${area.toLowerCase()}`

  if (!postcodeArea) {
    const prefix = area.toUpperCase()
    const coverage = getDistrictCoverage(prefix)
    if (!coverage) return {}

    const description =
      coverage.gigabitPercent !== null
        ? `${prefix} broadband coverage: ${coverage.gigabitPercent}% gigabit-capable, ${coverage.superfastPercent}% superfast availability (Ofcom data). Compare UK broadband deals and check exact availability at your address.`
        : `Compare UK broadband deals available in the ${prefix} postcode district.`

    return {
      title: { absolute: `${prefix} Broadband Coverage and Deals | BroadbandPicker` },
      description,
      alternates: { canonical },
      openGraph: {
        title: `${prefix} Broadband Coverage and Deals | BroadbandPicker`,
        description,
        url: canonical,
      },
    }
  }

  const prefix = postcodeArea.prefix.toUpperCase()

  if (prefix === 'DA1') {
    const coverage = getDistrictCoverage(prefix)
    const description = coverage
      ? `Compare broadband deals in Dartford (DA1). See ${coverage.gigabitPercent}% gigabit and ${coverage.superfastPercent}% superfast coverage from Ofcom data, providers, prices and a speed guide.`
      : 'Compare broadband deals in Dartford (DA1), including providers, prices, speeds and full-fibre availability.'

    return {
      title: { absolute: 'Broadband Deals in Dartford (DA1) | Compare Prices & Speeds' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Dartford (DA1) | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }

  return {
    title: { absolute: `${prefix} Broadband Deals | BroadbandPicker` },
    description: `Compare broadband deals in ${postcodeArea.town} (${prefix}). ${postcodeArea.availableProviders.length} providers from £${postcodeArea.cheapestMonthly}/mo. Avg speed ${postcodeArea.avgDownloadSpeed} Mbps.`,
    alternates: { canonical },
    openGraph: {
      title: `${prefix} Broadband Deals | BroadbandPicker`,
      description: `${postcodeArea.availableProviders.length} providers available in ${postcodeArea.town} from £${postcodeArea.cheapestMonthly}/month.`,
      url: canonical,
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
    const coverage = getDistrictCoverage(prefix)
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
    const nationalDealListJsonLd = buildDealListJsonLd(nationalDeals, `Broadband deals available in ${prefix}`)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(nationalDealListJsonLd) }}
        />
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: `${prefix} broadband`, href: `/postcode/${area.toLowerCase()}` },
          ]}
        />
        {coverage ? (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-8">
            <p className="font-semibold text-sky-900 text-sm mb-3">
              Ofcom coverage data for {prefix} ({coverage.sampleSize} postcodes sampled, {districtCoverageSourceDataDate})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Gigabit-capable', value: coverage.gigabitPercent },
                { label: 'Superfast (30Mbps+)', value: coverage.superfastPercent },
                { label: 'Ultrafast (100Mbps+)', value: coverage.ultrafastPercent },
                { label: 'Below USO (under 10Mbps)', value: coverage.belowUsoPercent },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg border border-sky-100 p-3 text-center">
                  <div className="text-lg font-bold text-slate-900">{value !== null ? `${value}%` : '—'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-sky-800 text-xs mt-3">
              This is area-level technology availability, not a live per-address check — the deals below are
              matched by network reach, not confirmed at your exact address. Click through to confirm before ordering.
            </p>
          </div>
        ) : (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-8 flex gap-4 items-start">
            <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-sky-900 text-sm">We&apos;re expanding our {prefix} coverage</p>
              <p className="text-sky-800 text-sm mt-0.5">We don&apos;t have postcode-specific data for {prefix} yet. Below are the best broadband deals available across the UK — all of which serve this area through the Openreach network.</p>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          {coverage ? `Broadband Coverage and Deals in ${prefix}` : `Broadband Deals Available in ${prefix}`}
        </h1>
        <p className="text-slate-600 mb-8 max-w-3xl">
          {coverage
            ? `${coverage.gigabitPercent}% of premises in ${prefix} can get gigabit-capable broadband, based on Ofcom's postcode-level coverage data. Compare deals below, then click through to confirm exact availability at your address.`
            : <>These providers all operate in the {prefix} area via the UK&apos;s Openreach network. Click any deal to check availability at your specific address on the provider&apos;s website.</>}
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
            {coverage
              ? `Coverage figures above are area-level technology availability from Ofcom, not a live per-address check. Deal listings use the national provider dataset — verify address-level availability on the provider site before ordering.`
              : `We do not yet hold postcode-area coverage data for ${prefix}, so this page falls back to the national provider dataset and asks users to verify address-level availability on the provider site before ordering.`}
          </p>
          <ul className="space-y-2 text-sm">
            {coverage && (
              <li>
                <a
                  href={districtCoverageSourcePage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline"
                >
                  {districtCoverageSourceLabel}
                </a>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Aggregated from {coverage.sampleSize} individual postcodes in the {prefix} district under the
                  Open Government Licence. Data reflects the {districtCoverageSourceDataDate} edition — coverage
                  changes over time, so treat this as directional rather than a live figure.
                </p>
              </li>
            )}
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
  const districtCoverage = getDistrictCoverage(prefix)
  const isDartford = prefix === 'DA1'
  const localIntel = getPostcodeLocalIntel(prefix)
  const hasLocalIntel = Boolean(localIntel) && !isDartford

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
      answer: `${postcodeArea.town} (${prefix}) has ${availableProviders.length} broadband providers available: ${availableProviders.map((p) => p.name).join(', ')}. Availability can vary by specific street or property, so use our postcode checker to confirm your address.`,
    },
    {
      question: `What is the cheapest broadband deal in ${prefix}?`,
      answer: `The cheapest broadband in the ${prefix} area currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}. Introductory prices may rise after the initial contract period, so always check the out-of-contract price before signing up.`,
    },
    {
      question: `What average broadband speeds can I get in ${postcodeArea.town}?`,
      answer: `${districtCoverage ? `Ofcom postcode-level data shows ${districtCoverage.superfastPercent}% superfast and ${districtCoverage.gigabitPercent}% gigabit-capable coverage across ${prefix}. ` : ''}Our area model estimates an average download speed of ${postcodeArea.avgDownloadSpeed} Mbps in ${postcodeArea.town}. ${hasFttp ? `Full-fibre packages can offer up to ${Math.max(...availableProviders.flatMap((p) => p.speeds.map((s) => s.download)))} Mbps.` : `Superfast fibre (FTTC) is the most widely available connection type in this area.`} These are area-level figures, so check the exact address before ordering.`,
    },
    {
      question: `Who is the fastest broadband provider in ${prefix}?`,
      answer: `${fastestProvider.name} offers the fastest speeds in the ${prefix} area, with packages available up to ${Math.max(...fastestProvider.speeds.map((s) => s.download))} Mbps. Compare all available speeds in the table above to find the right package for your household.`,
    },
    {
      question: `How do I switch broadband in ${postcodeArea.town}?`,
      answer: `Switching broadband in ${postcodeArea.town} is straightforward. Under Ofcom's One Touch Switching rules, you simply sign up with your new provider. They contact your old provider and manage the transfer. Most switches complete within 10 to 15 working days with no loss of service.`,
    },
    ...(localIntel
      ? [
          {
            question: `Is full-fibre (FTTP) broadband available in ${postcodeArea.town}?`,
            answer: localIntel.altnetParagraphs[0],
          },
        ]
      : []),
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
  const areaDealListJsonLd = buildDealListJsonLd(
    areaDeals,
    `Broadband deals in ${postcodeArea.town} (${prefix})`
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageWithCitationsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(areaDealListJsonLd) }}
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

      {districtCoverage && (
        <div className="mb-8 rounded-xl border border-sky-200 bg-sky-50 p-5" aria-label={`${prefix} broadband coverage summary`}>
          <p className="font-semibold text-sky-950">{prefix} coverage at a glance</p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-sky-900">
            Ofcom&apos;s postcode-level fixed coverage data shows that {districtCoverage.gigabitPercent}% of premises sampled across {prefix} are gigabit-capable and {districtCoverage.superfastPercent}% can receive at least 30 Mbps. The figures cover {districtCoverage.sampleSize.toLocaleString('en-GB')} postcodes and describe network reach, not a guaranteed speed at every home.
          </p>
        </div>
      )}

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

      {isDartford && <DartfordBroadbandNeeds />}

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
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900">{p.name}</span>
              <span className="text-sm font-semibold text-slate-900">
                from £{p.monthlyPriceFrom.toFixed(2)}/mo
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {p.slug === cheapestProvider?.slug && (
                <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold bg-green-100 text-green-800">
                  Cheapest here
                </span>
              )}
              {p.slug === fastestProvider.slug && (
                <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold bg-sky-100 text-sky-800">
                  Fastest here
                </span>
              )}
              <RatingStars score={p.trustpilotScore} size={12} />
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

      {isDartford && districtCoverage && (
        <>
          <section className="mt-10 max-w-4xl" aria-labelledby="dartford-availability">
            <h2 id="dartford-availability" className="text-2xl font-bold text-slate-900">
              What broadband is available in Dartford and DA1?
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Broadband deals in Dartford include services delivered over Openreach, Virgin Media and other networks where they reach the property. BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW sell packages using Openreach infrastructure, while Virgin Media checks availability on its own network. A provider appearing on this page means it serves the wider DA1 market. It does not prove that every package is orderable at every address.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              The strongest local evidence is the Ofcom coverage snapshot. It records {districtCoverage.gigabitPercent}% gigabit-capable coverage, {districtCoverage.ultrafastPercent}% ultrafast coverage and {districtCoverage.superfastPercent}% superfast coverage across DA1. Gigabit-capable means the network can deliver a package with a download speed of at least 1 Gbps. Superfast means at least 30 Mbps. Those categories describe availability, while the speed you actually receive depends on the technology, package, wiring, router position and congestion.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              DA1 covers Dartford and nearby parts of Crayford and Barnes Cray. Availability can change between neighbouring streets and even between flats in the same development. For that reason, compare the shortlist here first, then use the chosen provider&apos;s address checker before paying or cancelling an existing service. Openreach also provides a fibre checker that reports whether Full Fibre is available now, coming soon or planned for a selected address.
            </p>
          </section>

          <section className="mt-10 max-w-4xl" aria-labelledby="dartford-best-deal">
            <h2 id="dartford-best-deal" className="text-2xl font-bold text-slate-900">
              How to find the best broadband deal in Dartford
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Start with the total cost, not the headline monthly price. Multiply the monthly charge across the minimum term, add setup fees and account for any stated annual price changes. A package that begins a few pounds cheaper can cost more over 24 months. Also check the price after the minimum term so you know what happens if you do not switch or renegotiate promptly.
            </p>
            <ol className="mt-5 space-y-4 text-slate-700">
              <li><strong>1. Check the exact address.</strong> DA1-wide figures are useful for planning, but the provider&apos;s checker decides which package can be ordered at your property.</li>
              <li><strong>2. Pick a realistic speed.</strong> Around 30 to 70 Mbps can suit light use. A busy household may benefit from 100 to 300 Mbps. Gigabit service is most useful for many simultaneous users, large downloads or frequent cloud backups.</li>
              <li><strong>3. Compare the full contract.</strong> Include setup charges, rewards, mid-contract increases, minimum term and the out-of-contract price.</li>
              <li><strong>4. Look beyond download speed.</strong> Home workers and creators should compare upload speed. Gamers should also consider latency and use Ethernet where practical.</li>
              <li><strong>5. Confirm switching details.</strong> Ofcom&apos;s One Touch Switch process lets most residential customers contact only the new provider, which then coordinates the move and supplies key timing and cost information.</li>
            </ol>
          </section>

          <section className="mt-10 max-w-4xl" aria-labelledby="dartford-full-fibre">
            <h2 id="dartford-full-fibre" className="text-2xl font-bold text-slate-900">
              Full-fibre broadband in Dartford
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Full fibre, also called FTTP, carries the connection by fibre-optic cable all the way to the premises. It normally offers higher maximum speeds and more dependable performance than FTTC, where the final section uses copper. In DA1, Ofcom reports {districtCoverage.gigabitPercent}% gigabit-capable availability, so many properties should have a high-speed option, but the remaining coverage gap is meaningful. Never assume a Dartford address has FTTP solely because another property nearby can order it.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              If two suitable packages are close in price, we would usually favour FTTP because it removes the copper cabinet-to-home section and gives the household more room for future demand. If the price difference is large and your household only browses, streams on one television and makes occasional video calls, a cheaper superfast package can still be the better-value choice.
            </p>
          </section>

          <section className="mt-10 max-w-4xl" aria-labelledby="dartford-moving">
            <h2 id="dartford-moving" className="text-2xl font-bold text-slate-900">
              Moving home in Dartford: check before choosing a provider
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Run an address check before the move date and ask whether an engineer visit is needed. A property with an existing compatible line may activate more quickly than one requiring a new fibre installation. Tenants should also confirm any drilling or equipment placement with the landlord. Keep the existing service active until the new provider confirms the switching date unless the provider gives different instructions.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              Residents receiving Universal Credit, Pension Credit or another qualifying benefit should check social tariffs before choosing a standard promotion. Social tariffs are designed for eligible households, generally have no exit fee and may offer a more stable long-term price. Eligibility and availability vary by provider, so use our <Link href="/guides/broadband-social-tariffs-uk" className="font-semibold text-sky-700 hover:underline">UK broadband social tariffs guide</Link> alongside the address check.
            </p>
          </section>
        </>
      )}

      {hasLocalIntel && localIntel && districtCoverage && (
        <>
          <section className="mt-10 max-w-4xl" aria-labelledby={`${prefix.toLowerCase()}-availability`}>
            <h2 id={`${prefix.toLowerCase()}-availability`} className="text-2xl font-bold text-slate-900">
              What broadband is available in {postcodeArea.town} and {prefix}?
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Broadband deals in {postcodeArea.town} include services delivered over Openreach, Virgin Media and other networks where they reach the property. A provider appearing on this page means it serves the wider {prefix} market, not that every package is orderable at every address.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              The strongest local evidence is the Ofcom coverage snapshot. It records {districtCoverage.gigabitPercent}% gigabit-capable coverage, {districtCoverage.ultrafastPercent}% ultrafast coverage and {districtCoverage.superfastPercent}% superfast coverage across {prefix}. Gigabit-capable means the network can deliver a package with a download speed of at least 1 Gbps. Superfast means at least 30 Mbps. Those categories describe availability, while the speed you actually receive depends on the technology, package, wiring, router position and congestion.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              {prefix} covers {postcodeArea.town} and reaches into {localIntel.neighbourhoods}. Availability can change between neighbouring streets and even between flats in the same development, so compare the shortlist here first, then use the chosen provider&apos;s address checker before paying or cancelling an existing service.
            </p>
          </section>

          <section className="mt-10 max-w-4xl" aria-labelledby={`${prefix.toLowerCase()}-best-deal`}>
            <h2 id={`${prefix.toLowerCase()}-best-deal`} className="text-2xl font-bold text-slate-900">
              How to find the best broadband deal in {postcodeArea.town}
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Start with the total cost, not the headline monthly price. Multiply the monthly charge across the minimum term, add setup fees and account for any stated annual price changes. A package that begins a few pounds cheaper can cost more over 24 months. Also check the price after the minimum term so you know what happens if you do not switch or renegotiate promptly.
            </p>
            <ol className="mt-5 space-y-4 text-slate-700">
              <li><strong>1. Check the exact address.</strong> {prefix}-wide figures are useful for planning, but the provider&apos;s checker decides which package can be ordered at your property.</li>
              <li><strong>2. Pick a realistic speed.</strong> Around 30 to 70 Mbps can suit light use. A busy household may benefit from 100 to 300 Mbps. Gigabit service is most useful for many simultaneous users, large downloads or frequent cloud backups.</li>
              <li><strong>3. Compare the full contract.</strong> Include setup charges, rewards, mid-contract increases, minimum term and the out-of-contract price.</li>
              <li><strong>4. Look beyond download speed.</strong> Home workers and creators should compare upload speed. Gamers should also consider latency and use Ethernet where practical.</li>
              <li><strong>5. Confirm switching details.</strong> Ofcom&apos;s One Touch Switch process lets most residential customers contact only the new provider, which then coordinates the move and supplies key timing and cost information.</li>
            </ol>
            <p className="mt-4 text-sm italic leading-6 text-slate-600">{localIntel.speedGuidanceNote}</p>
          </section>

          <section className="mt-10 max-w-4xl" aria-labelledby={`${prefix.toLowerCase()}-full-fibre`}>
            <h2 id={`${prefix.toLowerCase()}-full-fibre`} className="text-2xl font-bold text-slate-900">
              Full-fibre broadband in {postcodeArea.town}
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Full fibre, also called FTTP, carries the connection by fibre-optic cable all the way to the premises. It normally offers higher maximum speeds and more dependable performance than FTTC, where the final section uses copper. Never assume a {postcodeArea.town} address has FTTP solely because another property nearby can order it.
            </p>
            {localIntel.altnetParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-4 leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mt-10 max-w-4xl" aria-labelledby={`${prefix.toLowerCase()}-moving`}>
            <h2 id={`${prefix.toLowerCase()}-moving`} className="text-2xl font-bold text-slate-900">
              Moving home in {postcodeArea.town}: check before choosing a provider
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Run an address check before the move date and ask whether an engineer visit is needed. A property with an existing compatible line may activate more quickly than one requiring a new fibre installation. Tenants should also confirm any drilling or equipment placement with the landlord. Keep the existing service active until the new provider confirms the switching date unless the provider gives different instructions.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              Residents receiving Universal Credit, Pension Credit or another qualifying benefit should check social tariffs before choosing a standard promotion. Social tariffs are designed for eligible households, generally have no exit fee and may offer a more stable long-term price. Eligibility and availability vary by provider, so use our <Link href="/guides/broadband-social-tariffs-uk" className="font-semibold text-sky-700 hover:underline">UK broadband social tariffs guide</Link> alongside the address check.
            </p>
          </section>
        </>
      )}

      {/* FAQ */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Broadband in {postcodeArea.town}: Frequently Asked Questions
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
          {isDartford && (
            <>
              <li>
                <a href={districtCoverageSourcePage} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                  {districtCoverageSourceLabel}
                </a>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Source for the DA1 gigabit, ultrafast, superfast and below-USO coverage figures, aggregated from postcode-level records dated {districtCoverageSourceDataDate}.</p>
              </li>
              <li>
                <a href="https://www.openreach.com/fibre-checker" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Openreach Full Fibre availability checker</a>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Address-level checker for current and planned Openreach Full Fibre availability.</p>
              </li>
              <li>
                <a href="https://www.ofcom.org.uk/phones-and-broadband/switching-provider/simpler-broadband-switching-is-here" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Ofcom: One Touch Switch</a>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Regulatory guidance on the residential broadband switching process.</p>
              </li>
            </>
          )}
          {hasLocalIntel && localIntel && (
            <>
              {districtCoverage && (
                <li>
                  <a href={districtCoverageSourcePage} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                    {districtCoverageSourceLabel}
                  </a>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Source for the {prefix} gigabit, ultrafast, superfast and below-USO coverage figures, aggregated from postcode-level records dated {districtCoverageSourceDataDate}.</p>
                </li>
              )}
              {localIntel.sources.map((source) => (
                <li key={source.href}>
                  <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                    {source.label}
                  </a>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{source.note}</p>
                </li>
              ))}
              <li>
                <a href="https://www.openreach.com/fibre-checker" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Openreach Full Fibre availability checker</a>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Address-level checker for current and planned Openreach Full Fibre availability.</p>
              </li>
            </>
          )}
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
