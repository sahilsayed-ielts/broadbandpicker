import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: 'Broadband Glossary: Every Term Explained | BroadbandPicker',
  description:
    'Plain-English definitions of every broadband term used in the UK — from ADSL and FTTP to One Touch Switching, social tariffs, and latency. Updated June 2026.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/broadband-glossary' },
  openGraph: {
    title: 'UK Broadband Glossary — Every Term Explained',
    description:
      'Confused by broadband jargon? Our A–Z glossary defines every term you will encounter when comparing UK broadband deals.',
    url: 'https://broadbandpicker.co.uk/broadband-glossary',
  },
}

type Term = { term: string; definition: string; relatedHref?: string; relatedLabel?: string }
type Section = { letter: string; terms: Term[] }

const glossary: Section[] = [
  {
    letter: 'A',
    terms: [
      {
        term: 'ADSL (Asymmetric Digital Subscriber Line)',
        definition:
          'The original type of broadband that uses your copper phone line to carry an internet connection. Maximum download speeds are around 24 Mbps, though most users experience far less. ADSL is being phased out across the UK as full fibre expands, and most providers no longer sell new ADSL contracts.',
      },
      {
        term: 'Alt-net (Alternative Network)',
        definition:
          'A broadband provider that builds and owns its own network infrastructure rather than renting lines from Openreach or Virgin Media. Community Fibre, Hyperoptic, Toob, and Voneus are examples. Alt-nets often offer faster or cheaper full-fibre broadband in the specific areas they cover, but their geographic coverage is more limited than the major national providers.',
      },
      {
        term: 'Asymmetric broadband',
        definition:
          'A broadband connection where download speed is significantly faster than upload speed. This is the norm for ADSL and most FTTC (fibre to the cabinet) packages — for example, 80 Mbps download but only 20 Mbps upload. The opposite is symmetric broadband, which is common with full fibre (FTTP) connections.',
      },
      {
        term: 'Automatic compensation',
        definition:
          'A payment that broadband providers must make to customers when service fails. Under Ofcom\'s voluntary scheme (adopted by BT, EE, Sky, TalkTalk, Virgin Media, and others), you receive £9.76/day for loss of service lasting more than two full working days, and £29.15 for a missed engineer appointment. Compensation is automatic — you do not need to claim.',
      },
    ],
  },
  {
    letter: 'B',
    terms: [
      {
        term: 'Bandwidth',
        definition:
          'The maximum data transfer capacity of your broadband connection, measured in Mbps or Gbps. Higher bandwidth means more data can move at once. In practice, bandwidth is shared between all devices on your network — a 100 Mbps connection shared between five devices streaming simultaneously will feel slower than the same connection used by one device.',
      },
      {
        term: 'Broadband',
        definition:
          'A high-speed internet connection that is always on — as opposed to the old dial-up connections that used the phone line and disconnected between sessions. In the UK, broadband comes in several forms: ADSL (copper phone line), FTTC (part-fibre), FTTP (full fibre), cable (Virgin Media), and mobile broadband (4G/5G).',
      },
    ],
  },
  {
    letter: 'C',
    terms: [
      {
        term: 'Cable broadband',
        definition:
          'Broadband delivered via coaxial cable rather than a phone line. In the UK, Virgin Media is the only major cable broadband provider, reaching approximately 53% of UK premises. Cable broadband offers high speeds (up to 1.1 Gbps on Virgin\'s top tier) and does not require a traditional phone line.',
      },
      {
        term: 'Contention ratio',
        definition:
          'The number of users sharing the same network capacity. A contention ratio of 50:1 means 50 households share the same connection to the exchange. Lower contention ratios mean faster, more consistent speeds during peak times. Most residential broadband has a contention ratio between 20:1 and 50:1. Leased lines have a 1:1 ratio — dedicated capacity for a single customer.',
      },
      {
        term: 'Contract length',
        definition:
          'The minimum term you agree to when signing up for broadband. Common contract lengths are 12, 18, and 24 months. Shorter contracts usually cost more per month but give you flexibility to switch sooner without paying an early termination charge. Once your minimum term ends, you move to a rolling monthly contract — at which point you can switch without penalty.',
        relatedHref: '/guides/how-to-switch-broadband-uk',
        relatedLabel: 'How to switch broadband',
      },
    ],
  },
  {
    letter: 'D',
    terms: [
      {
        term: 'Data cap',
        definition:
          'A limit on the amount of data you can download each month. Most UK home broadband deals are now "unlimited" with no data cap. Some older or budget plans still impose caps — typically expressed in gigabytes (GB). If you exceed the cap, you may be charged extra or have your speed reduced.',
      },
      {
        term: 'Download speed',
        definition:
          'The rate at which data travels from the internet to your device, measured in Mbps. Download speed affects how quickly web pages load, how smoothly video streams, and how fast files arrive. It is the headline figure advertised by UK broadband providers. See also: upload speed.',
        relatedHref: '/guides/broadband-speeds-explained',
        relatedLabel: 'Broadband speeds explained',
      },
      {
        term: 'Dynamic IP address',
        definition:
          'An IP address that changes each time your router connects to the internet. Almost all home broadband connections use dynamic IPs. If you need a fixed, permanent IP address — for running a server or remote access — you need a static IP, usually available as an add-on from providers like Zen Internet.',
      },
    ],
  },
  {
    letter: 'E',
    terms: [
      {
        term: 'Early termination charge (ETC)',
        definition:
          'The fee you pay if you cancel your broadband contract before the minimum term ends. ETCs are typically calculated as the remaining monthly charges on your contract. For example, if you have six months left at £30/month, the ETC may be up to £180. Ofcom rules allow you to exit without penalty if your provider raises prices mid-contract.',
      },
      {
        term: 'Exchange',
        definition:
          'The local BT or Openreach building where phone lines and broadband connections are aggregated and connected to the wider internet. How close your home is to the exchange affects ADSL and FTTC speeds — the further the distance, the slower the connection. Full fibre (FTTP) eliminates this distance limitation entirely.',
      },
    ],
  },
  {
    letter: 'F',
    terms: [
      {
        term: 'Fibre optic',
        definition:
          'Glass or plastic strands that transmit data as pulses of light. Fibre optic cables are much faster than copper wire and are the backbone of modern broadband networks. In the UK, the term "fibre broadband" is often used loosely — it can mean either FTTC (where fibre runs only to the street cabinet) or FTTP (where fibre runs all the way to your property).',
      },
      {
        term: 'FTTC (Fibre to the Cabinet)',
        definition:
          'The most common type of broadband in the UK. Fibre optic cable runs from the telephone exchange to the green street cabinet at the end of your road — but the final connection from the cabinet to your home uses the old copper telephone wire. This limits speeds to around 36–80 Mbps. Also called "superfast" or "part-fibre" broadband. Being replaced by FTTP.',
        relatedHref: '/guides/full-fibre-broadband-explained',
        relatedLabel: 'Full fibre explained',
      },
      {
        term: 'FTTP (Fibre to the Premises)',
        definition:
          'Full fibre broadband — fibre optic cable runs all the way from the exchange directly into your property, with no copper wire involved at any point. This enables speeds from 100 Mbps up to 1 Gbps or beyond, with lower latency and much greater reliability than FTTC. Available to approximately 89% of UK premises as of 2026, though not all can get it yet.',
        relatedHref: '/guides/full-fibre-broadband-explained',
        relatedLabel: 'Full fibre explained',
      },
      {
        term: 'Full fibre broadband',
        definition:
          'See FTTP. A broadband connection using optical fibre all the way from the provider\'s network to your home — no copper wire in the final leg. In the UK, full fibre is delivered via Openreach\'s nationwide network (used by BT, Sky, EE, TalkTalk, and Plusnet) as well as Virgin Media\'s cable network and various alt-net providers.',
      },
    ],
  },
  {
    letter: 'G',
    terms: [
      {
        term: 'G.fast',
        definition:
          'A technology that uses the existing copper phone line for the final stretch to your home but achieves higher speeds than standard FTTC by shortening that copper segment significantly. G.fast is a transitional technology deployed in some areas while full FTTP rollout continues. Maximum speeds are around 150–300 Mbps.',
      },
      {
        term: 'Gbps (Gigabits per second)',
        definition:
          '1,000 Mbps. The unit used to describe the very fastest broadband connections. A "gigabit" broadband package advertises speeds of 1 Gbps (1,000 Mbps). Downloading a full HD film at 1 Gbps takes roughly 30 seconds. Only available via full fibre (FTTP) or cable (Virgin Media).',
      },
      {
        term: 'Gigabit broadband',
        definition:
          'A broadband connection capable of speeds of at least 1,000 Mbps (1 Gbps). As of Spring 2026, 89% of UK premises can access a gigabit-capable network. Gigabit speeds are typically only needed by households with many simultaneous heavy users, or for very large uploads and downloads.',
      },
    ],
  },
  {
    letter: 'I',
    terms: [
      {
        term: 'Installation fee',
        definition:
          'A one-off upfront charge for setting up your broadband connection. Many UK broadband deals now offer free installation, particularly for FTTC connections. FTTP (full fibre) installations requiring an engineer to run new fibre into your property may still incur an installation fee with some providers, though this is often waived on promotional deals.',
      },
      {
        term: 'IP address',
        definition:
          'A unique numerical label assigned to your router by your broadband provider. Your IP address identifies your connection on the internet. Most home broadband connections use a dynamic IP address that changes periodically. See also: static IP address.',
      },
      {
        term: 'ISP (Internet Service Provider)',
        definition:
          'A company that provides broadband access to homes or businesses. UK ISPs include BT, Sky, Virgin Media, EE, TalkTalk, Vodafone, Plusnet, NOW Broadband, Zen Internet, Hyperoptic, Community Fibre, and many others. Most major ISPs use the Openreach network; Virgin Media uses its own cable infrastructure.',
      },
    ],
  },
  {
    letter: 'J',
    terms: [
      {
        term: 'Jitter',
        definition:
          'The variation in delay between data packets arriving at your device. Low jitter means packets arrive at consistent intervals — important for video calls and online gaming. High jitter causes choppy audio and video on calls, and lag spikes in games. Full-fibre connections typically have much lower jitter than FTTC or ADSL.',
      },
    ],
  },
  {
    letter: 'L',
    terms: [
      {
        term: 'Latency',
        definition:
          'The time it takes for data to travel from your device to a server and back, measured in milliseconds (ms). Also called "ping." Lower latency is better — under 20ms is excellent for gaming and video calls. High latency (over 100ms) causes noticeable delays. Full-fibre connections typically offer 5–10ms latency; ADSL can be 40–60ms.',
      },
      {
        term: 'Leased line',
        definition:
          'A dedicated, symmetric broadband connection with a 1:1 contention ratio — not shared with any other user. Leased lines are primarily used by businesses requiring guaranteed speeds and maximum reliability. They are significantly more expensive than residential broadband (typically £100–£500+/month) and are not a practical option for home use.',
      },
      {
        term: 'Line rental',
        definition:
          'A monthly charge for maintaining the copper phone line into your home, historically required alongside broadband. With the shift to full fibre (FTTP) and providers discontinuing the old PSTN (Public Switched Telephone Network), line rental in the traditional sense is being phased out. Most new broadband packages no longer include or require traditional line rental.',
      },
    ],
  },
  {
    letter: 'M',
    terms: [
      {
        term: 'Mbps (Megabits per second)',
        definition:
          'The standard unit for measuring broadband speed in the UK. 1 Mbps means one million bits of data per second. 8 bits = 1 byte, so a 100 Mbps connection can download approximately 12.5 megabytes per second. A 1GB file takes about 80 seconds to download at 100 Mbps.',
        relatedHref: '/guides/broadband-speeds-explained',
        relatedLabel: 'Broadband speeds explained',
      },
      {
        term: 'Mid-contract price rise',
        definition:
          'A price increase that takes effect during an active broadband contract. Before January 2025, many providers linked mid-contract rises to inflation (CPI or RPI) plus a percentage — often CPI+3.9%. Since January 2025, Ofcom requires new contracts to state any mid-contract rise as a fixed pound amount. If your contract was signed before this date, check your terms.',
      },
      {
        term: 'Minimum guaranteed speed',
        definition:
          'The lowest broadband speed your provider promises to deliver. Under Ofcom rules, providers must tell you this figure before you sign up. If your actual speed consistently falls below the minimum guaranteed speed, you have the right to exit your contract without an early termination charge. You must first give the provider 30 days to fix the problem.',
      },
      {
        term: 'Mobile broadband',
        definition:
          'Broadband that uses a mobile network (4G or 5G) rather than a fixed line. Mobile broadband can be delivered via a USB dongle, a Mi-Fi hotspot, or a 5G home router. Speeds and reliability depend on mobile network coverage. 5G home broadband is now a credible alternative to fixed-line broadband in well-covered areas.',
      },
    ],
  },
  {
    letter: 'O',
    terms: [
      {
        term: 'Ofcom',
        definition:
          'The Office of Communications — the UK\'s independent regulator for the communications sector, including broadband, mobile, TV, and radio. Ofcom sets rules on how broadband is advertised, publishes quarterly complaints data for every provider, and investigates consumer complaints that cannot be resolved directly with providers.',
      },
      {
        term: 'One Touch Switching (OTS)',
        definition:
          'The Ofcom-mandated switching process introduced in 2023 for all UK broadband providers. Under OTS, you contact only your new provider to initiate a switch — they notify your current provider and manage the cancellation. You should not need to contact your old provider at all. Over 1.6 million UK customers had used OTS by September 2025.',
        relatedHref: '/guides/how-to-switch-broadband-uk',
        relatedLabel: 'How to switch broadband',
      },
      {
        term: 'ONT (Optical Network Terminal)',
        definition:
          'A small box installed on the wall inside your property as part of an FTTP (full fibre) installation. The ONT converts the incoming optical signal from the fibre cable into an electrical signal that your router can use. It is usually installed by an Openreach engineer. Your broadband router plugs into the ONT.',
      },
      {
        term: 'Openreach',
        definition:
          'BT\'s network division, which owns and maintains the telephone exchange network and most of the UK\'s telephone line infrastructure — including the cabinets and local loops used by the majority of UK broadband providers. Providers like Sky, EE, TalkTalk, Plusnet, and Vodafone all rent Openreach\'s infrastructure. Openreach is legally separate from BT Consumer to prevent anti-competitive behaviour.',
      },
      {
        term: 'Out-of-contract price',
        definition:
          'The price you pay after your minimum contract term ends and you have not renewed. Almost always higher than the introductory price — Ofcom data shows out-of-contract customers pay an average of £5–£12 more per month than new customers signing up for the same service. Providers are required to notify you before your contract ends so you can choose to switch or renew.',
      },
    ],
  },
  {
    letter: 'P',
    terms: [
      {
        term: 'Packet loss',
        definition:
          'When some of the data packets travelling across a network fail to reach their destination. A small amount of packet loss (under 1%) is normal and barely noticeable. Significant packet loss causes buffering during video streaming, audio dropout on calls, and visible lag in games. It is often a symptom of a faulty router, damaged cable, or network congestion.',
      },
      {
        term: 'Ping',
        definition:
          'See latency. Ping is the informal term for the round-trip time between your device and a server, measured in milliseconds. A lower ping is better. Gaming typically requires a ping under 50ms for a smooth experience; under 20ms is ideal. You can measure your ping using a broadband speed test.',
      },
    ],
  },
  {
    letter: 'R',
    terms: [
      {
        term: 'Rolling contract (monthly contract)',
        definition:
          'A broadband deal with no minimum term — you pay month to month and can cancel with 30 days\' notice. Rolling contracts are more expensive per month than fixed-term deals but give maximum flexibility. Useful for renters, students, or anyone who may need to move at short notice. Providers including NOW Broadband offer rolling monthly options.',
      },
      {
        term: 'Router',
        definition:
          'The box provided by your broadband provider that connects your home to the internet and distributes the Wi-Fi signal. Modern routers double as wireless access points. Most UK broadband packages include a router in the monthly fee. You usually keep the router during the contract; when you switch providers, you return the old router and receive a new one.',
      },
    ],
  },
  {
    letter: 'S',
    terms: [
      {
        term: 'Social tariff',
        definition:
          'A discounted broadband package offered by providers to households receiving means-tested benefits, including Universal Credit, Pension Credit, and others. Social tariffs start from around £12.50/month. Available from BT (Home Essentials), Sky (Broadband Basics), Virgin Media (Essential Broadband), Vodafone, and others. Over 4 million UK households are eligible, but 70% have never heard of them.',
        relatedHref: '/guides/cheapest-broadband-uk',
        relatedLabel: 'Cheapest broadband UK',
      },
      {
        term: 'Speed test',
        definition:
          'A tool that measures your current broadband download speed, upload speed, ping, and often jitter. Run a speed test with your device connected via an Ethernet cable directly to your router for the most accurate result — Wi-Fi adds variability. Ofcom\'s speed test tool and Ookla\'s Speedtest.net are the most widely used in the UK.',
      },
      {
        term: 'Static IP address',
        definition:
          'A fixed, permanent IP address that does not change between sessions. Usually an optional add-on from providers. Useful for businesses, remote workers needing consistent remote access, or anyone self-hosting a website or server. Zen Internet is well known for offering static IPs as standard on home broadband packages.',
      },
      {
        term: 'Superfast broadband',
        definition:
          'Ofcom\'s official term for broadband with download speeds of at least 30 Mbps. In practice, superfast typically refers to FTTC (fibre to the cabinet) connections delivering 30–80 Mbps. As of 2026, 97% of UK premises can access superfast broadband.',
      },
      {
        term: 'Symmetric broadband',
        definition:
          'A connection where upload and download speeds are equal — for example, 500 Mbps download and 500 Mbps upload. Full-fibre (FTTP) connections are often symmetric, which is a significant advantage for video calls, cloud backups, and content creation. Standard FTTC broadband is asymmetric, with upload speeds typically 20–25% of download speeds.',
      },
    ],
  },
  {
    letter: 'T',
    terms: [
      {
        term: 'Throttling',
        definition:
          'When a provider intentionally reduces your broadband speed — usually during peak hours or once you have exceeded a data threshold. Most UK broadband deals advertise "unlimited" usage with no throttling, though fair-use policies may apply. Traffic management policies (see below) are a related concept.',
      },
      {
        term: 'Traffic management',
        definition:
          'A provider\'s policy for prioritising certain types of internet traffic during periods of high network demand. For example, a provider might prioritise video streaming over file downloads during peak evening hours. Ofcom requires providers to publish their traffic management policies transparently.',
      },
    ],
  },
  {
    letter: 'U',
    terms: [
      {
        term: 'Ultrafast broadband',
        definition:
          'Ofcom\'s term for broadband with download speeds of at least 300 Mbps. Typically available only via full-fibre (FTTP) or Virgin Media\'s cable network. As of 2026, approximately 89% of UK premises can access an ultrafast-capable network.',
      },
      {
        term: 'Universal Service Obligation (USO)',
        definition:
          'A legal right for every UK home and business to request a decent broadband connection — currently defined as at least 10 Mbps download and 1 Mbps upload. If no provider can deliver this commercially, BT or KCOM (in Hull) must provide it, with connection costs above £3,400 covered by a USO fund. The USO is administered by Ofcom.',
      },
      {
        term: 'Upload speed',
        definition:
          'The rate at which data travels from your device to the internet. Upload speed affects video call quality, how quickly you send files, cloud backup speeds, and live streaming. UK broadband deals are often described by download speed only — always check the upload speed separately, especially if you work from home or create content.',
        relatedHref: '/guides/best-broadband-for-working-from-home',
        relatedLabel: 'Best broadband for working from home',
      },
    ],
  },
  {
    letter: 'V',
    terms: [
      {
        term: 'Virtual ISP',
        definition:
          'A broadband provider that does not own its own network infrastructure, but instead rents capacity from a network owner (such as Openreach or Virgin Media) and resells it under its own brand. Many well-known UK providers are virtual ISPs — for example, Plusnet uses Openreach\'s network, as does NOW Broadband (Sky\'s network). The underlying connection quality is typically identical to the host network.',
      },
      {
        term: 'Voucher scheme',
        definition:
          'A government or provider initiative that offers money towards the cost of upgrading to gigabit broadband. The UK Government\'s Gigabit Voucher Scheme provides grants to households and businesses in eligible areas (typically rural or hard-to-reach locations) to help fund FTTP installation. Check DCMS (Department for Culture, Media and Sport) guidance for current availability.',
      },
    ],
  },
  {
    letter: 'W',
    terms: [
      {
        term: 'WAN (Wide Area Network)',
        definition:
          'A network that spans a large geographic area — in home networking terms, the WAN port on your router is the connection to your broadband provider\'s network (the internet). Your home devices connect to your router via the LAN (Local Area Network). Broadband speed tests measure your WAN connection speed.',
      },
      {
        term: 'Wi-Fi',
        definition:
          'Wireless networking technology that allows devices to connect to your router without a cable. Wi-Fi speeds are always lower than the broadband speed coming into your home — your router receives the full broadband speed, then distributes it wirelessly. Wi-Fi range and speed are affected by walls, interference, router placement, and the Wi-Fi standard (Wi-Fi 5, Wi-Fi 6, Wi-Fi 6E). A wired Ethernet connection is always faster and more reliable than Wi-Fi.',
      },
      {
        term: 'Wired connection (Ethernet)',
        definition:
          'Connecting your device directly to your router using an Ethernet (RJ45) cable. A wired connection is faster, more stable, and lower latency than Wi-Fi. Recommended for gaming, video calls, 4K streaming, and home working. If running a cable is impractical, a powerline adapter or MoCA adapter can carry a wired connection through your existing household wiring.',
      },
    ],
  },
]

const letters = glossary.map((s) => s.letter)

export default function BroadbandGlossaryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'UK Broadband Glossary',
    description:
      'Definitions of broadband terms and technology used in the UK — from ADSL and FTTP to One Touch Switching and social tariffs.',
    url: 'https://broadbandpicker.co.uk/broadband-glossary',
    publisher: {
      '@type': 'Organization',
      name: 'BroadbandPicker',
      url: 'https://broadbandpicker.co.uk',
    },
    hasDefinedTerm: glossary.flatMap((s) =>
      s.terms.map((t) => ({
        '@type': 'DefinedTerm',
        name: t.term,
        description: t.definition,
        inDefinedTermSet: 'https://broadbandpicker.co.uk/broadband-glossary',
      }))
    ),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Broadband glossary', href: '/broadband-glossary' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Broadband Glossary</h1>
      <p className="text-sm text-slate-500 mb-4">Last updated: June 2026 &middot; {glossary.reduce((n, s) => n + s.terms.length, 0)} terms defined</p>

      <p className="text-slate-600 leading-relaxed mb-8 max-w-2xl">
        Plain-English definitions of every broadband term you will encounter when comparing UK
        deals — from the technology that delivers your connection to your rights as a consumer.
        Use the letters below to jump to any section.
      </p>

      {/* Letter jump navigation */}
      <nav aria-label="Jump to letter" className="mb-10">
        <div className="flex flex-wrap gap-2">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#${letter}`}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
      </nav>

      {/* Glossary sections */}
      <div className="space-y-12">
        {glossary.map((section) => (
          <section key={section.letter} id={section.letter} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-extrabold text-slate-900">{section.letter}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <dl className="space-y-5">
              {section.terms.map((t) => (
                <div
                  key={t.term}
                  className="bg-white border border-slate-200 rounded-xl p-5"
                >
                  <dt className="font-bold text-slate-900 mb-2">{t.term}</dt>
                  <dd className="text-slate-600 text-sm leading-relaxed">
                    {t.definition}
                    {t.relatedHref && (
                      <span>
                        {' '}
                        <Link
                          href={t.relatedHref}
                          className="text-sky-600 hover:underline font-medium"
                        >
                          {t.relatedLabel} &rarr;
                        </Link>
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {/* Back to top */}
      <div className="mt-12 text-center">
        <a
          href="#"
          className="text-sm text-sky-600 hover:underline font-medium"
        >
          Back to top
        </a>
      </div>

      {/* CTA */}
      <div className="mt-10 p-6 bg-sky-50 border border-sky-200 rounded-xl">
        <h2 className="font-bold text-slate-900 mb-2">Ready to compare deals?</h2>
        <p className="text-sm text-slate-600 mb-4">
          Now you know the jargon, find the right broadband deal at your postcode.
        </p>
        <Link
          href="/compare"
          className="inline-block px-5 py-2.5 bg-sky-500 text-white font-semibold rounded-lg text-sm hover:bg-sky-600 transition-colors"
        >
          Compare broadband deals
        </Link>
      </div>
    </div>
  )
}
