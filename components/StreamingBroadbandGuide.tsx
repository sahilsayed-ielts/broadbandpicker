import Image from 'next/image'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import CiteableAnswer from '@/components/CiteableAnswer'
import FAQAccordion from '@/components/FAQAccordion'
import OnThisPageNav from '@/components/OnThisPageNav'
import PostcodeContextBar from '@/components/PostcodeContextBar'
import DealTable from '@/components/DealTable'
import PageHeroBanner from '@/components/PageHeroBanner'
import { JsonLd } from '@/lib/jsonLd'
import { articleJsonLd } from '@/lib/siteSchema'
import { getGuideBySlug } from '@/data/guides'
import { getTopDeals } from '@/data/providers'

const PAGE_PATH = '/guides/best-broadband-for-streaming'
const PAGE_URL = `https://broadbandpicker.co.uk${PAGE_PATH}`
const BANNER = '/guides/streaming/banner.jpg'

const faqs = [
  {
    question: 'What broadband speed do I need for streaming?',
    answer:
      'Size the line to simultaneous use, not to one app’s minimum. Netflix recommends 5 Mbps for Full HD and 15 Mbps for 4K. Disney+ asks for 5 Mbps for HD, 8 Mbps for live content and 25 Mbps for 4K UHD. YouTube lists 20 Mbps for 4K UHD. Sky Stream recommends 25 Mbps, or 30 Mbps for UHD or an extra puck. A family with two 4K TVs plus phones needs more headroom than a one-screen home.',
  },
  {
    question: 'What speed do I need for 4K?',
    answer:
      'The official per-stream figures are 15 Mbps on Netflix, 20 Mbps on YouTube and 25 Mbps on Disney+ 4K UHD. Sky recommends 30 Mbps for UHD on Glass or Stream. BBC iPlayer asks for 24 Mbit/s for full 3840-pixel Ultra HD, or 12 Mbit/s for 2560-pixel Ultra HD. Those numbers are for one stream. Two 4K TVs at kick-off, plus a laptop, need several times that plus Wi-Fi that actually reaches the living room.',
  },
  {
    question: 'Is 100 Mbps enough for 4K streaming?',
    answer:
      'Yes for one 4K stream and ordinary background use, if the measured speed at the television holds near 100 Mbps. Netflix’s 15 Mbps 4K figure leaves plenty of room on a genuine 100 Mbps line. It is tight if two or three 4K streams start together, someone is on a video call, or evening FTTC or cable congestion knocks the line well below the advertised average. Check the personalised minimum, not the shop-window number.',
  },
  {
    question: 'Is 300 Mbps enough for 4K streaming?',
    answer:
      'For almost every UK streaming household, yes. 300 Mbps covers several 4K streams, phones and a games console with headroom. Gigabit is rarely the streaming upgrade. The usual failure is a copper cabinet that drops in the evening, or Wi-Fi that dies behind the sofa, not a missing 700 Mbps. Full fibre at 150 to 300 Mbps, with Ethernet to the main TV, beats a faster cable package that shares a busy node.',
  },
  {
    question: 'Why does streaming buffer in the evening?',
    answer:
      'FTTC and many cable connections share capacity at the street cabinet or node. Between about 7pm and 10pm, and at 3pm on a Saturday, neighbouring homes pull 4K at the same time and your speed can fall even if the contract looks fine at noon. Full fibre is far less affected because each property has its own fibre. Weak Wi-Fi in the TV room causes the same symptoms. Test beside the router and at the television.',
  },
  {
    question: 'What is the best internet package for streaming?',
    answer:
      'The best package is the one that still meets the written speed estimate at your address when several people watch at once. Prefer full fibre where it is available. Match the tier to simultaneous 4K streams rather than buying gigabit by default. A Sky or Virgin TV bundle only helps if you will use those channels. Compare the whole-term price and the minimum speed guarantee, then check coverage with a postcode, not a national ranking.',
  },
  {
    question: 'Which broadband and TV provider is the best in the UK?',
    answer:
      'There is no single winner. Sky is the usual starting point if you want Sky Sports or Sky TV on the same bill. Virgin Media can suit a heavy entertainment household where its network reaches. EE TV is an alternative when you want NOW-based entertainment or TNT Sports with broadband. Rights and apps are a separate decision from the line. See our broadband and TV deals guide, then check what actually serves the address.',
  },
  {
    question: 'What are the best broadband deals that include streaming services?',
    answer:
      'Sky, Virgin Media and EE all sell broadband with TV or streaming packs. A bundle only saves money if you would have paid for those channels anyway. Ofcom has found bundling can cut bills, but only when the extras are used. NOW Sports and HBO Max TNT Sports can be bought without Sky or Virgin broadband. We may earn a commission on broadband sign-ups through Get Deal. We do not currently earn a commission on NOW, Netflix or Disney+.',
  },
  {
    question: 'Do I need gigabit broadband for Netflix?',
    answer:
      'Usually no. Netflix recommends 15 Mbps for Ultra HD and says High quality 4K can use up to 7 GB per hour per device. A stable 50 to 100 Mbps full-fibre line is enough for one or two 4K Netflix streams. Gigabit becomes relevant when the home also games, works from home, backs up to the cloud and runs several 4K TVs at once, or when you want extra margin on a congested shared network.',
  },
  {
    question: 'Is live football harder on broadband than Netflix?',
    answer:
      'It can be. On-demand video can buffer ahead. Live Premier League, F1 and other kick-off streams have less room to hide a dip. Disney+ recommends 8 Mbps specifically for live content, above its 5 Mbps HD figure. Sky Stream still wants 25 Mbps at the puck. The bigger issue is that half the street starts the same match together. A dedicated full-fibre line and Ethernet to the main TV matter more than a gigabit sticker.',
  },
]

const toc = [
  { href: '#kick-off', label: 'Match night versus a Tuesday film' },
  { href: '#speeds', label: 'Official app speeds' },
  { href: '#4k', label: 'How many 4K streams' },
  { href: '#evening', label: 'Evening and kick-off congestion' },
  { href: '#wifi', label: 'The television and Wi-Fi' },
  { href: '#sport', label: 'Live sport and 4K football' },
  { href: '#tv', label: 'TV rights are not broadband' },
  { href: '#packages', label: '100, 300 or gigabit' },
  { href: '#faq', label: 'FAQs' },
]

export default function StreamingBroadbandGuide() {
  const guide = getGuideBySlug('best-broadband-for-streaming')
  if (!guide) return null
  const deals = getTopDeals(4)
  const updated = new Date(guide.updatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const article = articleJsonLd({
    headline: guide.title,
    description: guide.metaDescription,
    url: PAGE_URL,
    datePublished: guide.publishDate,
    dateModified: guide.updatedDate,
    image: `https://broadbandpicker.co.uk${BANNER}`,
    articleSection: 'Use Cases and Lifestyle',
    citation: (guide.sources ?? [])
      .filter((source) => source.href.startsWith('http'))
      .map((source) => source.href),
  })

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Choose UK broadband for 4K streaming and live sport',
    description:
      'Count simultaneous streams, check official app minimums, test at the television, then compare the written speed estimate for the address.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Count simultaneous streams',
        text: 'Note how many 4K televisions, tablets and phones will watch at the same time, especially at kick-off.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Check the app minimums',
        text: 'Use the publisher figures: Netflix 15 Mbps for 4K, Disney+ 25 Mbps for 4K UHD, YouTube 20 Mbps, Sky Stream 25 Mbps or 30 Mbps for UHD.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Test at the television',
        text: 'Run a speed test beside the router and in the TV room. If Ethernet is fast and Wi-Fi is not, fix coverage before buying a faster package.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Compare the written estimate',
        text: 'Check advertised average speed, the personalised minimum guarantee and whether full fibre is available at the address.',
      },
    ],
  }

  return (
    <article>
      <JsonLd data={article} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={howToJsonLd} />

      <PageHeroBanner
        title="Best Broadband for Streaming UK"
        kicker="Match night · 4K streaming"
        lede="A Tuesday Netflix episode can hide a slow cabinet. A 4K football stream cannot. Count the screens, check the official app speeds, then compare the written estimate for your address. The sports login is a different bill."
        image={BANNER}
        imageAlt="Four people on a sofa watching a football match on a large living-room television, original BroadbandPicker artwork. Not official Premier League, Sky or Netflix photography."
        accent="emerald"
        ctas={[
          { href: '/tools/speed-test', label: 'Test your speed first', variant: 'primary' },
          { href: '/compare', label: 'Check full fibre at your address', variant: 'secondary' },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: 'Guides', href: '/guides' },
            { name: 'Best broadband for streaming', href: PAGE_PATH },
          ]}
        />
        <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6 text-sm text-slate-500">
          <span>Updated {updated}</span>
          <span>·</span>
          <span>{guide.readingTime} min read</span>
          <span>·</span>
          <span>Reviewed by BroadbandPicker editorial team</span>
        </div>

        <CiteableAnswer title="The quick answer">{guide.excerpt}</CiteableAnswer>
        <OnThisPageNav links={toc} />
        <PostcodeContextBar />

        <section className="mb-10 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">Key takeaways</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {guide.keyTakeaways?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="kick-off" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">Match night is not a Tuesday film</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            On-demand video can buffer a few seconds ahead. Live sport cannot. When a Premier
            League kick-off or an F1 lights-out starts, the stream has to keep arriving. The
            same thing happens in a house where two 4K televisions, a tablet and a laptop all
            start together. The useful number is not the fastest advertised average in Britain.
            It is whether the line still holds those streams at 3pm on a Saturday, and again
            between 7pm and 10pm.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            FIFA World Cup 2026 already ran from June. The broadband lesson did not leave with
            the trophy. BBC iPlayer still publishes Ultra HD figures for live events, and the
            Saturday 3pm pile-up on a shared cabinet is the same physics. Treat this page as a
            live-sport and multi-room streaming guide, not a countdown to a tournament that has
            finished.
          </p>
        </section>

        <section id="speeds" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Official speeds, not forum guesses</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Streaming apps publish their own recommended speeds. They are per stream, on a
            stable connection, and they assume the television can actually use that quality.
            They are not a household package size.
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Publisher recommendations checked 15 September 2026. One stream, not a whole home.
              </caption>
              <thead>
                <tr className="bg-slate-50">
                  {['Service', 'HD / Full HD', '4K / UHD or live', 'Source'].map((heading) => (
                    <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Netflix', '3 Mbps (720p), 5 Mbps (1080p)', '15 Mbps for UHD / 4K', 'help.netflix.com/node/306'],
                  ['Disney+', '5 Mbps for HD', '8 Mbps live, 25 Mbps 4K UHD', 'Disney+ Help, recommended speeds'],
                  ['YouTube', '2.5 Mbps (720p), 5 Mbps (1080p)', '20 Mbps for 4K UHD', 'Google Support answer 78358'],
                  ['Sky Stream / Glass', '25 Mbps recommended minimum', '30 Mbps for UHD or an extra puck', 'Sky Glass FAQs'],
                  ['BBC iPlayer', 'Up to 5 Mbps HD, 1.5 Mbps SD', '24 Mbit/s full 3840-pixel UHD', 'BBC iPlayer Help'],
                ].map(([service, hd, uhd, source]) => (
                  <tr key={service}>
                    <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">
                      {service}
                    </th>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{hd}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{uhd}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-600">{source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 leading-relaxed text-slate-700">
            Netflix also says High data usage for Ultra HD can reach{' '}
            <a href="https://help.netflix.com/en/node/87" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              7 GB per hour per device
            </a>
            . Disney+ Help lists about 7.7 GB per hour on a TV set to Automatic 4K UHD. Those
            are data-use figures, not extra megabits you must buy. Unlimited home broadband
            still has to deliver the bits in real time. We have not invented NOW or Amazon Prime
            Video megabit figures here. For Sky Sports picture add-ons, use our{' '}
            <Link href="/guides/cheapest-way-to-watch-sky-sports-uk" className="font-semibold text-sky-700 hover:underline">
              Sky Sports and TNT Sports cost guide
            </Link>
            .
          </p>
        </section>

        <figure className="my-10">
          <Image
            src="/guides/streaming/multi-device.jpg"
            alt="A UK living room with a television, a laptop on the coffee table and someone on a tablet, original BroadbandPicker artwork."
            width={1600}
            height={900}
            className="rounded-2xl border border-slate-200"
          />
          <figcaption className="mt-2 text-sm text-slate-500">
            One 4K stream is cheap in megabits. Three screens and a work laptop at 8pm is the
            actual package size.
          </figcaption>
        </figure>

        <section id="4k" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">How many 4K streams share the line?</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Add the publisher figures, then leave headroom. Two Disney+ 4K streams are already
            50 Mbps of recommendation before anyone opens YouTube on a phone. A Sky Stream puck
            wants 25 Mbps on its own, or 30 Mbps if you add UHD or a second puck. Wi-Fi, video
            calls and cloud backups sit on top. That is why a 50 Mbps copper line that looks
            fine for one Netflix evening can collapse when the household watches two matches.
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Starting package sizes. Confirm the measured speed at the television, not the advert.
              </caption>
              <thead>
                <tr className="bg-slate-50">
                  {['Household pattern', 'Starting speed to compare', 'Watch for'].map((heading) => (
                    <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['One HD television, light phone use', '30 to 50 Mbps', 'iPlayer HD is only about 5 Mbps; Wi-Fi still matters'],
                  ['One 4K television', '50 to 100 Mbps', 'Netflix 15 Mbps, Disney+ 25 Mbps, Sky UHD 30 Mbps'],
                  ['Two 4K screens, or 4K plus home working', '100 to 300 Mbps', 'Simultaneous streams at kick-off'],
                  ['Several 4K TVs, gaming and uploads', '300 Mbps or full fibre gigabit', 'Evening congestion and upload, not the sticker'],
                ].map(([pattern, speed, watch]) => (
                  <tr key={pattern}>
                    <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">{pattern}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{speed}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-600">{watch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 leading-relaxed text-slate-700">
            For a wider household calculator, see{' '}
            <Link href="/guides/what-broadband-speed-do-i-need" className="font-semibold text-sky-700 hover:underline">
              what broadband speed you need
            </Link>
            {' '}and{' '}
            <Link href="/guides/broadband-speeds-explained" className="font-semibold text-sky-700 hover:underline">
              broadband speeds explained
            </Link>
            . The streaming job is narrower: keep the pictures up when everyone watches at once.
          </p>
        </section>

        <section id="evening" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Evening buffering, cabinets and cable nodes</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Buffering is often blamed on “slow broadband” when the contract is fine at lunchtime.
            FTTC fibre-to-the-cabinet and many cable connections share capacity with other
            properties on the same street cabinet or node. When the street streams at once, your
            speed can fall. Full fibre to the premises is far less affected because each home
            has its own fibre rather than a shared last stretch. That is the same distinction we
            make in the{' '}
            <Link href="/guides/full-fibre-broadband-explained" className="font-semibold text-sky-700 hover:underline">
              full-fibre explainer
            </Link>
            .
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Ofcom still tells people to check the personalised speed estimate and the minimum
            guaranteed speed, not a national average.{' '}
            <a href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              Its choosing-broadband advice
            </a>{' '}
            is the right order: address first, then the contract. If the measured evening speed
            at the router is already below the app’s 4K figure, buying a new streaming stick
            will not help.
          </p>
        </section>

        <figure className="my-10">
          <Image
            src="/guides/streaming/ethernet-puck.jpg"
            alt="An unbranded streaming puck with a cyan light, connected by Ethernet to a home router, original BroadbandPicker photograph. Not an official Sky Stream product shot."
            width={1600}
            height={900}
            className="rounded-2xl border border-slate-200"
          />
          <figcaption className="mt-2 text-sm text-slate-500">
            Wire the box that shows the match. Wi-Fi is fine for a phone. It is a poor way to
            hold a 4K live stream.
          </figcaption>
        </figure>

        <section id="wifi" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">The television is often a Wi-Fi problem</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            A fast result beside the router and a stuttering 4K picture on the far wall is not a
            reason to buy gigabit. It is a coverage problem. Plug the streaming puck, games
            console or smart TV into Ethernet if you can. If the set has to sit on Wi-Fi, test
            in that room and read{' '}
            <Link href="/guides/fix-wifi-dead-spots-uk" className="font-semibold text-sky-700 hover:underline">
              how to fix Wi-Fi dead spots
            </Link>
            . A new iPhone with Wi-Fi 7 does not raise the speed coming into the house. That is
            the point of our{' '}
            <Link href="/guides/wifi-7-explained-uk" className="font-semibold text-sky-700 hover:underline">
              Wi-Fi 7 guide
            </Link>
            .
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Replacing an aerial with apps does not remove the need for a usable signal in every
            watching room. Our{' '}
            <Link href="/guides/freely-and-fetch-tv-explained-uk" className="font-semibold text-sky-700 hover:underline">
              Freely TV guide
            </Link>{' '}
            covers that swap, including the service minimum and why room-level Wi-Fi still
            matters.
          </p>
        </section>

        <section id="sport" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">4K football, F1 and other live streams</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Live 4K football is the stress test. The picture is large, the audience is
            simultaneous, and you notice every stall. Disney+ puts live content at 8 Mbps, above
            its HD film figure, because a live encode cannot quietly catch up. Sky’s own
            consumer pages still separate HD streaming from 4K or Ultra HD and tell busy homes
            they need more than one device’s minimum.{' '}
            <a href="https://www.sky.com/hello-sky/broadband/good-internet-speed-for-streaming" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              Sky’s streaming-speed note
            </a>{' '}
            is useful even if you are not a Sky broadband customer.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            BBC iPlayer remains the public-service check. High-quality programmes stream at up
            to 5 Mbps, standard quality at 1.5 Mbps.{' '}
            <a href="https://www.bbc.co.uk/iplayer/help/questions/features/uhd-connected-tv" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              Ultra HD on a connected TV
            </a>{' '}
            wants 24 Mbit/s for the full 3840-pixel experience, or 12 Mbit/s for 2560-pixel Ultra
            HD. Those UHD events include live sport when the BBC offers it. They are not a
            reason to buy a gigabit package on their own.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            If the house also downloads large games, the streaming line still has to survive the
            evening. Our{' '}
            <Link href="/guides/gta-6-broadband-uk" className="font-semibold text-sky-700 hover:underline">
              GTA 6 broadband guide
            </Link>{' '}
            is about a wired console download in November, not 4K football. Do not mix the two
            jobs into one panic upgrade.
          </p>
        </section>

        <section id="tv" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">TV rights are not the broadband contract</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Sky Sports, TNT Sports, Netflix and Disney+ are licences. The Openreach or altnet
            line is a separate product. You can watch NOW Sports without Sky broadband. You can
            take a cheap full-fibre altnet and keep the apps. You can also buy a Sky or Virgin
            bundle and still buffer if the Wi-Fi in the lounge is weak. Compare the line first,
            then the channels.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            For the bill that actually carries the matches, use{' '}
            <Link href="/guides/cheapest-way-to-watch-sky-sports-uk" className="font-semibold text-sky-700 hover:underline">
              the cheapest way to watch Sky Sports and TNT Sports
            </Link>
            {' '}and the{' '}
            <Link href="/guides/best-broadband-and-tv-deals" className="font-semibold text-sky-700 hover:underline">
              broadband and TV deals comparison
            </Link>
            . We may earn a commission if you take a broadband deal through Get Deal. We do not
            currently earn a commission on NOW, Netflix, Disney+ or HBO Max.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-xl font-bold text-slate-900">Full-fibre deals to compare, not a streaming special</h3>
          <p className="mt-2 mb-4 text-sm text-slate-600">
            These are ordinary broadband packages at the time of writing. None of them is a
            Netflix or Sky Sports subscription. We may earn a commission if you sign up through
            Get Deal.
          </p>
          <DealTable deals={deals} />
        </section>

        <section id="packages" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Is 100 Mbps enough? Is 300 Mbps enough?</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            <strong>100 Mbps</strong> is enough for one 4K stream and ordinary extra use if the
            measured speed stays near that figure. It is the wrong answer if two 4K TVs start at
            kick-off on a line that already drops in the evening.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            <strong>300 Mbps</strong> is the comfortable family size for several 4K streams,
            phones and a console. It is not magic. On shared FTTC or cable it can still sag. On
            full fibre it is usually more than streaming needs.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            <strong>Gigabit</strong> is for homes that already know they move large files, game
            online, work from home and run many 4K screens. It is a poor cure for a dead spot
            behind the sofa. Check{' '}
            <Link href="/deals" className="font-semibold text-sky-700 hover:underline">
              current deals
            </Link>
            {' '}and an{' '}
            <Link href="/compare" className="font-semibold text-sky-700 hover:underline">
              address-specific comparison
            </Link>
            {' '}rather than a national “best for streaming” league table. If you would rather
            answer a few questions than read speed tables, use{' '}
            <Link href="/tools/broadband-match" className="font-semibold text-sky-700 hover:underline">
              Broadband Match
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">A simple order of operations</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
            <li>Count how many 4K streams will run at the same time.</li>
            <li>Test beside the router, then at the television, ideally over Ethernet.</li>
            <li>If Ethernet is slow in the evening, compare full fibre at the address.</li>
            <li>If Ethernet is fine, fix Wi-Fi in the TV room before buying a faster tier.</li>
            <li>Buy the sports or film apps only after the line can hold them.</li>
          </ol>
        </section>

        <section id="faq" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Streaming broadband FAQs</h2>
          <div className="mt-4">
            <FAQAccordion items={faqs} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {guide.sources?.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target={source.href.startsWith('http') ? '_blank' : undefined}
                  rel={source.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="font-semibold text-sky-700 hover:underline"
                >
                  {source.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/how-we-review-broadband" className="font-semibold text-sky-700 hover:underline">
                BroadbandPicker review methodology
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </article>
  )
}
