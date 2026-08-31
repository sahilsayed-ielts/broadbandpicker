import type { Metadata } from 'next'
import Link from 'next/link'
import { providers } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { JsonLd } from '@/lib/jsonLd'
import { organizationRef, SITE_URL } from '@/lib/siteSchema'

export const metadata: Metadata = {
  title: { absolute: 'About BroadbandPicker — How We Compare Broadband Deals' },
  description:
    'BroadbandPicker is an independent UK broadband comparison service. Learn how we compare deals, how we make money, and our editorial standards.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/about' },
}

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About BroadbandPicker',
  url: `${SITE_URL}/about`,
  description:
    'BroadbandPicker is an independent UK broadband comparison service. Rankings are not sold.',
  about: organizationRef,
  isPartOf: { '@id': `${SITE_URL}/#website` },
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={aboutJsonLd} />
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
          We review commercial information on a scheduled and event-led basis and show a
          verification date where a page relies on a pricing snapshot. Broadband deals change
          frequently, so always verify the current price and terms directly with the provider
          before signing up.
        </p>
        <p>
          Our editorial guides are produced under our published methodology and reviewed when
          relevant pricing, provider terms or regulator guidance changes. We do not accept
          sponsored content or paid-for editorial placements.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-4">Regulatory compliance</h2>
        <p>
          We aim to follow the CAP Code and applicable UK consumer-protection and data-protection
          requirements. Affiliate relationships are disclosed clearly, and advertised speeds,
          prices and availability are presented with their relevant limitations.
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
          <a
            href="https://www.linkedin.com/company/broadband-picker/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
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
