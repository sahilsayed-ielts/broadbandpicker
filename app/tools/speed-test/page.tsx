import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import SpeedTest from '@/components/SpeedTest'
import PostcodeContextBar from '@/components/PostcodeContextBar'
import { JsonLd } from '@/lib/jsonLd'
import { softwareApplicationJsonLd } from '@/lib/siteSchema'
import PageHeroBanner from '@/components/PageHeroBanner'
import { DEFAULT_GUIDE_CTAS, categoryHero } from '@/lib/pageHero'

const HERO = categoryHero('technology-and-speeds')

const PAGE_URL = 'https://broadbandpicker.co.uk/tools/speed-test'
const REVIEWED_DATE = '2026-09-27'

export const metadata: Metadata = {
  title: 'Free Broadband Speed Test UK: Check Download, Upload & Ping',
  description:
    'Run a free UK broadband speed test and check download, upload, ping and jitter. See what your result means, test Wi-Fi against Ethernet, and compare broadband options at your postcode.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Free Broadband Speed Test UK: Download, Upload & Ping | BroadbandPicker',
    description: 'Check download, upload, ping and jitter, then understand your UK broadband result.',
    url: PAGE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Broadband Speed Test UK | BroadbandPicker',
    description: 'Check download, upload, ping and jitter for free, then understand your result.',
  },
}

const faqs = [
  {
    question: 'What is a good broadband speed in the UK?',
    answer:
      'A good speed depends on the household and the stability of the connection. Around 30 Mbps can support browsing, HD streaming and video calls for a small household. Busy homes, simultaneous 4K streams and large downloads benefit from 100 Mbps or more. Also check upload speed, ping and jitter rather than judging the connection from download speed alone.',
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
  {
    question: 'Why does the speed test ask for my location?',
    answer:
      'The browser may ask for your location so we can confirm you are in the UK and attach the nearest postcode district to your result. That helps you compare deals for your area. The speed measurement still runs to our London server. You can allow this visit, allow this time, or never allow. The test still works if you decline.',
  },
]

const toolGraph = softwareApplicationJsonLd({
  name: 'BroadbandPicker UK Broadband Speed Test',
  url: PAGE_URL,
  description: 'A browser-based test measuring broadband download speed, upload speed and ping.',
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
      <JsonLd data={jsonLd} />
      <PageHeroBanner
        title="Broadband speed test"
        kicker="Free UK internet speed checker"
        lede="Measure your download speed, upload speed and ping in your browser. For the most useful result, stop large downloads and test once over Wi-Fi and once with an Ethernet cable."
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-700">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: 'Tools', href: '/tools' },
            { name: 'Broadband speed test', href: '/tools/speed-test' },
          ]}
        />
        <p className="mb-6 text-sm text-slate-500">Free to use · No registration · Method reviewed 27 September 2026</p>
        <section aria-labelledby="answer-first" className="mb-8 rounded-2xl border border-sky-200 bg-sky-50 p-6 sm:p-8">
          <h2 id="answer-first" className="text-2xl font-bold text-slate-900">What does a broadband speed test measure?</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            This free UK broadband speed test measures the connection between your device and our London test server:
            download speed for receiving data, upload speed for sending it, ping for responsiveness and jitter for
            consistency. Run it once near your router over Wi-Fi and again over Ethernet for the clearest diagnosis;
            one result is a snapshot, not a guarantee of your provider&apos;s advertised speed.
          </p>
        </section>
        <SpeedTest />
        <aside className="mt-6 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          <strong className="text-slate-900">Independent comparison disclosure:</strong> the test is free and its result is
          not changed by commercial relationships. If you follow a comparison link and buy a service, we may receive
          commission from the provider. This does not increase the price you pay.{' '}
          <Link href="/how-we-make-money" className="font-semibold text-sky-700 underline">How we make money</Link>.
        </aside>
        <PostcodeContextBar />
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
            <p><strong>Ping and jitter:</strong> two warmup requests are discarded, then ten sequential requests to our London server. The headline ping is the median. Jitter is the mean gap between consecutive samples, which is closer to how a call feels than a single round trip.</p>
            <p><strong>Download and upload:</strong> the tester opens several parallel connections for eight seconds and ignores the first two seconds of TCP slow start. The headline figure is the 90th percentile of the remaining samples, the same idea Ookla uses to report a filled path rather than bytes divided by the whole clock. A sustain figure is the median of the last three seconds. Loaded ping is sampled during download to show bufferbloat.</p>
            <p><strong>Payloads:</strong> download bytes are high-entropy and sent with <code>Content-Encoding: identity</code> so compression cannot inflate the result. Upload uses random bytes for the same reason.</p>
            <p><strong>Location:</strong> if you allow it, the browser asks for your location in the usual way (this visit, while visiting the site, or never). We use the coordinates only to look up the nearest UK postcode district through postcodes.io, then store that postcode locally like the postcode checker. Coordinates are not sent to analytics. The speed measurement still uses our London server.</p>
            <p><strong>Limitations:</strong> this browser test measures the route to our London server, not the access-line speed inside your provider&apos;s network and not a dedicated Ookla or thinkbroadband probe. Wi-Fi, device radios, browser limits, routing and congestion can cap it. We do not claim Ofcom accreditation. Ethernet still beats Wi-Fi for a line diagnosis.</p>
          </div>
          <p className="text-sm text-slate-500 mt-4">Methodology reviewed by the BroadbandPicker editorial team on 27 September 2026.</p>
        </section>

        <section className="mt-12" aria-labelledby="compare-tests">
          <h2 id="compare-tests" className="text-2xl font-bold text-slate-900">Why speed-test results differ</h2>
          <p className="mt-3 leading-relaxed">
            Different speed tests can show different numbers because they use different servers, routes, connection
            counts and scoring windows. Compare like with like: use the same device and room, repeat at the same time,
            and record whether the test used Wi-Fi or Ethernet. A higher number is not automatically a better diagnosis
            if the test hides upload speed, latency under load or the measurement method.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900">For a line fault</h3>
              <p className="mt-2 text-sm leading-relaxed">Use Ethernet beside the router, pause other traffic and compare repeated results with the minimum guaranteed speed in your contract.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900">For everyday Wi-Fi</h3>
              <p className="mt-2 text-sm leading-relaxed">Test in the room where the problem occurs. A lower result may describe Wi-Fi coverage or interference rather than the broadband line.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-slate-900 text-white p-7 sm:p-9" aria-labelledby="slow-result">
          <h2 id="slow-result" className="text-2xl font-bold">What to do if your broadband is slower than expected</h2>
          <p className="text-slate-300 mt-3 leading-relaxed">Test with Ethernet, restart your router and compare repeated results with the minimum guaranteed speed stated in your contract. If the shortfall continues, keep your results and contact the provider. Ofcom explains the speed information providers should give customers before purchase.</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/compare" className="text-center rounded-lg bg-sky-500 hover:bg-sky-600 px-5 py-3 font-bold">Compare options at your postcode</Link>
            <Link href="/guides/broadband-speeds-explained" className="text-center rounded-lg border border-slate-600 px-5 py-3 font-semibold">Read the broadband speed guide</Link>
            <Link href="/guides/does-a-vpn-slow-your-internet" className="text-center rounded-lg border border-slate-600 px-5 py-3 font-semibold">Test VPN speed loss fairly</Link>
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
            <li><a className="text-sky-700 underline" href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" rel="noopener noreferrer">Google Search Central: Creating helpful, reliable, people-first content</a></li>
            <li><a className="text-sky-700 underline" href="https://www.speedtest.net/about/knowledge/faq" rel="noopener noreferrer">Ookla Speedtest: what a result measures</a></li>
            <li><a className="text-sky-700 underline" href="https://www.uswitch.com/broadband/speedtest/" rel="noopener noreferrer">Uswitch: how download and upload payloads are sized</a></li>
            <li><a className="text-sky-700 underline" href="https://postcodes.io" rel="noopener noreferrer">postcodes.io: UK postcode lookup used only after you allow location</a></li>
            <li><Link className="text-sky-700 underline" href="/how-we-review-broadband">BroadbandPicker review methodology</Link> and <Link className="text-sky-700 underline" href="/editorial-policy">editorial policy</Link></li>
          </ul>
            <p className="mt-4 text-slate-500">Last tested and reviewed: 27 September 2026. We review this page when the test method or relevant Ofcom guidance changes.</p>
        </section>
      </div>
    </main>
  )
}
