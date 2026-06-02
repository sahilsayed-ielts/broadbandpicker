import type { Metadata } from 'next'
import Link from 'next/link'
import PostcodeChecker from '@/components/PostcodeChecker'
import DealTable from '@/components/DealTable'
import ProviderLogo from '@/components/ProviderLogo'
import { providers, getTopDeals } from '@/data/providers'

export const metadata: Metadata = {
  title: 'Compare Broadband Deals for Your Postcode | BroadbandPicker',
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

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Enter your postcode',
    description:
      "Type your postcode into the search box above. We'll show every broadband deal available at your address.",
    icon: (
      <svg
        className="w-8 h-8 text-sky-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
  {
    step: '2',
    title: 'Compare deals',
    description:
      'Filter by speed, price, and contract length. Compare broadband packages from every major UK provider side by side.',
    icon: (
      <svg
        className="w-8 h-8 text-sky-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
        />
      </svg>
    ),
  },
  {
    step: '3',
    title: 'Switch and save',
    description:
      "Click through to your chosen provider and sign up. Switching is simpler than ever — most providers handle everything for you.",
    icon: (
      <svg
        className="w-8 h-8 text-sky-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
        />
      </svg>
    ),
  },
]

export default function HomePage() {
  const topDeals = getTopDeals(5)
  const updatedDate = new Date().toLocaleDateString('en-GB', {
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-sky-300">
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
              Updated daily
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

        <DealTable deals={topDeals} showDisclosure={true} compact={false} />

        <p className="text-xs text-slate-500 mt-3">
          Prices correct as of {updatedDate}. We may earn a commission when you click a
          &ldquo;Get Deal&rdquo; button.{' '}
          <Link href="/about" className="underline hover:text-slate-700">
            See how we make money.
          </Link>
        </p>
      </section>

      {/* How it works */}
      <section className="bg-white py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
            How BroadbandPicker Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                <div className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-2">
                  Step {step.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </div>
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
          BroadbandPicker is an independent UK broadband comparison service. We compare broadband
          deals from every major provider — including BT, Sky, Virgin Media, EE, TalkTalk,
          Vodafone, Plusnet, and more — to help you find the best broadband deal for your home.
          Whether you&apos;re looking for the cheapest standard broadband, superfast fibre, or a
          full-fibre (FTTP) gigabit connection, our free comparison tool makes it easy to see
          what&apos;s available at your address.
        </p>
        <p className="text-slate-600 leading-relaxed mb-4">
          Switching broadband is one of the easiest ways to save money on your household bills.
          The average UK household overpays for broadband by £180 a year simply by staying on an
          out-of-contract deal. BroadbandPicker shows you what new customers are being offered
          right now, so you can switch and start saving immediately. Our postcode checker tells you
          exactly which providers serve your area and what speeds are available.
        </p>
        <p className="text-slate-600 leading-relaxed mb-8">
          We update our deals data daily to ensure the prices and packages shown are accurate. Our
          comparison covers contract lengths from 12 to 24 months, speeds from standard ADSL
          through to gigabit full-fibre, and providers ranging from UK-wide networks to regional
          full-fibre specialists like Hyperoptic, Community Fibre, and Toob. Use our speed guide
          to understand what broadband speed you actually need, then compare deals to find the best
          broadband provider for your household.
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
