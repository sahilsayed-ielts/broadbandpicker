import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: 'Editorial Policy | BroadbandPicker',
  description:
    'BroadbandPicker\'s editorial policy — our independence standards, how content is produced, and how commercial relationships are kept separate from editorial decisions.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/editorial-policy' },
  openGraph: {
    title: 'Editorial Policy | BroadbandPicker',
    description:
      'Our editorial independence standards, content production process, and approach to commercial relationships.',
    url: 'https://broadbandpicker.co.uk/editorial-policy',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Editorial Policy — BroadbandPicker',
  description:
    'BroadbandPicker\'s editorial independence standards, content process, and commercial relationship policy.',
  url: 'https://broadbandpicker.co.uk/editorial-policy',
  publisher: {
    '@type': 'Organization',
    name: 'BroadbandPicker',
    url: 'https://broadbandpicker.co.uk',
  },
  dateModified: '2026-06-19',
}

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Editorial policy', href: '/editorial-policy' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Editorial Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

      <p className="text-slate-700 leading-relaxed mb-10">
        BroadbandPicker exists to help UK households make informed decisions about broadband.
        This page sets out the principles that govern how we produce content, how we handle
        commercial relationships, and how we maintain independence from the providers we write
        about.
      </p>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2">

        <h2>Our mission</h2>
        <p>
          BroadbandPicker&apos;s purpose is to give every UK household the information they need
          to find the right broadband deal — regardless of income, technical knowledge, or
          location. We do this through independent comparison tools, honest provider reviews, and
          practical guides that explain broadband clearly.
        </p>
        <p>
          We measure success not just by clicks and conversions, but by whether the person who
          read our guide made a better decision because of it.
        </p>

        <h2>Editorial independence</h2>
        <p>
          BroadbandPicker earns revenue through affiliate commissions (see{' '}
          <Link href="/how-we-make-money" className="text-sky-600 hover:underline">
            How we make money
          </Link>
          ). This commercial model supports the site but does not direct it. The editorial
          team operates independently of commercial relationships. No provider can purchase a
          review, influence a ranking, or remove accurate negative information from our
          content.
        </p>
        <p>
          The clearest expression of this policy: we publish Ofcom complaints data for every
          provider we cover. If a provider has consistently high complaints, we say so —
          regardless of the commission that provider pays us.
        </p>

        <h2>Accuracy and evidence</h2>
        <p>
          Every factual claim on BroadbandPicker should be traceable to a verifiable source:
          an Ofcom report, a provider&apos;s published pricing page, Trustpilot, or a
          recognised consumer research publication.
        </p>
        <p>
          We do not publish claims about broadband speeds that exceed those published by Ofcom
          or the provider. We do not speculate about provider performance without data to
          support it. Where data is limited or contested, we say so.
        </p>

        <h3>Pricing accuracy</h3>
        <p>
          All prices are verified directly against provider websites before publication.
          Because broadband prices change frequently, every article or comparison table that
          contains pricing carries a verification date. Readers are always advised to confirm
          current pricing with the provider before signing up.
        </p>

        <h2>Content production</h2>

        <h3>Guides and reviews</h3>
        <p>
          BroadbandPicker guides are written to give readers the information they need to make
          a decision — not to steer them towards the deal with the highest commission. Where we
          recommend a specific provider or product, that recommendation reflects the data.
          Where the data is ambiguous, we explain the trade-offs rather than picking a winner
          arbitrarily.
        </p>

        <h3>Timeliness</h3>
        <p>
          Broadband deals and provider performance change. Content is reviewed when significant
          changes occur — price rises, new Ofcom data publications, regulatory changes, or
          major shifts in provider availability. Every page carries a &ldquo;last
          updated&rdquo; date. If a page has not been updated recently, that date will tell
          you.
        </p>

        <h3>Corrections</h3>
        <p>
          When we make an error — factual, editorial, or typographical — we correct it
          promptly and without concealment. We do not delete corrections; we note what changed
          and when. If you find an error, please{' '}
          <Link href="/contact" className="text-sky-600 hover:underline">
            contact us
          </Link>
          .
        </p>

        <h2>Commercial relationships</h2>
        <p>
          BroadbandPicker works with providers through the Awin affiliate network. We also
          include providers that do not have an active affiliate relationship with us — in
          those cases, we link to the provider&apos;s website directly, without a commercial
          tracking link.
        </p>
        <p>
          We do not accept:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Payment for editorial coverage or positive reviews</li>
          <li>Sponsored content presented as independent editorial</li>
          <li>Provider requests to rank their products higher in comparison tables</li>
          <li>Provider requests to remove or amend accurate negative information</li>
          <li>Guest articles from providers or their PR agencies presented as BroadbandPicker editorial</li>
        </ul>

        <h2>Consumer first</h2>
        <p>
          When there is a tension between what is commercially optimal and what is best for
          the reader, we default to the reader. This means recommending short-term rolling
          contracts when they suit a reader&apos;s circumstances, flagging out-of-contract
          price traps, and actively publishing information about social tariffs even though
          those deals typically generate lower commissions.
        </p>
        <p>
          We believe that a site that genuinely helps consumers will, in the long run, build
          the trust that makes it commercially successful. Short-term commercial optimisation
          at the expense of editorial integrity is not something we pursue.
        </p>

        <h2>Feedback and complaints</h2>
        <p>
          We welcome feedback on our editorial content. If you believe we have published
          something inaccurate, unfair, or in breach of this policy, please{' '}
          <Link href="/contact" className="text-sky-600 hover:underline">
            contact us
          </Link>
          . We will respond within two working days.
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
          <p className="text-xs text-slate-500">Full disclosure of affiliate relationships and commercial model.</p>
        </Link>
        <Link
          href="/how-we-review-broadband"
          className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
        >
          <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">
            How we review broadband
          </h3>
          <p className="text-xs text-slate-500">Data sources, scoring methodology, and review process.</p>
        </Link>
      </div>
    </div>
  )
}
