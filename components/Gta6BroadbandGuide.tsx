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

const PAGE_PATH = '/guides/gta-6-broadband-uk'
const PAGE_URL = `https://broadbandpicker.co.uk${PAGE_PATH}`
const BANNER = '/guides/gta-6/banner.jpg'

const faqs = [
  {
    question: 'How much internet speed do I need for GTA 6?',
    answer:
      'Rockstar has not published a required broadband speed or file size. At launch it is a single-player game on PlayStation 5 and Xbox Series X|S, so the first job is downloading the game and any day-one update. Use Ethernet, start the official pre-load on 12 November 2026, and compare the written speed estimate for your address rather than a national headline.',
  },
  {
    question: 'When does GTA 6 come out in the UK?',
    answer:
      'Rockstar Games set Thursday 19 November 2026 as the launch date for PlayStation 5 and Xbox Series X|S. Digital pre-load begins at local midnight on 12 November 2026. Physical copies are a download code with no disc and are due from 12 November so the code can be redeemed for that pre-load. Check the exact unlock time in your console store.',
  },
  {
    question: 'How big is the GTA 6 download?',
    answer:
      'Rockstar has not published the install size. Treat any 120 GB or 200 GB figure as an estimate from other sites until PlayStation or Xbox shows the real number on the pre-load screen. Keep spare SSD space, use a wired connection, and start the 12 November pre-load so launch night is not a queue behind everyone else on Wi-Fi.',
  },
  {
    question: 'Can I play GTA 6 on PC at launch?',
    answer:
      'No. Rockstar has confirmed PlayStation 5 and Xbox Series X|S only for 19 November 2026. There is no official PC release date and no official PC system requirements. Do not buy a PC upgrade solely for launch day. We will update this page if Rockstar announces a PC version.',
  },
  {
    question: 'Does GTA 6 need low ping?',
    answer:
      'At launch Rockstar describes Grand Theft Auto VI as a single-player experience, so a stable download matters more than competitive ping on day one. Low latency still helps if you play other online games on the same line, and it will matter if an online mode arrives later. Full fibre is usually more consistent than copper FTTC in the evening.',
  },
  {
    question: 'Should I use Wi-Fi or Ethernet to download GTA 6?',
    answer:
      'Use Ethernet. Large console downloads are more reliable on a cable than on Wi-Fi, which shares airtime with phones and drops through walls. Plug the console into the router, leave it powered overnight from 12 November, and pause other heavy downloads on that line if you want the pre-load to finish.',
  },
  {
    question: 'Where can I pre-order GTA 6 in the UK?',
    answer:
      'Rockstar lists the PlayStation Store, Xbox Store and Rockstar Store, plus selected retailers. Buy from the same country as your console account because PlayStation codes can be region-locked. We currently link those official stores and do not earn a commission on the game. Broadband deals on this page may earn us a commission if you switch.',
  },
  {
    question: 'Is the physical GTA 6 a disc?',
    answer:
      'No. Rockstar says the physical version contains a download code and will not include a disc. It is due from 12 November 2026 so you can redeem the code and pre-load. You still need enough console storage and a working internet connection. A boxed copy does not remove the download.',
  },
]

const toc = [
  { href: '#confirmed', label: 'What Rockstar has confirmed' },
  { href: '#download', label: 'Download size and pre-load' },
  { href: '#how-long', label: 'How long the download takes' },
  { href: '#ping', label: 'Ping and online play' },
  { href: '#ethernet', label: 'Ethernet versus Wi-Fi' },
  { href: '#broadband', label: 'Broadband to get before launch' },
  { href: '#preorder', label: 'Where to pre-order in the UK' },
  { href: '#editions', label: 'Editions and storage' },
  { href: '#awkward-homes', label: 'Rural, halls and 5G' },
  { href: '#faq', label: 'FAQs' },
]

export default function Gta6BroadbandGuide() {
  const guide = getGuideBySlug('gta-6-broadband-uk')
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
    name: 'Get UK broadband ready for Grand Theft Auto VI',
    description:
      'Confirmed Rockstar dates for pre-load and launch, plus a wired console and an address-specific broadband check.',
    totalTime: 'P7D',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Confirm the official dates',
        text: 'Pre-load starts 12 November 2026. The game unlocks on 19 November 2026 on PS5 and Xbox Series X|S.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Free console storage',
        text: 'Leave spare SSD space. Rockstar has not published the install size, so do not fill the drive before pre-load appears.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Use Ethernet',
        text: 'Plug the console into the router with a network cable before starting the pre-load.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Check the broadband at your address',
        text: 'Compare the provider speed estimate, upload speed and evening performance, then switch only if the current line cannot finish a large download in the seven-day pre-load window.',
      },
    ],
  }

  return (
    <article>
      <JsonLd data={article} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={howToJsonLd} />

      <PageHeroBanner
        title="GTA 6 Broadband UK"
        kicker="Launch week · 19 November 2026"
        lede="Vice City is back on Thursday 19 November. Rockstar still has not published a file size. Seven days of pre-load, a cable into the console and an honest speed check will do more for launch night than a gigabit advert."
        image={BANNER}
        imageAlt="Neon coastal city at night, original BroadbandPicker artwork for Grand Theft Auto VI launch week. Not official Rockstar key art."
        accent="fuchsia"
        ctas={[
          { href: 'https://www.rockstargames.com/VI', label: 'Official GTA VI site', variant: 'primary', external: true },
          { href: '/compare', label: 'Check broadband at your address', variant: 'secondary' },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: 'Guides', href: '/guides' },
            { name: 'GTA 6 broadband', href: PAGE_PATH },
          ]}
        />
        <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6 text-sm text-slate-500">
          <span>Updated {updated}</span>
          <span>·</span>
          <span>{guide.readingTime} min read</span>
          <span>·</span>
          <span>Reviewed by BroadbandPicker editorial team</span>
        </div>

        <CiteableAnswer title="The quick answer">
          {guide.excerpt}
        </CiteableAnswer>

        <OnThisPageNav links={toc} />
        <PostcodeContextBar />

        <section className="mb-10 rounded-xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">Key takeaways</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {guide.keyTakeaways?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="confirmed" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">What Rockstar has actually confirmed</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            A lot of GTA 6 broadband advice is guesswork dressed up as a spec sheet. Start with the
            publisher. <a href="https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Rockstar moved the launch to Thursday 19 November 2026</a> after
            the earlier 26 May 2026 date, and said the extra months were for polish. The same
            newswire names PlayStation 5 and Xbox Series X|S. That is the whole launch platform list.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            <a href="https://www.rockstargames.com/newswire/article/5171972o3ak5oa/pre-order-grand-theft-auto-vi-on-june-25" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">The 24 June 2026 pre-order note</a> is the other document that matters for
            your internet. Rockstar says Grand Theft Auto VI is a single-player experience, that
            digital pre-orders can begin pre-loading on 12 November, and that the physical version
            is a code in a box with no disc. Pre-orders and purchases before 20 November include the
            Vintage Vice City Pack. Digital store pre-orders also include a month of GTA+.
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Confirmed by Rockstar, checked 15 September 2026
              </caption>
              <thead>
                <tr className="bg-slate-50">
                  {['Fact', 'What Rockstar says', 'What that means for broadband'].map((heading) => (
                    <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Launch', '19 November 2026, PS5 and Xbox Series X|S', 'Have the game installed before Thursday night, not during it.'],
                  ['Pre-load', 'Local midnight, 12 November 2026', 'You get seven days. A mid-range full-fibre line is usually enough if it is wired and quiet.'],
                  ['Physical copy', 'Download code, no disc, from 12 November', 'The box does not skip the download. You still need storage and a connection.'],
                  ['PC', 'Not on the launch platform list', 'No official PC file size or recommended megabits. Do not upgrade a PC for day one.'],
                  ['Online play', 'Described as a single-player experience at launch', 'Ping is not the launch bottleneck. The download is.'],
                ].map(([fact, says, means]) => (
                  <tr key={fact}>
                    <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">{fact}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{says}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-600">{means}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-600">
            Official artwork, editions and the latest trailer live on{' '}
            <a href="https://www.rockstargames.com/VI" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">rockstargames.com/VI</a>
            . The banner at the top of this page is original BroadbandPicker artwork. It is not
            Rockstar key art.
          </p>
        </section>

        <figure className="my-10">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <iframe
              title="Grand Theft Auto VI Trailer 2, official Rockstar Games video"
              src="https://www.youtube-nocookie.com/embed/VQRLujxTm3c"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <figcaption className="mt-2 text-sm text-slate-500">
            Official Trailer 2 from the Rockstar Games YouTube channel, captured in-game on PlayStation 5.{' '}
            <a href="https://www.youtube.com/watch?v=VQRLujxTm3c" target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">Watch on YouTube</a>
            . Rockstar later published a longer Extended Look as well.
          </figcaption>
        </figure>

        <section id="download" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">Download size, pre-load and day-one patches</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            This is the question everyone types, and the honest answer is still boring: Rockstar
            has not published the GTA 6 file size. Comparison sites and forums have guessed
            everything from about 120 GB to just under 200 GB. <a href="https://www.techradar.com/gaming/gta-6-could-take-more-than-a-day-to-download-according-to-wi-fi-experts" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Uswitch used a 120 GB working figure</a> when it modelled UK download times. That is a useful planning
            exercise. It is not a Rockstar spec. When the pre-load appears on 12 November, the
            console store is the number that counts.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Pre-load exists so you are not fighting the same national rush on launch night. Leave
            the console on a wired connection, with spare SSD space, from local midnight on 12
            November. A day-one patch can still land later. That is normal. It is another reason
            not to fill the drive to the last gigabyte.
          </p>
        </section>

        <section id="how-long" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">How long will GTA 6 take to download?</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Until Rockstar publishes a size, use the method rather than a viral screenshot.
            Download time in hours is roughly (size in gigabytes × 8) ÷ your real megabits per
            second. A 100 GB file at a steady 100 Mbps is about 2 hours 13 minutes on a quiet
            wired line. Wi-Fi, evening congestion and other devices make it longer. The table
            below is a worked example at 100 GB, labelled as an example, not a prediction of the
            GTA 6 install.
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Example only: time to pull 100 GB on a quiet wired line
              </caption>
              <thead>
                <tr className="bg-slate-50">
                  {['Measured download', 'Rough time for 100 GB', 'Typical UK situation'].map((heading) => (
                    <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['30 Mbps', 'About 7 hours 25 minutes', 'Older FTTC on a busy evening can sit around here'],
                  ['50 Mbps', 'About 4 hours 27 minutes', 'A modest full-fibre or a decent FTTC night'],
                  ['100 Mbps', 'About 2 hours 13 minutes', 'Common full-fibre starting point'],
                  ['500 Mbps', 'About 27 minutes', 'Fast full fibre, still worth wiring the console'],
                  ['1 Gbps', 'About 13 minutes', 'Only if the line, router and console port all keep up'],
                ].map(([speed, time, note]) => (
                  <tr key={speed}>
                    <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">{speed}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{time}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-600">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="leading-relaxed text-slate-700">
            If the real file is larger than 100 GB, scale the times up. If it is smaller, scale
            them down. Run a{' '}
            <Link href="/tools/speed-test" className="font-semibold text-sky-700 hover:underline">wired speed test</Link>
            {' '}next to the router, then look at{' '}
            <Link href="/guides/broadband-speeds-explained" className="font-semibold text-sky-700 hover:underline">how advertised broadband speeds work</Link>
            . The number on the box is not the number the console will see at 9pm.
          </p>
        </section>

        <section id="ping" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Ping, lag and whether GTA 6 is online</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            People ask for the best GTA 6 ping as if 19 November were a ranked shooter launch.
            Rockstar&apos;s own pre-order copy calls it a single-player experience. That does not
            mean the console will never talk to the internet. Stores, patches, Rockstar accounts
            and clip uploads all use the line. It does mean you should not panic-buy a gaming
            tariff because a TikTok said you need 8 ms for Lucia&apos;s story.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            If you already play other online games in the same house, latency still matters. Full
            fibre usually keeps ping and jitter steadier than copper FTTC, especially after tea
            when the cabinet is busy. That is the same advice as our{' '}
            <Link href="/guides/best-broadband-for-gaming-uk" className="font-semibold text-sky-700 hover:underline">best broadband for gaming UK guide</Link>
            . We will add GTA Online notes here if Rockstar publishes them. Until then, treat
            launch week as a download-and-story week.
          </p>
        </section>

        <figure className="my-10">
          <Image
            src="/guides/gta-6/ethernet-console.jpg"
            alt="A current-generation console in a UK living room, connected to a broadband router with an Ethernet cable."
            width={1600}
            height={900}
            className="rounded-2xl border border-slate-200"
          />
          <figcaption className="mt-2 text-sm text-slate-500">
            Wire the console. Wi-Fi is fine for a phone. It is a poor way to pull a huge game
            overnight.
          </figcaption>
        </figure>

        <section id="ethernet" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">Ethernet versus Wi-Fi for the pre-load</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Put a cheap Cat 6 cable between the router and the console. That one change removes
            most of the drama. Wi-Fi has to share the air with phones, neighbours and the
            microwave. A cable does not. If the console has to sit in another room, look at{' '}
            <Link href="/guides/best-mesh-wifi-for-your-broadband-router" className="font-semibold text-sky-700 hover:underline">mesh Wi-Fi with Ethernet backhaul</Link>
            {' '}or move the router, rather than hoping a Wi-Fi 7 sticker on a new phone will
            finish a console download. A new iPhone cannot fix a slow copper line. That is the
            same point as our{' '}
            <Link href="/guides/wifi-7-explained-uk" className="font-semibold text-sky-700 hover:underline">Wi-Fi 7 explainer</Link>.
          </p>
        </section>

        <section id="broadband" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">What broadband to get before 19 November</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            You do not need the fastest package in Britain. You need a line that can finish a
            large download inside the seven-day pre-load window and still let other people in the
            house watch television. Size that evening job in our{' '}
            <Link href="/guides/best-broadband-for-streaming" className="font-semibold text-sky-700 hover:underline">broadband for streaming guide</Link>
            . For most UK homes that already have full fibre, the current
            package is enough if you wire the console and start on 12 November. Switch if the
            line is still copper FTTC that falls apart in the evening, if uploads fail when
            someone else is on a video call, or if you cannot get a stable wired test next to the
            router.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Compare the personalised download, upload and minimum guarantee, then the whole-term
            price. <a href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Ofcom&apos;s own choosing-broadband advice</a> is still the right order: check
            the address, then the contract. Use our{' '}
            <Link href="/compare" className="font-semibold text-sky-700 hover:underline">postcode comparison</Link>
            {' '}and{' '}
            <Link href="/guides/full-fibre-broadband-explained" className="font-semibold text-sky-700 hover:underline">full-fibre explainer</Link>
            {' '}before you pay for a gigabit you will not use. If you are in contract, read{' '}
            <Link href="/guides/how-to-switch-broadband-uk" className="font-semibold text-sky-700 hover:underline">how One Touch Switch works</Link>
            {' '}so you do not create a week of downtime in mid-November.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-xl font-bold text-slate-900">Current UK deals to compare, not a GTA 6 special tariff</h3>
          <p className="mt-2 mb-4 text-sm text-slate-600">
            These are ordinary broadband packages from our latest checked table. None of them is
            an official Rockstar product. We may earn a commission if you sign up through Get Deal.
          </p>
          <DealTable deals={deals} />
        </section>

        <section id="preorder" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Where to pre-order GTA 6 in the UK</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            <a href="https://support.rockstargames.com/articles/46YkMi4rHxYXMeIHtZiKaE" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Rockstar&apos;s pre-order article</a> lists the PlayStation Store, Xbox Store and
            Rockstar Store, plus selected retailers. The United Kingdom is on those store lists.
            Buy from the same country as the console account. Rockstar says PlayStation download
            codes are tied to the account region, and the United Kingdom is its own PlayStation
            group. A cheap imported code can fail at redemption.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <a href="https://store.playstation.com/concept/10000730" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">PlayStation Store, Grand Theft Auto VI</a>
            </li>
            <li>
              <a href="https://www.xbox.com/en-gb/games/store/grand-theft-auto-vi/9nl3wwnzlzzn" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Xbox Store, Grand Theft Auto VI</a>
            </li>
            <li>
              <a href="https://store.rockstargames.com/game/buy-gta-vi" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Rockstar Store, Grand Theft Auto VI</a>
            </li>
          </ul>
          <p className="mt-3 leading-relaxed text-slate-700">
            Those are official storefronts, not BroadbandPicker affiliate links. We do not
            currently earn a commission if you buy the game. High-street names such as GAME and
            Amazon also sell console titles in the UK. If we later join those programmes, the
            disclosure on this page will change. Until then, prefer the publisher and platform
            stores so the account, refund and pre-load all sit in one place.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Previous Grand Theft Auto releases have been sold as adult titles. Check the PEGI
            label on the UK store page before you buy. We are not going to invent a rating
            Rockstar has not asked us to repeat.
          </p>
        </section>

        <figure className="my-10">
          <Image
            src="/guides/gta-6/coast-highway.jpg"
            alt="Dusk over a tropical coastal highway heading toward a neon city glow, original BroadbandPicker artwork."
            width={1600}
            height={900}
            className="rounded-2xl border border-slate-200"
          />
          <figcaption className="mt-2 text-sm text-slate-500">
            Leonida can wait a week. The pre-load cannot. Start it on 12 November.
          </figcaption>
        </figure>

        <section id="editions" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">Standard, Ultimate, storage and GTA+</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            <a href="https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Rockstar&apos;s editions page</a> names a Standard Edition and an Ultimate Edition,
            with an Ultimate upgrade sold separately. Digital purchases before 20 November 2026
            include extra pre-order content. A month of GTA+ is tied to digital store pre-orders,
            not to every boxed code. None of that changes the broadband job: both editions still
            download.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Free some SSD space before 12 November. How much is guesswork until the store shows
            the size. Do not uninstall the only other game you actually play unless you have to.
            External USB storage can help on some consoles for older titles, but current-generation
            installs usually want the internal or official expansion SSD. Follow the PlayStation or
            Xbox storage screen, not a forum screenshot.
          </p>
        </section>

        <section id="awkward-homes" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Rural lines, student halls and 5G home</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            If the property cannot get full fibre, start the pre-load as soon as it appears and
            keep the console wired. A slow but stable FTTC line can still finish 100 GB over
            several quiet nights. A fast 5G home router that drops in the evening may not.{' '}
            <Link href="/guides/best-broadband-for-rural-areas-uk" className="font-semibold text-sky-700 hover:underline">Rural broadband options</Link>
            {' '}and{' '}
            <Link href="/guides/best-5g-home-broadband-uk" className="font-semibold text-sky-700 hover:underline">5G home broadband</Link>
            {' '}are the honest comparisons. In halls, NAT and shared Wi-Fi are the usual villains.
            Ethernet in the wall, if you have it, beats a dozen phones on the landing.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            A VPN is a poor idea during the pre-load. It adds overhead and can throttle large
            store downloads. Turn it off for the PlayStation or Xbox download, then decide later
            whether you want it for other traffic. Our{' '}
            <Link href="/guides/does-a-vpn-slow-your-internet" className="font-semibold text-sky-700 hover:underline">VPN speed guide</Link>
            {' '}covers that trade-off. Clip uploads after launch use upload speed. If the household
            already struggles on Zoom, read{' '}
            <Link href="/guides/what-broadband-speed-do-i-need" className="font-semibold text-sky-700 hover:underline">what broadband speed you actually need</Link>
            {' '}before paying for a faster download tier that does not raise upload.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">A week-by-week launch plan</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
            <li>This week: test the console on Ethernet. Note the speed next to the router.</li>
            <li>If that test is poor, compare an address-specific deal and switch with time to spare.</li>
            <li>12 November: start the official pre-load and leave the console on overnight.</li>
            <li>13 to 18 November: let it finish. Do not hammer the same line with 4K films all evening.</li>
            <li>19 November: play. If a patch appears, the cable is still your friend.</li>
          </ol>
        </section>

        <section id="faq" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">GTA 6 broadband FAQs</h2>
          <div className="mt-4">
            <FAQAccordion items={faqs} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {guide.sources?.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
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
