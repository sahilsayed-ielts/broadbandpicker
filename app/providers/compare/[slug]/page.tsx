import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FAQAccordion from '@/components/FAQAccordion'
import { getProviderBySlug } from '@/data/providers'
import { getProviderComparisonBySlug, providerComparisons } from '@/data/provider-comparisons'
import ReviewEvidencePanel from '@/components/ReviewEvidencePanel'
import AffiliateCTA from '@/components/AffiliateCTA'
import EeTalkTalkDecisionTool from '@/components/EeTalkTalkDecisionTool'
import PlusnetVsSkyComparison from '@/components/PlusnetVsSkyComparison'
import HyperopticVsCommunityFibreComparison from '@/components/HyperopticVsCommunityFibreComparison'
import OnThisPageNav from '@/components/OnThisPageNav'
import { JsonLd } from '@/lib/jsonLd'
import { articleJsonLd } from '@/lib/siteSchema'
import CiteableAnswer from '@/components/CiteableAnswer'
import PageHeroBanner from '@/components/PageHeroBanner'
import { DEFAULT_GUIDE_CTAS, categoryHero, firstSentence } from '@/lib/pageHero'

export async function generateStaticParams() {
  return providerComparisons.map((comparison) => ({ slug: comparison.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const comparison = getProviderComparisonBySlug(slug)
  if (!comparison) return {}

  return {
    title: comparison.metaTitle,
    description: comparison.metaDescription,
    alternates: { canonical: `https://broadbandpicker.co.uk/providers/compare/${slug}` },
    openGraph: {
      title: comparison.metaTitle,
      description: comparison.metaDescription,
      url: `https://broadbandpicker.co.uk/providers/compare/${slug}`,
    },
  }
}

function getMaxDownload(slug: string) {
  const provider = getProviderBySlug(slug)
  if (!provider) return 0
  return provider.speeds.reduce((max, speed) => Math.max(max, speed.download), 0)
}

export default async function ProviderComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const comparison = getProviderComparisonBySlug(slug)
  if (!comparison) notFound()

  const providerA = getProviderBySlug(comparison.providerA)
  const providerB = getProviderBySlug(comparison.providerB)
  if (!providerA || !providerB) notFound()

  const priceA = comparison.factSnapshot ? parseFloat(comparison.factSnapshot.providerA.fromPrice.replace(/[^0-9.]/g, '')) : providerA.monthlyPriceFrom
  const priceB = comparison.factSnapshot ? parseFloat(comparison.factSnapshot.providerB.fromPrice.replace(/[^0-9.]/g, '')) : providerB.monthlyPriceFrom
  const speedA = getMaxDownload(providerA.slug)
  const speedB = getMaxDownload(providerB.slug)

  const providers = [
    {
      provider: providerA,
      bestFor: comparison.bestForA,
      maxSpeed: speedA,
      facts: comparison.factSnapshot?.providerA,
      badge: !Number.isNaN(priceA) && !Number.isNaN(priceB) && priceA < priceB ? 'Best value'
        : speedA > speedB ? 'Fastest'
        : null,
    },
    {
      provider: providerB,
      bestFor: comparison.bestForB,
      maxSpeed: speedB,
      facts: comparison.factSnapshot?.providerB,
      badge: !Number.isNaN(priceA) && !Number.isNaN(priceB) && priceB < priceA ? 'Best value'
        : speedB > speedA ? 'Fastest'
        : null,
    },
  ]

  const articleStructuredData = articleJsonLd({
    headline: comparison.title,
    description: comparison.metaDescription,
    url: `https://broadbandpicker.co.uk/providers/compare/${comparison.slug}`,
    datePublished: comparison.publishDate,
    dateModified: comparison.updatedDate,
  })

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: comparison.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const sourceLinks = [
    { label: 'BroadbandPicker review methodology', href: '/how-we-review-broadband' },
    { label: 'BroadbandPicker editorial policy', href: '/editorial-policy' },
    ...comparison.sources.map((source) => ({ ...source, external: true as const })),
  ]

  const hero = categoryHero('providers-and-comparisons')

  return (
    <div>
      <JsonLd data={articleStructuredData} />
      <JsonLd data={faqJsonLd} />
      <PageHeroBanner
        title={comparison.title}
        kicker="Head-to-head"
        lede={firstSentence(comparison.excerpt)}
        image={hero.image}
        imageAlt={hero.imageAlt}
        accent={hero.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Provider reviews', href: '/providers' },
          { name: 'Compare providers', href: '/providers/compare' },
          { name: comparison.title, href: `/providers/compare/${comparison.slug}` },
        ]}
      />
      <CiteableAnswer>{comparison.excerpt}</CiteableAnswer>

      <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6 text-sm text-slate-500 mb-8">
        <span>Updated {new Date(comparison.updatedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>

      <section className="mb-10 rounded-xl border border-sky-200 bg-sky-50 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Quick Verdict</h2>
        <p className="text-sm text-slate-700 leading-relaxed">{comparison.winner}</p>
      </section>

      <OnThisPageNav
        links={[
          { href: '#comparison', label: 'At-a-glance comparison' },
          ...(comparison.slug === 'plusnet-vs-sky'
            ? [
                { href: '#price-tiers', label: 'Price per tier' },
                { href: '#head-to-head', label: 'Common questions' },
                { href: '#wins-when', label: 'Who each is best for' },
              ]
            : []),
          ...(comparison.slug === 'hyperoptic-vs-community-fibre'
            ? [
                { href: '#availability-first', label: 'Availability first' },
                { href: '#contract-facts', label: 'Contract facts' },
                { href: '#cost-150', label: '24-month cost at 150 Mbps' },
                { href: '#wins-when', label: 'Who each is best for' },
              ]
            : []),
          { href: '#key-differences', label: 'Key differences' },
          { href: '#how-we-think', label: 'How we think about this' },
          { href: '#verdict', label: 'Final verdict' },
          { href: '#faqs', label: 'FAQs' },
          { href: '#sources', label: 'Sources' },
        ]}
        className="mb-10"
      />

      <ReviewEvidencePanel
        providers={[providerA, providerB]}
        heading={`${providerA.name} vs ${providerB.name}: customer-review evidence`}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-10">
        {providers.map(({ provider, bestFor, maxSpeed, facts, badge }) => (
          <section key={provider.slug} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{provider.name}</h2>
              {badge && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
                  {badge}
                </span>
              )}
            </div>
            <span className="mb-4 inline-block rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
              Best for: {bestFor}
            </span>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500 mb-1">From</div>
                <div className="font-semibold text-slate-900">{facts?.fromPrice ?? `£${provider.monthlyPriceFrom.toFixed(2)}/mo`}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500 mb-1">Max speed</div>
                <div className="font-semibold text-slate-900">{facts?.maxSpeed ?? `${maxSpeed} Mbps`}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500 mb-1">Coverage</div>
                <div className="font-semibold text-slate-900">{facts?.coverage ?? `${provider.coveragePercent}%`}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500 mb-1">Trustpilot</div>
                <div className="font-semibold text-slate-900">{facts?.trustpilot ?? `${provider.trustpilotScore.toFixed(1)}/5`}</div>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {provider.highlights.slice(0, 3).map((highlight) => (
                <li key={highlight} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {highlight.replaceAll('—', ':')}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <AffiliateCTA
                href={provider.affiliateUrl}
                providerName={provider.name}
                providerSlug={provider.slug}
                placement="comparison_provider_card"
                size="md"
              />
              <Link
                href={`/providers/${provider.slug}`}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Read {provider.name} review
              </Link>
            </div>
          </section>
        ))}
      </div>

      <section id="comparison" className="mb-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-4">At-a-Glance Comparison</h2>
        <div
          className="overflow-x-auto rounded-xl border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
          role="region"
          aria-label={`${providerA.name} and ${providerB.name} broadband facts. Scroll horizontally to view every column.`}
          tabIndex={0}
        >
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Metric</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">{providerA.name}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">{providerB.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(comparison.factSnapshot ? [
                ['From price', comparison.factSnapshot.providerA.fromPrice, comparison.factSnapshot.providerB.fromPrice],
                ['Max speed', comparison.factSnapshot.providerA.maxSpeed, comparison.factSnapshot.providerB.maxSpeed],
                ['Setup fee', comparison.factSnapshot.providerA.setupFee, comparison.factSnapshot.providerB.setupFee],
                ['Typical contract', comparison.factSnapshot.providerA.contract, comparison.factSnapshot.providerB.contract],
                ['Coverage', comparison.factSnapshot.providerA.coverage, comparison.factSnapshot.providerB.coverage],
                ['Trustpilot', comparison.factSnapshot.providerA.trustpilot, comparison.factSnapshot.providerB.trustpilot],
              ] : [
                ['From price', `£${providerA.monthlyPriceFrom.toFixed(2)}/mo`, `£${providerB.monthlyPriceFrom.toFixed(2)}/mo`],
                ['Max speed', `${getMaxDownload(providerA.slug)} Mbps`, `${getMaxDownload(providerB.slug)} Mbps`],
                ['Setup fee', providerA.setupFee === 0 ? 'Free' : `£${providerA.setupFee}`, providerB.setupFee === 0 ? 'Free' : `£${providerB.setupFee}`],
                ['Typical contract', `${providerA.contractLengths[0]} months`, `${providerB.contractLengths[0]} months`],
                ['Coverage', `${providerA.coveragePercent}% of UK homes`, `${providerB.coveragePercent}% of UK homes`],
                ['Trustpilot', `${providerA.trustpilotScore.toFixed(1)}/5`, `${providerB.trustpilotScore.toFixed(1)}/5`],
              ]).map(([label, left, right]) => (
                <tr key={label}>
                  <td className="px-4 py-3 font-medium text-slate-900">{label}</td>
                  <td className="px-4 py-3 text-slate-700">{left}</td>
                  <td className="px-4 py-3 text-slate-700">{right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="pros-cons" className="mb-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Pros and Cons</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {providers.map(({ provider }) => (
            <div key={provider.slug} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-900 mb-3">{provider.name}</h3>
              <ul className="mb-4 space-y-2 text-sm text-slate-700">
                {provider.pros.slice(0, 4).map((pro) => (
                  <li key={pro} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600" aria-hidden="true">+</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2 text-sm text-slate-600">
                {provider.cons.slice(0, 4).map((con) => (
                  <li key={con} className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-500" aria-hidden="true">&minus;</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {comparison.slug === 'ee-vs-talktalk' ? <EeTalkTalkDecisionTool /> : null}

      {comparison.slug === 'plusnet-vs-sky' ? (
        <PlusnetVsSkyComparison
          plusnetAffiliateUrl={providerA.affiliateUrl}
          skyAffiliateUrl={providerB.affiliateUrl}
        />
      ) : null}

      {comparison.slug === 'hyperoptic-vs-community-fibre' ? (
        <HyperopticVsCommunityFibreComparison
          hyperopticAffiliateUrl={providerA.affiliateUrl}
          communityFibreAffiliateUrl={providerB.affiliateUrl}
        />
      ) : null}

      <section id="key-differences" className="mb-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Key Differences</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {comparison.keyDifferences.map((difference) => (
            <div key={difference.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-900 mb-2">{difference.label}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{difference.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-we-think" className="mb-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">How We Think About This Matchup</h2>
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          {comparison.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section id="verdict" className="mb-10 scroll-mt-24 rounded-xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Final Verdict</h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          {comparison.verdict.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <AffiliateCTA
            href={providerA.affiliateUrl}
            providerName={providerA.name}
            providerSlug={providerA.slug}
            placement="comparison_final_verdict"
            label={`Check ${providerA.name} at my postcode`}
            size="md"
          />
          <AffiliateCTA
            href={providerB.affiliateUrl}
            providerName={providerB.name}
            providerSlug={providerB.slug}
            placement="comparison_final_verdict"
            label={`Check ${providerB.name} at my postcode`}
            size="md"
            variant="outline"
          />
        </div>
      </section>

      <div id="faqs" className="scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        <FAQAccordion items={comparison.faqs} />
      </div>

      <section id="sources" className="mt-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial and Source Notes</h2>
        <p className="mb-4 text-sm text-slate-600">
          We review provider comparisons against the same published methodology used across our
          provider reviews, then add source links where they help verify pricing context,
          methodology, and trade-offs.
        </p>
        <ul className="space-y-2 text-sm">
          {sourceLinks.map((source) => (
            <li key={source.href}>
              {'external' in source && source.external ? (
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline"
                >
                  {source.label}
                </a>
              ) : (
                <Link href={source.href} className="text-sky-600 hover:underline">
                  {source.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        {comparison.slug === 'community-fibre-vs-hyperoptic' ? (
          <p className="mt-4 text-sm text-slate-600">
            For the reverse-order matchup with the 24-month cost example and contract facts, see{' '}
            <Link href="/providers/compare/hyperoptic-vs-community-fibre" className="text-sky-600 hover:underline">
              Hyperoptic vs Community Fibre
            </Link>
            .
          </p>
        ) : null}
        {comparison.slug === 'hyperoptic-vs-youfibre' ? (
          <p className="mt-4 text-sm text-slate-600">
            If you are choosing between London own-network altnets rather than YouFibre, see{' '}
            <Link href="/providers/compare/hyperoptic-vs-community-fibre" className="text-sky-600 hover:underline">
              Hyperoptic vs Community Fibre
            </Link>
            .
          </p>
        ) : null}
      </section>

      {comparison.slug === 'ee-vs-talktalk' ? (
        <section id="related-comparisons" className="mt-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Related Comparisons and Guides</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
            <li>
              <Link href="/providers/compare/bt-vs-talktalk" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                BT vs TalkTalk &rarr;
              </Link>
            </li>
            <li>
              <Link href="/providers/compare/ee-vs-sky" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                EE vs Sky &rarr;
              </Link>
            </li>
            <li>
              <Link href="/providers/compare/talktalk-vs-plusnet" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                TalkTalk vs Plusnet &rarr;
              </Link>
            </li>
            <li>
              <Link href="/providers/shell-energy" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                Shell Energy broadband migration guide &rarr;
              </Link>
            </li>
          </ul>
        </section>
      ) : null}

      {comparison.slug === 'bt-vs-plusnet' ? (
        <section id="related-comparisons" className="mt-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Related Comparisons and Guides</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
            <li>
              <Link href="/providers/compare/bt-vs-sky" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                BT vs Sky &rarr;
              </Link>
            </li>
            <li>
              <Link href="/providers/compare/bt-vs-talktalk" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                BT vs TalkTalk &rarr;
              </Link>
            </li>
            <li>
              <Link href="/providers/compare/plusnet-vs-sky" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                Plusnet vs Sky &rarr;
              </Link>
            </li>
            <li>
              <Link href="/guides/digital-voice-explained-uk" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                Digital Voice explained &rarr;
              </Link>
            </li>
            <li>
              <Link href="/guides/landline-switch-off-explained-uk" className="block rounded-lg border border-slate-200 bg-white p-4 font-semibold text-sky-700 hover:bg-slate-50">
                UK landline switch-off guide &rarr;
              </Link>
            </li>
          </ul>
        </section>
      ) : null}
      </div>
    </div>
  )
}
