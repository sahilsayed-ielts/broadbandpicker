import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { JsonLd } from '@/lib/jsonLd'
import { organizationRef } from '@/lib/siteSchema'

export const metadata: Metadata = {
  title: 'How BroadbandPicker Makes Money | Commercial Disclosure',
  description:
    'BroadbandPicker earns affiliate commissions when you sign up through our links. Our editorial rankings are never influenced by commercial relationships — here is how it works.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/how-we-make-money' },
  openGraph: {
    title: 'How BroadbandPicker Makes Money | Commercial Disclosure',
    description:
      'Full transparency on how we earn revenue, how affiliate commissions work, and why our editorial independence is never compromised.',
    url: 'https://broadbandpicker.co.uk/how-we-make-money',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'How BroadbandPicker Makes Money',
  description:
    'Full disclosure of how BroadbandPicker earns affiliate revenue and maintains editorial independence.',
  url: 'https://broadbandpicker.co.uk/how-we-make-money',
  publisher: organizationRef,
  about: organizationRef,
  dateModified: '2026-06-19',
}

export default function HowWeMakeMoneyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={jsonLd} />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'How we make money', href: '/how-we-make-money' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">How BroadbandPicker Makes Money</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

      {/* Summary box */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-10">
        <h2 className="font-bold text-slate-900 mb-3 text-base">The short version</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-sky-500 font-bold mt-0.5">✓</span>
            <span>We earn a commission when you click a provider link and sign up for broadband.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sky-500 font-bold mt-0.5">✓</span>
            <span>Commission rates <strong>never influence</strong> which providers we show or how we rank them.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sky-500 font-bold mt-0.5">✓</span>
            <span>We list providers regardless of whether we have a commercial relationship with them.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sky-500 font-bold mt-0.5">✓</span>
            <span>The prices you see are the same prices available directly from the provider.</span>
          </li>
        </ul>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2">

        <h2>How affiliate commissions work</h2>
        <p>
          BroadbandPicker is a free service for consumers. We do not charge you anything to use
          our comparison tools, read our guides, or check deals at your postcode.
        </p>
        <p>
          We fund the site through <strong>affiliate commissions</strong>. When you click a
          &ldquo;Get Deal&rdquo; button and subsequently sign up with a broadband provider, that
          provider pays us a referral fee. This is a standard commercial arrangement used across
          the UK comparison industry — Uswitch, MoneySuperMarket, and MoneySavingExpert all
          operate the same model.
        </p>
        <p>
          The commission is paid entirely by the provider. It does not add anything to the price
          you pay. The monthly cost shown on BroadbandPicker is identical to the price you would
          see if you went directly to the provider&apos;s website.
        </p>

        <h2>Editorial independence</h2>
        <p>
          The existence of a commercial relationship with a provider does not — and cannot —
          influence our editorial rankings, review scores, or recommendations.
        </p>
        <p>Our comparison tables are ordered by criteria you select — price, speed, or value. Our editorial
          recommendations in guides and reviews are based on objective data: verified pricing,
          Ofcom speed and reliability data, Ofcom quarterly complaints data, and independently
          sourced customer satisfaction ratings. No provider can purchase a higher ranking or a
          more favourable review on BroadbandPicker.</p>

        <h3>What we do not accept</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Payment for editorial coverage or positive reviews</li>
          <li>Sponsored content presented as independent editorial</li>
          <li>Payment to rank a provider higher in a comparison table</li>
          <li>Requests from advertisers to remove negative information from reviews</li>
        </ul>
        <p>
          If a provider has a high Ofcom complaint rate, we say so. If a provider&apos;s
          out-of-contract price is significantly higher than the introductory rate, we flag it.
          Our editorial team writes reviews based on evidence, not on the size of the commission
          we receive.
        </p>

        <h2>Which providers we cover</h2>
        <p>
          We compare broadband deals from every major UK provider, including BT, Sky, Virgin Media,
          EE, TalkTalk, Vodafone, Plusnet, NOW Broadband, Hyperoptic, Zen Internet, Community
          Fibre, and Toob. We also list specialist and regional providers where available.
        </p>
        <p>
          We include providers on our comparison tool regardless of whether we have an active
          affiliate relationship with them. Where a provider does not have an affiliate programme,
          we still list their deals and link directly to their website without a tracking link.
        </p>

        <h2>Price accuracy</h2>
        <p>
          All prices shown on BroadbandPicker are verified directly against provider websites.
          Broadband deals change frequently — we update our deal data regularly, but you should
          always verify the current price and contract terms directly with the provider before
          signing up.
        </p>
        <p>
          Every article that contains pricing information carries a &ldquo;Prices verified&rdquo;
          date. If you find an inaccurate price or out-of-date deal, please{' '}
          <Link href="/contact" className="text-sky-600 hover:underline">
            contact us
          </Link>{' '}
          and we will update it promptly.
        </p>

        <h2>Regulatory compliance</h2>
        <p>
          All affiliate relationships on BroadbandPicker are disclosed in line with UK Advertising
          Standards Authority (ASA) and Competition and Markets Authority (CMA) requirements. Where
          a link is commercially incentivised, it is identifiable as such — either via the
          &ldquo;Get Deal&rdquo; button label or via the disclosure notice in the page footer.
        </p>
        <p>
          BroadbandPicker operates in accordance with the ASA&apos;s CAP Code for digital
          comparison tools and Ofcom&apos;s guidelines on broadband speed advertising. We do not
          make claims about provider speeds that exceed those published by Ofcom or the providers
          themselves.
        </p>
        <p>
          BroadbandPicker participates in the Awin affiliate network. Awin operates a public
          resource explaining how affiliate marketing works and how free online content is
          commercially supported:{' '}
          <a
            href="https://www.awin.com/gb/consumers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 hover:underline"
          >
            Awin consumer information
          </a>
          .
        </p>

        <h2>Questions about our commercial relationships</h2>
        <p>
          If you have a question about whether a specific deal, ranking, or recommendation on our
          site involves a commercial relationship, please{' '}
          <Link href="/contact" className="text-sky-600 hover:underline">
            get in touch
          </Link>
          . We will respond within two working days.
        </p>

      </div>

      {/* Related links */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/how-we-review-broadband"
          className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
        >
          <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">
            How we review broadband
          </h3>
          <p className="text-xs text-slate-500">Our data sources, scoring methodology, and editorial process.</p>
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
