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

const PAGE_PATH = '/guides/wifi-7-explained-uk'
const PAGE_URL = `https://broadbandpicker.co.uk${PAGE_PATH}`
const BANNER = '/guides/wifi-7/banner.jpg'

const faqs = [
  {
    question: 'Is Wi-Fi 7 worth it in the UK in 2026?',
    answer:
      'It is worth considering if you already have gigabit or multi-gigabit full fibre, a Wi-Fi 7 phone such as iPhone 17, iPhone 18 Pro or iPhone Duo, and a measured wireless bottleneck. Most homes on slower packages with reliable Wi-Fi 6 can wait. A new router cannot raise the speed of the broadband entering the property.',
  },
  {
    question: 'Does iPhone Duo need a Wi-Fi 7 router?',
    answer:
      'No. Apple says the N1 chip enables Wi-Fi 7, Bluetooth 6 and Thread, so iPhone Duo can use Wi-Fi 7 features on a compatible network. It will still join an older Wi-Fi 6 router. You only need a Wi-Fi 7 hub if you want the new radio features, not simply because the phone is foldable. Check apple.com/uk for UK pricing and dates.',
  },
  {
    question: 'Which iPhones support Wi-Fi 7?',
    answer:
      'Apple’s September 2025 iPhone 17 announcement introduced the N1 chip and Wi-Fi 7. The September 2026 iPhone 18 Pro and iPhone Duo announcements also list N1. Apple Support’s 25 August 2026 list says full Wi-Fi 7 features start at iPhone 16 Pro and later, excluding iPhone 16e and iPhone 17e. 6GHz use still depends on the country.',
  },
  {
    question: 'Will Wi-Fi 7 make my broadband faster?',
    answer:
      'It can help a compatible phone receive more of the speed already arriving at the router. It cannot turn a 100 Mbps package into 500 Mbps. Test beside the router or over Ethernet first. If that result is already slow, the line or package is the problem, not the Wi-Fi generation.',
  },
  {
    question: 'What is the difference between Wi-Fi 7 and Wi-Fi 6?',
    answer:
      'Wi-Fi 7 is IEEE 802.11be. The Wi-Fi Alliance’s CERTIFIED 7 programme, launched on 8 January 2024, highlights 320 MHz channels, Multi-Link Operation and 4K-QAM. Wi-Fi 6 uses channels up to 160 MHz and has no MLO. Both the router and the phone must support a feature before you get it. Internet speed still depends on the broadband contract.',
  },
  {
    question: 'Is 6GHz Wi-Fi available in the UK?',
    answer:
      'Ofcom opened the lower 6GHz band for licence-exempt Wi-Fi. That is not identical to US spectrum, so a UK-market router is more useful than a US review. Apple notes that 6GHz Wi-Fi 7 features only work where the regulator allows them. If 6GHz is unavailable, the phone still uses 2.4GHz and 5GHz.',
  },
  {
    question: 'Are Wi-Fi 7 routers backwards compatible?',
    answer:
      'Yes. Older phones, laptops and smart plugs still connect, using the generation they support. They will not gain 320 MHz channels or MLO. Confirm 2.4GHz setup for older gadgets and check that a replacement hub still handles the provider’s login, digital voice and TV before you unplug the ISP router.',
  },
  {
    question: 'Do I need Wi-Fi 7 mesh?',
    answer:
      'Mesh is for coverage, not for a generation sticker. If several rooms are weak, a well-placed mesh or a wired access point matters more than the number 7 on the box. Ethernet backhaul is still the most reliable way to feed extra nodes. See our mesh buying guide before pairing a new iPhone with a cupboard full of satellites.',
  },
]

const toc = [
  { href: '#iphone', label: 'iPhone Duo, iOS 27 and N1' },
  { href: '#what', label: 'What Wi-Fi 7 actually is' },
  { href: '#worth-it', label: 'Is it worth it?' },
  { href: '#broadband', label: 'Broadband first' },
  { href: '#uk-6ghz', label: 'UK 6GHz and routers' },
  { href: '#buy', label: 'What to buy' },
  { href: '#faq', label: 'FAQs' },
]

export default function Wifi7ExplainedGuide() {
  const guide = getGuideBySlug('wifi-7-explained-uk')
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
    name: 'Decide whether a UK home needs Wi-Fi 7',
    description: 'Test the line, check which phones actually support Wi-Fi 7, then buy a router only if wireless is the bottleneck.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Test beside the router',
        text: 'Run a speed test over Ethernet or next to the hub and compare it with the provider estimate for the address.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Test in the problem room',
        text: 'If the living room is slow but the hall is fast, you have a coverage problem, not a generation problem.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Check the phones and laptops',
        text: 'Confirm Wi-Fi 7 on the exact model. iPhone 17, iPhone 18 Pro and iPhone Duo use Apple’s N1 chip for Wi-Fi 7.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Buy only for the measured bottleneck',
        text: 'Choose a UK-market tri-band router with 6GHz and 2.5Gbps ports, or keep Wi-Fi 6 if the current kit already delivers the package speed.',
      },
    ],
  }

  return (
    <article>
      <JsonLd data={article} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={howToJsonLd} />

      <PageHeroBanner
        title="Wi-Fi 7 Explained UK"
        kicker="iPhone week · Wi-Fi 7"
        lede="Apple just put Wi-Fi 7 in iPhone Duo. The radio is faster. The Openreach cabinet is not. Test the line, then decide whether the router, the mesh or the contract is the thing that actually needs replacing."
        image={BANNER}
        imageAlt="A UK living room at night with a glowing home router, original BroadbandPicker artwork. Not an official Apple or router-brand photograph."
        accent="cyan"
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
            { name: 'Wi-Fi 7 explained', href: PAGE_PATH },
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

        <section className="mb-10 rounded-xl border border-cyan-200 bg-cyan-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">Key takeaways</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {guide.keyTakeaways?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="iphone" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">iPhone Duo, iOS 27 and Apple’s N1 chip</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            This week’s search spike is not a mystery. On 9 September 2026{' '}
            <a href="https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Apple unveiled iPhone Duo</a>
            , its first foldable iPhone, with a 7.6-inch inner display and a 5.4-inch outer
            display. The UK is on the list of more than 70 countries that can pre-order from
            16 October, with availability from 23 October. Apple listed a US starting price of
            $1,999. Check{' '}
            <a href="https://www.apple.com/uk/iphone-duo/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">apple.com/uk</a>
            {' '}for the sterling figure rather than converting the dollar number yourself.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            The wireless detail that matters here is short. Apple says the N1 chip enables Wi-Fi 7,
            Bluetooth 6 and Thread. The same N1 line appeared on{' '}
            <a href="https://www.apple.com/newsroom/2025/09/apple-debuts-iphone-17/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">iPhone 17 in September 2025</a>
            {' '}and on{' '}
            <a href="https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">iPhone 18 Pro in September 2026</a>
            . <a href="https://support.apple.com/en-us/148165" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Apple Support’s Wi-Fi 7 list</a>
            , updated 25 August 2026, says full Wi-Fi 7 features start at iPhone 16 Pro and later,
            excluding iPhone 16e and iPhone 17e, and that 6GHz operation depends on the country.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            <a href="https://www.apple.com/newsroom/2026/09/major-updates-for-apples-software-platforms-are-now-available/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">iOS 27 began rolling out on 14 September 2026</a>
            . Apple says iPhone Duo ships with iOS 27.1. None of that software changes the physics
            of a copper cabinet. A foldable screen wants a stable home network for 4K streaming and
            Split View. Size that job in our{' '}
            <Link href="/guides/best-broadband-for-streaming" className="font-semibold text-sky-700 hover:underline">broadband for streaming guide</Link>
            . The radio in the phone is only half the pair.
          </p>
        </section>

        <figure className="my-10">
          <Image
            src="/guides/wifi-7/devices.jpg"
            alt="Two phones on a sofa, one opened like a small tablet, original BroadbandPicker photograph. Not an official Apple product shot."
            width={1600}
            height={900}
            className="rounded-2xl border border-slate-200"
          />
          <figcaption className="mt-2 text-sm text-slate-500">
            A new handset can use Wi-Fi 7. It still has to talk to whatever hub is on the
            sideboard.
          </figcaption>
        </figure>

        <section id="what" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">What Wi-Fi 7 actually is</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Wi-Fi 7 is the consumer name for IEEE 802.11be. On 8 January 2024 the{' '}
            <a href="https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-introduces-wi-fi-certified-7" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Wi-Fi Alliance opened Wi-Fi CERTIFIED 7</a>
            so products could be tested for interoperability. The programme highlights 320 MHz
            channels in countries that open 6GHz, Multi-Link Operation, and 4K-QAM, which it says
            can raise transmission rates by 20 per cent compared with 1024-QAM.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Those are radio features between a hub and a client. They are not a faster Openreach
            order. The 46 Gbps figure you see on boxes is a theoretical maximum across an extreme
            implementation, not the speed one iPhone will pull from the internet.{' '}
            <a href="https://www.intel.com/content/www/us/en/products/details/wireless/wi-fi-7-series.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Intel’s feature comparison</a>
            {' '}and{' '}
            <a href="https://www.rtings.com/router/learn/wifi-6-vs-wifi-7" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">RTINGS’ Wi-Fi 6 versus 7 note</a>
            {' '}are useful for the radio side. Your contract still sets the ceiling from the street.
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Standard capabilities. A given router or phone may support only some of them.
              </caption>
              <thead>
                <tr className="bg-slate-50">
                  {['Feature', 'Wi-Fi 6', 'Wi-Fi 6E', 'Wi-Fi 7'].map((heading) => (
                    <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['IEEE name', '802.11ax', '802.11ax', '802.11be'],
                  ['Bands', '2.4GHz and 5GHz', '2.4GHz, 5GHz and 6GHz', '2.4GHz, 5GHz and 6GHz on tri-band kit'],
                  ['Maximum channel width', '160MHz', '160MHz', '320MHz in 6GHz'],
                  ['Multi-Link Operation', 'No', 'No', 'Yes, on compatible router and client'],
                  ['Best fit', 'Most sub-gigabit homes', 'Extra short-range 6GHz capacity', 'Multi-gigabit and busy local networks'],
                ].map(([feature, six, sixE, seven]) => (
                  <tr key={feature}>
                    <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">{feature}</th>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{six}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{sixE}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{seven}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Multi-Link Operation, 320MHz and 4K-QAM</h3>
          <p className="mt-3 leading-relaxed text-slate-700">
            Older generations usually hold one main wireless link at a time. MLO lets compatible
            kit coordinate more than one band or channel, which can help large local transfers,
            cloud gaming and video calls. 320 MHz channels live in 6GHz and are twice the width of
            Wi-Fi 6. 4K-QAM packs more data into a strong, clean signal, so the gain is most
            plausible near the router, not through three brick walls. The phone and the hub both
            have to speak the same feature.
          </p>
        </section>

        <section id="worth-it" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Is Wi-Fi 7 worth it?</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Put it on the shortlist when you are replacing a dying hub, you already pay for 1 Gbps
            or more, you move large files around the house, or several new Wi-Fi 7 devices sit in
            the same rooms. In those cases buy tri-band hardware with 6GHz and at least 2.5 Gbps
            WAN and LAN ports so the Ethernet socket is not the joke.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Wait if Wi-Fi 6 already delivers the speed you pay for in the rooms that matter, most
            devices are older, or the broadband package is below about 500 Mbps. Fix{' '}
            <Link href="/guides/fix-wifi-dead-spots-uk" className="font-semibold text-sky-700 hover:underline">dead spots</Link>
            {' '}before you buy a generation. Six-gigahertz signals do not walk through walls better
            than 5GHz. They offer extra capacity at short range.
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['Your position', 'Starting recommendation', 'Check before spending'].map((heading) => (
                    <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['100 to 500 Mbps; Wi-Fi 6 works', 'Keep Wi-Fi 6', 'Test beside the router and in the weak room'],
                  ['Gigabit fibre; iPhone 17, 18 Pro or Duo', 'Consider tri-band Wi-Fi 7', '6GHz, MLO and 2.5Gbps ports'],
                  ['Multi-gigabit or a fast home server', 'Wi-Fi 7 can help locally', 'WAN, LAN, switch, cabling and client limits'],
                  ['Dead zones behind thick walls', 'Solve coverage first', 'Placement, wired access points or mesh backhaul'],
                  ['Old router needs replacing anyway', 'Compare strong Wi-Fi 6 as well', 'Firmware support and returns policy'],
                ].map(([position, rec, check]) => (
                  <tr key={position}>
                    <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">{position}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-700">{rec}</td>
                    <td className="border border-slate-200 px-4 py-3 text-slate-600">{check}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <figure className="my-10">
          <Image
            src="/guides/wifi-7/router-ethernet.jpg"
            alt="An unbranded home router with a multi-gigabit Ethernet cable, original BroadbandPicker photograph."
            width={1600}
            height={900}
            className="rounded-2xl border border-slate-200"
          />
          <figcaption className="mt-2 text-sm text-slate-500">
            A 1 Gbps socket on a multi-gigabit contract is a bottleneck wearing a Wi-Fi 7 badge.
          </figcaption>
        </figure>

        <section id="broadband" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">Broadband first, then the radio</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            There is no minimum broadband speed for Wi-Fi 7. The upgrade is simply easier to
            justify on gigabit or multi-gigabit full fibre. A 100 Mbps package remains about 100
            Mbps from the internet even if the phone reports several gigabits to the hub. Run a{' '}
            <Link href="/tools/speed-test" className="font-semibold text-sky-700 hover:underline">wired speed test</Link>
            {' '}and compare it with{' '}
            <Link href="/guides/what-broadband-speed-do-i-need" className="font-semibold text-sky-700 hover:underline">what broadband speed you need</Link>
            {' '}and{' '}
            <Link href="/guides/broadband-speeds-explained" className="font-semibold text-sky-700 hover:underline">how advertised speeds work</Link>
            . If Ethernet is slow, look at the line or the contract, not the mesh.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            If you are still on copper FTTC,{' '}
            <Link href="/guides/full-fibre-broadband-explained" className="font-semibold text-sky-700 hover:underline">full fibre</Link>
            {' '}will change more than a new iPhone. Compare an address-specific deal, then the
            wireless kit.{' '}
            <a href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Ofcom’s choosing-broadband advice</a>
            {' '}is still the right order.
          </p>
        </section>

        <section className="mt-8">
          <h3 className="text-xl font-bold text-slate-900">Full-fibre deals to compare, not a Wi-Fi 7 special</h3>
          <p className="mt-2 mb-4 text-sm text-slate-600">
            These are ordinary broadband packages. None of them is an Apple product. We may earn a
            commission if you sign up through Get Deal. We do not currently earn a commission on
            routers or iPhones.
          </p>
          <DealTable deals={deals} />
        </section>

        <section id="uk-6ghz" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">UK 6GHz, EE hubs and replacing the ISP router</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            <a href="https://www.ofcom.org.uk/__data/assets/pdf_file/0036/198927/6ghz-statement.pdf" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Ofcom opened the lower 6GHz band</a>
            {' '}for licence-exempt Wi-Fi. UK channels and power are not a photocopy of the US
            rules, so buy a UK-market model. Apple’s own support note says 6GHz Wi-Fi 7 features
            only work where the regulator allows them.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            <a href="https://ee.co.uk/broadband/wifi-7-routers-explained" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">EE explains Wi-Fi 7 Smart Hubs</a>
            {' '}on selected packages. The package name is not a promise that every connected
            device can use MLO. If you replace the ISP hub, read{' '}
            <Link href="/guides/replace-isp-router-uk" className="font-semibold text-sky-700 hover:underline">how to swap a provider router without killing voice or TV</Link>
            . Access-point mode is often safer when the login or digital phone has to stay on the
            original box.
          </p>
        </section>

        <section id="buy" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">What to buy, and what we do not sell</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
            <li><strong>Bands:</strong> dual-band versus tri-band, and whether 6GHz is actually present.</li>
            <li><strong>Ports:</strong> 2.5 Gbps or faster on the sockets you will use.</li>
            <li><strong>Clients:</strong> the exact phone and laptop spec, not the year you bought them.</li>
            <li><strong>Layout:</strong> one router, mesh with Ethernet backhaul, or a wired access point. See our{' '}
              <Link href="/guides/best-mesh-wifi-for-your-broadband-router" className="font-semibold text-sky-700 hover:underline">mesh buying guide</Link>.</li>
            <li><strong>Support:</strong> firmware updates, warranty and a retailer that will take the box back.</li>
          </ul>
          <p className="mt-3 leading-relaxed text-slate-700">
            Currys, Amazon, TP-Link, Netgear and similar shops sell the hardware. We do not
            currently take a commission on those sales. If we later join those Awin programmes,
            the disclosure on this page will change. Until then the useful click is still an
            address-specific broadband check, because a Wi-Fi 7 badge on a 40 Mbps line is
            theatre.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Official product pages worth bookmarking: the{' '}
            <a href="https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-introduces-wi-fi-certified-7" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Wi-Fi Alliance CERTIFIED 7 announcement</a>
            ,{' '}
            <a href="https://www.apple.com/iphone-duo/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Apple’s iPhone Duo page</a>
            {' '}and{' '}
            <a href="https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/improving-your-wifi-experience" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">Ofcom’s home Wi-Fi tips</a>.
            The banner on this page is original BroadbandPicker artwork, not Apple or EE photography.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">A simple order of operations</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
            <li>Test beside the router, then in the weak room.</li>
            <li>If Ethernet is slow, compare full fibre at the address.</li>
            <li>If Ethernet is fine, move the hub or add wired backhaul.</li>
            <li>Only then spend on Wi-Fi 7, once the phones you own can use it.</li>
          </ol>
        </section>

        <section id="faq" className="scroll-mt-24 mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Wi-Fi 7 FAQs</h2>
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
