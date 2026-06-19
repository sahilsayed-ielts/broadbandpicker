import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: 'How We Review and Compare Broadband | Our Methodology',
  description:
    'BroadbandPicker uses Ofcom data, live pricing, Trustpilot scores, and customer satisfaction surveys to review UK broadband providers. Here is exactly how we do it.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/how-we-review-broadband' },
  openGraph: {
    title: 'How We Review and Compare Broadband | BroadbandPicker Methodology',
    description:
      'Our full methodology for reviewing broadband providers — data sources, scoring criteria, update frequency, and editorial standards.',
    url: 'https://broadbandpicker.co.uk/how-we-review-broadband',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'How We Review and Compare Broadband',
  description:
    'BroadbandPicker\'s full methodology for reviewing UK broadband providers, including data sources, scoring criteria, and update process.',
  url: 'https://broadbandpicker.co.uk/how-we-review-broadband',
  publisher: {
    '@type': 'Organization',
    name: 'BroadbandPicker',
    url: 'https://broadbandpicker.co.uk',
  },
  dateModified: '2026-06-19',
}

const criteria = [
  {
    label: 'Monthly cost',
    detail:
      'The advertised introductory price and the out-of-contract price — we always show both, because staying out of contract can cost £5–£12 more per month.',
  },
  {
    label: 'Download and upload speed',
    detail:
      'Speeds are taken from provider advertising and cross-referenced against Ofcom\'s Connected Nations speed data. We show the speed at the 50th percentile (the speed at least half of customers receive), not the theoretical maximum.',
  },
  {
    label: 'Contract length',
    detail:
      'We note minimum contract lengths and flag whether rolling monthly options are available. Shorter contracts give flexibility; longer contracts usually mean a lower monthly price.',
  },
  {
    label: 'Setup and installation fees',
    detail:
      'Any upfront cost is shown explicitly — activation fees, engineer visit charges, and router costs. We include these when calculating total-cost-over-term comparisons.',
  },
  {
    label: 'Ofcom complaints rate',
    detail:
      'Ofcom publishes quarterly complaints data per 100,000 customers. We use this as our primary objective measure of customer service quality, updated each quarter.',
  },
  {
    label: 'Customer satisfaction score',
    detail:
      'We use Trustpilot scores for indicative customer sentiment. We cross-reference with Ofcom\'s own consumer experience research, published annually.',
  },
  {
    label: 'Coverage and technology',
    detail:
      'We note whether the service uses FTTC, FTTP (full fibre), cable, or mobile technology, and indicate approximate UK coverage. Availability at a specific address is checked via our postcode tool.',
  },
  {
    label: 'Special features',
    detail:
      'Notable extras such as free security software, Wi-Fi guarantees, gaming-optimised routers, social tariff eligibility, and no-price-rise guarantees are noted and factored into use-case recommendations.',
  },
]

export default function HowWeReviewBroadbandPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'How we review broadband', href: '/how-we-review-broadband' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        How We Review and Compare Broadband
      </h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

      <p className="text-slate-700 leading-relaxed mb-10">
        BroadbandPicker is built on verifiable data, not opinions. Every provider score, ranking,
        and recommendation on this site is derived from publicly available sources — Ofcom reports,
        live provider pricing, and independently published customer satisfaction data. This page
        explains exactly what we measure, where the data comes from, and how frequently we update.
      </p>

      {/* Criteria cards */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">What we measure</h2>
      <p className="text-slate-600 text-sm mb-6">
        We evaluate every provider across eight criteria. Each is described below with its data
        source and rationale.
      </p>

      <div className="space-y-3 mb-10">
        {criteria.map((c, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-100 text-sky-600 font-bold text-sm flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{c.label}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{c.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2">

        <h2>Our data sources</h2>

        <h3>Ofcom Connected Nations reports</h3>
        <p>
          Ofcom publishes its Connected Nations report twice yearly, covering broadband coverage,
          average speeds by technology type and provider, and fixed-line complaints data.
          BroadbandPicker uses this as our primary source for speed and reliability data — it is
          the most methodologically rigorous publicly available source for UK broadband performance.
        </p>

        <h3>Ofcom quarterly complaints data</h3>
        <p>
          Ofcom publishes complaints per 100,000 customers for broadband, landline, mobile, and
          pay-TV every quarter. We use this as our primary measure of provider customer service
          quality because it is objective, consistent, and covers only complaints serious enough
          to be escalated through the provider&apos;s own complaints process.
        </p>

        <h3>Live provider pricing</h3>
        <p>
          Our editorial team checks prices directly against provider websites regularly. All
          prices on BroadbandPicker carry a &ldquo;verified&rdquo; date. If you find a price
          discrepancy, please{' '}
          <Link href="/contact" className="text-sky-600 hover:underline">
            let us know
          </Link>{' '}
          — we take accuracy seriously and will correct errors within one working day.
        </p>

        <h3>Trustpilot</h3>
        <p>
          We use Trustpilot scores as an indicative measure of customer sentiment. We are aware
          that Trustpilot scores can be influenced by provider-led review campaigns and are
          therefore a secondary indicator rather than a primary score. We cross-reference
          Trustpilot ratings with Ofcom complaints data, which is more difficult to manipulate.
        </p>

        <h2>How we write provider reviews</h2>
        <p>
          Provider reviews on BroadbandPicker follow a consistent structure: an overview of
          the provider and their network, a summary of current packages and pricing, an
          assessment of speed and reliability based on Ofcom data, a customer service
          assessment based on Ofcom complaints and Trustpilot, and an overall verdict.
        </p>
        <p>
          Reviews include negative information where it is accurate and material — for
          example, high Ofcom complaint rates, known network outage patterns, or significant
          gaps between introductory and out-of-contract pricing. We do not remove or soften
          negative content at a provider&apos;s request.
        </p>

        <h2>How we write use-case guides</h2>
        <p>
          Guides such as &ldquo;best broadband for gaming&rdquo; or &ldquo;best broadband for
          working from home&rdquo; recommend specific providers based on the criteria most
          relevant to that use case. For gaming, latency and reliability weigh heavily. For
          working from home, upload speed and service reliability are prioritised.
        </p>
        <p>
          Where a guide makes a specific provider recommendation, that recommendation is based
          on the criteria described above — not on the commission rate we receive from that
          provider.
        </p>

        <h2>Update frequency</h2>
        <div className="overflow-x-auto not-prose">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Content type</th>
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Update frequency</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Comparison table deal prices', 'Monthly (first week of each month)'],
                ['Provider reviews — pricing section', 'Monthly'],
                ['Provider reviews — scores and complaints', 'Quarterly (when Ofcom data is published)'],
                ['Guides and how-to articles', 'When significant changes occur (price rises, regulation changes, new providers)'],
                ['Broadband glossary', 'Reviewed annually'],
              ].map(([type, freq]) => (
                <tr key={type}>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">{type}</td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-600">{freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>What we do not do</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>We do not accept payment for positive reviews or higher rankings.</li>
          <li>We do not publish sponsored content presented as independent editorial.</li>
          <li>We do not inflate speed claims beyond what providers and Ofcom publish.</li>
          <li>We do not remove or downplay accurate negative information about a provider at their request.</li>
          <li>We do not compare providers using only our affiliated partners — we list all major UK broadband providers.</li>
        </ul>

        <h2>Corrections and feedback</h2>
        <p>
          We make every effort to ensure our content is accurate, but errors do occur —
          especially given the frequency with which broadband prices and packages change. If you
          find an error or outdated information, please{' '}
          <Link href="/contact" className="text-sky-600 hover:underline">
            contact us
          </Link>
          . We investigate all reported errors and publish corrections promptly.
        </p>

      </div>

      {/* Related links */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/how-we-make-money"
          className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
        >
          <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">
            How we make money
          </h3>
          <p className="text-xs text-slate-500">Full disclosure of our affiliate relationships and commercial model.</p>
        </Link>
        <Link
          href="/editorial-policy"
          className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
        >
          <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">
            Editorial policy
          </h3>
          <p className="text-xs text-slate-500">Our independence standards and publishing guidelines.</p>
        </Link>
      </div>
    </div>
  )
}
