import type { Metadata } from 'next'
import Link from 'next/link'
import { providers } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: 'About BroadbandPicker — How We Compare Broadband Deals',
  description:
    'BroadbandPicker is an independent UK broadband comparison service. Learn how we compare deals, how we make money, and our editorial standards.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/about' },
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">About BroadbandPicker</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
        <p>
          BroadbandPicker is an independent UK broadband comparison service. We help consumers
          find and compare broadband deals from every major provider — so you can make an informed
          decision without spending hours researching individual provider websites.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-4">What we do</h2>
        <p>
          We compare broadband packages from {providers.length} UK providers, including BT, Sky,
          Virgin Media, EE, TalkTalk, Vodafone, Plusnet, NOW Broadband, Hyperoptic, Zen Internet,
          Community Fibre, and Toob. Our comparison covers price, speed, contract length, setup
          fees, coverage, and customer satisfaction ratings.
        </p>
        <p>
          We also publish in-depth provider reviews and broadband guides to help you understand
          the market and make the best choice for your household.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-4">How we make money</h2>
        <p>
          BroadbandPicker is a free service. We earn revenue through affiliate commissions —
          when you click a &ldquo;Get Deal&rdquo; button on our site and sign up with a provider,
          we receive a fee from that provider. This is a standard practice among comparison websites
          and is how we fund our editorial team.
        </p>
        <p>
          <strong>Affiliate relationships do not influence our editorial content.</strong> We do
          not accept payments to rank providers higher in our comparison tables. Our rankings are
          based on objective criteria: price, speed, coverage, setup fees, and independently
          sourced customer satisfaction data.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-4">Editorial standards</h2>
        <p>
          We update our deals data daily to ensure the prices and packages shown are as accurate
          as possible. However, broadband deals change frequently — always verify the current
          price and terms directly with the provider before signing up.
        </p>
        <p>
          Our editorial guides are written by our in-house team and reviewed regularly for
          accuracy. We do not accept sponsored content or paid-for editorial placements.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-4">Regulatory compliance</h2>
        <p>
          BroadbandPicker complies with the ASA&apos;s CAP Code requirements for comparison
          websites and follows Ofcom&apos;s guidelines for broadband speed advertising. All affiliate
          relationships are disclosed in accordance with FCA and CMA requirements.
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-sky-500 text-white font-semibold rounded-lg text-sm hover:bg-sky-600 transition-colors"
          >
            Contact us
          </Link>
          <a
            href="https://x.com/broadbandPicker"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @broadbandPicker
          </a>
          <Link
            href="/privacy-policy"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Privacy policy
          </Link>
          <Link
            href="/terms"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Terms of use
          </Link>
        </div>
      </div>
    </div>
  )
}
