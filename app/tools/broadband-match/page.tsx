import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import BroadbandMatchQuiz from '@/components/BroadbandMatchQuiz'
import PostcodeContextBar from '@/components/PostcodeContextBar'
import { providers } from '@/data/providers'
import { JsonLd } from '@/lib/jsonLd'
import { softwareApplicationJsonLd } from '@/lib/siteSchema'

const PAGE_URL = 'https://broadbandpicker.co.uk/tools/broadband-match'
const REVIEWED_DATE = '2026-08-22'

export const metadata: Metadata = {
  title: 'What Broadband Speed Do You Need? Free Match Tool',
  description:
    'Most homes need at least 30-50 Mbps, more for gaming, 4K streaming or working from home. Answer 6 quick questions and get a personalised, ranked broadband provider match — free.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'What Broadband Speed Do You Need? | BroadbandPicker',
    description: 'Answer 6 quick questions and get a personalised, ranked broadband provider match.',
    url: PAGE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Broadband Speed Do You Need? | BroadbandPicker',
    description: 'Get your personalised broadband match in under a minute.',
  },
}

const activityBySpeed = [
  ['Everyday browsing and email', '30 Mbps', 'Ofcom\'s baseline for "decent" broadband'],
  ['HD streaming, one device', '40 Mbps', 'Comfortable single-stream HD with headroom'],
  ['Online gaming', '50 Mbps', 'Latency matters more than raw speed, but this avoids congestion'],
  ['Working from home / video calls', '45 Mbps down, 25 Mbps up', 'Upload matters as much as download for calls'],
  ['4K streaming', '55 Mbps', 'Higher bitrate per stream than HD'],
  ['Large household, 5+ people, mixed use', '100 Mbps+', 'Multiple simultaneous activities need real headroom'],
]

const householdBands = [
  ['1–2 people, light use', '30-40 Mbps', 'Browsing, email, occasional streaming'],
  ['1–2 people, WFH or gaming', '50-60 Mbps', 'Add headroom for calls or online gaming'],
  ['3–4 people, mixed use', '60-100 Mbps', 'Several devices active at once'],
  ['5+ people or a smart home', '100-300 Mbps', 'Multiple 4K streams, gaming and smart devices together'],
]

const faqs = [
  {
    question: 'What broadband speed do I actually need?',
    answer:
      'Most UK homes need at least 30-50 Mbps for everyday browsing and one HD stream. Add roughly 20 Mbps for online gaming, 25 Mbps for 4K streaming, and 15 Mbps upload for frequent video calls. A household of 5 or more people with mixed use typically needs 100 Mbps or more.',
  },
  {
    question: 'How much internet speed do I need for working from home?',
    answer:
      'Around 45 Mbps download and 25 Mbps upload comfortably covers video calls, cloud file access and everyday tasks for one home worker. Upload speed matters as much as download here, since video calls send data continuously — check both figures, not just the headline download number.',
  },
  {
    question: 'Is a broadband speed test enough to know what I need?',
    answer:
      'A speed test tells you what you currently get, not what you actually need. Our free speed test measures your live connection; this match tool works out the right target speed and provider for your household from your actual use case, then checks that against real package data.',
  },
  {
    question: 'How does the Broadband Match tool decide my recommendation?',
    answer:
      'It combines your household size, use cases and budget into a minimum speed target, then checks live provider data — price, matched package speed, contract length and Trustpilot score — to rank the providers that genuinely fit. It does not accept payment to change the ranking.',
  },
  {
    question: 'Does this tool check exact availability at my address?',
    answer:
      'It uses area-level coverage signals, not a live per-address check. Always confirm exact availability and package pricing on the provider\'s own site before ordering — the same final step every broadband comparison site relies on.',
  },
]

const toolGraph = softwareApplicationJsonLd({
  name: 'BroadbandPicker Broadband Match',
  url: PAGE_URL,
  description:
    'A 6-question tool that recommends personalised, ranked UK broadband providers based on household size, use case and budget.',
  dateModified: REVIEWED_DATE,
})
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    ...toolGraph['@graph'],
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

export default function BroadbandMatchPage() {
  return (
    <main className="bg-white">
      <JsonLd data={jsonLd} />

      <section className="bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="[&_nav_span]:text-slate-300 [&_nav_a]:text-slate-400 [&_nav_a:hover]:text-white">
            <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Broadband Match', href: '/tools/broadband-match' }]} />
          </div>
          <header className="text-center max-w-2xl mx-auto mt-4 mb-10">
            <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest">Free 60-second match tool</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-3 leading-tight">
              What broadband speed do you need?
            </h1>
            <p className="text-slate-300 mt-4 text-lg leading-relaxed">
              Most homes need at least 30-50 Mbps — more for gaming, 4K streaming or working from
              home. Answer 6 quick questions and we&apos;ll rank the UK providers that actually fit
              your household, not just the cheapest headline price.
            </p>
          </header>
          <BroadbandMatchQuiz providers={providers} />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-slate-700">
        <PostcodeContextBar />
        <section aria-labelledby="quick-answer" className="rounded-2xl border border-sky-200 bg-sky-50 p-6 sm:p-8">
          <h2 id="quick-answer" className="text-2xl font-bold text-slate-900">Broadband speed by activity, at a glance</h2>
          <p className="mt-3 leading-relaxed">
            Most UK homes need at least 30 Mbps for everyday use. Gaming needs roughly 50 Mbps to
            avoid congestion, 4K streaming needs around 55 Mbps, and working from home needs both
            decent download and upload — around 45 Mbps down and 25 Mbps up for smooth video calls.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 mt-6">
            <table className="w-full text-sm">
              <caption className="sr-only">Recommended broadband speed by activity</caption>
              <thead className="bg-slate-900 text-white">
                <tr>{['Activity', 'Recommended minimum', 'Why'].map((v) => <th key={v} scope="col" className="text-left px-4 py-3">{v}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activityBySpeed.map((row) => (
                  <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={`px-4 py-3 ${i === 0 ? 'font-semibold text-slate-900' : ''}`}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="by-household">
          <h2 id="by-household" className="text-2xl font-bold text-slate-900">Or work it out by household size</h2>
          <p className="mt-3 leading-relaxed">
            Activity is only half the picture — more people and devices sharing one connection need
            more headroom, even for the same activities. Use whichever cut is easier to answer for
            your home.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 mt-6">
            <table className="w-full text-sm">
              <caption className="sr-only">Recommended broadband speed by household size</caption>
              <thead className="bg-slate-900 text-white">
                <tr>{['Household', 'Recommended minimum', 'Why'].map((v) => <th key={v} scope="col" className="text-left px-4 py-3">{v}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {householdBands.map((row) => (
                  <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={`px-4 py-3 ${i === 0 ? 'font-semibold text-slate-900' : ''}`}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl font-bold text-slate-900">How Broadband Match works</h2>
          <div className="mt-4 space-y-4 leading-relaxed">
            <p>
              The tool above combines your household size and use cases into a target minimum speed
              — using the same activity-based figures as the tables above — then checks that target
              against real UK provider data: the cheapest package that actually meets it, monthly
              price, contract length and Trustpilot score.
            </p>
            <p>
              It ranks providers by how well they fit, not by which pays the highest commission, and
              shows the specific reasoning behind each match. If a postcode is entered, it also flags
              when full-fibre availability looks limited in that area — a plausibility signal, not a
              confirmed address-level check.
            </p>
          </div>
          <p className="text-sm text-slate-500 mt-4">Methodology reviewed by the BroadbandPicker editorial team on {REVIEWED_DATE}.</p>
        </section>

        <section className="mt-12 rounded-2xl bg-slate-900 text-white p-7 sm:p-9" aria-labelledby="next-step">
          <h2 id="next-step" className="text-2xl font-bold">Want to compare everything yourself instead?</h2>
          <p className="text-slate-300 mt-3 leading-relaxed">
            The match tool is a shortcut — you can always browse every deal and provider directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/compare" className="text-center rounded-lg bg-sky-500 hover:bg-sky-600 px-5 py-3 font-bold">Compare all providers</Link>
            <Link href="/deals" className="text-center rounded-lg border border-slate-600 px-5 py-3 font-semibold">See all current deals</Link>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="related-guides">
          <h2 id="related-guides" className="text-2xl font-bold text-slate-900">Speed and use-case guides</h2>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            {[
              ['/guides/best-broadband-for-gaming-uk', 'Best broadband for gaming'],
              ['/guides/best-broadband-for-working-from-home', 'Best broadband for working from home'],
              ['/guides/best-broadband-for-streaming', 'Best broadband for streaming'],
              ['/guides/broadband-speeds-explained', 'Broadband speeds explained'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="block rounded-xl border border-slate-200 p-4 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                <span className="font-semibold text-slate-900">{label}</span>
                <span className="block text-sm text-slate-500 mt-1">Read the full guide &rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold text-slate-900">Broadband speed and matching questions</h2>
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
            <li><a className="text-sky-700 underline" href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/get-more-from-your-broadband" rel="noopener noreferrer">Ofcom: Get more from your broadband</a></li>
            <li><a className="text-sky-700 underline" href="https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024" rel="noopener noreferrer">Ofcom Connected Nations: postcode-level coverage data</a></li>
            <li><Link className="text-sky-700 underline" href="/how-we-review-broadband">BroadbandPicker review methodology</Link> and <Link className="text-sky-700 underline" href="/editorial-policy">editorial policy</Link></li>
          </ul>
          <p className="mt-4 text-slate-500">Last reviewed: {REVIEWED_DATE}. Speed recommendations follow Ofcom&apos;s published broadband guidance.</p>
        </section>
      </div>
    </main>
  )
}
