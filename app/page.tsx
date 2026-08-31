import type { Metadata } from 'next'
import Link from 'next/link'
import PostcodeChecker from '@/components/PostcodeChecker'
import ReturningVisitorBanner from '@/components/ReturningVisitorBanner'
import DealTable from '@/components/DealTable'
import NewsletterSignup from '@/components/NewsletterSignup'
import HomepageLogoRail from '@/components/HomepageLogoRail'
import SocialProofCounter from '@/components/SocialProofCounter'
import ScrollReveal from '@/components/ScrollReveal'
import FAQAccordion from '@/components/FAQAccordion'
import HomepageSpeedNeed from '@/components/HomepageSpeedNeed'
import { providers, getTopDeals, providerDatasetUpdatedDate } from '@/data/providers'
import { JsonLd } from '@/lib/jsonLd'
import { HOMEPAGE_UPDATED, organizationRef, websiteRef } from '@/lib/siteSchema'
import { buildDealListJsonLd } from '@/lib/dealSchema'

export const metadata: Metadata = {
  title: { absolute: 'Compare Broadband Deals UK | BroadbandPicker' },
  description:
    'Compare UK broadband deals by postcode. Free checker for fibre and full-fibre packages from BT, Sky, Virgin Media, EE and more. Rankings are not sold.',
  alternates: { canonical: 'https://broadbandpicker.co.uk' },
  openGraph: {
    title: 'Compare Broadband Deals UK | BroadbandPicker',
    description: 'Find the cheapest fibre and full-fibre deals available at your address in seconds.',
    url: 'https://broadbandpicker.co.uk',
    siteName: 'BroadbandPicker',
    locale: 'en_GB',
    type: 'website',
  },
}

const homePageCommercialJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Compare Broadband Deals for Your Postcode',
  description:
    'BroadbandPicker homepage for UK broadband comparison, postcode checking, provider reviews, and deals discovery.',
  url: 'https://broadbandpicker.co.uk',
  isPartOf: websiteRef,
  about: organizationRef,
  dateModified: HOMEPAGE_UPDATED > providerDatasetUpdatedDate ? HOMEPAGE_UPDATED : providerDatasetUpdatedDate,
  citation: [
    'https://broadbandpicker.co.uk/providers',
    'https://broadbandpicker.co.uk/compare',
    'https://broadbandpicker.co.uk/how-we-review-broadband',
    'https://broadbandpicker.co.uk/editorial-policy',
  ],
}

const HOME_FAQS = [
  {
    question: 'How do I compare broadband deals in the UK?',
    answer:
      'Enter your postcode. Availability, speed and price change street by street, so a national from-price is guesswork. BroadbandPicker lists the packages that can actually serve that address, then you compare monthly cost, contract length, setup fees and typical speed before you switch.',
  },
  {
    question: 'Is BroadbandPicker free to use?',
    answer:
      'Yes. The comparison is free. We may earn an affiliate commission if you click through and sign up with a provider. That fee does not change the order of the table. We still list providers we do not earn from. The full explanation is on How we make money.',
  },
  {
    question: 'Why do broadband deals depend on my postcode?',
    answer:
      'Different networks built different streets. Openreach, Virgin Media, CityFibre and smaller full-fibre builders do not cover the same homes. Two neighbours can see different speeds and different prices. Check the address, not the TV advert.',
  },
  {
    question: 'What broadband speed do I actually need?',
    answer:
      'One or two people browsing and watching HD are usually fine on a few dozen Mbps. A family that works from home and streams in 4K needs more, especially on the upload. Gaming cares more about ping than a vanity gigabit number. Use the household cards on this page or the Broadband Match quiz if you want a tailored range.',
  },
  {
    question: 'What is the difference between fibre and full fibre?',
    answer:
      "A lot of UK 'fibre' is fibre to a street cabinet and copper for the last stretch (FTTC). Full fibre, or FTTP, runs glass all the way to the premises. Full fibre is faster on the upload and more consistent at 7pm. If the listing does not say full fibre or FTTP, assume it may still involve copper.",
  },
  {
    question: 'How does switching broadband work now?',
    answer:
      'One Touch Switch, live since 12 September 2024, means the new provider handles the move and you stay online during the cutover in the usual case. You still need to check early-termination fees if you are in contract. Ofcom reports more than two million residential switches completed under the process.',
  },
  {
    question: 'Are there cheaper broadband tariffs if I claim benefits?',
    answer:
      'Yes. Social tariffs from participating providers sit roughly in the £12.50 to £24 a month range if you qualify, for example Universal Credit or Pension Credit. Ofcom has found that most eligible households still have not heard of them. We publish a plain-English guide rather than burying this in a PDF.',
  },
  {
    question: 'Does staying loyal get me a better broadband price?',
    answer:
      'Usually the opposite. Introductory prices end, and many households keep paying the higher out-of-contract rate. New-customer deals on the same network are often cheaper. Check your contract end date, then compare what is on offer at your postcode before you assume loyalty is being rewarded.',
  },
]

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
      'Click through to your chosen provider and sign up. Switching is simpler than it used to be. With One Touch Switch, the new provider usually handles the move.',
    illustration: '/illustrations/icon-switch.svg',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to compare broadband deals in the UK',
  description:
    'Enter your postcode, compare packages that can serve that address, then switch. One Touch Switch is designed so the new provider handles the move.',
  step: HOW_IT_WORKS.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.title,
    text: step.description,
  })),
}

export default function HomePage() {
  const topDeals = getTopDeals(5)
  const verifiedDateLabel = new Date(providerDatasetUpdatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const featuredDealListJsonLd = buildDealListJsonLd(topDeals, "Today's best UK broadband deals")
  return (
    <>
      <link rel="preload" href="/illustrations/hero-network.svg" as="image" />
      <JsonLd data={homePageCommercialJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={howToJsonLd} />
      <JsonLd data={featuredDealListJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 py-16 lg:py-24">
        <img
          src="/illustrations/hero-network.svg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
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

          <ReturningVisitorBanner />

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

      <HomepageLogoRail providers={providers} />

      {/* Featured deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Today&apos;s Best Broadband Deals
            </h2>
            <p className="text-slate-500 text-sm mt-1">Sorted by price, cheapest first. Check your postcode before you treat any row as available.</p>
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
                genuinely fit, not just the cheapest headline price.
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

      {/* Speed need */}
      <section className="relative overflow-hidden bg-slate-50 py-14 border-b border-slate-200">
        <img
          src="/illustrations/blob-sky-green.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-28 bottom-0 w-[320px] opacity-50"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <img src="/illustrations/icon-speed.svg" alt="" aria-hidden="true" className="h-14 w-14" />
                <p className="text-xs font-bold uppercase tracking-widest text-sky-700">What speed do you actually need?</p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Gigabit is optional. The right line is not.
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                You do not need a gigabit to email a solicitor. Pick the household that looks like yours.
                Typical ranges, not a fake perfect Mbps. Then check the postcode, because none of this
                exists if the network does not reach the door.
              </p>
            </div>
          </div>
          <HomepageSpeedNeed />
        </div>
      </section>

      {/* Rights / loyalty */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">What changed while you were paying the old price</h2>
        <p className="text-slate-600 max-w-3xl mb-8 leading-relaxed">
          UK broadband still looks like a maze on purpose. Three facts are worth knowing before you
          open another provider tab.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          <ScrollReveal className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <img src="/illustrations/icon-bill.svg" alt="" aria-hidden="true" className="h-14 w-14 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Loyalty is usually a worse price</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Introductory deals end. Plenty of households keep paying the out-of-contract rate while
              new customers on the same network pay less. Compare before you assume staying is cheaper.
            </p>
            <Link href="/deals" className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline">
              See current deals
            </Link>
          </ScrollReveal>
          <ScrollReveal delayMs={80} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <img src="/illustrations/icon-ots.svg" alt="" aria-hidden="true" className="h-14 w-14 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">One Touch Switch is real</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Since 12 September 2024 the new provider handles the switch. Ofcom says more than two
              million residential switches have completed. You still check exit fees if you are in contract.
            </p>
            <Link href="/guides/how-to-switch-broadband-uk" className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline">
              How switching works
            </Link>
          </ScrollReveal>
          <ScrollReveal delayMs={160} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <img src="/illustrations/icon-postcode.svg" alt="" aria-hidden="true" className="h-14 w-14 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Social tariffs exist</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              If you qualify for certain benefits, cheaper social tariffs sit roughly at £12.50 to £24 a
              month. Ofcom has found most eligible households have never heard of them. That is a scandal
              with a PDF, not a niche deal.
            </p>
            <Link href="/guides/broadband-social-tariffs-uk" className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline">
              Social tariffs explained
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* SEO editorial block */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Compare Broadband Deals in the UK
        </h2>
        <p className="text-lg text-slate-800 leading-relaxed mb-6 rounded-2xl bg-sky-50 border border-sky-100 px-5 py-4">
          BroadbandPicker is a free UK comparison site. You enter a postcode, we show the broadband
          deals that can actually serve that address, and you pick a package by price, speed and
          contract. We may earn a commission if you sign up. That does not buy a higher rank.
          Availability is always by address, never by a national advert.
        </p>
        <h3 className="text-xl font-bold text-slate-900 mt-10 mb-3">Why the postcode comes first</h3>
        <p className="text-slate-600 leading-relaxed mb-4">
          Switching broadband is one of the easier ways to cut a household bill, but only if the
          deal can actually land on your street. Openreach, Virgin Media, CityFibre and smaller
          full-fibre builders did not wire the country evenly. Two houses on the same road can see
          different speeds and different prices. A national &ldquo;from £19&rdquo; is fan fiction until
          you check the address.
        </p>
        <p className="text-slate-600 leading-relaxed mb-4">
          We compare {providers.length} UK providers, from BT, Sky, Virgin Media, EE, TalkTalk,
          Vodafone and Plusnet through to regional full-fibre names such as Hyperoptic, Community
          Fibre and Toob. The table covers monthly price, typical speed, contract length and setup
          fees. Rankings are not sold. The methodology sits on{' '}
          <Link href="/how-we-review-broadband" className="underline hover:text-slate-800">
            how we review broadband
          </Link>
          .
        </p>

        <h3 className="text-xl font-bold text-slate-900 mt-10 mb-3">Fibre versus full fibre</h3>
        <p className="text-slate-600 leading-relaxed mb-4">
          A lot of UK advertising still says fibre when the last stretch is copper from a cabinet
          (FTTC). Full fibre, or FTTP, is glass all the way to the premises. It is usually faster on
          the upload and less likely to fall apart at 7pm when the street is streaming. If a package
          does not say full fibre or FTTP, assume copper may still be in the mix. The longer
          explainer is in{' '}
          <Link href="/guides/fttp-vs-fttc-explained" className="underline hover:text-slate-800">
            FTTP vs FTTC
          </Link>{' '}
          and{' '}
          <Link href="/guides/full-fibre-broadband-explained" className="underline hover:text-slate-800">
            full fibre broadband explained
          </Link>
          .
        </p>

        <h3 className="text-xl font-bold text-slate-900 mt-10 mb-3">How we make money, without the waffle</h3>
        <p className="text-slate-600 leading-relaxed mb-4">
          The site is free. If you click a Get Deal button and sign up, we may earn an affiliate
          commission. That is a standard comparison-site model. It does not buy a higher rank, and
          we still list providers we do not earn from. Featured deals on this page are a snapshot,
          verified {verifiedDateLabel}. Always confirm the live price with the provider before you
          commit. Detail:{' '}
          <Link href="/how-we-make-money" className="underline hover:text-slate-800">
            how we make money
          </Link>
          .
        </p>
        <p className="text-slate-600 leading-relaxed mb-8">
          Contracts here run from rolling monthly to 24 months. Speeds run from leftover ADSL
          through to gigabit full fibre. If you already know the job (cheapest line, student house,
          rural, TV bundle), jump to the matching guide. If you do not, start with the postcode box
          at the top. That is the only comparison that is honest.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            href="/guides/how-to-switch-broadband-uk"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            How to switch broadband
          </Link>
          <Link
            href="/guides/broadband-speeds-explained"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Broadband speeds explained
          </Link>
          <Link
            href="/guides/cheapest-broadband-uk"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cheapest broadband UK
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Compare providers
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">Broadband comparison, asked plainly</h2>
        <FAQAccordion items={HOME_FAQS} />
      </section>
    </>
  )
}
