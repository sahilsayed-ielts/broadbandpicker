import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import CiteableAnswer from '@/components/CiteableAnswer'
import OnThisPageNav from '@/components/OnThisPageNav'
import ProviderPairFinder, { type PairFinderComparison } from '@/components/ProviderPairFinder'
import TrackedLink from '@/components/TrackedLink'
import { providerComparisons } from '@/data/provider-comparisons'
import { providers } from '@/data/providers'
import { JsonLd } from '@/lib/jsonLd'

const BASE_URL = 'https://broadbandpicker.co.uk'
const PAGE_URL = `${BASE_URL}/providers/compare`
const REVIEWED_DATE = '2026-09-06'

export const metadata: Metadata = {
  title: 'Broadband Provider Comparisons: Every UK Head-to-Head Guide',
  description:
    'Find the right head-to-head broadband provider comparison fast: every BroadbandPicker matchup grouped by network, plus a pair finder for matchups we do not yet cover.',
  alternates: { canonical: PAGE_URL },
  authors: [{ name: 'BroadbandPicker editorial team', url: `${BASE_URL}/about` }],
  openGraph: {
    title: 'Broadband Provider Comparisons: Every UK Head-to-Head Guide | BroadbandPicker',
    description:
      'Every BroadbandPicker provider-versus-provider comparison in one place, grouped by network, with a provider pair finder.',
    url: PAGE_URL,
    type: 'website',
  },
}

// Network each provider sells over. This is the single most useful way to group a
// head-to-head, because two retailers on the same network differ on price and
// service, while different networks differ first on what reaches an address.
const NETWORK: Record<string, 'openreach' | 'virgin' | 'altnet'> = {
  bt: 'openreach',
  sky: 'openreach',
  ee: 'openreach',
  talktalk: 'openreach',
  plusnet: 'openreach',
  vodafone: 'openreach',
  'now-broadband': 'openreach',
  'zen-internet': 'openreach',
  giffgaff: 'openreach',
  cuckoo: 'openreach',
  onestream: 'openreach',
  'shell-energy': 'openreach',
  'virgin-media': 'virgin',
  hyperoptic: 'altnet',
  'community-fibre': 'altnet',
  youfibre: 'altnet',
  zzoomm: 'altnet',
  trooli: 'altnet',
  'national-broadband': 'altnet',
  'highland-broadband': 'altnet',
  toob: 'altnet',
  gigaclear: 'altnet',
  brsk: 'altnet',
  'pine-media': 'altnet',
}

const providerName: Record<string, string> = Object.fromEntries(
  providers.map((provider) => [provider.slug, provider.name]),
)

function groupOf(a: string, b: string): string {
  const nets = [NETWORK[a] ?? 'openreach', NETWORK[b] ?? 'openreach'].sort()
  const key = nets.join('+')
  if (key === 'openreach+openreach') return 'Openreach retailer vs Openreach retailer'
  if (key === 'openreach+virgin') return 'Virgin Media vs an Openreach retailer'
  if (key === 'altnet+altnet') return 'Full-fibre altnet vs full-fibre altnet'
  if (key === 'altnet+openreach') return 'Full-fibre altnet vs a national retailer'
  if (key === 'altnet+virgin') return 'Full-fibre altnet vs Virgin Media'
  return 'Other matchups'
}

const GROUP_ORDER = [
  'Openreach retailer vs Openreach retailer',
  'Virgin Media vs an Openreach retailer',
  'Full-fibre altnet vs full-fibre altnet',
  'Full-fibre altnet vs a national retailer',
  'Full-fibre altnet vs Virgin Media',
  'Other matchups',
]

const GROUP_NOTE: Record<string, string> = {
  'Openreach retailer vs Openreach retailer':
    'Both providers sell over the Openreach network, so the top speed at your address is usually the same. The guide settles it on price, contract terms, router and service evidence.',
  'Virgin Media vs an Openreach retailer':
    'Different networks, so availability and installation come first. The guide covers Virgin Media cable and fibre against an Openreach line at the same address.',
  'Full-fibre altnet vs full-fibre altnet':
    'Both build their own full fibre, so coverage is street by street. The guide compares symmetrical speeds, contract flexibility and price where both are wired.',
  'Full-fibre altnet vs a national retailer':
    'The core question is whether an independent full-fibre network beats a widely available national retailer at your address on speed, price and price-rise policy.',
  'Full-fibre altnet vs Virgin Media':
    'Two non-Openreach networks. Availability decides first, then upload speed, contract terms and price.',
  'Other matchups': 'Comparisons that do not fit the groups above.',
}

const grouped = GROUP_ORDER.map((group) => ({
  group,
  note: GROUP_NOTE[group],
  items: providerComparisons
    .filter((comparison) => groupOf(comparison.providerA, comparison.providerB) === group)
    .sort((x, y) => x.title.localeCompare(y.title)),
})).filter((section) => section.items.length > 0)

const pairFinderData: PairFinderComparison[] = providerComparisons.map((comparison) => ({
  slug: comparison.slug,
  a: comparison.providerA,
  b: comparison.providerB,
}))

const faqs = [
  {
    question: 'What is the difference between this page and the main broadband comparison tool?',
    answer:
      'This page is a directory of head-to-head guides for readers who have already shortlisted two providers and want a direct verdict. The all-provider comparison at /compare is for readers who have not shortlisted yet and want to filter the whole market by price, speed and contract before choosing two finalists.',
  },
  {
    question: 'Which is better, BT or Sky broadband?',
    answer:
      'Both sell over the Openreach network, so the available speed at your address is the same. In the current BroadbandPicker data their entry prices are within about a pound of each other, so the decision comes down to Ofcom complaints record, coverage breadth and TV bundle options. The BT vs Sky guide covers the current figures with sources.',
  },
  {
    question: 'Is EE or Vodafone better for broadband?',
    answer:
      'Both run on Openreach. EE tends to lead on router hardware and an automatic mobile backup option, while Vodafone often has the sharper full-fibre pricing and a mobile-bundle discount. The EE vs Vodafone guide compares current prices, speed guarantees and price-rise policy with dated sources.',
  },
  {
    question: 'Which broadband provider has the fewest complaints?',
    answer:
      'Ofcom Q1 2026 complaints data recorded Plusnet with the fewest at 4 per 100,000 customers, then Sky at 5, against an industry average of 6. TalkTalk had the most at 10. Our provider comparisons use the same Ofcom data rather than blending it with review-platform scores, and the customer satisfaction research page has the full table.',
  },
  {
    question: 'What if there is no comparison for the two providers I want?',
    answer:
      'Use the pair finder near the top of the page. If we do not cover that exact matchup, it links you to the nearest guide, both provider reviews and the all-provider comparison so you can still put those two providers side by side against the wider market.',
  },
  {
    question: 'Do these comparisons tell me what I can get at my address?',
    answer:
      'No. Every comparison explains that availability, the exact speed estimate and the current price depend on your address. Openreach retailers share a line, altnets build street by street, and Virgin Media has its own network, so always run a postcode check with each provider before you order.',
  },
]

const sources = [
  {
    label: 'Ofcom: telecoms and pay-TV complaints (quarterly, verified 6 September 2026)',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/telecoms-and-pay-tv-complaints',
  },
  {
    label: 'Ofcom Connected Nations: network coverage and availability (verified 6 September 2026)',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-update-spring-2026',
  },
  {
    label: 'Ofcom: ban on inflation-linked mid-contract price rises (verified 6 September 2026)',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/bills-and-charges/ofcom-bans-mid-contract-price-rises-linked-to-inflation',
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${PAGE_URL}#page`,
      name: 'Broadband Provider Comparisons',
      description:
        'A directory of BroadbandPicker head-to-head broadband provider comparisons, grouped by the network each provider uses.',
      url: PAGE_URL,
      dateModified: REVIEWED_DATE,
      author: { '@type': 'Organization', name: 'BroadbandPicker editorial team', url: `${BASE_URL}/about` },
      publisher: { '@type': 'Organization', name: 'BroadbandPicker', url: BASE_URL },
      mainEntity: { '@id': `${PAGE_URL}#comparisons` },
      citation: sources.map((source) => source.href),
    },
    {
      '@type': 'ItemList',
      '@id': `${PAGE_URL}#comparisons`,
      name: 'Broadband provider head-to-head comparisons',
      itemListElement: providerComparisons.map((comparison, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: comparison.title,
        url: `${BASE_URL}/providers/compare/${comparison.slug}`,
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faqs`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Provider reviews', item: `${BASE_URL}/providers` },
        { '@type': 'ListItem', position: 3, name: 'Broadband provider comparisons', item: PAGE_URL },
      ],
    },
  ],
}

// Common matchups people search for that do not have a dedicated guide, with the
// nearest useful alternative. This is the head-to-head coverage map.
const coverageGaps = [
  {
    wanted: 'Hyperoptic vs Vodafone broadband',
    reason: 'an altnet against an Openreach retailer',
    nearest: { label: 'Hyperoptic vs Community Fibre', href: '/providers/compare/hyperoptic-vs-community-fibre' },
    also: { label: 'BT vs Hyperoptic', href: '/providers/compare/bt-vs-hyperoptic' },
  },
  {
    wanted: 'Virgin Media vs Sky vs Vodafone (three-way)',
    reason: 'a three-way comparison, which our guides do not cover as one page',
    nearest: { label: 'Sky vs Virgin Media', href: '/providers/compare/sky-vs-virgin-media' },
    also: { label: 'Sky vs Vodafone', href: '/providers/compare/sky-vs-vodafone' },
  },
  {
    wanted: 'Community Fibre vs Vodafone broadband',
    reason: 'a London altnet against an Openreach retailer',
    nearest: { label: 'Community Fibre vs Hyperoptic', href: '/providers/compare/community-fibre-vs-hyperoptic' },
    also: { label: 'BT vs Hyperoptic', href: '/providers/compare/bt-vs-hyperoptic' },
  },
]

export default function ProviderCompareHubPage() {
  const reviewedLabel = new Date(`${REVIEWED_DATE}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={structuredData} />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Provider reviews', href: '/providers' },
          { name: 'Compare providers', href: '/providers/compare' },
        ]}
      />

      <h1 className="mb-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Broadband Provider Comparisons: Every UK Head-to-Head
      </h1>

      <CiteableAnswer>
        This directory lists every BroadbandPicker head-to-head broadband provider comparison,
        grouped by the network each provider uses. Use it when you have shortlisted two providers
        and want a direct verdict on price, speed, contract and service. If you have not shortlisted
        yet, start with the all-provider comparison at /compare. Availability, speed and price always
        depend on your address, so check your postcode before you choose.
      </CiteableAnswer>

      <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6 text-sm text-slate-500">
        <span>Reviewed {reviewedLabel}</span>
        <span aria-hidden="true">&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
        <span aria-hidden="true">&middot;</span>
        <span>{providerComparisons.length} head-to-head guides</span>
      </div>

      <OnThisPageNav
        links={[
          { href: '#pair-finder', label: 'Build your own comparison' },
          { href: '#which-page', label: 'Which page should I use?' },
          { href: '#directory', label: 'All comparisons by network' },
          { href: '#coverage', label: 'Matchup not listed?' },
          { href: '#methodology', label: 'How we compare providers' },
          { href: '#more', label: 'Reviews, deals and guides' },
          { href: '#faqs', label: 'FAQs' },
          { href: '#sources', label: 'Sources' },
        ]}
        className="mb-10"
      />

      <section id="which-page" className="mb-12 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Which page should I use?</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
            <h3 className="font-bold text-slate-900">You have two providers in mind</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Use the head-to-head guides on this page. Each one gives a conditional verdict, a
              specs table and the key decision it settles for that exact pairing, with dated
              sources.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900">You have not shortlisted yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Start with the{' '}
              <TrackedLink
                href="/compare"
                event="compare_all_providers_clicked"
                params={{ location: 'which_page_box' }}
                className="font-semibold text-sky-700 underline"
              >
                all-provider comparison
              </TrackedLink>
              . Filter the whole UK market by price, speed and contract, check your postcode, then
              come back here for the head-to-head on your two finalists.
            </p>
          </div>
        </div>
      </section>

      <ProviderPairFinder
        comparisons={pairFinderData}
        providerNames={providerName}
        providerNetwork={NETWORK}
      />

      <section id="directory" className="mb-12 scroll-mt-24">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">All broadband provider comparisons by network</h2>
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-600">
          Grouped by network because that is what changes the decision. Two retailers on the same
          network compete on price and service; different networks compete first on what actually
          reaches your address.
        </p>
        <div className="space-y-10">
          {grouped.map((section) => (
            <div key={section.group}>
              <h3 className="text-lg font-bold text-slate-900">{section.group}</h3>
              <p className="mt-1 mb-4 max-w-3xl text-sm leading-relaxed text-slate-600">{section.note}</p>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {section.items.map((comparison) => (
                  <li key={comparison.slug}>
                    <TrackedLink
                      href={`/providers/compare/${comparison.slug}`}
                      event="comparison_card_clicked"
                      params={{ comparison_slug: comparison.slug, group: section.group }}
                      className="group block h-full rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                    >
                      <span className="block font-bold text-slate-900 group-hover:text-sky-700">
                        {providerName[comparison.providerA] ?? comparison.providerA} vs{' '}
                        {providerName[comparison.providerB] ?? comparison.providerB}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                        {comparison.excerpt}
                      </span>
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="coverage" className="mb-12 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Head-to-head coverage: matchup not listed?</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-slate-700">
          We cover {providerComparisons.length} pairings. If your exact matchup is not covered, one
          of two things is usually true: it pairs an altnet with a national retailer where
          availability decides the outcome, or it is a three-way comparison. Here are the searches we
          see most often without a dedicated guide, and the nearest useful pages.
        </p>
        <ul className="space-y-4">
          {coverageGaps.map((gap) => (
            <li key={gap.wanted} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{gap.wanted}</p>
              <p className="mt-1 text-sm text-slate-600">
                Not a single guide because it is {gap.reason}.
              </p>
              <p className="mt-2 text-sm">
                Nearest guide:{' '}
                <Link href={gap.nearest.href} className="font-semibold text-sky-700 underline">
                  {gap.nearest.label}
                </Link>
                {' · also useful: '}
                <Link href={gap.also.href} className="font-semibold text-sky-700 underline">
                  {gap.also.label}
                </Link>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-slate-600">
          For any pairing, the{' '}
          <TrackedLink
            href="/compare"
            event="compare_all_providers_clicked"
            params={{ location: 'coverage_section' }}
            className="font-semibold text-sky-700 underline"
          >
            all-provider comparison
          </TrackedLink>{' '}
          lets you put two providers side by side against the whole market and check your postcode.
        </p>
      </section>

      <section id="methodology" className="mb-12 scroll-mt-24">
        <h2 className="mb-3 text-2xl font-bold text-slate-900">How we compare providers</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
          Every head-to-head guide follows the same method. We take starting prices, speed ranges,
          contract length and setup fees from each provider and cross-check them against independent
          listings on the review date shown on the guide. Complaints evidence comes from Ofcom&apos;s
          quarterly data, which counts complaints per 100,000 customers, and we keep it separate from
          Trustpilot scores rather than blending them into one rating. Where the evidence does not
          point to one winner, the verdict says so and names the conditions under which each provider
          is the better choice. We never invent prices, speeds, ratings or survey findings, and we
          treat an advertised maximum speed as a range, not a guarantee for your address.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Read the full{' '}
          <Link href="/how-we-review-broadband" className="font-semibold text-sky-700 underline">
            review methodology
          </Link>{' '}
          and{' '}
          <Link href="/editorial-policy" className="font-semibold text-sky-700 underline">
            editorial policy
          </Link>
          .
        </p>
      </section>

      <section id="more" className="mb-12 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-2xl font-bold text-slate-900">Provider reviews, deals and supporting guides</h2>
        <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <li>
            <Link href="/providers" className="text-sky-600 underline hover:text-sky-700">
              All UK broadband provider reviews
            </Link>
          </li>
          <li>
            <TrackedLink
              href="/compare"
              event="compare_all_providers_clicked"
              params={{ location: 'more_links' }}
              className="text-sky-600 underline hover:text-sky-700"
            >
              Compare every provider side by side
            </TrackedLink>
          </li>
          <li>
            <Link href="/deals" className="text-sky-600 underline hover:text-sky-700">
              Current broadband deals
            </Link>
          </li>
          <li>
            <TrackedLink
              href="/postcode"
              event="postcode_check_started"
              params={{ location: 'more_links' }}
              className="text-sky-600 underline hover:text-sky-700"
            >
              Check availability by postcode
            </TrackedLink>
          </li>
          <li>
            <Link href="/guides/best-broadband-providers-uk" className="text-sky-600 underline hover:text-sky-700">
              Best broadband providers in the UK
            </Link>
          </li>
          <li>
            <Link href="/guides/how-to-switch-broadband-uk" className="text-sky-600 underline hover:text-sky-700">
              How to switch broadband provider
            </Link>
          </li>
          <li>
            <Link href="/research/uk-broadband-customer-satisfaction" className="text-sky-600 underline hover:text-sky-700">
              UK broadband customer satisfaction and complaints
            </Link>
          </li>
          <li>
            <Link href="/guides/full-fibre-broadband-explained" className="text-sky-600 underline hover:text-sky-700">
              Full fibre broadband explained
            </Link>
          </li>
        </ul>
      </section>

      <section id="faqs" className="mb-12 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Broadband provider comparison FAQs</h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-bold text-slate-900">
                {faq.question}
                <span aria-hidden="true" className="text-xl text-sky-700 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="sources" className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-2xl font-bold text-slate-900">Sources and editorial standards</h2>
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-slate-600">
          Market-wide claims about networks, complaints and price-rise rules on this page and in the
          linked guides come from Ofcom and UK government material. Provider prices and specs come
          from the BroadbandPicker provider dataset and each provider&apos;s own pages, checked on the
          review date shown.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {sources.map((source) => (
            <li key={source.href} className="rounded-lg border border-slate-200 p-4 text-sm">
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-700 underline"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-slate-600">
          <Link href="/how-we-review-broadband" className="font-semibold text-sky-700 underline">
            How we review broadband
          </Link>
          {' · '}
          <Link href="/editorial-policy" className="font-semibold text-sky-700 underline">
            Editorial policy
          </Link>
          {' · '}
          <Link href="/how-we-make-money" className="font-semibold text-sky-700 underline">
            How we make money
          </Link>
        </p>
      </section>
    </div>
  )
}
