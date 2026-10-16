import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getPostcodeArea,
  getAllPostcodePrefixes,
  postcodeDatasetUpdatedDate,
  postcodeSourceNotes,
} from '@/data/postcodes'
import { providers, getTopDeals, entryPackage, providerDatasetUpdatedDate } from '@/data/providers'
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
import NewsletterSignup from '@/components/NewsletterSignup'
import AffiliateCTA from '@/components/AffiliateCTA'
import RatingStars from '@/components/RatingStars'
import DartfordBroadbandNeeds from '@/components/DartfordBroadbandNeeds'
import M1BroadbandPlanComparison from '@/components/M1BroadbandPlanComparison'
import NG1BroadbandComparison from '@/components/NG1BroadbandComparison'
import RG1BroadbandComparison from '@/components/RG1BroadbandComparison'
import CT1BroadbandComparison from '@/components/CT1BroadbandComparison'
import RM1BroadbandComparison from '@/components/RM1BroadbandComparison'
import CR0BroadbandComparison from '@/components/CR0BroadbandComparison'
import N1BroadbandComparison from '@/components/N1BroadbandComparison'
import { getPostcodeLocalIntel } from '@/data/postcodeLocalIntel'
import { buildDealListJsonLd } from '@/lib/dealSchema'
import PageHeroBanner from '@/components/PageHeroBanner'
import { DEFAULT_GUIDE_CTAS, hubHero } from '@/lib/pageHero'

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
  if (prefix === 'CR0') {
    const coverage = getDistrictCoverage(prefix)
    const description = coverage
      ? `Compare broadband deals in Croydon and CR0. See ${coverage.gigabitPercent}% gigabit and ${coverage.superfastPercent}% superfast coverage from Ofcom-derived data, then check your address.`
      : 'Compare broadband deals in Croydon and CR0 by price, speed, contract cost and exact-address availability.'
    return {
      title: { absolute: 'Broadband Deals in Croydon and CR0 | Compare Providers' },
      description,
      alternates: { canonical },
      openGraph: { title: 'Broadband Deals in Croydon and CR0 | BroadbandPicker', description, url: canonical },
    }
  }
  if (prefix === 'N1') {
    const coverage = getDistrictCoverage(prefix)
    const description = coverage
      ? `Compare broadband deals in Islington and N1. See ${coverage.gigabitPercent}% gigabit and ${coverage.superfastPercent}% superfast coverage from Ofcom-derived data, then check your address.`
      : 'Compare broadband deals in Islington and N1 by price, speed, contract cost and exact-address availability.'
    return {
      title: { absolute: 'Broadband Deals in Islington and N1 | Compare Providers' },
      description,
      alternates: { canonical },
      openGraph: { title: 'Broadband Deals in Islington and N1 | BroadbandPicker', description, url: canonical },
    }
  }
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

  if (prefix === 'SW1') {
    const description = 'Compare broadband deals in Westminster and SW1, covering Belgravia, Pimlico, Victoria and Whitehall, using Ofcom sub-district coverage for SW1A to SW1Y, named physical networks and affordable-broadband options.'
    return {
      title: { absolute: 'Broadband Deals in Westminster and SW1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Westminster and SW1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'EN1') {
    const description = "Compare broadband deals in Enfield and EN1 using Ofcom-derived district coverage, Openreach's confirmed flat and apartment full-fibre upgrade, named physical networks and exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Enfield and EN1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Enfield and EN1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'LE1') {
    const description = "Compare broadband deals in Leicester and LE1 using Ofcom-derived district coverage, toob's confirmed launch on CityFibre's network, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Leicester and LE1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Leicester and LE1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'SG1') {
    const description = "Compare broadband deals in Stevenage and SG1 using Ofcom-derived district coverage and a genuine, dated drop in Openreach full-fibre availability, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Stevenage and SG1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Stevenage and SG1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'CF10') {
    const description = "Compare broadband deals in Cardiff and CF10 using Ofcom-derived district coverage, Cardiff's hypercity network and Ffeibr's Transport for Wales fibre extension, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Cardiff and CF10 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Cardiff and CF10 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'LS1') {
    const description = "Compare broadband deals in Leeds city centre and LS1 using Ofcom-derived district coverage, named local full-fibre networks and a real LS1-vs-LS2 comparison, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Leeds City Centre and LS1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Leeds City Centre and LS1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'OX1') {
    const description = "Compare broadband deals in Oxford and OX1 using Ofcom-derived district coverage, Openreach's confirmed full-fibre rollout and low-uptake finding, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Oxford and OX1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Oxford and OX1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'BS3') {
    const description = "Compare broadband deals in Bedminster and BS3 using Ofcom-derived district coverage, CityFibre's partial coverage via Vodafone and TalkTalk, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Bedminster and BS3 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Bedminster and BS3 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'G1') {
    const description = "Compare broadband deals in Glasgow and G1 using Ofcom-derived district coverage, CityFibre's citywide investment and named physical networks, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Glasgow and G1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Glasgow and G1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'L8') {
    const description = "Compare broadband deals in Toxteth and L8 using Ofcom-derived district coverage, named local full-fibre networks including Giant's LCR Connect, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Toxteth and L8 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Toxteth and L8 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'CV1') {
    const description = "Compare broadband deals in Coventry and CV1 using Ofcom-derived district coverage, Openreach's confirmed full-fibre eligibility figures, named physical networks and exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Coventry and CV1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Coventry and CV1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'B1') {
    const description = "Compare broadband deals in Birmingham and B1 using Ofcom-derived district coverage, named physical networks including Hyperoptic's city-centre apartment presence, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Birmingham and B1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Birmingham and B1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'LS2') {
    const description = "Compare broadband deals in Leeds and LS2 using Ofcom-derived district coverage, named local full-fibre networks including CCS Leeds and Stream Networks, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Leeds and LS2 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Leeds and LS2 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'L1') {
    const description = "Compare broadband deals in Liverpool and L1 using Ofcom-derived district coverage, Netomnia/YouFibre's confirmed rollout and named physical networks, plus exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Liverpool and L1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Liverpool and L1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'LU1') {
    const description = "Compare broadband deals in Luton and LU1 using Ofcom-derived district coverage, CityFibre's confirmed rollout and Openreach's low-uptake findings, named physical networks and exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Luton and LU1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Luton and LU1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'SO14') {
    const description = "Compare broadband deals in Southampton and SO14 using Ofcom-derived district coverage, toob's own full-fibre network and Openreach's confirmed city upgrade, named physical networks and exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Southampton and SO14 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Southampton and SO14 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'W5') {
    const description = "Compare broadband deals in Ealing and W5 using Ofcom-derived district coverage, Vodafone's confirmed full-fibre expansion on Community Fibre's network, named physical networks and exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Ealing and W5 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Ealing and W5 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'NW1') {
    const description = "Compare broadband deals in Camden and NW1 using Ofcom-derived district coverage, G.Network's 2026 administration and restructuring, named physical networks and exact-address checks."
    return {
      title: { absolute: 'Broadband Deals in Camden and NW1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Camden and NW1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'UB1') {
    const description = 'Compare broadband deals in Southall and UB1 using Ofcom-derived district coverage, Virgin Media\'s confirmed gigabit rollout, named physical networks and exact-address checks.'
    return {
      title: { absolute: 'Broadband Deals in Southall and UB1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Southall and UB1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'E1') {
    const description = 'Compare broadband deals in Whitechapel and E1, covering Spitalfields, Aldgate, Stepney and Wapping, using Ofcom-derived district coverage, named physical networks including EE and exact-address checks.'
    return {
      title: { absolute: 'Broadband Deals in Whitechapel and E1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Whitechapel and E1 | BroadbandPicker',
        description,
        url: canonical,
      },
    }
  }
  if (prefix === 'SE1') {
    const description = 'Compare broadband deals in Southwark and SE1, covering Borough, Bankside, London Bridge and Bermondsey, using Ofcom-derived district coverage, named physical networks and exact-address checks for SE1 6RN and nearby streets.'
    return {
      title: { absolute: 'Broadband Deals in Southwark and SE1 | Compare Options' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Southwark and SE1 | BroadbandPicker',
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
  if (prefix === 'CR0') {
    const coverage = getDistrictCoverage(prefix)
    const description = coverage
      ? `Compare broadband deals in Croydon and CR0. See ${coverage.gigabitPercent}% gigabit and ${coverage.superfastPercent}% superfast coverage from Ofcom-derived data, then check your address.`
      : 'Compare broadband deals in Croydon and CR0 by price, speed, contract cost and exact-address availability.'
    return {
      title: { absolute: 'Broadband Deals in Croydon and CR0 | Compare Providers' },
      description,
      alternates: { canonical },
      openGraph: {
        title: 'Broadband Deals in Croydon and CR0 | BroadbandPicker',
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
  const pageReviewedDateLabel = ['CR0', 'N1'].includes(area.toUpperCase())
    ? '13 October 2026'
    : ['CF10', 'SG1', 'LE1'].includes(area.toUpperCase())
    ? '5 September 2026'
    : ['HA1', 'SE1', 'SW1', 'E1', 'UB1', 'EN1', 'NW1', 'W5', 'SO14', 'LU1', 'L1', 'LS2', 'B1', 'CV1', 'L8', 'G1', 'BS3', 'OX1', 'LS1'].includes(area.toUpperCase())
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
      packageName: d.packageName,
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
  const isCR0 = prefix === 'CR0'
  const isN1 = prefix === 'N1'
  const isBS1 = prefix === 'BS1'
  const isNE1 = prefix === 'NE1'
  const isGU1 = prefix === 'GU1'
  const isHA1 = prefix === 'HA1'
  const isSE1 = prefix === 'SE1'
  const isE1 = prefix === 'E1'
  const isUB1 = prefix === 'UB1'
  const isEN1 = prefix === 'EN1'
  const isNW1 = prefix === 'NW1'
  const isW5 = prefix === 'W5'
  const isSO14 = prefix === 'SO14'
  const isLU1 = prefix === 'LU1'
  const isL1 = prefix === 'L1'
  const isLS2 = prefix === 'LS2'
  const isB1 = prefix === 'B1'
  const isCV1 = prefix === 'CV1'
  const isL8 = prefix === 'L8'
  const isG1 = prefix === 'G1'
  const isBS3 = prefix === 'BS3'
  const isOX1 = prefix === 'OX1'
  const isLS1 = prefix === 'LS1'
  const isCF10 = prefix === 'CF10'
  const isSG1 = prefix === 'SG1'
  const isLE1 = prefix === 'LE1'
  const isSW1 = prefix === 'SW1'
  // SW1 has no single Ofcom district figure -- it is genuinely eight separate
  // outward codes (SW1A/E/H/P/V/W/X/Y). Aggregated here (sample-size weighted)
  // from data/postcode-district-coverage.json rather than relying on the
  // generic single-district districtCoverage lookup, which returns undefined
  // for the bare "SW1" the site models for pricing/provider purposes.
  const sw1SubDistricts = [
    { code: 'SW1A', sampleSize: 65, gigabitPercent: 36.4 },
    { code: 'SW1E', sampleSize: 46, gigabitPercent: 72.9 },
    { code: 'SW1H', sampleSize: 48, gigabitPercent: 92.0 },
    { code: 'SW1P', sampleSize: 387, gigabitPercent: 84.4 },
    { code: 'SW1V', sampleSize: 504, gigabitPercent: 86.0 },
    { code: 'SW1W', sampleSize: 272, gigabitPercent: 76.3 },
    { code: 'SW1X', sampleSize: 317, gigabitPercent: 82.1 },
    { code: 'SW1Y', sampleSize: 71, gigabitPercent: 89.5 },
  ]
  const sw1TotalSample = sw1SubDistricts.reduce((sum, d) => sum + d.sampleSize, 0)
  const sw1WeightedGigabitPercent = Math.round(
    (sw1SubDistricts.reduce((sum, d) => sum + d.gigabitPercent * d.sampleSize, 0) / sw1TotalSample) * 10
  ) / 10
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
    ...entryPackage(p),
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
  const faqItems = isLE1
    ? [
        {
          question: 'Which broadband providers are available in Leicester and LE1?',
          answer: 'LE1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. This is a district shortlist, not an availability promise. toob confirmed on 15 October 2024 that it had launched services to tens of thousands of homes in Leicester using CityFibre\'s network, though toob is not currently in BroadbandPicker\'s LE1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'Which broadband provider is best in Leicester?',
          answer: `There is no single best provider for every LE1 address; compare the total minimum-term cost and confirmed speed of packages available at your property rather than a generic ranking. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is toob available in Leicester?',
          answer: 'Yes, in parts of the city. toob confirmed on 15 October 2024 that it had launched full-fibre services to tens of thousands of homes in Leicester, alongside Luton and Cambridge, using CityFibre\'s network. toob is not currently in BroadbandPicker\'s LE1 provider comparison, so check its own coverage tool directly for a specific address.',
        },
        {
          question: 'How fast is broadband in Leicester and LE1?',
          answer: `Ofcom-derived LE1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units, based on July 2024 data. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Leicester-wide broadband statistics the same as LE1 figures?',
          answer: 'They can differ. One competitor site cites Ofcom\'s Connected Nations 2025 report with different average speed bands by category to BroadbandPicker\'s own July 2024 aggregation used on this page. Different editions of the same regulator dataset can show different figures for the same area. Use the complete address check with your chosen provider rather than relying on any single reported average.',
        },
        {
          question: 'How should I choose the best broadband deal in Leicester?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking toob\'s own coverage tool separately since it is not in our comparison table, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isSG1
    ? [
        {
          question: 'Which broadband providers are available in Stevenage and SG1?',
          answer: 'SG1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. This is a district shortlist, not an availability promise. Given the reported pause in some Openreach full-fibre installations locally, always confirm the current live status for the complete address before ordering.',
        },
        {
          question: 'What is the cheapest broadband deal in Stevenage?',
          answer: `There is no single cheapest SG1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Why has full fibre availability seemingly disappeared in parts of Stevenage?',
          answer: 'This is a genuine, reported issue rather than a display error. Independent industry monitoring found that Openreach\'s full-fibre coverage across the Stevenage council area dropped from 62.66% to 52.61% by 6 February 2026, a fall of just over 10 percentage points, after Openreach paused installations in areas with difficult ducting. Stevenage was identified as a particularly affected town partly because large parts of it were built in the 1960s and 1970s with direct-buried copper lead-ins to individual homes, rather than the ducting modern fibre installation typically needs. If a full-fibre option you expected is not currently orderable at your address, this is the likely reason, and coverage may be restored once Openreach resolves the access issue.',
        },
        {
          question: 'How fast is broadband in Stevenage and SG1?',
          answer: `Ofcom-derived SG1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled postcode units, based on July 2024 records taken before the reported Openreach installation pause. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Stevenage-wide broadband statistics the same as SG1 figures?',
          answer: 'They can differ. One independent guide, dated May 2026 and sourced from ThinkBroadband Labs, reports town-wide Stevenage figures of 94.68% gigabit-capable and 62.27% full fibre (FTTP) across 40,981 premises, a different date and dataset to BroadbandPicker\'s July 2024 SG1-specific Ofcom figures. Use the figures on this page for the SG1 district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Stevenage?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. Given the reported local pause in some full-fibre installations, confirm the order is genuinely live before cancelling any existing service, and keep a reliable lower-speed option available if full fibre is not currently orderable at the address.',
        },
      ]
    : isCF10
    ? [
        {
          question: 'Which broadband providers are available in Cardiff and CF10?',
          answer: 'CF10 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. This is a district shortlist, not an availability promise. Ogi, a named Welsh full-fibre altnet, is also reported active in parts of Cardiff, and separate business-focused full-fibre infrastructure (Cardiff\'s hypercity network and Ffeibr\'s Transport for Wales fibre extension) serves the city centre, though none of these is currently in BroadbandPicker\'s CF10 residential provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Cardiff?',
          answer: `There is no single cheapest CF10 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'What is Cardiff\'s hypercity network?',
          answer: 'Cardiff\'s "hypercity network" is a full-fibre system built through a collaboration between Cardiff Council, the Welsh Government and infrastructure provider Elevate, confirmed on 16 January 2026, offering gigabit and up to 10 Gbps dedicated speeds to businesses across large parts of the city centre. Separately, Welsh operator Ffeibr confirmed on 2 April 2026 that it was extending fibre along the Core Valley Lines, developed with Transport for Wales, into Cardiff city centre and down to Cardiff Bay. Both are primarily business-focused infrastructure rather than residential broadband, and neither is currently in BroadbandPicker\'s CF10 comparison.',
        },
        {
          question: 'How fast is broadband in Cardiff and CF10?',
          answer: `Ofcom-derived CF10 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Wales-wide broadband statistics the same as CF10 figures?',
          answer: 'No. A Wales-wide figure reported as of June 2026 states more than half of those in Wales who can get Openreach full fibre have upgraded, a different geography and metric to a CF10 coverage percentage. Use this page\'s CF10-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Cardiff?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking Ogi\'s own coverage tool separately since it is not in our comparison table, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isLS1
    ? [
        {
          question: 'Which broadband providers are available in Leeds city centre and LS1?',
          answer: 'LS1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. This is a district shortlist, not an availability promise. Giant, a named ISP, states that LS1 has CityFibre coverage alongside Openreach full fibre, both offering symmetric speeds up to 1 Gbps in inner Leeds postcodes, though CityFibre is not currently in BroadbandPicker\'s LS1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Leeds city centre?',
          answer: `There is no single cheapest deal near Leeds city centre that suits every LS1 address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is LS1 the same as LS2 for broadband coverage?',
          answer: 'No, and the difference is genuinely significant. Ofcom-derived records show LS1 at 63.2% gigabit-capable and 66.7% superfast, meaningfully lower than neighbouring LS2 at 79.3% gigabit-capable and 87.8% superfast. Both are real Leeds city-centre districts, but they should not be treated as interchangeable when comparing coverage or choosing a provider. Always check the complete address in the correct postcode district.',
        },
        {
          question: 'How fast is broadband in Leeds city centre and LS1?',
          answer: `Ofcom-derived LS1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units, a smaller sample size and lower coverage than several neighbouring Leeds postcode districts. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Leeds-wide broadband statistics the same as LS1 figures?',
          answer: 'No. City-wide Leeds figures, including CityFibre\'s Gigafast agreement with Vodafone confirmed back in August 2020 across multiple UK cities, describe a much larger area and an older milestone than the LS1 postcode district\'s current Ofcom figures. Use this page\'s LS1-specific data for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Leeds city centre?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking CityFibre-based options via a retailer or Giant\'s own coverage tool separately since neither is in our comparison table, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isOX1
    ? [
        {
          question: 'Which broadband providers are available in Oxford and OX1?',
          answer: 'OX1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone, NOW and Zen Internet over Openreach, plus Virgin Media on its own cable network. This is a district shortlist, not an availability promise. YouFibre, Gigaclear and Hyperoptic are also reported active in parts of Oxford through their own separate networks, though none is currently in BroadbandPicker\'s OX1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Oxford?',
          answer: `There is no single cheapest OX1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is full fibre available across Oxford, and should I switch?',
          answer: 'Yes, though many eligible homes have not switched yet. Openreach confirmed on 14 October 2025 that its full-fibre network had reached more than 23,000 Oxford homes, backed by a £6.9 million investment, yet fewer than 15% of eligible properties had actually upgraded, since an upgrade is not automatic and a resident must place an order. Check whether full fibre is orderable at your specific address before assuming you already have it.',
        },
        {
          question: 'How fast is broadband in Oxford and OX1?',
          answer: `Ofcom-derived OX1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household, and coverage in Oxford is reported to be less comprehensive than some comparable UK cities. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Oxford-wide broadband statistics the same as OX1 figures?',
          answer: 'No. City-wide figures, such as Openreach\'s 23,000-home full-fibre count or a reported roughly 50% full-fibre availability across all of Oxford, describe a much larger area than the OX1 postcode district and can come from a different date or methodology. Use this page\'s OX1-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Oxford?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking YouFibre\'s, Gigaclear\'s or Hyperoptic\'s own coverage tools separately since none is in our comparison table, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isBS3
    ? [
        {
          question: 'Which broadband providers are available in Bedminster and BS3?',
          answer: 'Yes please, start with BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. CityFibre also has partial coverage in parts of Bedminster, sold through Vodafone, TalkTalk, Zen Internet and other retailers, though CityFibre itself is not currently in BroadbandPicker\'s BS3 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Bedminster?',
          answer: `There is no single cheapest BS3 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is BS31 the same as BS3?',
          answer: 'No. BS31 (which covers Keynsham, including addresses like BS31 3ET) is a separate, genuinely different postcode district from BS3 (Bedminster), even though the codes look similar. BroadbandPicker\'s own Ofcom-derived data for BS31 (90.8% gigabit-capable across 640 sampled units) is different from BS3\'s figures below. If you are checking an address in Keynsham, use the BS31 postcode district rather than this Bedminster page.',
        },
        {
          question: 'How fast is broadband in Bedminster and BS3?',
          answer: `Ofcom-derived BS3 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Bristol-wide broadband statistics the same as BS3 figures?',
          answer: 'No. One independent guide reports Bristol South constituency-level figures around 88% full fibre and 98% gigabit coverage, a different geography and likely different methodology to Ofcom\'s BS3 postcode-district data. Use this page\'s BS3-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Bedminster?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking whether CityFibre reaches the specific street given its partial Bedminster coverage, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isG1
    ? [
        {
          question: 'Which broadband providers are available in Glasgow and G1?',
          answer: 'G1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. This is a district shortlist, not an availability promise. CityFibre is also building a separate full-fibre network across Glasgow, though it is not currently in BroadbandPicker\'s G1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Glasgow?',
          answer: `There is no single cheapest G1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is CityFibre available across all of Glasgow?',
          answer: 'Not everywhere. CityFibre has committed around £270 million to its Glasgow rollout, but an independent report dated 21 May 2025 found that private, unadopted roads in some Glasgow-area streets have delayed connections, since these roads require separate legal access agreements that can be difficult and costly to negotiate. This friction was reported in specific outer streets rather than G1 city centre itself, but it shows that a citywide investment figure does not guarantee every street, including in G1, is connected on the original timeline. Check the complete address before assuming any network is orderable.',
        },
        {
          question: 'How fast is broadband in Glasgow and G1?',
          answer: `Ofcom-derived G1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Glasgow-wide broadband statistics the same as G1 figures?',
          answer: 'No. City-wide investment figures, such as CityFibre\'s reported £270 million Glasgow rollout, describe a much larger area and a different kind of commitment than a coverage percentage for one postcode district. Use this page\'s G1-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Glasgow?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking CityFibre\'s own coverage tool separately given the reported rollout delays in some areas, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isL8
    ? [
        {
          question: 'Which broadband providers are available in Toxteth and L8?',
          answer: 'L8 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach. Virgin Media is not listed as available in this district. Giant, a Liverpool-founded ISP, separately states that its LCR Connect symmetric network is largely ready to light on L8 sub-exchanges, alongside CityFibre, Hyperoptic and other named local altnets reported active in parts of Liverpool, though none of these are currently in BroadbandPicker\'s L8 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Toxteth?',
          answer: `There is no single cheapest L8 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Does Toxteth\'s older housing affect broadband speed?',
          answer: 'It can. One independent guide, updated 28 April 2026, specifically flags that L8 Toxteth and parts of neighbouring Dingle have older Victorian housing stock with variable internal wiring, and recommends checking before assuming gigabit-class speeds are achievable throughout a property, even where the street itself is gigabit-capable. This is a genuinely useful, address-level caution rather than a reason to rule out full fibre altogether.',
        },
        {
          question: 'How fast is broadband in Toxteth and L8?',
          answer: `Ofcom-derived L8 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household, and internal wiring in older properties can still limit the speed actually achieved. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Liverpool-wide broadband statistics the same as L8 figures?',
          answer: 'No. Wider Liverpool-wide figures describe a much larger area than the L8 postcode district, covering newer city-centre developments as well as older housing stock like much of Toxteth, and can come from a different date or methodology. Use this page\'s L8-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Toxteth?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking Giant\'s or another named local altnet\'s own coverage tool separately since none is in our comparison table, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isCV1
    ? [
        {
          question: 'Which broadband providers are available in Coventry and CV1?',
          answer: 'CV1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. Yes, these internet providers form a district shortlist, not an availability promise. toob, a full-fibre altnet partnered with CityFibre, has also recently arrived in the West Midlands with some Coventry areas taking orders and others still in build, though it is not currently in BroadbandPicker\'s CV1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Coventry?',
          answer: `There is no single cheapest CV1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is full fibre available across Coventry?',
          answer: 'Yes, in large part. Openreach confirmed on 7 March 2025 that more than 125,000 homes and businesses across Coventry were eligible for full fibre, covering around 80% of properties city-wide, with an explicit reminder from its Midlands Regional Director that upgrades do not happen automatically and a resident must place an order. Ofcom-derived July 2024 records separately show a lower, district-specific figure for CV1 itself. Check the complete address before treating any package as orderable.',
        },
        {
          question: 'How fast is broadband in Coventry and CV1?',
          answer: `Ofcom-derived CV1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Coventry-wide broadband statistics the same as CV1 figures?',
          answer: 'No. City-wide figures, such as a comparison site\'s reported 97% full-fibre and 82% Virgin Media availability across all of Coventry, describe a much larger area than the CV1 postcode district and can use a different methodology to Ofcom\'s district-level data. Use this page\'s CV1-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Coventry?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking toob\'s own coverage tool separately since it is not in our comparison table, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isB1
    ? [
        {
          question: 'Which broadband providers are available in Birmingham and B1?',
          answer: 'B1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone, NOW and Zen Internet over Openreach, plus Virgin Media on its own cable network. This is a district shortlist, not an availability promise. Hyperoptic also has a significant presence in apartment buildings around New Street and other city-centre developments in B1, though it is not currently in BroadbandPicker\'s B1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Birmingham?',
          answer: `There is no single cheapest B1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is CityFibre available in Birmingham city centre?',
          answer: 'Not directly in most of B1. CityFibre\'s Birmingham footprint is concentrated in specific outer zones around Gravelly Hill, Erdington (B23), Acocks Green (B27) and Tyseley (B25), where Vodafone Pro II, Sky, TalkTalk, Zen Internet and other named retailers sell over its network at up to 2.2 Gbps. Birmingham city centre itself is served mainly by Openreach full fibre, Virgin Media and Hyperoptic in specific apartment buildings, not primarily CityFibre. Check the complete address before assuming any one network reaches your specific B1 property.',
        },
        {
          question: 'How fast is broadband in Birmingham and B1?',
          answer: `Ofcom-derived B1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Birmingham-wide broadband statistics the same as B1 figures?',
          answer: 'No. City-wide figures, such as a reported 86% of Birmingham premises able to order full fibre as of September 2025, describe a much larger area than the B1 postcode district and can come from a different date or methodology. Use this page\'s B1-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Birmingham?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking Hyperoptic\'s own building-level coverage separately if the property is a city-centre apartment, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isLS2
    ? [
        {
          question: 'Which broadband providers are available in Leeds and LS2?',
          answer: 'LS2 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. This is a district shortlist, not an availability promise. Two named local full-fibre altnets, CCS Leeds and Stream Networks, also operate their own separate networks in parts of Leeds, including LS2 by CCS Leeds\' own coverage list, though neither is currently in BroadbandPicker\'s LS2 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Leeds?',
          answer: `There is no single cheap broadband deal that fits every address near you in Leeds; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Are there local full-fibre networks specific to Leeds?',
          answer: 'Yes. CCS Leeds states it has built its own full-fibre network reaching LS1, LS2, LS7, LS9, LS10, LS11, LS12, LS14 and LS15, with services launching across the city from April, though it does not give a specific year for that launch. Stream Networks separately states its gigabit-capable network extends to more than 700 postcodes across Leeds and surrounding areas. Neither network gives a dated coverage percentage, and neither is currently in BroadbandPicker\'s LS2 provider comparison, so check availability directly with each before assuming coverage.',
        },
        {
          question: 'How fast is broadband in Leeds and LS2?',
          answer: `Ofcom-derived LS2 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Leeds-wide broadband statistics the same as LS2 figures?',
          answer: 'No. City-wide figures, such as an undated claim of 87% FTTP rollout reported by one comparison site, describe a much larger area than the LS2 postcode district and can come from a different date or methodology. Use this page\'s LS2-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Leeds?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking CCS Leeds\' and Stream Networks\' own coverage tools separately since neither is in our comparison table, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isL1
    ? [
        {
          question: 'Which broadband providers are available in Liverpool and L1?',
          answer: 'L1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. These internet providers form a district shortlist, not an availability promise. Netomnia, trading as YouFibre, also operates a separate full-fibre network across parts of Liverpool, though it is not currently in BroadbandPicker\'s L1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Liverpool?',
          answer: `There is no single cheapest L1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is full fibre expanding in Liverpool?',
          answer: 'Yes. Netomnia confirmed on 11 February 2025 that its YouFibre network had passed 110,000 Liverpool premises, with an additional 80,000 planned to bring the total to 190,000 by 2026, alongside ongoing work in Sefton Park, Stoneycroft and Aintree. This is a city-wide figure covering specific neighbourhoods, not confirmation for every L1 address, and YouFibre availability changes street by street rather than area by area. Check the complete address before treating any package as orderable.',
        },
        {
          question: 'How fast is broadband in Liverpool and L1?',
          answer: `Ofcom-derived L1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Liverpool-wide broadband statistics the same as L1 figures?',
          answer: 'No. Wider Liverpool-wide figures, such as a comparison site\'s reported 76% full-fibre access across the whole city, describe a much larger area than the L1 postcode district and can come from a different date or methodology. Use this page\'s L1-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Liverpool?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, checking YouFibre\'s own postcode lookup separately since its coverage varies street by street, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isLU1
    ? [
        {
          question: 'Which broadband providers are available in Luton and LU1?',
          answer: 'LU1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own cable network. These internet providers form a district shortlist, not an availability promise. CityFibre also operates a separate full-fibre network across Luton, sold through Vodafone, TalkTalk and smaller retailers including IDNet, Cuckoo and Zen, some of which are not currently in BroadbandPicker\'s LU1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Luton?',
          answer: `There is no single cheapest LU1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is full fibre available in Luton, and should I switch?',
          answer: 'Yes, but many eligible homes have not switched yet. CityFibre confirmed on 29 May 2024 that more than 35,000 Luton premises were ready for service on its full-fibre network, offering speeds up to 2.5 Gbps. Openreach separately reported on 14 April 2025 that 60,000 Luton homes and businesses could upgrade to full fibre, yet fewer than one in five had actually done so, since an upgrade is not automatic and a resident must place an order with a provider. Check whether full fibre is available and orderable at your specific address before assuming you already have it.',
        },
        {
          question: 'How fast is broadband in Luton and LU1?',
          answer: `Ofcom-derived LU1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Luton-wide broadband statistics the same as LU1 figures?',
          answer: 'No. Borough-wide figures, such as ThinkBroadband\'s dataset covering all 90,702 Luton premises, describe a much larger area than the LU1 postcode district and can come from a different date or methodology. Use this page\'s LU1-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Luton?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, including CityFibre-based options sold through Vodafone or TalkTalk where they reach the property, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isSO14
    ? [
        {
          question: 'Which broadband providers are available in Southampton and SO14?',
          answer: 'SO14 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media and toob on their own separate full-fibre networks. These internet providers form a district shortlist, not an availability promise. toob, a Southampton-founded broadband company, built the city as the first stop on its own full-fibre network and now serves over 125,000 customers UK-wide. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Southampton?',
          answer: `There is no single cheapest SO14 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is full fibre expanding in Southampton?',
          answer: 'Yes. Openreach confirmed on 3 November 2025 that more than 10,000 Southampton properties could already access full fibre broadband over its network, with thousands more due to be upgraded as engineering work continues across the city, though it did not give a precise figure for that next phase. toob, a separate full-fibre operator, chose Southampton as the first city for its own self-built network and now serves over 125,000 customers UK-wide. Check the complete address before treating any package as orderable.',
        },
        {
          question: 'How fast is broadband in Southampton and SO14?',
          answer: `Ofcom-derived SO14 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Southampton-wide broadband statistics the same as SO14 figures?',
          answer: 'No. Broader Southampton-wide figures, such as Openreach\'s 10,000-property full-fibre count and toob\'s national customer total, describe a much larger area or customer base than the SO14 postcode district and can come from a different date or methodology. Use this page\'s SO14-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Southampton?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, including toob\'s own network or Openreach-based options where they reach the property, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isW5
    ? [
        {
          question: 'Which broadband providers are available in Ealing and W5?',
          answer: 'W5 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media and Community Fibre on their own separate networks. This is a district shortlist, not an availability promise. Hey!Broadband, a separate full-fibre operator, is also reported active in parts of Ealing but is not currently in BroadbandPicker\'s W5 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Ealing?',
          answer: `There is no single cheapest W5 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is full fibre expanding in Ealing?',
          answer: 'Yes, borough-wide. Vodafone confirmed on 2 September 2025 that it could now provide full fibre broadband, running on Community Fibre\'s network, to 37,000 homes across the London Borough of Ealing, with speeds of up to 2.2 Gbps advertised. This is a borough-wide figure, not W5-specific, and Community Fibre is already one of the networks BroadbandPicker compares in W5. Check the complete address before treating any package as orderable.',
        },
        {
          question: 'How fast is broadband in Ealing and W5?',
          answer: `Ofcom-derived W5 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Ealing-wide broadband statistics the same as W5 figures?',
          answer: 'No. Broader London Borough of Ealing statistics, such as Vodafone\'s 37,000-home full-fibre figure and average download speed increases reported across the whole borough, describe a much larger area than the W5 postcode district and can come from a different date or methodology. Use this page\'s W5-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Ealing?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, including Vodafone\'s Community Fibre-based service where it reaches the property, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isNW1
    ? [
        {
          question: 'Which broadband providers are available in Camden and NW1?',
          answer: 'NW1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media, Hyperoptic and Community Fibre on their own separate full-fibre networks. This is a district shortlist, not an availability promise. G.Network also has infrastructure across parts of central London including Camden, but it is not currently in BroadbandPicker\'s NW1 provider comparison following its 2026 administration and restructuring (see below). Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Camden?',
          answer: `There is no single cheapest NW1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is G.Network still a reliable broadband option in Camden and NW1?',
          answer: 'G.Network, a full-fibre altnet with infrastructure passing over 420,000 premises across central London, was put into administration in January 2026 after its then-owner, distressed-asset specialist FitzWalter Capital, ran into financial difficulty. Around 106 staff, close to half the workforce, were made redundant during the process. G.Network exited administration debt-free on 25 March 2026 following a restructuring, with co-founder David Sangster returning as chief executive. BroadbandPicker does not currently include G.Network in its NW1 provider comparison; check directly with G.Network for current coverage and contract terms at your address before signing up.',
        },
        {
          question: 'How fast is broadband in Camden and NW1?',
          answer: `Ofcom-derived NW1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Camden-wide broadband statistics the same as NW1 figures?',
          answer: 'No. Broader London Borough of Camden statistics, reported around 95% ultrafast coverage as of 2025, describe a much larger area than the NW1 postcode district and can come from a different date or methodology. Use this page\'s NW1-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Camden?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan from an established network where it is genuinely orderable, and would treat any G.Network offer with the same address-level and contract-term checks given its recent administration.',
        },
      ]
    : isEN1
    ? [
        {
          question: 'Which broadband providers are available in Enfield and EN1?',
          answer: 'EN1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own network. This is a district shortlist, not an availability promise. Community Fibre and Hyperoptic are also reported active in parts of the wider Enfield area through their own separate networks, though not yet in BroadbandPicker\'s EN1 provider comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Enfield?',
          answer: `There is no single cheapest EN1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is full fibre coming to Enfield flats and apartments?',
          answer: 'Yes. Openreach announced on 24 March 2026 that it had agreed to upgrade more than 1,500 flats and apartments across over 50 buildings in Enfield to full fibre initially, with thousands more planned. Openreach was clear that the upgrade is not automatic: once available, a resident still has to contact a broadband provider and place an order to get connected.',
        },
        {
          question: 'How fast is broadband in Enfield and EN1?',
          answer: `Ofcom-derived EN1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Are Enfield-wide broadband statistics the same as EN1 figures?',
          answer: 'No. Broader London Borough of Enfield statistics, which some sites quote around 94% ultrafast coverage, describe a much larger area than the EN1 postcode district and can come from a different date or methodology. Use this page\'s EN1-specific Ofcom figures for the district itself, then check the complete address before treating any package as orderable.',
        },
        {
          question: 'How should I choose the best broadband deal in Enfield?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre plan where it is genuinely orderable, especially in flats and apartments covered by Openreach\'s 2026 upgrade, while keeping a lower-speed option if it meets the household need at materially lower cost.',
        },
      ]
    : isUB1
    ? [
        {
          question: 'Which broadband providers are available in Southall and UB1?',
          answer: 'UB1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, plus Virgin Media on its own network. This is a district shortlist, not an availability promise. A separate wholesale full-fibre network from FW Networks also serves parts of Southall through smaller retail providers not currently in BroadbandPicker\'s comparison. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in Southall?',
          answer: `There is no single cheapest UB1 deal for every address; compare the total minimum-term cost of packages confirmed for your property rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Is gigabit broadband available in Southall?',
          answer: `Yes, in large part. Virgin Media confirmed in February 2023 that more than 20,000 additional Southall homes had connected to its gigabit network, offering speeds it described as several times the local average. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records separately shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled UB1 postcode units. Check the complete address before treating any package as orderable.`,
        },
        {
          question: 'How fast is broadband in Southall and UB1?',
          answer: `Ofcom-derived UB1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'Does Virgin Media cover all of Southall?',
          answer: 'No. Virgin Media\'s February 2023 announcement covered more than 20,000 additional Southall homes, a large expansion but not every property in UB1. A city-wide or town-wide rollout announcement does not confirm coverage at one specific address. Check the complete house or flat number on Virgin Media\'s own checker before treating the service as available.',
        },
        {
          question: 'How should I choose the best broadband deal in Southall?',
          answer: 'Start with packages confirmed for the complete address, then compare total minimum-term cost rather than the opening monthly price alone. Include setup charges, scheduled price changes and the post-contract price. We would favour an affordable full-fibre or gigabit-cable plan where it is genuinely orderable, keeping a lower-speed option if it meets the household need at a materially lower total cost.',
        },
      ]
    : isE1
    ? [
        {
          question: 'Which broadband providers are available in Whitechapel and E1?',
          answer: 'E1 households can check BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW over Openreach, Virgin Media on its own network, and Hyperoptic or Community Fibre where their separate full-fibre networks reach the building. This is a district shortlist, not an availability promise. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'Is EE broadband available in Whitechapel?',
          answer: 'Yes, please check the complete address first: EE sells broadband over the Openreach network, which reaches most of E1, so EE is a realistic option across Whitechapel, Spitalfields and Aldgate in principle. Availability, personalised speed estimate and whether full fibre or part-fibre serves that specific property still depend on the exact house or flat number, not the E1 district as a whole.',
        },
        {
          question: 'Can I get full-fibre broadband in E1?',
          answer: `Full fibre or another gigabit-capable service is available at many E1 properties, but not throughout the district. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled E1 postcode units. Hyperoptic's own coverage pages list Whitechapel among the Tower Hamlets areas its full-fibre network reaches. Check the complete address before treating any package as orderable.`,
        },
        {
          question: 'How fast is broadband in Whitechapel and E1?',
          answer: `Ofcom-derived E1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled postcode units, lower than several other central London districts. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate for the complete address.`,
        },
        {
          question: 'What broadband is available at an E1 flat or converted building?',
          answer: 'E1 has a large share of converted Victorian buildings and newer blocks around Whitechapel and Aldgate, where one network can reach some flats in a building and not others. Ask which networks already enter the building, whether new cabling needs landlord permission, and compare the personalised speed estimate for the specific flat rather than assuming a neighbour\'s result applies to you.',
        },
        {
          question: 'Which part of London is E1?',
          answer: 'E1 is a central-east London postcode district covering Whitechapel, Spitalfields, Aldgate, Stepney and part of Wapping. It sits within the London Borough of Tower Hamlets, though the postcode district and the local-authority boundary are not identical, so a Tower Hamlets-wide statistic and an E1 statistic can differ.',
        },
      ]
    : isSW1
    ? [
        {
          question: 'Which broadband and internet providers are available in Westminster and SW1?',
          answer: 'SW1 households can check BT, Sky, EE, TalkTalk, Vodafone, NOW, Zen Internet and Virgin Media over Openreach and Virgin Media’s own network, plus Hyperoptic or Community Fibre where their separate full-fibre networks reach the building. This is a district shortlist, not an availability promise. Enter the complete house or flat number with each suitable network before comparing orderable packages.',
        },
        {
          question: 'What is the cheapest broadband deal in SW1?',
          answer: `SW1 is one of the few districts where BroadbandPicker already ranks first for the exact 'cheap broadband SW1' search, so compare the total minimum-term cost of packages confirmed for your address rather than the first advertised price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}, before any setup fee or scheduled price rise.`,
        },
        {
          question: 'Can I get full-fibre broadband in SW1?',
          answer: `Full fibre availability varies sharply within SW1 itself. BroadbandPicker's aggregation of Ofcom July 2024 records across the district's eight real outward codes (SW1A, SW1E, SW1H, SW1P, SW1V, SW1W, SW1X and SW1Y, 1,710 sampled units) shows a ${sw1WeightedGigabitPercent}% weighted average gigabit-capable rate, ranging from 36.4% in SW1A to 92% in SW1H. Hyperoptic also lists Belgravia and Pimlico among its Westminster full-fibre areas. Check the complete address before treating any package as orderable.`,
        },
        {
          question: 'How fast is broadband across SW1’s different districts?',
          answer: `SW1 is not one uniform coverage area. Ofcom-derived records show gigabit-capable availability from 36.4% in SW1A (Whitehall and St James's Park) up to 92% in SW1H (Victoria and Westminster), with SW1P, SW1V, SW1W, SW1X and SW1Y in between. These percentages measure network reach, not the speed received by one household, so compare each provider's personalised estimate for the complete address.`,
        },
        {
          question: 'Are there cheaper broadband tariffs in Westminster?',
          answer: 'Yes. Westminster City Council signposts government-backed social tariffs, cheaper broadband and phone packages for residents claiming Universal Credit, Pension Credit or certain other benefits, sometimes marketed as ‘essential’ or ‘basic’ broadband. Eligibility and providers vary, so check the council’s current guidance and our UK broadband social tariffs guide before comparing standard SW1 promotions.',
        },
        {
          question: 'Which part of London is SW1?',
          answer: 'SW1 is a central London postcode district south-west of Westminster Abbey, covering Belgravia, Pimlico, Victoria, St James’s and the Whitehall and Westminster government area. It sits within the City of Westminster, though the postcode district and the local-authority boundary are not identical, and SW1 itself splits into eight separate outward codes (SW1A to SW1Y) with different broadband coverage.',
        },
      ]
    : isSE1
    ? [
        {
          question: 'Which broadband providers are available in Southwark and SE1?',
          answer: 'SE1 households can check BT, Sky, EE, TalkTalk, Vodafone and NOW over Openreach, Virgin Media on its own network, and Hyperoptic or Community Fibre where their separate networks reach the building. This is a district shortlist, not an availability promise. Enter the complete house or flat number with each suitable network before comparing orderable packages across Borough, Bankside, London Bridge or Bermondsey.',
        },
        {
          question: 'What is the cheapest broadband deal in Southwark under £30 or £25 a month?',
          answer: `Whether a package under £30 or under £25 a month is available depends on the address, not just the advertised SE1-wide price. Compare the total minimum-term cost of packages actually orderable at your property, including any setup fee and stated price rise, then check the post-contract price. The cheapest option here currently starts from £${postcodeArea.cheapestMonthly.toFixed(2)}/month${cheapestProvider ? ` with ${cheapestProvider.name}` : ''}.`,
        },
        {
          question: 'Can I get full-fibre broadband in SE1?',
          answer: `Full fibre or another gigabit-capable service is available at many SE1 properties, but not throughout the district. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled SE1 postcode units. Hyperoptic lists Elephant and Castle as a covered SE1 area on its own network pages. Check the complete address with Ofcom, Openreach, Virgin Media and suitable independent networks before treating any package as orderable.`,
        },
        {
          question: 'How fast is broadband in Southwark and SE1?',
          answer: `Ofcom-derived SE1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled postcode units. These percentages measure network reach, not the speed received by one household. Compare each provider's personalised estimate and minimum guaranteed download speed for the complete address.`,
        },
        {
          question: 'What broadband is available at SE1 6RN?',
          answer: 'SE1 6RN, on Falmouth Road near Elephant and Castle, is a complete postcode within the wider SE1 district, but district coverage cannot confirm service for one building. Use the house or flat number in each network checker, then compare the personalised speed estimate, minimum guaranteed speed, upload speed and total contract cost. A nearby full-fibre connection does not prove that the same network serves your property.',
        },
        {
          question: 'What area of London is SE1?',
          answer: 'SE1 is a central London postcode district south of the river, covering Waterloo, South Bank, Bankside, Borough, London Bridge, Bermondsey and Elephant and Castle. It sits within the London Borough of Southwark, though the postcode district and the borough boundary are not identical, so a Southwark-wide statistic and an SE1 statistic can differ.',
        },
      ]
    : isHA1
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
    : isN1
    ? [
        {
          question: 'Which broadband providers are available in Islington and N1?',
          answer: 'N1 residents can compare retailers using Openreach, including BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW, plus Virgin Media, Hyperoptic and Community Fibre where their separate networks reach the building. Islington Council also names G.Network in its council-homes programme, although it is not currently in BroadbandPicker\'s N1 comparison. Enter the complete flat or house number before ordering.',
        },
        {
          question: 'Can I get full-fibre broadband in Islington N1?',
          answer: `Many N1 properties can get full fibre or another gigabit-capable connection, but coverage is not universal. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled N1 postcode units. Use the complete address with Ofcom and each suitable provider before treating a package as available.`,
        },
        {
          question: 'How fast is broadband in N1?',
          answer: `Ofcom-derived N1 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled postcode units. These are coverage categories, not measured speeds for every household. Compare each provider's personalised estimate, minimum guaranteed speed and upload speed.`,
        },
        {
          question: 'What are the best broadband deals in Islington?',
          answer: 'There is no single best Islington deal because available networks, speed estimates and prices vary by property. Remove packages that cannot serve the complete address, then compare total minimum-term cost, stated price changes, setup fees, rewards, upload speed, minimum guaranteed speed and the post-contract price.',
        },
        {
          question: 'Are Islington-wide broadband figures the same as N1 coverage?',
          answer: 'No. The London Borough of Islington includes several postcode districts, while N1 also crosses into neighbouring borough areas. Borough programmes and N1 postcode statistics cover different properties and must not be treated as interchangeable. Use N1 data for district context and a complete-address check for the final decision.',
        },
        {
          question: 'How should renters and flat residents compare broadband in N1?',
          answer: 'Enter the flat number, ask which networks already enter the building and check whether the landlord or managing agent must approve new cabling. Match the minimum term to the tenancy and read home-moving and early termination rules. A cheaper 24-month deal may cost more overall if you move after one year.',
        },
      ]
    : isCR0
    ? [
        {
          question: 'Which broadband providers are available in Croydon and CR0?',
          answer: 'CR0 residents can compare retailers using Openreach, including BT, Sky, EE, TalkTalk, Plusnet, Vodafone and NOW, alongside Virgin Media and Community Fibre where their separate networks reach the property. This is a district shortlist, not an availability guarantee. Enter the complete address because neighbouring Croydon homes can have different options.',
        },
        {
          question: 'What are the best broadband deals in Croydon?',
          answer: 'There is no single best Croydon broadband deal for every home. First remove packages that are not available at the complete address. Then compare total minimum-term cost, personalised speed estimate, minimum guaranteed speed, upload speed, setup fees, rewards, stated price rises and the price after the contract ends.',
        },
        {
          question: 'Can I get full-fibre broadband in Croydon CR0?',
          answer: `Many CR0 properties can get full fibre or another gigabit-capable service, but coverage is not universal. BroadbandPicker's aggregation of Ofcom July 2024 residential postcode records shows ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled CR0 postcode units. Check the complete address with Ofcom and each suitable network before ordering.`,
        },
        {
          question: 'How fast is broadband in Croydon?',
          answer: `Ofcom-derived CR0 records show ${districtCoverage?.superfastPercent}% superfast, ${districtCoverage?.ultrafastPercent}% ultrafast and ${districtCoverage?.gigabitPercent}% gigabit-capable availability across ${districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled postcode units. These percentages describe network reach, not the speed received by one household. Use each provider's personalised estimate and minimum guaranteed speed for the complete property.`,
        },
        {
          question: 'Who is the best internet provider in Croydon?',
          answer: 'Croydon has no universal best provider because network availability, prices and speed estimates vary by property. For a busy household, start with orderable full-fibre or cable packages and compare total cost, upload speed, service terms and Wi-Fi needs. A lower-cost superfast package may be better value for lighter use.',
        },
        {
          question: 'How do I switch broadband provider in Croydon?',
          answer: 'Choose an available package and contact the new provider. Ofcom says One Touch Switch lets most residential broadband customers ask the new provider to coordinate the change, including many switches between different networks. Check early termination charges, bundled services and the confirmed activation date before cancelling anything outside the managed switch.',
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

  const heading = isN1 ? 'Broadband Deals in Islington and N1' : isLE1 ? 'Broadband Deals in Leicester and LE1' : isSG1 ? 'Broadband Deals in Stevenage and SG1' : isCF10 ? 'Broadband Deals in Cardiff and CF10' : isLS1 ? 'Broadband Deals in Leeds City Centre and LS1' : isOX1 ? 'Broadband Deals in Oxford and OX1' : isBS3 ? 'Broadband Deals in Bedminster and BS3' : isG1 ? 'Broadband Deals in Glasgow and G1' : isL8 ? 'Broadband Deals in Toxteth and L8' : isCV1 ? 'Broadband Deals in Coventry and CV1' : isB1 ? 'Broadband Deals in Birmingham and B1' : isLS2 ? 'Broadband Deals in Leeds and LS2' : isL1 ? 'Broadband Deals in Liverpool and L1' : isLU1 ? 'Broadband Deals in Luton and LU1' : isSO14 ? 'Broadband Deals in Southampton and SO14' : isW5 ? 'Broadband Deals in Ealing and W5' : isNW1 ? 'Broadband Deals in Camden and NW1' : isEN1 ? 'Broadband Deals in Enfield and EN1' : isUB1 ? 'Broadband Deals in Southall and UB1' : isE1 ? 'Broadband Deals in Whitechapel and E1' : isSW1 ? 'Broadband Deals in Westminster and SW1' : isSE1 ? 'Broadband Deals in Southwark and SE1' : isHA1 ? 'Broadband Deals in Harrow and HA1' : isGU1 ? 'Broadband Deals in Guildford and GU1' : isBN1 ? 'Broadband Deals in Brighton and BN1' : isNE1 ? 'Broadband Deals in Newcastle and NE1' : isBS1 ? 'Broadband Deals in Bristol and BS1' : isCR0 ? 'Broadband Deals in Croydon and CR0' : isM1 ? 'M1 Broadband Deals and Coverage in Manchester City Centre' : isNG1 ? 'Broadband Deals in Nottingham and NG1' : isRG1 ? 'Broadband Deals in Reading and RG1' : isCT1 ? 'Broadband Deals in Canterbury and CT1' : isRM1 ? 'Broadband Deals in Romford and RM1' : `Best Broadband Deals in ${postcodeArea.town} (${prefix})`
  const hero = hubHero()

  return (
    <main>
      <JsonLd data={webPageWithCitationsJsonLd} />
      <JsonLd data={areaDealListJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={placeJsonLd} />
      {coverageDatasetJsonLd ? <JsonLd data={coverageDatasetJsonLd} /> : null}
      <PageHeroBanner
        title={heading}
        kicker={`${prefix} broadband`}
        lede={`Compare broadband deals, coverage and providers in ${postcodeArea.town}. Check the complete address before you order.`}
        image={hero.image}
        imageAlt={hero.imageAlt}
        accent={hero.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: `${prefix} broadband`, href: `/postcode/${area.toLowerCase()}` },
        ]}
      />

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
        <span>Area model reviewed {pageReviewedDateLabel}</span>
        <span>&middot;</span>
        <span>Prices verified {pricingVerifiedDateLabel}</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>

      <CiteableAnswer>
        {isN1 ? (
          <>Broadband deals in Islington&apos;s N1 district include retailers using Openreach, plus Virgin Media, Hyperoptic and Community Fibre where their separate networks reach the building. BroadbandPicker&apos;s aggregation of Ofcom July 2024 residential postcode records shows <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled N1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isCR0 ? (
          <>Broadband deals in Croydon&apos;s CR0 district include retailers using Openreach, Virgin Media and Community Fibre where their separate networks reach the property. BroadbandPicker&apos;s aggregation of Ofcom July 2024 residential postcode records shows <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled CR0 postcode units. Compare the full contract cost, then check the complete address before ordering.</>
        ) : isLE1 ? (
          <>Broadband deals in Leicester&apos;s LE1 district include retailers using Openreach, plus Virgin Media on its own network. toob confirmed on 15 October 2024 that it had launched full-fibre services to tens of thousands of homes in Leicester using CityFibre&apos;s network, though it is not currently in BroadbandPicker&apos;s comparison. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled LE1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isSG1 ? (
          <>Broadband deals in Stevenage&apos;s SG1 district include retailers using Openreach, plus Virgin Media on its own network. Independent monitoring found Openreach&apos;s full-fibre coverage across the Stevenage council area dropped from 62.66% to 52.61% by 6 February 2026 after installations were paused in areas with difficult ducting, common locally due to 1960s and 1970s direct-buried copper. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled SG1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isCF10 ? (
          <>Broadband deals in Cardiff&apos;s CF10 district include retailers using Openreach, plus Virgin Media on its own network. Cardiff Council, the Welsh Government and Elevate confirmed on 16 January 2026 a business-focused &quot;hypercity network&quot; offering gigabit and up to 10 Gbps speeds across large parts of the city centre, and Ffeibr confirmed on 2 April 2026 that it was extending Transport for Wales fibre into Cardiff city centre and Cardiff Bay; neither is in BroadbandPicker&apos;s residential comparison. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled CF10 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isLS1 ? (
          <>Broadband deals in Leeds city centre&apos;s LS1 district include retailers using Openreach, plus Virgin Media on its own network. Giant, a named ISP, states LS1 has CityFibre coverage alongside Openreach full fibre, both offering symmetric speeds up to 1 Gbps, though CityFibre is not currently in BroadbandPicker&apos;s comparison. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled LS1 postcode units, meaningfully lower than neighbouring LS2. Compare total contract cost, then check the complete address before ordering.</>
        ) : isOX1 ? (
          <>Broadband deals in Oxford&apos;s OX1 district include retailers using Openreach and Zen Internet, plus Virgin Media on its own network. Openreach confirmed on 14 October 2025 that its full-fibre network had reached more than 23,000 Oxford homes via a £6.9 million investment, yet fewer than 15% of eligible properties had actually upgraded. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled OX1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isBS3 ? (
          <>Broadband deals in Bedminster&apos;s BS3 district include retailers using Openreach, plus Virgin Media on its own network. CityFibre has partial coverage in parts of Bedminster, sold through Vodafone, TalkTalk and Zen Internet, though CityFibre itself is not currently in BroadbandPicker&apos;s comparison; BS31 (Keynsham) is a separate, genuinely different postcode district from BS3. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled BS3 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isG1 ? (
          <>Broadband deals in Glasgow&apos;s G1 district include retailers using Openreach, plus Virgin Media on its own network. CityFibre has committed around £270 million to a citywide Glasgow rollout, though an independent report dated 21 May 2025 found private, unadopted roads in some Glasgow-area streets have delayed connections, and CityFibre is not currently in BroadbandPicker&apos;s comparison. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled G1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isL8 ? (
          <>Broadband deals in Toxteth&apos;s L8 district include retailers using Openreach; Virgin Media is not listed as available here. Giant, a Liverpool-founded ISP, states its LCR Connect symmetric network is largely ready to light on L8 sub-exchanges, though it is not currently in BroadbandPicker&apos;s comparison, and one independent guide flags that L8&apos;s older Victorian housing stock can limit achievable speed even where the street is gigabit-capable. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled L8 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isCV1 ? (
          <>Broadband deals in Coventry&apos;s CV1 district include retailers using Openreach, plus Virgin Media on its own network. Openreach confirmed on 7 March 2025 that more than 125,000 homes and businesses across Coventry were eligible for full fibre, covering around 80% of properties city-wide, though upgrades are not automatic and still require an order. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled CV1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isB1 ? (
          <>Broadband deals in Birmingham&apos;s B1 district include retailers using Openreach and Zen Internet, plus Virgin Media on its own network. CityFibre&apos;s Birmingham footprint is concentrated in outer zones such as Gravelly Hill, Erdington and Acocks Green rather than the city centre; Hyperoptic instead has a notable presence in B1 apartment buildings around New Street, though it is not currently in BroadbandPicker&apos;s comparison. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled B1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isLS2 ? (
          <>Broadband deals in Leeds&apos; LS2 district include retailers using Openreach, plus Virgin Media on its own network. Two named local full-fibre altnets, CCS Leeds and Stream Networks, also build their own separate networks in parts of Leeds, with CCS Leeds listing LS2 among its served postcodes, though neither gives a dated coverage percentage and neither is currently in BroadbandPicker&apos;s comparison. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled LS2 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isL1 ? (
          <>Broadband deals in Liverpool&apos;s L1 district include retailers using Openreach, plus Virgin Media on its own network. Netomnia, trading as YouFibre, confirmed on 11 February 2025 that its full-fibre network had passed 110,000 Liverpool premises, with plans to reach 190,000 by 2026, though coverage varies street by street rather than across the whole district. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled L1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isLU1 ? (
          <>Broadband deals in Luton&apos;s LU1 district include retailers using Openreach, plus Virgin Media and CityFibre on their own separate networks. CityFibre confirmed on 29 May 2024 that more than 35,000 Luton premises were ready for service on its full-fibre network at up to 2.5 Gbps; Openreach separately reported on 14 April 2025 that 60,000 Luton properties could upgrade to full fibre, yet fewer than one in five had actually switched. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled LU1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isSO14 ? (
          <>Broadband deals in Southampton&apos;s SO14 district include retailers using Openreach, plus Virgin Media and toob on their own separate full-fibre networks. Openreach confirmed on 3 November 2025 that more than 10,000 Southampton properties could already access full fibre, with thousands more planned; toob chose Southampton as the first city for its own self-built network and now serves over 125,000 customers UK-wide. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled SO14 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isW5 ? (
          <>Broadband deals in Ealing&apos;s W5 district include retailers using Openreach, plus Virgin Media and Community Fibre on their own separate networks. Vodafone confirmed on 2 September 2025 that it could provide full fibre broadband, running on Community Fibre&apos;s network, to 37,000 homes across the wider London Borough of Ealing at speeds of up to 2.2 Gbps. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled W5 postcode units. Compare total contract cost, then check the complete address, for example W5 1LF, before ordering.</>
        ) : isNW1 ? (
          <>Broadband deals in Camden&apos;s NW1 district include retailers using Openreach, plus Virgin Media, Hyperoptic and Community Fibre on their own separate full-fibre networks. G.Network, another named full-fibre altnet in central London, exited administration debt-free on 25 March 2026 after entering it in January 2026, and is not currently in BroadbandPicker&apos;s NW1 comparison. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled NW1 postcode units. Compare total contract cost, then check the complete address, for example NW1 0BJ, before ordering.</>
        ) : isEN1 ? (
          <>Broadband deals in Enfield&apos;s EN1 district include retailers using Openreach and Virgin Media on its own network. Openreach confirmed on 24 March 2026 that it had agreed to upgrade more than 1,500 flats and apartments across over 50 Enfield buildings to full fibre, with more planned. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled EN1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isUB1 ? (
          <>Broadband deals in Southall&apos;s UB1 district include retailers using Openreach and Virgin Media, whose gigabit cable network reached more than 20,000 additional Southall homes according to its own February 2023 announcement. Ofcom-derived July 2024 records separately show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled UB1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isE1 ? (
          <>Broadband deals in Whitechapel&apos;s E1 district, covering Spitalfields, Aldgate, Stepney and part of Wapping, include retailers using Openreach such as EE, Virgin Media where its network reaches the property, and full-fibre operators such as Hyperoptic and Community Fibre. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled E1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isSW1 ? (
          <>Westminster&apos;s SW1 postcode district is not one uniform area for broadband coverage: it splits into eight real outward codes, SW1A, SW1E, SW1H, SW1P, SW1V, SW1W, SW1X and SW1Y. BroadbandPicker&apos;s sample-size-weighted aggregation of Ofcom&apos;s July 2024 records across 1,710 sampled units shows an <strong>{`${sw1WeightedGigabitPercent}% gigabit-capable`}</strong> average, ranging from 36.4% in SW1A to 92% in SW1H. Compare total contract cost, then check the complete address before ordering.</>
        ) : isSE1 ? (
          <>Broadband deals in Southwark&apos;s SE1 district, covering Borough, Bankside, London Bridge, Waterloo, Bermondsey and Elephant and Castle, include retailers using Openreach, Virgin Media where its network reaches the property, and full-fibre operators such as Hyperoptic and Community Fibre where they reach the property. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled SE1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isHA1 ? (
          <>Broadband deals in Harrow&apos;s HA1 district include Openreach retailers, Virgin Media and independent full-fibre networks where they reach the property. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled HA1 postcode units. Check the complete address, including the house or flat number, before comparing total contract cost.</>
        ) : isGU1 ? (
          <>Broadband deals in Guildford&apos;s GU1 district include retailers using Openreach, Virgin Media and alternative full-fibre networks where they reach the property. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled GU1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isBN1 ? (
          <>Broadband deals in Brighton&apos;s BN1 district include retailers using Openreach, Virgin Media where its network reaches the property, CityFibre retailers in connected streets and selected building-specific networks. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled BN1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isNE1 ? (
          <>Broadband deals in Newcastle&apos;s NE1 district include retailers using Openreach, Virgin Media where its network reaches the property, and selected building-specific networks. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled NE1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isBS1 ? (
          <>Broadband deals in Bristol&apos;s BS1 district include retailers using Openreach, Virgin Media where its network reaches the property, and selected building-specific networks. Ofcom-derived July 2024 records show <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize} sampled BS1 postcode units. Compare total contract cost, then check the complete address before ordering.</>
        ) : isCR0 ? (
          <>Broadband deals in Croydon&apos;s CR0 district include retailers using Openreach, Virgin Media and Community Fibre where their separate networks reach the property. BroadbandPicker&apos;s aggregation of Ofcom July 2024 residential postcode records shows <strong>{districtCoverage?.gigabitPercent}% gigabit-capable</strong> and <strong>{districtCoverage?.superfastPercent}% superfast</strong> availability across {districtCoverage?.sampleSize.toLocaleString('en-GB')} sampled CR0 postcode units. Compare the full contract cost, then check the complete address before ordering.</>
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
      {isCR0 && <CR0BroadbandComparison />}
      {isN1 && <N1BroadbandComparison />}

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

      {isN1 && districtCoverage && (
        <div className="space-y-10 mb-10">
          <section className="max-w-4xl" aria-labelledby="n1-coverage-explained">
            <h2 id="n1-coverage-explained" className="text-2xl font-bold text-slate-900">Full-fibre broadband coverage in Islington N1</h2>
            <p className="mt-4 leading-7 text-slate-700">N1 covers areas including Angel, Barnsbury, Canonbury, Pentonville, De Beauvoir Town and parts of Hoxton, but it is not the same boundary as the London Borough of Islington. BroadbandPicker&apos;s aggregation of Ofcom&apos;s July 2024 residential postcode records shows {districtCoverage.gigabitPercent}% gigabit-capable and {districtCoverage.superfastPercent}% superfast availability across {districtCoverage.sampleSize.toLocaleString('en-GB')} sampled N1 postcode units.</p>
            <p className="mt-4 leading-7 text-slate-700">Those figures describe network reach across the district, not a guaranteed speed or package at one address. Openreach-based providers share one physical network, while Virgin Media, Hyperoptic and Community Fibre use separate networks. A provider may serve one building and not the next, especially around flats and converted properties.</p>
          </section>

          <section className="max-w-4xl" aria-labelledby="n1-council-fibre">
            <h2 id="n1-council-fibre" className="text-2xl font-bold text-slate-900">What Islington Council&apos;s full-fibre programme means for residents</h2>
            <p className="mt-4 leading-7 text-slate-700">Islington Council says it has agreements with Openreach, Hyperoptic, Community Fibre and G.Network for council housing land and buildings, with a goal of connecting at least 90% of council homes. Installation is carried out estate by estate, and more than one provider may request access to a building.</p>
            <p className="mt-4 leading-7 text-slate-700">That programme does not prove availability throughout N1. It applies to council housing, uses a different boundary from the postcode district and explicitly does not guarantee every home. Residents still need to check the full address and choose whether to subscribe after a network becomes live.</p>
          </section>

          <section className="max-w-4xl" aria-labelledby="n1-best-provider">
            <h2 id="n1-best-provider" className="text-2xl font-bold text-slate-900">How to compare internet providers in N1</h2>
            <ol className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['Confirm the complete address', 'Use the flat or house number with every suitable physical network. A postcode result alone is not enough.'],
                ['Calculate the real contract cost', 'Include every monthly payment, setup fees, guaranteed rewards, stated price changes and the post-contract price.'],
                ['Choose a useful speed', 'Around 30–100 Mbps can suit lighter use; 100–300 Mbps is a practical starting range for a busy shared home.'],
                ['Check building and service details', 'Compare upload speed, minimum guarantee, installation permission, router provision, moving terms and exit charges.'],
              ].map(([title, copy], index) => (
                <li key={title} className="rounded-xl border border-slate-200 bg-white p-5"><p className="font-semibold text-slate-900"><span className="mr-2 text-sky-700">{index + 1}.</span>{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></li>
              ))}
            </ol>
          </section>

          <section className="max-w-4xl" aria-labelledby="n1-specific-addresses">
            <h2 id="n1-specific-addresses" className="text-2xl font-bold text-slate-900">Checking a specific N1 postcode or flat</h2>
            <p className="mt-4 leading-7 text-slate-700">Searches such as N1 7UR, N1 7SX, N1 3BE and N1 1PF refer to small groups of addresses. District-level coverage cannot confirm a particular building, and even a full postcode may contain flats with different installation status. Enter the complete address on Ofcom and provider checkers, then compare only packages that are genuinely orderable.</p>
            <p className="mt-4 leading-7 text-slate-700">Renters should match the minimum term to the tenancy and confirm whether new cabling needs landlord or managing-agent approval. Eligible households should also compare <Link href="/guides/broadband-social-tariffs-uk" className="font-semibold text-sky-700 hover:underline">broadband social tariffs</Link> before choosing a standard promotion.</p>
          </section>
        </div>
      )}

      {isCR0 && districtCoverage && (
        <div className="space-y-10 mb-10">
          <section className="max-w-4xl" aria-labelledby="cr0-coverage-explained">
            <h2 id="cr0-coverage-explained" className="text-2xl font-bold text-slate-900">Full-fibre broadband coverage in Croydon CR0</h2>
            <p className="mt-4 leading-7 text-slate-700">CR0 is a postcode district, not one uniform broadband network. In BroadbandPicker&apos;s aggregation of Ofcom&apos;s July 2024 residential postcode records, {districtCoverage.gigabitPercent}% of {districtCoverage.sampleSize.toLocaleString('en-GB')} sampled CR0 postcode units were gigabit-capable and {districtCoverage.superfastPercent}% could receive at least 30 Mbps. These figures describe network reach, not a guaranteed household speed.</p>
            <p className="mt-4 leading-7 text-slate-700">Openreach-based providers share one physical network, while Virgin Media and Community Fibre operate separate networks. Their footprints do not perfectly overlap, so enter the house or flat number with each shortlisted provider before treating a deal as available.</p>
          </section>
          <section className="max-w-4xl" aria-labelledby="cr0-best-provider">
            <h2 id="cr0-best-provider" className="text-2xl font-bold text-slate-900">How to choose the best internet provider in Croydon</h2>
            <ol className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['Check the complete address', 'Use the house or flat number, not CR0 alone. Flats in the same building can also have different installation constraints.'],
                ['Compare the full contract cost', 'Include monthly payments, setup fees, rewards, stated price changes and the post-contract price.'],
                ['Match speed to real usage', 'Around 30–100 Mbps may suit lighter use; 100–300 Mbps is a useful starting range for a busy home.'],
                ['Read the service details', 'Compare upload speed, minimum guaranteed speed, router provision, installation and exit rules.'],
              ].map(([title, copy], index) => (
                <li key={title} className="rounded-xl border border-slate-200 bg-white p-5"><p className="font-semibold text-slate-900"><span className="mr-2 text-sky-700">{index + 1}.</span>{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></li>
              ))}
            </ol>
            <p className="mt-4 leading-7 text-slate-700">Eligible households should also compare <Link href="/guides/broadband-social-tariffs-uk" className="font-semibold text-sky-700 hover:underline">broadband social tariffs</Link>, subject to provider eligibility checks.</p>
          </section>
          <section className="max-w-4xl" aria-labelledby="cr0-flats-moving">
            <h2 id="cr0-flats-moving" className="text-2xl font-bold text-slate-900">Broadband for Croydon flats, renters and home movers</h2>
            <p className="mt-4 leading-7 text-slate-700">In a flat, ask which networks already enter the building and whether new cabling needs permission from the landlord or managing agent. Match the minimum term to the tenancy and keep the existing connection active until the new provider confirms the switch or installation date.</p>
            <p className="mt-4 leading-7 text-slate-700">Ofcom&apos;s One Touch Switch process lets most residential customers ask the new provider to coordinate a broadband switch. Check any early termination charge and the effect on bundled services before switching.</p>
          </section>
        </div>
      )}

      {isSW1 && (
        <>
          <section className="mt-10 max-w-4xl" aria-labelledby="sw1-sub-districts">
            <h2 id="sw1-sub-districts" className="text-2xl font-bold text-slate-900">
              Why SW1 needs eight coverage figures, not one
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              SW1 is a single postcode district for pricing and provider purposes, but Ofcom&apos;s coverage data cannot describe it with one number because SW1 genuinely splits into eight separate outward codes. BroadbandPicker&apos;s aggregation of Ofcom&apos;s July 2024 residential postcode records across{' '}
              {`${sw1TotalSample.toLocaleString('en-GB')} sampled units`} gives a{' '}
              {`${sw1WeightedGigabitPercent}% weighted-average gigabit-capable rate`} for SW1 as a whole, but the individual outward codes range from{' '}
              {`${Math.min(...sw1SubDistricts.map((d) => d.gigabitPercent))}%`} to {`${Math.max(...sw1SubDistricts.map((d) => d.gigabitPercent))}%.`}
            </p>
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-700">Outward code</th>
                    <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-700">Sampled postcode units</th>
                    <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-700">Gigabit-capable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sw1SubDistricts.map((d) => (
                    <tr key={d.code} className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-900">{d.code}</td>
                      <td className="px-4 py-3 text-slate-600">{d.sampleSize.toLocaleString('en-GB')}</td>
                      <td className="px-4 py-3 text-slate-600">{`${d.gigabitPercent}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Source: Ofcom Connected Nations, fixed broadband postcode-level coverage (residential), July 2024 edition, aggregated by BroadbandPicker under the Open Government Licence. Gigabit-capable means the network can deliver a package with a download speed of at least 1 Gbps; it describes network reach, not a measured speed at any one address.
            </p>
          </section>

          <section className="mt-10 max-w-4xl" aria-labelledby="sw1-best-deal">
            <h2 id="sw1-best-deal" className="text-2xl font-bold text-slate-900">
              How to find the best broadband deal in Westminster
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              A genuinely cheap SW1 broadband deal is a total-cost comparison, not the headline monthly price. Multiply the monthly charge across the minimum term, add setup fees and account for any stated annual price changes. Then check which SW1 outward code your address falls in using the table above as context, not proof, before choosing a package.
            </p>
            <p className="mt-4 leading-7 text-slate-700">
              If you receive Universal Credit, Pension Credit or another qualifying benefit,{' '}
              <Link href="/guides/broadband-social-tariffs-uk" className="font-semibold text-sky-700 hover:underline">
                check current UK broadband social tariffs
              </Link>
              {' '}before comparing standard Westminster promotions; Westminster City Council signposts the same government-backed schemes directly to residents. For a district outside SW1, our{' '}
              <Link href="/postcode/london" className="font-semibold text-sky-700 hover:underline">
                London postcode guide
              </Link>{' '}
              links to other city postcode pages.
            </p>
          </section>
        </>
      )}

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
            {isSE1 && (
              <p className="mt-4 leading-7 text-slate-700">
                For cheap broadband deals in Southwark, compare only packages confirmed for the complete Borough, Bankside, London Bridge or Bermondsey address. Rank them by total minimum-term cost, including setup fees, rewards and stated price changes, then check the guaranteed and upload speeds. An SE1-wide advertised price does not prove that the network has reached your specific building. If you are{' '}
                <Link href="/guides/how-to-switch-broadband-uk" className="font-semibold text-sky-700 hover:underline">
                  switching from an existing provider
                </Link>
                , confirm your notice period before ordering. For a district outside SE1, our{' '}
                <Link href="/postcode/london" className="font-semibold text-sky-700 hover:underline">
                  London postcode guide
                </Link>{' '}
                links to other city postcode pages.
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
          {isCR0 && districtCoverage && (
            <>
              <li><a href={districtCoverageSourcePage} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">{districtCoverageSourceLabel}</a><p className="mt-1 text-xs leading-relaxed text-slate-500">Source for the CR0 coverage figures, aggregated from postcode-level records dated {districtCoverageSourceDataDate}.</p></li>
              <li><a href="https://checker.ofcom.org.uk/en-gb/broadband-coverage" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Ofcom broadband coverage checker</a><p className="mt-1 text-xs leading-relaxed text-slate-500">Independent address-level coverage and speed-estimate check.</p></li>
              <li><a href="https://www.ofcom.org.uk/phones-and-broadband/switching-provider/simpler-broadband-switching-is-here" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Ofcom: One Touch Switch</a><p className="mt-1 text-xs leading-relaxed text-slate-500">Official residential broadband switching guidance.</p></li>
              <li><a href="https://www.croydon.gov.uk/housing/council-tenants-and-leaseholders/your-home/broadband" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Croydon Council: broadband</a><p className="mt-1 text-xs leading-relaxed text-slate-500">Local authority information about broadband infrastructure for Croydon council homes.</p></li>
            </>
          )}
          {isN1 && districtCoverage && (
            <>
              <li><a href={districtCoverageSourcePage} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">{districtCoverageSourceLabel}</a><p className="mt-1 text-xs leading-relaxed text-slate-500">Source for the N1 gigabit, ultrafast and superfast coverage figures, aggregated from postcode-level records dated {districtCoverageSourceDataDate}.</p></li>
              <li><a href="https://checker.ofcom.org.uk/en-gb/broadband-coverage" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Ofcom broadband coverage checker</a><p className="mt-1 text-xs leading-relaxed text-slate-500">Independent complete-address coverage and speed-estimate check.</p></li>
              <li><a href="https://www.islington.gov.uk/housing/repairs-and-estate-management/major-works-and-improvements/broadband" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Islington Council: broadband</a><p className="mt-1 text-xs leading-relaxed text-slate-500">Official details of the council-housing full-fibre programme, named network partners, coverage goal and limitations.</p></li>
              <li><a href="https://www.ofcom.org.uk/phones-and-broadband/switching-provider/simpler-broadband-switching-is-here" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Ofcom: One Touch Switch</a><p className="mt-1 text-xs leading-relaxed text-slate-500">Official guidance on the residential broadband switching process.</p></li>
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
    </main>
  )
}
