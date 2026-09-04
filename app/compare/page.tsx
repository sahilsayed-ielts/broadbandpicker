import type { Metadata } from 'next'
import Link from 'next/link'
import { providers, providerDatasetUpdatedDate } from '@/data/providers'
import ComparisonTable from '@/components/ComparisonTable'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import PostcodeChecker from '@/components/PostcodeChecker'
import PostcodeContextBar from '@/components/PostcodeContextBar'
import OnThisPageNav from '@/components/OnThisPageNav'
import { JsonLd } from '@/lib/jsonLd'

const BASE_URL = 'https://broadbandpicker.co.uk'
const PAGE_URL = `${BASE_URL}/compare`

export const metadata: Metadata = {
  title: 'Compare Broadband Providers UK: Prices, Speeds and Deals',
  description:
    'Compare UK broadband providers by price, speed, contract, setup fee, coverage and customer rating. Shortlist providers, check your postcode and choose with confidence.',
  alternates: { canonical: PAGE_URL },
  authors: [{ name: 'BroadbandPicker editorial team', url: `${BASE_URL}/about` }],
  openGraph: {
    title: 'Compare Broadband Providers UK | BroadbandPicker',
    description:
      'Shortlist and compare UK broadband providers, then check the deals and networks available at your address.',
    url: PAGE_URL,
    type: 'website',
  },
}

const faqs = [
  {
    question: 'How do I compare broadband providers in my area?',
    answer:
      'Start with your postcode because broadband networks are not available at every address. Then compare the packages you can actually order by average download speed, minimum guaranteed speed, total contract cost, setup fee, fixed price rises, contract length and customer service evidence. BroadbandPicker’s provider table is a useful shortlist, but the provider must confirm availability and final terms for your home.',
  },
  {
    question: 'Which broadband provider is best in the UK?',
    answer:
      'There is no single best provider for every UK household. A national provider may suit someone who values broad availability and established support, while a local full-fibre network may offer faster symmetrical speeds or lower prices where it operates. The best choice is the strongest available package for your required speed, full-contract budget, support needs and preferred contract length.',
  },
  {
    question: 'What broadband speed do I need?',
    answer:
      'Around 50 to 100 Mbps is a sensible starting range for many small households that stream, browse and make video calls. Larger homes, frequent 4K streaming and several simultaneous users may benefit from 150 to 300 Mbps. Gigabit broadband is most useful for many heavy users or large downloads. Choose from the speeds actually available at your address, not the provider’s national maximum.',
  },
  {
    question: 'Is the cheapest broadband provider always the best choice?',
    answer:
      'No. Compare the full contract cost rather than the opening monthly price alone. Include setup charges, scheduled pounds-and-pence price rises, introductory discounts, rewards and the minimum term. Also check the speed guarantee, router, support record and exit terms. A slightly higher monthly price can be better value if it avoids a setup fee, delivers the speed you need or has clearer pricing.',
  },
  {
    question: 'Can I switch broadband before my contract ends?',
    answer:
      'You can switch, but an early termination charge may apply if you are still inside the minimum term. Ask your existing provider for the exact exit cost and compare it with the saving from the new deal. Separate rights can apply if contractual terms change or an unresolved speed problem falls below the minimum guaranteed speed. Check your contract before ordering.',
  },
  {
    question: 'Should I cancel my old broadband before switching?',
    answer:
      'Usually not. Under Ofcom’s One Touch Switch process, you normally contact the new provider and it coordinates the fixed broadband switch. Cancelling the old service first can create an avoidable loss of connection or number-transfer problem. Tell the new provider what services you are moving, check any early termination charge, and follow its instructions if your situation needs a different process.',
  },
  {
    question: 'What is the difference between full fibre and part fibre broadband?',
    answer:
      'Full fibre, also called FTTP, uses fibre to the property and can support higher, more consistent speeds. Part fibre, usually FTTC, uses fibre to a street cabinet and copper for the final connection, so performance depends more heavily on line length and quality. Cable and fixed wireless networks are separate alternatives. Your postcode determines which technologies you can order.',
  },
  {
    question: 'Can I get a cheaper social broadband tariff?',
    answer:
      'Possibly. Ofcom lists social tariffs for people receiving Universal Credit, Pension Credit and certain other benefits. They commonly offer lower prices, small or no setup charges, no mid-contract rise and no fee to leave. Eligibility and coverage vary, and the benefit recipient normally needs to be the account holder. Check Ofcom’s current list and apply through the provider.',
  },
]

const sources = [
  {
    label: 'Ofcom Connected Nations update: Spring 2026',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-update-spring-2026',
    note: 'UK full-fibre and gigabit-capable residential availability as of January 2026.',
  },
  {
    label: 'Ofcom broadband switching guidance',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching',
    note: 'Current consumer guidance on switching fixed broadband through One Touch Switch.',
  },
  {
    label: 'Ofcom broadband speeds guidance',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/broadband-speeds-code-practice',
    note: 'Speed information, minimum guaranteed speeds and the residential speeds code.',
  },
  {
    label: 'Ofcom telecoms complaints report',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/telecoms-and-pay-tv-complaints',
    note: 'Quarterly complaints per 100,000 customers for major providers.',
  },
  {
    label: 'Ofcom comparing customer service',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/report',
    note: 'Comparative evidence about the service received by residential telecoms customers.',
  },
  {
    label: 'Ofcom social tariffs',
    href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/social-tariffs',
    note: 'Current social broadband tariff providers, prices and eligibility principles.',
  },
  {
    label: 'UK Telecoms Consumer Charter',
    href: 'https://www.gov.uk/government/publications/telecoms-consumer-charter/telecoms-consumer-charter',
    note: 'Government and industry commitments on price clarity and consumer information.',
  },
]

const itemListJsonLd = {
  '@type': 'ItemList',
  '@id': `${PAGE_URL}#providers`,
  name: 'UK broadband provider comparison',
  itemListElement: providers.map((provider, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: provider.name,
    url: `${BASE_URL}/providers/${provider.slug}`,
  })),
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${PAGE_URL}#page`,
      name: 'Compare Broadband Providers UK',
      description:
        'An independent provider-level comparison of UK broadband prices, speeds, contracts, setup fees, coverage and customer ratings.',
      url: PAGE_URL,
      dateModified: providerDatasetUpdatedDate,
      author: { '@type': 'Organization', name: 'BroadbandPicker editorial team', url: `${BASE_URL}/about` },
      publisher: { '@type': 'Organization', name: 'BroadbandPicker', url: BASE_URL },
      mainEntity: { '@id': `${PAGE_URL}#providers` },
      citation: sources.map((source) => source.href),
    },
    itemListJsonLd,
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faqs`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Compare broadband providers', item: PAGE_URL },
      ],
    },
  ],
}

export default function ComparePage() {
  const verifiedDateLabel = new Date(`${providerDatasetUpdatedDate}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <main className="bg-white">
      <JsonLd data={structuredData} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: 'Compare broadband providers', href: '/compare' },
          ]}
        />
        <PostcodeContextBar />

        <header className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">Independent UK comparison</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Compare Broadband Providers in the UK
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-slate-600">
            Compare UK broadband providers by starting price, maximum speed, contract length,
            setup fee, estimated coverage and customer rating. Select two or three finalists for
            a side-by-side comparison, then check your postcode before choosing a deal.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Provider dataset researched and reviewed {verifiedDateLabel} · BroadbandPicker editorial team
          </p>
        </header>

        <aside className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-slate-700">
          <strong>Commercial disclosure:</strong> BroadbandPicker may receive commission if you follow
          a provider link and buy a service. Commission does not determine the order of this table or
          the price you pay. This is a provider-level comparison, not a claim that every package is
          available at your address or that we cover the whole market.
        </aside>

        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-6" aria-labelledby="quick-answer">
          <h2 id="quick-answer" className="text-2xl font-bold text-slate-900">The quick answer</h2>
          <p className="mt-3 max-w-4xl leading-relaxed text-slate-700">
            The best broadband provider is the one that serves your exact address, delivers enough
            speed for your household and has the lowest acceptable full-contract cost. Check your
            postcode first, shortlist two or three realistic providers, then compare setup fees,
            scheduled price rises, speed guarantees, contract length and customer-service evidence.
            A national maximum speed or headline price cannot settle the choice on its own.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Current UK broadband facts">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-3xl font-extrabold text-sky-800">82%</p>
            <p className="mt-1 font-semibold text-slate-900">of UK homes had full-fibre availability</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Ofcom, January 2026. Availability still varies by address.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-3xl font-extrabold text-sky-800">89%</p>
            <p className="mt-1 font-semibold text-slate-900">could access gigabit-capable broadband</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Ofcom, January 2026. Gigabit-capable includes more than FTTP alone.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-3xl font-extrabold text-sky-800">One contact</p>
            <p className="mt-1 font-semibold text-slate-900">normally starts your broadband switch</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Under Ofcom’s One Touch Switch process, contact the new provider.
            </p>
          </div>
        </section>

        <OnThisPageNav
          links={[
            { href: '#comparison-tool', label: 'Comparison tool' },
            { href: '#how-to-compare', label: 'How to compare' },
            { href: '#speed-guide', label: 'Speed guide' },
            { href: '#provider-types', label: 'Provider types' },
            { href: '#switching', label: 'Switching' },
            { href: '#faqs', label: 'FAQs' },
            { href: '#sources', label: 'Sources' },
          ]}
        />

        <section id="comparison-tool" className="scroll-mt-24 pt-10" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-3xl font-bold text-slate-900">
            Compare UK broadband providers side by side
          </h2>
          <p className="mt-3 max-w-4xl leading-relaxed text-slate-600">
            These figures are useful for reducing a long list to a manageable shortlist. “From”
            prices and maximum speeds describe a provider’s range, not a guaranteed offer for your
            property. Network coverage, package speed and final pricing must be checked using your
            postcode and confirmed on the provider’s order page.
          </p>

          <div className="my-6 rounded-xl border border-sky-200 bg-sky-50 p-5">
            <h3 className="font-bold text-slate-900">Check providers available at your address</h3>
            <p className="mt-1 text-sm text-slate-600">
              Enter your postcode to continue to local availability information. Only the outward
              postcode area is sent to analytics, never your full postcode.
            </p>
            <div className="mt-4 max-w-sm"><PostcodeChecker /></div>
          </div>

          <p className="mb-4 text-xs leading-relaxed text-slate-500">
            Prices and provider data reviewed {verifiedDateLabel}. Ratings are customer-sentiment
            references, not a promise about your individual experience. We may earn commission from
            tracked provider links.
          </p>
          <ComparisonTable providers={providers} />
        </section>

        <section id="how-to-compare" className="scroll-mt-24 pt-16" aria-labelledby="how-to-compare-heading">
          <h2 id="how-to-compare-heading" className="text-3xl font-bold text-slate-900">
            How to compare broadband deals properly
          </h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-slate-700">
            A useful broadband comparison answers six questions in order. Starting with price can
            produce a false bargain if the deal is unavailable, too slow or expensive over its full
            term. Work through this sequence before following a provider link.
          </p>
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ['1. Which networks reach the address?', 'Use a postcode and, where offered, an exact-address check. National coverage percentages cannot tell you whether a specific Openreach, Virgin Media, CityFibre or local full-fibre connection reaches your property.'],
              ['2. What speed will the household use?', 'Choose for simultaneous activity, not the fastest tier sold. Video calls, 4K streams, gaming downloads and cloud backups can overlap, but many homes do not need a gigabit package.'],
              ['3. What is the full contract cost?', 'Add monthly payments, setup charges and any stated fixed price rises, then subtract guaranteed bill credits or rewards. Keep one-off vouchers separate so the cash cost remains clear.'],
              ['4. How long is the commitment?', 'An 18 or 24-month contract can lower the opening price but reduce flexibility. Check early termination terms if you expect to move or your circumstances may change.'],
              ['5. What service evidence is available?', 'Use Ofcom complaints and customer-service reporting for major providers, then read recent customer feedback for recurring themes. Review scores alone can change quickly and may reflect several products.'],
              ['6. What exactly is guaranteed?', 'Record the personalised minimum guaranteed speed, installation date, router, price-rise wording and package inclusions shown before checkout. Save the order confirmation.'],
            ].map(([heading, copy]) => (
              <li key={heading} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">{heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pt-14" aria-labelledby="cost-heading">
          <h2 id="cost-heading" className="text-3xl font-bold text-slate-900">Compare the total cost, not only the monthly price</h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-slate-700">
            Since January 2025, in-contract price rises must be stated clearly in pounds and pence
            when the contract is taken out. That makes the increase visible, but it still needs to
            be included in your calculation. A provider may also advertise an introductory price
            that changes during or after the minimum term.
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900">A simple worked comparison</h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                Deal A costs £24 per month for 24 months with free setup: £576 before any stated
                rise. Deal B starts at £22 per month for 24 months with a £50 setup fee: £578 before
                any rise. Deal B has the lower headline price but the slightly higher baseline cost.
                Now add each provider’s scheduled rise and subtract only rewards you are certain to receive.
              </p>
              <Link href="/tools/broadband-cost-calculator" className="mt-4 inline-block font-semibold text-sky-700 underline">
                Calculate the true contract cost
              </Link>
            </div>
            <div className="rounded-xl bg-slate-900 p-6 text-white">
              <h3 className="text-xl font-bold">Cost checklist</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                <li>Monthly charge for each period of the contract</li>
                <li>Setup, activation, delivery and installation fees</li>
                <li>Fixed annual or dated price increases</li>
                <li>Required phone, TV or mobile add-ons</li>
                <li>Guaranteed account credit, cashback or reward</li>
                <li>Expected cost once the minimum term ends</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="speed-guide" className="scroll-mt-24 pt-14" aria-labelledby="speed-heading">
          <h2 id="speed-heading" className="text-3xl font-bold text-slate-900">Broadband speed comparison by household need</h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-slate-700">
            Speed requirements depend on simultaneous use, upload activity and how quickly you want
            large downloads to finish. The ranges below are practical starting points, not technical
            guarantees. Wi-Fi quality, device age and network congestion can affect real performance.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">Household pattern</th>
                  <th scope="col" className="px-4 py-3 text-left">Starting range</th>
                  <th scope="col" className="px-4 py-3 text-left">Usually suitable for</th>
                  <th scope="col" className="px-4 py-3 text-left">Check carefully</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  ['One or two light users', '30 to 50 Mbps', 'Browsing, HD streaming and occasional video calls', 'Slow large downloads and limited headroom'],
                  ['Small connected household', '50 to 100 Mbps', 'Several streams, video calls and everyday gaming', 'Upload speed for cloud work'],
                  ['Busy family or shared home', '150 to 300 Mbps', 'Multiple 4K streams, gaming and home working together', 'Router coverage across the home'],
                  ['Many heavy users', '500 Mbps to 1 Gbps', 'Frequent large downloads, backups and many concurrent devices', 'Whether the extra speed justifies the cost'],
                ].map((row) => (
                  <tr key={row[0]} className="bg-white">
                    {row.map((cell, index) => (
                      <td key={cell} className={`px-4 py-4 align-top ${index === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Unsure where you fit? Use the <Link href="/tools/broadband-match" className="font-semibold text-sky-700 underline">Broadband Match questionnaire</Link>
            {' '}or establish a baseline with the <Link href="/speed-test" className="font-semibold text-sky-700 underline">broadband speed test</Link>.
          </p>
        </section>

        <section id="provider-types" className="scroll-mt-24 pt-14" aria-labelledby="types-heading">
          <h2 id="types-heading" className="text-3xl font-bold text-slate-900">Which type of broadband provider should you compare?</h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-slate-700">
            Providers can sell services over the same wholesale network or operate their own local
            infrastructure. Two Openreach-based providers may offer similar access technology but
            different prices, routers, support and backhaul. An alternative network may offer a very
            different speed profile but cover fewer streets.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-bold text-slate-900">Provider type</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold text-slate-900">Typical strength</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold text-slate-900">Main limitation</th>
                  <th scope="col" className="px-4 py-3 text-left font-bold text-slate-900">Best comparison question</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  ['National Openreach retailers', 'Broad availability and many package or bundle choices', 'Service and pricing differ even when the access line is similar', 'Which retailer gives the best full cost, guarantee and support terms?'],
                  ['Virgin Media network', 'High download tiers across its cable and growing fibre footprint', 'Availability and installation are network-specific', 'What upload speed, setup cost and in-contract rise apply at this address?'],
                  ['CityFibre retailers', 'Multiple retailers can sell full fibre on one local network', 'Retailer choice varies between CityFibre areas', 'Which available retailer offers the right support, speed and contract?'],
                  ['Independent full-fibre networks', 'Fast full fibre, sometimes with strong upload speeds or simple pricing', 'Geographic coverage can be highly local', 'Is the building serviceable now, and what happens if I move?'],
                  ['Fixed wireless or 5G home broadband', 'Quick installation and an option where fixed lines are weak', 'Performance can vary with signal, placement and congestion', 'Can I test signal and return the service if performance is poor?'],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={cell} className={`px-4 py-4 align-top ${index === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Read our <Link href="/guides/fttp-vs-fttc-broadband" className="font-semibold text-sky-700 underline">FTTP versus FTTC guide</Link>
            {' '}for a closer explanation of fibre terminology.
          </p>
        </section>

        <section className="pt-14" aria-labelledby="service-heading">
          <h2 id="service-heading" className="text-3xl font-bold text-slate-900">How to compare broadband customer service</h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-slate-700">
            Start with comparable evidence. Ofcom publishes complaints per 100,000 customers for
            major providers, which adjusts for differences in customer-base size. Its customer-service
            reporting also covers measures such as satisfaction and fault handling. These sources do
            not include every small provider and cannot predict an individual case, but they are more
            useful than treating one undated review score as a final verdict.
          </p>
          <p className="mt-3 max-w-4xl leading-relaxed text-slate-700">
            Use public review platforms to look for recent patterns in installation, billing, outages
            and cancellation. Check whether the provider is signed up to Ofcom’s automatic compensation
            scheme, then read its complaints code and support hours. A strong technical package can be
            poor value if you need fast fault resolution and the support arrangement does not meet that need.
          </p>
          <Link href="/research/broadband-customer-service-rankings-uk" className="mt-4 inline-block font-semibold text-sky-700 underline">
            Compare Ofcom-evidenced customer service rankings
          </Link>
        </section>

        <section id="switching" className="scroll-mt-24 pt-14" aria-labelledby="switch-heading">
          <h2 id="switch-heading" className="text-3xl font-bold text-slate-900">How switching broadband works in 2026</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900">Use the new provider to start the switch</h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                Ofcom’s One Touch Switch process means residential fixed broadband customers normally
                contact the provider they want to join. The new provider explains the process and
                coordinates the move. Do not cancel first unless the new provider specifically tells
                you that your services require a different route.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900">Check costs and linked services first</h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                Ask about any early termination charge, number transfer, email address, TV package,
                mobile discount or alarm service connected to the old account. Confirm the activation
                date and equipment return instructions. Keep the old router until the switch is complete.
              </p>
            </div>
          </div>
          <Link href="/guides/how-to-switch-broadband-uk" className="mt-4 inline-block font-semibold text-sky-700 underline">
            Follow the complete UK broadband switching checklist
          </Link>
        </section>

        <section className="pt-14" aria-labelledby="social-heading">
          <h2 id="social-heading" className="text-3xl font-bold text-slate-900">Check social tariffs before standard broadband deals</h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-slate-700">
            If you or someone in the household receives Universal Credit, Pension Credit or another
            qualifying benefit, check Ofcom’s current social tariff list before comparing standard
            offers. Ofcom says current social tariffs generally cost between £10 and £24 per month.
            They are designed to have low setup costs, no mid-contract price rise and no fee to leave,
            although provider coverage and eligibility still apply.
          </p>
          <a
            href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/social-tariffs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-semibold text-sky-700 underline"
          >
            Check Ofcom’s current social tariff list
          </a>
        </section>

        <section id="faqs" className="scroll-mt-24 pt-16" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-3xl font-bold text-slate-900">Broadband comparison FAQs</h2>
          <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-bold text-slate-900">
                  {faq.question}
                  <span aria-hidden="true" className="text-xl text-sky-700 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-4xl leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="sources" className="scroll-mt-24 pt-14" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-2xl font-bold text-slate-900">Sources and comparison methodology</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
            Provider starting prices, speed ranges, contract terms and setup fees come from the
            BroadbandPicker provider dataset and its linked provider sources. We use Ofcom and UK
            government material for market-wide coverage, switching, pricing and service claims.
            The table is not ranked by commission. It is a provider shortlist, and exact package
            availability, guarantees and checkout terms take precedence.
          </p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {sources.map((source) => (
              <li key={source.href} className="rounded-lg border border-slate-200 p-4 text-sm">
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 underline">
                  {source.label}
                </a>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{source.note} Verified 23 August 2026.</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-slate-600">
            <Link href="/how-we-review-broadband" className="font-semibold text-sky-700 underline">How we review broadband</Link>
            {' · '}
            <Link href="/editorial-policy" className="font-semibold text-sky-700 underline">Editorial policy</Link>
            {' · '}
            <Link href="/how-we-make-money" className="font-semibold text-sky-700 underline">How we make money</Link>
            {' · '}
            <Link href="/providers/compare" className="font-semibold text-sky-700 underline">Provider head-to-head comparisons</Link>
          </p>
        </section>
      </div>
    </main>
  )
}
