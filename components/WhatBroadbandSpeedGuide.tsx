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

const PAGE_PATH = '/guides/what-broadband-speed-do-i-need'
const PAGE_URL = `https://broadbandpicker.co.uk${PAGE_PATH}`
const BANNER = '/guides/speed-need/banner.jpg'

const faqs = [
  {
    question: 'What broadband speed do I need?',
    answer:
      'Size the line to everything that will run at once, including upload. Ofcom says superfast broadband, 30 to 300 Mbit/s, suits most everyday use such as working from home, video calls and streaming. It treats 300 Mbit/s as ultrafast when several people stream Ultra HD, game or download large files. Netflix asks for 15 Mbps per 4K stream. Zoom 1080p wants 3.8 Mbps up. Compare the written estimate and minimum guarantee for your address.',
  },
  {
    question: 'Is 100 Mbps fast enough for Netflix?',
    answer:
      'Yes for one 4K Netflix stream and ordinary extra use, if the measured speed at the television holds near 100 Mbps. Netflix recommends 5 Mbps for Full HD and 15 Mbps for Ultra HD. 100 Mbps is tight if two or three 4K streams start together, someone is on a video call, or evening FTTC or cable congestion knocks the line well below the advertised average. Test at the set, not only beside the router.',
  },
  {
    question: 'Is 100 Mbps enough in 2026?',
    answer:
      'For many UK homes, yes. Ofcom still classes 30 to 300 Mbit/s as superfast and says that range covers most everyday use. 100 Mbps is enough for one 4K stream, a Zoom or Teams call and phones, if upload is usable and the evening speed holds. It is the wrong answer for several 4K TVs, two home workers, or a cloud backup that runs while you are on a call. Full fibre at the same headline is usually more stable than copper FTTC.',
  },
  {
    question: 'Is 150 Mbps enough for 2 people?',
    answer:
      'Usually yes. Two people can share 150 Mbps for HD or 4K streaming, browsing and a video call with headroom, provided upload is not the bottleneck. Two simultaneous 1080p Zoom calls still use only a few megabits each. The squeeze is a 4K television plus a call plus a backup on a line that drops in the evening, or FTTC upload around 10 Mbps. Check the personalised minimum, not a national average.',
  },
  {
    question: 'Is 300 Mbps enough for 4 people?',
    answer:
      'For almost every four-person UK household, yes. Ofcom’s own consumer guide treats 300 Mbit/s as the point where several people can stream Ultra HD at once. It covers 4K TVs, homework, gaming and a couple of video calls if the measured speed holds. Gigabit is rarely the next step unless you also move large files, run many 4K screens, or want extra margin on a congested shared network.',
  },
  {
    question: 'Do I really need 500 Mbps internet?',
    answer:
      'Usually no. Ofcom says ultrafast, 300 Mbit/s or more, is for busy homes that stream a lot, play games online or download large files. 500 Mbps or gigabit helps when several 4K streams, cloud backups and home working overlap, or when you want spare capacity. It will not fix weak Wi-Fi in one room, and it cannot raise a slow upload on an older copper package. Test first, then compare full fibre at the address.',
  },
  {
    question: 'What broadband speed do I need to work from home?',
    answer:
      'One HD video call is modest. Zoom lists 1.2 Mbps up and down for 720p and 3.8 Mbps up for 1080p. Microsoft says Teams can deliver HD in under 1.5 Mbps, with a recommended 1.5 to 4 Mbps per endpoint for video. The household total is the issue: a call plus a 4K stream plus a backup. Prefer usable upload and a stable evening speed over a giant download headline. Full fibre is the usual upgrade if FTTC upload is tight.',
  },
  {
    question: 'What broadband speed do I need for cloud backup?',
    answer:
      'Cloud backup is an upload job. Apple, Google and Microsoft do not publish a home-broadband megabit figure for iCloud, Google Drive or OneDrive. The time to copy a laptop is set by your upload rate and how much data you send. A 50 GB first backup on a 10 Mbps FTTC upload takes hours; the same job on symmetrical full fibre is much shorter. Schedule heavy sync overnight so it does not sit on top of a video call.',
  },
  {
    question: 'What is the best or cheapest cloud backup in the UK?',
    answer:
      'We do not rank backup brands, and we do not currently earn a commission on iCloud, Google One, OneDrive or Backblaze. The cheapest legal option is often storage you already pay for, if it actually covers the files you need. A real downside of cloud backup is that the first copy can take a long time on slow upload, and an ongoing subscription is a separate bill from broadband. Size the line for upload, then choose the backup product.',
  },
  {
    question: 'What is a good broadband speed in Mbps?',
    answer:
      'Ofcom’s consumer bands are the honest starting point: up to 30 Mbit/s for basic browsing, email and standard video; 30 to 300 Mbit/s for most everyday homes; 300 Mbit/s or more when several people stream Ultra HD, game or download large files. Its rough activity guide is 1 Mbit/s for browsing and music, 10 Mbit/s for an HD video call, 30 Mbit/s for one Ultra HD stream and 300 Mbit/s for several Ultra HD streams. Your address estimate still comes first.',
  },
]

const toc = [
  { href: '#ofcom', label: 'Ofcom’s speed bands' },
  { href: '#simultaneous', label: 'Count simultaneous jobs' },
  { href: '#100', label: 'Is 100, 150, 300 or 500 enough?' },
  { href: '#upload', label: 'Upload, calls and cloud backup' },
  { href: '#ai', label: 'AI tools and always-on homes' },
  { href: '#house', label: 'Speed for the house, TV and work' },
  { href: '#test', label: 'How to check your line' },
  { href: '#faq', label: 'FAQs' },
]

export default function WhatBroadbandSpeedGuide() {
  const guide = getGuideBySlug('what-broadband-speed-do-i-need')
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
    articleSection: 'Technology and Speeds',
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
    name: 'Work out what broadband speed you need in the UK',
    description:
      'Count simultaneous downloads and uploads, check official app minimums, test at the busiest time, then compare the written speed estimate for the address.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Count simultaneous jobs',
        text: 'Note how many 4K streams, video calls, games and cloud backups will run at the same busy moment.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Add the official minimums',
        text: 'Use publisher figures such as Netflix 15 Mbps per 4K stream, Zoom 3.8 Mbps up for 1080p, and Ofcom’s 10 Mbit/s HD call and 30 Mbit/s Ultra HD stream guide.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Test download and upload',
        text: 'Run a speed test beside the router and in the room that actually fails, including upload, then compare evening results with a quiet-hour test.',
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
        title="What Broadband Speed Do I Need"
        kicker="Speed · upload · always-on homes"
        lede="Chatbots, cloud backups and a 4K television do not each need a gigabit. They need the line to hold every job at once, in both directions. Count the busy minute, then check the written estimate for your address."
        image={BANNER}
        imageAlt="A UK living room used as a home office at dusk, with a video call on a laptop, a tablet on the sofa and a television on, original BroadbandPicker artwork."
        accent="indigo"
        ctas={[
          { href: '/tools/speed-test', label: 'Test download and upload', variant: 'primary' },
          { href: '/compare', label: 'Check full fibre at your address', variant: 'secondary' },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: 'Guides', href: '/guides' },
            { name: 'What broadband speed do I need', href: PAGE_PATH },
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

        <section className="mb-10 rounded-xl border border-indigo-200 bg-indigo-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">Key takeaways</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {guide.keyTakeaways?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="ofcom" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">What Ofcom actually says you need</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Start with the regulator, not a shop-window gigabit. Ofcom’s{' '}
            <a href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              choosing-broadband guide
            </a>
            , last updated 25 August 2026, puts UK packages in three bands:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Standard:</strong> up to 30 Mbit/s, enough for basic browsing, email and
              standard video.
            </li>
            <li>
              <strong>Superfast:</strong> 30 to 300 Mbit/s, which “suits most everyday use, such
              as working from home, video calls and streaming.”
            </li>
            <li>
              <strong>Ultrafast:</strong> 300 Mbit/s or more, better if several people are online
              at once, or you stream a lot of video, play games online or download large files.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed text-slate-700">
            The same page publishes a rough activity guide: about 1 Mbit/s for web browsing and
            music, 10 Mbit/s for a high-definition video call, 30 Mbit/s for one person streaming
            Ultra HD, and 300 Mbit/s when several people stream Ultra HD at once. Those are
            planning numbers, not a promise that your cabinet will hold them at 8pm.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            The legal floor is lower still. The{' '}
            <a href="https://www.ofcom.org.uk/phones-and-broadband/access-to-decent-broadband/broadband-uso-need-to-know" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              broadband universal service obligation
            </a>{' '}
            is a right to request at least 10 Mbit/s down and 1 Mbit/s up, subject to eligibility
            and cost. That is decent broadband, not a 4K household.
          </p>
        </section>

        <section id="simultaneous" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Count the busy minute, not the brochure</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            App minimums are per stream or per call. A house is not one stream. Add the jobs that
            actually overlap: a 4K television, a laptop on a call, a phone uploading photos, a
            console patch, a cloud backup. Then leave headroom, because Wi-Fi and evening
            congestion eat some of the number you pay for.
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Publisher or regulator figures. One activity, not a whole home. Checked 16 September 2026.
              </caption>
              <thead>
                <tr className="bg-slate-50">
                  {['Activity', 'Official figure', 'Source'].map((heading) => (
                    <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Browsing and music', 'About 1 Mbit/s', 'Ofcom choosing-broadband guide'],
                  ['HD video call', 'About 10 Mbit/s (Ofcom planning figure)', 'Ofcom choosing-broadband guide'],
                  ['Zoom 720p group call', '2.6 Mbps up / 1.8 Mbps down', 'Zoom system requirements'],
                  ['Zoom 1080p', '3.8 Mbps up / 3.0 Mbps down', 'Zoom HD video article'],
                  ['Microsoft Teams HD video', 'Under 1.5 Mbps typical; recommended up to 1.5 to 4 Mbps per endpoint', 'Microsoft Learn, prepare the network'],
                  ['One Ultra HD stream', 'About 30 Mbit/s (Ofcom); Netflix 15 Mbps; Disney+ 25 Mbps 4K', 'Ofcom, Netflix, Disney+'],
                  ['Several Ultra HD streams', 'About 300 Mbit/s', 'Ofcom choosing-broadband guide'],
                ].map(([activity, figure, source]) => (
                  <tr key={activity}>
                    <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">
                      {activity}
                    </th>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{figure}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-600">{source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 leading-relaxed text-slate-700">
            For 4K football and multi-room television, use the{' '}
            <Link href="/guides/best-broadband-for-streaming" className="font-semibold text-sky-700 hover:underline">
              streaming guide
            </Link>
            . For ping and downloads, see{' '}
            <Link href="/guides/best-broadband-for-gaming-uk" className="font-semibold text-sky-700 hover:underline">
              gaming broadband
            </Link>
            {' '}and the{' '}
            <Link href="/guides/gta-6-broadband-uk" className="font-semibold text-sky-700 hover:underline">
              GTA 6 launch note
            </Link>
            . This page is the household total.
          </p>
        </section>

        <figure className="my-10">
          <Image
            src="/guides/speed-need/devices.jpg"
            alt="A UK hallway cabinet with a home router, laptop, phone, camera and smart speaker sharing one line, original BroadbandPicker photograph."
            width={1600}
            height={900}
            className="rounded-2xl border border-slate-200"
          />
          <figcaption className="mt-2 text-sm text-slate-500">
            The package has to feed every device that is awake, not the one you thought about
            when you ordered.
          </figcaption>
        </figure>

        <section id="100" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">Is 100, 150, 300 or 500 Mbps enough?</h2>
          <div className="my-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Starting sizes. Confirm the measured evening speed, including upload.
              </caption>
              <thead>
                <tr className="bg-slate-50">
                  {['If this is your house', 'Starting speed to compare', 'Watch for'].map((heading) => (
                    <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['One or two people, browsing and HD video', '30 to 50 Mbps superfast', 'Ofcom’s standard band tops out at 30 Mbit/s'],
                  ['One 4K TV, light working from home', '50 to 100 Mbps', 'Netflix 15 Mbps; Zoom 1080p is 3.8 Mbps up'],
                  ['Two people, mixed streaming and calls', '100 to 150 Mbps', 'Upload on FTTC, not only the download sticker'],
                  ['Four people, 4K, homework and a console', '150 to 300 Mbps full fibre', 'Ofcom’s several-UHD figure is 300 Mbit/s'],
                  ['Heavy files, many 4K screens, always-on backup', '300 Mbps or gigabit full fibre', 'Symmetrical upload matters more than 900 Mbps down'],
                ].map(([house, speed, watch]) => (
                  <tr key={house}>
                    <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">{house}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{speed}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-600">{watch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 leading-relaxed text-slate-700">
            Ofcom’s{' '}
            <a href="https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-20252" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              Connected Nations 2025
            </a>{' '}
            put the UK average maximum download speed at 285 Mbit/s in July 2025, up from 223
            Mbit/s in 2024. That is the average of maximum speeds on active lines, not a speed
            test in your lounge. Do not buy 500 Mbps because the national headline is 285.
          </p>
        </section>

        <figure className="my-10">
          <Image
            src="/guides/speed-need/upload-desk.jpg"
            alt="A UK home-office desk with a laptop on Ethernet and a monitor showing a generic file upload, original BroadbandPicker photograph."
            width={1600}
            height={900}
            className="rounded-2xl border border-slate-200"
          />
          <figcaption className="mt-2 text-sm text-slate-500">
            Download gets the films in. Upload gets the call, the backup and the document out.
          </figcaption>
        </figure>

        <section id="upload" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">Upload is the 2026 bottleneck</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Video calls and cloud copies travel up the line. Zoom’s{' '}
            <a href="https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060748" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              system requirements
            </a>{' '}
            ask for 1.2 Mbps up and down for 720p one-to-one, and 3.8 Mbps up / 3.0 Mbps down
            for 1080p. Microsoft’s{' '}
            <a href="https://learn.microsoft.com/en-us/microsoftteams/prepare-network" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              Teams network note
            </a>{' '}
            says the product can deliver HD in under 1.5 Mbps, with recommended video around
            1.5 Mbps one-to-one and up to 4 Mbps for best-performance meetings, per endpoint.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Those calls are small. They still fail when a backup, a photo library or a second
            call takes the upload. Part-fibre FTTC often advertises a healthy download with a
            much smaller upload. Full fibre is the usual fix because upload can match download.
            See{' '}
            <Link href="/guides/full-fibre-broadband-explained" className="font-semibold text-sky-700 hover:underline">
              full fibre explained
            </Link>
            {' '}and{' '}
            <Link href="/guides/best-broadband-for-working-from-home" className="font-semibold text-sky-700 hover:underline">
              broadband for working from home
            </Link>
            .
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Cloud backup is the same physics. Apple, Google and Microsoft do not publish a
            megabit minimum for iCloud, Google Drive or OneDrive on a home line. The first copy
            of a laptop is limited by upload. We do not pick a “best” or “cheapest” backup brand
            here, and we do not currently earn a commission on those products. If you already
            pay for storage that covers the files, use it. If the first backup will run for
            hours, start it overnight rather than during a meeting.
          </p>
        </section>

        <section id="ai" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">AI tools, cloud clients and always-on households</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            A text chat with an AI assistant is a small request. It is not a reason to buy
            gigabit. What competes with the rest of the house is everything around it: uploading
            PDFs or photos, downloading a generated video, leaving a desktop client signed in,
            and running a backup at the same time as a call. None of the major AI labs publishes
            a UK household megabit figure we can cite, so we will not invent one.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Treat always-on clients like any other background job. If the line is already tight
            at 8pm, pause the backup, plug the work laptop into Ethernet, and fix{' '}
            <Link href="/guides/fix-wifi-dead-spots-uk" className="font-semibold text-sky-700 hover:underline">
              Wi-Fi dead spots
            </Link>
            {' '}before you pay for a faster tier. A new Wi-Fi 7 phone still cannot raise the
            speed coming into the house. That is the point of our{' '}
            <Link href="/guides/wifi-7-explained-uk" className="font-semibold text-sky-700 hover:underline">
              Wi-Fi 7 guide
            </Link>
            .
          </p>
        </section>

        <section id="house" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">The house, the smart TV and the office</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            “What speed do I need for my house?” is the same question as this page: add the
            overlapping jobs. A smart TV is one 4K stream if you actually watch in 4K, or about
            5 Mbps if the app stays in Full HD. Netflix, Disney+ and YouTube figures live in the{' '}
            <Link href="/guides/best-broadband-for-streaming" className="font-semibold text-sky-700 hover:underline">
              streaming guide
            </Link>
            . Gaming cares more about ping than a 500 Mbps sticker. Homework and streaming in
            the same hour is why 50 Mbps that looked fine for one person can feel small for four.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            If you would rather answer a few questions than add megabits by hand, use{' '}
            <Link href="/tools/broadband-match" className="font-semibold text-sky-700 hover:underline">
              Broadband Match
            </Link>
            . For how advertised averages, medians and evening cabinets differ, keep{' '}
            <Link href="/guides/broadband-speeds-explained" className="font-semibold text-sky-700 hover:underline">
              broadband speeds explained
            </Link>
            {' '}open in another tab.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-xl font-bold text-slate-900">Full-fibre deals to compare, not a speed-test special</h3>
          <p className="mt-2 mb-4 text-sm text-slate-600">
            These are ordinary broadband packages. None of them is a cloud-backup or AI
            subscription. We may earn a commission if you sign up through Get Deal.
          </p>
          <DealTable deals={deals} />
        </section>

        <section id="test" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">How to check before you upgrade</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
            <li>
              Run our{' '}
              <Link href="/tools/speed-test" className="font-semibold text-sky-700 hover:underline">
                speed test
              </Link>{' '}
              beside the router, then in the problem room. Record download, upload and ping.
            </li>
            <li>Repeat once in a quiet hour and once in the evening.</li>
            <li>
              Compare the result with the provider’s written estimate and minimum guaranteed
              speed.{' '}
              <a href="https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/broadband-speeds" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
                Ofcom’s speed-code guidance
              </a>{' '}
              covers what to do if the line stays below that minimum.
            </li>
            <li>
              If Ethernet is slow, compare{' '}
              <Link href="/compare" className="font-semibold text-sky-700 hover:underline">
                full fibre at the address
              </Link>
              . If Ethernet is fine, fix Wi-Fi before buying a faster package.
            </li>
          </ol>
          <p className="mt-3 leading-relaxed text-slate-700">
            As of January 2026 Ofcom’s{' '}
            <a href="https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-update-spring-2026" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">
              Connected Nations Spring 2026 update
            </a>{' '}
            put full fibre at 24.9 million UK homes, 82 per cent, and gigabit-capable broadband
            at 89 per cent. Availability is not the same as the speed you should pay for.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">A simple order of operations</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
            <li>Count 4K streams, calls and backups that overlap.</li>
            <li>Test download and upload at the busy time.</li>
            <li>If upload or evening speed is the limit, compare full fibre.</li>
            <li>If only one room is slow, fix Wi-Fi before changing package.</li>
          </ol>
        </section>

        <section id="faq" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Broadband speed FAQs</h2>
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
