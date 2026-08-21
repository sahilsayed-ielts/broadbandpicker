import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import BroadbandCostCalculator from '@/components/BroadbandCostCalculator'

const PAGE_URL = 'https://broadbandpicker.co.uk/tools/broadband-cost-calculator'
const REVIEWED_DATE = '2026-08-21'

export const metadata: Metadata = {
  title: 'Broadband Cost Calculator | True Monthly Cost UK',
  description:
    'Work out the true monthly cost of a broadband deal, including setup fees and cashback, plus cost per Mbps — so you can compare packages fairly, not just by headline price.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Broadband Cost Calculator | BroadbandPicker',
    description: 'See the true monthly and contract-length cost of any broadband deal, including cost per Mbps.',
    url: PAGE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Broadband Cost Calculator | BroadbandPicker',
    description: 'See the true monthly and contract-length cost of any broadband deal.',
  },
}

const faqs = [
  {
    question: 'Why is my true monthly broadband cost different from the advertised price?',
    answer:
      'A one-off setup or activation fee spreads a small extra cost across every month of the contract, so the true average monthly cost is slightly higher than the headline price. Cashback works the other way: if you actually claim it, it lowers the true average monthly cost below the advertised price.',
  },
  {
    question: 'Does this calculator include VAT or line rental?',
    answer:
      'Enter the final price you would actually pay each month, including any packaged line rental. Business broadband prices are often advertised excluding VAT — add VAT to the monthly price before entering it if that applies to your quote.',
  },
  {
    question: 'What is cost per Mbps and why does it matter?',
    answer:
      'Cost per Mbps divides your true monthly cost by the package speed, which lets you compare a cheaper slow package against a pricier fast one on the same basis, instead of comparing headline prices for very different speeds.',
  },
  {
    question: 'Should I count cashback as reducing my monthly cost?',
    answer:
      'Only if you are confident you will actually claim it. Cashback is usually paid after a redemption process with a claim window, and unclaimed cashback is common. If in doubt, calculate the cost both with and without it.',
  },
  {
    question: 'How do I compare the total cost of two different broadband deals?',
    answer:
      'Run each deal through this calculator using its own price, contract length, setup fee and any cashback, then compare the true average monthly cost and total contract cost side by side, rather than comparing the two headline prices alone.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#tool`,
      name: 'BroadbandPicker Broadband Cost Calculator',
      url: PAGE_URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and a modern web browser',
      isAccessibleForFree: true,
      description: 'A calculator that works out the true average monthly cost and cost per Mbps of a broadband deal, including setup fees and cashback.',
      provider: { '@type': 'Organization', name: 'BroadbandPicker', url: 'https://broadbandpicker.co.uk' },
    },
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'Broadband Cost Calculator | True Monthly Cost UK',
      dateModified: REVIEWED_DATE,
      mainEntity: { '@id': `${PAGE_URL}#tool` },
      reviewedBy: { '@type': 'Organization', name: 'BroadbandPicker editorial team' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
}

export default function BroadbandCostCalculatorPage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <section className="bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14">
          <div className="[&_nav_span]:text-slate-300 [&_nav_a]:text-slate-400 [&_nav_a:hover]:text-white">
            <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Broadband cost calculator', href: '/tools/broadband-cost-calculator' }]} />
          </div>
          <header className="text-center max-w-3xl mx-auto mt-4">
            <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest">Free UK broadband cost tool</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-3">Broadband cost calculator</h1>
            <p className="text-slate-300 mt-4 text-lg leading-relaxed">
              Enter a deal&apos;s advertised price, contract length, setup fee and any cashback to see its true
              average monthly cost and cost per Mbps — so you can compare packages fairly, not just by headline price.
            </p>
            <p className="text-slate-400 mt-3 text-sm">Free to use · No registration · Reviewed {REVIEWED_DATE}</p>
          </header>
          <div className="mt-10">
            <BroadbandCostCalculator />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-slate-700">
        <section aria-labelledby="quick-answer" className="rounded-2xl border border-sky-200 bg-sky-50 p-6 sm:p-8">
          <h2 id="quick-answer" className="text-2xl font-bold text-slate-900">Why the headline price is not the true cost</h2>
          <p className="mt-3 leading-relaxed">
            A broadband deal&apos;s advertised monthly price rarely tells the whole story. One-off setup fees push the
            real average cost up, while cashback pushes it down — but only if you actually claim it. Spreading every
            charge across the full contract term gives a true average monthly cost that is comparable between deals,
            even when their pricing structure is completely different.
          </p>
        </section>

        <section className="mt-12" aria-labelledby="how-to-use">
          <h2 id="how-to-use" className="text-2xl font-bold text-slate-900">How to use this calculator</h2>
          <ol className="mt-5 grid sm:grid-cols-2 gap-4">
            {[
              ['Enter the advertised price', 'Use the exact monthly figure shown on the deal, including any packaged line rental.'],
              ['Add the contract length', 'Most UK broadband deals run 12, 18 or 24 months — check the specific deal.'],
              ['Include one-off charges', 'Add any setup or activation fee. Add cashback only if you are confident you will claim it.'],
              ['Compare cost per Mbps', 'Enter the package speed to see cost per Mbps, useful when comparing packages of different speeds.'],
            ].map(([title, body], index) => (
              <li key={title} className="border border-slate-200 rounded-xl p-5">
                <span className="text-sky-700 font-bold">Step {index + 1}</span>
                <h3 className="font-bold text-slate-900 mt-1">{title}</h3>
                <p className="text-sm mt-2 leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12" aria-labelledby="what-it-does-not-cover">
          <h2 id="what-it-does-not-cover" className="text-2xl font-bold text-slate-900">What this calculator does not cover</h2>
          <div className="mt-4 space-y-4 leading-relaxed">
            <p>
              <strong>Scheduled mid-contract price rises:</strong> many UK providers increase the price during the
              contract, often each spring. This calculator uses the price you enter for every month of the term —
              check the deal&apos;s price-change wording separately, or read our{' '}
              <Link href="/guides/broadband-price-rises-2026" className="text-sky-700 underline">guide to broadband price rises</Link>.
            </p>
            <p>
              <strong>Post-contract pricing:</strong> the price usually rises once the minimum term ends. This tool
              calculates cost within the contract term only.
            </p>
            <p>
              <strong>Address-specific availability:</strong> not every package is available at every address.
              Confirm availability before comparing costs.
            </p>
          </div>
          <p className="text-sm text-slate-500 mt-4">Methodology reviewed by the BroadbandPicker editorial team on {REVIEWED_DATE}.</p>
        </section>

        <section className="mt-12 rounded-2xl bg-slate-900 text-white p-7 sm:p-9" aria-labelledby="next-step">
          <h2 id="next-step" className="text-2xl font-bold">Ready to compare deals at your address?</h2>
          <p className="text-slate-300 mt-3 leading-relaxed">
            Run a few live deals through the calculator above, then compare true monthly cost — not just the
            advertised price — before you decide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/compare" className="text-center rounded-lg bg-sky-500 hover:bg-sky-600 px-5 py-3 font-bold">Compare options at your postcode</Link>
            <Link href="/deals" className="text-center rounded-lg border border-slate-600 px-5 py-3 font-semibold">See all current deals</Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">Availability and prices vary by address. A provider may pay us commission if you purchase after clicking through; this calculator's figures are not changed by commission.</p>
        </section>

        <section className="mt-12" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold text-slate-900">Broadband cost questions</h2>
          <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map(item => (
              <details key={item.question} className="py-5 group">
                <summary className="cursor-pointer font-bold text-slate-900 list-none flex justify-between gap-4">
                  {item.question}
                  <span aria-hidden="true" className="text-sky-600 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed max-w-3xl">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-slate-200 pt-8 text-sm" aria-labelledby="sources">
          <h2 id="sources" className="text-lg font-bold text-slate-900">Sources and editorial notes</h2>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li><a className="text-sky-700 underline" href="https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/clear-information-before-you-buy-broadband" rel="noopener noreferrer">Ofcom: Clear information before you buy broadband</a></li>
            <li><a className="text-sky-700 underline" href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/get-more-from-your-broadband" rel="noopener noreferrer">Ofcom: Get more from your broadband</a></li>
            <li><Link className="text-sky-700 underline" href="/guides/broadband-price-rises-2026">BroadbandPicker guide to broadband price rises</Link></li>
            <li><Link className="text-sky-700 underline" href="/how-we-review-broadband">BroadbandPicker review methodology</Link> and <Link className="text-sky-700 underline" href="/editorial-policy">editorial policy</Link></li>
          </ul>
          <p className="mt-4 text-slate-500">Last reviewed: {REVIEWED_DATE}. We review this page when Ofcom guidance on price transparency changes.</p>
        </section>
      </div>
    </main>
  )
}
