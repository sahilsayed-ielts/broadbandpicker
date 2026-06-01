import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { guides, getGuideBySlug } from '@/data/guides'
import { providers, getTopDeals } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import DealTable from '@/components/DealTable'
import FAQAccordion from '@/components/FAQAccordion'

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `https://broadbandpicker.co.uk/guides/${slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `https://broadbandpicker.co.uk/guides/${slug}`,
    },
  }
}

const guideContent: Record<string, { body: React.ReactNode; faqs: { question: string; answer: string }[] }> = {
  'how-to-switch-broadband-uk': {
    body: (
      <>
        <p>Switching broadband provider is easier than ever in 2026, thanks to Ofcom&apos;s <strong>One Touch Switching (OTS)</strong> rules introduced in 2023. You now only need to contact your new provider — they handle the rest, including cancelling your old contract.</p>
        <h2>Step 1: Check when your contract ends</h2>
        <p>Log in to your current provider&apos;s account or check your bills to find your contract end date. Switching inside a contract usually means paying an <strong>early termination charge (ETC)</strong> — typically one month&apos;s bill per remaining month.</p>
        <p>If you&apos;re out of contract, you can switch immediately without penalty. Most providers will also waive ETCs if they&apos;ve raised prices mid-contract.</p>
        <h2>Step 2: Compare deals and choose a new provider</h2>
        <p>Use BroadbandPicker to compare deals from every major UK provider. Enter your postcode to see what&apos;s available at your address. Consider:</p>
        <ul>
          <li><strong>Price</strong> — the introductory rate and what it rises to after the deal period</li>
          <li><strong>Speed</strong> — match speed to your household&apos;s actual usage</li>
          <li><strong>Contract length</strong> — 12 months gives more flexibility, 18–24 months usually means a lower monthly price</li>
          <li><strong>Setup fees</strong> — many providers now offer free installation</li>
        </ul>
        <h2>Step 3: Sign up with your new provider</h2>
        <p>Once you&apos;ve chosen a deal, sign up directly with the new provider. Under One Touch Switching, they will contact your current provider to initiate the switch on your behalf. You won&apos;t normally need to call your old provider at all.</p>
        <h2>Step 4: Keep your old connection live until switch day</h2>
        <p>Don&apos;t cancel your existing broadband until the switch is confirmed and your new connection is working. Your new provider will give you a switch date — typically within 15 working days of signing up.</p>
        <h2>Step 5: Return old equipment</h2>
        <p>Your old provider will send a returns bag for any rented equipment (router, ONT box). Return it within the stated timeframe to avoid charges — usually 30 days.</p>
        <h2>How long does switching take?</h2>
        <p>Most switches complete within 10–15 working days. Full-fibre (FTTP) installations requiring an engineer visit may take up to 4 weeks. You should experience no more than a few minutes&apos; downtime during the cutover.</p>
      </>
    ),
    faqs: [
      { question: 'Will I lose my broadband connection when I switch?', answer: 'You should experience minimal downtime — typically just a few minutes during the actual cutover. For FTTP (full-fibre) installs requiring an engineer, you may be briefly without service during the installation appointment.' },
      { question: 'Can I keep my phone number when I switch broadband?', answer: 'Yes — if you have a landline number you want to keep, inform your new provider when you sign up. They can port your number across as part of the switch.' },
      { question: 'What if I\'m still in contract?', answer: 'You can still switch, but you\'ll likely have to pay an early termination charge (ETC) equal to the remaining months on your contract multiplied by your monthly fee. Check your contract or contact your provider to get the exact figure.' },
      { question: 'Do I need to call my old provider to cancel?', answer: 'Under One Touch Switching rules, no — your new provider handles the cancellation on your behalf. However, it\'s still worth calling your existing provider once the switch is confirmed to ensure there are no outstanding charges.' },
    ],
  },

  'best-broadband-deals-uk': {
    body: (
      <>
        <p>Finding the best broadband deal in the UK means looking beyond the headline monthly price. You need to consider speed, contract length, setup fees, and what the price rises to after the introductory period.</p>
        <h2>What makes a broadband deal &ldquo;best&rdquo;?</h2>
        <p>The best deal for you depends on your household. A family of four streaming in 4K and gaming needs very different broadband than a single person checking email. Key factors to weigh:</p>
        <ul>
          <li><strong>Monthly cost</strong> — particularly the total cost over the contract term, not just the introductory price</li>
          <li><strong>Speed</strong> — matched to your actual usage</li>
          <li><strong>Reliability</strong> — customer satisfaction scores matter</li>
          <li><strong>Contract flexibility</strong> — 12-month deals cost more per month but give you flexibility to switch sooner</li>
        </ul>
        <h2>Best budget broadband deals</h2>
        <p>For the cheapest broadband in the UK, <strong>NOW Broadband</strong> and <strong>TalkTalk</strong> consistently offer the lowest prices. Expect to pay around £18–£22/month for a standard fibre package.</p>
        <h2>Best mid-range broadband deals</h2>
        <p><strong>Sky</strong>, <strong>Vodafone</strong>, and <strong>EE</strong> sit in the mid-range, offering better speeds, superior routers, and stronger customer service for around £25–£35/month.</p>
        <h2>Best gigabit and full-fibre deals</h2>
        <p>If you want the fastest home broadband, look at full-fibre specialists. <strong>Community Fibre</strong> and <strong>Toob</strong> offer gigabit (1,000 Mbps) speeds at prices that often undercut the big providers, though coverage is limited to specific areas.</p>
        <h2>How to get the best deal</h2>
        <ul>
          <li>Check if you&apos;re out of contract — you have the most negotiating power at this point</li>
          <li>Use a comparison tool (like BroadbandPicker) to see every deal available at your postcode</li>
          <li>Call your current provider and ask if they can match competitor offers</li>
          <li>Consider cashback and gift cards — many providers offer these as sign-up incentives</li>
        </ul>
      </>
    ),
    faqs: [
      { question: 'What is the cheapest broadband in the UK?', answer: 'The cheapest broadband deals in the UK currently start from around £17.99/month from providers like NOW Broadband and TalkTalk. Prices vary by postcode and availability.' },
      { question: 'Which broadband provider has the best customer service?', answer: 'Based on Trustpilot scores, Toob (4.7), Community Fibre (4.6), and Hyperoptic (4.4) lead for customer satisfaction. Among the major nationwide providers, EE (4.1) scores highest.' },
      { question: 'Is it worth paying more for a faster connection?', answer: 'For households with 3+ regular users, yes — faster broadband reduces buffering, handles simultaneous 4K streams, and makes video calls more reliable. Below 50 Mbps can feel slow for modern households.' },
    ],
  },

  'full-fibre-broadband-explained': {
    body: (
      <>
        <p>Full fibre broadband — technically known as <strong>Fibre to the Premises (FTTP)</strong> — is the fastest, most reliable home broadband technology available in the UK. Unlike standard &ldquo;fibre&rdquo; broadband (which uses copper wiring between the street cabinet and your home), full fibre uses optical fibre all the way from the exchange to your front door.</p>
        <h2>FTTP vs FTTC: what&apos;s the difference?</h2>
        <p><strong>FTTC (Fibre to the Cabinet)</strong> is the most common type of broadband in the UK. It runs fibre optic cable to the green street cabinet, then uses older copper telephone wire for the final stretch to your home. This limits maximum speeds to around 80 Mbps download.</p>
        <p><strong>FTTP (Fibre to the Premises)</strong> runs fibre optic cable all the way to your home. There&apos;s no copper in the line at all, which means speeds of up to 1,000 Mbps (1 Gbps) are achievable, with much more consistent speeds and lower latency.</p>
        <h2>Is full fibre available at my address?</h2>
        <p>Full fibre coverage is expanding rapidly across the UK. Openreach (which builds and maintains the network used by BT, Sky, EE, TalkTalk, and Plusnet) is targeting 25 million premises by 2026. Alternative network providers (altnets) like Hyperoptic, Community Fibre, and Toob are also building FTTP networks in specific cities.</p>
        <p>To check if FTTP is available at your address, enter your postcode into our postcode checker above.</p>
        <h2>Is full fibre worth paying more for?</h2>
        <p>Yes, for most households in 2026 — especially if you:</p>
        <ul>
          <li>Have 3+ people working, streaming, or gaming simultaneously</li>
          <li>Work from home regularly and need reliable video calls</li>
          <li>Upload large files (photographers, videographers, content creators)</li>
          <li>Want symmetrical upload speeds for backups and cloud services</li>
        </ul>
        <p>Full-fibre prices have dropped significantly and are now often comparable to FTTC packages, particularly from specialist providers.</p>
        <h2>Will I need an engineer visit?</h2>
        <p>Yes — FTTP requires a new optical fibre cable to be run into your property. This typically involves a 2–4 hour appointment. Most providers cover the installation cost as part of the deal.</p>
      </>
    ),
    faqs: [
      { question: 'What is the difference between full fibre and superfast broadband?', answer: 'Superfast broadband (FTTC) uses fibre to the street cabinet and copper to your home, giving speeds up to ~80 Mbps. Full fibre (FTTP) uses fibre all the way to your property, enabling speeds of 100 Mbps to 1 Gbps.' },
      { question: 'How fast is full fibre broadband?', answer: 'Full fibre (FTTP) packages in the UK typically range from 100 Mbps to 1,000 Mbps (1 Gbps) download, and often offer symmetrical upload speeds — meaning your upload speed matches your download speed.' },
      { question: 'Does full fibre require a new router?', answer: 'Yes — your provider will send a new router compatible with the FTTP connection. You will also have an Optical Network Terminal (ONT) box installed at your property, which the router plugs into.' },
    ],
  },

  'broadband-speeds-explained': {
    body: (
      <>
        <p>Broadband speeds are measured in <strong>Megabits per second (Mbps)</strong> or, for the very fastest connections, <strong>Gigabits per second (Gbps)</strong>. The higher the number, the faster data travels between the internet and your device.</p>
        <h2>Download speed vs upload speed</h2>
        <p><strong>Download speed</strong> is how quickly data comes from the internet to your device. This affects streaming, web browsing, downloading files, and loading video calls.</p>
        <p><strong>Upload speed</strong> is how quickly data goes from your device to the internet. This affects video calls, cloud backups, uploading photos, and live streaming.</p>
        <p>Most broadband packages have much higher download speeds than upload speeds. Full-fibre (FTTP) packages are the exception — they often offer symmetric speeds.</p>
        <h2>What broadband speed do you actually need?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold">Household</th>
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold">Recommended speed</th>
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold">Package type</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1 person, light use (browsing, email)', '10–30 Mbps', 'ADSL or entry FTTC'],
                ['1–2 people, occasional streaming', '30–50 Mbps', 'FTTC'],
                ['Family of 4, regular streaming', '50–100 Mbps', 'Superfast FTTC or FTTP'],
                ['Heavy users, 4K streaming, gaming', '100–300 Mbps', 'FTTP'],
                ['Power users, home office, gigabit', '500+ Mbps', 'Full-fibre FTTP'],
              ].map(([household, speed, type]) => (
                <tr key={household}>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">{household}</td>
                  <td className="px-4 py-3 border border-slate-200 font-semibold text-slate-900">{speed}</td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-600">{type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Why does my speed vary?</h2>
        <p>Advertised speeds are &ldquo;up to&rdquo; figures. Your actual speed depends on: the technology (FTTC, FTTP, Cable), how far you are from the exchange or cabinet (for FTTC), the time of day, your home wiring, and your router&apos;s placement.</p>
        <p>Under Ofcom rules, providers must tell you the minimum guaranteed speed you can expect before you sign up. If you consistently receive below this, you have the right to exit your contract without penalty.</p>
        <h2>What is latency?</h2>
        <p>Latency (or ping) is the delay in milliseconds between sending a request and receiving a response. For gaming and video calls, low latency (under 30ms) is more important than raw speed. Full-fibre connections typically deliver much lower latency than FTTC or ADSL.</p>
      </>
    ),
    faqs: [
      { question: 'Is 100 Mbps broadband fast?', answer: 'Yes — 100 Mbps is more than sufficient for most UK households. It supports multiple 4K streams, video calls, gaming, and general browsing simultaneously without issues.' },
      { question: 'What does Mbps mean?', answer: 'Mbps stands for Megabits per second. It\'s a measure of data transfer speed. 1,000 Mbps = 1 Gbps (Gigabit). To download a 1GB file at 100 Mbps takes approximately 80 seconds.' },
      { question: 'Why is my broadband slower than advertised?', answer: 'Advertised speeds are "up to" figures. For FTTC, actual speed depends heavily on your distance from the street cabinet — the further away you are, the slower your speed. Wi-Fi can also reduce speeds compared to a wired connection.' },
    ],
  },

  'cheapest-broadband-uk': {
    body: (
      <>
        <p>The cheapest broadband deals in the UK currently start from around <strong>£17.99/month</strong>. But &ldquo;cheapest&rdquo; isn&apos;t always &ldquo;best value&rdquo; — you need to compare the total cost over the contract term and check what the price rises to after any introductory period.</p>
        <h2>The cheapest broadband providers in 2026</h2>
        <p><strong>NOW Broadband</strong> consistently offers the lowest entry prices among major UK providers, with deals from £17.99/month on a 12-month contract. <strong>TalkTalk</strong> is another budget option, often available from £19.99/month, with wider availability across the UK.</p>
        <h2>How to get even cheaper broadband</h2>
        <ul>
          <li><strong>Negotiate with your current provider</strong> — call your provider and ask if they can match a competitor&apos;s deal. Many providers have retention teams with unpublished offers.</li>
          <li><strong>Look for cashback deals</strong> — some providers offer £50–£150 in cashback or gift cards on top of the monthly price. Check cashback sites before signing up.</li>
          <li><strong>Switch if you&apos;re out of contract</strong> — loyalty rarely pays with broadband. New customers almost always get better rates than existing customers.</li>
          <li><strong>Check social tariffs</strong> — if you receive Universal Credit or certain other benefits, you may be eligible for a social tariff. BT&apos;s Home Essentials, Sky&apos;s Broadband Basics, and Virgin Media&apos;s Essential Broadband all offer significantly discounted rates.</li>
        </ul>
        <h2>Cheapest full-fibre broadband</h2>
        <p>If full-fibre (FTTP) is available in your area, the gap in price between FTTC and FTTP has narrowed significantly. Community Fibre and Hyperoptic (in London) and Toob (in Southampton) offer gigabit full-fibre from around £22/month — comparable to standard fibre packages from major providers.</p>
        <h2>Watch out for price rises</h2>
        <p>Budget providers often increase prices significantly after the introductory period. Always check what the &ldquo;out of contract&rdquo; price is before signing up, and set a reminder to compare deals again before your contract ends.</p>
      </>
    ),
    faqs: [
      { question: 'What is the absolute cheapest broadband in the UK?', answer: 'The cheapest deals start from around £17.99/month from NOW Broadband. However, some providers offer lower prices via cashback sites or exclusive online deals — always check comparison tools for the latest rates.' },
      { question: 'Are there cheap broadband deals for low-income households?', answer: 'Yes — social tariffs are available from BT (Home Essentials), Sky (Broadband Basics), Virgin Media (Essential Broadband), and others for households receiving Universal Credit or certain benefits. These typically cost £15–£25/month for standard broadband.' },
      { question: 'Is cheap broadband reliable?', answer: 'Budget providers use the same Openreach network as premium providers for FTTC connections, so the underlying line quality is the same. The difference is usually in customer service response times and router quality.' },
    ],
  },

  'best-broadband-for-working-from-home': {
    body: (
      <>
        <p>Working from home puts different demands on your broadband than casual home use. Video calls, file uploads, VPN connections, and cloud-based software all require a reliable, fast connection — and critically, a good <strong>upload speed</strong>.</p>
        <h2>What speed do you need for working from home?</h2>
        <p>For a single person working from home:</p>
        <ul>
          <li><strong>Minimum:</strong> 30 Mbps download, 10 Mbps upload</li>
          <li><strong>Recommended:</strong> 100+ Mbps download, 20+ Mbps upload</li>
          <li><strong>Ideal (multiple users):</strong> 300+ Mbps full-fibre</li>
        </ul>
        <p>Standard FTTC broadband (up to 80 Mbps download, 20 Mbps upload) is adequate for most single home workers. However, if you frequently upload large files, share the connection with others also working or studying at home, or rely on latency-sensitive applications, full-fibre is worth the upgrade.</p>
        <h2>Why upload speed matters for home working</h2>
        <p>Most broadband plans advertise download speeds — but for working from home, upload speed is equally important. Video calls on Zoom, Teams, or Google Meet require continuous upload bandwidth. A slow upload speed means others see you as choppy or pixelated.</p>
        <p>Full-fibre (FTTP) packages typically offer symmetrical speeds — meaning your upload speed matches your download speed. This is a significant advantage over FTTC, where upload speeds are typically just 20% of download speeds.</p>
        <h2>Best providers for home workers</h2>
        <p><strong>EE</strong> is consistently rated the most reliable major UK broadband provider and offers the fastest average download speeds. <strong>Zen Internet</strong> is the premium choice for home workers needing static IP addresses, no traffic management, and UK-based support.</p>
        <p>For gigabit full-fibre, <strong>Hyperoptic</strong> and <strong>Community Fibre</strong> (London) and <strong>Toob</strong> (Southampton area) offer the best value per Mbps, with excellent reliability and customer service.</p>
        <h2>Should you use Wi-Fi or a wired connection?</h2>
        <p>For serious home working, use a wired Ethernet connection directly from your router to your laptop or desktop. Wi-Fi introduces variability in speed and latency that can affect video calls and cloud applications. If cabling is impractical, a powerline adapter or MoCA adapter can extend wired connectivity through your existing home wiring.</p>
      </>
    ),
    faqs: [
      { question: 'What broadband speed do I need to work from home?', answer: 'A minimum of 30 Mbps download and 10 Mbps upload is workable for a single home worker. For households where multiple people are working or streaming simultaneously, 100+ Mbps is recommended.' },
      { question: 'Is full fibre worth it for working from home?', answer: 'Yes, especially if you regularly upload large files, attend multiple video calls per day, or share the connection with others. Full fibre (FTTP) delivers symmetrical speeds, lower latency, and better reliability than FTTC.' },
      { question: 'Does a VPN slow down broadband?', answer: 'VPNs add some overhead and typically reduce speeds by 10–30%. On a fast connection (100+ Mbps), this is barely noticeable. On a slow connection, it can make the difference between a workable and unworkable experience.' },
    ],
  },
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const content = guideContent[slug]
  if (!content) notFound()

  const topDeals = getTopDeals(3)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.publishDate,
    dateModified: guide.updatedDate,
    author: { '@type': 'Organization', name: 'BroadbandPicker' },
    publisher: {
      '@type': 'Organization',
      name: 'BroadbandPicker',
      url: 'https://broadbandpicker.co.uk',
    },
    url: `https://broadbandpicker.co.uk/guides/${slug}`,
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const updatedDate = new Date(guide.updatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Guides', href: '/guides' },
          { name: guide.title, href: `/guides/${slug}` },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{guide.title}</h1>

      <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200">
        <span>Updated {updatedDate}</span>
        <span>&middot;</span>
        <span>{guide.readingTime} min read</span>
      </div>

      <div className="prose prose-slate max-w-none mb-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:my-4 [&_ul]:pl-6 [&_li]:text-slate-700 [&_li]:mb-2 [&_strong]:text-slate-900 [&_table]:my-6 [&_th]:font-semibold [&_th]:text-slate-700 [&_td]:text-slate-700">
        {content.body}
      </div>

      {/* Featured deals */}
      <div className="my-10 p-6 bg-slate-50 rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Compare deals now</h2>
        <p className="text-slate-600 text-sm mb-4">
          Today&apos;s best broadband deals — sorted by price.
        </p>
        <DealTable deals={topDeals} showDisclosure={true} compact={true} />
        <Link
          href="/deals"
          className="inline-block mt-4 text-sky-600 font-semibold text-sm hover:underline"
        >
          See all deals &rarr;
        </Link>
      </div>

      {/* FAQ */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
      <FAQAccordion items={content.faqs} />

      {/* Related guides */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Related guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides
            .filter((g) => g.slug !== slug)
            .slice(0, 4)
            .map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow group"
              >
                <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">
                  {g.title}
                </h3>
                <p className="text-xs text-slate-500">{g.readingTime} min read</p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
