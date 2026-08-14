import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import SpeedTest from '@/components/SpeedTest'

const PAGE_URL = 'https://broadbandpicker.co.uk/speed-test'
const REVIEWED_DATE = '2026-08-01'

export const metadata: Metadata = {
  title: 'Free Broadband Speed Test UK',
  description:
    'Run a free UK broadband speed test. Check download speed, upload speed and ping, understand your result, then compare options available at your postcode.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Free Broadband Speed Test UK | BroadbandPicker',
    description: 'Check your download speed, upload speed and ping, then understand what the results mean.',
    url: PAGE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Broadband Speed Test UK | BroadbandPicker',
    description: 'Check your download speed, upload speed and ping for free.',
  },
}

const faqs = [
  {
    question: 'What is a good broadband speed in the UK?',
    answer:
      'A good speed depends on the household. Around 30 Mbps can support everyday browsing, HD streaming and video calls for a small household. Busy homes, simultaneous 4K streaming and large downloads benefit from 100 Mbps or more. Ofcom classifies 30 to 300 Mbps as superfast and more than 300 Mbps as ultrafast.',
  },
  {
    question: 'Why is my speed-test result lower than my advertised speed?',
    answer:
      'Wi-Fi conditions, distance from the router, other devices, network congestion and the test server can all reduce a result. Advertised or estimated speeds are not always the same as the speed reaching one device. Test with Ethernet and repeat at different times before drawing a conclusion.',
  },
  {
    question: 'Should I test over Wi-Fi or Ethernet?',
    answer:
      'Use Ethernet for the best measure of the connection reaching your router. Test over Wi-Fi as well if you want to measure the experience in a particular room. Comparing both results can reveal whether the broadband line or the home Wi-Fi is the limiting factor.',
  },
  {
    question: 'What do download speed, upload speed and ping mean?',
    answer:
      'Download speed measures how quickly data reaches you, upload speed measures how quickly you send it, and ping measures response time in milliseconds. Streaming relies mainly on download speed; video calls and cloud backups also need upload speed; gaming and calls benefit from low ping.',
  },
  {
    question: 'What should I do if my broadband is consistently slow?',
    answer:
      'Restart the router, test with Ethernet, pause other traffic and repeat the test at different times. Compare the results with the minimum guaranteed speed in your contract. If results remain below it, record the tests and contact your provider before considering a switch.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#tool`,
      name: 'BroadbandPicker UK Broadband Speed Test',
      url: PAGE_URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and a modern web browser',
      isAccessibleForFree: true,
      description: 'A browser-based test measuring broadband download speed, upload speed and ping.',
      provider: { '@type': 'Organization', name: 'BroadbandPicker', url: 'https://broadbandpicker.co.uk' },
    },
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'Free Broadband Speed Test UK',
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

const speedRows = [
  ['Under 10 Mbps', 'Slow', 'Basic browsing and email on one device'],
  ['10–30 Mbps', 'Everyday', 'Browsing, video calls and HD streaming for 1–2 people'],
  ['30–100 Mbps', 'Superfast', 'Several users, streaming and working from home'],
  ['100–300 Mbps', 'Fast', 'Busy homes, 4K streaming and large downloads'],
  ['Over 300 Mbps', 'Ultrafast', 'Many devices, creators and frequent large transfers'],
]

export default function SpeedTestPage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <section className="bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14">
          <div className="[&_nav_span]:text-slate-300 [&_nav_a]:text-slate-400 [&_nav_a:hover]:text-white">
            <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Broadband speed test', href: '/speed-test' }]} />
          </div>
          <header className="text-center max-w-3xl mx-auto mt-4">
            <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest">Free UK internet speed checker</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-3">Broadband speed test</h1>
            <p className="text-slate-300 mt-4 text-lg leading-relaxed">
              Measure your download speed, upload speed and ping in your browser. For the most useful result,
              stop large downloads and test once over Wi-Fi and once with an Ethernet cable.
            </p>
            <p className="text-slate-400 mt-3 text-sm">Free to use · No registration · Reviewed {REVIEWED_DATE}</p>
          </header>
          <SpeedTest />
          <aside className="max-w-2xl mx-auto border border-slate-700 bg-slate-900 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Independent comparison disclosure:</strong> the test is free and its result is
            not changed by commercial relationships. If you follow a comparison link and buy a service, we may receive
            commission from the provider. This does not increase the price you pay.{' '}
            <Link href="/how-we-make-money" className="text-sky-400 underline">How we make money</Link>.
          </aside>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-slate-700">
        <section aria-labelledby="quick-answer" className="rounded-2xl border border-sky-200 bg-sky-50 p-6 sm:p-8">
          <h2 id="quick-answer" className="text-2xl font-bold text-slate-900">What your broadband speed-test result tells you</h2>
          <p className="mt-3 leading-relaxed">
            Your result is a snapshot of the connection between your device and our test server. Download speed affects
            streaming and web use, upload speed affects video calls and file sharing, and ping affects responsiveness.
            One test is not proof of line performance: repeat it at different times and compare Wi-Fi with Ethernet.
          </p>
        </section>

        <section className="mt-12" aria-labelledby="speed-meaning">
          <h2 id="speed-meaning" className="text-2xl font-bold text-slate-900">Is your broadband speed good?</h2>
          <p className="mt-3 leading-relaxed">
            There is no single perfect speed. The useful benchmark is whether your connection supports everyone&apos;s
            activity reliably. These bands are practical guidance, not a guarantee for every app or household.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 mt-6">
            <table className="w-full text-sm">
              <caption className="sr-only">Broadband speed bands and common household uses</caption>
              <thead className="bg-slate-900 text-white"><tr>{['Measured download', 'Guide', 'Typically suitable for'].map(value => <th key={value} scope="col" className="text-left px-4 py-3">{value}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-200">{speedRows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={cell} className={`px-4 py-3 ${index === 0 ? 'font-semibold text-slate-900' : ''}`}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="text-sm mt-4 text-slate-600">
            Terminology aligned with{' '}<a href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/get-more-from-your-broadband" rel="noopener noreferrer" className="text-sky-700 underline">Ofcom&apos;s broadband speed guidance</a>:
            superfast is 30–300 Mbit/s and ultrafast is above 300 Mbit/s.
          </p>
        </section>

        <section className="mt-12" aria-labelledby="accurate-test">
          <h2 id="accurate-test" className="text-2xl font-bold text-slate-900">How to run a more accurate broadband speed test</h2>
          <ol className="mt-5 grid sm:grid-cols-2 gap-4">
            {[
              ['Pause other traffic', 'Stop streaming, cloud backups, games and large downloads on other devices.'],
              ['Test near the router', 'Start beside the router over Wi-Fi, then use Ethernet if your device supports it.'],
              ['Repeat the test', 'Run at least three tests, including an evening test when networks may be busier.'],
              ['Record the evidence', 'Save the date, time, connection type and results if you need to contact your provider.'],
            ].map(([title, body], index) => <li key={title} className="border border-slate-200 rounded-xl p-5"><span className="text-sky-700 font-bold">Step {index + 1}</span><h3 className="font-bold text-slate-900 mt-1">{title}</h3><p className="text-sm mt-2 leading-relaxed">{body}</p></li>)}
          </ol>
        </section>

        <section className="mt-12" aria-labelledby="methodology">
          <h2 id="methodology" className="text-2xl font-bold text-slate-900">How BroadbandPicker measures your connection</h2>
          <div className="mt-4 space-y-4 leading-relaxed">
            <p><strong>Ping:</strong> five small requests are sent to the server; the median round-trip time is reported in milliseconds to reduce the effect of one unusual request.</p>
            <p><strong>Download:</strong> your browser receives a test payload and calculates megabits transferred per second. <strong>Upload:</strong> it sends a test payload and measures the transfer rate.</p>
            <p><strong>Limitations:</strong> this browser test measures the route to our server, not the access-line speed inside your provider&apos;s network. Wi-Fi, device capability, browser load, routing and congestion can affect it. We do not claim Ofcom accreditation.</p>
          </div>
          <p className="text-sm text-slate-500 mt-4">Methodology reviewed by the BroadbandPicker editorial team on 1 August 2026.</p>
        </section>

        <section className="mt-12 rounded-2xl bg-slate-900 text-white p-7 sm:p-9" aria-labelledby="slow-result">
          <h2 id="slow-result" className="text-2xl font-bold">What to do if your broadband is slower than expected</h2>
          <p className="text-slate-300 mt-3 leading-relaxed">Test with Ethernet, restart your router and compare repeated results with the minimum guaranteed speed stated in your contract. If the shortfall continues, keep your results and contact the provider. Ofcom explains the speed information providers should give customers before purchase.</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/compare" className="text-center rounded-lg bg-sky-500 hover:bg-sky-600 px-5 py-3 font-bold">Compare options at your postcode</Link>
            <Link href="/guides/broadband-speeds-explained" className="text-center rounded-lg border border-slate-600 px-5 py-3 font-semibold">Read the broadband speed guide</Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">Availability and speeds vary by address. A provider may pay us commission if you purchase after clicking through; rankings are not changed by commission.</p>
        </section>

        <section className="mt-12" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold text-slate-900">Broadband speed-test questions</h2>
          <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map(item => <details key={item.question} className="py-5 group"><summary className="cursor-pointer font-bold text-slate-900 list-none flex justify-between gap-4">{item.question}<span aria-hidden="true" className="text-sky-600 group-open:rotate-45">+</span></summary><p className="mt-3 leading-relaxed max-w-3xl">{item.answer}</p></details>)}
          </div>
        </section>

        <section className="mt-12 border-t border-slate-200 pt-8 text-sm" aria-labelledby="sources">
          <h2 id="sources" className="text-lg font-bold text-slate-900">Sources and editorial notes</h2>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li><a className="text-sky-700 underline" href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/get-more-from-your-broadband" rel="noopener noreferrer">Ofcom: Get more from your broadband</a></li>
            <li><a className="text-sky-700 underline" href="https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/clear-information-before-you-buy-broadband" rel="noopener noreferrer">Ofcom: Clear information before you buy broadband</a></li>
            <li><Link className="text-sky-700 underline" href="/how-we-review-broadband">BroadbandPicker review methodology</Link> and <Link className="text-sky-700 underline" href="/editorial-policy">editorial policy</Link></li>
          </ul>
          <p className="mt-4 text-slate-500">Last tested and reviewed: 1 August 2026. We review this page when the test method or relevant Ofcom guidance changes.</p>
        </section>
      </div>
    </main>
  )
}
