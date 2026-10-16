import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import NewsletterSignup from '@/components/NewsletterSignup'
import OnThisPageNav from '@/components/OnThisPageNav'
import PageHeroBanner from '@/components/PageHeroBanner'
import { priorityPages, type PriorityPageKey } from '@/data/priority-pages'
import { JsonLd } from '@/lib/jsonLd'
import { editorialAuthor, LOGO_URL, publisherOrganization } from '@/lib/siteSchema'
import { slugify } from '@/lib/extractHeadings'
import { DEFAULT_GUIDE_CTAS, categoryHero, hubHero, type PageHeroConfig } from '@/lib/pageHero'

const BASE = 'https://broadbandpicker.co.uk'

function priorityHero(pageKey: PriorityPageKey): PageHeroConfig {
  if (pageKey === 'business' || pageKey === 'phone') return categoryHero('deals-and-pricing')
  if (pageKey === 'satellite') return categoryHero('technology-and-speeds')
  if (pageKey === 'satisfaction' || pageKey === 'serviceRankings') return categoryHero('providers-and-comparisons')
  if (pageKey === 'btDeals' || pageKey === 'skyDeals' || pageKey === 'eeDeals' || pageKey === 'virginDeals') {
    return categoryHero('deals-and-pricing')
  }
  return hubHero()
}

export function priorityMetadata(key: PriorityPageKey): Metadata {
  const page = priorityPages[key]
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `${BASE}${page.path}` },
    authors: [{ name: 'BroadbandPicker editorial team', url: `${BASE}/about` }],
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `${BASE}${page.path}`, type: 'article', modifiedTime: page.updated },
  }
}

export default function PrioritySeoPage({ pageKey }: { pageKey: PriorityPageKey }) {
  const page = priorityPages[pageKey]
  const reviewedDate = new Date(`${page.updated}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const onThisPageLinks = [
    ...(page.table ? [{ href: '#comparison', label: page.table.title }] : []),
    ...page.sections.map((section) => ({ href: `#${slugify(section.heading)}`, label: section.heading })),
    { href: '#faqs', label: 'FAQs' },
    { href: '#sources', label: 'Sources' },
  ]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': page.schemaType,
        '@id': `${BASE}${page.path}#main`,
        name: page.title,
        // Article rich results need headline, image and datePublished.
        ...(page.schemaType === 'Article'
          ? { headline: page.title, image: LOGO_URL, datePublished: page.published ?? page.updated }
          : {}),
        description: page.metaDescription,
        url: `${BASE}${page.path}`,
        dateModified: page.updated,
        author: editorialAuthor,
        publisher: publisherOrganization,
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
      },
      ...(page.path.startsWith('/postcode/')
        ? [
            {
              '@type': 'AdministrativeArea',
              name: page.title,
              containedInPlace: { '@type': 'Country', name: 'United Kingdom' },
              url: `${BASE}${page.path}`,
            },
          ]
        : []),
    ],
  }

  const hero = priorityHero(pageKey)

  return (
    <main className="bg-white">
      <JsonLd data={jsonLd} />
      <PageHeroBanner
        title={page.title}
        kicker={page.eyebrow}
        lede={page.dek}
        image={hero.image}
        imageAlt={hero.imageAlt}
        accent={hero.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BreadcrumbNav items={page.breadcrumbs} />
        <p className="text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200">Last researched and reviewed: {reviewedDate} · By the BroadbandPicker editorial team</p>

        <aside className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-slate-700">
          <strong>Commercial disclosure:</strong> BroadbandPicker may receive commission if you follow a provider link and buy a service. Commission does not determine our conclusions or the price you pay. Prices, service terms and availability must be confirmed with the provider for your address.
        </aside>

        <section className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 p-6" aria-labelledby="quick-answer">
          <h2 id="quick-answer" className="text-2xl font-bold text-slate-900">The quick answer</h2>
          <p className="mt-3 leading-relaxed text-slate-700">{page.quickAnswer}</p>
        </section>

        <OnThisPageNav links={onThisPageLinks} />

        {pageKey === 'satisfaction' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Related provider and research pages">
            <p className="font-bold text-slate-900">Use the evidence, then compare the shortlist</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Read our <Link href="/research/broadband-customer-service-rankings-uk" className="text-sky-700 underline">best customer service broadband provider ranking</Link>
              {' '}for the current major-provider conclusion.
              {' '}Then check <Link href="/providers/plusnet" className="text-sky-700 underline">Plusnet</Link>,
              {' '}<Link href="/providers/sky" className="text-sky-700 underline">Sky</Link>
              {' '}and <Link href="/providers/zen-internet" className="text-sky-700 underline">Zen Internet</Link>
              {' '}where they are available.
              {' '}If you need to escalate a problem, use the <Link href="/guides/broadband-complaints-and-ombudsman-uk" className="text-sky-700 underline">broadband complaints and ombudsman guide</Link>
              {' '}and our <Link href="/how-we-review-broadband" className="text-sky-700 underline">review methodology</Link>.
            </p>
          </nav>
        )}

        {pageKey === 'serviceRankings' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Related provider and research pages">
            <p className="font-bold text-slate-900">Check the evidence, then compare the shortlist</p>
            <p className="mt-2 text-sm text-slate-600"><Link href="/research/uk-broadband-customer-satisfaction" className="text-sky-700 underline">Customer satisfaction evidence dashboard</Link> · <Link href="/providers/plusnet" className="text-sky-700 underline">Plusnet review</Link> · <Link href="/providers/sky" className="text-sky-700 underline">Sky review</Link> · <Link href="/providers/virgin-media" className="text-sky-700 underline">Virgin Media review</Link></p>
          </nav>
        )}

        {pageKey === 'manchester' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Manchester postcode district guides">
            <p className="font-bold text-slate-900">Manchester city-centre postcode guide</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              M1 has a narrower district coverage picture than Manchester-wide statistics. See the{' '}
              <Link href="/postcode/m1" className="font-semibold text-sky-700 underline">
                M1 broadband deals and coverage guide
              </Link>{' '}
              for district figures, apartment-building checks and a household plan comparison.
            </p>
          </nav>
        )}

        {pageKey === 'sheffield' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Sheffield postcode district and provider guides">
            <p className="font-bold text-slate-900">Sheffield local checks</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Start with the <Link href="/postcode/s1" className="font-semibold text-sky-700 underline">S1 broadband deals and coverage guide</Link> for Sheffield city centre, or read our <Link href="/providers/pine-media" className="font-semibold text-sky-700 underline">Pine Media review</Link> before comparing the local network with services using Openreach, CityFibre or Virgin Media.
            </p>
          </nav>
        )}

        {pageKey === 'london' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="London postcode district guides">
            <p className="font-bold text-slate-900">London postcode district guides</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              London-wide availability does not show what one property can order. Use the{' '}
              <Link href="/postcode/rm1" className="font-semibold text-sky-700 underline">
                RM1 broadband deals and coverage guide
              </Link>{' '}
              for district coverage, household speed choices and complete-address checks in Romford.
              {' '}For north-west London, our{' '}
              <Link href="/postcode/ha1" className="font-semibold text-sky-700 underline">
                HA1 broadband deals and coverage guide
              </Link>{' '}
              compares Harrow district evidence with exact-address checks.
              {' '}South of the river, the{' '}
              <Link href="/postcode/se1" className="font-semibold text-sky-700 underline">
                SE1 broadband deals and coverage guide
              </Link>{' '}
              covers Southwark, Borough, Bankside and London Bridge district evidence and exact-address checks.
              {' '}In central London, the{' '}
              <Link href="/postcode/sw1" className="font-semibold text-sky-700 underline">
                SW1 and Westminster broadband guide
              </Link>{' '}
              breaks down coverage across SW1&apos;s eight separate outward codes.
              {' '}East of the City, the{' '}
              <Link href="/postcode/e1" className="font-semibold text-sky-700 underline">
                E1 and Whitechapel broadband guide
              </Link>{' '}
              covers Spitalfields, Aldgate and Tower Hamlets district evidence.
              {' '}In west London, the{' '}
              <Link href="/postcode/ub1" className="font-semibold text-sky-700 underline">
                UB1 and Southall broadband guide
              </Link>{' '}
              covers Virgin Media&apos;s confirmed gigabit rollout and Ealing district evidence.
              {' '}In north London, the{' '}
              <Link href="/postcode/en1" className="font-semibold text-sky-700 underline">
                EN1 and Enfield broadband guide
              </Link>{' '}
              covers Openreach&apos;s confirmed flats-and-apartments full-fibre upgrade.
              {' '}In inner north London, the{' '}
              <Link href="/postcode/nw1" className="font-semibold text-sky-700 underline">
                NW1 and Camden broadband guide
              </Link>{' '}
              covers G.Network&apos;s 2026 administration and restructuring alongside district coverage evidence.
              {' '}In west London, the{' '}
              <Link href="/postcode/w5" className="font-semibold text-sky-700 underline">
                W5 and Ealing broadband guide
              </Link>{' '}
              covers Vodafone&apos;s confirmed Community Fibre-based full-fibre expansion and district coverage evidence.
            </p>
          </nav>
        )}

        {pageKey === 'edinburgh' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Edinburgh postcode district and provider guides">
            <p className="font-bold text-slate-900">Edinburgh city-centre postcode guide</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              City-wide coverage figures can hide gaps between individual tenement stairs. Use the{' '}
              <Link href="/postcode/eh1" className="font-semibold text-sky-700 underline">
                EH1 broadband deals and coverage guide
              </Link>{' '}
              for Old Town and city-centre district evidence, CityFibre and Openreach availability, and complete-address checks in central Edinburgh. Read our{' '}
              <Link href="/providers/toob" className="font-semibold text-sky-700 underline">
                toob review
              </Link>{' '}
              before ordering one of its CityFibre-based full-fibre packages in Leith, Gorgie or another covered Edinburgh street.
            </p>
          </nav>
        )}

        {pageKey === 'glasgow' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Glasgow postcode district and provider guides">
            <p className="font-bold text-slate-900">Glasgow city-centre postcode guide</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              City-wide investment figures can hide gaps between individual streets. Use the{' '}
              <Link href="/postcode/g1" className="font-semibold text-sky-700 underline">
                G1 broadband deals and coverage guide
              </Link>{' '}
              for district evidence, CityFibre&apos;s reported rollout delays and complete-address checks in central Glasgow. Read our{' '}
              <Link href="/providers/youfibre" className="font-semibold text-sky-700 underline">
                YouFibre review
              </Link>{' '}
              or{' '}
              <Link href="/providers/hyperoptic" className="font-semibold text-sky-700 underline">
                Hyperoptic review
              </Link>{' '}
              before ordering a full-fibre altnet package in Clydebank, Scotstoun or another covered Glasgow street.
            </p>
          </nav>
        )}

        {pageKey === 'liverpool' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Liverpool postcode district guide">
            <p className="font-bold text-slate-900">Liverpool postcode district guides</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              City-wide coverage can hide gaps between individual buildings. Use the{' '}
              <Link href="/postcode/l1" className="font-semibold text-sky-700 underline">
                L1 broadband deals and coverage guide
              </Link>{' '}
              for Liverpool city-centre district evidence and complete-address checks.
              {' '}For Toxteth, the{' '}
              <Link href="/postcode/l8" className="font-semibold text-sky-700 underline">
                L8 broadband deals and coverage guide
              </Link>{' '}
              covers named local full-fibre altnets and a genuine caution about older housing stock affecting achievable speed.
            </p>
          </nav>
        )}

        {pageKey === 'birmingham' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Birmingham postcode district and provider guides">
            <p className="font-bold text-slate-900">Birmingham city-centre postcode guide</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              City-wide coverage can hide gaps between individual buildings. Use the{' '}
              <Link href="/postcode/b1" className="font-semibold text-sky-700 underline">
                B1 broadband deals and coverage guide
              </Link>{' '}
              for district evidence, Hyperoptic&apos;s city-centre apartment presence and complete-address checks in central Birmingham. Read our{' '}
              <Link href="/providers/hyperoptic" className="font-semibold text-sky-700 underline">
                Hyperoptic review
              </Link>{' '}
              or{' '}
              <Link href="/providers/brsk" className="font-semibold text-sky-700 underline">
                Brsk review
              </Link>{' '}
              before ordering a full-fibre altnet package in Aston, Handsworth or another covered Birmingham street.
            </p>
          </nav>
        )}

        {pageKey === 'leeds' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Leeds postcode district and provider guides">
            <p className="font-bold text-slate-900">Leeds city-centre postcode guide</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              City-wide coverage can hide gaps between individual buildings. Use the{' '}
              <Link href="/postcode/ls2" className="font-semibold text-sky-700 underline">
                LS2 broadband deals and coverage guide
              </Link>{' '}
              for district evidence, named local full-fibre altnets and complete-address checks in central Leeds.
              {' '}For Leeds city centre&apos;s LS1 district, the{' '}
              <Link href="/postcode/ls1" className="font-semibold text-sky-700 underline">
                LS1 broadband deals and coverage guide
              </Link>{' '}
              covers a real LS1-vs-LS2 coverage comparison and Giant&apos;s CityFibre claim. Read our{' '}
              <Link href="/providers/brsk" className="font-semibold text-sky-700 underline">
                Brsk review
              </Link>{' '}
              or{' '}
              <Link href="/providers/hyperoptic" className="font-semibold text-sky-700 underline">
                Hyperoptic review
              </Link>{' '}
              before ordering a full-fibre altnet package in Chapel Allerton, Headingley or another covered Leeds street.
            </p>
          </nav>
        )}

        {pageKey === 'bristol' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Bristol postcode district and provider guides">
            <p className="font-bold text-slate-900">Bristol city-centre postcode guide</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              City-wide coverage can hide gaps between individual buildings. Use the{' '}
              <Link href="/postcode/bs1" className="font-semibold text-sky-700 underline">
                BS1 broadband deals and coverage guide
              </Link>{' '}
              for district evidence, flat-specific checks and complete-contract comparisons in central Bristol.
              {' '}For Bedminster, the{' '}
              <Link href="/postcode/bs3" className="font-semibold text-sky-700 underline">
                BS3 broadband deals and coverage guide
              </Link>{' '}
              covers CityFibre&apos;s partial coverage and district evidence, and explains why BS31 (Keynsham) is a separate district. Read our{' '}
              <Link href="/providers/youfibre" className="font-semibold text-sky-700 underline">
                YouFibre review
              </Link>{' '}
              before ordering a full-fibre altnet package in a covered Bristol street outside Truespeed&apos;s own network.
            </p>
          </nav>
        )}

        {pageKey === 'postcode' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Featured postcode district guides">
            <p className="font-bold text-slate-900">Detailed postcode district guide</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Comparing a city-centre district? Our{' '}
              <Link href="/postcode/m1" className="font-semibold text-sky-700 underline">
                M1 broadband guide
              </Link>{' '}
              separates Manchester district coverage from exact-address availability. For Romford, the{' '}
              <Link href="/postcode/rm1" className="font-semibold text-sky-700 underline">
                RM1 broadband deals guide
              </Link>{' '}
              compares local coverage, household speed needs and complete-contract cost. For Nottingham, use the{' '}
              <Link href="/postcode/ng1" className="font-semibold text-sky-700 underline">
                NG1 broadband deals guide
              </Link>{' '}
              for local coverage, renter checks and a household comparison. Our{' '}
              <Link href="/postcode/rg1" className="font-semibold text-sky-700 underline">
                RG1 and Reading broadband guide
              </Link>{' '}
              compares competing full-fibre networks, household speed needs and total contract cost. For Kent, the{' '}
              <Link href="/postcode/ct1" className="font-semibold text-sky-700 underline">
                CT1 and Canterbury broadband guide
              </Link>{' '}
              separates district coverage from complete-address availability. For Bristol city centre, the{' '}
              <Link href="/postcode/bs1" className="font-semibold text-sky-700 underline">
                BS1 broadband deals guide
              </Link>{' '}
              compares district coverage with address-level checks for flats and homes. For Newcastle city centre, the{' '}
              <Link href="/postcode/ne1" className="font-semibold text-sky-700 underline">
                NE1 broadband deals guide
              </Link>{' '}
              adds local coverage, flat checks and total-contract comparisons. For Brighton, the{' '}
              <Link href="/postcode/bn1" className="font-semibold text-sky-700 underline">
                BN1 broadband deals guide
              </Link>{' '}
              separates district coverage from complete-address availability for flats, students and homes. For Guildford, the{' '}
              <Link href="/postcode/gu1" className="font-semibold text-sky-700 underline">
                GU1 broadband deals guide
              </Link>{' '}
              covers district evidence, contract costs and address-limited multi-gigabit service. For Harrow, the{' '}
              <Link href="/postcode/ha1" className="font-semibold text-sky-700 underline">
                HA1 broadband deals guide
              </Link>{' '}
              adds district coverage, named local networks and complete-address checks. For central London south of the river, the{' '}
              <Link href="/postcode/se1" className="font-semibold text-sky-700 underline">
                SE1 and Southwark broadband guide
              </Link>{' '}
              covers Borough, Bankside, London Bridge and Bermondsey district coverage with complete-address checks. For Westminster, the{' '}
              <Link href="/postcode/sw1" className="font-semibold text-sky-700 underline">
                SW1 and Westminster broadband guide
              </Link>{' '}
              breaks down coverage across SW1&apos;s eight separate outward codes rather than treating it as one district. For east London, the{' '}
              <Link href="/postcode/e1" className="font-semibold text-sky-700 underline">
                E1 and Whitechapel broadband guide
              </Link>{' '}
              covers Tower Hamlets district evidence, named local networks and complete-address checks. For west London, the{' '}
              <Link href="/postcode/ub1" className="font-semibold text-sky-700 underline">
                UB1 and Southall broadband guide
              </Link>{' '}
              covers Virgin Media&apos;s confirmed gigabit rollout, Ealing district evidence and complete-address checks. For north London, the{' '}
              <Link href="/postcode/en1" className="font-semibold text-sky-700 underline">
                EN1 and Enfield broadband guide
              </Link>{' '}
              covers Openreach&apos;s confirmed flats-and-apartments full-fibre upgrade and complete-address checks. For inner north London, the{' '}
              <Link href="/postcode/nw1" className="font-semibold text-sky-700 underline">
                NW1 and Camden broadband guide
              </Link>{' '}
              covers G.Network&apos;s 2026 administration and restructuring, district coverage evidence and complete-address checks. For west London, the{' '}
              <Link href="/postcode/w5" className="font-semibold text-sky-700 underline">
                W5 and Ealing broadband guide
              </Link>{' '}
              covers Vodafone&apos;s confirmed Community Fibre-based full-fibre expansion, district coverage evidence and complete-address checks. For Southampton, the{' '}
              <Link href="/postcode/so14" className="font-semibold text-sky-700 underline">
                SO14 broadband deals guide
              </Link>{' '}
              covers toob&apos;s own full-fibre network, Openreach&apos;s confirmed city upgrade and district coverage evidence. For Luton, the{' '}
              <Link href="/postcode/lu1" className="font-semibold text-sky-700 underline">
                LU1 broadband deals guide
              </Link>{' '}
              covers CityFibre&apos;s confirmed rollout, Openreach&apos;s low-uptake findings and district coverage evidence. For Liverpool city centre, the{' '}
              <Link href="/postcode/l1" className="font-semibold text-sky-700 underline">
                L1 broadband deals guide
              </Link>{' '}
              covers Netomnia/YouFibre&apos;s confirmed rollout and district coverage evidence. For Leeds city centre, the{' '}
              <Link href="/postcode/ls2" className="font-semibold text-sky-700 underline">
                LS2 broadband deals guide
              </Link>{' '}
              covers named local full-fibre altnets and district coverage evidence. For Birmingham city centre, the{' '}
              <Link href="/postcode/b1" className="font-semibold text-sky-700 underline">
                B1 broadband deals guide
              </Link>{' '}
              covers Hyperoptic&apos;s city-centre apartment presence and district coverage evidence. For Coventry, the{' '}
              <Link href="/postcode/cv1" className="font-semibold text-sky-700 underline">
                CV1 broadband deals guide
              </Link>{' '}
              covers Openreach&apos;s confirmed full-fibre eligibility figures and district coverage evidence. For Toxteth, the{' '}
              <Link href="/postcode/l8" className="font-semibold text-sky-700 underline">
                L8 broadband deals guide
              </Link>{' '}
              covers named local full-fibre altnets and a genuine caution about older housing stock affecting achievable speed. For Glasgow city centre, the{' '}
              <Link href="/postcode/g1" className="font-semibold text-sky-700 underline">
                G1 broadband deals guide
              </Link>{' '}
              covers CityFibre&apos;s reported rollout delays and district coverage evidence. For Bedminster, the{' '}
              <Link href="/postcode/bs3" className="font-semibold text-sky-700 underline">
                BS3 broadband deals guide
              </Link>{' '}
              covers CityFibre&apos;s partial coverage and district coverage evidence. For Oxford, the{' '}
              <Link href="/postcode/ox1" className="font-semibold text-sky-700 underline">
                OX1 broadband deals guide
              </Link>{' '}
              covers Openreach&apos;s confirmed rollout and low-uptake finding, plus district coverage evidence. For Leeds city centre&apos;s LS1 district, the{' '}
              <Link href="/postcode/ls1" className="font-semibold text-sky-700 underline">
                LS1 broadband deals guide
              </Link>{' '}
              covers a real LS1-vs-LS2 coverage comparison and district coverage evidence. For Cardiff, the{' '}
              <Link href="/postcode/cf10" className="font-semibold text-sky-700 underline">
                CF10 broadband deals guide
              </Link>{' '}
              covers Cardiff&apos;s hypercity network, Ffeibr&apos;s fibre extension and district coverage evidence. For Stevenage, the{' '}
              <Link href="/postcode/sg1" className="font-semibold text-sky-700 underline">
                SG1 broadband deals guide
              </Link>{' '}
              covers a genuine, reported drop in Openreach full-fibre coverage and district evidence. For Leicester, the{' '}
              <Link href="/postcode/le1" className="font-semibold text-sky-700 underline">
                LE1 broadband deals guide
              </Link>{' '}
              covers toob&apos;s confirmed launch on CityFibre&apos;s network and district coverage evidence.
            </p>
          </nav>
        )}

        {pageKey === 'postcode' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="City broadband hub pages">
            <p className="font-bold text-slate-900">Browse broadband coverage by city</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              For a city-wide overview before checking a specific district, see our{' '}
              <Link href="/postcode/london" className="font-semibold text-sky-700 underline">London</Link>,{' '}
              <Link href="/postcode/manchester" className="font-semibold text-sky-700 underline">Manchester</Link>,{' '}
              <Link href="/postcode/birmingham" className="font-semibold text-sky-700 underline">Birmingham</Link>,{' '}
              <Link href="/postcode/glasgow" className="font-semibold text-sky-700 underline">Glasgow</Link>,{' '}
              <Link href="/postcode/edinburgh" className="font-semibold text-sky-700 underline">Edinburgh</Link>,{' '}
              <Link href="/postcode/leeds" className="font-semibold text-sky-700 underline">Leeds</Link>,{' '}
              <Link href="/postcode/liverpool" className="font-semibold text-sky-700 underline">Liverpool</Link>,{' '}
              <Link href="/postcode/bristol" className="font-semibold text-sky-700 underline">Bristol</Link> and{' '}
              <Link href="/postcode/sheffield" className="font-semibold text-sky-700 underline">Sheffield</Link>{' '}
              broadband hub pages.
            </p>
          </nav>
        )}

        {page.table && (
          <section className="mt-12 scroll-mt-24" aria-labelledby="comparison">
            <h2 id="comparison" className="text-2xl font-bold text-slate-900">{page.table.title}</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl mt-5">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-white"><tr>{page.table.headers.map(header => <th key={header} scope="col" className="text-left px-4 py-3">{header}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-200">{page.table.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-4 py-3 align-top ${index === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>
        )}

        <div className="mt-12 space-y-10 text-slate-700 leading-relaxed">
          {page.sections.map(section => (
            <section key={section.heading} id={slugify(section.heading)} className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900">{section.heading}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph} className="mt-3">{paragraph}</p>)}
              {section.bullets && <ul className="list-disc pl-6 mt-4 space-y-2">{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-2xl bg-slate-900 text-white p-7">
          <h2 className="text-2xl font-bold">Check options for your address</h2>
          <p className="text-slate-300 mt-3">Broadband availability, prices and speeds vary by postcode. Compare the live choices before deciding.</p>
          <Link href="/compare" className="inline-block mt-5 bg-sky-500 hover:bg-sky-600 rounded-lg px-5 py-3 font-bold">Compare broadband options</Link>
        </section>

        <div className="mt-12">
          <NewsletterSignup variant="guide" source="priority-page-end" />
        </div>

        <section className="mt-12 scroll-mt-24" aria-labelledby="faqs">
          <h2 id="faqs" className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">{page.faqs.map(faq => <details key={faq.question} className="py-5 group"><summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between">{faq.question}<span aria-hidden="true">+</span></summary><p className="mt-3 leading-relaxed">{faq.answer}</p></details>)}</div>
        </section>

        <section id="sources" className="mt-12 scroll-mt-24 border-t border-slate-200 pt-8 text-sm">
          <h2 className="text-lg font-bold text-slate-900">Sources and methodology</h2>
          <p className="mt-2 text-slate-600">We use official provider pages and primary UK regulatory or government sources. We do not copy competitor rankings. Provider claims are treated as claims and availability-dependent details are not presented as universal facts.</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">{page.sources.map(source => <li key={source.href}><a href={source.href} rel="noopener noreferrer" className="text-sky-700 underline">{source.label}</a>{source.verified && <span className="text-slate-500"> · Verified {new Date(`${source.verified}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>}</li>)}</ul>
          <p className="mt-4"><Link href="/how-we-review-broadband" className="text-sky-700 underline">Review methodology</Link> · <Link href="/editorial-policy" className="text-sky-700 underline">Editorial policy</Link> · <Link href="/how-we-make-money" className="text-sky-700 underline">How we make money</Link></p>
        </section>
      </div>
    </main>
  )
}
