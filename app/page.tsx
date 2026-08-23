import type { Metadata } from 'next'
import Link from 'next/link'
import PostcodeChecker from '@/components/PostcodeChecker'
import DealTable from '@/components/DealTable'
import ProviderLogo from '@/components/ProviderLogo'
import NewsletterSignup from '@/components/NewsletterSignup'
import SocialProofCounter from '@/components/SocialProofCounter'
import ScrollReveal from '@/components/ScrollReveal'
import { providers, getTopDeals, providerDatasetUpdatedDate } from '@/data/providers'

export const metadata: Metadata = {
  title: { absolute: 'Compare Broadband Deals for Your Postcode | BroadbandPicker' },
  description:
    'Compare broadband deals from BT, Sky, Virgin Media, EE and more. Enter your postcode to find the cheapest fibre deals available at your address.',
  alternates: { canonical: 'https://broadbandpicker.co.uk' },
  openGraph: {
    title: 'Compare Broadband Deals for Your Postcode | BroadbandPicker',
    description: 'Find the cheapest fibre and full-fibre deals available at your address in seconds.',
    url: 'https://broadbandpicker.co.uk',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BroadbandPicker',
  url: 'https://broadbandpicker.co.uk',
  description: 'Compare broadband deals for your UK postcode',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://broadbandpicker.co.uk/postcode/{search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BroadbandPicker',
  url: 'https://broadbandpicker.co.uk',
  logo: 'https://broadbandpicker.co.uk/logo.png',
  description: 'UK broadband comparison service',
}

const homePageCommercialJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Compare Broadband Deals for Your Postcode',
  description:
    'BroadbandPicker homepage for UK broadband comparison, postcode checking, provider reviews, and deals discovery.',
  url: 'https://broadbandpicker.co.uk',
  dateModified: providerDatasetUpdatedDate,
  citation: [
    'https://broadbandpicker.co.uk/providers',
    'https://broadbandpicker.co.uk/compare',
    'https://broadbandpicker.co.uk/how-we-review-broadband',
    'https://broadbandpicker.co.uk/editorial-policy',
  ],
}

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Enter your postcode',
    description:
      "Type your postcode into the search box above. We'll show every broadband deal available at your address.",
    illustration: '/illustrations/icon-postcode.svg',
  },
  {
    step: '2',
    title: 'Compare deals',
    description:
      'Filter by speed, price, and contract length. Compare broadband packages from every major UK provider side by side.',
    illustration: '/illustrations/icon-compare.svg',
  },
  {
    step: '3',
    title: 'Switch and save',
    description:
      "Click through to your chosen provider and sign up. Switching is simpler than ever — most providers handle everything for you.",
    illustration: '/illustrations/icon-switch.svg',
  },
]

export default function HomePage() {
  const topDeals = getTopDeals(5)
  const verifiedDateLabel = new Date(providerDatasetUpdatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageCommercialJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 py-16 lg:py-24">
        <img
          src="/illustrations/hero-network.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[46%] object-cover object-left opacity-80 lg:block"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            Compare Broadband Deals
            <br className="hidden sm:block" /> for Your Postcode
          </h1>
          <p className="text-sky-200 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Find the cheapest fibre and full-fibre deals available at your address in seconds
          </p>

          <div className="max-w-xl mx-auto">
            <PostcodeChecker size="large" />
          </div>

          <SocialProofCounter />

          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-sky-300">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Comparing {providers.length} providers
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Prices verified regularly
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Affiliate disclosure compliant
            </span>
          </div>
        </div>
      </section>

      {/* Provider logos bar */}
      <section className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">
            Compare deals from Britain&apos;s biggest broadband providers
          </p>
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex min-w-max items-center gap-3 sm:min-w-0 sm:flex-wrap sm:justify-center">
              {providers.map((provider) => (
                <ProviderLogo
                  key={provider.slug}
                  slug={provider.slug}
                  name={provider.name}
                  width={132}
                  height={52}
                  className="shrink-0 rounded-xl shadow-sm"
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-slate-500 sm:hidden">
            Swipe to see all providers
          </p>
          <div className="sr-only">
            {providers.map((provider) => (
              <span key={`${provider.slug}-name`}>{provider.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Today&apos;s Best Broadband Deals
            </h2>
            <p className="text-slate-500 text-sm mt-1">Sorted by price — cheapest first</p>
          </div>
          <Link
            href="/deals"
            className="text-sky-700 font-semibold text-sm hover:underline underline-offset-2"
          >
            See all deals &rarr;
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4 pb-6 border-b border-slate-200">
          <span>Featured deals reviewed {verifiedDateLabel}</span>
          <span>&middot;</span>
          <span>Prices verified {verifiedDateLabel}</span>
          <span>&middot;</span>
          <span>Reviewed by BroadbandPicker editorial team</span>
        </div>

        <DealTable deals={topDeals} showDisclosure={true} compact={false} />

        <p className="text-xs text-slate-500 mt-3">
          Prices verified {verifiedDateLabel}. We may earn a commission when you click a
          &ldquo;Get Deal&rdquo; button.{' '}
          <Link href="/about" className="underline hover:text-slate-700">
            See how we make money.
          </Link>
        </p>
      </section>

      {/* Broadband Match promo */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-950 to-slate-900 py-14">
        <img
          src="/illustrations/blob-sky-green.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 w-[420px] opacity-70"
        />
        <ScrollReveal className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 sm:grid-cols-[1fr_auto] sm:text-left text-center">
            <div>
              <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest">New &middot; Free 60-second tool</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                Not sure what broadband speed you actually need?
              </h2>
              <p className="text-slate-300 mt-3 max-w-xl">
                Answer 6 quick questions about your household and we&apos;ll rank the providers that
                genuinely fit — not just the cheapest headline price.
              </p>
              <Link
                href="/tools/broadband-match"
                className="inline-block mt-6 px-8 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-transform hover:scale-105"
              >
                Find my broadband match &rarr;
              </Link>
            </div>
            <img
              src="/illustrations/quiz-match.svg"
              alt=""
              aria-hidden="true"
              className="mx-auto hidden w-40 sm:block lg:w-52"
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Email alerts */}
      <NewsletterSignup variant="inline" source="homepage" />

      {/* How it works */}
      <section className="relative overflow-hidden bg-white py-14 border-y border-slate-200">
        <img
          src="/illustrations/blob-green-sky.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/2 w-[360px] -translate-y-1/2 opacity-60"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
            How BroadbandPicker Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, index) => (
              <ScrollReveal key={step.step} delayMs={index * 120} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-sky-50 rounded-2xl flex items-center justify-center transition-transform hover:scale-105">
                    <img src={step.illustration} alt="" aria-hidden="true" className="w-16 h-16" />
                  </div>
                </div>
                <div className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-2">
                  Step {step.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SEO editorial block */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Compare Broadband Deals in the UK
        </h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          BroadbandPicker is an independent UK broadband comparison service. We compare deals from
          every major provider, including BT, Sky, Virgin Media, EE, TalkTalk, Vodafone and
          Plusnet, so you can see what&apos;s actually available at your address before you switch
          — standard broadband, superfast fibre, or a full-fibre (FTTP) gigabit connection.
        </p>
        <p className="text-slate-600 leading-relaxed mb-4">
          Switching broadband is one of the easiest ways to cut your household bills. Providers
          routinely price new customers lower than people who have stayed on the same deal for a
          year or two, so it is worth checking what is currently on offer even if you are not
          planning to leave. BroadbandPicker shows you what new customers are being offered right
          now, and our postcode checker tells you exactly which providers serve your area and what
          speeds are available.
        </p>
        <p className="text-slate-600 leading-relaxed mb-8">
          Our featured deals and provider review data are refreshed regularly, with the latest
          pricing snapshot verified on {verifiedDateLabel}. Our comparison covers contract lengths
          from 12 to 24 months, speeds from standard ADSL through to gigabit full-fibre, and
          providers ranging from UK-wide networks to regional full-fibre specialists like
          Hyperoptic, Community Fibre, and Toob. Use our speed guide to understand what broadband
          speed you actually need, then compare deals to find the best broadband provider for your
          household.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/guides/how-to-switch-broadband-uk"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            How to switch broadband &rarr;
          </Link>
          <Link
            href="/guides/broadband-speeds-explained"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Broadband speeds explained &rarr;
          </Link>
          <Link
            href="/guides/cheapest-broadband-uk"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cheapest broadband UK &rarr;
          </Link>
        </div>
      </section>
    </>
  )
}
