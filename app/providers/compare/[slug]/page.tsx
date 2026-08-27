import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FAQAccordion from '@/components/FAQAccordion'
import { getProviderBySlug } from '@/data/providers'
import { getProviderComparisonBySlug, providerComparisons } from '@/data/provider-comparisons'
import ReviewEvidencePanel from '@/components/ReviewEvidencePanel'

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

  const providers = [
    {
      provider: providerA,
      bestFor: comparison.bestForA,
      maxSpeed: getMaxDownload(providerA.slug),
      facts: comparison.factSnapshot?.providerA,
    },
    {
      provider: providerB,
      bestFor: comparison.bestForB,
      maxSpeed: getMaxDownload(providerB.slug),
      facts: comparison.factSnapshot?.providerB,
    },
  ]

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: comparison.title,
    description: comparison.metaDescription,
    datePublished: comparison.publishDate,
    dateModified: comparison.updatedDate,
    author: { '@type': 'Organization', name: 'BroadbandPicker' },
    publisher: {
      '@type': 'Organization',
      name: 'BroadbandPicker',
      url: 'https://broadbandpicker.co.uk',
    },
    url: `https://broadbandpicker.co.uk/providers/compare/${comparison.slug}`,
  }

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Provider reviews', href: '/providers' },
          { name: 'Compare providers', href: '/providers/compare' },
          { name: comparison.title, href: `/providers/compare/${comparison.slug}` },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{comparison.title}</h1>
      <p className="max-w-3xl text-slate-600 mb-4">{comparison.excerpt}</p>

      <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6 text-sm text-slate-500 mb-8">
        <span>Updated {new Date(comparison.updatedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>

      <section className="mb-10 rounded-xl border border-sky-200 bg-sky-50 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Quick Verdict</h2>
        <p className="text-sm text-slate-700 leading-relaxed">{comparison.winner}</p>
      </section>

      <ReviewEvidencePanel
        providers={[providerA, providerB]}
        heading={`${providerA.name} vs ${providerB.name}: customer-review evidence`}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-10">
        {providers.map(({ provider, bestFor, maxSpeed, facts }) => (
          <section key={provider.slug} className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">{provider.name}</h2>
            <p className="text-sm text-slate-500 mb-4">Best for: {bestFor}</p>
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
              <Link
                href={`/providers/${provider.slug}`}
                className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
              >
                Read {provider.name} review
              </Link>
              <Link
                href="/compare"
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Compare all providers
              </Link>
            </div>
          </section>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">At-a-Glance Comparison</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
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

      <section className="mb-10">
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

      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">How We Think About This Matchup</h2>
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          {comparison.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Final Verdict</h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          {comparison.verdict.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
      <FAQAccordion items={comparison.faqs} />

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
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
      </section>
    </div>
  )
}
