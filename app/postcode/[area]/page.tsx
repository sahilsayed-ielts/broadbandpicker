import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getPostcodeArea,
  getAllPostcodePrefixes,
  postcodeDatasetUpdatedDate,
  postcodeSourceNotes,
} from '@/data/postcodes'
import { providers, getTopDeals, providerDatasetUpdatedDate } from '@/data/providers'
import { JsonLd } from '@/lib/jsonLd'
import { organizationRef, SITE_URL } from '@/lib/siteSchema'
import CiteableAnswer from '@/components/CiteableAnswer'
import {
  getDistrictCoverage,
  districtCoverageSourceDataDate,
  districtCoverageSourceLabel,
  districtCoverageSourcePage,
} from '@/data/postcodeDistrictCoverage'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import DealsClient from '@/components/DealsClient'
import FAQAccordion from '@/components/FAQAccordion'
import AffiliateCTA from '@/components/AffiliateCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import RatingStars from '@/components/RatingStars'
import DartfordBroadbandNeeds from '@/components/DartfordBroadbandNeeds'
import M1BroadbandPlanComparison from '@/components/M1BroadbandPlanComparison'
import NG1BroadbandComparison from '@/components/NG1BroadbandComparison'
import RG1BroadbandComparison from '@/components/RG1BroadbandComparison'
import CT1BroadbandComparison from '@/components/CT1BroadbandComparison'
import RM1BroadbandComparison from '@/components/RM1BroadbandComparison'
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
  if (prefix === 'HA1') {
    const description = 'Compare broadband deals in Harrow and HA1 using Ofcom-derived district coverage, local network evidence and exact-address checks for HA1 4BH, HA1 3AN and nearby streets.'
    return {
      title: { absolute: 'Broadband Deals in Harrow and HA1 | Coverage & Providers' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Harrow and HA1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'BN1') {
    const description = 'Compare broadband deals in Brighton and BN1 using Ofcom-derived district coverage, total contract cost and exact-address checks for full-fibre networks.'
    return {
      title: { absolute: 'Broadband Deals in Brighton and BN1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Brighton and BN1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'GU1') {
    const description = 'Compare broadband deals in Guildford and GU1 using Ofcom-derived district coverage, total contract cost and exact-address checks for full fibre and new multi-gigabit services.'
    return {
      title: { absolute: 'Broadband Deals in Guildford and GU1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Guildford and GU1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'M1') {
    const description = 'M1 broadband deals and coverage for Manchester city centre. Compare plans and see Ofcom-derived M1 gigabit and superfast availability before checking your exact address.'
    return {
      title: { absolute: 'M1 Broadband Deals and Coverage | Manchester City Centre' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'M1 Broadband Deals and Coverage | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }

  if (prefix === 'NG1') {
    const description = 'Compare broadband deals in Nottingham and NG1 using district coverage, price and speed checks. See current networks, household options and exact-address limitations.'
    return {
      title: { absolute: 'Broadband Deals Nottingham and NG1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals Nottingham and NG1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }

  if (prefix === 'RG1') {
    const description = 'Compare broadband deals in Reading and RG1 using Ofcom-derived district coverage, total contract cost and exact-address checks for full-fibre networks.'
    return {
      title: { absolute: 'Broadband Deals in Reading and RG1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Reading and RG1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }

  if (prefix === 'CT1') {
    const description = 'Compare broadband deals in Canterbury and CT1 using Ofcom-derived district coverage, household speed needs and total contract cost before checking your exact address.'
    return {
      title: { absolute: 'Broadband Deals in Canterbury and CT1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Canterbury and CT1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }

  if (prefix === 'RM1') {
    const description = 'Compare broadband deals in Romford and RM1 using Ofcom-derived district coverage, total contract cost and exact-address checks across competing networks.'
    return {
      title: { absolute: 'Broadband Deals in Romford and RM1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Romford and RM1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }

  if (prefix === 'BS1') {
    const description = 'Compare broadband deals in Bristol and BS1 using Ofcom-derived city-centre coverage, total contract cost and exact-address checks for flats and homes.'
    return {
      title: { absolute: 'Broadband Deals Bristol and BS1 | Compare City-Centre Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals Bristol and BS1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }

  if (prefix === 'NE1') {
    const description = 'Compare broadband deals in Newcastle and NE1 using Ofcom-derived city-centre coverage, total contract cost and exact-address checks for flats, renters and homes.'
    return {
      title: { absolute: 'Broadband Deals Newcastle and NE1 | Compare City-Centre Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals Newcastle and NE1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }

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
    title: { absolute: `Broadband Deals in ${postcodeArea.town} (${prefix}) | 2026 Prices & Speeds` },
    description: `Compare broadband deals in ${postcodeArea.town} (${prefix}). ${postcodeArea.availableProviders.length} providers from £${postcodeArea.cheapestMonthly}/mo. Avg speed ${postcodeArea.avgDownloadSpeed} Mbps.`,
    alternates: { canonical },
    openGraph: {
      title: `Broadband Deals in ${postcodeArea.town} (${prefix}) | BroadbandPicker`,
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
  const pageReviewedDateLabel = area.toUpperCase() === 'HA1'
    ? '4 September 2026'
    : area.toUpperCase() === 'GU1'
    ? '1 September 2026'
    : ['BN1', 'M1', 'NG1', 'RG1', 'CT1', 'RM1', 'BS1', 'NE1'].includes(area.toUpperCase())
      ? '31 August 2026'
      : postcodeReviewedDateLabel

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
        <JsonLd data={nationalDealListJsonLd} />
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
                  <div className="text-lg font-bold text-slate-900">{value !== null ? `${value}%` : 'Not available'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-sky-800 text-xs mt-3">
              This is area-level technology availability, not a live per-address check. The deals below are
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
              <p className="text-sky-800 text-sm mt-0.5">We don&apos;t have postcode-specific data for {prefix} yet. Below are broadband deals available across the UK from providers using the Openreach network. Confirm service for your address before ordering.</p>
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
        <DealsClient allDeals={nationalDeals} />
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial and Source Notes</h2>
          <p className="mb-4 text-sm text-slate-600">
            {coverage
              ? `Coverage figures above are area-level technology availability from Ofcom, not a live per-address check. Deal listings use the national provider dataset. Verify address-level availability on the provider site before ordering.`
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
                  Open Government Licence. Data reflects the {districtCoverageSourceDataDate} edition. Coverage
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
  const isBN1 = prefix === 'BN1'
  const isM1 = prefix === 'M1'
  const isNG1 = prefix === 'NG1'
  const isRG1 = prefix === 'RG1'
  const isCT1 = prefix === 'CT1'
  const isRM1 = prefix === 'RM1'
  const isBS1 = prefix === 'BS1'
  const isNE1 = prefix === 'NE1'
  const isGU1 = prefix === 'GU1'
  const isHA1 = prefix === 'HA1'
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

  const standardFaqItems = [
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
  const faqItems = isHA1
    ? [
        {
          question: 'Which broadband providers are available in Harrow and HA1?',
          answer: 'HA1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, Virgin Media on its own network, and Community Fibre or Hyperoptic where their separate networks reach the building. This is a local shortlist, not an availability promise. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'Can I get full-fibre broadband in HA1?',
          answer: `Many HA1 properties can get full fibre or another gigabit-capable service, but coverage is not universal. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled HA1 postcode units. Check the complete address with Ofcom, Openreach, Virgin Media and suitable independent networks before treating any package as orderable.`,
        },
        {
          question: 'What broadband is available at HA1 4BH?',
          answer: 'HA1 4BH is a complete postcode within the wider HA1 district, but district coverage cannot confirm service for one building. Use the house or flat number in each network checker, then compare the personalised speed estimate, minimum guaranteed speed, upload speed, setup work and total contract cost. A nearby full-fibre connection does not prove that the same network serves your property.',
        },
        {
          question: 'What broadband is available at HA1 3AN?',
          answer: 'Availability at HA1 3AN must be checked using the complete property address. The HA1 district snapshot is useful for forming a shortlist, but Openreach, Virgin Media, Community Fibre and building-specific networks can return different results within one postcode. Confirm the exact package, installation requirement, monthly price changes and minimum term before cancelling an existing Harrow broadband service.',
        },
        {
          question: 'How fast is broadband in Harrow HA1?',
          answer: `Ofcom-derived HA1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'How should I choose the best broadband deal in Harrow?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes, rewards and the post-contract price. We would favour an affordable full-fibre plan where it is orderable, while keeping a 30 to 80 Mbps option if it meets the household need at a materially lower total cost.',
        },
      ]
    : isGU1
    ? [
        {
          question: 'Which broadband providers are available in Guildford and GU1?',
          answer: 'GU1 residents can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone, NOW and Virgin Media, plus alternative full-fibre providers serving the complete property. This is a district shortlist, not an availability guarantee. Enter the full house or flat number because Openreach, Virgin Media and independent networks do not reach identical Guildford addresses.',
        },
        {
          question: 'What are the best broadband deals in Guildford?',
          answer: 'There is no universal best Guildford broadband deal because networks, speed estimates and promotions change by address. We would start with an orderable 100 to 300 Mbps full-fibre package for a busy household, then compare every monthly payment, setup fee, stated price rise, reward, minimum guaranteed speed, upload speed and post-contract price.',
        },
        {
          question: 'Can I get full-fibre broadband in GU1?',
          answer: `Full fibre or another gigabit-capable connection is available at many GU1 properties, but not throughout the district. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled GU1 postcode units. Check Ofcom, Openreach and each suitable provider using the complete address before ordering.`,
        },
        {
          question: 'How fast is broadband in Guildford?',
          answer: `Ofcom-derived GU1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These are coverage categories, not measured household speeds. Compare each provider's personalised estimate, minimum guaranteed download speed and upload speed for the complete property.`,
        },
        {
          question: 'Can I get 8 Gbps broadband in Guildford?',
          answer: 'EE launched 2.3 Gbps and 8 Gbps Advanced Full Fibre in Guildford, Woking and surrounding areas in August 2026 using Openreach XGS-PON technology. The launch is not a GU1-wide availability guarantee. Check the complete address with EE, then confirm the supplied equipment, guaranteed speed, upload speed, contract price and whether your wired devices can use the extra capacity.',
        },
        {
          question: 'How should renters and home workers compare broadband in GU1?',
          answer: 'Enter the flat number, ask which networks already enter the building and check whether new cabling needs landlord or managing-agent permission. Match the contract term to the tenancy. Home workers should compare upload speed, minimum guaranteed download speed and fault support, then assess router position, Ethernet and mesh equipment separately from the incoming broadband speed.',
        },
      ]
    : isBN1
    ? [
        {
          question: 'Which broadband providers are available in Brighton and BN1?',
          answer: 'BN1 residents can check retailers using Openreach, Virgin Media where its network reaches the property, CityFibre retailers in connected streets and smaller building-specific networks. BT, Sky, EE, TalkTalk, Plusnet, Vodafone, NOW and Zen are useful starting points, but the complete house or flat number decides which Brighton broadband deals can actually be ordered.',
        },
        {
          question: 'What are the best broadband deals in Brighton?',
          answer: 'There is no universal best Brighton broadband deal because networks, personalised speeds and promotions change by address. For BN1, we would start with an orderable full-fibre or cable plan if its total contract cost is close to part fibre. Compare every monthly payment, setup fee, stated price rise, guaranteed reward, minimum speed and post-contract price before choosing.',
        },
        {
          question: 'Can I get full-fibre broadband in BN1?',
          answer: `Full fibre or another gigabit-capable connection is available at many BN1 properties, but not throughout the district. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled BN1 postcode units. Check Ofcom, Openreach and each suitable provider using the complete address before ordering.`,
        },
        {
          question: 'How fast is broadband in Brighton city centre?',
          answer: `Ofcom-derived BN1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled postcode units. These percentages measure network reach, not household performance. Compare each provider's personalised download estimate, minimum guaranteed speed and upload speed for the complete property.`,
        },
        {
          question: 'Is Virgin Media available in Brighton BN1?',
          answer: 'Virgin Media serves parts of Brighton, but a city-wide result does not prove availability at one BN1 property. Check the complete house or flat number on Virgin Media, then compare it with Openreach-based, CityFibre and any building-specific full-fibre options. Different networks can serve opposite sides of one street or different flats in the same development.',
        },
        {
          question: 'How should students and renters compare broadband in BN1?',
          answer: 'Enter the flat number, ask which networks already enter the building and check whether new cabling needs landlord or managing-agent permission. Match the minimum term to the tenancy and read the home-moving and early termination rules. A lower monthly price on a 24-month Brighton deal may cost more overall if the tenancy ends after 12 months.',
        },
      ]
    : isNE1
    ? [
        {
          question: 'Which broadband providers are available in Newcastle city centre and NE1?',
          answer: 'NE1 residents can check retailers using Openreach, Virgin Media where its network reaches the property, and building-specific full-fibre operators. BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW are useful starting points, but this is not an address guarantee. Enter the complete house or flat number because provider choice can differ between neighbouring Newcastle city-centre buildings.',
        },
        {
          question: 'What are the best broadband deals in Newcastle?',
          answer: 'There is no universal best Newcastle broadband deal because orderable networks, personalised speeds and promotions change by address. For NE1, start with full fibre or cable where its total contract cost is close to part fibre. Compare every monthly payment, setup fee, stated price rise, reward, upload speed, minimum speed guarantee and post-contract price before choosing.',
        },
        {
          question: 'Can I get full-fibre broadband in NE1?',
          answer: `Full fibre or another gigabit-capable connection is available at many NE1 properties, but not throughout the district. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled NE1 postcode units. Use the complete-address checker from Ofcom, Openreach and each suitable provider before treating a package as orderable.`,
        },
        {
          question: 'How fast is broadband in Newcastle city centre?',
          answer: `Ofcom-derived NE1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised download estimate, minimum guaranteed speed and upload speed for the complete property.`,
        },
        {
          question: 'Are broadband deals in North Tyneside the same as Newcastle deals?',
          answer: 'No. North Tyneside is a separate local-authority area and NE1 is Newcastle city centre. A provider or network serving North Tyneside does not prove that it serves a particular NE1 building, and Newcastle-wide figures can also hide district gaps. Use local coverage only to form a shortlist, then check the complete property address before comparing package costs.',
        },
        {
          question: 'How should renters compare broadband in an NE1 flat?',
          answer: 'Enter the flat number, ask which networks already enter the building and check whether new cabling needs permission from the landlord or managing agent. Match the minimum term to the tenancy and read the home-moving and early termination rules. A cheaper 24-month Newcastle deal may cost more overall if the tenancy ends after 12 months.',
        },
      ]
    : isBS1
    ? [
        {
          question: 'Which broadband providers are available in Bristol city centre and BS1?',
          answer: 'BS1 residents can check retailers using Openreach, Virgin Media where its network reaches the property, and building-specific full-fibre operators. BT, Sky, EE, TalkTalk, Plusnet, Vodafone, NOW and Zen are useful starting points, but this is not an address guarantee. Enter the complete house or flat number because provider choice can differ between neighbouring Bristol city-centre buildings.',
        },
        {
          question: 'What are the best broadband deals in Bristol?',
          answer: 'There is no universal best Bristol broadband deal because the networks, speed estimates and promotions available change by address. For BS1, start with an orderable full-fibre or cable option if its total contract cost is close to part fibre. Compare all monthly payments, setup fees, stated price rises, rewards, upload speed, minimum speed guarantee and post-contract price before choosing.',
        },
        {
          question: 'Can I get full-fibre broadband in BS1?',
          answer: `Full fibre or another gigabit-capable connection is available at many BS1 properties, but not throughout the district. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled BS1 postcode units. Use the complete-address checker from Ofcom, Openreach and each suitable provider before treating a package as ready to order.`,
        },
        {
          question: 'How fast is broadband in Bristol city centre?',
          answer: `Ofcom-derived BS1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised download estimate, minimum guaranteed speed and upload speed for the complete property.`,
        },
        {
          question: 'How should renters compare broadband deals in a BS1 flat?',
          answer: 'Enter the flat number, ask which networks already enter the building and check whether new cabling needs permission from the landlord or managing agent. Match the minimum term to the tenancy and read the home-moving and early termination rules. A cheaper 24-month Bristol deal may cost more overall if the tenancy ends after 12 months.',
        },
        {
          question: 'How do I switch broadband provider in Bristol?',
          answer: 'Choose an available package and contact the new provider. Ofcom says One Touch Switch lets most residential broadband customers ask the new provider to coordinate the move, including switches between different networks. The old provider should explain early termination charges and effects on bundled services. Confirm the activation date before cancelling anything outside the managed switch.',
        },
      ]
    : isRM1
    ? [
        {
          question: 'Which broadband providers are available in Romford and RM1?',
          answer: 'RM1 residents can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone, NOW and Virgin Media, plus alternative full-fibre providers that serve the complete property. This is a district shortlist, not an availability guarantee. Enter the house or flat number because Openreach, Virgin Media and independent networks do not reach identical Romford addresses.',
        },
        {
          question: 'What is the cheapest broadband deal in Romford?',
          answer: 'There is no single cheapest Romford broadband deal for every address. Compare packages that are actually orderable in RM1 by adding all monthly payments and setup fees across the minimum term, subtracting guaranteed rewards and including stated price changes. Then check the post-contract price. The lowest advertised opening payment can have a higher total cost.',
        },
        {
          question: 'Can I get full-fibre broadband in Romford RM1?',
          answer: `Full fibre is available at many RM1 properties, but not throughout the district. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled RM1 postcode units. This measures network reach, so use Ofcom, Openreach and provider address checkers before treating an FTTP package as orderable.`,
        },
        {
          question: 'How fast is broadband in Romford?',
          answer: `Ofcom-derived RM1 data records ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages are coverage categories, not measured household speeds. Compare each provider's personalised estimate, minimum guaranteed speed and upload speed for the complete address.`,
        },
        {
          question: 'Who is the best internet provider in Romford?',
          answer: 'Romford has no universal best internet provider because the available networks, prices and speed estimates change by property. We would start with an orderable full-fibre option where its total contract cost is close to part fibre, then compare customer service, minimum guaranteed speed, upload speed and contract terms. Keep a cheaper superfast option if it meets the household need.',
        },
        {
          question: 'How do I switch broadband provider in Romford?',
          answer: 'Choose an available package and contact the new provider. Ofcom says One Touch Switch lets most residential broadband customers ask the new provider to coordinate the change, including switches between different networks. Your old provider should explain early termination charges and other effects. Confirm the activation date before cancelling any service outside the managed switch.',
        },
      ]
    : isCT1
    ? [
        {
          question: 'Which broadband providers are available in Canterbury and CT1?',
          answer: 'CT1 residents can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW, plus any cable or alternative network serving the property. This is a Canterbury shortlist, not an address-level guarantee. Enter the complete postcode, house or flat number with each shortlisted provider because neighbouring properties can receive different networks and speed tiers.',
        },
        {
          question: 'What is the cheapest broadband deal in Canterbury?',
          answer: 'There is no single cheapest Canterbury broadband deal for every address. Compare packages that are actually orderable in CT1 by adding every monthly payment and setup fee across the minimum term, then subtracting guaranteed rewards. Include stated price rises and check the post-contract price. The lowest advertised monthly figure can have a higher total cost.',
        },
        {
          question: 'Can I get full-fibre broadband in Canterbury CT1?',
          answer: `Full fibre is available at many CT1 properties, but not throughout the district. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled CT1 postcode units. This is an area snapshot, so use Ofcom's checker and the provider's complete-address check before treating an FTTP package as orderable.`,
        },
        {
          question: 'How fast is broadband in Canterbury?',
          answer: `Ofcom-derived CT1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach rather than actual household speed. Compare the personalised speed estimate and minimum guaranteed speed supplied for the complete address.`,
        },
        {
          question: 'Is Virgin Media available in Canterbury?',
          answer: 'Virgin Media may be available at some Canterbury properties, but a city-wide result does not prove coverage at one CT1 address. Check the complete property on Virgin Media and compare the result with Openreach-based and any alternative full-fibre options. Different networks can reach opposite sides of the same street or different buildings in one development.',
        },
        {
          question: 'How do I switch broadband provider in Canterbury?',
          answer: 'Choose an available package and contact the new provider. Ofcom says One Touch Switch lets most residential broadband customers ask the new provider to coordinate the change, including switches between different networks. Your old provider should explain early termination charges and other effects. Confirm the activation date before cancelling any service outside the managed switch.',
        },
      ]
    : isRG1
    ? [
        {
          question: 'Which broadband providers are available in Reading and RG1?',
          answer: 'RG1 residents can check retailers using Openreach, CityFibre and Virgin Media, plus building-specific networks where present. BT, Sky, EE, TalkTalk, Plusnet, Vodafone, NOW and Zen are useful starting points, but the complete address decides what can be ordered. A provider serving Reading does not necessarily serve every RG1 street or flat.',
        },
        {
          question: 'What is the cheapest broadband deal in Reading?',
          answer: 'There is no universal cheapest Reading broadband deal because prices, promotions and network availability vary by address. Compare the total minimum-term cost of packages you can actually order, including setup fees, rewards and stated annual price rises. Then check the post-contract price. This gives a fairer answer than choosing the lowest advertised first-month payment.',
        },
        {
          question: 'Can I get full-fibre broadband in Reading RG1?',
          answer: `Full fibre is widely available in RG1, but an address check is still required. Ofcom-derived July 2024 records show ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled RG1 postcode units. CityFibre separately said its wider Reading network was ready for service to more than 97,000 homes in May 2025. The populations and dates differ, so the figures should not be combined.`,
        },
        {
          question: 'How fast is broadband in Reading town centre?',
          answer: `Ofcom-derived RG1 data records ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages describe network reach, not measured household speed. Use each provider's address-specific estimate and minimum guaranteed speed to compare packages for one property.`,
        },
        {
          question: 'Which full-fibre networks serve Reading?',
          answer: 'Reading has overlapping full-fibre infrastructure from CityFibre and Openreach, while Virgin Media serves properties on its own network and some buildings may have another specialist operator. Retailers can use the same wholesale network, so compare both the provider and the underlying connection. Check the full address because the networks do not reach exactly the same premises.',
        },
        {
          question: 'How should renters compare broadband in an RG1 flat?',
          answer: 'Enter the full flat number, ask which networks already enter the building and check whether installation needs landlord or managing-agent approval. Match the minimum term to the tenancy, then compare early termination and home-moving rules. A 24-month package with a low monthly price can cost more if the tenancy ends after 12 months.',
        },
      ]
    : isNG1
    ? [
        {
          question: 'Which broadband providers are available in Nottingham city centre and NG1?',
          answer: 'NG1 residents can check retailers using Openreach, including BT, Sky, EE, TalkTalk, Plusnet and Vodafone, plus Virgin Media and any building-specific network serving the property. A city-wide provider list is only a shortlist. Enter the complete address and flat number because network access can differ between neighbouring buildings and even between flats.',
        },
        {
          question: 'What is the cheapest broadband deal in Nottingham?',
          answer: 'There is no single cheapest broadband provider for every Nottingham address because availability and promotions change. For NG1, compare the total minimum-term cost of orderable packages, including monthly charges, setup fees, rewards and stated price rises. Check the post-contract price too. The lowest opening monthly payment is not necessarily the lowest overall cost.',
        },
        {
          question: 'Can I get full-fibre broadband in Nottingham NG1?',
          answer: `Full fibre is available at some NG1 properties, but not throughout the district. Ofcom-derived July 2024 data records ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled NG1 postcode units. Openreach separately reported about 70% full-fibre coverage across Nottingham in August 2025. Check the complete address because those datasets cover different areas and neither guarantees an orderable package.`,
        },
        {
          question: 'How fast is broadband in Nottingham city centre?',
          answer: `Ofcom-derived NG1 data records ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These are coverage categories, not measured household speeds. The provider's address check, personalised estimate and minimum guaranteed speed are more useful when choosing between packages for one property.`,
        },
        {
          question: 'Are Nottinghamshire broadband deals the same as NG1 deals?',
          answer: 'No. Nottinghamshire broadband deals cover a much larger county with urban and rural network conditions, while NG1 is a Nottingham city-centre district. County-wide or city-wide coverage cannot prove what one NG1 building can order. Use this page to form a shortlist, then check the complete property address with each suitable network before comparing contract cost.',
        },
        {
          question: 'What broadband contract should a Nottingham student choose?',
          answer: 'Match the minimum contract term to the tenancy and check early termination, home-moving and installation rules. A 24-month plan can be poor value for a one-year stay even if its monthly price is lower. In an NG1 flat, ask which networks already enter the building and whether the landlord must approve new cabling before ordering.',
        },
      ]
    : standardFaqItems

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
  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AdministrativeArea',
    name: `${postcodeArea.town} (${prefix})`,
    containedInPlace: { '@type': 'Country', name: 'United Kingdom' },
    url: `${SITE_URL}/postcode/${area.toLowerCase()}`,
  }
  const coverageDatasetJsonLd = districtCoverage
    ? {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: `${prefix} broadband coverage`,
        description: `Ofcom-derived coverage percentages for sampled ${prefix} postcode units.`,
        url: `${SITE_URL}/postcode/${area.toLowerCase()}`,
        creator: organizationRef,
        temporalCoverage: districtCoverageSourceDataDate,
        citation: districtCoverageSourcePage,
        variableMeasured: [
          { '@type': 'PropertyValue', name: 'Gigabit-capable availability', value: districtCoverage.gigabitPercent, unitText: 'PERCENT' },
          { '@type': 'PropertyValue', name: 'Superfast availability', value: districtCoverage.superfastPercent, unitText: 'PERCENT' },
          { '@type': 'PropertyValue', name: 'Ultrafast availability', value: districtCoverage.ultrafastPercent, unitText: 'PERCENT' },
        ],
      }
    : null

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={webPageWithCitationsJsonLd} />
      <JsonLd data={areaDealListJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={placeJsonLd} />
      {coverageDatasetJsonLd ? <JsonLd data={coverageDatasetJsonLd} /> : null}

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: `${prefix} broadband`, href: `/postcode/${area.toLowerCase()}` },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        {isHA1 ? 'Broadband Deals in Harrow and HA1' : isGU1 ? 'Broadband Deals in Guildford and GU1' : isBN1 ? 'Broadband Deals in Brighton and BN1' : isNE1 ? 'Broadband Deals in Newcastle and NE1' : isBS1 ? 'Broadband Deals in Bristol and BS1' : isM1 ? 'M1 Broadband Deals and Coverage in Manchester City Centre' : isNG1 ? 'Broadband Deals in Nottingham and NG1' : isRG1 ? 'Broadband Deals in Reading and RG1' : isCT1 ? 'Broadband Deals in Canterbury and CT1' : isRM1 ? 'Broadband Deals in Romford and RM1' : `Best Broadband Deals in ${postcodeArea.town} (${prefix})`}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
        <span>Area model reviewed {pageReviewedDateLabel}</span>
        <span>&middot;</span>
        <span>Prices verified {pricingVerifiedDateLabel}</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>

      <CiteableAnswer>
        {isHA1 ? (
          <>Broadband deals in Harrow&apos;s HA1 district include Openreach retailers, Virgin Media and independent full-fibre networks where they reach the property. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled HA1 postcode units. Check the complete address, including the house or flat number, before comparing total contract cost.</>
        ) : isGU1 ? (
          <>Broadband deals in Guildford&apos;s GU1 district include retailers using Openreach, Virgin Media and alternative full-fibre networks where they reach the property. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled GU1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isBN1 ? (
          <>Broadband deals in Brighton&apos;s BN1 district include retailers using Openreach, Virgin Media where its network reaches the property, CityFibre retailers in connected streets and selected building-specific networks. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled BN1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isNE1 ? (
          <>Broadband deals in Newcastle&apos;s NE1 district include retailers using Openreach, Virgin Media where its network reaches the property, and selected building-specific networks. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled NE1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isBS1 ? (
          <>Broadband deals in Bristol&apos;s BS1 district include retailers using Openreach, Virgin Media where its network reaches the property, and selected building-specific networks. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled BS1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isRM1 ? (
          <>Broadband deals in Romford&apos;s RM1 district include retailers using Openreach, Virgin Media where its network reaches the property, and selected independent full-fibre options. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled RM1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isM1 ? (
          <>M1 broadband includes Openreach-based services, Virgin Media and building-specific full-fibre options, but no provider is available in every Manchester city-centre property. Ofcom-derived district data shows <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> coverage across {districtCoverage?.sampleSize} sampled M1 postcode units. Compare plans here, then check your complete address before ordering.</>
        ) : isNG1 ? (
          <>Broadband deals in Nottingham&apos;s NG1 district include services using Openreach, Virgin Media and selected alternative full-fibre networks. Ofcom-derived postcode data records <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled NG1 postcode units. There is no universal cheapest or fastest choice for every building, so compare the total contract cost and check the complete address before ordering.</>
        ) : isRG1 ? (
          <>Broadband deals in Reading&apos;s RG1 district include retailers using Openreach and CityFibre, Virgin Media where its network reaches the property, and selected building-specific options. Ofcom-derived records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled RG1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isCT1 ? (
          <>Broadband deals in Canterbury&apos;s CT1 district include providers using Openreach and other networks where they reach the property. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled CT1 postcode units. Compare total contract cost and household speed needs, then check the complete address before ordering.</>
        ) : <>
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
        </>}
      </CiteableAnswer>

      {districtCoverage && (
        <div className="mb-8 rounded-xl border border-sky-200 bg-sky-50 p-5" aria-label={`${prefix} broadband coverage summary`}>
          <p className="font-semibold text-sky-950">{prefix} coverage at a glance</p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-sky-900">
            Ofcom&apos;s postcode-level fixed coverage data shows that {districtCoverage.gigabitPercent}% of premises sampled across {prefix} are gigabit-capable and {districtCoverage.superfastPercent}% can receive at least 30 Mbps. The figures cover {districtCoverage.sampleSize.toLocaleString('en-GB')} postcodes and describe network reach, not a guaranteed speed at every home.
          </p>
        </div>
      )}

      {isM1 && <M1BroadbandPlanComparison />}
      {isNG1 && <NG1BroadbandComparison />}
      {isRG1 && <RG1BroadbandComparison />}
      {isCT1 && <CT1BroadbandComparison />}
      {isRM1 && <RM1BroadbandComparison />}

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
      <DealsClient allDeals={areaDeals} />

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
                placement="postcode_provider_card"
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
            {isM1 && (
              <p className="mt-4 leading-7 text-slate-700">
                To find cheap broadband deals in Manchester M1, compare only packages confirmed for the complete address. Rank them by total minimum-term cost, then check the speed estimate, setup work and post-contract price. A low city-wide headline price is not useful if the network has not connected your building.
              </p>
            )}
            {isBN1 && (
              <p className="mt-4 leading-7 text-slate-700">
                For cheap broadband deals in Brighton, compare only packages confirmed for the complete BN1 address. Rank them by total minimum-term cost, including setup fees, guaranteed rewards and stated price changes, then check upload speed and the post-contract price. A Brighton-wide advertised offer may use a network that has not reached your building.
              </p>
            )}
            {isNG1 && (
              <p className="mt-4 leading-7 text-slate-700">
                For the cheapest broadband in Nottingham, rank packages available at your exact NG1 address by total minimum-term cost. Include setup fees, rewards, scheduled price changes and the post-contract price. A city-wide advertised deal may use a network that has not reached your building, so availability comes before the headline discount.
              </p>
            )}
            {isRG1 && (
              <p className="mt-4 leading-7 text-slate-700">
                For the cheapest broadband in Reading, compare only packages confirmed for the complete RG1 address. Rank them by total minimum-term cost, including setup fees, rewards and stated price changes, then check the post-contract price. Strong network competition does not make one advertised deal the cheapest at every property.
              </p>
            )}
            {isRM1 && (
              <p className="mt-4 leading-7 text-slate-700">
                For cheap broadband deals in Romford, compare only packages confirmed for the complete RM1 address. Rank them by total minimum-term cost, including setup fees, rewards and stated price changes, then compare speed and customer service. A Romford-wide advertised price may use a network that has not reached your property.
              </p>
            )}
            {isNE1 && (
              <p className="mt-4 leading-7 text-slate-700">
                For cheap broadband deals in Newcastle, compare only packages confirmed for the complete NE1 address. Rank them by total minimum-term cost, including setup fees, rewards and stated price changes, then check the post-contract price. A Newcastle-wide headline deal is not useful if its network does not enter your building.
              </p>
            )}
            {isGU1 && (
              <p className="mt-4 leading-7 text-slate-700">
                For cheap broadband deals in Guildford, compare only packages confirmed for the complete GU1 address. Rank them by total minimum-term cost, including setup fees, rewards and stated price changes, then check the guaranteed and upload speeds. A Guildford-wide advertised price or network launch does not prove that the service reaches your property.
              </p>
            )}
            <ol className="mt-5 space-y-4 text-slate-700">
              <li><strong>1. Check the exact address.</strong> {prefix}-wide figures are useful for planning, but the provider&apos;s checker decides which package can be ordered at your property.</li>
              <li><strong>2. Pick a realistic speed.</strong> Around 30 to 70 Mbps can suit light use. A busy household may benefit from 100 to 300 Mbps. Gigabit service is most useful for many simultaneous users, large downloads or frequent cloud backups.</li>
              <li><strong>3. Compare the full contract.</strong> Include setup charges, rewards, mid-contract increases, minimum term and the out-of-contract price.</li>
              <li><strong>4. Look beyond download speed.</strong> Home workers and creators should compare upload speed. Gamers should also consider latency and use Ethernet where practical.</li>
              <li><strong>5. Confirm switching details.</strong> Ofcom&apos;s One Touch Switch process lets most residential customers contact only the new provider, which then coordinates the move and supplies key timing and cost information.</li>
            </ol>
            <p className="mt-4 text-sm italic leading-6 text-slate-600">{localIntel.speedGuidanceNote}</p>
          </section>

          {isM1 && (
            <section className="mt-10 max-w-4xl" aria-labelledby="m1-wifi-building-checks">
              <h2 id="m1-wifi-building-checks" className="text-2xl font-bold text-slate-900">
                M1 Wi-Fi broadband and apartment-building checks
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                An M1 WiFi broadband search usually mixes up two separate questions. The broadband package describes the fixed connection delivered to the property. Wi-Fi is the radio link from the router to your devices, so thick walls, metalwork, neighbouring networks and router placement can reduce performance inside a city-centre flat even when the incoming line is fast. Ask where the router and fibre termination point will be installed, especially in a long or multi-level property.
              </p>
              <p className="mt-4 leading-7 text-slate-700">
                Before choosing an M1 internet plan, check the complete flat number and address with at least two providers on genuinely available networks. Compare the minimum guaranteed speed, upload speed, setup work, contract term and total minimum-term cost. If the provider supplies a hub near the entrance but your desk is several rooms away, budget for Ethernet or an appropriate mesh system rather than buying a faster line solely to fix a Wi-Fi coverage problem.
              </p>
            </section>
          )}

          {isBN1 && (
            <section className="mt-10 max-w-4xl" aria-labelledby="bn1-students-flats">
              <h2 id="bn1-students-flats" className="text-2xl font-bold text-slate-900">
                Broadband for BN1 flats, students and home workers
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                BN1 includes central Brighton, Preston, Withdean, Patcham, Hollingbury, Coldean, Falmer and Stanmer. Converted houses, student properties and blocks of flats can receive different network results from neighbouring buildings. Enter the complete flat number and ask which networks already enter the property before booking an installation.
              </p>
              <p className="mt-4 leading-7 text-slate-700">
                Students and renters should match the contract end date to the tenancy and compare early termination and home-moving terms. Home workers should check upload speed, the minimum guaranteed download speed and fault support. A faster package will not fix weak Wi-Fi through thick walls, so assess router position, Ethernet and mesh equipment separately. See our <Link href="/guides/best-broadband-for-students" className="font-semibold text-sky-700 hover:underline">student broadband guide</Link> for shorter-contract trade-offs.
              </p>
            </section>
          )}

          {isNG1 && (
            <section className="mt-10 max-w-4xl" aria-labelledby="ng1-students-flats">
              <h2 id="ng1-students-flats" className="text-2xl font-bold text-slate-900">
                Broadband for NG1 flats, renters and students
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                NG1 includes the Lace Market, Hockley and dense city-centre housing where broadband can differ between flats in the same development. Enter the full flat number when checking. Ask the landlord or building manager which networks already enter the building, where the fibre termination point can be fitted and whether installation work needs permission. An existing socket does not prove that a specific package is active or transferable.
              </p>
              <p className="mt-4 leading-7 text-slate-700">
                Students and short-term renters should compare the contract end date with the tenancy end date. A lower monthly price on a 24-month deal can cost more if an early termination charge applies. Check whether the provider offers a shorter contract, permits a home move, or has a monthly option. Our <Link href="/guides/best-broadband-for-students" className="font-semibold text-sky-700 hover:underline">student broadband guide</Link> explains the trade-offs without assuming one contract length suits every household.
              </p>
            </section>
          )}

          {isRG1 && (
            <section className="mt-10 max-w-4xl" aria-labelledby="rg1-flats-home-working">
              <h2 id="rg1-flats-home-working" className="text-2xl font-bold text-slate-900">
                Broadband for RG1 flats, renters and home workers
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                RG1 includes town-centre flats, converted buildings and newer developments around Reading station. Check the full flat number rather than the outward postcode alone. Ask the landlord or managing agent which networks already enter the building and whether a new fibre cable needs permission. Two neighbouring buildings can have different options even where area coverage is high.
              </p>
              <p className="mt-4 leading-7 text-slate-700">
                Home workers should compare the provider&apos;s minimum guaranteed download speed, stated upload speed and fault support. Renters should also match the contract end date to the tenancy and check home-moving or early termination terms. A faster package will not fix weak Wi-Fi in a distant room, so consider router placement, Ethernet or a suitable mesh system separately.
              </p>
            </section>
          )}

          {isRM1 && (
            <section className="mt-10 max-w-4xl" aria-labelledby="rm1-flats-home-working">
              <h2 id="rm1-flats-home-working" className="text-2xl font-bold text-slate-900">
                Broadband for RM1 flats, renters and home workers
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                RM1 includes town-centre flats, converted properties and homes around Romford station. Enter the full flat or house number rather than relying on the outward postcode. Openreach says neighbouring addresses can receive different results because engineering, access routes and landlord permissions affect its build. Ask which networks already enter the building before booking installation.
              </p>
              <p className="mt-4 leading-7 text-slate-700">
                Home workers should compare the minimum guaranteed download speed, stated upload speed and fault support. Renters should match the contract end date to the tenancy and check home-moving or early termination rules. A faster internet deal will not fix weak Wi-Fi in a distant room, so assess router placement, Ethernet and any mesh equipment separately.
              </p>
            </section>
          )}

          {isNE1 && (
            <section className="mt-10 max-w-4xl" aria-labelledby="ne1-flats-students">
              <h2 id="ne1-flats-students" className="text-2xl font-bold text-slate-900">
                Broadband for NE1 flats, renters and students
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                NE1 includes the city centre, Quayside, Grainger Town and dense apartment buildings where one network may serve only part of a development. Enter the complete flat number, ask the landlord or managing agent which networks already enter the building, and confirm whether a new fibre cable needs permission. An existing wall socket does not prove that a particular package can be activated.
              </p>
              <p className="mt-4 leading-7 text-slate-700">
                Students and renters should match the contract end date to the tenancy. Compare early termination and home-moving terms as well as the monthly payment. A lower price on a 24-month deal can cost more if the tenancy ends after 12 months. See our <Link href="/guides/best-broadband-for-students" className="font-semibold text-sky-700 hover:underline">student broadband guide</Link> for shorter-contract trade-offs.
              </p>
            </section>
          )}

          {isGU1 && (
            <section className="mt-10 max-w-4xl" aria-labelledby="gu1-flats-home-working">
              <h2 id="gu1-flats-home-working" className="text-2xl font-bold text-slate-900">
                Broadband for GU1 flats, renters and home workers
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                GU1 includes town-centre flats, converted properties and homes across Stoke, Slyfield, Merrow and Burpham. Enter the complete flat or house number and ask which networks already enter the building. A postcode-level fibre result may still require landlord or managing-agent permission before new cabling can be installed.
              </p>
              <p className="mt-4 leading-7 text-slate-700">
                Home workers should compare minimum guaranteed download speed, upload speed and fault support. Renters should match the contract end date to the tenancy and check home-moving or early termination terms. Multi-gigabit broadband also needs suitable Ethernet, router and device hardware, so do not buy an 8 Gbps line solely to fix weak Wi-Fi in a distant room.
              </p>
            </section>
          )}

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
            {isGU1 && (
              <p className="mt-4 leading-7 text-slate-700">
                Read our <Link href="/providers/ee" className="font-semibold text-sky-700 hover:underline">EE broadband review</Link> for the provider&apos;s wider package range and evidence, but use EE&apos;s own checker for the final GU1 eligibility result.
              </p>
            )}
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
    </main>
  )
}
