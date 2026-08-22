import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { providers, getProviderBySlug } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import AffiliateCTA from '@/components/AffiliateCTA'
import SpeedBadge from '@/components/SpeedBadge'
import FAQAccordion from '@/components/FAQAccordion'
import { buildProviderOfferJsonLd } from '@/lib/dealSchema'
import PostcodeContextBar from '@/components/PostcodeContextBar'

export async function generateStaticParams() {
  return providers.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const provider = getProviderBySlug(slug)
  if (!provider) return {}

  const maxSpeed = provider.speeds.reduce((a, b) => (b.download > a.download ? b : a))
  const isRetired = Boolean(provider.retiredDate && provider.successorName && provider.successorUrl)

  return {
    title: isRetired
      ? `${provider.name} Broadband Review 2026 | Now ${provider.successorName}`
      : `${provider.name} Broadband Review 2026 | Deals from £${provider.monthlyPriceFrom.toFixed(2)}/mo`,
    description: isRetired
      ? `${provider.name} broadband is now ${provider.successorName}. Read about the March 2026 change, legacy speeds and prices, coverage, support and current next steps.`
      : `Read our ${provider.name} broadband review. Speeds up to ${maxSpeed.download} Mbps, from £${provider.monthlyPriceFrom.toFixed(2)}/month. See deals, pros, cons and customer ratings.`,
    alternates: { canonical: `https://broadbandpicker.co.uk/providers/${slug}` },
    openGraph: {
      title: `${provider.name} Broadband Review 2026 | BroadbandPicker`,
      description: isRetired
        ? `${provider.name} broadband became ${provider.successorName} in March 2026.`
        : `${provider.name} broadband deals from £${provider.monthlyPriceFrom.toFixed(2)}/month.`,
      url: `https://broadbandpicker.co.uk/providers/${slug}`,
    },
  }
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const provider = getProviderBySlug(slug)
  if (!provider) notFound()

  const maxSpeed = provider.speeds.reduce((a, b) => (b.download > a.download ? b : a))
  const reviewedDateLabel = new Date(provider.reviewedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const pricingVerifiedDateLabel = new Date(provider.pricingVerifiedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const isRetired = Boolean(provider.retiredDate && provider.successorName && provider.successorUrl)

  const defaultFaqItems = [
    {
      question: `Is ${provider.name} broadband any good?`,
      answer: `${provider.name} has a Trustpilot score of ${provider.trustpilotScore.toFixed(1)}/5. ${provider.pros[0]}. ${provider.pros[1] ?? ''} It covers ${provider.coveragePercent}% of UK homes.`,
    },
    {
      question: `How much does ${provider.name} broadband cost?`,
      answer: `${provider.name} broadband starts from £${provider.monthlyPriceFrom.toFixed(2)}/month. Setup fees are ${provider.setupFee === 0 ? 'free' : `£${provider.setupFee}`}. Contracts run for ${provider.contractLengths.join(' or ')} months.`,
    },
    {
      question: `What speeds does ${provider.name} offer?`,
      answer: `${provider.name} offers speeds from ${provider.speeds[0].download} Mbps up to ${maxSpeed.download} Mbps download. Package types include ${[...new Set(provider.speeds.map((s) => s.type))].join(', ')}.`,
    },
    {
      question: `Does ${provider.name} cover my area?`,
      answer: `${provider.name} covers approximately ${provider.coveragePercent}% of UK homes. Enter your postcode on our postcode checker to confirm availability at your specific address.`,
    },
  ]
  const faqItems = provider.faqItems ?? defaultFaqItems

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${provider.name} Broadband Review 2026`,
    description: `Read our ${provider.name} broadband review, including pricing, speeds, coverage, and support trade-offs.`,
    url: `https://broadbandpicker.co.uk/providers/${provider.slug}`,
    datePublished: provider.reviewedDate,
    dateModified: provider.pricingVerifiedDate,
    author: {
      '@type': 'Organization',
      name: 'BroadbandPicker',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BroadbandPicker',
      url: 'https://broadbandpicker.co.uk',
    },
    about: {
      '@type': 'Service',
      name: `${provider.name} Broadband`,
      provider: {
        '@type': 'Organization',
        name: provider.name,
      },
    },
    citation: provider.reviewSources.map((source) =>
      source.href.startsWith('http')
        ? source.href
        : `https://broadbandpicker.co.uk${source.href}`
    ),
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

  const offerJsonLd = buildProviderOfferJsonLd(provider)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {!isRetired && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }}
        />
      )}

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Provider reviews', href: '/providers' },
          { name: `${provider.name} review`, href: `/providers/${provider.slug}` },
        ]}
      />

      <PostcodeContextBar />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
            {provider.name} Broadband Review
          </h1>
          <p className="text-slate-600">
            {isRetired ? 'Final Brsk range from ' : 'From '}
            <span className="font-semibold text-slate-900">
              £{provider.monthlyPriceFrom.toFixed(2)}/month
            </span>{' '}
            &middot; Up to{' '}
            <span className="font-semibold text-slate-900">{maxSpeed.download} Mbps</span> &middot;{' '}
            <span className="font-semibold text-slate-900">
              {isRetired ? 'Regional' : `${provider.coveragePercent}%`}
            </span>{' '}
            UK coverage
          </p>
        </div>
        <AffiliateCTA
          href={provider.successorUrl ?? provider.affiliateUrl}
          providerName={provider.successorName ?? provider.name}
          label={isRetired ? `See ${provider.successorName} deals →` : `See ${provider.name} deals →`}
          size="lg"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4 pb-6 border-b border-slate-200">
        <span>Reviewed {reviewedDateLabel}</span>
        <span>&middot;</span>
        <span>Prices verified {pricingVerifiedDateLabel}</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>
      <p className="text-xs text-slate-400 mb-6 max-w-2xl">
        We may earn a commission if you click through to{' '}
        {provider.successorName ?? provider.name} and take out a service.
        This does not affect our editorial independence.
      </p>

      {provider.excerpt && (
        <p className="mb-8 border-l-4 border-sky-500 pl-4 text-base leading-relaxed text-slate-700">
          {provider.excerpt}
        </p>
      )}

      {/* Highlights */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 mb-8">
        <h2 className="font-bold text-slate-900 mb-3">Why choose {provider.name}?</h2>
        <ul className="space-y-2">
          {provider.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <svg
                className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0"
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
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Available packages */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        {isRetired ? `Final ${provider.name} Broadband Packages` : `${provider.name} Broadband Packages`}
      </h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 mb-8">
        <table className="w-full min-w-[540px] text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Package</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Download</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Upload</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Type</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {provider.speeds.map((s, i) => (
              <tr key={i} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-medium text-slate-900">
                  {provider.name} {s.download}Mbps
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900">{s.download} Mbps</div>
                  <SpeedBadge download={s.download} className="mt-1" />
                </td>
                <td className="px-4 py-4 text-slate-600">{s.upload} Mbps</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    {s.type}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <AffiliateCTA
                    href={provider.successorUrl ?? provider.affiliateUrl}
                    providerName={provider.successorName ?? provider.name}
                    label={isRetired ? `Check ${provider.successorName}` : undefined}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pros and cons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Pros
          </h3>
          <ul className="space-y-2">
            {provider.pros.map((pro, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">+</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            Cons
          </h3>
          <ul className="space-y-2">
            {provider.cons.map((con, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">&minus;</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: isRetired ? 'Final range from' : 'From',
            value: `£${provider.monthlyPriceFrom.toFixed(2)}/mo`,
          },
          { label: 'Max speed', value: `${maxSpeed.download} Mbps` },
          { label: 'Coverage', value: isRetired ? 'Regional' : `${provider.coveragePercent}%` },
          { label: 'Trustpilot', value: `${provider.trustpilotScore.toFixed(1)}/5` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">How We Assess {provider.name}</h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            This review combines our provider dataset with the methodology published on
            BroadbandPicker. We look at headline price, contract length, speed tiers, setup
            fees, coverage, and service trade-offs rather than just the cheapest headline deal.
          </p>
          <p>
            The evidence inputs for this page are listed below, including the pricing snapshot
            date and customer-sentiment reference we used during review. Trustpilot is treated
            as one input rather than a standalone ranking system.
          </p>
        </div>
      </section>

      {provider.contentSections?.map((section) => (
        <section key={section.heading} className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-3">{section.heading}</h2>
          <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {/* FAQ */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        {provider.name} Broadband: Frequently Asked Questions
      </h2>
      <FAQAccordion items={faqItems} />

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial and Source Notes</h2>
        <p className="mb-4 text-sm text-slate-600">
          These are the main review inputs used for this provider page. They show where package,
          pricing, customer-sentiment, and editorial-methodology references came from at the time
          of review.
        </p>
        <ul className="space-y-2 text-sm">
          {provider.reviewSources.map((source) => (
            <li key={source.href}>
              {source.href.startsWith('http') ? (
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
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{source.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div className="mt-10 p-6 bg-sky-50 border border-sky-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-900 mb-1">
            {isRetired ? `${provider.name} is now ${provider.successorName}` : `Ready to switch to ${provider.name}?`}
          </h2>
          <p className="text-sm text-slate-600">
            Check availability at your address before you sign up.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AffiliateCTA
            href={provider.successorUrl ?? provider.affiliateUrl}
            providerName={provider.successorName ?? provider.name}
            label={isRetired ? `Check ${provider.successorName} deals →` : undefined}
            size="lg"
          />
          <Link
            href="/compare"
            className="px-5 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Compare all providers
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        We may earn a commission when you click an affiliate link. Prices and deals are subject to
        change. Always verify with {provider.successorName ?? provider.name} before signing up.
      </p>
    </div>
  )
}
