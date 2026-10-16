import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { guideCategories, guides, getGuideBySlug } from '@/data/guides'
import { providers, getTopDeals, getProviderBySlug } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import DealTable from '@/components/DealTable'
import NewsletterSignup from '@/components/NewsletterSignup'
import FAQAccordion from '@/components/FAQAccordion'
import PostcodeContextBar from '@/components/PostcodeContextBar'
import CashbackDealComparison from '@/components/CashbackDealComparison'
import TvBundleComparisonTable from '@/components/TvBundleComparisonTable'
import TvBundleDealCards from '@/components/TvBundleDealCards'
import CommercialGuideLayout from '@/components/CommercialGuideLayout'
import { getCommercialGuide } from '@/data/commercialGuides'
import { providerSchemaImage } from '@/lib/schemaImages'
import { tvBundleOptions } from '@/data/tvBroadbandBundles'
import { withHeadingIds } from '@/lib/extractHeadings'
import { JsonLd } from '@/lib/jsonLd'
import { articleJsonLd } from '@/lib/siteSchema'
import CiteableAnswer from '@/components/CiteableAnswer'
import PageHeroBanner from '@/components/PageHeroBanner'
import {
  DEFAULT_GUIDE_CTAS,
  absoluteHeroUrl,
  firstSentence,
  guideHero,
  guideHeroKicker,
} from '@/lib/pageHero'

export async function generateStaticParams() {
  return guides
    .filter(
      (g) =>
        g.slug !== 'gta-6-broadband-uk' &&
        g.slug !== 'wifi-7-explained-uk' &&
        g.slug !== 'best-broadband-for-streaming' &&
        g.slug !== 'what-broadband-speed-do-i-need',
    )
    .map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}
  const hero = guideHero(guide)
  const banner = absoluteHeroUrl(hero.image)

  return {
    title: { absolute: guide.metaTitle },
    description: guide.metaDescription,
    alternates: { canonical: `https://broadbandpicker.co.uk/guides/${slug}` },
    authors: [{ name: 'BroadbandPicker editorial team', url: 'https://broadbandpicker.co.uk/about' }],
    category: guide.category,
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `https://broadbandpicker.co.uk/guides/${slug}`,
      type: 'article',
      publishedTime: guide.publishDate,
      modifiedTime: guide.updatedDate,
      locale: 'en_GB',
      images: [{ url: banner, width: 1600, height: 900, alt: hero.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [banner],
    },
  }
}

const guideContent: Record<string, { body: React.ReactNode; faqs: { question: string; answer: string }[] }> = {
  'how-to-switch-broadband-uk': {
    body: (
      <>
        <p><strong>One Touch Switch means most UK home broadband customers only contact the provider they are joining.</strong> The new provider asks for your address and current-provider details, matches the existing service, tells the old provider and arranges the transfer. Your old broadband should end automatically after the new service starts, unless you deliberately choose to manage the two contracts yourself. A house move is different: use the <Link href="/guides/moving-house-broadband-checklist-uk">moving house broadband checklist</Link> if you need overlap between the old and new addresses, because Ofcom says One Touch Switch does not apply when you manage that cancellation yourself.</p>
        <p><a href="https://www.ofcom.org.uk/phones-and-broadband/switching-provider/simpler-broadband-switching-is-here" target="_blank" rel="noopener noreferrer">Ofcom introduced the cross-network process on 12 September 2024</a>. It applies when moving between participating fixed broadband networks, not just between providers using the same Openreach line. A first full-fibre installation or a move to a different network can still require an engineer, new wiring or drilling. Your new provider must explain those steps before the start date.</p>
        <p>Ofcom closed its dedicated One Touch Switch enforcement programme on 11 June 2026, around three years after opening it when providers missed the original legal deadline. The regulator found the majority of customers now switch successfully using the process, with more than 2 million having used it, and that providers previously attempting workarounds had stopped doing so. In practice this changes little day to day, but it confirms One Touch Switch as the industry&apos;s permanent standard rather than a still-bedding-in process, with Ofcom now able to take targeted action against any individual provider found to be obstructing it.</p>

        <h2>Broadband switching process at a glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Stage', 'What you do', 'What the providers do'].map((heading) => (
                  <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">1. Check</td><td className="border border-slate-200 px-4 py-3">Find your contract end date, exit charge and bundled services.</td><td className="border border-slate-200 px-4 py-3">Your current provider must show contract information and send an end-of-contract notice.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">2. Compare</td><td className="border border-slate-200 px-4 py-3">Check offers for your exact address, total contract cost and realistic speed.</td><td className="border border-slate-200 px-4 py-3">The chosen provider supplies contract information and an address-specific speed estimate.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">3. Order</td><td className="border border-slate-200 px-4 py-3">Give the new provider accurate account and address details.</td><td className="border border-slate-200 px-4 py-3">The new provider contacts the old one. Both send switch details and identify charges or services at risk.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">4. Change over</td><td className="border border-slate-200 px-4 py-3">Connect the new router or attend the engineer appointment.</td><td className="border border-slate-200 px-4 py-3">The new service starts, then the old broadband ends automatically under the managed process.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">5. Close</td><td className="border border-slate-200 px-4 py-3">Check the final bill, refund and equipment-return instructions.</td><td className="border border-slate-200 px-4 py-3">The old provider closes the account and must not charge a notice period after the switch date.</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Step 1: Check your contract end date and exit charge</h2>
        <p>Start with your bill, online account or end-of-contract message. <a href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/in-or-out" target="_blank" rel="noopener noreferrer">Ofcom says broadband contracts are commonly 12, 18 or 24 months</a>. Providers must send an end-of-contract notification by text, email or letter between 10 and 40 days before the minimum term ends. It must state the end date, notice period, current and post-contract price and the provider&apos;s best available deals.</p>
        <p>If the minimum term has ended, you can normally leave without an early termination charge. If it has not, ask the old provider for the exact charge on your intended switch date. Do not estimate it as simply the monthly bill multiplied by the months left. Providers use contract-specific calculations that can account for VAT, avoided costs, discounts and bundled products.</p>
        <p>A mid-contract switch can still make sense if the new provider offers a switching credit or the saving across the new minimum term exceeds the confirmed exit charge. Compare like with like: exit charge plus setup cost plus every scheduled monthly price against the full cost of staying. Our <Link href="/guides/broadband-contract-end-rights">broadband contract end rights guide</Link> explains the notice and tariff information you should receive. If a mobile discount depends on keeping the old broadband, check our <Link href="/guides/broadband-and-mobile-bundle-discounts-uk">broadband and mobile bundle guide</Link> before starting either switch.</p>

        <h2>Step 2: Compare broadband available at your address</h2>
        <p>Broadband availability and speed can change between neighbouring streets and flats, so a national headline offer is not enough. Use an address-level <Link href="/compare">broadband comparison</Link>, then verify the package summary supplied by the provider before ordering. We would start with total contract cost and the guaranteed or estimated speed for the address, not a gift card or an advertised maximum.</p>
        <p>Check these points for every shortlisted deal:</p>
        <ul>
          <li><strong>Total price:</strong> monthly charges across the minimum term, stated in-contract rises, setup or activation charges and delivery fees.</li>
          <li><strong>Address-specific speed:</strong> the download and upload estimate, plus any minimum guaranteed access-line speed the provider gives you.</li>
          <li><strong>Technology and work:</strong> FTTP, cable, fixed wireless or another connection, and whether an engineer needs access to the property.</li>
          <li><strong>Contract length:</strong> a longer term can reduce flexibility even where the first-month price is lower.</li>
          <li><strong>Router and support:</strong> delivery date, whole-home Wi-Fi options, fault contact routes and any equipment charge on departure.</li>
          <li><strong>Price after the term:</strong> set a reminder before the minimum term ends rather than drifting onto a higher rolling price.</li>
        </ul>
        <p>Use our <Link href="/guides/broadband-speeds-explained">broadband speed guide</Link> if the estimates are hard to compare. Customers receiving Universal Credit or another qualifying benefit should also check <Link href="/guides/broadband-social-tariffs-uk">broadband social tariffs</Link> before taking an ordinary commercial offer.</p>

        <h2>Step 3: Order from the new provider</h2>
        <p>Sign up with the gaining provider and say which provider currently supplies the address. Use the account holder&apos;s name and address exactly as they appear on the old bill because mismatched details can stop the automated match. The old provider then sends information about the proposed switch, including any early termination charge and services that may be affected.</p>
        <p>Do not separately cancel the old broadband during a normal One Touch Switch. Ofcom says the old service ends automatically once the new service is working. A separate cancellation can turn a coordinated transfer into a cease-and-reprovide order, creating avoidable downtime or risking a landline number.</p>
        <p>You can choose to manage the switch yourself if you need both connections to overlap, perhaps because uninterrupted access is essential for home working. Tell the new provider when ordering and cancel the old contract separately only after agreeing the plan. One Touch Switch protections do not apply to that self-managed route.</p>

        <h2>Step 4: Confirm phone, TV, email and accessibility needs</h2>
        <p>Broadband may sit inside a bundle whose parts do not all transfer. Ask the new and old providers to identify what happens to paid TV, call packages, mobile discounts, security products and extra Wi-Fi equipment. Ofcom says the old provider should explain any services that need separate cancellation. Paying the final broadband bill does not necessarily cancel an attached TV contract.</p>
        <p>If you want to keep a landline number, request the transfer during the new order and get confirmation before switch day. Citizens Advice says customers should generally be able to keep a number when changing landline provider unless moving house, but compatibility matters. A broadband-only package or a provider without a suitable digital voice service may not accept the number.</p>
        <p>Move away from an old provider-hosted email address before switching if continued access is uncertain. Update banking, government and recovery accounts first, export important messages and give contacts a provider-independent email address. People who rely on a personal alarm, medical device or landline during power cuts should tell the new provider before ordering and confirm how the equipment works with a digital phone service. Use our <Link href="/guides/digital-voice-explained-uk">Digital Voice guide</Link> to check provider names, handset setup and power-cut arrangements.</p>

        <h2>Step 5: Prepare for switch day and close the old account</h2>
        <p>The new provider gives you a start date and tells you whether an engineer is needed. Keep the old router connected until instructed, but unpack the new equipment early and check that the cables and power supply are present. If an engineer needs access, confirm the appointment window and any landlord permission required for drilling or a new fibre entry point.</p>
        <p>Once the replacement service works, test it over Ethernet or close to the router, then check phone service if included. Read the old provider&apos;s final bill for the switch date, early termination charge, account credit and any unreturned-equipment fee. Return rented routers, TV boxes or Wi-Fi discs using the provider&apos;s stated method and keep the postage receipt. Deadlines differ, so use the instructions sent for your account rather than assuming a universal 30-day period.</p>

        <h2>How long does it take to switch broadband?</h2>
        <p>Around 10 working days is a useful planning estimate for a straightforward transfer and is the timeframe currently cited by MoneySavingExpert. It is not a universal Ofcom deadline for completing every order. A new FTTP connection, network change, wayleave, engineer visit or address-matching problem can extend the lead time, so the provider&apos;s confirmed activation date is the date to plan around.</p>
        <p>The firmer consumer protection concerns disruption on the transfer day. <a href="https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider" target="_blank" rel="noopener noreferrer">Ofcom says loss of service during a provider-led switch must not last longer than one working day</a>. The new provider must keep you informed and compensate you if the switch goes wrong. Do not cancel essential mobile backup until the fixed connection and any digital phone are tested.</p>

        <h2>What to do if the broadband switch goes wrong</h2>
        <p>Contact the new provider first about a delayed activation, failed match or missed installation because it owns the switching order. Keep order confirmations, promised dates, appointment messages and screenshots of service status. Contact the old provider too if it continues billing after the completed switch or closes a service that was meant to remain active.</p>
        <p><a href="https://www.ofcom.org.uk/phones-and-broadband/service-quality/automatic-compensation-need-know" target="_blank" rel="noopener noreferrer">Ofcom&apos;s voluntary Automatic Compensation Scheme</a> covers named residential providers. At the rates verified on 23 August 2026, a delayed start earns £6.46 for each calendar day after the promised date, and a missed engineer appointment or cancellation with less than 24 hours&apos; notice earns £32.31. A reported total loss of service not repaired after two full working days earns £10.34 for each qualifying calendar day. Check that your provider participates and that no exclusion applies.</p>
        <p>If payment or a fix does not arrive, use the provider&apos;s formal complaints process. Ofcom does not resolve individual complaints, but its guidance points unresolved cases to the provider&apos;s approved alternative dispute resolution scheme. Our <Link href="/guides/broadband-complaints-and-ombudsman-uk">broadband complaints and ombudsman guide</Link> explains the six-week escalation rule, deadlock letters and the evidence to submit.</p>
      </>
    ),
    faqs: [
      { question: 'Will I lose my broadband connection when I switch?', answer: 'A provider-led One Touch Switch should keep disruption short because the old service ends after the new one starts. Ofcom says any loss of service must not exceed one working day. A new full-fibre installation or network change may need engineering work, so confirm the activation plan and keep mobile backup available until the new connection has been tested.' },
      { question: 'Can I keep my landline number when switching broadband?', answer: 'Ask the new provider to transfer your landline number when you place the order and obtain confirmation before switch day. Number retention is normally possible when changing landline provider, but it is not guaranteed for every move or package. Broadband-only deals and providers without a compatible digital voice service may be unable to accept the existing number.' },
      { question: 'Can I switch broadband if I am still in contract?', answer: 'Yes, but your old provider may charge an early termination fee. Ask for the exact amount for your proposed switch date because the calculation varies by contract and bundle. Add that fee and any setup costs to the new deal\'s full minimum-term price, then compare the result with the cost of staying before you order.' },
      { question: 'Do I need to cancel my old broadband before switching?', answer: 'No, not during a normal One Touch Switch. Order from the provider you are joining and it should notify the old provider and coordinate cancellation after the new service starts. Cancel separately only if you have deliberately chosen a self-managed overlap or are ending broadband without moving to another regulated fixed provider, and confirm the consequences first.' },
      { question: 'How long does it take to switch broadband provider?', answer: 'About 10 working days is a reasonable planning estimate for a straightforward broadband transfer, but installation requirements and provider availability can change the date. Use the confirmed activation date supplied with your order. Ofcom\'s specific protection is that loss of service during a managed switch must not exceed one working day, rather than a universal ten-day completion guarantee.' },
      { question: 'Can I get compensation if my broadband switch is delayed?', answer: 'Possibly. Ofcom\'s Automatic Compensation Scheme requires participating providers to pay £6.46 per calendar day when a new service starts late and £32.31 for a missed engineer appointment, at rates verified on 23 August 2026. Separate One Touch Switch rules also require compensation when switching problems leave you without service for more than one working day. Eligibility and exclusions apply.' },
      { question: 'Is One Touch Switch still a temporary or pilot scheme?', answer: 'No. Ofcom closed its dedicated One Touch Switch enforcement programme on 11 June 2026, around three years after opening it, having found that most customers now switch successfully using the process and that more than 2 million had already done so. It is now the industry\'s permanent standard, though Ofcom can still take targeted action against any individual provider found to be obstructing it.' },
    ],
  },

  'broadband-complaints-and-ombudsman-uk': {
    body: (
      <>
        <p><strong>Start a broadband complaint with the provider and state clearly that you want it logged as a formal complaint.</strong> Give the account number, what went wrong, when it happened, the evidence you hold and the remedy you want. If the dispute remains unresolved for six weeks, or the provider sends a deadlock or final-response letter sooner, take it free to the provider&apos;s Ofcom-approved alternative dispute resolution scheme.</p>
        <p><a href="https://www.ofcom.org.uk/phones-and-broadband/service-quality/adr-schemes?language=en" target="_blank" rel="noopener noreferrer">Ofcom&apos;s ADR guidance, updated 6 August 2026</a>, names two approved schemes: Communications Ombudsman and the Communications and Internet Services Adjudication Scheme, usually called CISAS. Your provider&apos;s membership decides which one handles the case. Ofcom regulates the sector and records reports, but it does not decide an individual claim for a refund, repair or compensation.</p>

        <h2>Broadband complaint escalation timeline</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Trigger', 'What to do', 'Evidence to keep'].map((heading) => (
                  <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">The service, bill or order goes wrong</td><td className="border border-slate-200 px-4 py-3">Report the fault or error and ask what the provider will do and by when.</td><td className="border border-slate-200 px-4 py-3">Screenshots, speed tests, bills, order details, outage dates and appointment messages.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">The first contact does not fix it</td><td className="border border-slate-200 px-4 py-3">Use the provider&apos;s complaints code and say this is a formal complaint. Ask for a reference number.</td><td className="border border-slate-200 px-4 py-3">Complaint date, reference, emails, letters, saved chats and call notes.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">The provider gives its final position</td><td className="border border-slate-200 px-4 py-3">Request a deadlock or final-response letter and check which ADR scheme it names.</td><td className="border border-slate-200 px-4 py-3">The letter, proposed remedy and your reasons for rejecting it.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Six weeks pass without resolution</td><td className="border border-slate-200 px-4 py-3">Submit the case to the provider&apos;s approved ADR scheme even if no deadlock letter arrived.</td><td className="border border-slate-200 px-4 py-3">A dated case summary, proof of loss, correspondence and the exact outcome requested.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">ADR issues a decision</td><td className="border border-slate-200 px-4 py-3">Read the acceptance deadline and effect carefully. An accepted decision binds the provider.</td><td className="border border-slate-200 px-4 py-3">Decision, acceptance confirmation and proof that the remedy was completed.</td></tr>
            </tbody>
          </table>
        </div>

        <h2>How to complain about a broadband provider</h2>
        <p>Find the complaints code on the provider&apos;s website or bill. Ofcom requires phone and broadband companies to publish an accessible code with a phone number, postal address and an email address or webform, as well as investigation steps and expected timeframes. A fault report to technical support may not start the complaint clock, so use the words <strong>formal complaint</strong> and record the date.</p>
        <p>Describe one clear sequence rather than forwarding an unexplained bundle of messages. State the service involved, the address, the date the problem began, every failed promise or appointment, the financial effect and what would settle the matter. A useful remedy might be a corrected bill, refund, account credit, repair, penalty-free cancellation, apology or compensation for evidenced loss and inconvenience.</p>

        <h3>Build a complaint case file</h3>
        <ul>
          <li><strong>Identity:</strong> account holder&apos;s name, service address, account number and safe contact details.</li>
          <li><strong>Timeline:</strong> dates and times of outages, orders, engineer visits, calls, chats and promised resolutions.</li>
          <li><strong>Contract evidence:</strong> order confirmation, pre-contract information, minimum guaranteed speed, bills and cancellation terms.</li>
          <li><strong>Technical evidence:</strong> router status, provider fault references and repeatable wired speed tests where speed is disputed.</li>
          <li><strong>Financial evidence:</strong> incorrect charges, receipts and a calculation linking each requested refund or cost to the failure.</li>
          <li><strong>Requested outcome:</strong> a specific action and amount, explaining how each part would put the problem right.</li>
        </ul>
        <p><a href="https://www.citizensadvice.org.uk/consumer/phone-internet-downloads-or-tv/dispute-a-phone-internet-or-tv-bill/" target="_blank" rel="noopener noreferrer">Citizens Advice recommends saving webchats and keeping letters, bills and proof of postage</a>. Do not assume that opening a dispute makes all payments optional. Pay undisputed charges and ask the provider how it will mark the disputed amount, because late-payment or debt action can continue if the case is not upheld.</p>

        <h2>When can you contact the broadband ombudsman?</h2>
        <p><strong>For a complaint first raised on or after 8 April 2026, the normal ADR wait is six weeks from the date the provider first received it.</strong> A deadlock letter lets you apply sooner. The previous threshold was eight weeks, so a complaint first raised before 8 April 2026 remains subject to that older transition rule unless the provider issued deadlock.</p>
        <p>A deadlock letter, sometimes called a final response, confirms that the provider cannot agree a resolution or has no further proposal. Ask for it in writing when the provider says its offer is final. Ofcom says an ADR application must be made less than 12 months after receiving a deadlock letter, but applying promptly is safer because scheme rules, evidence retention and any separate court limitation period still matter.</p>

        <h2>CISAS or Communications Ombudsman: which scheme handles your provider?</h2>
        <p>Use only the ADR scheme to which the provider belongs. The membership below is the major-provider list published by Ofcom and verified on 23 August 2026. Smaller brands and business divisions may use a different scheme, and membership can change, so check the provider&apos;s complaints code or Ofcom&apos;s current list before applying.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Approved ADR scheme', 'Major providers listed by Ofcom', 'Start here'].map((heading) => (
                  <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">CISAS</td><td className="border border-slate-200 px-4 py-3">NOW, O2, Sky, SMARTY, TalkTalk, Three, Virgin Media, Vodafone and VOXI</td><td className="border border-slate-200 px-4 py-3"><a href="https://www.cedr.com/consumer/cisas/" target="_blank" rel="noopener noreferrer">CISAS consumer service</a></td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Communications Ombudsman</td><td className="border border-slate-200 px-4 py-3">BT, EE, giffgaff, iD Mobile, Lebara, Plusnet, Tesco Mobile, Utility Warehouse and Lyca Mobile</td><td className="border border-slate-200 px-4 py-3"><a href="https://www.commsombudsman.org/raise-dispute" target="_blank" rel="noopener noreferrer">Communications Ombudsman dispute service</a></td></tr>
            </tbody>
          </table>
        </div>
        <p>Both services are independent of the provider and free for eligible residential customers. Ofcom also includes small businesses with up to 10 employees and not-for-profit organisations where up to 10 people work, excluding volunteers. Scheme scope still applies, so check eligibility if the dispute concerns data protection, personal injury, alleged crime, property damage or a provider&apos;s commercial decision not to serve an address.</p>

        <h2>What can broadband ADR do?</h2>
        <p>ADR examines the documents from both sides and can direct a provider to take practical action, correct or credit an account, refund charges, apologise or pay a financial award. Communications Ombudsman and CISAS each publish a maximum financial remedy of £10,000, but that is a ceiling rather than a typical award or promise. The result turns on the contract, law, relevant codes, evidence and what is fair in the individual case.</p>
        <p>Ask for a remedy you can justify. Separate direct financial loss from inconvenience, show the calculation and avoid treating the scheme maximum as a target. Communications Ombudsman says the provider has 28 days to implement an accepted decision. CISAS says a provider normally has 20 working days after the customer accepts its decision. Confirm the deadline in the decision you actually receive.</p>
        <p>You can generally reject an ADR decision and consider another route, including court, but legal costs and risk are different. If you accept, the provider is bound by the decision and you should not expect to accept only the favourable parts while challenging the award. Obtain independent legal advice before court action, especially where the claimed loss is substantial or a limitation deadline may apply.</p>

        <h2>Broadband complaint compensation is not one single scheme</h2>
        <p><a href="https://www.ofcom.org.uk/phones-and-broadband/service-quality/automatic-compensation-need-know" target="_blank" rel="noopener noreferrer">Ofcom&apos;s voluntary Automatic Compensation Scheme</a> can pay eligible residential customers of participating providers without an ADR ruling. At rates verified on 23 August 2026, delayed repair after a total loss of service earns £10.34 per qualifying calendar day, a missed appointment earns £32.31, and a delayed new-service start earns £6.46 per qualifying calendar day.</p>
        <p>Automatic compensation has provider, event and exclusion rules. It does not replace a formal complaint where the payment is missing, the provider disputes eligibility or the loss falls outside the code. Include the expected automatic payment in the complaint, identify the qualifying dates and explain separately any further remedy requested. This prevents an ADR application from mixing a fixed code payment with an unsupported general compensation figure.</p>

        <h2>Does Ofcom deal with individual broadband complaints?</h2>
        <p><strong>Ofcom does not resolve an individual broadband dispute or order a provider to refund one customer.</strong> It sets and enforces sector rules, approves ADR schemes and uses consumer reports to identify wider patterns. Report a regulatory concern to Ofcom where appropriate, but keep the provider complaint and ADR case moving because an Ofcom report is not a substitute for either. For the dated national picture, see our <Link href="/research/uk-broadband-customer-satisfaction">UK broadband customer satisfaction research</Link>, which keeps survey scores and complaints per 100,000 subscribers in separate columns.</p>
        <p>Consumers needing help with rights or disputed bills can contact Citizens Advice in England and Wales, Advice Direct Scotland in Scotland, or Consumerline in Northern Ireland. If the relationship with the provider is no longer workable after the dispute is closed, check your contract and use our <Link href="/guides/how-to-switch-broadband-uk">UK broadband switching guide</Link>. Compare services for the exact address through our <Link href="/compare">broadband comparison</Link> rather than cancelling first and risking avoidable downtime or exit charges.</p>

        <h2>What to do today</h2>
        <ol>
          <li>Write down the problem, dates, evidence, financial effect and exact remedy.</li>
          <li>Submit it through the provider&apos;s formal complaints route and save the reference.</li>
          <li>Set a calendar reminder for six weeks from the original complaint date.</li>
          <li>Request a deadlock letter sooner if the provider confirms it has no further offer.</li>
          <li>Verify the provider&apos;s scheme, then submit one organised evidence file to CISAS or Communications Ombudsman.</li>
        </ol>
        <p>If the dispute concerns an exit fee or a rise in the contract price, read the <Link href="/guides/broadband-contract-end-rights">broadband contract end rights guide</Link> and our guide to <Link href="/guides/can-i-leave-broadband-early-after-price-rise">leaving after a broadband price rise</Link>. Those pages explain the contract questions to settle before asking the provider or ADR scheme for penalty-free cancellation.</p>
      </>
    ),
    faqs: [
      { question: 'How do I complain about my broadband provider?', answer: 'Report the problem, then use the provider’s published complaints code and state that you want a formal complaint logged. Include the account number, a dated timeline, bills or technical evidence, financial loss and the remedy requested. Save the complaint reference, emails, letters and chats. If it remains unresolved, that record supports a free application to the provider’s approved ADR scheme.' },
      { question: 'How long must I wait before contacting the broadband ombudsman?', answer: 'For a broadband complaint first raised on or after 8 April 2026, you can normally use the provider’s ADR scheme after six weeks without resolution. You can apply earlier if the provider sends a deadlock or final-response letter. Complaints first raised before 8 April 2026 retain the previous eight-week threshold unless deadlock was reached sooner.' },
      { question: 'What is a broadband complaint deadlock letter?', answer: 'A deadlock letter, also called a final response, is written confirmation that the broadband provider cannot agree a resolution or has no further proposal. It allows you to take the complaint to the provider’s approved ADR scheme before the normal waiting period ends. Keep the letter and apply within the scheme’s time limit, explaining why the final offer is inadequate.' },
      { question: 'Should I use CISAS or Communications Ombudsman?', answer: 'Use the scheme named in your broadband provider’s complaints code. Ofcom currently lists Sky, Virgin Media, TalkTalk, Vodafone and NOW among CISAS members, while BT, EE and Plusnet are among Communications Ombudsman members. Check Ofcom’s current ADR page before applying because smaller providers, business divisions and scheme memberships can differ or change.' },
      { question: 'Can the broadband ombudsman award compensation?', answer: 'An approved broadband ADR scheme can direct practical action, refunds, account credits, an apology or a financial award when the evidence supports it. Both CISAS and Communications Ombudsman publish a £10,000 maximum, but ordinary awards can be far lower and no outcome is guaranteed. Show direct losses separately from inconvenience and explain how every amount requested was calculated.' },
      { question: 'Does Ofcom investigate my individual broadband complaint?', answer: 'Ofcom regulates UK communications providers, approves ADR schemes and records consumer reports, but it does not decide an individual dispute or order a refund for one customer. Continue through the provider’s formal process and then its approved ADR scheme. Reporting the issue to Ofcom can still help the regulator identify wider breaches, but it does not replace the complaint case.' },
      { question: 'Can I stop paying my broadband bill while a complaint is open?', answer: 'Do not assume that a complaint suspends every payment. Pay charges that are not disputed and ask the provider in writing how it will treat the contested amount. Citizens Advice warns that late-payment consequences may follow if a bill dispute is unsuccessful, while CISAS says debt activity can continue during a case. Seek debt or legal advice if payment is unaffordable.' },
    ],
  },

  'best-broadband-deals-uk': {
    body: (
      <>
        <p>Finding the best broadband deal in the UK means looking beyond the headline monthly price. You need to consider speed, contract length, setup fees, and what the price rises to after the introductory period.</p>
        <p>Shopping later in the year? Our <Link href="/guides/black-friday-broadband-deals-uk">UK Black Friday broadband guide</Link> explains how to test seasonal discounts, bill credits and vouchers against an ordinary live offer.</p>
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

  'broadband-deals-with-no-mid-contract-price-rise': {
    body: (
      <>
        <p>If you want a broadband deal that is easier to budget for, focus on providers that offer <strong>fixed-price terms</strong> or do not apply annual mid-contract increases. This is one of the simplest ways to avoid broadband bill shock in 2026.</p>

        <h2>Why this matters more now</h2>
        <p>For years, broadband customers were caught by inflation-linked increases that made the true cost of a deal hard to predict. Ofcom&apos;s newer rules improved transparency by requiring fixed pounds-and-pence price-rise wording on newer contracts, but that still does not mean every provider is equally good on price certainty.</p>
        <p>If your goal is predictability, the best broadband deal is not always the cheapest headline deal. It is the cheapest <em>stable</em> deal over the term you are likely to keep.</p>
        <p>The same check applies during seasonal sales. Read our <Link href="/guides/black-friday-broadband-deals-uk">Black Friday broadband deal checklist</Link> before treating a reward or free-month promotion as a saving.</p>

        <h2>What to look for in a no-price-rise deal</h2>
        <ul>
          <li><strong>Fixed-price promise:</strong> the provider explicitly says the monthly price will not rise during the minimum term</li>
          <li><strong>Simple contract wording:</strong> the increase, if any, is stated clearly in pounds and pence</li>
          <li><strong>Reasonable out-of-contract jump:</strong> some providers avoid mid-term rises but make the post-contract price painful</li>
          <li><strong>Competitive core package:</strong> no-price-rise alone is not enough if the starting price is already uncompetitive</li>
        </ul>

        <h2>Broadband providers worth checking for price certainty</h2>
        <p>"Altnet" is not a reliable shortcut for "no price rise." toob, Community Fibre, Hyperoptic and Zzoomm are all full-fibre altnets, and all four now apply a scheduled increase, so check the specific provider rather than the category. The policies below were checked on each provider&apos;s own website on 16 October 2026.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Actual price-rise policy', 'Why it may suit you'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Zen Internet', 'No mid-contract price increases, stated on its broadband page', 'Price certainty from a well-reviewed national provider, at a higher starting price'],
                ['YouFibre', 'No in-contract price rises on its 24-month fixed-price plans', 'Symmetrical full fibre from £22 a month where its network reaches'],
                ['giffgaff', 'No mid-term price rises on its 24-month plans', 'Symmetrical full fibre from £25 a month on a big-brand name'],
                ['Pine Media', 'No in-contract price rises; prices locked for the chosen contract', 'Sheffield full fibre from £22 a month'],
                ['National Broadband', 'No mid-contract price hikes, stated on its homepage', '4G and 5G home broadband from £31.99 for addresses without good fixed lines'],
                ['toob', 'A small rise: £2 a month each April on current 24-month plans', 'Still low over a full term, from £18 a month'],
                ['Community Fibre', 'A real rise: £3 a month each April on current 24-month plans', 'London full fibre from £19 a month (24 months) or £12.50 (Essential 35, 12 months)'],
                ['Hyperoptic', 'A real rise: £4 a month each April', 'Symmetrical speed from £19 a month, but budget for the rise'],
                ['Zzoomm', 'Introductory price, then £4 a month more from month 13', 'Compare the full 24-month cost, not the first-year price'],
                ['NOW Broadband', 'Its page says the price may change during the 24-month minimum term', 'Simple published prices from £23 a month; check the rise in the contract summary'],
              ].map(([provider, policy, fit]) => (
                <tr key={provider} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{provider}</td>
                  <td className="px-4 py-3 text-slate-700">{policy}</td>
                  <td className="px-4 py-3 text-slate-600">{fit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>When a no-price-rise deal is worth paying more for</h2>
        <p>Price certainty becomes more valuable if you expect to keep the service for the full contract, you are on a tight monthly budget, or you simply do not want to renegotiate every year. In those cases, paying a little more upfront can still be better value over the full term.</p>

        <h2>When the cheapest deal may still win</h2>
        <p>If you are likely to switch again quickly, or you know you will review your options well before the contract ends, the absolute cheapest deal may still be the smarter choice. The key is knowing whether you are buying certainty or chasing the lowest entry price.</p>
      </>
    ),
    faqs: [
      { question: 'Which broadband providers have no mid-contract price rise?', answer: 'On 16 October 2026, Zen Internet, YouFibre, giffgaff, Pine Media and National Broadband each stated on their own websites that they apply no in-contract price rise. toob, Community Fibre, Hyperoptic and Zzoomm all apply a disclosed increase. Always check the contract summary before signing up, because policies can change.' },
      { question: 'Does no mid-contract price rise mean the deal is always cheaper overall?', answer: 'Not necessarily. Some fixed-price deals start a little higher than aggressive promotional deals. The benefit is predictability, not always the lowest initial monthly rate.' },
      { question: 'What changed with broadband price rises after January 2025?', answer: 'Newer rules require telecom providers to state in-contract price rises in pounds and pence rather than unclear inflation-linked formulas. That made contracts easier to compare, but it did not make every provider equally good on price certainty.' },
      { question: 'Is Hyperoptic a no-price-rise broadband provider?', answer: 'No. Despite being an altnet, Hyperoptic applies a real scheduled rise of £4 a month each April (for example, 150Mb goes from £19 to £23 in April 2027), disclosed upfront in pounds and pence. It is not a fixed-price deal, and the rise should be budgeted into the real contract cost.' },
    ],
  },

  'telecare-alarms-landline-switch-off-uk': {
    body: (
      <>
        <p className="text-lg"><strong>An alarm connected to the old telephone line is not automatically safe after the digital switchover.</strong> It should continue only if its alarm company confirms the exact model, dialler and monitoring service work with the new connection, followed by a monitored test. Ofcom says to tell both the landline provider and device supplier before migration. If they cannot confirm a safe setup, ask the phone provider to pause the change while the equipment is adapted or replaced.</p>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="mb-0 text-sm"><strong>Do not unplug or test a monitored alarm without arranging it with the alarm receiving centre.</strong> An unplanned test can create a false alert. If an alarm has already stopped working, use another safe way to contact the monitoring provider and follow its fault instructions.</p>
        </div>

        <h2>Your five checks before the phone line changes</h2>
        <div className="overflow-x-auto" role="region" aria-label="Five checks for alarms before the digital phone switchover" tabIndex={0}>
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead><tr className="bg-slate-50">{['Check', 'What to confirm', 'Who confirms it'].map((heading) => <th scope="col" key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['1. Identify', 'Make, model, monitoring company and how the alarm connects', 'Alarm or telecare provider'],
              ['2. Report', 'The landline account records that safety equipment uses the line', 'Landline provider'],
              ['3. Confirm', 'The exact device and service are approved for the proposed digital setup', 'Alarm provider, in writing where possible'],
              ['4. Protect', 'Every required powered box has suitable backup and mobile fallback has indoor signal', 'Both providers'],
              ['5. Test', 'The receiving centre gets the correct identity, address and two-way audio where used', 'Monitoring centre after migration'],
            ].map(([check, task, owner]) => <tr key={check} className="border-b border-slate-100"><td className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">{check}</td><td className="border border-slate-200 px-4 py-3 text-slate-700">{task}</td><td className="border border-slate-200 px-4 py-3 text-slate-600">{owner}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>Which alarms can be affected?</h2>
        <p><strong>The equipment at risk is anything that sends a signal through the old analogue telephone socket.</strong> That can include a monitored burglar or fire alarm, a Careline or Lifeline base unit, a pendant alarm, an emergency call button, a door-entry system and a lift emergency phone. The sensor itself may be wireless while its base unit still uses the landline, so inspect the complete system rather than the pendant or detector alone.</p>
        <p>A modern unit may use Ethernet, Wi-Fi or a mobile SIM instead of an analogue dialler. That can remove its dependence on the phone line, but it does not prove the service will continue through a power or broadband outage. Ask which connection is primary, whether there is a second path, how long each battery should last and how the unit reports a failed connection or low battery.</p>
        <p>Do not use a generic compatibility list as certification. Firmware, adapters, router configuration, monitoring protocols and the provider&apos;s voice service can all affect one model differently. The alarm supplier or manufacturer is the right organisation to confirm its equipment; the phone company must explain the new line, migration and emergency-calling support.</p>

        <h2>Telecare and pendant alarms after the landline switch-off</h2>
        <p><strong>A telecare alarm may continue through an approved adapter, or it may need a digital replacement.</strong> GOV.UK says upwards of two million people in the UK use telecare and that most devices historically relied on the analogue network. Citizens Advice says a person should not be switched until the telecare and home phone providers are confident the personal alarm will work with the new line.</p>
        <p>Call the council, housing association or private company that supplies the Careline, Lifeline or pendant alarm. Give the make and model printed on the base unit and ask whether it is analogue-only, compatible with the proposed digital phone service, or due to be replaced. If nobody knows who supplies it, start with the local council&apos;s adult social care team and the paperwork beside the unit.</p>
        <p>Tell the landline provider separately. Ask it to record that a telecare user lives at the address, note any disability or installation support needed, and state the proposed migration date. A family member or carer can ask to be nominated to help manage the change. Verify calls using a number from a bill or official website because Citizens Advice warns that customers should not be charged simply for the move to a digital phone line.</p>

        <h2>Does a house alarm need a phone line?</h2>
        <p><strong>Only alarms with a telephone dialler need a phone service; many newer monitored systems use broadband or a mobile network.</strong> Look for a cable from the alarm panel or control box to a telephone socket, but do not open the panel or alter wiring. The monitoring company can check the account and model. A local audible-only siren may not call anyone, while an app-enabled alarm can still use broadband even without a landline number.</p>
        <p>For a monitored burglar or fire alarm, ask who is responsible for replacing the signalling path and whether the maintenance contract covers it. Confirm whether police, keyholder or alarm receiving centre response depends on certification or a dual-path connection. This guide cannot certify a security or fire installation. The installer must specify and test the correct migration for that system.</p>

        <h2>Lift phones, door entry and other shared systems</h2>
        <p><strong>A lift emergency phone or communal door-entry line belongs with the building&apos;s responsible person, managing agent or lift maintenance company.</strong> Residents should report the line rather than attempt a test or change. Ask the responsible organisation to confirm the line identifier, equipment owner, replacement technology, backup duration and completed test before the analogue service ends.</p>
        <p>A lift line needs an emergency communication route even when mains power fails. A replacement might use an IP connection or a mobile gateway, but suitability depends on the lift standard, equipment and signal inside the shaft or motor room. The same caution applies to warden-call panels, CCTV diallers, fax-based health equipment and payment terminals. Treat each as a separate service even when several share one building.</p>

        <h2>Power cuts: trace the whole alert path</h2>
        <p><strong>A standard digital phone line stops if the broadband router loses mains power.</strong> The alarm&apos;s own battery does not power the router, adapter or optical network terminal. Draw the route from button or sensor to the receiving centre and list every powered component. Ask what remains operational during a local power cut, a broadband fault and a mobile outage, because these are different failures.</p>
        <p><a href="https://www.ofcom.org.uk/phones-and-broadband/landline-phones/future-of-landline-calls" target="_blank" rel="noopener noreferrer">Ofcom says a landline provider must offer a free backup solution lasting at least one hour</a> when a customer depends on the landline to contact emergency services and has no working mobile alternative or reliable signal. That rule concerns access to emergency organisations. It does not certify every alarm or promise that its monitoring service will work, so confirm the alarm&apos;s separate backup with its supplier.</p>
        <p>If a proposed replacement uses a mobile SIM, check reception where the base unit or lift gateway will sit, not outside the building. Ask which network it uses, whether it can roam to another network, how it reports loss of service and what happens when older mobile networks close. A charged mobile can be a useful separate fallback for someone able to use it, but it is not a substitute for an accessible personal alarm.</p>

        <h2>How to test safely after the digital switchover</h2>
        <ol>
          <li>Book the test with the alarm provider or monitoring centre and follow its instructions.</li>
          <li>Confirm the router, adapter, alarm base and backup equipment are connected as specified.</li>
          <li>Activate the approved test and wait for the receiving centre to answer.</li>
          <li>Ask it to confirm the correct person or site, address, signal type and two-way speech where fitted.</li>
          <li>Record the date, result, person spoken to and fault reference. Agree when the next test and battery check are due.</li>
        </ol>
        <p>A successful call proves the alert path worked at that moment. Repeat the approved test after a router replacement, new phone provider, alarm update, building work or power-backup change. If the test fails, keep an alternative way to summon help, report the fault to both providers and do not accept an unsupported reassurance that the unit is probably compatible.</p>

        <h2>Keep a critical information record</h2>
        <p><strong>Write down the details another person would need to check the system without guessing.</strong> This practical record is adapted for the UK from safety-device migration checklists used in Australia and New Zealand. It is uncommon in the UK pages reviewed for this guide and turns a one-off test into an owned maintenance task.</p>
        <ul>
          <li><strong>Equipment:</strong> alarm type, make, model, serial or account reference and connection method.</li>
          <li><strong>Contacts:</strong> landline provider, monitoring centre, installer, council or building manager.</li>
          <li><strong>Resilience:</strong> each battery&apos;s stated duration, replacement date and mobile-network details.</li>
          <li><strong>Evidence:</strong> written compatibility confirmation, migration date, last successful test and fault reference.</li>
          <li><strong>Named owner:</strong> the person responsible for the next test, battery check and updating carers.</li>
        </ul>
        <p>Keep the record near the alarm instructions and give an accessible copy to the user, nominated relative or carer as appropriate. Do not publish account numbers or medical details. The aim is to make responsibility clear when equipment or providers change, not to create a public register.</p>

        <h2>What to do if the alarm fails or the switch is unsafe</h2>
        <p>Contact the phone provider first about loss of digital landline service and the alarm provider about device or monitoring failure. Explain that safety-critical equipment is affected and request a fault reference. If migration has not happened, ask both organisations to agree a safe plan and whether the line change should be paused. If there is immediate danger, use an available working phone to call 999 or 112.</p>
        <p>If the phone provider does not resolve a complaint, our <Link href="/guides/broadband-complaints-and-ombudsman-uk">broadband and landline complaints guide</Link> explains the formal complaint and alternative dispute resolution process. For the wider deadline, provider names and home-phone setup, read the <Link href="/guides/landline-switch-off-explained-uk">UK landline switch-off guide</Link> and <Link href="/guides/digital-voice-explained-uk">Digital Voice guide</Link>.</p>
      </>
    ),
    faqs: [
      { question: 'Will my house alarm work after the digital switchover?', answer: 'A house alarm will work only if its installer or monitoring company confirms the exact dialler and service are compatible with the new digital connection. Older monitored alarms that call through an analogue socket may need an approved adapter, new communicator or replacement panel. Tell the phone provider too, then arrange a monitored end-to-end test after migration.' },
      { question: 'Will my Careline or pendant alarm work with a digital phone?', answer: 'Some Careline and pendant alarms work with an approved digital setup, while analogue-only units may need an adapter or a digital replacement. Give the telecare provider the base unit’s exact make and model and ask for written confirmation. Tell the landline provider separately, agree power-cut protection and test with the monitoring centre after the line changes.' },
      { question: 'Does my alarm need a phone line?', answer: 'An alarm needs a phone service only if its communicator dials through a telephone connection. Newer systems may use Ethernet, Wi-Fi or a mobile SIM, while a local siren may not contact a monitoring centre at all. Ask the installer how the exact model sends an alert and what happens during power, broadband and mobile outages.' },
      { question: 'Will a lift phone work after the landline switch-off?', answer: 'A lift phone that uses an analogue line needs assessment and may require an IP or mobile replacement gateway. The building manager or responsible person should coordinate the lift company and communications provider, confirm backup power and test the emergency call path before the old service ends. Residents should report concerns rather than altering or testing lift equipment themselves.' },
      { question: 'What happens to an alarm during a power cut?', answer: 'A digital phone line normally stops when its router loses mains power. An alarm battery alone may not power the router, adapter or fibre terminal needed to send the call. Trace and back up every required component. Eligible landline-dependent customers can receive a free emergency-calling solution from their phone provider, but alarm compatibility still needs separate confirmation.' },
      { question: 'How do I test a telecare alarm after digital switchover?', answer: 'Arrange the test with the monitoring centre so it is not treated as an emergency. Activate the approved test, then confirm the centre received the correct identity, address, signal and two-way speech where fitted. Record the result and repeat after any router, provider, alarm or backup-power change. A dial tone by itself is not a complete test.' },
    ],
  },
  'pstn-switch-off-small-business-uk': {
    body: (
      <>
        <p className="text-lg"><strong>A small business still using a PSTN, ISDN or ADSL service must move it to a suitable digital replacement before 31 January 2027.</strong> Start with an inventory of every line and every device attached to it, not just desk phones. Card terminals, monitored alarms, lift phones, door entry, CCTV diallers, fax machines and telemetry may use an analogue line without appearing on the phone bill by a recognisable name.</p>
        <p><a href="https://www.gov.uk/guidance/telecommunications-modernisation-connectivity-timeline" target="_blank" rel="noopener noreferrer">The UK Government says all users of the Openreach PSTN must be migrated by 31 January 2027</a>. Openreach supplies the underlying access network, but your communications provider sells and migrates your service. Equipment suppliers must separately confirm whether each connected device works over the proposed replacement. A promise that the new phone system works does not prove that an alarm or payment terminal will work.</p>

        <h2>PSTN switch-off business checklist</h2>
        <ol>
          <li><strong>Find every line:</strong> match phone bills, socket labels, alarm contracts and equipment records to each business site.</li>
          <li><strong>Name what uses it:</strong> record the number, device, supplier, business owner and what happens if it fails.</li>
          <li><strong>Ask the device supplier:</strong> obtain written compatibility advice for the exact make, model and monitoring service.</li>
          <li><strong>Choose the replacement:</strong> hosted VoIP, SIP, a digital provider service, mobile connectivity or another approved solution.</li>
          <li><strong>Plan resilience:</strong> decide how calls and critical devices work during power, broadband and mobile outages.</li>
          <li><strong>Test before closure:</strong> run old and new services in parallel where risk justifies it, then record every successful test.</li>
        </ol>

        <h2>Which small-business services are affected?</h2>
        <p><strong>The switch-off affects more than voice calls.</strong> BT Business lists alarms, EPOS machines, door-entry systems, CCTV and fax among products that may use traditional lines. GOV.UK guidance also identifies tills, vending machines, franking machines and printers. Treat those examples as prompts for an audit, not proof that a particular device is affected.</p>
        <div className="overflow-x-auto" role="region" aria-label="PSTN device migration register" tabIndex={0}>
          <table className="w-full min-w-[760px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600"><strong>PSTN device migration register:</strong> use one row per line or connected service. The supplier of the device or monitoring contract should approve the replacement.</caption>
            <thead><tr className="bg-slate-50">{['Service or device', 'Ask this supplier', 'Evidence to obtain', 'Test before closure'].map((heading) => <th scope="col" key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['Desk phones or PBX', 'Phone-system maintainer and communications provider', 'Number-port plan, handset compatibility and call-feature list', 'Inbound, outbound, hunt group, voicemail and emergency calls'],
              ['Card or EPOS terminal', 'Acquiring bank or terminal supplier', 'Approved IP or mobile connection and installation date', 'A live authorised transaction and receipt'],
              ['Security or fire alarm', 'Alarm installer and monitoring centre', 'Approved communicator, signalling path and backup specification', 'A scheduled end-to-end monitored signal'],
              ['Lift emergency phone', 'Lift company and building responsible person', 'Compliant replacement, power backup and maintenance owner', 'A witnessed call to the correct response centre'],
              ['Door entry, CCTV or intercom', 'Installer or maintenance company', 'Exact model compatibility and remote-access method', 'Every call, alert and remote-control function'],
              ['Fax, franking or telemetry', 'Equipment or application supplier', 'Supported digital workflow or replacement device', 'A real send-and-receive or reporting cycle'],
            ].map(([device, supplier, evidence, test]) => <tr key={device}><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">{device}</th><td className="border border-slate-200 px-4 py-3">{supplier}</td><td className="border border-slate-200 px-4 py-3">{evidence}</td><td className="border border-slate-200 px-4 py-3">{test}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>What replaces PSTN and ISDN?</h2>
        <p><strong>Most small firms will replace voice calls with VoIP, but the right form depends on the existing phone system.</strong> Hosted VoIP puts the call platform in the provider&apos;s cloud and can serve desk phones, mobiles and computer apps. SIP trunking carries internet-based calls to a compatible on-site PBX. A simple digital voice line from a broadband provider may suit a single number with few call-handling needs.</p>
        <p>SIP trunking is not a direct continuation of PSTN. It connects a compatible business phone system over IP. Keeping an old PBX can reduce handset changes, but only if its maintainer supports the proposed SIP service. Hosted VoIP removes more on-site telephony equipment and can make remote working easier, but it creates a clear dependency on local power, connectivity and the provider&apos;s platform.</p>
        <p>Do not buy a voice replacement for a non-voice device until its supplier has approved the design. An analogue terminal connected through an adapter may appear to dial but still fail to transmit data reliably. The safer option may be an Ethernet model, a managed mobile communicator or a replacement designed for IP networks.</p>

        <h2>ISDN switch-off: what changes for a phone system?</h2>
        <p><strong>ISDN2 and ISDN30 services are included in the retirement of the old Wholesale Line Rental network.</strong> A business using multiple channels, a switchboard or Direct Dial In numbers should document every number and call route before migration. Confirm which numbers will be ported, which can be retired, how long the port should take and who can divert calls if the planned change fails.</p>
        <p><a href="https://business.bt.com/help/article/phone-line-and-services/move-from-traditional-lines-to-the-cloud/the-pstn-and-isdn-switch-off-what-it-means-for-you/" target="_blank" rel="noopener noreferrer">BT Business says ISDN, Featureline, multiline and some broadband access products cannot be moved automatically</a> under its protective migration programme. Do not cancel the existing service before the new provider confirms the number port. Cancellation can jeopardise a number and removes the safest route to a parallel test.</p>

        <h2>Power cuts, broadband failure and business continuity</h2>
        <p><strong>A digital phone or device path can fail when mains power or broadband fails, even where the old analogue line worked without local power.</strong> Trace the whole path: handset or device, adapter, switch, router, firewall and fibre terminal. A battery on an alarm panel is not enough if the router it needs has no backup.</p>
        <p><a href="https://www.ofcom.org.uk/siteassets/resources/documents/consumers/2024/published-letter-to-business-on-pstn-switch-off-deadline.pdf?v=412769" target="_blank" rel="noopener noreferrer">Ofcom says providers must offer at least one solution enabling a landline-dependent customer to contact emergency organisations for at least one hour during a power cut</a>. It recognises that a sole trader or small office with no mobile signal may need that protection. This safeguard is not a general uptime guarantee for a PBX, card machine or alarm.</p>
        <p>Set a recovery objective for each service. A shop may accept a mobile card-terminal fallback for an hour, while a monitored fire alarm or lift phone needs a supplier-approved design and testing regime. Consider two genuinely independent routes where an outage stops trading or creates a safety risk. Two services sharing the same router, power socket or access circuit are not independent.</p>

        <h2>A safe migration and test plan</h2>
        <p><strong>For a critical service, prove the replacement before the cease order.</strong> The useful international model is a device-led readiness check: Australia&apos;s NBN guidance asks businesses to identify PBX systems, EFTPOS, alarms, lift phones and other equipment, then contact the relevant equipment provider. For a UK small business, add a named owner, written supplier approval and a witnessed end-to-end test.</p>
        <ol>
          <li>Export the current numbers, extensions, call routes and supplier contacts.</li>
          <li>Install the new connection and retain the old service in parallel where the supplier permits it.</li>
          <li>Test incoming and outgoing calls, caller ID, voicemail, transfers, hunt groups and emergency-call location handling where applicable.</li>
          <li>Ask each device owner to run an end-to-end test with the receiving party, such as the alarm monitoring centre or acquiring bank.</li>
          <li>Test the agreed outage fallback under supplier instructions.</li>
          <li>Only then approve the port or closure. Record the asset, result, date and person who accepted it.</li>
        </ol>

        <h2>What a small business should do before 2027</h2>
        <p><strong>Contact your communications provider now if any line remains unidentified or no migration date is booked.</strong> Ask for the product name on each circuit, whether it depends on PSTN, ISDN, WLR or ADSL, and the proposed replacement. Then verify connected equipment with its own supplier. Openreach advises customers to act before the deadline because late migration can leave too little time to find compatibility problems.</p>
        <p>For connectivity and resilience choices, compare <Link href="/guides/best-business-broadband-providers-uk">UK business broadband providers</Link> and read our guide to <Link href="/guides/static-ip-business-broadband-explained">static IP business broadband</Link>. Our <Link href="/guides/small-office-broadband-setup-uk">small office broadband setup guide</Link> covers the wider router, backup and service-level checklist that a VoIP migration should sit alongside. For the domestic change, including ordinary home phones and telecare, use the <Link href="/guides/landline-switch-off-explained-uk">UK landline switch-off guide</Link>. The business task is broader because the same unnoticed line can support calls, safety equipment and payment systems.</p>
      </>
    ),
    faqs: [
      { question: 'When is the PSTN switch-off for UK businesses?', answer: 'The published Openreach PSTN deadline is 31 January 2027. A business can be migrated earlier by its communications provider. PSTN, ISDN and related Wholesale Line Rental services are affected, and BT Business also lists ADSL in its withdrawal programme. Check every circuit now because an alarm, lift phone or payment terminal may use a line that staff do not recognise as a telephone service.' },
      { question: 'What should a small business do before the PSTN switch-off?', answer: 'Create a site-by-site register of phone lines and connected devices, name an owner for each, and ask both the communications provider and equipment supplier what must change. Choose the replacement, document number porting and power-cut arrangements, then test calls and every alarm, payment or monitoring path end to end before the old line is closed. Keep the results and support contacts.' },
      { question: 'Will ISDN stop working in 2027?', answer: 'ISDN services on the old Openreach Wholesale Line Rental network are due to be withdrawn with PSTN by 31 January 2027. They will not become SIP automatically. A business using ISDN2, ISDN30, Featureline or a PBX should arrange an IP replacement, confirm hardware compatibility and port every number it needs. BT says some multiline and ISDN services cannot use its automatic protective migration.' },
      { question: 'Should a small business choose SIP trunking or hosted VoIP?', answer: 'SIP trunking can suit a supported on-site PBX that the business wants to retain; hosted VoIP moves more of the phone system into the provider’s cloud and commonly suits firms wanting simpler administration or remote use. Compare number porting, handsets, call features, support, contract cost and failure arrangements. Neither choice proves that alarms or payment terminals are compatible, so check those separately.' },
      { question: 'Will card machines and alarms work after the PSTN switch-off?', answer: 'Only if the device or service supplier confirms the exact setup. Some card terminals and alarms already use Ethernet or mobile data, while older models may dial over an analogue line. Ask the acquiring bank, installer or monitoring centre for an approved replacement, including backup power and connectivity, then perform a live transaction or scheduled monitored test before the old line closes.' },
      { question: 'Can a business keep its existing phone number?', answer: 'A business can normally port an existing number to a digital service, but the receiving provider must confirm that the number and any associated range are portable. Give it a complete number inventory and agree the port date, call diversions and failure contact. Do not cancel the old line first, because a cease order can interrupt service and may put the number at risk.' },
      { question: 'Does VoIP work during a power cut?', answer: 'VoIP needs power for the handset or adapter, network switch, router and any fibre terminal, so it normally stops if those components lose power. A mobile fallback or correctly sized battery supply can add resilience, but it must cover the whole call path. Ofcom’s emergency-calling protection for landline-dependent customers is not a general uptime promise for business phones, alarms or payment systems.' },
    ],
  },

  'digital-voice-explained-uk': {
    body: (
      <>
        <p className="text-lg"><strong>Digital Voice is a home phone service carried over the internet: speech travels through your broadband connection instead of the old analogue Public Switched Telephone Network.</strong> BT uses the Digital Voice name, Sky calls its digital home phone service Internet Calls and Virgin Media carries home phone calls through its Hub. You can usually keep a familiar handset and number, but the router must remain powered and connected.</p>

        <h2>Digital Voice at a glance</h2>
        <div className="overflow-x-auto" role="region" aria-label="Digital Voice practical changes" tabIndex={0}>
          <table className="w-full min-w-[680px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">What normally stays the same and what needs checking before a digital phone migration.</caption>
            <thead><tr className="bg-slate-50">{['Part of the service', 'What normally happens', 'What to check'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['Phone number', 'Usually stays the same', 'Confirm number retention before changing provider'],
              ['Existing handset', 'Most ordinary phones can still work', 'Socket type, adapter and extension wiring'],
              ['Calls', 'Dial and answer much as before', 'Call features and voicemail after migration'],
              ['Connection', 'Phone plugs into a router or supplied adapter', 'Router location and cable reach'],
              ['Power cut', 'Standard service stops with the router', 'Backup power or another way to call'],
              ['Alarms and telecare', 'Compatibility is not automatic', 'Device supplier approval and an end-to-end test'],
            ].map(([part, normal, check]) => <tr key={part}><th scope="row" className="px-4 py-3 border border-slate-200 text-left font-semibold text-slate-900">{part}</th><td className="px-4 py-3 border border-slate-200">{normal}</td><td className="px-4 py-3 border border-slate-200">{check}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>What is BT Digital Voice?</h2>
        <p><strong>BT Digital Voice is BT&apos;s home phone service delivered through a BT broadband connection.</strong> It is a branded form of Voice over Internet Protocol, usually shortened to VoIP. Your voice is converted into data, carried through the router and connected to ordinary UK telephone numbers. It is not a mobile service and it does not mean calls must be made through an app.</p>
        <p><a href="https://www.bt.com/broadband/digital-voice" target="_blank" rel="noopener noreferrer">BT says existing customers are contacted with instructions and suitable equipment</a>. Depending on the setup, a telephone can connect to the phone socket on the Smart Hub, a supplied adapter or a compatible Digital Home Phone. Do not unplug the old service until BT gives the migration date. If the preferred phone sits away from the router, ask what adapter or wiring option applies before the change.</p>

        <h2>Digital Voice, Sky Internet Calls and Virgin Media home phone compared</h2>
        <p>The underlying idea is similar across providers, but the brand name, router and support arrangement differ. Treat the service as provider-specific rather than assuming an adapter or backup unit from one company works with another.</p>
        <div className="overflow-x-auto" role="region" aria-label="UK digital home phone provider comparison" tabIndex={0}>
          <table className="w-full min-w-[720px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">Provider terminology and published home setup, checked 14 September 2026.</caption>
            <thead><tr className="bg-slate-50">{['Provider', 'Service name', 'Normal home connection', 'Published point to act on'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['BT', 'Digital Voice', 'BT hub phone socket, adapter or compatible Digital Home Phone', 'Tell BT about telecare and reliance on the landline before migration'],
              ['Sky', 'Internet Calls', 'Compatible phone connects to a Sky hub or phone adapter', 'The phone does not work if the hub is off, broadband fails or power is cut'],
              ['Virgin Media', 'Digital voice or fibre phone line', 'Existing phone normally connects through the Virgin Media Hub', 'Contact Virgin Media about telecare, accessibility needs, no mobile or extension wiring'],
            ].map(([provider, name, connection, action]) => <tr key={provider}><th scope="row" className="px-4 py-3 border border-slate-200 text-left font-semibold text-slate-900">{provider}</th><td className="px-4 py-3 border border-slate-200">{name}</td><td className="px-4 py-3 border border-slate-200">{connection}</td><td className="px-4 py-3 border border-slate-200">{action}</td></tr>)}</tbody>
          </table>
        </div>
        <p>A provider can revise equipment and migration processes, so the letter or email for your account takes precedence over a general guide. Verify unexpected messages using the number on a bill or the provider&apos;s official website. <a href="https://www.citizensadvice.org.uk/consumer/phone-internet-downloads-or-tv/check-your-personal-alarm-will-work-after-the-landline-switch-off/" target="_blank" rel="noopener noreferrer">Citizens Advice warns that the provider will not ask you to pay simply to move an existing phone line to digital service</a>.</p>

        <h2>Do I need a special phone for Digital Voice?</h2>
        <p><strong>Most households do not need to buy a special Digital Voice phone.</strong> BT, Sky and Virgin Media each say many existing home phones can continue when plugged into the correct router socket or supplied adapter. A cordless system usually needs only its base station connected; the other handsets still communicate wirelessly with that base.</p>
        <p>Compatibility can become less straightforward with very old handsets, pulse-dial phones, several separately wired base stations or extension sockets in different rooms. Ask the provider whether it will reactivate extension wiring, supply an adapter or arrange an engineer. Do not buy a handset before checking the exact router and service because an ordinary compatible phone may already be sufficient.</p>

        <h2>Will Digital Voice work in a power cut?</h2>
        <p><strong>A standard Digital Voice line will not work if the broadband router loses mains power, and it can also fail during a broadband outage.</strong> That includes calls to 999 and 112. <a href="https://www.ofcom.org.uk/phones-and-broadband/landline-phones/future-of-landline-calls" target="_blank" rel="noopener noreferrer">Ofcom says providers must offer at least one hour of access to emergency organisations during a power cut</a> to customers who depend on the landline because they have no other way to call.</p>
        <p>The practical solution can be a battery unit, a mobile-network backup device or another arrangement chosen by the provider. Ask what equipment is covered, who qualifies, how long it works and whether the handset or cordless base also needs power. A cordless phone base can stop even when the router has a battery, so a compatible corded handset may form part of the plan. Keep a charged mobile and power bank where mobile coverage and the user&apos;s ability make that suitable.</p>

        <h2>Telecare, personal alarms and other connected equipment</h2>
        <p>Tell the phone provider before migration if the line supports a care pendant, personal alarm, monitored burglar or fire alarm, lift phone, fax, entry system, card terminal or accessibility device. Then contact the organisation that supplied or monitors the equipment. A handset making an ordinary call does not prove that a monitoring centre receives the device&apos;s data or the correct address.</p>
        <p><a href="https://www.citizensadvice.org.uk/consumer/phone-internet-downloads-or-tv/check-your-personal-alarm-will-work-after-the-landline-switch-off/" target="_blank" rel="noopener noreferrer">Citizens Advice recommends checking the exact personal-alarm model with its supplier</a>. Get written confirmation of compatibility or arrange a replacement, then perform a supervised end-to-end test after Digital Voice activates. Our <Link href="/guides/telecare-alarms-landline-switch-off-uk">alarm and telecare switchover checklist</Link> covers house alarms, Careline pendants, lift phones and a written critical information record. If a safety-critical device is not ready, ask the phone provider and equipment supplier to agree a safe migration plan rather than relying on an untested adapter.</p>

        <h2>Your Digital Voice readiness card</h2>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
          <p className="font-semibold text-slate-900">Write these five answers down before migration day:</p>
          <ol className="mb-0">
            <li><strong>Connection:</strong> which router socket or adapter will the main phone use?</li>
            <li><strong>Rooms:</strong> will every required handset or extension still ring?</li>
            <li><strong>Devices:</strong> has each alarm or telecare supplier approved the exact model?</li>
            <li><strong>Outage:</strong> how will this household call 999 if power and broadband stop?</li>
            <li><strong>Test:</strong> who will confirm incoming calls, outgoing calls and monitored-device signals?</li>
          </ol>
        </div>
        <p>This written readiness card adapts the emergency communications checklist used by Australia&apos;s nbn for a UK household. It puts the phone, router, power and dependent devices into one test plan, rather than treating a dial tone as the only measure of a safe migration.</p>

        <h2>What to do on migration day</h2>
        <ol>
          <li>Follow the dated instructions from the company that bills for the home phone service.</li>
          <li>Connect the telephone only to the router socket or adapter specified by that provider.</li>
          <li>Wait for the router and phone service lights to reach their normal state.</li>
          <li>Make an outgoing call, then call the home number from another line and check caller display and voicemail.</li>
          <li>Test every required extension handset and complete supervised tests with alarm or telecare monitoring centres.</li>
          <li>Keep the router powered, store the provider&apos;s fault number elsewhere and practise the agreed power-cut route.</li>
        </ol>
        <p>If the number is missing, there is no dial tone or a safety device fails, contact the phone provider from another line and record the time, equipment lights and fault reference. The broader <Link href="/guides/landline-switch-off-explained-uk">UK landline switch-off guide</Link> explains the 31 January 2027 deadline, landline-only services and the difference between retiring PSTN voice and removing copper broadband.</p>

        <h2>Should you keep a home phone service?</h2>
        <p>Keep it if household members use the number, mobile coverage is poor or a compatible accessibility or safety arrangement depends on it. Giving up the service is reasonable where nobody uses it and every emergency route has been checked, but removing a call plan does not always reduce the broadband bundle price. Ask the provider for broadband-only and broadband-with-phone totals before deciding.</p>
        <p>If you change broadband company at the same time, tell the new provider that the landline number must transfer and do not cancel the old service first. Our <Link href="/guides/how-to-switch-broadband-uk">broadband switching guide</Link> covers number transfer and One Touch Switch, while the <Link href="/guides/broadband-complaints-and-ombudsman-uk">complaints guide</Link> explains the escalation route if agreed support is not delivered. Firms should instead use the <Link href="/guides/pstn-switch-off-small-business-uk">PSTN switch-off checklist for small businesses</Link>, which covers ISDN, PBX systems, alarms and payment terminals.</p>
      </>
    ),
    faqs: [
      { question: 'What is BT Digital Voice?', answer: 'BT Digital Voice is BT’s internet-based home phone service. Calls travel through a BT broadband router rather than the old analogue telephone network. You can still call ordinary landline and mobile numbers, and usually keep your existing number. The main practical changes are where the phone plugs in and the need for working router power and broadband.' },
      { question: 'Do I need a special phone for Digital Voice?', answer: 'Most existing corded and cordless phones can work with Digital Voice when connected to the provider’s router socket or supplied adapter. A cordless system normally needs only its base station connected. Ask the provider about very old phones, separate wired extensions or a phone far from the router before buying anything, because an adapter or engineer visit may solve the setup.' },
      { question: 'Does Digital Voice work in a power cut?', answer: 'Digital Voice normally stops when the broadband router loses mains power, so calls to 999 and 112 can fail too. Tell the provider if anyone depends on the landline or lacks another emergency-calling method. Ofcom requires at least one hour of emergency access for eligible customers, but the backup equipment and qualification process vary by provider.' },
      { question: 'What is Sky Digital Voice called?', answer: 'Sky calls its digital home phone service Internet Calls rather than Digital Voice. An existing compatible phone connects to a Sky hub or phone adapter, not the old telephone wall socket. Sky says the service will not work when the hub is switched off, broadband fails or power is cut, so households need another emergency-calling route.' },
      { question: 'How does the Virgin Media landline switch-off work?', answer: 'Virgin Media moves its home phone service from the old analogue network to a digital connection through the Hub. Most customers can keep their number and handset, but the phone’s connection point changes. Contact Virgin Media before migration about telecare, accessibility needs, no mobile access, a phone far from the Hub or separately wired extensions.' },
      { question: 'Will a personal alarm work with Digital Voice?', answer: 'Compatibility depends on the exact alarm and monitoring service, so do not rely on an ordinary dial tone. Tell both the phone provider and alarm supplier before migration, obtain model-specific confirmation or replacement advice and arrange an end-to-end test afterwards. The monitoring centre should confirm that it received the alarm signal and correct household details.' },
      { question: 'Can I keep my landline number with Digital Voice?', answer: 'A migration to digital service with the same provider normally keeps the existing landline number. If you also change provider or move home, request number transfer during the new order and get confirmation before cancelling anything. Cancelling the old line first can put the number at risk, so let the gaining provider explain and coordinate the transfer process.' },
    ],
  },

  'landline-switch-off-explained-uk': {
    body: (
      <>
        <p className="text-lg"><strong>The UK landline switch-off retires the old Public Switched Telephone Network, or PSTN, by 31 January 2027 and moves phone calls to digital services carried over an internet connection.</strong> Your home phone is not being banned. Most customers can keep a landline number and existing handset, but the phone will usually connect to a broadband router or adapter and may stop working in a power cut unless backup is provided.</p>

        <h2>What the landline switch-off means at a glance</h2>
        <div className="overflow-x-auto" role="region" aria-label="Landline switch-off changes at a glance" tabIndex={0}>
          <table className="w-full min-w-[680px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">The practical difference between an old PSTN line and a digital phone service.</caption>
            <thead><tr className="bg-slate-50">{['Question', 'Old PSTN service', 'Digital phone service'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['Where does the phone connect?', 'Usually a wall phone socket', 'Usually the router or a supplied adapter'],
              ['How are calls carried?', 'Legacy telephone switching network', 'Voice over Internet Protocol, or VoIP'],
              ['Can you keep a home phone?', 'Yes', 'Yes, if you retain a voice service'],
              ['Does it work in a home power cut?', 'A basic corded phone often can', 'Not without working backup power or another resilient solution'],
              ['What needs checking?', 'Few household devices changed', 'Telecare, alarms, fax, lift phones and other line-connected equipment'],
            ].map(([question, oldService, digitalService]) => <tr key={question}><th scope="row" className="px-4 py-3 border border-slate-200 text-left font-semibold text-slate-900">{question}</th><td className="px-4 py-3 border border-slate-200">{oldService}</td><td className="px-4 py-3 border border-slate-200">{digitalService}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>When is the landline being switched off?</h2>
        <p><strong>Openreach says providers must move customers from analogue to digital phone lines by 31 January 2027.</strong> The original industry target was December 2025, but it was extended after safety concerns about telecare users and people who rely on a landline. The House of Commons Library reported that residential customers still on the PSTN fell from 5.2 million in July 2024 to 3.2 million in July 2025.</p>
        <p>Your own changeover can happen before the national deadline. The company that bills you for phone or broadband service should contact you, explain the date and provide any router or adapter it requires. Do not act on an unexpected caller demanding money or bank details. Citizens Advice says a provider will not charge you simply to change the phone line to digital service.</p>

        <h2>What is actually being switched off?</h2>
        <p>The PSTN is the ageing network equipment that provides traditional fixed-line voice calls. Digital Voice is a common brand name for its replacement; the general technology is Voice over Internet Protocol, or VoIP. It turns speech into data and routes the call through the provider&apos;s broadband-based phone platform. Other companies use names such as IP Voice or their own branded voice service. Our <Link href="/guides/digital-voice-explained-uk">Digital Voice explainer</Link> compares the names and practical home setup published by BT, Sky and Virgin Media.</p>
        <p><strong>The PSTN switch-off is not the same as removing every copper cable or completing full-fibre coverage.</strong> A property without fibre to the premises can still receive broadband over part of the existing copper access line while calls use a digital service. The January 2027 change concerns legacy phone service. Full-fibre construction follows a separate timetable, so a claim that every copper broadband connection dies on one day is misleading.</p>

        <h2>Will I lose my home phone or number?</h2>
        <p>You do not have to give up home phone service because of the digital voice switchover. GOV.UK says a landline-only option remains available for customers who do not want a general internet service. In practice, the provider may install an internet-based connection dedicated to carrying calls. Ask it to state the monthly price, included calls, equipment and power-cut arrangements before agreeing.</p>
        <p>Tell the provider that you want to keep your existing number before any service is cancelled or moved. A routine migration with the same company should normally preserve it, but a house move or change of provider can require a separate number-porting process. Do not cancel the old line yourself until the gaining provider confirms how the number will transfer. Our <Link href="/guides/how-to-switch-broadband-uk">UK broadband switching guide</Link> explains the managed switching process.</p>

        <h2>How a digital phone line works at home</h2>
        <p>Most households will plug a compatible telephone into a labelled phone socket on the broadband router. If the router and preferred telephone are in different rooms, the provider may offer an adapter or another installation option. The old extension sockets around the property may not work automatically, so ask before the migration if several rooms need a phone.</p>
        <p>The router must be switched on and connected for the digital phone to work. Check the new dial tone, make an outgoing call and ring the home number from another phone on migration day. Test voicemail, caller display and any call-blocking feature you use. Keep the provider&apos;s fault number somewhere accessible away from the router.</p>

        <h2>What happens during a power cut?</h2>
        <p><strong>A normal digital landline stops working when the router loses power.</strong> Ofcom requires providers to offer a solution that enables access to emergency organisations for at least one hour during a power cut for customers who depend on the landline because they do not have another way to call. The solution can vary, so ask exactly what it powers, how long it lasts and how it must be maintained.</p>
        <p>BT says its battery backup provides at least one hour of power for its hub, allowing essential calls when the handset is connected correctly. Another provider may use different backup equipment or a mobile-network device. A battery is not a guarantee against every outage: it must be charged, connected to the right equipment and may run out during a long cut. Keep a charged mobile if coverage and ability allow, and test the agreed backup rather than leaving it boxed.</p>

        <h2>Telecare, alarms and other devices to check</h2>
        <p>Anything connected to a telephone wall socket needs an explicit compatibility check. That includes personal alarms and fall pendants, monitored security or fire alarms, lift emergency phones, fax machines, card terminals, entry systems and some accessibility equipment. A device producing a dial tone is not proof that its monitoring centre receives the correct signal.</p>
        <p>Contact both the phone provider and the organisation responsible for each device before accepting a migration date. Citizens Advice advises personal-alarm users to ask the telecare provider whether the equipment works with a digital phone line. If it does not, the supplier may need to replace the unit or fit an adapter. Ask for an end-to-end test with the monitoring centre after installation.</p>

        <h3>Make a line-dependent device inventory</h3>
        <div className="overflow-x-auto" role="region" aria-label="Line-dependent device inventory" tabIndex={0}>
          <table className="w-full min-w-[720px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">Write one row for every device before your provider changes the line.</caption>
            <thead><tr className="bg-slate-50">{['Device or service', 'Who supports it?', 'Compatibility confirmed?', 'Power-cut plan', 'Migration-day test'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['Personal alarm or telecare pendant', 'Council, care provider or alarm company', 'Ask for the model in writing', 'Battery and mobile backup, if supplied', 'Trigger a test call to the monitoring centre'],
              ['Security or fire alarm', 'Installer or monitoring company', 'Confirm digital-line support', 'Confirm panel battery duration', 'Verify the alarm signal was received'],
              ['Telephone and extension sockets', 'Phone provider', 'Confirm handset and room setup', 'Corded handset plus agreed backup', 'Incoming and outgoing calls'],
              ['Fax, entry system or card terminal', 'Equipment supplier', 'Ask whether replacement is required', 'Agree an alternative process', 'Send a real test transmission'],
            ].map(([device, owner, compatibility, backup, test]) => <tr key={device}><th scope="row" className="px-4 py-3 border border-slate-200 text-left font-semibold text-slate-900">{device}</th><td className="px-4 py-3 border border-slate-200">{owner}</td><td className="px-4 py-3 border border-slate-200">{compatibility}</td><td className="px-4 py-3 border border-slate-200">{backup}</td><td className="px-4 py-3 border border-slate-200">{test}</td></tr>)}</tbody>
          </table>
        </div>
        <p>This inventory adapts a useful safety pattern from Australian and New Zealand copper-transition guidance: identify every dependent device, its responsible supplier and its separate power requirement. It avoids the common mistake of testing only the telephone handset while leaving a personal alarm or monitored device unchecked.</p>

        <h2>What vulnerable customers should do now</h2>
        <p>Contact the phone provider now if anyone at the address relies on the landline, cannot use a mobile, has poor mobile reception, uses telecare or needs extra help installing equipment. Ask it to record the circumstances on the account and explain the resilient calling solution. GOV.UK says providers should identify and support at-risk customers, while the industry&apos;s commitments include extra protections for telecare users. Use our <Link href="/guides/telecare-alarms-landline-switch-off-uk">digital switchover alarm checklist</Link> to identify the device, assign the compatibility checks and record an end-to-end test.</p>
        <p>Use plain, specific questions: “How will this household call 999 in a power cut?”, “How long does your backup last?”, “Who installs and tests it?” and “Will you confirm that the migration is paused until the telecare supplier says the device is compatible?” Keep the answers and appointment date. If the provider does not resolve a safety concern, make a formal complaint and follow our <Link href="/guides/broadband-complaints-and-ombudsman-uk">broadband complaint and ombudsman guide</Link>.</p>

        <h2>Landline switch-off checklist</h2>
        <ol>
          <li><strong>Wait for a genuine notice, but do not ignore it:</strong> verify it through the number on your bill or provider&apos;s official website.</li>
          <li><strong>List every connected device:</strong> check wall sockets, alarm panels, pendants, entry systems, fax machines and payment terminals.</li>
          <li><strong>Tell the provider about vulnerability:</strong> explain reliance on emergency calls, mobile coverage, disability or telecare before a date is fixed.</li>
          <li><strong>Ask each equipment supplier about VoIP:</strong> obtain compatibility and replacement advice for the exact model.</li>
          <li><strong>Agree the home setup:</strong> confirm the router location, adapters, extension-phone needs and who will install them.</li>
          <li><strong>Agree a power-cut plan:</strong> identify the backup device, minimum operating time, charging routine and alternative way to call.</li>
          <li><strong>Protect the phone number:</strong> confirm porting before cancelling any old service.</li>
          <li><strong>Test end to end:</strong> make and receive calls, then trigger supervised tests for every monitored device.</li>
        </ol>

        <h2>What to do if the switch goes wrong</h2>
        <p>Call the provider from another phone if the new line has no dial tone, cannot make emergency calls or has lost the existing number. For a telecare or alarm failure, contact the monitoring organisation as well and use the agreed alternative safety plan. Record times, error messages, equipment lights and the names of people spoken to.</p>
        <p>Ask the provider to log a formal complaint when a fault or promised protection is not fixed. Ofcom collects reports and sets sector rules but does not decide individual compensation disputes. An unresolved complaint can go to the provider&apos;s approved alternative dispute resolution scheme after the applicable waiting period or sooner with a deadlock letter. Business users with ISDN, a PBX or non-voice equipment should follow the separate <Link href="/guides/pstn-switch-off-small-business-uk">business PSTN migration and test plan</Link>.</p>
      </>
    ),
    faqs: [
      { question: 'When is the UK landline being switched off?', answer: 'Openreach says providers must migrate customers from analogue PSTN phone lines by 31 January 2027. Your provider can move your individual service earlier and should contact you with the date and equipment instructions. The original December 2025 target was extended after concerns about telecare users and people who depend on a landline.' },
      { question: 'Will I lose my home phone after the landline switch-off?', answer: 'No. The old PSTN technology is closing, not home phone service itself. You can keep a digital landline, usually by connecting a compatible phone to your broadband router or an adapter. GOV.UK also says a landline-only option remains for people who do not want a general internet service, although the underlying connection will be digital.' },
      { question: 'Will my existing phone work with Digital Voice?', answer: 'Many existing corded and cordless phones work when connected to the provider\'s router or adapter, but the exact handset and extension setup must be checked. Ask the provider before migration if the telephone is old, sits far from the router or uses several wall sockets. Test incoming and outgoing calls as soon as the new service activates.' },
      { question: 'Does Digital Voice work during a power cut?', answer: 'A standard digital phone service will not work when its broadband router loses power. If you depend on the landline and have no other way to contact emergency services, tell the provider. Ofcom requires an emergency-calling solution lasting at least one hour for eligible customers. Ask how its backup works, then keep it charged and test it.' },
      { question: 'What happens to a personal alarm during the digital voice switchover?', answer: 'A personal alarm may need an adapter or replacement before the phone line changes. Tell both the landline provider and the telecare supplier, giving the exact alarm model. Do not assume a dial tone proves compatibility. After installation, arrange an end-to-end test and confirm that the monitoring centre received the alarm signal and your address details correctly.' },
      { question: 'Is the PSTN switch-off the same as the copper phone line switch-off?', answer: 'The January 2027 deadline retires the PSTN voice service, but it does not mean every copper cable or part-copper broadband connection disappears that day. Some homes can continue receiving broadband over copper from the street cabinet while phone calls use VoIP. Full-fibre rollout and physical copper withdrawal are related programmes with different schedules.' },
      { question: 'Do I have to pay to change to a digital phone line?', answer: 'You should not be charged simply for the provider-led migration of an existing phone service. Citizens Advice warns that an unexpected demand for payment or bank details may be a scam. Verify every message using contact details on your bill or the provider\'s official website. Optional call packages, new handsets or unrelated broadband upgrades can still have charges.' },
    ],
  },

  'fix-wifi-dead-spots-uk': {
    body: (
      <>
        <p className="text-lg"><strong>A Wi-Fi dead spot is a room or part of a room where the wireless signal is absent or too weak for a dependable connection.</strong> Start by comparing a test beside the router with the same test in the problem room. If the nearby result is healthy, a more expensive broadband package will not carry the radio signal through a wall. Fix placement or coverage first.</p>

        <h2>Diagnose the dead spot before buying equipment</h2>
        <p>Use one phone or laptop for every test, pause large downloads and keep the device in roughly the same position in each room. Run our <Link href="/tools/speed-test">broadband speed test</Link> beside the router, then repeat it at the place where calls, streaming or browsing fail. Record download speed, upload speed, ping and whether the connection drops completely. Test once during a quiet period and again when the problem usually occurs.</p>
        <p>A poor result beside the router can indicate a line, router or device problem. Restart the router once, check its cables and updates, then test by Ethernet if possible. A good wired result and poor Wi-Fi result throughout the home points to wireless setup or old equipment. A good nearby Wi-Fi result but poor result in one room identifies a coverage problem. If Ethernet is also below the address-specific minimum guaranteed speed, contact the provider rather than buying a booster.</p>

        <h3>Room-by-room Wi-Fi baseline and retest</h3>
        <div className="overflow-x-auto" role="region" aria-label="Room-by-room Wi-Fi baseline and retest worksheet" tabIndex={0}>
          <table className="w-full min-w-[720px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">Write down the same measures before and after each change so a better signal icon is not mistaken for a better connection.</caption>
            <thead><tr className="bg-slate-50">{['Test location', 'Download and upload', 'Ping or dropouts', 'Change made', 'Retest result'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['Beside the router', 'Your baseline', 'Record both', 'None', 'Reference result'],
              ['Weak room at the usual device position', 'Same test and device', 'Record both', 'None', 'Problem result'],
              ['Weak room after moving the router', 'Same test and device', 'Record both', 'Placement only', 'Keep or reverse'],
              ['Weak room after adding equipment', 'Same test and device', 'Record both', 'Name the extender, node or access point', 'Compare with baseline'],
            ].map(([location, speed, stability, change, result]) => <tr key={location}><th scope="row" className="px-4 py-3 border border-slate-200 text-left font-semibold text-slate-900">{location}</th><td className="px-4 py-3 border border-slate-200">{speed}</td><td className="px-4 py-3 border border-slate-200">{stability}</td><td className="px-4 py-3 border border-slate-200">{change}</td><td className="px-4 py-3 border border-slate-200">{result}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>Move the router and remove common obstacles</h2>
        <p><strong>Ofcom recommends placing a router out in the open, off the floor and roughly central in the home.</strong> Keep it away from radiators, fish tanks, metal objects, large mirrors and thick walls because water, metal, glass and dense building materials weaken radio signals. Do not hide it in a cupboard or behind a television. Even moving it from floor level to an open shelf can clear obstacles between the aerials and upstairs rooms.</p>
        <p>The broadband entry point may limit movement. A longer suitable Ethernet cable can sometimes let a separate router or access point sit more centrally, but do not bend or extend fibre cables casually. Ask the provider what can move if the optical network terminal, cable socket or master socket is in an awkward corner. Keep the router powered so it can receive security and performance updates.</p>
        <p>Test both radio bands if the router lets you choose. The 2.4GHz band generally reaches farther and passes through obstacles better, while 5GHz can be faster at shorter range. Automatic band steering often makes this choice for each device. Changing the band may improve Wi-Fi not reaching upstairs, but it cannot overcome every brick wall or reinforced floor.</p>

        <h2>Choose the right fix for your home</h2>
        <div className="overflow-x-auto" role="region" aria-label="Wi-Fi dead spot fix comparison" tabIndex={0}>
          <table className="w-full min-w-[760px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">Start with the least costly option that addresses the measured cause.</caption>
            <thead><tr className="bg-slate-50">{['Situation', 'Start with', 'Main limitation', 'Placement check'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['One nearby weak room', 'Router move or range extender', 'A wireless extender shares an already limited link', 'Install where the router signal is still usable'],
              ['Several weak rooms or floors', 'Mesh Wi-Fi', 'Wireless backhaul also loses strength through obstacles', 'Put nodes between the router and weak area'],
              ['Thick walls but suitable electrical wiring', 'Powerline adapter with Wi-Fi', 'Performance depends on the home wiring and circuits', 'Use wall sockets and check the manufacturer instructions'],
              ['Home office, gaming room or stubborn dead spot', 'Ethernet or a wired access point', 'Cable installation takes planning', 'Run cable to the room, then broadcast locally if needed'],
            ].map(([situation, start, limit, placement]) => <tr key={situation}><th scope="row" className="px-4 py-3 border border-slate-200 text-left font-semibold text-slate-900">{situation}</th><td className="px-4 py-3 border border-slate-200">{start}</td><td className="px-4 py-3 border border-slate-200">{limit}</td><td className="px-4 py-3 border border-slate-200">{placement}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>When a Wi-Fi extender is enough</h2>
        <p>A range extender can be a sensible wifi black spots fix for one room near the edge of the router&apos;s coverage. It receives the existing wireless signal and rebroadcasts it. That means it must sit between the router and dead spot, where the original signal remains usable. An extender placed inside a complete dead zone has little useful connection to repeat.</p>
        <p>Expect some performance cost when the same radio handles traffic to the router and device. Some products create a second network name, which can leave a phone attached to the weaker connection as you move. Check compatibility, supported Wi-Fi generation, security updates and whether the unit provides an Ethernet socket. Retest the application that matters, such as a work call, rather than relying only on the number of signal bars.</p>

        <h2>When mesh Wi-Fi is the better answer</h2>
        <p>Mesh Wi-Fi uses a main unit and one or more nodes under one managed network. It is usually the clearer choice for several dead spots, a long property or multiple floors. Place each node where it can still communicate well with the main router or previous node. Ofcom warns that too many mesh boxes can make performance worse, so add only what the layout needs and follow the maker&apos;s spacing guidance.</p>
        <p>Ethernet backhaul connects mesh nodes by cable and removes the need for their inter-node traffic to cross difficult walls wirelessly. It is especially useful in brick homes, extensions and converted lofts. Before buying, read our <Link href="/guides/best-mesh-wifi-for-your-broadband-router">mesh Wi-Fi buying guide</Link> and check whether the provider router must stay connected for digital voice or television. Access-point or bridge mode can prevent two routers from competing to manage the same home network.</p>

        <h2>Powerline, Ethernet and wired access points</h2>
        <p>Powerline adapters carry network data over the home&apos;s electrical wiring. They can reach a room that defeats wireless backhaul, but performance varies with wiring condition, circuits and electrical noise. Ofcom advises checking for a UKCA or CE safety mark. Follow the product instructions, connect directly to suitable wall sockets where specified and keep the receipt so you can test the equipment in the actual property.</p>
        <p>Ethernet is the most predictable connection for a fixed television, games console or work computer. A cable can also feed a wired access point in the weak room, creating a strong local Wi-Fi signal without asking it to cross every wall twice. Use cable rated for the speed of the network. For rented homes, agree any drilling or permanent cable route with the landlord first.</p>

        <h2>Why broadband is fine but Wi-Fi is slow</h2>
        <p>Broadband is the service entering the router; Wi-Fi is the local radio link between the router and a device. Ofcom states that Wi-Fi cannot outperform the broadband service, but a strong broadband line can still be followed by weak Wi-Fi in one room. Distance, walls, congestion, the device&apos;s radio and the router&apos;s position can all reduce the speed after it enters the home.</p>
        <p>Use our <Link href="/guides/broadband-speeds-explained">broadband speeds explained guide</Link> to compare line speed with device speed. If every device is slow even over Ethernet, report the connection problem. If only one old device is slow beside the router, update it and test another device. If several devices work beside the router but not upstairs, improve coverage rather than upgrading the package. The next step is to <Link href="/guides/replace-isp-router-uk">decide whether to replace the provider router</Link>, add an access point or leave the hub in place.</p>

        <h2>A practical order for fixing weak Wi-Fi</h2>
        <ol>
          <li><strong>Measure:</strong> test one device beside the router and at the exact dead spot.</li>
          <li><strong>Separate line from Wi-Fi:</strong> use Ethernet where possible and compare the result with the provider&apos;s speed estimate.</li>
          <li><strong>Reposition:</strong> move the router into the open, higher and away from dense obstacles, then retest.</li>
          <li><strong>Check the device and band:</strong> install updates and compare 2.4GHz with 5GHz if controls are available.</li>
          <li><strong>Add the smallest suitable fix:</strong> use an extender for one edge room, mesh for several rooms, powerline where wiring helps, or Ethernet for dependable fixed use.</li>
          <li><strong>Retest and return poor hardware:</strong> repeat the same room-by-room checks before committing to more nodes or a faster package.</li>
        </ol>
      </>
    ),
    faqs: [
      { question: 'How do I fix Wi-Fi dead spots at home?', answer: 'Test beside the router and in the dead spot with the same device. If the nearby result is good, move the router into the open, off the floor and away from thick walls, metal and water, then retest. Use an extender for one edge room, mesh for several rooms, or Ethernet and a wired access point for stubborn obstacles.' },
      { question: 'Why is my Wi-Fi bad in only one room?', answer: 'Wi-Fi can be bad in one room because distance, brick or concrete walls, metal, mirrors, water or an awkward floor blocks the signal after it leaves the router. A good speed beside the router confirms the broadband line may be fine. Reposition the router first, then place any extender or mesh node where it still receives a usable signal.' },
      { question: 'What should I do if Wi-Fi is not reaching upstairs?', answer: 'Place the router high and in the open, then test 2.4GHz because it usually reaches farther than 5GHz. If the floor still blocks service, put a mesh node between the router and upstairs area, not inside the dead spot. Powerline may help where the electrical wiring suits it; Ethernet backhaul to an upstairs access point is the most dependable option.' },
      { question: 'Will a faster broadband package improve Wi-Fi signal at home?', answer: 'No. A faster package increases the potential speed reaching the router but does not increase the router\'s radio range. If Ethernet and nearby Wi-Fi are fast while one room is slow, spend on placement or coverage rather than line speed. If Ethernet is also below the provider\'s minimum guaranteed speed, report that broadband problem to the provider.' },
      { question: 'Is mesh Wi-Fi better than a range extender?', answer: 'Mesh Wi-Fi is usually better for several weak rooms because its nodes share one managed network and can support smoother roaming. A range extender costs less and may be enough for one nearby room. Both need a good link back to the router. Ethernet backhaul makes mesh more dependable where thick walls or floors weaken the wireless connection between nodes.' },
      { question: 'Where should I place a Wi-Fi extender or mesh node?', answer: 'Place it between the router and weak area, where the router signal is still stable. Do not put a wireless extender or mesh node deep inside the dead spot because it cannot repeat a connection it barely receives. Keep it in the open and away from large metal objects, water and dense obstacles, then retest the target room before fixing its final position.' },
    ],
  },

  'replace-isp-router-uk': {
    body: (
      <>
        <p className="text-lg"><strong>Keep the provider router unless a repeatable test shows it is holding your home network back.</strong> A replacement can improve Wi-Fi capacity, controls and local-network performance, but it cannot increase the broadband speed entering the property. It can also remove provider-managed phone, TV, mesh or diagnostic features.</p>
        <p>Our starting recommendation is to test first, then choose the least disruptive fix. Ofcom says an older router or frequent disconnections can justify an upgrade, but also warns that a third-party model can be difficult to configure and the provider may not support it. Ask the provider for a newer hub before spending, especially if the supplied model is old or faulty.</p>

        <h2>Router replacement decision at a glance</h2>
        <div className="overflow-x-auto" role="region" aria-label="ISP router replacement decision table" tabIndex={0}>
          <table className="w-full min-w-[720px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">Match the measured problem to the smallest change likely to fix it.</caption>
            <thead><tr className="bg-slate-50">{['What your tests show', 'Best first step', 'Why', 'Do not expect'].map((heading) => <th scope="col" key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['Ethernet and nearby Wi-Fi are both slow', 'Check the line, package and provider fault status', 'The router may be receiving a slow service', 'A router to exceed the incoming line speed'],
              ['Ethernet is fast but one room is weak', 'Reposition the hub or add a wired access point or mesh', 'This is mainly a coverage problem', 'One expensive router to defeat every wall'],
              ['Nearby Wi-Fi slows with many active devices', 'Compare a newer router or mesh system', 'Newer Wi-Fi can manage busy local traffic better', 'Older phones to gain a newer Wi-Fi standard'],
              ['You need VLANs, VPN hosting or detailed controls', 'Use a compatible third-party router', 'Provider hubs often expose fewer advanced settings', 'Your ISP to configure unsupported equipment'],
              ['The hub no longer receives security updates', 'Request a current hub or buy a supported replacement', 'Unsupported network equipment is a security risk', 'A used old model to be a safe long-term fix'],
            ].map(([result, step, reason, limit]) => <tr key={result}><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">{result}</th><td className="border border-slate-200 px-4 py-3">{step}</td><td className="border border-slate-200 px-4 py-3">{reason}</td><td className="border border-slate-200 px-4 py-3">{limit}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>Test before you replace the router</h2>
        <p>Run two comparable tests with the same device. First connect by Ethernet, or stand beside the provider hub if the device has no Ethernet port. Then repeat the test in the room where performance is poor. Pause large downloads and note the time, device and result. Our <Link href="/tools/speed-test">broadband speed test</Link> gives you a consistent starting point.</p>
        <p>If Ethernet is also much slower than the address-specific estimate, report the line or service problem before buying hardware. If the near-router result is good but a distant room is poor, read the <Link href="/guides/fix-wifi-dead-spots-uk">Wi-Fi dead-spot diagnosis guide</Link>. Placement, a wired access point or a correctly positioned mesh node is more likely to help than swapping one central box for another.</p>

        <h2>Three ways to use your own router</h2>
        <h3>Replace the provider router completely</h3>
        <p>A direct replacement is cleanest when the broadband arrives through an Ethernet hand-off from an optical network terminal, or ONT, and the new router supports the provider&apos;s authentication. Part-fibre and older copper services may instead require a compatible VDSL modem-router. Do not plug a router-only WAN port straight into a telephone socket.</p>
        <h3>Keep the provider hub in modem or bridge mode</h3>
        <p>Modem or bridge mode leaves the provider device handling the network connection while your own router manages the home network. Virgin Media officially supports modem mode on Hub 3, Hub 4 and standard Hub 5 hardware, but its help page says it is not currently available on Hub 5x. The mode disables several Virgin Wi-Fi and app features, although Virgin says its 21CV phone service continues to work.</p>
        <h3>Add your equipment in access-point mode</h3>
        <p>Access-point mode keeps the provider hub as the only router and uses the new device for Wi-Fi. This is a sensible fallback where Digital Voice, television or provider support requires the hub. It also avoids double NAT, where two routers both translate and manage traffic. Double NAT may not affect ordinary browsing but can complicate port forwarding, remote access, gaming and some work VPNs.</p>

        <h2>BT, Sky, TalkTalk and Virgin Media checks</h2>
        <div className="overflow-x-auto" role="region" aria-label="UK broadband provider router compatibility" tabIndex={0}>
          <table className="w-full min-w-[760px] text-sm border-collapse">
            <thead><tr className="bg-slate-50">{['Provider', 'Practical route', 'Check before changing', 'Support position'].map((heading) => <th scope="col" key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">BT</th><td className="border border-slate-200 px-4 py-3">On full fibre, a compatible router can use the ONT Ethernet hand-off; other lines may need a VDSL modem-router.</td><td className="border border-slate-200 px-4 py-3">Confirm PPPoE settings and whether BT Digital Voice or Complete Wi-Fi requires the Smart Hub.</td><td className="border border-slate-200 px-4 py-3">BT Business explicitly permits compatible equipment but does not configure or support it; residential service details must be confirmed for the account.</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">Sky</th><td className="border border-slate-200 px-4 py-3">A compatible router may work directly, but authentication can require DHCP Option 61 or provider-specific IPv6 behaviour.</td><td className="border border-slate-200 px-4 py-3">Check the exact access network, Sky Internet Calls and Sky Q or pod behaviour.</td><td className="border border-slate-200 px-4 py-3">Sky publishes little consumer setup help for third-party routers, so treat full replacement as an advanced, unsupported configuration.</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">TalkTalk</th><td className="border border-slate-200 px-4 py-3">TalkTalk publishes non-TalkTalk router settings, including DHCP/IPoE and VLAN ID 101 for its fibre configuration.</td><td className="border border-slate-200 px-4 py-3">TalkTalk TV can require IGMP support; confirm voice and any Eero or Wi-Fi service features.</td><td className="border border-slate-200 px-4 py-3">TalkTalk allows your own router but recommends its supplied hub and limits help with third-party hardware.</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">Virgin Media</th><td className="border border-slate-200 px-4 py-3">Keep the Virgin Hub as the network termination and use supported modem mode, then connect your router by Ethernet.</td><td className="border border-slate-200 px-4 py-3">Identify the Hub model first: Virgin says modem mode is not currently available on Hub 5x.</td><td className="border border-slate-200 px-4 py-3">The official modem-mode process is reversible, but some Connect app, Pod and Intelligent WiFi functions stop while it is enabled.</td></tr>
            </tbody>
          </table>
        </div>
        <p>Provider settings and bundled services change. Verify the instructions for your exact hub, connection type and account on the day you change it. Keep screenshots of the old settings, but do not copy passwords into notes that other people can access.</p>

        <h2>Is a better router worth it for broadband?</h2>
        <p>A better router is worth buying when it fixes a measured local-network constraint. Good reasons include unsupported old hardware, congestion with many devices, a need for stronger parental controls, guest networks, VPN features, faster Ethernet ports or a mesh system with wired backhaul. Compare the security-update period and support policy as carefully as the advertised wireless speed.</p>
        <p>Do not buy solely because the box advertises a multi-gigabit wireless rate. That number is not the speed one device will receive from the internet. A <Link href="/guides/wifi-7-explained-uk">Wi-Fi 7 router</Link> also needs compatible clients to use its new features, while the package speed, walls, interference and port speeds remain limits.</p>

        <h2>What to check on a replacement router</h2>
        <p><strong>Start with the internet-facing connection, not the Wi-Fi number on the box.</strong> An FTTP service with a separate ONT normally needs an Ethernet WAN socket, while a part-fibre line may need an integrated VDSL2 modem or a separate compatible modem. The WAN port must also be fast enough for the package. A 1Gbps port cannot carry a multi-gigabit service at full rate.</p>
        <ul>
          <li><strong>Provider settings:</strong> confirm PPPoE, DHCP, VLAN and IPv6 requirements from the provider or router maker. Compatibility with another Openreach-based ISP does not prove compatibility with your service.</li>
          <li><strong>Wi-Fi generation:</strong> Wi-Fi 6 is capable for many sub-gigabit homes. Consider Wi-Fi 6E or Wi-Fi 7 for compatible devices, 6GHz capacity or multi-gigabit local traffic, not simply because the standard is newer.</li>
          <li><strong>Ethernet ports:</strong> count the wired devices and check both the number and speed of LAN ports. A fast WAN socket does not guarantee equally fast LAN sockets.</li>
          <li><strong>Coverage design:</strong> one powerful router still has to cross the same walls. For several weak rooms, compare mesh with a suitable backhaul or wired access points.</li>
          <li><strong>Security support:</strong> look for automatic updates, a stated support period, WPA2 or WPA3 and a way to disable unused remote-management features.</li>
          <li><strong>Everyday controls:</strong> check guest networking, parental controls, device pausing and VPN features. Some brands charge a subscription for controls that appear in marketing.</li>
          <li><strong>Recovery and returns:</strong> buy from a seller that permits a practical home test, keep the packaging and confirm how settings can be backed up or reset.</li>
        </ul>
        <p>Match the router to the devices that will use it. An older phone or laptop remains limited by its own radio, antennas and Ethernet adapter. If one device is slow while others perform well in the same place, update or replace that client before rebuilding the whole network.</p>

        <h2>What you may lose by removing the ISP hub</h2>
        <p>Provider hubs do more than broadcast Wi-Fi. They can hold credentials, deliver internet-based phone service, integrate TV traffic, manage provider mesh nodes and expose remote diagnostics to support staff. Removing the hub may also disable a mobile-backup or security add-on included with the package. Make a written list of the services you use and obtain a provider-specific answer for each one.</p>
        <p>Support is the practical trade-off. A provider can test and replace its own router, but may stop troubleshooting once unsupported equipment sits between the line and your devices. Keep the original hub ready to reconnect. If the fault remains when the provider hub is restored with an Ethernet test, you have much stronger evidence that the line or service needs attention.</p>

        <h2>Safe changeover checklist</h2>
        <ol>
          <li><strong>Identify the hand-off:</strong> ONT Ethernet, Virgin Hub, VDSL phone line or another provider-specific connection.</li>
          <li><strong>List services tied to the hub:</strong> Digital Voice, TV, provider mesh, security controls, mobile backup and fault diagnostics.</li>
          <li><strong>Confirm compatibility:</strong> modem type, WAN port speed, authentication, VLAN, IPv6 and any IGMP requirement.</li>
          <li><strong>Save a rollback path:</strong> photograph cable positions, keep the original power supply and record non-secret settings.</li>
          <li><strong>Update first:</strong> install current firmware on the new router, use a unique admin password and enable automatic updates where available.</li>
          <li><strong>Change one layer:</strong> use direct replacement, modem or bridge mode, or access-point mode rather than leaving two unmanaged routers active.</li>
          <li><strong>Test the whole service:</strong> internet, phone, TV, work VPN, gaming, port forwarding and rooms that previously had weak Wi-Fi.</li>
          <li><strong>Keep the provider hub:</strong> you may need to reconnect it for support, return it when the contract ends or restore service quickly.</li>
        </ol>

        <h2>Bottom line</h2>
        <p>Replace the ISP router when you can name the bottleneck, prove it with a test and verify a compatible setup that preserves the services you use. Add mesh or an access point when coverage is the problem. Keep the supplied hub when it already performs well, supports your phone or TV, or provides the simplest route to provider support.</p>
      </>
    ),
    faqs: [
      { question: 'Should I replace my ISP router?', answer: 'Replace your ISP router only if tests show it is the bottleneck, it no longer receives security updates, or you need features it cannot provide. Keep it if speeds are good, it supports Digital Voice or TV, or your provider requires it for diagnosis. For one weak room, repositioning the hub, mesh or a wired access point is usually the better first step.' },
      { question: 'Will a better router increase broadband speed?', answer: 'A better router cannot increase the speed delivered to your home or exceed your package. It can improve the Wi-Fi or wired connection between the router and your devices, helping them receive more of the available broadband speed. Compare an Ethernet or near-router test with a weak-room test before deciding whether the line, Wi-Fi coverage or router capacity is limiting performance.' },
      { question: 'Can I replace a BT Smart Hub with my own router?', answer: 'A compatible third-party router can work on BT broadband, but the required hardware and settings depend on whether the connection is full fibre, VDSL or ADSL. Full fibre normally presents Ethernet at the ONT; other services may need a modem-router. Confirm PPPoE settings and Digital Voice or Complete Wi-Fi dependencies with BT, and keep the Smart Hub for fault testing.' },
      { question: 'Can I use a third-party router with Sky broadband?', answer: 'It can be possible, but a Sky broadband hub alternative must support the authentication used on your exact access network, which may involve DHCP Option 61 or provider-specific IPv6 behaviour. Sky offers little official consumer setup support for third-party routers. Check Internet Calls, Sky Q and pod dependencies first, and use access-point mode if keeping the Sky hub is safer.' },
      { question: 'How does Virgin Media modem mode work?', answer: 'Virgin Media modem mode keeps the Hub as the cable or fibre termination but disables its routing and Wi-Fi so your own router can manage the home network. Virgin publishes the setting for Hub 3, Hub 4 and standard Hub 5, but says it is not currently available on Hub 5x. Some Connect app, Pod and Intelligent WiFi features are disabled in modem mode.' },
      { question: 'Do I need to keep my provider router?', answer: 'Keep the provider router even after a successful replacement. The provider may ask you to reconnect it while diagnosing a fault, and loaned equipment may have to be returned when the contract ends. Store the hub, matching power supply and cables safely. Do not sell or discard it unless the provider confirms that you own it and will never need to return it.' },
    ],
  },

  'wifi-7-explained-uk': {
    body: (
      <>
        <p className="text-lg"><strong>Wi-Fi 7 is the newest widely sold Wi-Fi generation and a home wireless-network upgrade, not a faster broadband package.</strong> It can move data faster between compatible equipment and use several wireless links more intelligently. A Wi-Fi 7 router cannot make the incoming broadband line faster. Most UK homes on sub-gigabit broadband should wait if Wi-Fi 6 already works reliably.</p>

        <h2>Wi-Fi 7 at a glance</h2>
        <div className="overflow-x-auto" role="region" aria-label="Wi-Fi 6, Wi-Fi 6E and Wi-Fi 7 comparison" tabIndex={0}>
          <table className="w-full min-w-[680px] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">The capabilities of the standard. A particular router or phone may support only a subset.</caption>
            <thead><tr className="bg-slate-50">{['Feature', 'Wi-Fi 6', 'Wi-Fi 6E', 'Wi-Fi 7'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['IEEE name', '802.11ax', '802.11ax', '802.11be'],
              ['Bands', '2.4GHz and 5GHz', '2.4GHz, 5GHz and 6GHz', '2.4GHz, 5GHz and 6GHz on tri-band equipment'],
              ['Maximum channel width', '160MHz', '160MHz', '320MHz in 6GHz'],
              ['Multi-Link Operation', 'No', 'No', 'Yes, on compatible router and client'],
              ['Best fit', 'Most sub-gigabit homes', 'Extra short-range 6GHz capacity', 'Multi-gigabit and demanding local networks'],
            ].map(([feature, six, sixE, seven]) => <tr key={feature}><th scope="row" className="px-4 py-3 border border-slate-200 text-left font-semibold text-slate-900">{feature}</th><td className="px-4 py-3 border border-slate-200">{six}</td><td className="px-4 py-3 border border-slate-200">{sixE}</td><td className="px-4 py-3 border border-slate-200">{seven}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>What is Wi-Fi 7?</h2>
        <p>Wi-Fi 7 is the consumer name for IEEE 802.11be, the generation after Wi-Fi 6 and Wi-Fi 6E. Intel identifies three headline changes: channels as wide as 320MHz, 4096-QAM or 4K-QAM modulation, and Multi-Link Operation. Together they can increase peak capacity, reduce delays caused by a busy link and improve reliability. They do not guarantee a particular speed through the walls of a home.</p>
        <p>The often-quoted 46Gbps figure describes the theoretical maximum across an extremely capable implementation of the standard, not the internet speed one phone will receive. A typical client has fewer antennas, while distance, interference, router design, Ethernet ports and broadband speed impose lower limits. Treat the BE number on a router box as aggregate marketing classification, then inspect its bands, ports and tested throughput.</p>

        <h2>What Wi-Fi 7 changes in practice</h2>
        <h3>Multi-Link Operation can use more than one link</h3>
        <p>Older generations normally connect a client over one main wireless link at a time. Multi-Link Operation, or MLO, lets compatible Wi-Fi 7 equipment coordinate links across more than one band or channel. It can combine capacity or move traffic away from congestion, which is useful for large local transfers, cloud gaming and video calls. The exact MLO mode and bands supported vary by device.</p>
        <h3>320MHz channels can carry more data</h3>
        <p>A 320MHz channel is twice the maximum width used by Wi-Fi 6 or 6E. It is available in the 6GHz band, subject to the channels and power permitted in each country. Ofcom opened the UK lower 6GHz band for licence-exempt Wi-Fi use, but UK spectrum is not identical to US spectrum. A UK product specification is therefore more useful than a review of a US model.</p>
        <h3>4K-QAM packs more data into a strong signal</h3>
        <p>4K-QAM encodes more data in each radio transmission than the 1024-QAM used by Wi-Fi 6. It needs a clean, strong signal, so its gain is most plausible near the router rather than through several brick walls. Preamble puncturing can also let a Wi-Fi 7 network use the clear parts of a wide channel instead of abandoning the whole channel when part is affected by interference.</p>

        <h2>Is Wi-Fi 7 worth it?</h2>
        <p><strong>Wi-Fi 7 is worth it now for a narrower group of UK households.</strong> We would put it on the shortlist when replacing a failing or Wi-Fi 5 router, buying for a 1Gbps-plus full-fibre service, moving large files to local storage, or serving several new Wi-Fi 7 devices. In those cases, buy tri-band hardware with 6GHz and at least 2.5Gbps WAN and LAN ports so another component does not become the bottleneck.</p>
        <p>Wait if Wi-Fi 6 already delivers the speed you pay for in the rooms that matter, most devices are Wi-Fi 6 or older, or the broadband package is below roughly 500Mbps. First <Link href="/guides/fix-wifi-dead-spots-uk">diagnose and fix Wi-Fi dead spots</Link>; then consider an appropriate <Link href="/guides/best-mesh-wifi-for-your-broadband-router">mesh Wi-Fi system</Link> if measurements show that several rooms need better coverage. Six-gigahertz signals offer useful capacity at short range but do not pass through obstacles better than lower frequencies.</p>

        <h2>Wi-Fi 7 upgrade decision table</h2>
        <div className="overflow-x-auto" role="region" aria-label="Wi-Fi 7 upgrade decisions" tabIndex={0}>
          <table className="w-full min-w-[640px] text-sm border-collapse"><thead><tr className="bg-slate-50">{['Your position', 'Our starting recommendation', 'Check before spending'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead><tbody>{[
            ['100 to 500Mbps broadband; Wi-Fi 6 works well', 'Keep Wi-Fi 6', 'Run tests beside the router and in problem rooms'],
            ['Gigabit broadband; several Wi-Fi 7 clients', 'Consider tri-band Wi-Fi 7', '6GHz, MLO and 2.5Gbps ports on both ends'],
            ['Multi-gigabit broadband or fast home server', 'Wi-Fi 7 can remove a local bottleneck', 'WAN, LAN, switch, cabling and client limits'],
            ['Dead zones behind thick walls', 'Solve coverage first', 'Router placement, wired access points or mesh backhaul'],
            ['Old router needs replacing anyway', 'Compare total price with strong Wi-Fi 6 alternatives', 'Security updates, support period and returns policy'],
          ].map(([position, recommendation, check]) => <tr key={position}><td className="px-4 py-3 border border-slate-200 font-semibold text-slate-900">{position}</td><td className="px-4 py-3 border border-slate-200">{recommendation}</td><td className="px-4 py-3 border border-slate-200">{check}</td></tr>)}</tbody></table>
        </div>

        <h2>Do you need a Wi-Fi 7 router?</h2>
        <p>You need both a Wi-Fi 7 router and a compatible client to use Wi-Fi 7-only features. Older equipment remains able to connect, but it negotiates the older standard it supports. Before buying, check the precise phone, laptop or adapter specification rather than its age. Also confirm that a replacement router works with the provider&apos;s authentication, digital voice and TV service.</p>
        <p>Run a broadband speed test before replacing the router so you can identify whether the incoming line, local Wi-Fi coverage or client device is the real bottleneck. Our <Link href="/guides/replace-isp-router-uk">guide to replacing an ISP router safely</Link> covers BT, Sky, TalkTalk and Virgin Media connection methods, voice and TV checks, and a rollback plan.</p>
        <ol><li>Run a <Link href="/tools/speed-test">broadband speed test</Link> over Ethernet or beside the router, then repeat it in the room with the problem.</li><li>Compare the first result with your address-specific broadband estimate and package speed.</li><li>Check the Wi-Fi generation of the devices that need more performance.</li><li>Inspect the proposed router&apos;s 6GHz support, MLO implementation, Ethernet port speeds and security-update policy.</li><li>Buy only if the new hardware addresses the bottleneck you measured.</li></ol>

        <h2>What broadband speed do you need for Wi-Fi 7?</h2>
        <p>There is no minimum broadband speed for Wi-Fi 7, but the upgrade is easier to justify with gigabit or multi-gigabit full fibre. A 100Mbps package remains limited to about 100Mbps from the internet even if the local wireless link reports several gigabits. Wi-Fi 7 can still help local file transfers or congestion, but a well-configured Wi-Fi 6 router is normally sufficient for ordinary sub-gigabit internet use.</p>
        <p>Use our <Link href="/guides/broadband-speeds-explained">broadband speeds explained guide</Link> to separate the speed entering the property from the speed reaching a device. If Ethernet is slow too, investigate the line or package. If Ethernet is fast but one room is slow, placement, interference, mesh or a wired access point is the more relevant decision.</p>

        <h2>Wi-Fi 7 availability in the UK</h2>
        <p>Wi-Fi 7 routers, mesh systems, phones and laptops are on sale in the UK, and EE advertises Wi-Fi 7 Smart Hubs with selected broadband packages. Availability does not mean every model has tri-band 6GHz support or every connected device can use MLO. Product names and included routers change, so verify the exact model supplied with a broadband order and do not rely on the package name alone.</p>
        <p>The UK permits Wi-Fi in the lower 6GHz band, while Ofcom continues work on how other 6GHz spectrum can be shared. That regulatory detail matters because a router reviewed abroad may expose different channels or power levels. Buy a UK-market model from a source with clear specifications, firmware support and a practical return route.</p>

        <h2>Wi-Fi 7 router buying checklist</h2>
        <ul>
          <li><strong>Bands:</strong> check whether the router is dual-band or tri-band and whether it actually includes 6GHz. The Wi-Fi 7 label alone does not promise the same radios on every model.</li>
          <li><strong>Ports:</strong> a 1Gbps WAN or LAN socket can restrict a multi-gigabit broadband service or local transfer. Look for 2.5Gbps or faster ports in the positions you will use.</li>
          <li><strong>Clients:</strong> list the phones and laptops expected to benefit and verify their exact Wi-Fi specification. Older devices remain compatible but cannot use Wi-Fi 7-only features.</li>
          <li><strong>Home layout:</strong> decide whether one router can cover the property or whether mesh, Ethernet backhaul or wired access points would solve the measured weak rooms more effectively.</li>
          <li><strong>Provider services:</strong> confirm authentication, digital voice and television support before replacing an ISP hub. Access-point mode may be safer when the provider router must remain connected.</li>
          <li><strong>Support:</strong> compare the firmware-update policy, warranty, parental-control costs and returns terms. Long security support is more useful than an unused peak-speed claim.</li>
        </ul>

        <h2>Bottom line</h2>
        <p>Buy Wi-Fi 7 for a measured need, not for its theoretical maximum. It is a sound choice for new multi-gigabit equipment and a longer-term router replacement, particularly where compatible clients can use MLO and 6GHz. Reliable Wi-Fi 6 remains the better-value answer for most sub-gigabit UK homes. Test first, identify whether the line, coverage or client is limiting performance, and spend on that constraint.</p>
      </>
    ),
    faqs: [
      { question: 'Is Wi-Fi 7 worth it in the UK?', answer: 'Wi-Fi 7 is worth considering for gigabit or multi-gigabit full fibre, compatible phones and laptops, demanding local file transfers or a router that already needs replacing. Most homes with reliable Wi-Fi 6 and broadband below 1Gbps can wait. A new wireless standard cannot raise the speed entering the property from the broadband provider.' },
      { question: 'What is the difference between Wi-Fi 7 and Wi-Fi 6?', answer: 'Wi-Fi 7, or 802.11be, adds Multi-Link Operation, channels up to 320MHz and 4K-QAM. Wi-Fi 6 uses channels up to 160MHz and lacks MLO. These changes can improve capacity, peak throughput and link reliability, but require compatible equipment. Actual internet performance still depends on broadband speed, distance, interference, Ethernet ports and the client device.' },
      { question: 'Do I need a Wi-Fi 7 router?', answer: 'You need a Wi-Fi 7 router only to use Wi-Fi 7 features with a compatible client. Older devices will still connect but use their own older standard. Upgrade when current hardware is the measured bottleneck, particularly on gigabit-plus broadband. Check 6GHz support, MLO, Ethernet port speeds and ISP voice or TV compatibility before replacing a provider hub.' },
      { question: 'Will Wi-Fi 7 make my broadband faster?', answer: 'Wi-Fi 7 can improve the wireless link between a compatible device and router, helping you receive more of the broadband speed already delivered. It cannot make a 100Mbps package become 500Mbps. Test over Ethernet or beside the router first. If that result is slow, the broadband line, package or provider needs attention rather than the Wi-Fi generation.' },
      { question: 'Are Wi-Fi 7 routers backwards compatible?', answer: 'Yes. A Wi-Fi 7 router can connect Wi-Fi 6E, Wi-Fi 6, Wi-Fi 5 and many older devices. Each client uses features it supports, so an older phone does not gain 320MHz channels or Wi-Fi 7 Multi-Link Operation. Legacy smart-home equipment may also need 2.4GHz setup, so confirm band and security compatibility before retiring the old router.' },
      { question: 'What broadband speed is needed for Wi-Fi 7?', answer: 'Wi-Fi 7 has no minimum broadband speed, but it is easiest to justify with gigabit or multi-gigabit full fibre. On a sub-500Mbps package, good Wi-Fi 6 equipment is normally enough for internet access. Wi-Fi 7 may still benefit fast transfers to a home server, though the router, client, Ethernet ports, switch and storage must all support that performance.' },
    ],
  },

  'best-broadband-and-tv-deals': {
    body: (
      <>
        <p className="text-lg">
          <strong>Our verdict:</strong> Sky is the best starting point for a TV-first household,
          Virgin Media is strongest when you want fast broadband with a broad cable-TV bundle, and
          EE TV is the best alternative for flexible NOW-based entertainment or TNT Sports. The
          right deal still depends on your postcode, must-have channels and total contract cost.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Price and availability check:</strong> provider features and public offer
            examples on this page were checked against official UK sources on 24 August 2026. Offers
            can change, and the packages shown at your address may differ. Confirm the full price,
            annual changes, setup costs and channel list before ordering.
          </p>
        </div>

        <h2>Best broadband and TV providers at a glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">
              Our editorial shortlist by household need, based on package flexibility, content,
              broadband fit and information verified from provider websites.
            </caption>
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Best for', 'Why it stands out', 'Main trade-off'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Sky', 'Best overall for TV-first homes', 'Sky channels, streaming inclusions and sports options in one ecosystem', 'Long minimum terms and paid extras can raise the total cost'],
                ['Virgin Media', 'Best for fast broadband plus a large TV bundle', 'Broad channel bundles, premium packs and broadband up to gigabit tiers where available', 'Its network is not available at every address'],
                ['EE TV', 'Best for flexible TV packs and TNT Sports', 'NOW-powered packages can combine entertainment, cinema, Sky Sports and TNT Sports', 'TV is sold with broadband and package details need careful comparison'],
                ['Broadband plus separate streaming', 'Best for light TV viewers', 'Usually simpler and more flexible if you do not watch premium live channels', 'Less convenient and sports rights may require several subscriptions'],
              ].map(([provider, fit, strength, tradeoff]) => (
                <tr key={provider} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{provider}</td>
                  <td className="px-4 py-3 text-slate-700">{fit}</td>
                  <td className="px-4 py-3 text-slate-700">{strength}</td>
                  <td className="px-4 py-3 text-slate-600">{tradeoff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          This is a decision shortlist, not a claim that one provider is cheapest at every address.
          Start with the provider that matches your viewing habits, then compare the live package
          and broadband options available at your postcode.
        </p>
        <p>
          If you mainly want public-service channels without a monthly TV package, read our guide to{' '}
          <Link href="/guides/freely-and-fetch-tv-explained-uk">Freely TV and watching live TV without an aerial</Link>{' '}
          before paying for a bundle.
        </p>

        <h2>Which broadband and TV deal is best for you?</h2>

        <h3>Best overall for TV: Sky</h3>
        <p>
          Sky is the clearest starting point if television is the main reason you want a bundle.
          Its current UK deals combine Sky TV with <abbr title="Full fibre (FTTP): a fibre-optic cable runs all the way into your home">full-fibre</abbr> broadband, while the content mix can
          include Sky channels and streaming services. Sky Stream delivers television over
          broadband without a satellite dish. Sky says Stream needs a recommended minimum speed of
          25<abbr title="Megabits per second: how fast data reaches your home">Mbps</abbr>, rising to 30Mbps for <abbr title="Ultra HD, also called 4K: four times the detail of standard HD">UHD</abbr> or an additional <abbr title="Sky's small streaming box for an extra TV">puck</abbr>.
        </p>
        <p>
          As one concrete example, at the time of writing Sky was advertising Sky Stream, Sky TV
          and Netflix bundled with Full Fibre 300 broadband from £35 a month on a 24-month
          contract, and Sky Ultimate TV bundled with Full Fibre 500 from £39 a month. Sky Essential
          TV alone runs from around £15 a month, and Sky Ultimate TV alone from around £24 a month,
          rising to a standard rate after the introductory period. These specific package names and
          prices are examples, not a live quote, so confirm the current offer for your postcode.
        </p>
        <p>
          Sky is less compelling if you only watch a few on-demand apps. Check the price of every
          extra, the minimum term, whether the advertised broadband tier is available, and the
          price-change wording. See our <Link href="/providers/sky">Sky broadband review</Link> or
          compare <Link href="/providers/compare/sky-vs-virgin-media">Sky vs Virgin Media</Link>.
        </p>

        <h3>Best for fast broadband with a large TV package: Virgin Media</h3>
        <p>
          Virgin Media is a strong fit for homes that want premium television and faster broadband
          on the same bill. Its current bundle range separates entertainment, cinema, sport and
          combined sport-and-cinema needs. Virgin also offers Flex, a lighter TV option with a
          rolling 30-day TV element alongside a longer broadband contract. Virgin Media was named
          Most Reliable Broadband Provider at the 2026 Uswitch Telecoms Awards, based on independent
          network data from Opensignal, which is a genuine third-party measurement rather than a
          claim Virgin Media makes about itself.
        </p>
        <p>
          Its most complete bundle, Max Volt, illustrates what a full household package can look
          like: at the time of writing it combined M500 broadband boosted to gigabit speed, an O2 5G
          SIM with unlimited data and calls, Virgin TV 360 with more than 230 channels including Sky
          Sports HD, Sky Cinema HD and Netflix, and free UK landline and mobile calls, from £74.99 a
          month, rising to £81.49 from March 2027 and £87.99 from April 2028. That scheduled two-step
          rise is exactly the kind of detail worth reading before signing up to any large bundle, not
          just Virgin Media's.
        </p>
        <p>
          Availability is the deciding factor: Virgin Media uses its own network and cannot serve
          every property. Its official terms also show why headline comparisons need care: TV boxes,
          premium packs, installation and the broadband minimum term can have separate conditions.
          Read our <Link href="/providers/virgin-media">Virgin Media review</Link> before ordering.
        </p>

        <h3>Best for flexible packs and TNT Sports: EE TV</h3>
        <p>
          BT now sells its television proposition as EE TV. Official package information groups the
          choice into Entertainment, Sport, Big Entertainment, Big Sport and Full Works. Depending
          on the package, this can bring together NOW entertainment or cinema, Sky Sports, TNT
          Sports and Netflix. BT also says eligible customers can change flexible TV packages
          without changing the broadband contract.
        </p>
        <p>
          EE TV is worth shortlisting when TNT Sports matters or you want one television platform
          for several premium services. Compare the normal price after any promotional period and
          remember that the TV price is added to the compatible broadband option. See our
          {' '}<Link href="/providers/bt">BT review</Link> and <Link href="/providers/ee">EE review</Link>.
        </p>

        <h2>Current offer examples: what the headline price leaves out</h2>
        <p>
          A live offer is useful as an example, but it should not be treated as a permanent ranking.
          On 24 August 2026, Sky advertised selected TV and full-fibre combinations from £35 per month
          for new customers, while BT advertised promotional EE TV pricing with the broadband cost
          selected separately. Virgin Media displayed package features by postcode rather than one
          universal bundle price. These examples can change without notice.
        </p>
        <p>
          The only reliable comparison is the checkout result for your address. Record the
          introductory price, scheduled in-contract changes, setup cost, minimum term, price after
          the minimum term, and every paid channel or streaming add-on.
        </p>

        <h2>How much can bundling actually save you?</h2>
        <p>
          Ofcom research published in February 2026 found that households who bundle their
          telecoms services together typically pay £26 to £48 a month less than buying broadband,
          TV and landline separately from different providers. Within a bundle, Ofcom found the
          average price paid for a pay-TV service fell by 23% in real terms over the past year, to
          around £12 a month, a genuinely large saving compared with a standalone pay-TV
          subscription.
        </p>
        <p>
          That saving only applies if you actually use what you are paying for. A large bundle with
          premium sport and cinema packs you rarely watch is not a saving; it is a bigger bill with
          extra channels attached. Use the Ofcom figures as a sense check on a live quote, not a
          guarantee that any specific bundle is good value for your household.
        </p>
        <p>
          If the package also includes a SIM, use our{' '}
          <Link href="/guides/broadband-and-mobile-bundle-discounts-uk">broadband and mobile bundle discount guide</Link>{' '}
          to compare EE One, Vodafone Together and Virgin Media O2 Volt against buying the services separately.
        </p>

        <h2>How to compare the true cost of a broadband and TV bundle</h2>
        <p>
          Use this calculation: <strong>total minimum-term cost = all monthly payments + setup and
          delivery fees + required add-ons − guaranteed bill credits or rewards</strong>. Divide the
          result by the number of contract months for a comparable effective monthly cost.
        </p>
        <ol>
          <li><strong>Check the broadband:</strong> compare guaranteed or estimated speeds at your address, not the maximum in an advert.</li>
          <li><strong>List must-have content:</strong> name the exact sports, channels and apps you will use.</li>
          <li><strong>Separate promotions from normal prices:</strong> calculate every month of the minimum term.</li>
          <li><strong>Add hardware and extras:</strong> include setup, delivery, UHD, multiroom and premium packs.</li>
          <li><strong>Check linked contracts:</strong> TV, broadband, mobile and streaming elements may not share the same end date.</li>
          <li><strong>Compare the alternative:</strong> price broadband-only plus the streaming subscriptions you would buy independently.</li>
        </ol>

        <h2>Broadband and TV bundle or separate subscriptions?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Choose a bundle when…', 'Choose broadband plus streaming when…'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['You regularly watch premium live sport or pay-TV channels', 'You mainly watch Netflix, Disney+, YouTube or catch-up apps'],
                ['The bundle is cheaper across the full minimum term', 'You value monthly flexibility more than one bill'],
                ['You want recording, multiroom or an integrated TV guide', 'You do not need provider hardware or premium channel packs'],
                ['You are comfortable with the contract and future price', 'You may move home or change services soon'],
              ].map(([bundle, separate]) => (
                <tr key={bundle} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{bundle}</td>
                  <td className="px-4 py-3 text-slate-700">{separate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Ofcom says bundling can save money when you genuinely need more than one service, but it
          can reduce flexibility. That is why the number of included services is not a value score
          on its own.
        </p>

        <h2>How much broadband speed do you need for TV streaming?</h2>
        <p>
          The TV platform&apos;s minimum is only a starting point. Add every simultaneous stream,
          video call, game download and connected device in your household. A stable 50–100Mbps
          service can suit many small households, while busy multi-user homes may benefit from
          faster full fibre. Reliability and Wi-Fi coverage can matter more than buying the highest
          advertised tier.
        </p>
        <p>
          Use our <Link href="/tools/speed-test">broadband speed test</Link>, then read
          {' '}<Link href="/guides/broadband-speeds-explained">what broadband speed you actually need</Link>.
        </p>

        <h2>Can you switch a broadband and TV bundle with One Touch Switch?</h2>
        <p>
          <abbr title="Ofcom's switching process: your new provider arranges the move and tells the old one">One Touch Switch</abbr> lets your new provider arrange the broadband switch, but Ofcom warns that
          you may still need to tell the old provider to cancel a linked TV service. This is
          particularly important when television uses separate equipment or contract terms. Check
          early termination charges, equipment-return instructions and each service&apos;s end date
          before confirming the move.
        </p>
        <p>
          Consumers normally have a 14-calendar-day cooling-off period for a new broadband order,
          although used service or installation costs can still apply. Follow our
          {' '}<Link href="/guides/how-to-switch-broadband-uk">UK broadband switching checklist</Link>.
        </p>

        <h2>Our broadband and TV bundle methodology</h2>
        <p>
          We compare household fit rather than awarding a provider points for carrying the largest
          channel count. Our assessment considers broadband availability and speed, must-have
          content, minimum-term cost, price transparency, contract flexibility, hardware, setup
          fees and the consequences of switching. Commercial relationships do not determine our
          editorial order. Read <Link href="/how-we-review-broadband">how we review broadband</Link>
          {' '}and <Link href="/how-we-make-money">how BroadbandPicker makes money</Link>.
        </p>

        <h2>Bottom line</h2>
        <p>
          Choose Sky when the TV experience comes first, Virgin Media when you want fast broadband
          and a broad cable-TV package at an eligible address, or EE TV when its NOW and TNT Sports
          combinations match what you watch. Choose broadband-only plus streaming if premium live
          TV is not essential. In every case, compare the whole minimum-term cost at your postcode
          before signing. If live sport is the deciding factor, compare the direct options in our{' '}
          <Link href="/guides/cheapest-way-to-watch-sky-sports-uk">Sky Sports and TNT Sports cost guide</Link>.
        </p>
      </>
    ),
    faqs: [
      { question: 'Who has the best broadband and TV deals in the UK?', answer: 'Sky is our starting point for a TV-first home, Virgin Media is strongest for fast broadband with a broad TV package where its network is available, and EE TV is a strong alternative for flexible NOW-based packs or TNT Sports. The best-value live deal depends on your postcode and must-have content.' },
      { question: 'Is it cheaper to bundle broadband and TV together?', answer: 'It can be cheaper when you already want the included pay-TV service. Compare the total minimum-term cost with broadband-only plus separate streaming subscriptions; a larger bundle is poor value if you do not use its channels.' },
      { question: 'Which broadband and TV provider is best for sport?', answer: 'Start by listing the competitions you watch because rights are split across Sky Sports and TNT Sports. Sky, Virgin Media and EE TV offer different combinations, so compare the exact channels, HD or UHD charges and full contract cost rather than the sports label alone.' },
      { question: 'Can I get Sky TV with broadband from another provider?', answer: 'Sky Stream works over broadband and Sky says you can use another broadband provider, subject to recommended speeds. A combined Sky TV and broadband deal may be simpler, but it is not the only way to receive Sky Stream.' },
      { question: 'What broadband speed do I need for streaming TV?', answer: 'Sky recommends at least 25Mbps for Sky Stream and 30Mbps for UHD or an extra puck. A household with several simultaneous streams and other heavy internet use should allow more capacity and reliable Wi-Fi.' },
      { question: 'Does One Touch Switch cancel the TV part of my old bundle?', answer: 'Not always. Ofcom says you may need to contact your old provider separately to cancel another service in the bundle, such as TV. Confirm contract end dates, equipment returns and any early termination charges before switching.' },
      { question: 'What should I compare besides the monthly price?', answer: 'Compare the full minimum-term cost, broadband speed at your address, in-contract price changes, post-contract price, setup and delivery fees, included channels, streaming plans, UHD or multiroom costs, equipment returns and cancellation terms.' },
      { question: 'How much can I actually save by bundling broadband and TV?', answer: 'Ofcom research published in February 2026 found households save £26 to £48 a month on average by bundling telecoms services rather than buying them separately, with the average price paid for pay-TV within a bundle falling 23% in real terms to around £12 a month. This only holds if you use what is included; an unused premium pack is not a saving.' },
      { question: 'What is Virgin Media Max Volt?', answer: 'Max Volt is Virgin Media\'s most complete bundle, combining gigabit-boosted broadband, an O2 5G SIM with unlimited data and calls, Virgin TV 360 with over 230 channels including Sky Sports HD and Sky Cinema HD, and free UK calls. At the time of writing it started from £74.99 a month with two scheduled price rises built into the 24-month contract, so check the full-term cost before treating the entry price as final.' },
    ],
  },

  'freely-and-fetch-tv-explained-uk': {
    body: (
      <>
        <p><strong>Freely is free UK television delivered through your broadband connection instead of relying on an aerial or satellite dish.</strong> It is operated by Everyone TV, the organisation that also runs Freeview and Freesat on behalf of the BBC, ITV, Channel 4 and Channel 5. Supported live channels, catch-up programmes and broadcaster apps appear in a single television interface.</p>
        <p>The service itself has no monthly subscription, but that does not make the whole setup cost-free. You need a compatible Freely television or streaming device, home broadband and, for live television or BBC iPlayer, a TV Licence. Paid apps such as Netflix remain separate subscriptions. Check the current equipment and channel list before buying because both are changing as Freely develops.</p>

        <h2>Freely, Freeview and Fetch TV at a glance</h2>
        <div role="region" aria-label="Freely, Freeview and Fetch TV comparison" tabIndex={0} className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Question', 'Freely', 'Freeview or Freeview Play', 'Fetch TV today'].map((heading) => (
                  <th key={heading} scope="col" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Where is it offered?</th><td className="border border-slate-200 px-4 py-3">United Kingdom</td><td className="border border-slate-200 px-4 py-3">United Kingdom</td><td className="border border-slate-200 px-4 py-3">Australia, not the UK</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">How does live TV arrive?</th><td className="border border-slate-200 px-4 py-3">Broadband, by Wi-Fi or Ethernet</td><td className="border border-slate-200 px-4 py-3">Aerial for the live Freeview line-up; internet adds catch-up on Freeview Play</td><td className="border border-slate-200 px-4 py-3">Australian broadband plus a Fetch box; an Australian antenna can add free-to-air channels</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Ongoing service charge?</th><td className="border border-slate-200 px-4 py-3">No Freely subscription</td><td className="border border-slate-200 px-4 py-3">No Freeview subscription</td><td className="border border-slate-200 px-4 py-3">Yes, for the current Australian Fetch service</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Main limitation</th><td className="border border-slate-200 px-4 py-3">Needs compatible equipment and working broadband</td><td className="border border-slate-200 px-4 py-3">Live reception depends on an aerial and local signal</td><td className="border border-slate-200 px-4 py-3">Not a service UK households can order</td></tr>
            </tbody>
          </table>
        </div>

        <h2>How Freely TV works</h2>
        <p>Freely sends its supported live television streams through the internet. The programme guide then places live channels beside programmes available through services such as BBC iPlayer, ITVX, Channel 4 and 5. Features include a MiniGuide and restart on supported programmes, though availability can vary by channel, programme and device.</p>
        <p>The official guide currently includes the main public-service channels such as BBC One, BBC Two, ITV1, Channel 4 and 5, alongside services including ITV2, Film4, E4, U&amp;Dave and Sky Arts. That is an example, not a permanent promise for every region. Use Freely&apos;s location setting and current channel checker because regional variants, streaming rights and optional aerial additions can change what appears.</p>
        <p><a href="https://www.freely.co.uk/products/buying-advice/freely-vs-freeview-difference-comparison" target="_blank" rel="noopener noreferrer">Freely says a connection of at least 10Mbps is required</a>. Treat that as a service minimum rather than a guarantee for the whole home. A television sharing Wi-Fi with video calls, downloads and other streams needs spare capacity, and the connection at the TV matters more than the speed measured next to the router.</p>
        <p>Ethernet is the most dependable connection where a cable is practical. On Wi-Fi, test in the room where the television will sit. Our guide to <Link href="/guides/fix-wifi-dead-spots-uk">fixing Wi-Fi dead spots</Link> explains how to separate poor room coverage from a slow broadband line. The <Link href="/guides/best-broadband-for-streaming">broadband for streaming guide</Link> helps size a package for several simultaneous viewers.</p>

        <h2>What equipment do you need for Freely?</h2>
        <p>You need a product that expressly lists Freely support. A television being smart, having Wi-Fi or supporting Freeview Play does not automatically make it compatible. Freely is built into selected televisions, and current streaming devices can add it to an older television through an HDMI port. Check the exact model on the <a href="https://www.freely.co.uk/get-freely" target="_blank" rel="noopener noreferrer">official Freely device page</a> before paying.</p>
        <p>Use this pre-purchase checklist:</p>
        <ul>
          <li><strong>Compatibility:</strong> confirm the full television or box model, not only the manufacturer.</li>
          <li><strong>Connection:</strong> test stable Wi-Fi at the intended television position or plan an Ethernet cable.</li>
          <li><strong>Channels:</strong> check the <a href="https://www.freely.co.uk/channels" target="_blank" rel="noopener noreferrer">current Freely channel guide</a> and your region rather than assuming every Freeview channel is streamed.</li>
          <li><strong>Recording:</strong> verify the hardware feature separately. Freely restart and catch-up are not the same as recording any scheduled programme.</li>
          <li><strong>Accessibility:</strong> check subtitles, audio description, accessible-guide support and remote layout on the exact product.</li>
          <li><strong>Licence:</strong> budget for a TV Licence if anyone watches live television on any service or uses BBC iPlayer.</li>
        </ul>

        <h2>Freely vs Freeview: which is better?</h2>
        <p><strong>Choose Freely when the room has good broadband but no usable aerial socket.</strong> Choose Freeview when you already have a sound aerial, want live television to continue during an internet outage or need channels and recording options that your proposed Freely device does not provide. Freeview Play adds broadcaster catch-up to compatible aerial-based equipment, so it is not simply the old version of Freely.</p>
        <p>Freely can optionally combine streamed channels with extra channels received through an aerial on compatible equipment. That hybrid arrangement offers a practical fallback and a broader line-up in some homes, but it removes the main no-aerial advantage. Compare the actual channel lists, not headline totals, because regional services, streamed channels and aerial additions are counted differently.</p>
        <p>Freely is not replacing Freeview on a published household deadline. Both currently operate, while Freesat remains an aerial-free option that receives live channels through a satellite dish. If your aim is premium sport, films or specialist channels, compare Freely’s free base with the full contract cost of a paid bundle in our <Link href="/guides/best-broadband-and-tv-deals">broadband and TV deals guide</Link>.</p>

        <h2>Can you watch TV without an aerial in the UK?</h2>
        <p>Yes. Freely supplies a conventional live-channel guide over broadband on compatible equipment. You can also open individual broadcaster apps, use free ad-supported streaming services, choose Freesat with a dish, or buy an internet-delivered package such as Sky Stream or EE TV. These routes are not interchangeable: app and channel availability, regional news, recording, restart and monthly costs differ.</p>
        <p>A TV Licence is about what you watch, not how the signal reaches the screen. <a href="https://www.tvlicensing.co.uk/check-if-you-need-one" target="_blank" rel="noopener noreferrer">TV Licensing says a licence is required to watch live television on any channel or service, or to use BBC iPlayer</a>. Watching only non-BBC on-demand programmes can fall outside that requirement, but check the official rules for your exact use.</p>

        <h2>What does Fetch TV UK mean?</h2>
        <p><strong>There is no current Fetch TV service marketed to UK households.</strong> The live Fetch TV brand is an Australian paid television platform that combines streamed channels, apps, rentals and purchases through a Fetch set-top box. Its Australian prices, channel packs and antenna references do not apply to a UK address, so it should not appear in a UK buying shortlist beside Freely.</p>
        <p>A different UK service called Fetch TV was operated by IP Vision, whose owner entered administration in 2012. Older UK articles, manuals and search results may still describe its boxes, Freeview tuner and on-demand service. Those pages are historical, not evidence that today’s Australian Fetch TV can be ordered in Britain. If a retailer uses “fetch TV” casually to mean retrieving television over broadband, check the product name and territory before assuming it refers to either brand.</p>

        <h2>Our recommendation before you buy</h2>
        <p>Start with Freely if you want familiar UK live channels in a room without an aerial and your Wi-Fi is dependable there. Keep or add Freeview if live-TV resilience, a broader local aerial line-up or recorder support matters more. Before buying, write down five channels and two must-have functions, then verify each against the exact device. This channel-first check prevents a free service from becoming an expensive hardware mistake. Once free live channels are sorted, our <Link href="/guides/best-streaming-services-uk">best streaming services in the UK comparison</Link> covers which paid apps, such as Netflix or Disney+, are worth adding on top.</p>
      </>
    ),
    faqs: [
      { question: 'What is Freely TV?', answer: 'Freely TV is a UK free-to-view television service operated by Everyone TV, which also runs Freeview and Freesat. It streams supported live channels through broadband and combines them with broadcaster catch-up services in one guide. Freely has no monthly subscription, but you need compatible equipment, internet access and a TV Licence for live television or BBC iPlayer.' },
      { question: 'Do I need an aerial for Freely TV?', answer: 'No. Freely can stream its supported live channels through broadband without an aerial or satellite dish. You need a compatible Freely television or streaming device and a stable connection of at least 10Mbps. Some equipment can also use an aerial to add channels, but that is optional and the extra reception depends on the local Freeview signal.' },
      { question: 'Is Freely TV the same as Freeview?', answer: 'No. Freely streams supported live channels over broadband, while Freeview receives its live line-up through a television aerial. Freeview Play adds catch-up apps to compatible Freeview equipment, but still uses the aerial for its main live guide. Freely suits a room without an aerial; Freeview offers a useful live-TV fallback when broadband or Wi-Fi fails.' },
      { question: 'What broadband speed do I need for Freely TV?', answer: 'Freely states that at least 10Mbps is required for live and on-demand viewing. A household may need more headroom when several people stream, game or make video calls at once. Test the connection beside the television, not only beside the router, because weak room-level Wi-Fi can cause buffering even on a fast broadband package.' },
      { question: 'Can I add Freely to my existing television?', answer: 'Yes, if the television has a suitable HDMI input and you buy a compatible Freely streaming device. A generic smart-TV stick does not automatically support Freely, and older smart televisions do not gain it through a routine software update. Check the exact device on Freely’s current compatibility page before buying and confirm that its apps and accessibility features meet your needs.' },
      { question: 'Is Fetch TV available in the UK?', answer: 'No current Fetch TV service is sold to UK households. Today’s Fetch TV is an Australian paid platform with set-top boxes, channel packs, apps and rentals. The operator of a separate British service with the same name entered administration in 2012, so old UK pages are historical. UK viewers should compare Freely with current UK alternatives instead.' },
      { question: 'Do I need a TV Licence for Freely?', answer: 'Yes, if you use Freely to watch live television. TV Licensing says a licence is needed to watch live programmes on any channel or service and to use BBC iPlayer, regardless of whether reception is through broadband, an aerial or a dish. Freely itself does not charge a subscription, but that does not remove the separate legal licensing requirement.' },
    ],
  },

  'best-rolling-monthly-broadband-deals': {
    body: (
      <>
        <p>Rolling monthly broadband is designed for people who need flexibility more than the absolute lowest monthly price. It is especially useful for renters, short-term lets, people moving house soon, or anyone who does not want to lock into an 18- or 24-month contract. If a move is already booked, use the <Link href="/guides/moving-house-broadband-checklist-uk">moving house broadband checklist</Link> first so the new address is live before you worry about the next contract length. Genuine rolling monthly broadband from a national provider is rarer than it used to be; the honest starting point is knowing which providers actually still offer it.</p>

        <h2>Who should consider rolling monthly broadband</h2>
        <ul>
          <li>Renters on short leases</li>
          <li>Students or temporary workers</li>
          <li>Households waiting for a better full-fibre option to arrive</li>
          <li>People moving again within the year</li>
        </ul>

        <h2>YouFibre: a genuine rolling monthly full-fibre option</h2>
        <p>YouFibre, a full-fibre altnet on the Netomnia network, is one of the few providers on this site that genuinely offers a rolling monthly contract alongside its standard 24-month term, with no mid-contract price rise on either option. Rolling prices run from £33.99 a month for its entry tier up to £129.99 for its fastest 8 Gbps package, requiring 30 days&apos; notice to cancel rather than a fixed minimum term. This is a real, meaningful premium over its 24-month pricing (from £20 a month for the equivalent entry tier), so it only makes sense for households that genuinely value the flexibility over the extra cost. Coverage is limited to around 10% of UK premises across more than 150 towns, following its 2026 merger with sister altnet Brsk. Netomnia is actively expanding in cities including Liverpool, where BroadbandPicker&apos;s <Link href="/postcode/l1">L1 broadband deals guide</Link> covers its confirmed rollout in more depth; check the exact address, since coverage varies street by street rather than area by area.</p>

        <h2>Rolling monthly vs a 12-month contract</h2>
        <p>Some people ask for rolling monthly broadband when what they actually need is just a shorter fixed contract. A 12-month term can be the smarter middle ground, lowering the monthly cost while still avoiding the longest 24-month lock-in. Hyperoptic, Community Fibre and Onestream all currently offer a 12-month option alongside their standard 24-month term, a real, moderate-flexibility alternative to YouFibre&apos;s more expensive rolling plan.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Option', 'Best for', 'Trade-off'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Rolling monthly (YouFibre)', 'Maximum flexibility, 30 days’ notice', 'A genuine price premium over its own 24-month rate'],
                ['12-month contract (Hyperoptic, Community Fibre, Onestream)', 'Lower cost with moderate flexibility', 'Still a minimum-term commitment'],
                ['18 to 24 months', 'Lowest mainstream promotional pricing', 'Least flexible if plans change'],
              ].map(([option, fit, tradeoff]) => (
                <tr key={option} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{option}</td>
                  <td className="px-4 py-3 text-slate-700">{fit}</td>
                  <td className="px-4 py-3 text-slate-600">{tradeoff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Why NOW Broadband is no longer a flexible-contract option</h2>
        <p>NOW Broadband used to be a common recommendation here specifically for its shorter, more flexible contract positioning. That is no longer accurate: every current NOW Broadband package is sold on a standard 24-month term, the same length as its parent brand Sky and most other national providers. Anyone specifically drawn to NOW for flexibility should look at YouFibre&apos;s rolling option or a 12-month altnet contract instead.</p>

        <h2>Social tariffs are often on shorter or no-exit-fee terms</h2>
        <p>Several broadband social tariffs, available to households receiving qualifying means-tested benefits, are structured as no-contract or short-contract products with no early exit fees, a genuine additional flexibility benefit alongside their much lower price. This is worth checking specifically for eligible households that want both a lower bill and less lock-in.</p>

        <h2>What to watch out for</h2>
        <ul>
          <li>Higher monthly pricing can erase the value of flexibility if the actual stay ends up being longer than expected</li>
          <li>Monthly or short-term contracts are not always the fastest or most feature-rich packages available at an address</li>
          <li>Availability matters a lot, especially for full fibre on a short-term basis, since coverage for genuinely flexible providers like YouFibre remains limited</li>
          <li>Equipment must usually still be returned promptly when leaving, regardless of contract length</li>
        </ul>

        <h2>The best rule of thumb</h2>
        <p>If a stay of under a year is expected, flexibility matters enough that YouFibre&apos;s rolling option or a 12-month altnet contract becomes genuinely worth the extra cost. If a longer stay is likely, a cheaper 24-month fixed-term deal usually wins on total value.</p>
      </>
    ),
    faqs: [
      { question: 'What is the best rolling monthly broadband deal in the UK?', answer: 'YouFibre is one of the few providers offering a genuine rolling monthly contract, from £33.99 a month with 30 days\' notice to cancel, though coverage is limited to around 10% of UK premises. NOW Broadband no longer offers flexible contracts; every current package is a standard 24-month term.' },
      { question: 'Is rolling monthly broadband more expensive?', answer: 'Yes. YouFibre\'s rolling monthly price is a genuine premium over its own 24-month rate for the equivalent speed tier, which is why rolling makes most sense specifically when plans may change within the year rather than as a default choice.' },
      { question: 'Should I choose rolling monthly or a 12-month broadband contract?', answer: 'Choose rolling monthly if maximum flexibility is the priority and YouFibre covers the address. Choose a 12-month contract with Hyperoptic, Community Fibre or Onestream if some flexibility is wanted without paying the full premium of a truly monthly arrangement.' },
      { question: 'Does NOW Broadband still offer flexible contracts?', answer: 'No. Every current NOW Broadband package is sold on a standard 24-month term, the same as its parent brand Sky. Its earlier reputation for shorter, more flexible contracts no longer reflects the current range.' },
      { question: 'Who benefits most from flexible broadband?', answer: 'Renters, people moving again within the year, short-stay households, and anyone waiting for a better network option to become available at their address benefit most from a genuinely flexible contract.' },
    ],
  },

  'full-fibre-broadband-explained': {
    body: (
      <>
        <p>Full fibre broadband, technically known as <strong>Fibre to the Premises (FTTP)</strong>, is the fastest, most reliable home broadband technology available in the UK. Unlike standard &ldquo;fibre&rdquo; broadband, which uses copper wiring between the street cabinet and the home, full fibre uses optical fibre all the way from the exchange to the front door, and by Spring 2026 it had reached 82% of UK premises.</p>
        <h2>FTTP vs FTTC: what&apos;s the difference?</h2>
        <p><strong>FTTC (Fibre to the Cabinet)</strong> is still common across the UK. It runs fibre optic cable to the green street cabinet, then uses older copper telephone wire for the final stretch to the home. This limits maximum realistic speeds to around 80 Mbps download, and upload is typically only a fraction of that.</p>
        <p><strong>FTTP (Fibre to the Premises)</strong> runs fibre optic cable all the way to the home, with no copper in the line at all. Speeds have moved well beyond the old 1,000 Mbps (1 Gbps) benchmark: most national providers now offer a flagship tier around 900 Mbps to 1 Gbps, while several altnets go considerably further, Community Fibre up to 3,000 Mbps and YouFibre up to 8,000 Mbps on their fastest current tiers, both genuinely symmetrical.</p>
        <h2>Is full fibre available at my address?</h2>
        <p>Ofcom&apos;s Spring 2026 Connected Nations data put gigabit-capable coverage at 89% of UK premises, 27.1 million homes, up from 87% a year earlier, with full fibre specifically now reaching 82%. Coverage is uneven by area though: 93% in urban areas against 66% in rural areas, so a national average tells only part of the story for any specific address. Openreach, which builds and maintains the network used by BT, Sky, EE, TalkTalk and Plusnet, continues to expand its rollout, and altnets including Hyperoptic, Community Fibre, toob and YouFibre are building entirely separate FTTP networks in specific towns and cities on top of that. Rollout is not always purely additive, though: BroadbandPicker&apos;s <Link href="/postcode/sg1">SG1 broadband deals guide</Link> covers a genuine, reported case in Stevenage where Openreach paused full-fibre installations in streets with difficult ducting, causing coverage to fall rather than rise.</p>
        <p>To check if FTTP is available at a specific address, enter the postcode into our postcode checker.</p>
        <h2>Is full fibre worth paying more for?</h2>
        <p>Often yes, and increasingly it does not mean paying much more at all. Community Fibre&apos;s entry full-fibre tier starts from £12.50 a month, cheaper than many FTTC packages, though its network remains limited to London, Surrey and Sussex. Full fibre is worth prioritising specifically for:</p>
        <ul>
          <li>Three or more people working, streaming or gaming simultaneously</li>
          <li>Regular video calls that need a stable, fast upload speed, not just download</li>
          <li>Uploading large files regularly, such as photographers, videographers or content creators</li>
          <li>Wanting genuinely symmetrical upload speeds for backups and cloud services, which several full-fibre altnets, including Community Fibre, Hyperoptic and Trooli, now offer on most or all tiers</li>
        </ul>
        <h2>Full fibre and the landline switch-off</h2>
        <p>Full fibre connections are also the natural home for Digital Voice, the internet-based phone service replacing the UK&apos;s old analogue landline network, which is being fully retired by 31 January 2027. A full-fibre line delivers Digital Voice more reliably than an older FTTC or ADSL connection, though it still depends on the broadband router rather than a separately powered copper line, so it will not work in a power cut without a backup solution meeting Ofcom&apos;s minimum one-hour requirement. Our <Link href="/guides/landline-switch-off-explained-uk">landline switch-off explainer</Link> covers the deadline, telecare checks and emergency-calling backup.</p>
        <h2>Will an engineer visit be needed?</h2>
        <p>Usually yes, if the property has not previously had FTTP installed. This requires a new optical fibre cable to be run into the property, typically a 2 to 4 hour appointment. Most providers include the installation cost as part of the standard deal, though a separate setup fee can still apply on some packages regardless of whether an engineer visit is needed.</p>
      </>
    ),
    faqs: [
      { question: 'What is the difference between full fibre and superfast broadband?', answer: 'Superfast broadband (FTTC) uses fibre to the street cabinet and copper to the home, giving speeds up to around 80 Mbps. Full fibre (FTTP) uses fibre all the way to the property, enabling speeds from 100 Mbps up to several thousand Mbps on the fastest current altnet tiers.' },
      { question: 'How fast is full fibre broadband?', answer: 'Full fibre (FTTP) packages in the UK typically range from 100 Mbps up to a national-provider flagship tier around 900 Mbps to 1 Gbps, with some altnets now offering considerably more: Community Fibre up to 3,000 Mbps and YouFibre up to 8,000 Mbps on their fastest tiers, both genuinely symmetrical.' },
      { question: 'Does full fibre require a new router?', answer: 'Yes. The provider sends a new router compatible with the FTTP connection, and an Optical Network Terminal (ONT) box is installed at the property, which the router plugs into.' },
      { question: 'What percentage of the UK has full fibre broadband?', answer: 'Ofcom\'s Spring 2026 Connected Nations data put full-fibre coverage at 82% of UK premises, and gigabit-capable coverage more broadly at 89%. Coverage is uneven by area: 93% in urban areas against 66% in rural areas.' },
    ],
  },

  'broadband-speeds-explained': {
    body: (
      <>
        <p>Broadband speeds are measured in <strong>Megabits per second (Mbps)</strong> or, for the very fastest connections, <strong>Gigabits per second (Gbps)</strong>. The higher the number, the faster data travels between the internet and your device.</p>
        <p>If you are comparing results with an encrypted connection active, use our guide to <Link href="/guides/does-a-vpn-slow-your-internet">VPN speed loss and paired testing</Link> before assuming the broadband line is at fault.</p>
        <h2>Download speed vs upload speed</h2>
        <p><strong>Download speed</strong> is how quickly data comes from the internet to your device. This affects streaming, web browsing, downloading files, and loading video calls.</p>
        <p><strong>Upload speed</strong> is how quickly data goes from your device to the internet. This affects video calls, cloud backups, uploading photos, and live streaming.</p>
        <p>Most broadband packages have much higher download speeds than upload speeds. Full-fibre (FTTP) packages are the exception, and several altnets now go well beyond simply matching the two: Community Fibre offers up to 3,000 Mbps symmetrical on its fastest tier, and YouFibre up to 8,000 Mbps, both with upload matching download exactly.</p>
        <h2>The UK&apos;s "average speed" is higher than what most people actually get</h2>
        <p>Ofcom&apos;s Connected Nations data recorded the average maximum available download speed at 285 Mbps, up nearly 30% from 223 Mbps the year before, driven by the rapid rollout of gigabit-capable full fibre. This figure describes what is technically available, not what a typical household experiences day to day: the median speed actually delivered on FTTC connections specifically is closer to 80 to 100 Mbps, since the national average is pulled upward by full-fibre connections capable of far higher speeds. When comparing a package against "the UK average," check whether the figure describes availability or actual delivered speed, since the two can differ substantially.</p>
        <h2>What broadband speed do you actually need?</h2>
        <p>Do not confuse broadband speed with the wireless link inside the home. Our <Link href="/guides/wifi-7-explained-uk">Wi-Fi 7 explained guide</Link> shows when a newer router can remove a local bottleneck and when the incoming package remains the limit. For a household sizing of 100, 150 and 300 Mbps, including upload, cloud backup and always-on clients, use <Link href="/guides/what-broadband-speed-do-i-need">what broadband speed do I need</Link>.</p>
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
        <p>Advertised speeds are &ldquo;up to&rdquo; figures. Actual speed depends on the technology (FTTC, FTTP, Cable), how far the property is from the exchange or cabinet (for FTTC), the time of day, home wiring and router placement. FTTC and cable connections also share capacity with other properties on the same street cabinet or node, so speed can dip during peak evening hours, roughly 7pm to 10pm, when many nearby homes are online at once. Full fibre (FTTP) is far less affected by this specific problem, since each property has its own dedicated fibre line rather than a shared one.</p>
        <p>Under Ofcom rules, providers must tell you the minimum guaranteed speed you can expect before you sign up. If you consistently receive below this, you have the right to exit your contract without penalty.</p>
        <h2>What is latency?</h2>
        <p>Latency (or ping) is the delay in milliseconds between sending a request and receiving a response. For gaming and video calls, low latency (under 30ms) is more important than raw speed. Full-fibre connections typically deliver much lower latency than FTTC or ADSL.</p>
      </>
    ),
    faqs: [
      { question: 'Is 100 Mbps broadband fast?', answer: 'Yes — 100 Mbps is more than sufficient for most UK households. It supports multiple 4K streams, video calls, gaming, and general browsing simultaneously without issues.' },
      { question: 'What does Mbps mean?', answer: 'Mbps stands for Megabits per second. It\'s a measure of data transfer speed. 1,000 Mbps = 1 Gbps (Gigabit). To download a 1GB file at 100 Mbps takes approximately 80 seconds.' },
      { question: 'Why is my broadband slower than advertised?', answer: 'Advertised speeds are "up to" figures. For FTTC, actual speed depends heavily on your distance from the street cabinet — the further away you are, the slower your speed. Wi-Fi can also reduce speeds compared to a wired connection.' },
      { question: 'What is the average UK broadband speed?', answer: 'Ofcom recorded the average maximum available download speed at 285 Mbps, up nearly 30% from 223 Mbps the year before. This describes what is technically available, not what most households experience: the median speed actually delivered on FTTC connections specifically is closer to 80 to 100 Mbps.' },
      { question: 'Why does my broadband slow down in the evening specifically?', answer: 'FTTC and cable connections share capacity with other properties on the same street cabinet or node, so speed can dip during peak hours, roughly 7pm to 10pm, when many homes are online at once. Full fibre (FTTP) is far less affected, since each property has its own dedicated fibre line.' },
    ],
  },

  'does-a-vpn-slow-your-internet': {
    body: (
      <>
        <p><strong>Yes, a VPN normally slows your internet slightly.</strong> It encrypts data on your device, carries that traffic to a VPN server and only then sends it towards the website or app. The return journey follows the same extra route. That usually lowers download and upload throughput, while the extra travel and processing can raise latency, also called ping. A controlled paired test lets you measure your own loss.</p>
        <p>There is no honest universal percentage for VPN speed loss. The result changes with the starting connection, VPN protocol, server distance and load, device processor, Wi-Fi quality and destination. Top10VPN reported about 7% average loss to nearby servers and 16% over longer distances in its own tests, but those figures describe its method and test set, not a promise for every UK home. Measure your own connection before deciding that a result is normal.</p>

        <h2>How much does a VPN slow broadband?</h2>
        <p>A small reduction is common on a good service connected to a nearby UK server. A much larger fall can occur when the server is distant or busy, the device struggles with encryption, a work VPN routes traffic through a remote office, or weak Wi-Fi was already limiting the connection. A speed change matters only in context: losing 10% from 500 Mbps is unlikely to affect ordinary browsing, while the same proportion on a 15 Mbps line leaves far less room for calls and streaming.</p>
        <div className="overflow-x-auto" role="region" aria-label="VPN speed loss interpretation table" tabIndex={0}>
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead><tr className="bg-slate-50">{['Paired test result', 'What it suggests', 'Next check'].map((heading) => <th key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold">{heading}</th>)}</tr></thead>
            <tbody>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Little practical change</td><td className="border border-slate-200 px-4 py-3">The VPN is not the current bottleneck.</td><td className="border border-slate-200 px-4 py-3">Keep the nearby server and record the protocol.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Download falls, ping stays similar</td><td className="border border-slate-200 px-4 py-3">Server capacity, protocol overhead or device processing may limit throughput.</td><td className="border border-slate-200 px-4 py-3">Change protocol, then try another nearby server.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Ping rises sharply</td><td className="border border-slate-200 px-4 py-3">The VPN route is probably longer or inefficient.</td><td className="border border-slate-200 px-4 py-3">Choose the nearest suitable exit location.</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Both tests are slow</td><td className="border border-slate-200 px-4 py-3">The base broadband or home network may be the main problem.</td><td className="border border-slate-200 px-4 py-3">Test over Ethernet and compare with the provider estimate.</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Why is my VPN slow?</h2>
        <p><strong>Server distance is often the first cause to check.</strong> A London user connecting through New York sends every request across the Atlantic before it reaches its destination. A nearby London, Manchester or European server usually shortens that path. The closest server is not guaranteed to be fastest, however, because congestion and the VPN operator&apos;s network links also matter.</p>
        <p><strong>Protocol choice changes the amount of processing and packet overhead.</strong> Many consumer apps offer a modern UDP-based protocol such as WireGuard or a provider-specific option, alongside OpenVPN and sometimes IKEv2. Use the app&apos;s recommended or automatic setting first. A workplace VPN may be fixed by an administrator, so do not weaken or replace its security settings simply to improve a speed test.</p>
        <p><strong>The device or router can become the ceiling.</strong> Encrypting a fast full-fibre connection demands processing power. An older phone, laptop or VPN-enabled router may top out well below the broadband line rate even when the VPN server has spare capacity. Test another capable device on the same connection before blaming the line.</p>
        <p>Where the VPN runs also matters. An app on a recent laptop encrypts only that device&apos;s traffic, while a VPN configured on the home router may process traffic for every connected device. Compare one device with the VPN app against the router-wide setup. If the app is faster under otherwise identical conditions, the router&apos;s processor or VPN implementation is the more likely limit.</p>
        <p><strong>Wi-Fi problems remain Wi-Fi problems.</strong> A VPN does not repair interference, poor router placement or a weak signal in one room. If both VPN-on and VPN-off results improve beside the router or over Ethernet, fix the home network first. Our <Link href="/guides/broadband-speeds-explained">broadband speeds guide</Link> separates line speed, Wi-Fi speed and latency.</p>

        <h2>VPN vs no VPN speed test: a fair six-step method</h2>
        <ol>
          <li><strong>Use one device and one test service.</strong> Connect over Ethernet where practical, or stay in the same place on the same Wi-Fi band.</li>
          <li><strong>Pause competing traffic.</strong> Stop downloads, cloud backups, streaming and console updates elsewhere in the home.</li>
          <li><strong>Record the baseline.</strong> Turn the VPN off and run our <Link href="/tools/speed-test">broadband speed test</Link> three times. Note the median download, upload and ping rather than keeping only the best result.</li>
          <li><strong>Connect nearby.</strong> Turn the VPN on, choose a nearby UK server and repeat three tests against the same speed-test endpoint.</li>
          <li><strong>Calculate the loss.</strong> Use <code>((off speed - on speed) / off speed) × 100</code>. For example, 100 Mbps off and 82 Mbps on is an 18% download loss.</li>
          <li><strong>Change one factor at a time.</strong> Try a second nearby server, then another supported protocol. If everything changes at once, the result cannot identify the cause.</li>
        </ol>
        <p>Also compare ping in milliseconds. Download throughput shows how quickly a large transfer arrives; ping shows delay and often matters more for gaming, remote desktop and live calls. Save the date, device, protocol, server location and connection type so a later test is genuinely comparable.</p>

        <h2>How to make a VPN faster</h2>
        <ul>
          <li><strong>Select a nearby, lightly loaded server.</strong> If the app displays load, compare two nearby choices rather than repeatedly reconnecting at random.</li>
          <li><strong>Use the recommended modern protocol.</strong> Test only protocols supported by the official app and keep the app and operating system updated.</li>
          <li><strong>Remove the local bottleneck.</strong> Use Ethernet for a desktop or move closer to the router before assessing the VPN.</li>
          <li><strong>Restart the app and device.</strong> A stuck process or stale network state can produce a one-off poor result.</li>
          <li><strong>Check device limits.</strong> Compare another recent device. Router-wide VPN use can be slower than an app because some routers have limited processors.</li>
          <li><strong>Ask the workplace administrator.</strong> Corporate VPN routing and security controls are managed choices. Report measured times, server or gateway details and the business task affected.</li>
        </ul>
        <p>Split tunnelling sends selected apps outside the VPN and can reduce load or keep a call or game on the direct route. It is not a free performance switch: excluded apps lose protection from that tunnel. The NCSC also warns that split tunnelling can undermine monitoring or expose sensitive traffic when configured poorly. Follow workplace policy and keep protected work traffic inside the approved connection.</p>

        <h2>Can a VPN make internet faster?</h2>
        <p>A VPN cannot raise the physical capacity of your broadband line. It can occasionally improve performance to one service if the normal internet route is poor or if traffic is being selectively throttled, because the encrypted tunnel changes what the access network can see and where the traffic travels. Cloudflare describes this as a specific exception, not the usual result. A one-off faster test may also be normal measurement variation, so repeat paired tests before drawing a conclusion.</p>

        <h2>Is the VPN or broadband connection at fault?</h2>
        <p>Turn the VPN off and test first. If the baseline is also poor, check Ethernet, Wi-Fi signal, other household traffic and the address-specific speed estimate from the broadband provider. Ofcom says providers signed to its speed code must give an expected range and help when speeds fall significantly below it. Keep repeated wired results if you need to report a line problem.</p>
        <p>If only the VPN-on result is poor, try a second nearby server and supported protocol, then another device. Consistent poor performance across devices points more strongly to the VPN service, gateway or route. Poor performance only on a work VPN should go to the employer&apos;s IT team; the broadband provider cannot normally change how a corporate gateway is configured.</p>

        <h2>What to do next</h2>
        <p>Run the paired test before paying for faster broadband or replacing a VPN. Keep the current setup if the VPN-on result supports the actual task and ping remains acceptable. If the baseline itself is inadequate, compare the measured result with your provider&apos;s estimate and use our <Link href="/compare">UK broadband comparison</Link> only after checking the line and Wi-Fi. If the VPN alone is the limit, test its supported servers and protocols or contact its support team with the recorded evidence.</p>
      </>
    ),
    faqs: [
      { question: 'Does a VPN slow down your internet?', answer: 'Yes, a VPN usually reduces internet speed slightly and can increase ping because it encrypts traffic and routes it through an additional server. The size of the change depends on the server distance and load, protocol, device and original connection. A nearby server on a good service may feel unchanged, while a distant or congested route can be much slower.' },
      { question: 'How much does a VPN slow broadband?', answer: 'There is no universal VPN speed-loss figure. Top10VPN reported roughly 7% loss to nearby servers and 16% on longer routes in its own tests, but your result may differ substantially. Run three tests with the VPN off and three with a nearby UK server on, using the same device and test endpoint, then compare the median results.' },
      { question: 'Why is my VPN suddenly slow?', answer: 'A previously fast VPN can slow because its server is busy, the route has changed, the app selected another protocol, the device is overloaded or the underlying Wi-Fi or broadband has deteriorated. Test with the VPN off first, then try another nearby server and restart the app. Change one factor at a time so the comparison identifies the likely cause.' },
      { question: 'Which VPN settings are fastest?', answer: 'Start with the VPN app’s automatic or recommended protocol and a nearby, lightly loaded server. Modern UDP-based protocols are often efficient, but availability and names differ between providers. Do not disable encryption or alter a workplace VPN’s managed security settings for speed. Compare supported protocols with paired tests and keep the setting that performs reliably for your connection.' },
      { question: 'Can a VPN improve gaming ping?', answer: 'Usually not, because the VPN adds another server and route, which tends to increase latency. It can occasionally improve ping when the ordinary route to a particular game server is inefficient, but that is an exception. Test the same game region with the VPN off and with a nearby server on, and compare repeat results rather than relying on one speed test.' },
      { question: 'Does a VPN slow other devices on my Wi-Fi?', answer: 'A VPN app on one device normally routes only that device’s traffic. Other devices are affected only indirectly if the VPN device is using much of the shared broadband capacity. A VPN configured on the router can carry traffic for every connected device and the router’s processor may limit total speed. Check where the VPN is installed before diagnosing a whole-home slowdown.' },
      { question: 'Should I use split tunnelling to improve VPN speed?', answer: 'Split tunnelling can send selected high-bandwidth or latency-sensitive apps over the direct internet connection, reducing traffic through the VPN. Those excluded apps no longer receive protection from that tunnel, and the NCSC warns that poor configuration can expose sensitive traffic or weaken workplace monitoring. Use it only where the VPN provider supports it and organisational policy permits it.' },
    ],
  },

  'cheapest-broadband-uk': {
    body: (
      <>
        <p>The genuinely cheapest full-fibre broadband in the UK right now is Community Fibre&apos;s Essential 35 at £12.50 a month, where its network reaches. Among providers available nationwide, Plusnet and toob-style regional altnets undercut the well-known budget names, and NOW Broadband, often assumed to be the cheapest option, has moved to £23 a month for a usable speed. &ldquo;Cheapest&rdquo; also is not always &ldquo;best value&rdquo;: compare the total cost over the contract term, not just the first month&apos;s bill.</p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Price check:</strong> every price below was checked against official provider sources on 24 August 2026. Prices and availability vary by address; confirm the live figure at checkout.
          </p>
        </div>

        <h2>The cheapest broadband deals in the UK right now</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'From', 'Speed', 'Coverage'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Community Fibre', '£12.50/mo', '35 Mbps symmetrical full fibre', 'London, Surrey, Sussex only'],
                ['toob', '£18.00/mo', '150 Mbps symmetrical full fibre', 'Parts of Hampshire, Dorset, Surrey, Sussex, Berkshire'],
                ['Hyperoptic', '£19.00/mo', '150 Mbps symmetrical full fibre', 'London and other major UK cities, flats and blocks'],
                ['Trooli', '£19.99/mo', '150 Mbps full fibre', 'Parts of South East England and Scotland'],
                ['Plusnet', '£21.99/mo', '74 Mbps full fibre', 'Nationwide, Openreach'],
                ['Zzoomm', 'From £22/mo', '200 Mbps symmetrical full fibre (£26 from month 13)', 'Around 110 English market towns'],
                ['EE', '£22.99/mo', '100 Mbps full fibre', 'Nationwide, Openreach'],
                ['NOW Broadband', 'From £23/mo', '80 Mbps full fibre', 'Nationwide, Openreach'],
                ['Sky / Vodafone', 'From £23/mo', 'Full fibre (Sky £23 in our last check; Vodafone £24 on 16 Oct 2026)', 'Nationwide, Openreach'],
                ['BT', '£28.99/mo', '36 Mbps part fibre (Full Fibre 300 from £30.99)', 'Nationwide, Openreach, widest coverage'],
              ].map(([provider, price, speed, coverage]) => (
                <tr key={provider} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{provider}</td>
                  <td className="px-4 py-3 text-slate-700">{price}</td>
                  <td className="px-4 py-3 text-slate-700">{speed}</td>
                  <td className="px-4 py-3 text-slate-600">{coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Full reviews: <Link href="/providers/community-fibre">Community Fibre</Link>, <Link href="/providers/toob">toob</Link>,{' '}
          <Link href="/providers/trooli">Trooli</Link>, <Link href="/providers/zzoomm">Zzoomm</Link>,{' '}
          <Link href="/providers/hyperoptic">Hyperoptic</Link>, <Link href="/providers/plusnet">Plusnet</Link>,{' '}
          <Link href="/providers/ee">EE</Link>, <Link href="/providers/now-broadband">NOW Broadband</Link>,{' '}
          <Link href="/providers/bt">BT</Link>, <Link href="/providers/sky">Sky</Link> and <Link href="/providers/vodafone">Vodafone</Link>.
        </p>

        <h2>Community Fibre: the genuinely cheapest full-fibre deal, if it reaches you</h2>
        <p>Community Fibre&apos;s Essential 35 package, £12.50 a month for 35 Mbps symmetrical, is the lowest full-fibre price of any provider covered on this site, and it comes from a provider with one of the strongest customer-satisfaction records in the UK: around 4.7 out of 5 on Trustpilot and 92% customer satisfaction in Ofcom&apos;s 2025 data. The catch is coverage: this is a London-centred network with only recent, partial expansion into Surrey and Sussex, so it simply is not available to most UK addresses.</p>

        <h2>toob: the cheapest symmetrical full fibre, where it reaches</h2>
        <p>toob&apos;s entry home150 package, £18 a month for 150 Mbps symmetrical on a 24-month contract (checked 16 October 2026), undercuts every national Openreach reseller on this page while including a WiFi 7 router; its price rises by just £2 a month each April. It began in Southampton, where BroadbandPicker&apos;s <Link href="/postcode/so14">SO14 broadband deals guide</Link> covers district-level Ofcom coverage and toob&apos;s own network story in more depth, and has since expanded to around 290,000 premises across 29 towns in Hampshire, Dorset, Surrey, Sussex and Berkshire. As with Community Fibre, this is a regional network, so check the exact address before assuming coverage. toob has also recently arrived in the West Midlands, partnered with CityFibre; BroadbandPicker&apos;s <Link href="/postcode/cv1">CV1 broadband deals guide</Link> covers what that means for Coventry specifically. toob confirmed a launch on CityFibre&apos;s network in Leicester in October 2024; BroadbandPicker&apos;s <Link href="/postcode/le1">LE1 broadband deals guide</Link> covers what that means locally.</p>

        <h2>NOW Broadband: not as cheap as its reputation suggests</h2>
        <p>NOW Broadband, part of the Sky group, is widely assumed to be the default cheapest option, and it was, historically. Its current entry-level Brilliant Broadband package runs on older, slower ADSL-style technology, and its more usable Full Fibre 75 package starts from £23 a month on a 24-month contract, not meaningfully cheaper than Plusnet or EE&apos;s full-fibre entry tiers. Its Trustpilot score sits around 1.2 out of 5 from over 14,000 reviews, with reviews commonly citing long activation waits and slow support. Check the actual current price before assuming NOW is automatically the cheapest option; it frequently is not.</p>

        <h2>Social tariffs: the cheapest broadband most eligible households have never claimed</h2>
        <p>If you or someone in your household receives Universal Credit or certain other means-tested benefits, a social tariff is very likely the cheapest genuinely reliable broadband available, and it is not subject to the mid-contract price rises standard contracts now carry. Ofcom estimates around 4.2 million UK households are eligible, yet only around 532,000 were actually taking up a social tariff as of its most recent published data, a large, well-documented gap between eligibility and uptake.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Tariff', 'Price', 'Speed', 'Note'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Virgin Media Essential Broadband', '£12.50/mo', '15 Mbps', 'Cable network, no phone line needed'],
                ['BT Home Essentials', '£15/mo or £20/mo', '36 Mbps or 67 Mbps', 'Faster tier is the quickest widely available social tariff'],
                ['Sky Broadband Basics', '£20/mo', '36 Mbps', 'Existing Sky customers only'],
                ['Community Fibre social tariff', 'Exempt from standard pricing', '35 Mbps', 'London, Surrey, Sussex only'],
                ['Hyperoptic Essential', '£15 or £20/mo', '50 or 150 Mbps', 'No fixed contract'],
              ].map(([tariff, price, speed, note]) => (
                <tr key={tariff} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{tariff}</td>
                  <td className="px-4 py-3 text-slate-700">{price}</td>
                  <td className="px-4 py-3 text-slate-700">{speed}</td>
                  <td className="px-4 py-3 text-slate-600">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Social tariffs typically run on rolling monthly terms with no exit fee, so there is little downside to switching to one if eligible, even as a temporary measure. Read our full <Link href="/guides/broadband-social-tariffs-uk">guide to broadband social tariffs</Link> for eligibility and how to apply with each provider.</p>

        <h2>How to get an even cheaper deal</h2>
        <ul>
          <li><strong>Negotiate with your current provider.</strong> Call and ask if they can match a competitor&apos;s advertised price; retention teams often have unpublished offers not shown on the public website.</li>
          <li><strong>Check for cashback or a reward card.</strong> Several providers currently attach rewards to selected offers, but only a successful claim lowers the real cost. Use our <Link href="/guides/broadband-deals-with-cashback">cashback broadband deals guide and comparison</Link> before treating a card as part of the saving.</li>
          <li><strong>Switch once you are out of contract.</strong> New-customer pricing is almost always better than what an existing, out-of-contract customer is quietly paying.</li>
          <li><strong>Check whether a local altnet has launched since you last looked.</strong> Community Fibre, toob, Trooli and Zzoomm have all expanded meaningfully in 2026; a postcode that had no altnet option a year ago may have one now.</li>
          <li><strong>Check if a TV bundle actually works out cheaper.</strong> If you already pay for streaming or pay-TV separately, a combined package can undercut buying broadband and entertainment apart. See our <Link href="/guides/best-broadband-and-tv-deals">broadband and TV deals comparison</Link>.</li>
        </ul>

        <h2>Watch out for scheduled price rises</h2>
        <p>Since Ofcom banned inflation-linked, percentage-based price rise terms in all new contracts from 17 January 2025, every major national provider now discloses a flat, pounds-and-pence rise upfront instead, typically £3 to £4 a month each year. BT, EE, Vodafone and Plusnet all currently apply this. Several altnets, including Community Fibre, Zzoomm, toob and Zen Internet, currently apply no scheduled rise at all on their published range, which can make a slightly higher headline price the actually cheaper option over a full contract term. Always add the disclosed rise to the headline price before comparing two deals.</p>
      </>
    ),
    faqs: [
      { question: 'What is the cheapest broadband in the UK right now?', answer: 'Community Fibre\'s Essential 35 at £12.50 a month is the cheapest full-fibre deal covered on this site, but it is only available in London, Surrey and Sussex. Among nationally available providers, Plusnet from £21.99 and EE from £22.99 currently undercut NOW Broadband, which has moved to £23 a month and is no longer the automatic cheapest option it once was.' },
      { question: 'Is NOW Broadband still the cheapest option?', answer: 'Not reliably. NOW Broadband\'s usable Full Fibre 75 package currently starts from £23 a month, similar to or more expensive than Plusnet or EE\'s entry-level full-fibre tiers. Its cheapest Brilliant Broadband package uses older, slower ADSL-style technology rather than full fibre.' },
      { question: 'Are there cheap broadband deals for low-income households?', answer: 'Yes. Social tariffs are available from Virgin Media (£12.50/mo), BT Home Essentials (£15 or £20/mo), Sky Broadband Basics (£20/mo, existing customers only), and several full-fibre altnets, for households receiving Universal Credit or certain other benefits. Ofcom estimates 4.2 million households are eligible but only around 532,000 currently claim one.' },
      { question: 'Is cheap broadband reliable?', answer: 'Budget providers on the Openreach network, such as Plusnet and EE, use the same physical lines as premium providers like BT, so line quality is not the differentiator. The real differences are customer service response times, contract price-rise policy and router quality.' },
      { question: 'Does the cheapest broadband deal raise its price during the contract?', answer: 'Often, yes. Most national providers now apply a flat £3 to £4 a month rise each year, disclosed upfront. Several full-fibre altnets currently apply no scheduled rise at all, which can make them cheaper over a full contract even with a similar or slightly higher starting price.' },
    ],
  },

  'broadband-deals-under-20': {
    body: (
      <>
        <p>Broadband deals under <strong>£20 a month</strong> are still available in the UK, but the providers that reliably offer them have shifted. NOW Broadband and TalkTalk, long the default answer to this question, both now start above £20 a month on their current standard ranges; the genuine under-£20 segment in August 2026 is led by a different, mostly altnet-driven set of providers.</p>

        <h2>Real UK broadband deals under £20, August 2026</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'From', 'Contract', 'Coverage', 'Best for'].map(h => (
                  <th key={h} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Community Fibre', '£12.50/mo', '12 or 24 months', 'London, Surrey, Sussex', 'The cheapest full-fibre deal on this site'],
                ['toob', '£18.00/mo', '24 months', 'Southampton area, ~290,000 premises', '£2 a month rise each April'],
                ['Onestream', '£18.50/mo', '12 or 24 months', '94% of UK premises', 'Widest availability of any under-£20 option'],
                ['Hyperoptic', '£19.00/mo', '24 months', 'Selected buildings in London and other major cities', 'Symmetrical 150 Mbps; £4 rise each April'],
                ['Gigaclear', '£19.00/mo', '18 months', 'Selected rural areas (2%)', 'Symmetrical rural full fibre'],
                ['Trooli', '£19.99/mo', '24 months', 'Selected areas (1%)', 'Fast entry speed for the price'],
              ].map(([p, price, contract, coverage, best]) => (
                <tr key={p} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{p}</td>
                  <td className="px-4 py-3 font-bold text-sky-700">{price}</td>
                  <td className="px-4 py-3 text-slate-700">{contract}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{coverage}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">Prices checked against each provider&apos;s own current range, August 2026. All are full-fibre (FTTP) except where a provider offers a mixed range; coverage percentages are approximate and address-specific.</p>

        <h2>Why NOW Broadband and TalkTalk are no longer the obvious answer</h2>
        <p>NOW Broadband, owned by Sky, dropped its shorter, more flexible contract options and now starts from £23 a month on a standard 24-month term. TalkTalk&apos;s current range starts from £25 a month. Both remain reasonable options at their current prices, but neither is genuinely part of the sub-£20 segment any more, a real shift from their earlier budget positioning that older comparison content across the web, including this page&apos;s previous version, had not caught up with.</p>

        <h2>What broadband under £20 usually looks like now</h2>
        <p>Every current under-£20 option on this site is an altnet running its own full-fibre network rather than a national Openreach reseller, with the exception of Onestream, which sells over Openreach and is genuinely available to around 94% of UK premises, making it the most realistic under-£20 option for anyone outside a smaller altnet&apos;s footprint. Community Fibre, toob, Gigaclear and Trooli are all limited to specific towns, cities or regions, so availability must be checked at the exact address rather than assumed from a postcode area alone.</p>

        <h2>When paying slightly more is worth it</h2>
        <p>A deal at £21 to £25 a month can still be better value than one under £20 if it gives a meaningfully higher speed, no scheduled price rise, or a stronger complaints record. A reward can change the minimum-term total too, but our <Link href="/guides/broadband-deals-with-cashback">cashback broadband deals comparison</Link> shows why the calculation should also be run without it. A missed claim makes the card worth £0.</p>

        <h2>What to check before choosing a cheap deal</h2>
        <ul>
          <li>The total cost over the whole minimum term, not just the first monthly figure</li>
          <li>Whether a scheduled annual price rise applies, and how much it adds by year two</li>
          <li>Whether the contract is 12, 18 or 24 months long</li>
          <li>Whether the speed is actually enough for the household</li>
          <li>Whether the exact address is genuinely covered, not just the general town or postcode area</li>
        </ul>

        <h2>Who should target under-£20 broadband</h2>
        <p>This category suits one-person homes, small flats, budget-led households and users with light to moderate internet needs. Bigger homes should be more careful, because saving a few pounds a month is rarely worth it if the connection becomes frustrating every evening, and several of the genuinely cheapest current options have limited geographic coverage that rules them out for most UK addresses regardless of price.</p>
      </>
    ),
    faqs: [
      { question: 'Can you still get broadband under £20 in the UK?', answer: 'Yes, though the providers have changed. NOW Broadband and TalkTalk, long the default answer, now both start above £20 a month. The current genuine under-£20 segment is led by altnets: Community Fibre from £12.50 (12 months), toob from £18, Onestream from £18.50 and Hyperoptic from £19 (checked 16 October 2026), plus Gigaclear and Trooli in our earlier check.' },
      { question: 'Which provider has the best broadband deal under £20?', answer: 'Community Fibre is the cheapest at £12.50 a month, though limited to London, Surrey and Sussex. Onestream, from £18.50 a month, has by far the widest availability of any current under-£20 option at around 94% of UK premises, making it the most realistic pick for most households.' },
      { question: 'Is broadband under £20 good enough for streaming?', answer: 'For a small household with light to moderate streaming, yes. For larger homes with several people online at once, check the specific speed tier rather than assuming an entry-level plan will be enough, since several under-£20 options offer meaningfully different speeds.' },
      { question: 'Should I choose a broadband deal under £20 or pay a little more?', answer: 'Choose under £20 if the needs are modest, the provider genuinely covers the address, and the contract is sensible. Pay a little more, for example around £23 for Sky, if it meaningfully improves the complaints record, speed or contract terms.' },
    ],
  },

  'broadband-deals-with-cashback': {
    body: (
      <>
        <p><strong>Broadband deals with cashback are worthwhile only when the reward makes an already suitable package cheaper over its full minimum term.</strong> On 29 August 2026, independently listed BT broadband rewards ranged from £80 to £140, alongside £30 setup and scheduled £4-a-month rises. By 16 October 2026, BT&apos;s own deals page showed £0 activation and no reward card, which shows how quickly these offers change. Subtract the reward only after adding every contracted charge and only if you can meet the claim terms.</p>
        <p>We would choose a lower total contract cost over the largest gift card. Speed, address-level availability and contract flexibility still have to fit the household. A £140 card does not repair a slow connection, and a reward that expires before it is claimed has a value of £0.</p>

        <h2>How cashback broadband deals work</h2>
        <p>UK listings use “cashback” for several different incentives. Direct cashback is usually paid to a bank or cashback-site account. A reward card is a prepaid card with spending restrictions and an expiry date. A voucher works only with named retailers, while bill credit reduces future broadband bills. The cash value is not identical if you would not normally spend the voucher.</p>
        <p>Most promotions apply to selected packages and new online customers. The purchase route matters. EE’s current terms say partner or affiliate purchases do not qualify for its direct reward-card offer, the transaction must finish in one session, and the first bill must be paid. This is why the order confirmation and promotion terms should be saved before leaving checkout.</p>

        <h2>Cashback broadband deals checked in August 2026</h2>
        <p>Reward values change quickly and availability depends on the address. Finder’s table, checked on 29 August 2026, listed provider rewards from £50 to £200 before its separate member reward. Its examples included Quickline at £200, EE at £165, Plusnet at £160, BT at £140 and Sky at £120. These are snapshots, not universal offers across every package or sales route.</p>
        <div className="overflow-x-auto" role="region" aria-label="Examples of current broadband reward offers" tabIndex={0}>
          <table className="w-full min-w-[42rem] text-sm border-collapse">
            <thead><tr className="bg-slate-50">{['Example', 'Reward snapshot', 'Conditions to verify', 'Our reading'].map((heading) => <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">BT broadband</td><td className="border border-slate-200 px-4 py-3">£80 to £140 by tier</td><td className="border border-slate-200 px-4 py-3">Listed in August 2026; not shown on BT&apos;s deals page on 16 October 2026</td><td className="border border-slate-200 px-4 py-3">Strong reward, but scheduled rises remain part of the cost</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">EE broadband</td><td className="border border-slate-200 px-4 py-3">Up to £165 in Finder’s snapshot</td><td className="border border-slate-200 px-4 py-3">Selected direct online orders, first bill paid, 90-day claim window after verification</td><td className="border border-slate-200 px-4 py-3">Read the purchase-route restriction before using another affiliate</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Quickline</td><td className="border border-slate-200 px-4 py-3">Up to £200 in Finder’s snapshot</td><td className="border border-slate-200 px-4 py-3">Selected plan, local network coverage and promotion terms</td><td className="border border-slate-200 px-4 py-3">Largest listed provider reward, not the same as broad availability</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Lower-price deal</td><td className="border border-slate-200 px-4 py-3">No reward required</td><td className="border border-slate-200 px-4 py-3">Full monthly schedule, setup and speed</td><td className="border border-slate-200 px-4 py-3">Can win if its total cost is lower without a claim</td></tr>
            </tbody>
          </table>
        </div>

        <h2>How to judge the real value of an incentive</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Offer type', 'What it can do well', 'What to watch out for'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Cashback payment', 'Improves effective yearly cost', 'May require a claim window or validation step'],
                ['Gift card', 'Useful if you would spend there anyway', 'Can look bigger than the true broadband saving'],
                ['Bill credit', 'Simple and low-friction', 'Usually smaller headline value than gift-card promos'],
                ['Lower monthly price with no reward', 'Often the cleanest value proposition', 'Looks less exciting in ads even if total cost is better'],
              ].map(([type, benefit, caution]) => (
                <tr key={type} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{type}</td>
                  <td className="px-4 py-3 text-slate-700">{benefit}</td>
                  <td className="px-4 py-3 text-slate-600">{caution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>A real example: BT's reward card and the setup fee it offsets</h2>
        <p>Broadband Genie’s BT table, updated 21 August 2026, showed Full Fibre 150 at £23.99 a month, rising to £27.99 in March 2027 and £31.99 in March 2028, with £30 setup and a £100 card. Over 24 months, the displayed monthly schedule plus setup totals £685.76. Subtracting a successfully claimed £100 card gives £585.76, or £24.41 a month. Without the card, the same service costs £28.57 a month. BT has since changed its range: on 16 October 2026 its deals page showed £0 activation, no reward card and Full Fibre from £30.99, so use this as a worked method rather than a current price.</p>
        <p>The example explains why “£100 cashback” cannot be compared with the first monthly price alone. Ofcom requires contracted price rises to be displayed upfront in pounds and pence. Put each price period, setup charge and delivery fee into the total, then subtract only a reward you expect to receive and use.</p>

        <h2>How to claim a broadband reward without missing it</h2>
        <ol>
          <li><strong>Save the offer:</strong> keep the checkout page, terms, order confirmation, reward amount and closing date.</li>
          <li><strong>Check the route:</strong> confirm whether the promotion requires the provider site, comparison link or cashback site and whether other codes invalidate it.</li>
          <li><strong>Set two reminders:</strong> one after activation and one well before the claim deadline. Search spam folders for the reward administrator’s message.</li>
          <li><strong>Claim and activate:</strong> keep the claim confirmation and note the separate activation or spending expiry date.</li>
          <li><strong>Escalate promptly:</strong> contact the named card or promotion administrator with the order reference and first bill if the stated delivery period passes.</li>
        </ol>
        <p>BT says eligible customers claim after service activation, receive the digital card within 30 working days and must activate it within three months, then spend it within 12 months. EE’s published reward terms use a different process: delivery can take up to 140 days after activation and verified customers then have 90 days to claim. Follow the terms attached to your exact order, not a generic timetable.</p>

        <h2>When cashback deals are genuinely worth it</h2>
        <p>They make sense when the package is available at the address, meets the required speed, has an acceptable minimum term and remains cheaper after all scheduled rises. A prepaid Mastercard-style card is usually easier to value than a restricted shop voucher, but neither should be counted until eligibility and claim steps are clear.</p>
        <p>Cashback may also be a useful tie-breaker between otherwise similar offers. Check any exit-fee credit separately because it may require a final bill from the old provider and may reimburse only the proven charge rather than provide unrestricted spending money.</p>

        <h2>Cashback vs lower monthly price</h2>
        <p>Use this formula: every monthly payment during the minimum term, plus setup, activation and delivery charges, minus guaranteed bill credit and a reward you expect to claim. Divide that result by the contract months for the effective monthly cost. Our <Link href="/tools/broadband-cost-calculator">broadband cost calculator</Link> also calculates cost per Mbps, while the comparison above is designed for checking two reward scenarios side by side.</p>
        <p>Run the calculation twice, once with the reward and once without it. If a deal is poor value without the card, the claim process is carrying too much of the decision. Also compare <Link href="/guides/broadband-deals-with-no-setup-fee">broadband with no setup fee</Link> and <Link href="/guides/broadband-deals-with-no-mid-contract-price-rise">deals without a scheduled mid-contract rise</Link>, because avoiding a charge can beat receiving a delayed reward.</p>

        <h2>Common mistakes with broadband rewards</h2>
        <ul>
          <li>Comparing the reward with only the introductory monthly price rather than every scheduled payment.</li>
          <li>Assuming “cashback” means cash when the offer is a restricted prepaid card or retailer voucher.</li>
          <li>Missing a claim, activation or spending deadline after the broadband has gone live.</li>
          <li>Breaking affiliate tracking by changing route, using an unlisted code, blocking cookies or completing the order in another session.</li>
          <li>Choosing a slower, unavailable or inflexible package solely because its reward is larger.</li>
        </ul>

        <h2>The best rule of thumb</h2>
        <p>Start with the address-specific speed and full contract cost. Keep the reward in the calculation only where the exact order confirmation states eligibility and the claim process is realistic for you. If the reward deal still wins when calculated both with and without the incentive, it is a much safer choice than an offer whose value disappears after one missed email.</p>
      </>
    ),
    faqs: [
      { question: 'Are broadband cashback deals worth it?', answer: 'Broadband cashback deals are worth considering when the connection suits your address and the reward lowers the full minimum-term cost below comparable offers. Add every scheduled monthly payment and setup charge first, then subtract only a reward you can claim and use. Run the comparison without the reward too, because a missed deadline makes its effective value £0.' },
      { question: 'Is cashback better than a lower broadband monthly price?', answer: 'A lower monthly price is better when its full contract total remains below the reward deal after setup charges and scheduled rises. Compare every payment across the minimum term, then subtract the usable reward. A £4 monthly difference over 24 months is £96, so it can cancel most of a £100 card before setup fees are considered.' },
      { question: 'How do I claim cashback on a broadband deal?', answer: 'Save the promotion terms and order confirmation, then follow the route named for that exact offer after activation. BT says eligible customers claim through their BT account and receive a digital card within 30 working days. EE’s separate terms can allow up to 140 days before verified claim details arrive. Claim, activation and spending deadlines can all differ.' },
      { question: 'Which broadband providers offer gift cards or rewards?', answer: 'Finder’s UK table checked on 29 August 2026 listed selected rewards from Quickline, EE, Plusnet, BT, Sky, TalkTalk, Gigaclear, NOW Broadband, Rebel and Airband. Values ranged from £50 to £200 before Finder’s separate member incentive. Offers vary by package, address and purchase route, so verify the provider terms and order confirmation before relying on any amount.' },
      { question: 'How much is BT\'s broadband reward card worth?', answer: 'Broadband Genie listed BT broadband Reward Cards from £80 to £140 on 21 August 2026, but BT\'s own deals page showed no reward card on 16 October 2026. The £100 Full Fibre 150 example also had £30 setup and scheduled £4 monthly rises in 2027 and 2028. BT says eligible customers must claim, activate within three months of receipt and spend the digital card balance within 12 months.' },
      { question: 'Can I combine provider rewards with cashback websites?', answer: 'Do not assume rewards can be combined. EE’s published terms say its selected direct Reward Card promotion does not qualify on partner or affiliate purchases and cannot be combined with another voucher, discount or promotion code. Cashback-site and provider rules differ, so choose one tracked purchase route, save its terms and compare the net value before ordering.' },
    ],
  },

  'broadband-deals-with-no-setup-fee': {
    body: (
      <>
        <p>Broadband deals with <strong>no setup fee</strong> are attractive because they lower the upfront cost of switching, but they are not always the cheapest overall option. The smartest way to compare them is to look at the full contract cost, not just whether the activation charge is free.</p>

        <h2>Why no-setup-fee broadband matters</h2>
        <p>Upfront charges can make a deal feel more expensive than the monthly price suggests, especially if you are moving house, changing providers unexpectedly, or trying to keep switching costs low. For many households, removing a £30 to £35 setup fee is enough to make a mid-priced broadband deal more attractive than a slightly cheaper one with higher entry costs.</p>

        <h2>Providers that often stand out on no-setup-fee deals</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider type', 'Typical no-fee examples', 'Why people choose it'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Mainstream family option', 'Sky, EE', 'Lower-friction switching with recognisable brands, no setup cost on most current packages'],
                ['Budget-led option', 'TalkTalk, Plusnet', 'Keeps upfront cost low while still using major fixed-line networks'],
                ['Value full fibre option', 'Vodafone, Community Fibre, Hyperoptic', 'Useful when you want FTTP without a large activation bill'],
                ['Charges a setup fee on some plans', 'Gigaclear (£30 on 300Mbps), Cuckoo (£99 to £149), Virgin Media (£30 for an engineer)', 'Checked 16 October 2026; Virgin Media is free on QuickStart self-install, and BT now charges £0 online'],
              ].map(([type, examples, reason]) => (
                <tr key={type} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{type}</td>
                  <td className="px-4 py-3 text-slate-700">{examples}</td>
                  <td className="px-4 py-3 text-slate-600">{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Watch for a fee disguised as a credit</h2>
        <p>Not every non-zero upfront charge is a real cost. Some providers have used advance fees that are credited back to the first bill, or reward cards that offset a setup charge only if you claim them. Fees change often: on 16 October 2026, NOW showed £0 activation and £0 delivery, BT showed £0 activation online, and Virgin Media charged nothing for self-install but £30 for an engineer. Always check whether a fee is credited back automatically or needs an active claim.</p>

        <h2>When no setup fee is genuinely the better deal</h2>
        <p>A no-fee offer usually matters most when two packages are otherwise close in monthly price, or when you want to minimise the immediate cost of moving or switching. It is also useful for renters, students, and short-term households that are already wary of paying too much upfront.</p>

        <h2>When a setup fee can still be worth paying</h2>
        <p>Sometimes the better-value broadband package still comes with a setup fee. If the monthly price is lower, the contract is shorter, or the speed and reliability fit your home much better, paying a one-off activation charge can still be the smarter choice over 12 to 24 months.</p>

        <h2>What to check beyond the activation charge</h2>
        <ul>
          <li>The total cost across the whole contract</li>
          <li>Whether the provider also avoids delivery or router charges</li>
          <li>Whether the package speed is right for your household</li>
          <li>Whether the contract is shorter or longer than you need</li>
          <li>What the out-of-contract price becomes later</li>
        </ul>

        <h2>The best rule of thumb</h2>
        <p>Use no-setup-fee broadband as a value filter, not the only decision factor. It is a real advantage when deals are otherwise close, but it should not distract you from a better overall package that costs less across the full term.</p>
      </>
    ),
    faqs: [
      { question: 'Which broadband providers have no setup fee in the UK?', answer: 'On 16 October 2026, BT (online orders), NOW, Community Fibre, toob, Zzoomm, YouFibre, Pine Media and Connect Fibre showed no setup fee, and Virgin Media charged nothing for self-install. Gigaclear charged £30 on its 300Mbps plan and Cuckoo £99 to £149. Always check the exact live package before ordering.' },
      { question: 'Is no setup fee broadband always better value?', answer: 'Not always. A deal with a setup fee can still be better overall if the monthly price is lower or the package is a much better fit for your home.' },
      { question: 'Does NOW Broadband charge a setup fee?', answer: 'Not on current deals. NOW\'s broadband page showed a £0 activation fee and £0 delivery fee on 16 October 2026.' },
      { question: 'Who benefits most from no-setup-fee broadband deals?', answer: 'Renters, movers, students, and budget-conscious households usually benefit most because they care more about keeping upfront costs low during the switch.' },
    ],
  },

  'best-broadband-for-working-from-home': {
    body: (
      <>
        <p>Working from home puts different demands on broadband than casual home use. Video calls, file uploads, VPN connections and cloud-based software all require a reliable connection, and critically, a good <strong>upload speed</strong>, the figure most standard broadband marketing barely mentions.</p>
        <h2>What speed do you need for working from home?</h2>
        <p>For a single person working from home:</p>
        <ul>
          <li><strong>Minimum:</strong> 30 Mbps download, 10 Mbps upload</li>
          <li><strong>Recommended:</strong> 100+ Mbps download, 20+ Mbps upload</li>
          <li><strong>Ideal (multiple users):</strong> 300+ Mbps full fibre, ideally symmetrical</li>
        </ul>
        <p>Standard FTTC broadband, up to around 80 Mbps download but typically only 15 to 20 Mbps upload, is adequate for most single home workers doing email, browsing and occasional video calls. If large files are uploaded regularly, the connection is shared with others also working or studying at home, or latency-sensitive applications like remote desktop or VoIP calls are used daily, full fibre is worth the upgrade.</p>
        <h2>Why upload speed matters for home working</h2>
        <p>Most broadband plans advertise download speed prominently and upload speed in small print, but for working from home upload speed is equally important. Video calls on Zoom, Teams or Google Meet require continuous upload bandwidth: a single HD video call typically needs 3 to 4 Mbps of stable upload, and that adds up quickly with multiple people on calls in the same household at once. A slow or inconsistent upload speed is what makes a caller look choppy or freeze to everyone else on the call.</p>
        <p>Full fibre (FTTP) packages commonly offer genuinely symmetrical speeds, upload matching download, a significant advantage over FTTC, where upload is typically only around 20% of the download figure.</p>
        <h2>Real current prices for home-working-suitable broadband</h2>
        <p>Community Fibre offers genuinely symmetrical full fibre from £12.50 a month, the cheapest fully symmetrical option covered on this site, though coverage is limited to London, Surrey and Sussex. Hyperoptic, from £19 a month (checked 16 October 2026), offers symmetrical speeds, in selected apartment buildings and developments. Zen Internet, from £30 a month, includes a free static IP as standard on every plan along with a Contract Price Promise (no mid-contract price rise) and Which? Recommended Provider status with an 84% customer score, a genuinely strong pick for anyone who needs a fixed, predictable address for VPN configuration or remote access tools. BT, from £28.99 a month (checked 16 October 2026), remains the widest-coverage option at around 98% of UK premises for anyone outside an altnet&apos;s footprint.</p>
        <h2>When a business broadband line is worth considering</h2>
        <p>Freelancers, contractors and anyone running a small business from home should weigh a business-grade line against a standard residential package. Business broadband commonly includes a static IP as standard, a service-level agreement promising a faster fault-fix time, and sometimes an uncontended or prioritised connection that does not slow down as much during peak evening hours when nearby residential customers are also online. Vodafone Business starts from around £20 to £22 a month, a genuinely accessible entry point for a sole trader, while Zen Business and Sky Business both build in stronger support commitments for a modest premium over their residential equivalents. This is worth it specifically when downtime has a real cost, client calls cannot tolerate a dropped connection, or remote access to office systems needs a stable, known IP address; for most single home workers, a good residential full-fibre package is entirely sufficient.</p>
        <h2>Should you use Wi-Fi or a wired connection?</h2>
        <p>For serious home working, use a wired Ethernet connection directly from the router to a laptop or desktop. Wi-Fi introduces variability in speed and latency that can affect video calls and cloud applications, especially in a household with several devices competing for the same signal during the working day. If cabling is impractical, a powerline adapter or MoCA adapter can extend a wired connection through existing home wiring without running a new cable.</p>
        <div className="not-prose rounded-xl border-2 border-sky-200 bg-sky-50 p-5 my-6">
          <p className="font-bold text-slate-900 mb-1">Want a personalised recommendation instead?</p>
          <p className="text-sm text-slate-700 mb-3">Answer 6 quick questions about your home-working setup and our free Broadband Match tool ranks the providers that actually fit — not just the cheapest headline price.</p>
          <a href="/tools/broadband-match" className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors">Find my broadband match &rarr;</a>
        </div>
      </>
    ),
    faqs: [
      { question: 'What broadband speed do I need to work from home?', answer: 'A minimum of 30 Mbps download and 10 Mbps upload is workable for a single home worker doing email, browsing and occasional video calls. For households where multiple people are working or streaming simultaneously, 100+ Mbps with a genuinely fast upload speed is recommended.' },
      { question: 'Is full fibre worth it for working from home?', answer: 'Yes, especially if large files are regularly uploaded, multiple video calls happen daily, or the connection is shared with others. Full fibre (FTTP) delivers symmetrical or near-symmetrical speeds, lower latency and better reliability than FTTC.' },
      { question: 'Does a VPN slow down broadband?', answer: 'VPNs add some overhead and typically reduce speeds by 10 to 30%. On a fast connection (100+ Mbps), this is barely noticeable. On a slow connection, it can make the difference between a workable and unworkable experience.' },
      { question: 'Should I get business broadband to work from home?', answer: 'Consider it if downtime has a real cost, such as client calls that cannot tolerate a dropped connection, or if remote access to office systems needs a stable, known IP address. Business broadband commonly includes a static IP and a faster fault-fix guarantee than residential packages, from around £20 to £22 a month with providers like Vodafone Business. For most single home workers, a good residential full-fibre package is enough.' },
    ],
  },

  'best-broadband-for-students': {
    body: (
      <>
        <p>The best student broadband is usually the package that balances <strong>low monthly cost</strong>, <strong>enough speed for a shared house</strong>, and <strong>flexibility</strong> if your tenancy is shorter than a standard broadband contract. The cheapest deal is not always the best one if it locks you in long after the academic year ends.</p>
        <h2>What matters most for student broadband</h2>
        <ul>
          <li><strong>Contract length:</strong> 12-month or more flexible terms are often easier to manage than 18- or 24-month deals</li>
          <li><strong>Shared-house speed:</strong> a house of four streaming, gaming, and studying at once usually needs more than entry-level broadband</li>
          <li><strong>Setup simplicity:</strong> students often want a quick switch-on with minimal admin</li>
          <li><strong>Upfront cost:</strong> activation and delivery fees matter when budgets are tight</li>
        </ul>
        <h2>Best student broadband setup by household type</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Household type', 'Recommended speed', 'Best contract style'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['1 student in a studio or small flat', '30 to 50 Mbps', 'Cheapest standard fibre or flexible deal'],
                ['2 to 3 students sharing', '60 to 100 Mbps', '12-month contract if tenancy matches'],
                ['4+ students with streaming and gaming', '100 to 300 Mbps', 'Full fibre where available'],
                ['Short-stay or uncertain tenancy', '30 to 100 Mbps', 'Rolling monthly or shortest fixed term available'],
              ].map(([household, speed, contract]) => (
                <tr key={household} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{household}</td>
                  <td className="px-4 py-3 text-slate-700">{speed}</td>
                  <td className="px-4 py-3 text-slate-600">{contract}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Which providers usually make sense for students</h2>
        <p>Two names once commonly recommended here no longer fit as well as they used to. <strong>NOW Broadband</strong> dropped its flexible, shorter-term contracts and now sells only a standard 24-month term, the same length as most mainstream providers, so it no longer suits an academic-year tenancy any better than the rest of the market. <strong>TalkTalk</strong> also raised its standard price to £25 a month, no longer the clearly low-cost option it once was for shared houses.</p>
        <p>For a genuinely shorter commitment, <strong>YouFibre</strong> offers a real rolling monthly contract, from £33.99 a month with 30 days&apos; notice, worth it specifically for an uncertain or short-stay tenancy, though its coverage remains limited to around 10% of UK premises. <strong>Onestream</strong>, from £18.50 a month on a 12-month option, has the widest availability of any current budget provider at around 94% of UK premises, a realistic fit for most student addresses. Where available, <strong>Hyperoptic</strong> and <strong>Community Fibre</strong> remain excellent for bigger student households wanting faster, genuinely symmetrical full fibre without paying premium-brand prices, both also offering a 12-month option.</p>
        <h2>When flexible broadband is worth paying more for</h2>
        <p>If the tenancy end date is uncertain, or another move is likely within the year, flexibility can matter more than chasing the lowest monthly price. YouFibre&apos;s rolling option carries a genuine premium over its own 24-month rate, so it is worth it specifically when that flexibility will actually be used, not as a default choice; a 12-month contract from Hyperoptic, Community Fibre or Onestream is often the better middle ground for a typical academic-year tenancy.</p>
        <h2>Common student broadband mistakes</h2>
        <ul>
          <li>Choosing a contract longer than the tenancy</li>
          <li>Underbuying speed for a house share with lots of devices</li>
          <li>Ignoring setup fees, scheduled price rises and router return charges</li>
          <li>Assuming a provider still offers the flexible contract it was known for in previous years, rather than checking its current range</li>
          <li>Leaving the order too late and relying on mobile hotspot data at move-in</li>
        </ul>
        <h2>The best rule of thumb</h2>
        <p>If living in a shared student home, buy broadband based on the <em>whole house</em>, not one person. A slightly faster, cleaner deal split across multiple flatmates is often better value than the cheapest plan on paper.</p>
        <p>Students renting in Brighton can use the <Link href="/postcode/bn1">Brighton BN1 broadband deals guide</Link> to compare district coverage, complete-address checks and contract costs before choosing a provider.</p>
        <div className="not-prose rounded-xl border-2 border-sky-200 bg-sky-50 p-5 my-6">
          <p className="font-bold text-slate-900 mb-1">Want a personalised recommendation instead?</p>
          <p className="text-sm text-slate-700 mb-3">Answer 6 quick questions about your household and budget, and our free Broadband Match tool ranks the providers that actually fit — not just the cheapest headline price.</p>
          <a href="/tools/broadband-match" className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors">Find my broadband match &rarr;</a>
        </div>
      </>
    ),
    faqs: [
      { question: 'What is the best broadband for students in the UK?', answer: 'The best student broadband combines low monthly cost, enough speed for a shared house, and a contract that fits the tenancy. Onestream (from £18.50/mo, 94% coverage) and YouFibre\'s genuine rolling monthly option are stronger current starting points than NOW Broadband or TalkTalk, which have both moved away from their earlier budget or flexible-contract positioning.' },
      { question: 'Should students choose rolling monthly broadband?', answer: 'Choose YouFibre\'s rolling monthly option, from £33.99 a month with 30 days\' notice, if the tenancy is short or genuinely uncertain and its network covers the address. If the full academic year is confirmed, a 12-month contract with Hyperoptic, Community Fibre or Onestream is usually better value.' },
      { question: 'How much broadband speed do student houses need?', answer: 'A single student can manage on 30 to 50 Mbps, but most shared student houses should aim for at least 60 to 100 Mbps. Larger houses with regular gaming and 4K streaming often benefit from 100 to 300 Mbps full fibre.' },
      { question: 'Is NOW Broadband still a good option for students?', answer: 'Less than it used to be. NOW Broadband dropped its shorter, flexible contract options and now sells only a standard 24-month term, the same length as most national providers, so it no longer offers the tenancy-friendly flexibility it was previously known for.' },
      { question: 'Can students get broadband without a long contract?', answer: 'Yes, though the genuinely flexible options are narrower than they once were. YouFibre\'s rolling monthly contract, social tariffs in eligible households, and a 12-month term from an altnet like Hyperoptic or Community Fibre are the most realistic current routes to avoiding a full 24-month lock-in.' },
    ],
  },

  'best-broadband-for-streaming': {
    body: (
      <>
        <p>The best broadband for streaming is not automatically the fastest package available. For most UK households, smooth streaming depends on having <strong>enough speed for the number of people watching at once</strong>, stable Wi-Fi, and a package that still performs well in the evening when everyone is online.</p>
        <p>Planning to replace aerial television with broadband delivery? Our <Link href="/guides/freely-and-fetch-tv-explained-uk">Freely TV guide</Link> explains compatible equipment, the 10Mbps service minimum and why room-level Wi-Fi still matters.</p>
        <h2>How much speed do you need for streaming?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Streaming setup', 'Recommended speed', 'What it covers'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['1 to 2 HD streams', '30 to 50 Mbps', 'Netflix, YouTube, iPlayer on a small household connection'],
                ['1 to 2 4K streams', '50 to 100 Mbps', 'Better headroom for smart TVs and background use'],
                ['Family home with multiple simultaneous streams', '100 to 300 Mbps', 'Several TVs, tablets, and phones watching at once'],
                ['Heavy-use streaming plus gaming and home working', '300 Mbps+', 'Large connected households that want extra headroom'],
              ].map(([setup, speed, coverage]) => (
                <tr key={setup} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{setup}</td>
                  <td className="px-4 py-3 text-slate-700">{speed}</td>
                  <td className="px-4 py-3 text-slate-600">{coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>What actually causes buffering at home</h2>
        <p>Buffering is not always caused by a slow package. In many homes, the real problems are weak Wi-Fi in the room with the TV, too many devices competing at once, or an older router that struggles in peak evening use. FTTC and cable connections are also more likely to slow down during the busiest evening hours, roughly 7pm to 10pm, when many homes on the same street cabinet or node are streaming at once; full fibre is far less affected by this kind of shared-network congestion because each property has its own dedicated fibre line. That means upgrading the broadband tier only solves part of the problem if the in-home Wi-Fi setup is poor.</p>
        <h2>Which broadband types suit streamers best</h2>
        <p><strong>Full fibre</strong> is the strongest option if available because it delivers more stable speeds and lower evening congestion risk than older copper-based or cable connections. Standard fibre (FTTC) can still be enough for many households if the speed tier is chosen sensibly. Gigabit broadband is usually unnecessary unless the home has several heavy users doing much more than streaming.</p>
        <h2>Best providers for streaming households</h2>
        <p><strong>Sky</strong>, from £23 a month, is naturally relevant for households that also want Sky TV or Sky Sports bundled onto the same bill. <strong>Virgin Media</strong>, from £23.99 a month (checked 16 October 2026), stands out where its cable network is available: its Gig1 tier reaches up to 1,130 Mbps, genuinely the fastest widely available speed in the UK, well suited to a big entertainment-heavy household with several 4K streams running at once. <strong>Community Fibre</strong>, from £12.50 a month, and <strong>Hyperoptic</strong>, from £19 a month, can be excellent for city homes that want fast, genuinely symmetrical full fibre at strong value, though both have limited, city-specific coverage.</p>
        <h2>How to choose the right streaming package</h2>
        <ul>
          <li>Count how many people stream at the same time, not just total household size</li>
          <li>Match the speed tier to HD vs 4K habits</li>
          <li>Check whether full fibre is available before paying extra for older network technology, since it holds up better during peak evening hours</li>
          <li>Improve Wi-Fi placement before assuming a much faster deal is needed</li>
        </ul>
        <h2>The simplest answer for most homes</h2>
        <p>If the household mainly streams TV and films, a solid 50 to 100 Mbps package is enough for many homes. The move to 100 to 300 Mbps becomes worthwhile when multiple people stream in 4K, game, or work from home at the same time. Anyone specifically prone to evening buffering on an older FTTC or cable connection should treat full fibre, where available, as the more direct fix than simply paying for a faster tier on the same congestion-prone technology.</p>
        <div className="not-prose rounded-xl border-2 border-sky-200 bg-sky-50 p-5 my-6">
          <p className="font-bold text-slate-900 mb-1">Want a personalised recommendation instead?</p>
          <p className="text-sm text-slate-700 mb-3">Answer 6 quick questions about your streaming habits and household, and our free Broadband Match tool ranks the providers that actually fit — not just the cheapest headline price.</p>
          <a href="/tools/broadband-match" className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors">Find my broadband match &rarr;</a>
        </div>
      </>
    ),
    faqs: [
      { question: 'What is the best broadband speed for streaming?', answer: 'For many homes, 50 to 100 Mbps is enough for smooth streaming. Larger households with multiple simultaneous 4K streams often benefit from 100 to 300 Mbps, especially if the connection is also used for gaming or home working.' },
      { question: 'Is full fibre better for streaming?', answer: 'Yes. Full fibre is usually more stable and better suited to busy households, especially in the evening when several devices are online at once. Standard fibre can still work well if the speed tier is appropriate.' },
      { question: 'Do I need gigabit broadband for Netflix and streaming apps?', answer: 'Usually no. Gigabit broadband is unnecessary for most streaming-only households. It becomes more relevant when a large home combines streaming with gaming, cloud backups, and home working across many devices.' },
      { question: 'Why does my TV buffer even though my broadband seems fast?', answer: 'The issue is often Wi-Fi quality rather than the broadband package itself. Weak signal in the TV room, router placement, device congestion, or older hardware can all cause buffering even when headline speeds look good.' },
      { question: 'Why does streaming get worse in the evening specifically?', answer: 'FTTC and cable connections share capacity with other properties on the same street cabinet or node, so speed can dip during peak evening hours, roughly 7pm to 10pm, when many homes are streaming at once. Full fibre (FTTP) is far less affected by this because each property has its own dedicated fibre line rather than a shared one.' },
    ],
  },

  'best-broadband-providers-uk': {
    body: (
      <>
        <p>The best broadband provider in the UK depends on what matters most to you: price, customer service, symmetrical speed, or nationwide coverage. Based on Ofcom&apos;s Q1 2026 complaints data (published 23 July 2026, and the lowest figure in the regulator&apos;s published series since Q4 2010), current package pricing, and Trustpilot scores checked in August 2026, here is how every major UK provider actually ranks.</p>

        <h2>How we ranked UK broadband providers</h2>
        <p>Each provider is scored against real current pricing, Ofcom&apos;s Q1 2026 complaints data (complaints per 100,000 customers, the regulator&apos;s standard measure), Trustpilot score, and coverage. No provider paid to be ranked or featured, and providers with above-average complaints are marked accordingly regardless of any commercial relationship with this site.</p>

        <h2>UK broadband providers ranked at a glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'From', 'Trustpilot', 'Ofcom complaints', 'Best for'].map(h => (
                  <th key={h} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Community Fibre', '£12.50/mo', '4.7 ★', 'N/A*', 'Cheapest full fibre, satisfaction'],
                ['Toob', '£18.00/mo', '4.5 ★', 'N/A*', 'Symmetrical speed, small disclosed rises'],
                ['Hyperoptic', '£19.00/mo', '4.5 ★', 'N/A*', 'Symmetrical speed, social tariff'],
                ['Plusnet', '£21.99/mo', '2.0 ★', '4 per 100k', 'Best major-provider complaints record'],
                ['Sky', '£23.00/mo', '2.7 ★', '5 per 100k', 'TV bundles, strong complaints record'],
                ['NOW Broadband', '£23.00/mo', '1.2 ★', '11 per 100k (Q4 2025)†', 'Lowest price on the Openreach network'],
                ['EE', '£22.99/mo', '1.3 ★', '6 per 100k', 'Mobile bundle, wide 5G-adjacent reach'],
                ['BT', '£28.99/mo', '4.0 ★‡', '7 per 100k', 'Widest UK coverage, 98% of homes'],
                ['Zen Internet', '£30.00/mo', '4.4 ★', 'N/A*', 'Home workers, free static IP'],
                ['Vodafone', '£25.00/mo', '1.3 ★', '8 per 100k', '2026 value and speed awards'],
                ['TalkTalk', '£25.00/mo', '1.5 ★', '10 per 100k', 'Cheapest big-name full fibre'],
                ['Virgin Media', '£23.99/mo', '1.4 ★', '6 per 100k', 'Fastest widely available speeds'],
              ].map(([p, price, tp, complaints, best]) => (
                <tr key={p} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{p}</td>
                  <td className="px-4 py-3 text-slate-700">{price}</td>
                  <td className="px-4 py-3 text-slate-700">{tp}</td>
                  <td className="px-4 py-3 text-slate-700">{complaints}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">*Community Fibre, Toob, Hyperoptic and Zen Internet are too small for Ofcom&apos;s quarterly complaints report threshold. †NOW Broadband is not separately listed in Ofcom&apos;s Q1 2026 table; figure shown is its Q4 2025 result. ‡BT has two active Trustpilot pages, bt.com (4.0) and the older btbroadband.com (around 1.5); see the two-page explainer below. Ofcom data: Q1 2026, published 23 July 2026, industry average 6 per 100,000. Trustpilot and pricing checked August 2026.</p>

        <h2>Best for the lowest complaints record — Plusnet</h2>
        <p>Plusnet recorded just 4 complaints per 100,000 customers in Ofcom&apos;s Q1 2026 report, the lowest figure of any major nationwide provider and comfortably below the record-low industry average of 6. This sits alongside a genuinely low Trustpilot score, around 2.0 out of 5, one of the clearer examples on this site of a provider whose self-selected review page looks worse than its independently regulated complaints record actually is.</p>

        <h2>Best for customer satisfaction and value — Community Fibre and Toob</h2>
        <p>Community Fibre holds a 4.7 Trustpilot score from roughly 91,000 reviews and starts from £12.50 a month, the cheapest full-fibre package covered on this site; coverage has expanded beyond London into parts of Surrey and Sussex. Toob, serving Southampton and a growing footprint of around 290,000 premises across 29 towns and cities, holds a 4.5 Trustpilot score and includes a Wi-Fi 7 router as standard. Both are altnets building their own full-fibre networks rather than reselling Openreach infrastructure, and both are too small for Ofcom&apos;s quarterly complaints threshold.</p>

        <h2>Best budget option on a national network — NOW Broadband</h2>
        <p>NOW Broadband, owned by Sky, is the cheapest widely available broadband on the Openreach network, from £23 a month on a 24-month contract with no activation fee (checked 16 October 2026). It is a genuine exception to the usual pattern on this list: unlike most providers, where a low Trustpilot score sits alongside a decent Ofcom record, NOW scores poorly on both, around 1.2 out of 5 on Trustpilot and 11 complaints per 100,000 customers in Ofcom&apos;s most recent report covering it, noticeably worse than its own parent brand Sky.</p>

        <h2>Sky vs NOW: same network, different support quality</h2>
        <p>Sky and NOW Broadband run on the identical Openreach network and share a parent company, yet their independently measured service records diverge sharply. Sky recorded just 5 complaints per 100,000 customers in Ofcom&apos;s Q1 2026 report, among the best of any major provider; NOW&apos;s most recent figure was more than double that. Because the underlying line quality is the same, the difference reflects support and account-handling quality specifically, a genuinely useful data point when the choice is simply between a brand&apos;s full-price and budget tier.</p>

        <h2>Worst for Ofcom complaints — TalkTalk</h2>
        <p>TalkTalk recorded 10 complaints per 100,000 customers in Ofcom&apos;s Q1 2026 report, the highest of any major UK provider and the only provider Ofcom does not consider statistically comparable to any other in that quarter&apos;s data. Its current range starts from £25 a month, no longer the clearly cheapest big-name option it once was, positioning it closer to Vodafone on price while carrying the weakest complaints record on this list.</p>

        <h2>Best for speed — Hyperoptic and Community Fibre</h2>
        <p>Hyperoptic and Community Fibre both offer genuinely symmetrical full-fibre packages, meaning upload speed matches download speed, useful for video calls, cloud backups and uploading large files. Hyperoptic also runs a real social tariff at two price points, £15 and £20 a month, with no fixed contract. Both have limited, though growing, geographic footprints, so check the exact speed, current price and terms available at a specific address before assuming national availability.</p>

        <h2>Best for coverage — BT</h2>
        <p>BT covers around 98% of UK premises, the widest reach of any provider on this list, delivered via the Openreach network it also wholesales to most rival ISPs. It starts from £28.99 a month (Full Fibre from £30.99) on a 24-month contract, with no activation fee on online orders (checked 16 October 2026). BT has two active Trustpilot pages showing very different scores, 4.0 on bt.com and around 1.5 on the older btbroadband.com; Ofcom&apos;s Q1 2026 data, 7 complaints per 100,000, is the more neutral cross-check, placing BT just above the industry average.</p>
      </>
    ),
    faqs: [
      { question: 'Which UK broadband provider has the best customer service?', answer: 'Based on Ofcom\'s Q1 2026 complaints data, Plusnet has the best record of any major nationwide provider at just 4 complaints per 100,000 customers, against a record-low industry average of 6. Community Fibre, Toob, Hyperoptic and Zen Internet are all too small for Ofcom\'s reporting threshold but carry Trustpilot scores of 4.4 or higher.' },
      { question: 'Which is the most reliable UK broadband provider?', answer: 'On Ofcom\'s regulated Q1 2026 complaints data, Plusnet (4 per 100,000) and Sky (5 per 100,000) have the strongest records among major nationwide providers, both comfortably below the industry average of 6. TalkTalk (10 per 100,000) has the weakest.' },
      { question: 'Which UK broadband provider is cheapest?', answer: 'Community Fibre is the cheapest full-fibre provider covered on this site, from £12.50 a month, though coverage is limited to London, Surrey and Sussex. For a widely available option on the Openreach network, NOW Broadband from £23 a month and Sky from £23 a month are the cheapest.' },
      { question: 'Which UK broadband provider has the worst complaints record?', answer: 'TalkTalk had the worst broadband complaints record in Ofcom\'s Q1 2026 report, at 10 complaints per 100,000 customers, the only provider Ofcom does not consider statistically comparable to any other that quarter. The industry average was a record-low 6 per 100,000.' },
      { question: 'Why do some providers have very different Trustpilot and Ofcom results?', answer: 'Trustpilot reviews are self-selected and skew toward customers who had a problem, while Ofcom\'s complaints data is a regulated, standardised measure applied identically to every provider. Sky, Plusnet and Virgin Media all show this pattern, a low Trustpilot score alongside a comparatively strong Ofcom record; NOW Broadband is a rarer case that scores poorly on both.' },
    ],
  },

  'broadband-price-rises-2026': {
    body: (
      <>
        <p>In April 2026, most major UK broadband providers raised prices, though the picture is more mixed than a single across-the-board figure suggests. BT, EE and Plusnet increased by £4 a month. TalkTalk and Hyperoptic, both often assumed to be lower-rise providers, also increased by around £4. Sky rose by £3. NOW Broadband and toob applied no rise at all in April 2026. These are the second full year of flat, disclosed pounds-and-pence rises since the industry moved away from CPI-linked increases in January 2025.</p>

        <h2>Which providers raised prices in April 2026?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Monthly increase', 'Annual extra cost', 'When applied'].map(h => (
                  <th key={h} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['BT', '+£4.00/mo', '+£48/year', 'April 2026'],
                ['EE', '+£4.00/mo', '+£48/year', 'April 2026'],
                ['Plusnet', '+£4.00/mo', '+£48/year', 'April 2026'],
                ['Virgin Media', '+£4.00/mo*', '+£48/year', 'April 2026'],
                ['TalkTalk', '+£4.00/mo*', '+£48/year', 'April 2026'],
                ['Hyperoptic', '+£4.00/mo', '+£48/year', 'April 2026'],
                ['Vodafone', '+£3.50/mo*', '+£42/year', 'April 2026'],
                ['Sky', '+£3.00/mo', '+£36/year', 'April 2026'],
                ['Community Fibre', '+£2.00/mo (capped)', '+£24/year', 'April 2026'],
                ['NOW Broadband', 'No rise in 2026†', '—', 'Scheduled £3 in April 2027'],
                ['toob', 'No rise', '—', '—'],
                ['Zen Internet', 'No rise (Contract Price Promise)', '—', '—'],
              ].map(([p, mo, yr, when]) => (
                <tr key={p} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{p}</td>
                  <td className={`px-4 py-3 font-medium ${String(mo).startsWith('No rise') ? 'text-green-700' : 'text-red-600'}`}>{mo}</td>
                  <td className="px-4 py-3 text-slate-700">{yr}</td>
                  <td className="px-4 py-3 text-slate-600">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">*Virgin Media and TalkTalk both moved to a higher rise for contracts signed after a cutover date in late 2025 (Virgin Media: £3.50 for contracts from January-September 2025, £4 from October 2025 onward; TalkTalk: £3 for contracts from August 2024 to mid-November 2025, £4 for contracts from 16 November 2025). Vodafone similarly rose by £3.00 for older contracts and £3.50 for contracts from 12 November 2025 onward. †NOW Broadband applied no rise in April 2026, but current contracts disclose a scheduled £3 rise for April 2027 and a further £3 for April 2028.</p>

        <h2>Two real corrections worth knowing about "no-rise" providers</h2>
        <p>Hyperoptic and Community Fibre are sometimes assumed to be part of the no-rise altnet group, but neither is: Hyperoptic applies a scheduled rise of around £4 a month each April on its fixed-term contracts, and Community Fibre applies a rise each April (£3 a month on contracts sold in October 2026), both disclosed upfront in pounds and pence. Only toob and Zen Internet, among the providers checked here, applied genuinely no scheduled rise in April 2026, and Zen backs this with an explicit Contract Price Promise rather than just an absence of an announced increase. Note that toob&apos;s new 24-month contracts, checked on 16 October 2026, now include a £2 a month rise each April from 2027.</p>

        <h2>Your rights when broadband prices go up mid-contract</h2>
        <p>Since January 2025, Ofcom requires all new broadband contracts to state any mid-contract price rises as a fixed pound amount rather than a CPI-linked percentage. This means if a contract was signed after January 2025 and the provider raises prices by more than the amount stated in the contract, there is a right to exit without an early termination charge.</p>
        <p>For contracts signed before January 2025, or in some cases before a provider’s own later cutover date, the old rules may still apply, meaning a provider could have raised prices by a CPI-linked percentage without automatically triggering an exit right.</p>

        <h2>How to leave a broadband contract because of a price rise</h2>
        <ul>
          <li><strong>Check the contract start date</strong> — a contract signed after January 2025 carries stronger rights</li>
          <li><strong>Get the price rise notification in writing</strong> — providers must give at least 30 days&apos; notice</li>
          <li><strong>Contact the provider and state a wish to leave penalty-free</strong> — cite the price rise as the reason</li>
          <li><strong>Use One Touch Switch</strong> — sign up with a new provider and they handle the rest automatically</li>
          <li><strong>Act within 30 days of the notice</strong> — the right to exit without penalty expires after that window</li>
        </ul>

        <h2>Which broadband providers genuinely had no price rise in 2026?</h2>
        <p>Only toob and Zen Internet applied no scheduled rise at all in April 2026 among the providers checked here, and NOW Broadband also had no rise this specific year. New contracts are different: toob now adds £2 a month each April from 2027, and NOW says prices may change during its 24-month term (checked 16 October 2026). Altnets in particular have used price stability as a competitive differentiator, but "altnet" alone is not a reliable predictor: Hyperoptic and Community Fibre, both altnets, do apply a scheduled annual rise.</p>

        <h2>What changed with broadband pricing rules in 2025?</h2>
        <p>From January 2025, Ofcom banned the practice of linking mid-contract broadband price rises to inflation (CPI or RPI). For all new contracts signed from that date, any price rise during the contract term must be stated as a fixed pound amount at the point of sale. This gives more predictability, since the rise is known before signing up, unlike the previous CPI+3.9% system, which made the true long-term cost of a contract impossible to calculate in advance.</p>
      </>
    ),
    faqs: [
      { question: 'Can I leave my broadband contract because of a price rise?', answer: 'Yes, in most cases, if the contract was signed after January 2025 and the provider raises prices by more than stated in the contract. Act within 30 days of receiving the price rise notification, contact the provider in writing and cite the price rise as the reason for leaving.' },
      { question: 'Which broadband providers did not raise prices in 2026?', answer: 'toob and Zen Internet applied no scheduled rise at all in April 2026, and NOW Broadband also had no rise that year. On new contracts checked on 16 October 2026, toob adds £2 a month each April from 2027. Hyperoptic and Community Fibre are sometimes wrongly assumed to be no-rise altnets, but both applied a real scheduled increase in April 2026.' },
      { question: 'How much did BT raise broadband prices in 2026?', answer: 'BT raised broadband prices by £4 a month in April 2026, adding £48 to the annual cost. EE and Plusnet, both part of the BT Group, also raised prices by £4 a month at the same time.' },
      { question: 'How much did TalkTalk raise broadband prices in 2026?', answer: 'TalkTalk raised its standard mid-contract rise from £3 to £4 a month for contracts signed from 16 November 2025 onward, applied from April 2026. Customers who joined between August 2024 and mid-November 2025 continue on the earlier £3 rise; those who joined before August 2024 remain on the older CPI-linked system.' },
      { question: 'What is the new Ofcom rule about broadband price rises?', answer: 'From January 2025, Ofcom banned inflation-linked mid-contract price rises. New broadband contracts must now state any in-contract price rise as a fixed pound amount, for example "prices may rise by up to £4 a month." This replaced the old CPI+3.9% system, which made the total cost unpredictable at the point of signing up.' },
    ],
  },

  'can-i-leave-broadband-early-after-price-rise': {
    body: (
      <>
        <p>Sometimes yes, sometimes no. Whether you can leave broadband early after a price rise depends on <strong>when you signed the contract</strong>, <strong>what price-rise terms were shown when you signed</strong>, and <strong>whether the provider increased the bill by more than the contract allowed</strong>.</p>

        <h2>The short answer</h2>
        <p>If your provider raises your broadband bill in a way that goes beyond what was clearly disclosed at signup, you may have the right to leave without an early termination charge. If the price rise was already clearly built into the contract, you usually cannot leave penalty-free just because the higher bill has now arrived.</p>

        <h2>Why the contract date matters</h2>
        <p>Broadband pricing rules changed materially from January 2025. Newer telecom contracts should describe in-contract price rises in fixed pounds-and-pence terms rather than vague inflation-linked formulas. That makes it easier to know what you agreed to before you sign.</p>
        <p>So the first question to ask is: <strong>did I sign this contract before or after the newer price-rise rules took effect?</strong></p>

        <h2>When you may be able to leave early</h2>
        <ul>
          <li>The provider increased the price by more than the contract said it could</li>
          <li>The pricing notice or contract wording was unclear or inconsistent</li>
          <li>You have another separate exit right, such as failure to meet guaranteed minimum speeds</li>
          <li>The provider changed the service materially as well as the price</li>
        </ul>

        <h2>When you usually cannot leave for free</h2>
        <ul>
          <li>The contract already clearly stated the exact in-contract increase</li>
          <li>You are still inside the minimum term and the provider applied the agreed rise correctly</li>
          <li>You simply no longer like the deal but the provider has followed the contract terms</li>
        </ul>

        <h2>What "clearly disclosed" looks like in practice</h2>
        <p>Most major providers now disclose a flat, dated pounds-and-pence figure at sign-up, which is the clearest version of this and generally does not create an exit right when it lands as promised: BT applies a flat £4 a month rise every March, and TalkTalk&apos;s standard contracts from November 2025 disclose £4 a month rises for both April 2027 and April 2028, both stated upfront. Sky is a genuinely different, murkier case worth knowing about specifically: its contract terms for years after the first only say prices "may rise" without fixing a future figure at sign-up, which is a weaker disclosure than a dated, fixed amount and worth checking closely if a rise notice arrives that was not clearly quantified when the contract was signed.</p>
        <p>If a contract only ever said something vague, such as prices may increase in line with inflation, without a specific figure, and the provider then applies a rise larger than what a reasonable reading of that wording implied, that gap between vague wording and an unexpectedly large actual increase is exactly the kind of case worth challenging.</p>

        <h2>What to do if your bill goes up</h2>
        <ol>
          <li>Find the contract or order summary you originally agreed to.</li>
          <li>Check exactly what it said about in-contract price rises, including whether a specific figure was given or only vague wording.</li>
          <li>Compare that wording with the notification you just received.</li>
          <li>Ask the provider in writing whether you can leave without an early termination charge; Ofcom requires at least 30 days&apos; notice of a price rise, and the right to exit penalty-free, where it applies, must generally be used within that 30-day window.</li>
          <li>If you do have the right to leave, compare fresh deals before acting quickly, ideally using One Touch Switch so the new provider handles the transfer.</li>
        </ol>

        <h2>Do not confuse “annoying” with “unlawful”</h2>
        <p>A price rise can feel unfair without necessarily giving you a free exit. This is where a lot of users get stuck. The key question is not whether the bill went up. It is whether the increase was handled within the exact terms you agreed to.</p>

        <h2>What to do after checking your contract</h2>
        <p>Once you know whether the increase was disclosed and whether an exit fee applies, compare the cost of staying, renegotiating and switching. Ask your provider to confirm any fee in writing before you cancel, and keep copies of the pre-contract summary and price-rise notice.</p>
        <p>If the provider rejects a supported request for penalty-free cancellation, make a formal complaint rather than cancelling the direct debit. The <Link href="/guides/broadband-complaints-and-ombudsman-uk">UK broadband ombudsman route</Link> explains how to request deadlock and take an unresolved dispute to the provider&apos;s approved ADR scheme.</p>
      </>
    ),
    faqs: [
      { question: 'Can I leave my broadband contract early because of a price rise?', answer: 'Sometimes. You may be able to leave without an early termination charge if the provider increased the price by more than the contract clearly allowed. If the rise was already clearly stated in the contract, you usually cannot leave for free on that basis alone.' },
      { question: 'What changed with broadband price-rise rules after January 2025?', answer: 'Newer telecom contracts should describe in-contract price rises in fixed pounds-and-pence terms rather than unclear inflation-linked formulas. That makes it easier to judge whether a provider has followed the contract correctly.' },
      { question: 'What should I check first if my broadband bill rises?', answer: 'Check the order summary or contract wording you agreed to when you signed up. You need to see exactly what it said about in-contract price rises before deciding whether you may have a penalty-free exit right.' },
      { question: 'If I can leave after a price rise, what should I do next?', answer: 'Compare current deals at your postcode first, then contact the provider in writing. If they confirm you can leave without an early termination charge, you can decide whether to switch, renegotiate, or move to a more predictable deal.' },
      { question: 'How much notice must a provider give before a price rise, and how long do I have to act?', answer: 'Ofcom requires at least 30 days\' notice of a price rise. Where a genuine exit right applies, it must generally be used within that 30-day window from the notification, so act promptly rather than waiting until the higher bill actually arrives.' },
    ],
  },

  'broadband-without-phone-line': {
    body: (
      <>
        <p>Yes, you can get broadband without a phone line in the UK. Full fibre (FTTP) broadband, Virgin Media cable, and 5G home broadband all work without a traditional copper telephone line, and most new broadband contracts no longer require one. The bigger question for most households now is not whether a line is needed, but what happens to phone access during a power cut once the old copper network is switched off.</p>

        <h2>Why you used to need a phone line for broadband</h2>
        <p>Standard ADSL and FTTC (part-fibre) broadband both used the copper telephone wire between the street cabinet and the home to carry the internet signal, which meant a BT phone line was technically required, with line rental billed separately, typically adding £10 to £20 a month to the cost.</p>
        <p>That era is ending. The UK&apos;s old analogue phone network (the PSTN) is being fully retired by 31 January 2027, a date now treated as fixed after Openreach confirmed the technical barriers behind the original December 2025 target were resolved. Ofcom recorded 5.2 million customers still on the PSTN in July 2024, falling to 3.2 million by July 2025, so most of the country has already moved, or will move, to a broadband-only or Digital Voice connection well before the final date.</p>

        <h2>Which providers offer broadband without a phone line?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Technology', 'Phone line needed?', 'From'].map(h => (
                  <th key={h} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['BT', 'FTTP (full fibre)', 'No', '£30.99/mo'],
                ['Sky', 'FTTP (full fibre)', 'No', '£23.00/mo'],
                ['EE', 'FTTP (full fibre)', 'No', '£22.99/mo'],
                ['Virgin Media', 'Cable', 'No — never needed one', '£23.99/mo'],
                ['Vodafone', 'FTTP (full fibre)', 'No', '£25.00/mo'],
                ['TalkTalk', 'FTTP (full fibre)', 'No', '£25.00/mo'],
                ['Hyperoptic', 'FTTP (full fibre)', 'No — never needed one', '£19.00/mo'],
                ['Community Fibre', 'FTTP (full fibre)', 'No — never needed one', '£12.50/mo'],
                ['Three (5G)', '5G home broadband', 'No — no line at all', 'From £29/mo'],
              ].map(([p, tech, needed, from]) => (
                <tr key={p} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{p}</td>
                  <td className="px-4 py-3 text-slate-700">{tech}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">{needed}</td>
                  <td className="px-4 py-3 text-slate-700">{from}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Full fibre (FTTP) broadband without a landline</h2>
        <p>Full fibre broadband uses optical fibre cable all the way from the exchange directly into the home, with no copper wire in the connection at any point, so it does not depend on or need a telephone line. FTTP is available from every major UK provider, including BT, Sky, EE, TalkTalk, Vodafone and Plusnet via the Openreach network, plus altnets like Hyperoptic and Community Fibre on their own infrastructure.</p>
        <p>Ofcom&apos;s Spring 2026 Connected Nations data put gigabit-capable coverage at 89% of UK premises (27.1 million homes), up from 87% a year earlier, with full-fibre specifically now reaching 82% of homes. Coverage is uneven by area: 93% in urban areas against 66% in rural areas, so check availability at a specific address using our postcode checker rather than assuming national figures apply everywhere.</p>

        <h2>Virgin Media cable broadband</h2>
        <p>Virgin Media has never used the traditional copper phone network. Its broadband is delivered via its own coaxial cable infrastructure, which reaches around 52% of UK premises, a separate, non-overlapping footprint from Openreach. Virgin Media broadband has never required a landline; it is a pure broadband service, with phone calls available as an optional Digital Voice add-on. Speeds start from 132 Mbps and go up to 1,130 Mbps on its fastest current tier.</p>

        <h2>5G home broadband: no line at all</h2>
        <p>5G home broadband uses a mobile 5G signal rather than any fixed line connection. A 5G router is delivered to the home, connects to the mobile network and broadcasts Wi-Fi, with no engineer visit and no wires to the property at all. Three currently offers the best value at around £29 a month for roughly 150 Mbps, Vodafone&apos;s GigaCube starts from £21 a month on a fixed term, and EE&apos;s Smart 5G Hub has the broadest UK 5G coverage from £30 to £50 a month. Speeds depend heavily on local signal strength and are not a reliable option in areas with weak or no 5G coverage.</p>

        <h2>What happens to a home phone during a power cut?</h2>
        <p>This is the real practical question once a line moves to Digital Voice rather than whether a line is needed at all. Because Digital Voice runs through the broadband router rather than a separately powered copper line, it will not work during a power cut unless a backup solution is in place. Ofcom requires every provider to guarantee at least one hour of continued access to emergency services during a power cut, and providers under the industry PSTN Charter have committed to not migrating telecare or medical-alarm users unless their specific device is confirmed compatible, with backup solutions that go beyond Ofcom&apos;s one-hour minimum for those households. Anyone with telecare, an alarm system or accessibility needs should raise this directly with their provider before a migration date is set.</p>

        <h2>Do I still need a phone number?</h2>
        <p>No. Most UK households are moving away from landline phone numbers entirely, and no provider requires a phone service alongside a broadband package. Anyone who wants to keep an existing number can request porting to a Digital Voice service that runs over the broadband connection; do not cancel the old line first, since that can put the number at risk of being lost rather than transferred.</p>
      </>
    ),
    faqs: [
      { question: 'Can I get broadband without a BT phone line?', answer: 'Yes. Full fibre (FTTP) broadband from BT, Sky, EE, TalkTalk, Vodafone and others does not require a copper phone line. Virgin Media cable broadband has never needed one. 5G home broadband requires no line at all.' },
      { question: 'What is broadband-only, no landline?', answer: 'Broadband-only means internet service without a traditional telephone line or phone service included. All major UK providers now offer broadband-only packages, particularly for full-fibre connections. Digital Voice (internet-based phone calls) can be added separately for anyone who wants to keep a phone number.' },
      { question: 'When is the UK landline switch-off happening?', answer: 'The old analogue PSTN network is being fully retired by 31 January 2027, a date now treated as fixed after Openreach confirmed the technical barriers behind the original December 2025 target were resolved. The number of customers still on the PSTN fell from 5.2 million in July 2024 to 3.2 million in July 2025.' },
      { question: 'Will a Digital Voice phone work in a power cut?', answer: 'Not without a backup solution, since Digital Voice runs through the broadband router rather than a separately powered line. Ofcom requires providers to guarantee at least one hour of access to emergency services during a power cut, and providers under the industry PSTN Charter offer stronger backup for telecare and vulnerable-user households specifically.' },
      { question: 'Is broadband without a phone line cheaper?', answer: 'Often, yes. Under the old system, line rental added £10 to £20 a month to the broadband cost. Full-fibre broadband-only deals now bundle the connection cost into a single monthly price, and many providers have eliminated line rental entirely for FTTP customers.' },
    ],
  },

  'best-5g-home-broadband-uk': {
    body: (
      <>
        <p>Three currently offers the best value in UK 5G home broadband, from £29 a month on a 24-month contract with unlimited data and no upfront cost, averaging around 150 Mbps. Vodafone&apos;s 5G GigaCube is cheaper still at £21 a month on a fixed term, or £60 a month with no contract at all. EE&apos;s Smart 5G Hub costs more, from £30 to £50 a month, but has the broadest 5G coverage of any UK network. National Broadband, a multi-network specialist rather than a single mobile operator, is worth checking specifically for rural addresses a single network cannot reach.</p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Price check:</strong> every price and speed figure below was checked against official provider sources on 24 August 2026. 5G performance is genuinely address-specific; confirm expected signal strength before ordering.
          </p>
        </div>

        <h2>5G home broadband providers compared</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'From', 'Contract', 'Avg. speed', 'Best for'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Three 5G Hub', '£29/mo', '24 months (or £34/mo on 12)', '~150 Mbps', 'Best overall value where Three\'s network is strong'],
                ['Vodafone 5G GigaCube', '£21/mo (+£15 upfront)', '24 months, or £60/mo rolling', '150-200 Mbps', 'Cheapest fixed-term option, or genuine no-contract flexibility'],
                ['EE Smart 5G Hub', '£30-50/mo', 'Varies by plan', '~146 Mbps', 'Broadest UK 5G coverage; best where rivals are weak'],
                ['National Broadband', 'From £34.99/mo', '12, 18 or 24 months', '40-80 Mbps', 'Rural addresses; picks the strongest of all four UK networks automatically'],
              ].map(([provider, price, contract, speed, best]) => (
                <tr key={provider} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{provider}</td>
                  <td className="px-4 py-3 text-slate-700">{price}</td>
                  <td className="px-4 py-3 text-slate-600">{contract}</td>
                  <td className="px-4 py-3 text-slate-700">{speed}</td>
                  <td className="px-4 py-3 text-slate-600">{best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">Full review: <Link href="/providers/national-broadband">National Broadband</Link>.</p>

        <h2>Three vs EE: value against coverage</h2>
        <p>Three is typically the cheaper of the two big single-network options and delivers strong average speeds where its network is genuinely strong, but Three has appeared in the worst quartile of Ofcom&apos;s complaints data for both broadband and mobile, alongside EE and Vodafone. EE costs more but has the broadest 5G coverage of any UK network, which is the more decisive factor than price for anyone in an area where signal strength varies between networks. Check both networks&apos; coverage checkers for the exact address before deciding on price alone.</p>

        <h2>Vodafone GigaCube: cheapest fixed term, or genuine flexibility</h2>
        <p>Vodafone&apos;s GigaCube Unlimited is the cheapest fixed-term 5G home broadband covered here, at £21 a month plus a modest £15 upfront cost on a 24-month term, typically delivering 150 to 200 Mbps. A separate 30-day rolling version exists at £60 a month with a higher £150 upfront cost, aimed specifically at anyone who wants to test 5G broadband at an address with no long-term commitment, at a real premium for that flexibility.</p>

        <h2>National Broadband: the multi-network specialist for rural addresses</h2>
        <p>National Broadband does not run its own mobile network; it deals with all four UK networks and connects each customer to whichever gives the strongest signal at their specific address, which is a genuinely different value proposition from a single-network provider like Three, Vodafone or EE. It is a stronger starting point for a rural or hard-to-reach address than committing to one network directly, since a poor Three signal at a specific property does not rule out a strong EE or Vodafone one nearby.</p>

        <h2>5G home broadband vs full fibre</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Option', 'Main advantage', 'Main downside'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['5G home broadband', 'No engineer visit, fast setup, genuine flexibility on some plans', 'Performance depends heavily on local mobile signal, not a fixed line rate'],
                ['Full fibre (FTTP)', 'Most stable speeds and the strongest long-term reliability', 'Needs availability, and usually an installation appointment'],
                ['FTTC / part fibre', 'Widely available and familiar', 'Usually slower and offers less headroom than 5G or full fibre'],
              ].map(([option, advantage, downside]) => (
                <tr key={option} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{option}</td>
                  <td className="px-4 py-3 text-slate-700">{advantage}</td>
                  <td className="px-4 py-3 text-slate-600">{downside}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>If your postcode has a genuine full-fibre option at a similar price, it will usually be more predictable than 5G, which is affected by local mobile congestion and signal conditions in a way a dedicated fixed line is not. See our full <Link href="/guides/best-full-fibre-broadband-uk">guide to the best full fibre broadband</Link>, including why every major provider&apos;s Trustpilot score and its real Ofcom complaints position often tell different stories, a pattern that applies to 5G-focused mobile networks too.</p>
        <p>A mobile broadband plan may arrive as a physical SIM or a downloadable profile. Our <Link href="/guides/esim-explained-uk">UK eSIM explainer and switching checklist</Link> shows how to check handset support, activate a line and avoid deleting the old profile before the replacement works.</p>

        <h2>What to check before buying 5G home broadband</h2>
        <ul>
          <li>How strong the specific network&apos;s 5G signal is inside your actual property, not just the postcode-level coverage map</li>
          <li>Whether the provider offers a trial period or returns window if performance is disappointing once installed</li>
          <li>Whether your household needs consistently low latency for gaming or video calls, where a fixed line is generally more predictable</li>
          <li>Whether a full-fibre deal is available at a similar monthly price before committing to a mobile-based alternative</li>
        </ul>

        <h2>The simplest buying rule</h2>
        <p>Check Three first for value, EE if Three&apos;s coverage is weak at your address, and National Broadband specifically if you are rural and want the option of whichever network actually works there. Choose full fibre instead when your postcode has a genuine FTTP option at a similar price and you want the most predictable performance.</p>
      </>
    ),
    faqs: [
      { question: 'What is the best 5G home broadband in the UK?', answer: 'Three currently offers the best value, from £29 a month with unlimited data and around 150 Mbps average speed. EE costs more, from £30 to £50 a month, but has the broadest 5G coverage of any UK network. Vodafone\'s GigaCube is cheaper still at £21 a month on a fixed term. The right choice depends more on which network is genuinely strong at your specific address than on price alone.' },
      { question: 'Is 5G home broadband better than full fibre?', answer: 'Usually not where full fibre is genuinely available at a similar price. Full fibre is normally more stable and predictable because it is not affected by local mobile signal conditions or network congestion the way 5G is. 5G wins on setup speed, contract flexibility and being a genuine option where fixed-line broadband is weak or unavailable.' },
      { question: 'Which 5G network has the best coverage?', answer: 'EE has the broadest 5G coverage of any UK network, according to independent testing, which is why it remains worth its higher price specifically in areas where Three\'s coverage is weaker. National Broadband, which connects to whichever of the four UK networks is strongest at a given address, is a stronger starting point than committing to a single network directly for a rural or borderline-coverage property.' },
      { question: 'Can I get 5G home broadband with no fixed contract?', answer: 'Yes. Vodafone\'s 30-day rolling GigaCube plan costs £60 a month with £150 upfront, a real premium over its 24-month equivalent at £21 a month, aimed specifically at testing 5G performance at an address before committing to a longer term.' },
      { question: 'What is the biggest risk with 5G home broadband?', answer: 'Address-level signal variability. A network that performs well on one street can perform very differently a few hundred metres away, which is why checking indoor signal strength at the specific property, not just a postcode-level coverage map, matters more than with a fixed line.' },
    ],
  },

  'best-full-fibre-broadband-uk': {
    body: (
      <>
        <p>The best <strong>full fibre broadband</strong> is the provider that gives you the right balance of speed, price and genuine reliability at your postcode, not the one with the biggest advertising budget. Ofcom&apos;s own satisfaction data and each provider&apos;s formal complaints record tell a more useful story than review-platform star ratings alone, and the two do not always point the same way. Below is what the evidence actually shows for each major UK full-fibre provider, checked directly against official sources.</p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Price and evidence check:</strong> provider facts, prices and the Ofcom and Trustpilot figures below were checked against official UK sources on 24 August 2026. Prices and availability change by address; confirm the live figure at checkout.
          </p>
        </div>

        <h2>Why full fibre is different</h2>
        <p>Full fibre, also called FTTP, runs fibre optic cable all the way to the property rather than handing over to copper at a street cabinet. That generally means faster, more consistent upload speeds and lower latency than part-fibre (FTTC), and it is the technology most UK providers are now actively expanding rather than the copper network they are retiring.</p>

        <h2>Full fibre providers at a glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'From', 'Trustpilot (broadband-specific)', 'Ofcom complaints position', 'Best for'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['BT', '£30.99/mo', '1.5/5', 'Third-worst, Q1 2026 (7/100k)', 'Widest coverage, 98% of UK homes'],
                ['Sky', '£25/mo', '~1.2-1.3/5', 'Below average, Q4 2025 (5/100k)', 'Family TV bundles, familiar brand'],
                ['EE', '£22.99/mo', '1.3/5', 'Worst-three, Q4 2025 (~10/100k)', 'Speed, reliability and 4G/5G backup'],
                ['Vodafone', '£25/mo', '1.3/5', 'Second-worst, Q1 2026 (8/100k)', '2026 award-winning value and speed survey scores'],
                ['Plusnet', '£21.99/mo', '2.0/5', 'Best of any major provider, Q1 2026 (4/100k)', 'Budget price with the strongest complaints record'],
                ['Community Fibre', '£12.50/mo', '4.7/5', '92% Ofcom satisfaction, 2025 data', 'London value and symmetrical speed'],
                ['Hyperoptic', '£19.00/mo', '4.5/5', 'Not in worst-ranked providers', 'Symmetrical speed in apartment blocks'],
                ['toob', '£18.00/mo', '4.5/5', 'Not in worst-ranked providers', 'South East England value, small disclosed rises'],
                ['Zen Internet', '£30/mo', '4.4/5', 'Not in worst-ranked providers', 'Static IP included, no price rise'],
              ].map(([provider, price, tp, ofcom, best]) => (
                <tr key={provider} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{provider}</td>
                  <td className="px-4 py-3 text-slate-700">{price}</td>
                  <td className="px-4 py-3 text-slate-700">{tp}</td>
                  <td className="px-4 py-3 text-slate-600">{ofcom}</td>
                  <td className="px-4 py-3 text-slate-600">{best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Read the full review for any provider: <Link href="/providers/bt">BT</Link>,{' '}
          <Link href="/providers/sky">Sky</Link>, <Link href="/providers/ee">EE</Link>,{' '}
          <Link href="/providers/vodafone">Vodafone</Link>, <Link href="/providers/plusnet">Plusnet</Link>,{' '}
          <Link href="/providers/community-fibre">Community Fibre</Link>,{' '}
          <Link href="/providers/hyperoptic">Hyperoptic</Link>, <Link href="/providers/toob">toob</Link> or{' '}
          <Link href="/providers/zen-internet">Zen Internet</Link>.
        </p>

        <h2>Why Trustpilot scores and Ofcom complaints data tell different stories</h2>
        <p>Every major national full-fibre provider covered on this site has a low Trustpilot score, several below 1.5 out of 5. That is not a sign the whole industry provides poor service; it reflects how Trustpilot reviews are collected. Customers are far more likely to leave a review after a bad installation, an unresolved fault or a difficult cancellation call than after an unremarkable, working connection, so the review pool is skewed toward complaints by design.</p>
        <p>Ofcom&apos;s own complaints data measures something different: the actual volume of formal complaints across a provider&apos;s entire customer base. On that measure, the same providers separate out much more clearly. Plusnet recorded the best complaints record of any major UK provider in Ofcom&apos;s Q1 2026 report, at 4 per 100,000 customers, while TalkTalk topped the table at 10 per 100,000 and Vodafone followed at 8. Sky&apos;s Q4 2025 figure of 5 per 100,000 sat comfortably below the industry average of 8 at the time. Treat the Ofcom figures as the more representative signal of typical service reliability, and Trustpilot as useful only for reading specific, recent complaint themes.</p>

        <h2>Vodafone&apos;s 2026 award wins, and how they fit the wider evidence</h2>
        <p>Vodafone won six category awards, including Best Overall, at the Expert Reviews Broadband Awards 2026, based on a survey of over 1,500 UK residents conducted in September 2025 covering speed, value, reliability and performance while gaming and streaming. It was also named Most Popular Broadband Provider at the 2026 Uswitch Broadband Awards. Those are genuine, survey-based recognitions, not marketing claims Vodafone makes about itself.</p>
        <p>They sit alongside, not instead of, the complaints picture above: Ofcom&apos;s Q1 2026 report named Vodafone the second most complained-about broadband provider in the UK. Both things can be true at once. A broad customer survey capturing perceived value and speed, and a count of formal complaints when something goes wrong, measure genuinely different aspects of a provider&apos;s service. Vodafone appears to deliver strong day-to-day value and performance for most customers, while its complaint-handling record lags when problems do occur.</p>

        <h2>National providers: BT, Sky, EE and Vodafone</h2>
        <p><strong>BT</strong> remains the widest-reaching option, covering around 98% of UK homes over the Openreach network, useful anywhere a smaller altnet has not built. Its Full Fibre range starts at £30.99 a month for Full Fibre 300 (checked 16 October 2026), with a flat £4 a month price rise every March built into every current contract.</p>
        <p><strong>Sky</strong> is the strongest pick for a household that also wants a TV bundle, with Sky Stream delivering television over the same broadband connection. Sky&apos;s Ofcom complaints record, 5 per 100,000 in Q4 2025, was comfortably below the industry average at the time.</p>
        <p><strong>EE</strong> offers a genuinely distinctive feature: automatic 4G or 5G mobile backup if the fixed line drops, and it was named National Broadband Provider of the Year at the 2026 Uswitch Telecoms Awards for speed and reliability. Its Ofcom complaints position was weaker, in the worst-three bracket in Q4 2025.</p>
        <p><strong>Vodafone</strong> is the strongest 2026-award performer on price, speed and reliability survey data, and bundles an Apple TV 4K device on its Xtra plans, but carries the second-worst Ofcom complaints position of any major UK provider as of Q1 2026.</p>

        <h2>The budget pick with the best complaints record: Plusnet</h2>
        <p><strong>Plusnet</strong>, part of BT Group, starts from £21.99 a month and recorded the best Ofcom complaints figure of any major UK provider in Q1 2026, at 4 per 100,000 customers, against a 6-per-100,000 industry average. Its Trustpilot score is low, in line with the rest of the industry, but the regulatory evidence points to it being a genuinely strong, low-risk budget choice rather than a compromise pick.</p>

        <h2>Full-fibre altnets: Community Fibre, Hyperoptic, toob and Zen Internet</h2>
        <p>Where a full-fibre altnet reaches a specific address, it is frequently the stronger choice than a national Openreach-based provider, on both price and independently measured customer sentiment. <strong>Community Fibre</strong>, concentrated in London with recent expansion into Surrey and Sussex, recorded 92% customer satisfaction in Ofcom&apos;s 2025 data, 8 points above the industry average, alongside a 4.7 Trustpilot score from around 91,000 reviews. <strong>Hyperoptic</strong> and <strong>toob</strong> both offer fully symmetrical speeds above their entry tiers and Trustpilot scores around 4.5. <strong>Zen Internet</strong> includes a free static IP on every plan and a Contract Price Promise against mid-contract rises, at a higher price than the altnets above, aimed at households that value certainty and support over the lowest headline cost.</p>
        <p>The trade-off with every altnet on this list is coverage: each covers a small, specific footprint rather than a national one, so checking the exact address matters more than with BT, Sky, EE or Vodafone.</p>

        <h2>What to compare on a full fibre deal</h2>
        <ul>
          <li>Whether the provider uses Openreach FTTP, another wholesale network, or its own independent infrastructure</li>
          <li>The speed tier your household actually needs, not the fastest one advertised</li>
          <li>Whether a scheduled price rise is built into the contract, and how large it is</li>
          <li>Ofcom&apos;s published complaints data for that provider, not just its Trustpilot score</li>
          <li>Whether a stronger-value altnet is available at your exact address before defaulting to a national brand</li>
        </ul>

        <h2>The simplest buying rule</h2>
        <p>Check what a genuine full-fibre altnet offers at your exact address first; where one reaches, it is frequently better value and better reviewed than a national provider at the same price. Where none does, weigh Ofcom&apos;s complaints data alongside price rather than the headline monthly cost alone, since the providers at the top of this market currently differ far more on service reliability than on the price of a comparable speed tier.</p>
      </>
    ),
    faqs: [
      { question: 'What is the best full fibre broadband in the UK?', answer: 'There is no single best FTTP provider for every address. Where a full-fibre altnet such as Community Fibre, Hyperoptic, toob or Zen Internet reaches, it is frequently better value and better reviewed than a national provider. Among national providers, Plusnet has the strongest Ofcom complaints record, Vodafone the strongest 2026 award and survey results, and BT the widest coverage.' },
      { question: 'Why do BT, Sky, EE and Vodafone all have low Trustpilot scores?', answer: 'Trustpilot reviews are self-selected and skew toward customers who had a specific bad experience, such as a difficult installation or cancellation call, rather than the average customer. Ofcom’s complaints data measures formal complaint volume across the entire customer base and is the more representative signal; on that measure, providers separate out much more clearly, from Plusnet’s best-in-class 4 per 100,000 to TalkTalk’s 10.' },
      { question: 'Is Vodafone broadband actually good if it won 2026 awards but has a poor complaints record?', answer: 'Both things are genuine and measure different aspects of the service. Vodafone’s 2026 award wins are based on a broad customer survey of speed, value and reliability perception, while Ofcom’s complaints data counts formal complaints when something goes wrong. Vodafone appears to deliver strong everyday value for most customers, with a real, evidenced weak point in complaint handling for the minority who need it.' },
      { question: 'Is full fibre worth paying more for than part-fibre?', answer: 'Usually yes, especially for households that upload large files, work from home on video calls, or want a more stable long-term connection. Full fibre runs fibre all the way to the property rather than handing over to copper at a cabinet, which generally means faster, more consistent upload speeds and lower latency.' },
      { question: 'Do most homes need gigabit full fibre?', answer: 'No. A mid-tier full-fibre package, typically 150 to 300 Mbps, comfortably covers most households, including several simultaneous streams and devices. Gigabit-and-above tiers mainly suit very heavy-use households or people who specifically want headroom for the future.' },
    ],
  },

  'best-broadband-for-gaming-uk': {
    body: (
      <>
        <p>The best broadband for gaming in the UK is full fibre (FTTP) with low latency. For online gaming, ping (latency) matters more than raw download speed: a 50 Mbps connection with 10ms ping will outperform a 500 Mbps connection with 60ms ping. Here is what to look for and which providers deliver it.</p>
        <p>If you are lining up <Link href="/guides/gta-6-broadband-uk" className="font-semibold text-sky-700 hover:underline">Grand Theft Auto VI on 19 November 2026</Link>, start with the confirmed pre-load date, a wired console and spare storage. Rockstar has not published a file size, and the launch build is a single-player game, so do not buy gigabit broadband only because a forum thread guessed the download.</p>

        <h2>What makes broadband good for gaming?</h2>
        <p>Online gaming has three key requirements: low latency (ping), consistent speeds (low jitter), and enough bandwidth for your household. Unlike streaming, gaming sends and receives small packets of data constantly — the speed at which those packets travel (latency) determines whether your gaming experience is smooth or laggy.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Requirement', 'Minimum', 'Ideal', 'Why it matters'].map(h => (
                  <th key={h} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Download speed', '10 Mbps', '50–150 Mbps', 'Game downloads, updates, streaming'],
                ['Upload speed', '3 Mbps', '10+ Mbps', 'Sending your game state to servers'],
                ['Ping (latency)', 'Under 50ms', 'Under 20ms', 'Reaction time in-game'],
                ['Jitter', 'Under 15ms', 'Under 5ms', 'Consistency of connection'],
                ['Packet loss', 'Under 1%', 'Under 0.1%', 'Dropped inputs and lag spikes'],
              ].map(([req, min, ideal, why]) => (
                <tr key={req} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{req}</td>
                  <td className="px-4 py-3 text-slate-700">{min}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">{ideal}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Best broadband providers for gaming UK 2026</h2>

        <h3>EE — best for reliability and speed</h3>
        <p>EE consistently delivers among the fastest average speeds of any major UK provider using the Openreach network, according to Ofcom&apos;s Connected Nations data. EE&apos;s full-fibre packages start from £22.99 a month and offer typical latency of 5 to 8ms on FTTP connections. EE also offers a gaming-focused router add-on with traffic prioritisation for gaming packets.</p>

        <h3>Community Fibre — best for ping and symmetrical speed</h3>
        <p>Community Fibre&apos;s pure FTTP network delivers some of the lowest latency available, typically 4 to 6ms, with genuinely symmetrical speeds up to 3,000 Mbps up and down on its fastest current tier, ideal for households where multiple people stream and game simultaneously or want to host a private game server. From £12.50 a month, the cheapest full-fibre package on this site. Coverage has expanded beyond London into parts of Surrey and Sussex, though it remains far from nationwide.</p>

        <h3>Hyperoptic — best symmetrical full fibre for flats and apartments</h3>
        <p>Hyperoptic offers genuinely symmetrical broadband (matching upload and download speeds) on every tier except its cheapest entry-level plan, with latency typically falling between 4 and 7ms. Available mainly in selected apartment buildings and developments across major UK cities. From £21.50 a month.</p>

        <h3>Virgin Media — fastest widely available top-end speed</h3>
        <p>Virgin Media&apos;s cable network delivers the fastest widely available speeds in the UK, up to 1,130 Mbps on its Gig1 tier, well suited to households with multiple gamers and streamers active at once. Latency on Virgin&apos;s network is typically 8 to 12ms, slightly higher than full fibre but still acceptable for competitive gaming. From £33 a month.</p>

        <h3>BT — best coverage for gaming</h3>
        <p>If you live outside a city, BT is often the only provider offering full-fibre speeds across its 98% Openreach coverage area, the widest of any provider on this site. BT&apos;s FTTP connections deliver 5 to 8ms latency, and its Smart Hub 2 router includes automatic band steering and quality-of-service gaming prioritisation. Full-fibre packages from £23.99 a month, and Full Fibre 900&apos;s Stay Fast Guarantee pays out automatically if delivered speed drops below a set minimum, a genuine reliability backstop for anyone gaming competitively.</p>

        <h3>Zen Internet — best for hosting a private game server</h3>
        <p>Zen Internet includes a free static IP address as standard on every plan, usually a paid extra elsewhere, which matters specifically for anyone hosting a private game server, running port forwarding for peer-to-peer titles, or wanting a stable, predictable address for remote access. It also carries a Contract Price Promise, no mid-contract price rise for the length of the term. From £30 a month.</p>

        <h2>Ping vs download speed: which matters more for gaming?</h2>
        <p>Ping matters more than download speed for online gaming. A connection with 20ms ping and 50 Mbps download will feel smoother than one with 80ms ping and 500 Mbps download. This is because online gaming involves constant two-way communication with game servers; every input sent and every update received depends on how quickly the connection responds, not how much data it can move in bulk.</p>
        <p>Download speed matters mainly for downloading games (a 50 GB game downloads in around 70 minutes at 100 Mbps) and for households where multiple people are streaming while someone else games.</p>

        <h2>Wired vs Wi-Fi for gaming</h2>
        <p>Always use a wired Ethernet connection for serious gaming. Wi-Fi adds 5 to 20ms of latency on top of a connection&apos;s base latency and introduces jitter, variable delay that causes lag spikes. A wired connection directly from the router eliminates both problems. If running a cable is not possible, a powerline adapter, which carries Ethernet through existing mains wiring, is a significantly better option than Wi-Fi for gaming.</p>

        <h2>Why contract length and price rises matter for gamers too</h2>
        <p>Most full-fibre gaming-suitable packages are sold on 24-month contracts, with a flat, disclosed pounds-and-pence price rise each year at most national providers, following Ofcom&apos;s ban on inflation-linked rises from January 2025. This does not affect latency or performance directly, but it affects the real two-year cost of a package advertised mainly on its headline first-month price, worth factoring in alongside the ping and speed figures above when comparing options.</p>
        <div className="not-prose rounded-xl border-2 border-sky-200 bg-sky-50 p-5 my-6">
          <p className="font-bold text-slate-900 mb-1">Want a personalised recommendation instead?</p>
          <p className="text-sm text-slate-700 mb-3">Answer 6 quick questions about your household and gaming setup, and our free Broadband Match tool ranks the providers that actually fit — not just the cheapest headline price.</p>
          <a href="/tools/broadband-match" className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors">Find my broadband match &rarr;</a>
        </div>
      </>
    ),
    faqs: [
      { question: 'What broadband speed do I need for gaming?', answer: 'At least 10 Mbps download and 3 Mbps upload for online gaming. However, ping (latency) matters more than speed. Aim for under 20ms ping. A 50 Mbps connection with 10ms ping will outperform a 500 Mbps connection with 60ms ping for gaming.' },
      { question: 'What is a good ping for gaming in the UK?', answer: 'Under 20ms is excellent for gaming, 20 to 50ms is good for most games, 50 to 100ms is playable for casual gaming but may cause issues in fast-paced competitive games, and over 100ms will feel laggy in most online games. Full-fibre (FTTP) broadband typically achieves 4 to 10ms ping to UK servers.' },
      { question: 'Is Virgin Media good for gaming?', answer: 'Yes. Virgin Media\'s cable network delivers the fastest widely available speeds in the UK, up to 1,130 Mbps on its Gig1 tier, with typically 8 to 12ms latency, suitable for online gaming. It is not available everywhere; check coverage at your postcode, since its cable network reaches only around 52% of UK premises.' },
      { question: 'Does full fibre make gaming better?', answer: 'Yes. Full fibre (FTTP) delivers the lowest latency of any fixed-line broadband technology in the UK, typically 4 to 8ms, compared to 15 to 30ms on FTTC and 30 to 60ms on ADSL. Lower latency directly improves responsiveness in online games, and full fibre also has lower jitter, meaning less variation in ping.' },
      { question: 'What broadband is best for hosting a private game server?', answer: 'A static IP address makes hosting and port forwarding much more reliable, since the address does not change. Zen Internet includes a free static IP as standard on every plan, a genuine advantage for anyone specifically hosting a game server rather than just playing online.' },
    ],
  },

  'broadband-social-tariffs-uk': {
    body: (
      <>
        <p>A broadband social tariff is a heavily discounted broadband package offered to households receiving means-tested government benefits, from £12.50 a month, less than half the typical broadband price. Ofcom estimates 4.2 million UK households are eligible, but a thinkbroadband study published in August 2026 found only around 34% of eligible households are even aware social tariffs exist, and just 8.6% of Universal Credit recipients have taken one up.</p>

        <h2>Who qualifies for a broadband social tariff?</h2>
        <p>Eligibility varies by provider, but most social tariffs are available to households receiving any of the following benefits:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Benefit</th>
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">BT</th>
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Sky</th>
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Virgin</th>
                <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Vodafone</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Universal Credit', '✓', '✓', '✓', '✓'],
                ['Pension Credit', '✓', '✓', '✓', '✓'],
                ['Income Support', '✓', '✗', '✓', '✓'],
                ['Jobseeker\'s Allowance (income-based)', '✓', '✗', '✓', '✓'],
                ['Employment & Support Allowance', '✓', '✗', '✓', '✓'],
                ['Council Tax Support', '✓', '✗', '✗', '✗'],
              ].map(([benefit, ...cols]) => (
                <tr key={benefit} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{benefit}</td>
                  {cols.map((c, i) => (
                    <td key={i} className={`px-4 py-3 font-bold ${c === '✓' ? 'text-green-700' : 'text-slate-300'}`}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">Sky&apos;s Broadband Basics accepts Universal Credit or Pension Credit only, and is only available to existing Sky customers, a genuine restriction worth knowing before assuming it is an open sign-up option.</p>

        <h2>Social tariff broadband deals compared</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Tariff name', 'Monthly price', 'Download speed', 'Notes'].map(h => (
                  <th key={h} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Virgin Media', 'Essential Broadband', '£12.50/mo', '15 Mbps', 'Essential Broadband Plus: £20/mo for 54 Mbps'],
                ['Community Fibre', 'Essential', '£12.50/mo', '20 Mbps', 'London, Surrey and Sussex network only'],
                ['BT', 'Home Essentials', '£15.00/mo', '36 Mbps', 'Fibre 2 tier: £23/mo for 67 Mbps'],
                ['Hyperoptic', 'Fair Fibre 50', '£15.00/mo', '50 Mbps', 'Fair Fibre 150: £20/mo for 150 Mbps'],
                ['KCOM', 'Full Fibre Flex', '£14.99/mo', '30 Mbps', 'Hull and East Yorkshire network only'],
                ['Sky', 'Broadband Basics', '£20.00/mo', '36 Mbps', 'Existing Sky customers only'],
                ['NOW Broadband', 'Broadband Basics', '£20.00/mo', '36 Mbps', 'Owned by Sky, same eligibility pattern'],
                ['Vodafone', 'Essentials Broadband', '£20.00/mo', '73 Mbps', 'Rises to £25/mo after 12 months if no action taken'],
              ].map(([p, name, price, speed, notes]) => (
                <tr key={p} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{p}</td>
                  <td className="px-4 py-3 text-slate-700">{name}</td>
                  <td className="px-4 py-3 font-bold text-sky-700">{price}</td>
                  <td className="px-4 py-3 text-slate-700">{speed}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">Prices checked against each provider&apos;s own social tariff page, August 2026. Eligibility varies; check with the provider before applying.</p>

        <h2>Providers are burying their own social tariffs, a 2026 report found</h2>
        <p>A thinkbroadband study published in August 2026 directly tested how easy major providers make it to find and understand their own social tariff, against commitments made in the industry&apos;s Telecoms Consumer Charter. Its finding on BT was blunt: &ldquo;We would challenge anyone here to go to bt.com and find where social tariffs are without using a search engine. Once you find it, tell us how much it costs.&rdquo; Sky, Virgin Media and Vodafone all scored poorly too, for tariff information that was hard to locate and pricing or contract terms that were unclear once found. Smaller altnets, including Community Fibre, B4RN and B4SH, scored noticeably better on clarity and accessibility. The practical lesson: do not expect to find a social tariff through a provider&apos;s normal homepage or deals page; go directly to the specific social tariff sign-up page, often only reachable via search.</p>

        <h2>How to apply for a broadband social tariff</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Check which benefits you receive</strong> — use the eligibility table above to identify which providers you qualify with.</li>
          <li><strong>Go directly to the provider&apos;s social tariff page</strong> — social tariffs are rarely listed on standard comparison or deals pages; search for the tariff name directly.</li>
          <li><strong>Provide proof of eligibility</strong> — most providers ask for a recent Universal Credit or benefit statement. Some verify automatically if you provide your National Insurance number.</li>
          <li><strong>Cancel your existing broadband if switching</strong> — under One Touch Switch, your new provider handles this. Give your current provider notice if required.</li>
          <li><strong>Verify the price every 12 months</strong> — some tariffs, including Vodafone Essentials, automatically rise to a higher standard price if not proactively renewed after 12 months. Set a reminder to re-check annually.</li>
        </ol>

        <h2>Are social tariffs worth it?</h2>
        <p>Yes, social tariffs represent the best value broadband available in the UK for eligible households. Virgin Media Essential Broadband and Community Fibre Essential are jointly the cheapest at £12.50 a month, though Community Fibre&apos;s 20 Mbps edges out Virgin Media&apos;s 15 Mbps at the same price, if it is available at the address. Most social tariffs on the Openreach network use the same underlying line as standard packages, meaning line quality is identical to non-social deals at the same address.</p>
        <p>The main limitation is speed: most social tariffs cap at 15 to 73 Mbps. For a single person or couple using broadband for streaming, browsing and video calls, this is entirely sufficient. Larger households with heavy gaming or 4K streaming across multiple screens may find the lower-speed tiers limiting and should compare a higher-speed social tariff, such as Hyperoptic Fair Fibre 150 or BT&apos;s Fibre 2 tier, where available.</p>

        <h2>Why don&apos;t more people know about social tariffs?</h2>
        <p>Providers are not required to proactively offer social tariffs to eligible customers, and as the 2026 thinkbroadband report found, several make them genuinely difficult to locate even for someone actively searching. Ofcom has repeatedly called for providers to do more to raise awareness. Of the 4.2 million eligible UK households, only around 34% are aware social tariffs exist, and just 8.6% of Universal Credit recipients have taken one up, despite a typical saving of roughly £12 a month or more over a standard tariff.</p>
      </>
    ),
    faqs: [
      { question: 'What is a broadband social tariff?', answer: 'A broadband social tariff is a discounted broadband package available to households receiving means-tested benefits such as Universal Credit or Pension Credit. Social tariffs start from £12.50 a month, significantly cheaper than standard broadband deals. They are offered by BT, Sky, Virgin Media, Vodafone, Hyperoptic, Community Fibre, KCOM and others.' },
      { question: 'Who qualifies for a broadband social tariff in the UK?', answer: 'Most providers accept Universal Credit, Pension Credit, Income Support or income-based Jobseeker\'s Allowance. Exact eligibility varies: Sky\'s Broadband Basics only accepts Universal Credit or Pension Credit and is limited to existing Sky customers, while BT\'s Home Essentials also accepts Council Tax Support.' },
      { question: 'Which broadband social tariff is cheapest?', answer: 'Virgin Media Essential Broadband and Community Fibre Essential are jointly the cheapest at £12.50 a month. Community Fibre offers a faster 20 Mbps against Virgin Media\'s 15 Mbps at the same price, but its network is limited to London, Surrey and Sussex.' },
      { question: 'Why is it hard to find a social tariff on some provider websites?', answer: 'A thinkbroadband study published in August 2026 found that BT, Sky, Virgin Media and Vodafone all made their own social tariffs difficult to locate and understand, despite commitments in the industry\'s Telecoms Consumer Charter. Go directly to the specific tariff\'s sign-up page rather than a provider\'s general deals page.' },
      { question: 'Can I switch from a standard broadband deal to a social tariff?', answer: 'Yes. If you become eligible for a social tariff while on a standard deal, you can switch. If moving to a different provider, use One Touch Switch. If staying with your current provider, ask to move to their social tariff directly; you should not face an early termination charge for switching to a social tariff with the same provider.' },
    ],
  },

  'best-broadband-for-rural-areas-uk': {
    body: (
      <>
        <p>The best broadband for <strong>rural areas</strong> is the connection type that is genuinely available at the property and stable enough for everyday use. Ofcom&apos;s Spring 2026 Connected Nations data shows exactly why this matters: gigabit-capable coverage is 93% in urban areas but only 66% in rural areas, so a national headline figure tells a rural household very little. The first question is often not "which provider is best?" but "which technology can really serve this address well?"</p>

        <h2>What rural broadband buyers should check first</h2>
        <ul>
          <li>Whether the postcode can get full fibre, FTTC, satellite, or 4G/5G home broadband</li>
          <li>How far the property is from the cabinet if relying on older copper-based broadband</li>
          <li>Whether mobile broadband coverage is strong enough to be realistic</li>
          <li>Whether the property qualifies for the UK Gigabit Broadband Voucher Scheme, which can subsidise extending a fixed fibre connection to an eligible rural address</li>
        </ul>

        <h2>Best rural broadband options by connection type</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Connection type', 'Best when', 'Main limitation'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Full fibre (FTTP)', 'Available at the property and the best fixed-line performance is wanted', 'Still unavailable at around a third of rural properties'],
                ['FTTC / standard fibre', 'The only practical fixed-line option', 'Speed can fall sharply on long rural line runs'],
                ['4G or 5G home broadband', 'Mobile coverage is strong and fixed-line choices are weak', 'Performance can vary with signal and congestion'],
                ['Satellite (Starlink)', 'Fixed and mobile options are all genuinely weak or unavailable', 'A larger upfront equipment cost, from around £299 to £449'],
              ].map(([type, bestWhen, limitation]) => (
                <tr key={type} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{type}</td>
                  <td className="px-4 py-3 text-slate-700">{bestWhen}</td>
                  <td className="px-4 py-3 text-slate-600">{limitation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Which providers usually make the shortlist</h2>
        <p><strong>BT</strong> is often relevant in rural areas because of its broad national reach, around 98% of UK premises via Openreach, one of the widest of any provider. For 5G home broadband specifically, <strong>National Broadband</strong>, from £34.99 a month, is worth prioritising over a single-network option: it connects to whichever of the UK&apos;s four mobile networks is strongest at the specific address, a genuinely better fit for rural properties than committing to one network upfront. <strong>Three</strong>, from £29 a month, offers the best value where its own 5G signal is strong, and <strong>EE&apos;s Smart 5G Hub</strong> has the broadest single-network 5G coverage.</p>

        <h2>When satellite makes sense in the countryside</h2>
        <p>Where fixed-line and mobile options are all genuinely weak, Starlink is now the only consumer satellite option with genuinely competitive speeds, typically 120 to 300 Mbps with latency around 25ms. UK residential plans run from £40 to £80 a month, plus a dish and router kit from around £299 to £449. This is a considerably larger upfront cost than a typical fixed-line router, so it is worth checking eligibility for the Gigabit Broadband Voucher Scheme first, since a subsidised fibre extension can sometimes work out more cost-effective once installation is included.</p>

        <h2>When mobile broadband makes sense in the countryside</h2>
        <p>4G and 5G home broadband can work surprisingly well in some rural homes, especially where fixed-line options are poor and mobile coverage at the property is strong. But this is highly local: performance can change dramatically between villages, between roads, and even between two nearby buildings, which is exactly why a multi-network option like National Broadband is a genuinely different value proposition from a single-network provider for a rural address.</p>

        <h2>What rural households should prioritise</h2>
        <ul>
          <li>Stability before headline speed</li>
          <li>Real postcode and address-level availability before national advertising claims</li>
          <li>Trial periods or returns flexibility if testing a mobile or satellite broadband option</li>
          <li>Checking Gigabit Broadband Voucher Scheme eligibility before assuming satellite is the only route to a fast connection</li>
        </ul>

        <h2>The best rule of thumb</h2>
        <p>In rural broadband, the best option is often the best <em>available</em> option, not the flashiest one on paper. Start with connection reality, then compare providers inside the technologies the property can actually get.</p>
      </>
    ),
    faqs: [
      { question: 'What is the best broadband for rural areas in the UK?', answer: 'Full fibre is the best rural option where available, but Ofcom\'s Spring 2026 data shows gigabit-capable coverage is only 66% in rural areas against 93% in urban areas. Where fixed-line options are weak, National Broadband\'s multi-network 5G service or Starlink satellite are worth checking.' },
      { question: 'Is 5G broadband good for rural areas?', answer: 'Sometimes, but only where local mobile coverage is genuinely strong, and this varies a lot by exact location. National Broadband, from £34.99 a month, connects to whichever of the UK\'s four mobile networks is strongest at the address, a better fit for rural properties than committing to a single network upfront.' },
      { question: 'Is satellite broadband a good option for rural areas?', answer: 'Starlink is currently the only consumer satellite option with genuinely competitive speeds, typically 120 to 300 Mbps. UK plans run from £40 to £80 a month plus a dish and router kit from around £299 to £449, a real upfront cost worth weighing against a subsidised fibre extension under the Gigabit Broadband Voucher Scheme first.' },
      { question: 'Why is rural broadband often slower?', answer: 'Older copper-based broadband can lose speed over long distances from the cabinet or exchange, and full-fibre rollout has reached only around two-thirds of rural properties against 93% of urban ones, per Ofcom\'s Spring 2026 data.' },
    ],
  },

  'moving-house-broadband-checklist-uk': {
    body: (
      <>
        <p>
          <strong>Start broadband planning the day you know the new address, then work backwards from moving day.</strong>{' '}
          Check what is available there first. Then either transfer the current contract, place a new order, or leave if
          the provider cannot serve the property.{' '}
          <a href="https://www.openreach.com/help-and-support/moving-home" target="_blank" rel="noopener noreferrer">
            Openreach tells movers to treat broadband as a priority as soon as they have a completion date
          </a>
          , especially for a new build that already has a fibre socket.
        </p>
        <p>
          One Touch Switch is for changing provider at your current address, not for a house move.{' '}
          <a
            href="https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ofcom designed One Touch Switch for that same-address change
          </a>
          . A house move is usually a home-move transfer or a new installation at a different property. If you want the
          old and new lines to overlap, Ofcom says you manage the cancellation yourself and One Touch Switch does not
          apply.
        </p>

        <h2>Moving house broadband timeline</h2>
        <div
          role="region"
          aria-label="Moving house broadband timeline"
          tabIndex={0}
          className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['When', 'What to do', 'Why it matters'].map((heading) => (
                  <th key={heading} scope="col" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">As soon as you have the new address</th>
                <td className="border border-slate-200 px-4 py-3">Check providers and connection type at the exact address, not just the town.</td>
                <td className="border border-slate-200 px-4 py-3">Virgin Media, full fibre and older copper services are not interchangeable between streets.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Four weeks before</th>
                <td className="border border-slate-200 px-4 py-3">Compare a transfer with a new-customer order. Ask the current provider about remaining term, any move fee and whether the same speed exists at the new home.</td>
                <td className="border border-slate-200 px-4 py-3">A slower technology at the new address can change the package even if the brand is available.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Two to four weeks before</th>
                <td className="border border-slate-200 px-4 py-3">Book the transfer or new order. Sky asks for 2 to 4 weeks. BT asks you to try for two weeks. Virgin Media can self-install from about three days where the network is already in the property.</td>
                <td className="border border-slate-200 px-4 py-3">Engineer slots for a first full-fibre install take longer than a self-install on an existing socket.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">One week before</th>
                <td className="border border-slate-200 px-4 py-3">Confirm activation and stop dates in writing. Pack the provider router separately. Photograph the socket or fibre box at both properties.</td>
                <td className="border border-slate-200 px-4 py-3">A previous occupant&apos;s live service can delay a working-line takeover if they have not cancelled.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Moving day</th>
                <td className="border border-slate-200 px-4 py-3">Plug the router into the correct socket or Openreach ONT. Keep mobile data as backup. Do not cancel the old line until the new one works, unless the provider has already set a stop date.</td>
                <td className="border border-slate-200 px-4 py-3">If a promised start date slips, providers in Ofcom&apos;s automatic compensation scheme pay £6.46 for each calendar day of delay.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">After you move</th>
                <td className="border border-slate-200 px-4 py-3">Test the line, return kit you no longer need, and keep the final bill and any cooling-off deadline.</td>
                <td className="border border-slate-200 px-4 py-3">You have 14 calendar days to cancel a new order. If the service has started you may still pay for use and installation.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Use our{' '}
          <Link href="/compare">postcode comparison</Link> for the new address before you accept a transfer. If you are
          unsure what speed the household needs, the{' '}
          <Link href="/guides/what-broadband-speed-do-i-need">speed-need guide</Link> is the next stop.
        </p>

        <h2>Transfer, new order or leave?</h2>
        <div
          role="region"
          aria-label="Transfer, new order or leave comparison"
          tabIndex={0}
          className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Option', 'Use when', 'Watch for'].map((heading) => (
                  <th key={heading} scope="col" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Transfer the current contract</th>
                <td className="border border-slate-200 px-4 py-3">The same provider can serve the new address and you want to keep the remaining term.</td>
                <td className="border border-slate-200 px-4 py-3">A move fee, a slower technology, or a new minimum term if you upgrade. BT says remaining term transfers if you take the same service, but a term under three months becomes a new three-month contract.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">New order at the new address</th>
                <td className="border border-slate-200 px-4 py-3">You are out of contract, the current brand is missing, or a better full-fibre option exists.</td>
                <td className="border border-slate-200 px-4 py-3">This is a new installation, not One Touch Switch, if the old service is at a different property. Set a stop date on the old account yourself if you need overlap.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Leave the current provider</th>
                <td className="border border-slate-200 px-4 py-3">They cannot serve the new address, or you prefer a different network such as Virgin Media or an altnet.</td>
                <td className="border border-slate-200 px-4 py-3">Citizens Advice says you might still face a cancellation fee if they cannot provide the same service, and you should ask them to reduce or remove it. Do not assume a waiver until it is confirmed in writing.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Can I take my broadband to my new home?</h2>
        <p>
          Often yes, if the same provider covers the new property.{' '}
          <a
            href="https://www.citizensadvice.org.uk/consumer/phone-internet-downloads-or-tv/cancelling-a-phone-tv-internet-or-mobile-contract/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Citizens Advice says you should check whether they offer the same service in the new area
          </a>
          , and that a small fee can apply to move it. Official current examples: Virgin Media charges £20 to transfer,
          or £35 if the package changes; Sky charges £50 unless you have Sky VIP; BT says there is generally no home-move
          fee, with a £30 or £70 connection charge only if a new BT line is needed and you stay on the old package.
        </p>
        <p>
          Coverage is not the same as the same speed. Openreach warns that moving from full fibre to fibre-to-the-cabinet,
          or the other way, can change setup and speeds. Virgin Media uses its own network, so a street that looks nearby
          can still be off-net. Check the exact address before you promise the household it will &ldquo;just move&rdquo;.
        </p>

        <h2>How far in advance to order broadband when moving</h2>
        <p>
          Book once the moving date is firm enough for the provider to hold a slot, then keep a buffer.{' '}
          <a href="https://www.sky.com/help/articles/home-move" target="_blank" rel="noopener noreferrer">
            Sky says it needs two weeks&apos; notice
          </a>{' '}
          and that a transfer can take up to 10 working days. BT asks you to try for two weeks and says the process can
          take two weeks, though it is often faster. Virgin Media says a self-install can be ready in as little as three
          days, with an engineer visit usually around 7 to 14 days, and you must leave at least one day between
          disconnecting the old home and activating the new one.
        </p>
        <p>
          First-time full fibre at an existing house, a missing socket, or a new-build ONT that is not yet live can take
          longer. Openreach says timescales depend on what is already in the property. If the provider misses a promised
          start date,{' '}
          <a
            href="https://www.ofcom.org.uk/phones-and-broadband/service-quality/automatic-compensation-need-know"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ofcom&apos;s automatic compensation scheme
          </a>{' '}
          pays £6.46 for each calendar day of delay for signed-up providers, and £32.31 for a missed engineer appointment.
        </p>

        <h2>What to pack, and what to leave</h2>
        <div
          role="region"
          aria-label="Broadband equipment to take or leave when moving house"
          tabIndex={0}
          className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Item', 'Take or leave', 'Source'].map((heading) => (
                  <th key={heading} scope="col" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Provider router or hub</th>
                <td className="border border-slate-200 px-4 py-3">Take it, unless you are leaving that provider and they have asked for it back.</td>
                <td className="border border-slate-200 px-4 py-3">BT: take the Hub. Openreach: plug the router into the ONT once the service is ready.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Openreach fibre modem or ONT</th>
                <td className="border border-slate-200 px-4 py-3">Leave it at the old property if it is the wall-mounted fibre box.</td>
                <td className="border border-slate-200 px-4 py-3">BT: leave an Openreach fibre modem for the people who move in. Openreach: new builds already have an ONT.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Sky dish</th>
                <td className="border border-slate-200 px-4 py-3">Leave the dish. Take Sky Glass or Sky Stream with you.</td>
                <td className="border border-slate-200 px-4 py-3">Sky help: leave the dish; Glass and Stream do not need a home-move booking in the same way.</td>
              </tr>
              <tr>
                <th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Your own mesh kit and cables</th>
                <td className="border border-slate-200 px-4 py-3">Take them. They are not tied to the old line.</td>
                <td className="border border-slate-200 px-4 py-3">Test Wi-Fi in the rooms you will actually use after the line is live.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          If you later switch provider rather than transferring, use the{' '}
          <Link href="/guides/how-to-switch-broadband-uk">One Touch Switch guide</Link> at the new address once you live
          there. That is a same-address switch, not a house move.
        </p>

        <h2>Broadband not available at my new address</h2>
        <p>
          If the current provider cannot serve the new property, ask in writing what they will charge to end the
          contract. Citizens Advice says a cancellation fee might still apply and that it is worth explaining the move
          because some providers reduce or remove it. Treat any waiver as a confirmed account note, not a rumour.
        </p>
        <p>
          Then check what actually exists at the new address: Openreach full fibre, Virgin Media, an altnet, or only
          slower copper. A{' '}
          <Link href="/guides/best-rolling-monthly-broadband-deals">rolling monthly or 12-month deal</Link> can be
          rational if you might move again. Eligible households should check{' '}
          <Link href="/guides/broadband-social-tariffs-uk">social tariffs</Link> before signing a long expensive term.
          Rural or new-build gaps belong in the{' '}
          <Link href="/guides/best-broadband-for-rural-areas-uk">rural broadband guide</Link> rather than a guess that
          &ldquo;fibre will arrive next month&rdquo;.
        </p>

        <h2>One Touch Switch versus a house move</h2>
        <p>
          One Touch Switch is the standard way to change broadband provider where you already live. You contact the
          provider you want to join. They match the current service, send the switching information (including any early
          termination charge) and, if you go ahead, arrange the cutover. Your old service should then stop
          automatically. Ofcom says any loss of service on that process should not last longer than one working day, and
          the old provider must not charge you for a notice period after the switchover date.
        </p>
        <p>
          A house move is different because the new line is at another address. If you want broadband at both homes
          during the move, Ofcom says you manage your own switch: order the new service, cancel the old one separately,
          and accept that One Touch Switch does not apply. That overlap is how you avoid a dark week, but you may pay
          for both services for a few days. Our longer rights explainer is still{' '}
          <Link href="/guides/broadband-moving-house">broadband when moving house</Link>, including contract and
          landline context.
        </p>

        <h2>Phone line, telecare and moving day</h2>
        <p>
          Openreach is upgrading the UK to digital phone lines by January 2027, so a new address may already run voice
          through the router. Check telecare, alarms and older handsets before you unplug anything. If you need to keep
          a landline number, ask during the order: BT says you can usually keep it when the new home uses the same
          exchange, and you cannot keep it when the dialling code changes. Sky says you will not keep the old landline
          number on a home move. The{' '}
          <Link href="/guides/landline-switch-off-explained-uk">landline switch-off guide</Link> covers backup power and
          alarms.
        </p>
        <p>
          On the day, plug in, test, then worry about mesh Wi-Fi. If the line is live but one room is dead, that is a
          Wi-Fi problem, not a failed move. Keep the activation email. If an engineer is due, someone needs to be in;
          Ofcom compensation for a missed appointment is £32.31 where the scheme applies.
        </p>

        <h2>Buying checklist before you sign</h2>
        <ul>
          <li>Write down the new address, moving date, current provider, account number and remaining minimum term.</li>
          <li>Check availability and typical speed at the exact address, including whether an engineer or self-install is needed.</li>
          <li>Ask whether a transfer keeps the remaining term or starts a new one, and get any move fee in writing.</li>
          <li>If you are leaving, ask in writing whether an early termination charge applies because of the move.</li>
          <li>Set activation and stop dates so the old line does not die before the new one works, unless you accept a gap.</li>
          <li>Pack the router. Leave any Openreach ONT. Return kit only after the new service is working if you are changing provider.</li>
          <li>If anyone relies on a landline or telecare, confirm Digital Voice compatibility before you unplug.</li>
        </ul>
      </>
    ),
    faqs: [
      {
        question: 'What is a moving house broadband checklist?',
        answer:
          'It is the order of jobs that keeps you online when you change address: check the new property, decide whether to transfer or start a new order, book dates, pack the right kit and only then stop the old line. Start as soon as you know the address. A house move is usually a transfer or a new installation, not One Touch Switch, which Ofcom designed for changing provider where you already live.',
      },
      {
        question: 'Can I take my broadband to my new home?',
        answer:
          'Often yes, if your current provider can serve the new address. Citizens Advice says a small fee can apply to move the service. Virgin Media currently charges from £20, Sky charges £50 unless you have Sky VIP, and BT generally charges no home-move fee unless a new line is needed. If they cannot serve the new property, ask in writing what they will charge to end the contract rather than assuming a free exit.',
      },
      {
        question: 'When should I sort broadband when moving house?',
        answer:
          'The day you know the new address. Openreach says to treat broadband as a priority once you have a completion date. Use the following weeks to compare a transfer with a new order, then book two to four weeks before moving day. Sky wants two weeks of notice. Leaving it until packing week is how people end up on mobile data while they wait for an engineer.',
      },
      {
        question: 'How far in advance should I order broadband when moving?',
        answer:
          'Book as soon as the moving date is usable, with a buffer for engineer visits. Sky says a transfer can take up to 10 working days. BT asks you to try for two weeks. Virgin Media can self-install from about three days where its network is already in the property, or around 7 to 14 days with an engineer. First-time full fibre and new builds can take longer, so do not use the fastest advertised transfer as your only plan.',
      },
      {
        question: 'How do I transfer broadband to a new house?',
        answer:
          'Use the provider’s home-move process, not One Touch Switch. Give the new address, moving date and account details, then take the router unless they send a replacement. BT says remaining term transfers if you take the same service. Confirm in writing whether the speed, fee and contract length stay the same. Set a stop date at the old property so you are not paying for two lines longer than you need.',
      },
      {
        question: 'What if broadband is not available at my new address?',
        answer:
          'Ask the current provider in writing whether they will charge to end the contract because they cannot serve the new property. Citizens Advice says a cancellation fee might still apply and that you should ask them to reduce or remove it. Then check Openreach full fibre, Virgin Media, altnets and, if needed, rural or temporary options. Do not sign a long new term until the address check is real.',
      },
      {
        question: 'Does One Touch Switch work when I move house?',
        answer:
          'Not as the house-move process. Ofcom’s One Touch Switch is for changing provider at your current address. If you want the old and new services to overlap while you move, Ofcom says you manage the cancellation yourself and One Touch Switch does not apply. Use One Touch Switch later if you switch provider after you live at the new home.',
      },
    ],
  },

  'broadband-moving-house': {
    body: (
      <>
        <p>When moving house, your broadband needs to be handled in a specific order to avoid gaps in service, early termination charges, or paying for two connections at once. Use the dated <Link href="/guides/moving-house-broadband-checklist-uk">moving house broadband checklist and timeline</Link> for the week-by-week jobs, including when One Touch Switch does and does not apply. Since September 2024, most same-address switches are covered by Ofcom&apos;s One Touch Switch process, which shifted from an actively enforced pilot to the permanent industry standard when Ofcom closed its enforcement case on 11 June 2026, having found more than 2 million customers had already used it successfully.</p>

        <h2>Broadband moving house — the complete checklist</h2>
        <ul>
          <li>✓ Check broadband availability at your new address (8–12 weeks before move)</li>
          <li>✓ Decide whether to move your existing service or switch provider</li>
          <li>✓ Check your contract for early termination charges</li>
          <li>✓ Give your provider the required notice (minimum 14–30 days)</li>
          <li>✓ Book your new connection or engineer visit</li>
          <li>✓ Take your router to the new property</li>
          <li>✓ Return old equipment if leaving your current provider</li>
        </ul>

        <h2>Step 1: Check broadband availability at your new address</h2>
        <p>Do this as soon as you know your new address, ideally 8 to 12 weeks before moving. Use our postcode checker to see which providers and connection types are available. Do not assume your current provider covers your new address, especially if you are moving to a different area, a rural location, or a new build development.</p>
        <p>Key question: is full fibre (FTTP) available at the new address? Ofcom&apos;s Spring 2026 Connected Nations data put full-fibre coverage at 82% of UK premises and gigabit-capable coverage at 89%, though the split is uneven, 93% in urban areas against 66% in rural areas. If FTTP is available where you are moving, it is a genuine opportunity to upgrade, and if your current provider offers it at the new address, they can often migrate you without an early termination charge.</p>

        <h2>Step 2: Decide whether to move your service or switch</h2>
        <p>Contact your current provider first and ask: <em>&ldquo;Can I move my existing service to my new address?&rdquo;</em></p>
        <ul>
          <li><strong>If yes, same provider is available</strong> — you can usually transfer your contract to the new address without penalty, and without restarting your minimum term</li>
          <li><strong>If no, provider does not cover the new address</strong> — Ofcom&apos;s General Conditions require your provider to waive early termination charges when they genuinely cannot serve your new address, regardless of how much of your minimum term remains</li>
          <li><strong>Moving is a chance to switch and save</strong> — even if your current provider is available, compare deals at your new postcode before committing. New customers almost always get better rates than transferring existing customers</li>
        </ul>

        <h2>Step 3: Check your early termination charge</h2>
        <p>Log in to your account or check your contract documents to find your contract end date. If you are within your minimum term, the early termination charge (ETC) is typically your discounted monthly price, excluding VAT, multiplied by the months remaining, and Ofcom caps it at the total value of those remaining payments so a provider cannot charge more than what was actually owed. For example: 4 months remaining at £30 a month works out to up to £120 in ETC.</p>
        <p>Exceptions that may waive the ETC: your provider cannot serve the new address; your provider raises prices mid-contract by more than was disclosed at sign-up; your provider fails to deliver minimum guaranteed speeds.</p>

        <h2>Step 4: Give the required notice</h2>
        <p>Notice requirements vary by provider:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Notice required', 'How to give notice'].map(h => (
                  <th key={h} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['BT', 'Minimum 14 days', 'Online account or phone (0800 800 150)'],
                ['Sky', '31 days recommended', 'Online My Sky account or phone'],
                ['Virgin Media', '30 days', 'Online account or phone'],
                ['EE', 'Minimum 14 days', 'Online or phone (0800 956 6000)'],
                ['TalkTalk', '30 days', 'My Account online or phone'],
                ['Vodafone', '30 days', 'My Vodafone app or phone'],
              ].map(([p, notice, how]) => (
                <tr key={p} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{p}</td>
                  <td className="px-4 py-3 text-slate-700">{notice}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Step 5: Book the new connection</h2>
        <p>For FTTC connections at a property with existing phone wiring, activation is usually remote and takes 1 to 3 working days. For FTTP (full fibre) at a property being connected for the first time, you need an Openreach or altnet engineer visit; allow 2 to 4 weeks. Book as early as possible to get a slot close to your move date.</p>
        <p>If you are switching provider rather than just moving your existing service, One Touch Switch means your new provider handles the connection booking and notifies your old provider automatically; you do not need to contact your old provider separately. This is now the standard, permanent process across the industry rather than a pilot, following Ofcom&apos;s closure of its enforcement case in June 2026.</p>

        <h2>What moving house means for your home phone</h2>
        <p>A house move is also a natural point to check what happens to any home phone line. The UK&apos;s old analogue phone network (the PSTN) is being fully retired by 31 January 2027, and a new address may already be on Digital Voice, a phone service delivered through the broadband router rather than a separately powered copper line. If anyone in the household relies on a landline number, telecare or a medical alarm, request number porting during the order rather than cancelling the old line first, and confirm any alarm or telecare equipment is compatible with Digital Voice before the move, since it will not work in a power cut without a backup solution.</p>

        <h2>Step 6: On moving day</h2>
        <ul>
          <li><strong>Take your router</strong> — most providers let you keep your router during the contract; do not leave it behind</li>
          <li><strong>Do not cancel your old service until the new one works</strong> — give yourself at least 24 hours of overlap if possible</li>
          <li><strong>Return old equipment within the required timeframe</strong> — BT, Sky, and Virgin Media typically give you 30 days to return equipment or face a charge of £40–£80</li>
        </ul>

        <h2>Moving house as an opportunity to get a better deal</h2>
        <p>Industry research published in 2026 puts the average saving from switching broadband provider at roughly £180 to £292 over a contract, with one widely cited figure estimating that the 8.8 million UK households currently out of contract could save an average of £183.60 a year by switching rather than staying on a rolled-over standard tariff. New customer rates are almost always lower than retention rates, so use the move to check every provider available at your new postcode; you may find a faster service at a lower price than you were paying before. If you qualify for a social tariff, the potential saving is larger still: Ofcom estimates 4.2 million eligible households could save a further £100 to £240 a year on top of any switching saving, though take-up remains low.</p>
      </>
    ),
    faqs: [
      { question: 'Can I take my broadband with me when I move house?', answer: 'Usually yes, if your current provider covers your new address. Contact them and ask to transfer your service. If they cannot serve your new address, Ofcom\'s rules require them to let you exit the contract without an early termination charge. BT and Sky will usually transfer the contract without restarting the minimum term.' },
      { question: 'How much notice do I need to give before cancelling broadband when moving?', answer: 'Most providers require 30 days\' notice. BT requires a minimum of 14 days. Sky recommends 31 days. Virgin Media and TalkTalk require 30 days. Give notice as early as possible to avoid paying for an unused period after your move. If you are switching provider via One Touch Switch, your new provider handles the cancellation automatically.' },
      { question: 'Will I pay an early termination charge when moving house?', answer: 'Not necessarily. If your current provider cannot serve your new address, Ofcom\'s General Conditions require them to let you leave without an early termination charge, regardless of how much of your minimum term remains. If they can serve the new address and you want to leave anyway, an ETC will apply, capped by Ofcom at the total value of your remaining contract payments.' },
      { question: 'How long does it take to get broadband set up in a new home?', answer: 'For FTTC (part-fibre) at a property with existing wiring, activation takes 1 to 3 working days. For FTTP (full fibre) requiring an engineer visit, allow 2 to 4 weeks from order to installation. Book as early as possible; engineer slots fill up quickly in popular moving months such as May, June and August.' },
      { question: 'What is One Touch Switch and does it help when moving house?', answer: 'One Touch Switch is the standard UK process for changing broadband provider: your new provider handles the entire switch, including notifying your old provider, so you only deal with one company. It launched in September 2024, and Ofcom closed its enforcement case in June 2026 after finding more than 2 million customers had used it successfully, making it the industry\'s permanent standard rather than a pilot.' },
    ],
  },

  'broadband-for-existing-customers': {
    body: (
      <>
        <p>The best broadband deals for existing customers are usually not the ones you get by doing nothing. If you stay passive, you often move onto a more expensive standard tariff. If you negotiate or switch at the right moment, you can often cut your monthly bill significantly.</p>

        <h2>Why existing customers often overpay</h2>
        <p>Broadband pricing still favors acquisition. Providers spend heavily to win new users, so the sharpest advertised deals are often aimed at people who are about to switch. Existing customers who let the contract roll on can end up paying more for the same or even a weaker package. Industry research published in 2026 puts the average saving from switching at roughly £180 to £292 over a contract, with one widely cited estimate suggesting the 8.8 million UK households currently out of contract could save an average of £183.60 a year by switching rather than staying on a rolled-over standard tariff.</p>

        <h2>Your three best options as an existing customer</h2>
        <h3>1. Renegotiate with your current provider</h3>
        <p>If your contract is ending or already ended, ask to speak to the retentions team. This is where the better unpublished offers often sit. The strongest negotiation tool is always a real competing offer available at your postcode.</p>

        <h3>2. Downgrade or re-fit the package</h3>
        <p>Some households are paying not just for loyalty, but for speed they no longer need. If your home is mostly browsing, streaming, and general video calls, dropping to a more sensible tier can save money quickly.</p>

        <h3>3. Switch provider</h3>
        <p>If your current provider will not offer competitive value, switching is often the best answer. Being out of contract or close to contract end gives you leverage. One Touch Switch, now the industry&apos;s permanent standard after Ofcom closed its dedicated enforcement case in June 2026 having found more than 2 million customers had already used it successfully, has made the process considerably easier than many users expect: the new provider handles the transfer and old service cancellation automatically.</p>

        <h2>When to negotiate</h2>
        <ul>
          <li>One month before your contract ends</li>
          <li>Immediately after a price-rise notice lands</li>
          <li>When you discover your current bill is well above new-customer rates</li>
          <li>When a better full-fibre option becomes available at your address</li>
        </ul>

        <h2>What to say to get a better deal</h2>
        <p>Keep it simple: tell the provider you are reviewing your options, mention a real alternative offer, and ask whether they can match or beat it. If the first offer is weak, ask if there is a retention package available.</p>

        <h2>A scheduled price rise is a genuine trigger point</h2>
        <p>Most major providers now apply a flat, disclosed annual price rise, BT and EE at £4 a month each March, TalkTalk at £4 for contracts from November 2025, and Sky at £3 as of April 2026. When that notification lands, it is a genuine, low-friction moment to check the market: Ofcom requires at least 30 days&apos; notice of a price rise, and if the increase was not clearly disclosed at sign-up, an exit right may apply within that window. Even where no exit right applies, receiving the notice is still a natural, unforced reason to call and ask whether a better deal is available.</p>

        <h2>When staying can still make sense</h2>
        <p>Staying is not always wrong. If the provider gives you a competitive retention deal, the service has been reliable, and switching would only save a tiny amount, the lower-friction option may be worth it. The key is that staying should be a choice, not inertia.</p>

        <h2>The smartest workflow for existing customers</h2>
        <ol>
          <li>Check when your current term ends.</li>
          <li>Compare live deals at your postcode.</li>
          <li>Call your provider with a real alternative in hand.</li>
          <li>If the retention deal is weak, switch with confidence.</li>
        </ol>
      </>
    ),
    faqs: [
      { question: 'Do broadband providers offer good deals to existing customers?', answer: 'Sometimes, but usually only if you ask. The default outcome for passive customers is often a weaker deal than what new customers are offered, which is why negotiation or switching matters.' },
      { question: 'When should I ask my provider for a better deal?', answer: 'The best time is shortly before your contract ends, right after a price-rise notice, or whenever you discover your current bill is materially above current market rates.' },
      { question: 'Should existing customers switch or renegotiate?', answer: 'Do both in sequence. Compare the best alternative at your postcode, then ask your current provider if they can match or beat it. If they cannot, switching is usually the better move.' },
      { question: 'Can existing customers ever get the same price as new customers?', answer: 'Sometimes, especially through retention teams, but not always. The point of comparing first is to know whether the provider’s “best” offer is actually competitive.' },
      { question: 'How much could I save by switching broadband provider?', answer: 'Industry research published in 2026 puts the average saving from switching at roughly £180 to £292 over a contract, with one estimate suggesting the 8.8 million UK households currently out of contract could save an average of £183.60 a year by switching rather than staying on a rolled-over standard tariff.' },
    ],
  },

  'one-touch-switching-explained': {
    body: (
      <>
        <p><strong>One Touch Switching (OTS)</strong> is the UK system that lets most households change broadband provider by contacting the new provider only. In a standard fixed-line switch, the new provider usually manages the handover with the old one, which removes a lot of the friction that used to make switching feel risky. Ofcom introduced the cross-network process on 12 September 2024, and closed its dedicated enforcement programme on 11 June 2026, around three years after opening it when providers missed the original legal deadline, after finding that more than 2 million customers had already used it successfully.</p>

        <h2>From enforced pilot to permanent standard</h2>
        <p>Ofcom created the enforcement case in 2023 specifically to monitor provider readiness and push implementation forward after the industry-wide launch deadline was missed. By June 2026, the regulator found the majority of customers now switch successfully using OTS, and that providers previously attempting workarounds had stopped doing so following regulatory engagement. In practice this changes little day to day, but it confirms OTS as the industry&apos;s permanent standard rather than a still-bedding-in process: Ofcom can still take targeted action against any individual provider found to be obstructing it, but the industry-wide supervision phase is over.</p>

        <h2>What One Touch Switching means in practice</h2>
        <p>Before OTS, many broadband users had to deal with both providers themselves: one to order the new service and one to cancel the old service. That often led to confusion, missed notice periods, and accidental downtime. Under the current process, the new provider is usually your main point of contact.</p>
        <p>Once you place the order, the new provider contacts the losing provider, proposes a switch date, and confirms what will happen next. You should then receive clear confirmation so you can check the timeline, any early termination charge, and whether you need to return old equipment.</p>

        <h2>What OTS usually covers</h2>
        <ul>
          <li>Most standard fixed-line broadband switches between major UK providers</li>
          <li>Openreach-based provider switches where an existing line is being taken over</li>
          <li>Cases where you want the old service to stay active until switch day</li>
          <li>Many moves between BT, Sky, EE, TalkTalk, Plusnet, NOW Broadband, and Vodafone</li>
        </ul>

        <h2>What OTS does not remove</h2>
        <p>OTS simplifies the process, but it does <strong>not</strong> cancel the commercial terms of your contract. If you are still inside your minimum term, the old provider may still charge an early termination fee. If you rented equipment, you may still need to send it back. And if the new service needs an engineer visit, the timeline can still be longer than a simple takeover.</p>

        <h2>When you should ask extra questions</h2>
        <ul>
          <li><strong>Switching to full fibre:</strong> a new installation may be needed</li>
          <li><strong>Switching to or from Virgin Media or an altnet:</strong> different network types can mean extra setup steps</li>
          <li><strong>Keeping a landline number:</strong> tell the new provider at sign-up if number porting matters</li>
          <li><strong>Leaving after a price rise:</strong> confirm whether you have a penalty-free exit right first</li>
        </ul>

        <h2>How to use One Touch Switching well</h2>
        <ol>
          <li>Check your current contract end date and any likely exit fees.</li>
          <li>Use a postcode checker so you compare real availability, not generic national ads.</li>
          <li>Order with the new provider and ask whether engineer access is required.</li>
          <li>Wait for the confirmed switch date before disconnecting or returning anything.</li>
          <li>Return the old provider&apos;s equipment within the stated deadline.</li>
        </ol>

        <h2>What to check before the switch starts</h2>
        <p>Confirm your minimum-term end date, any early termination charge, the expected activation date and whether equipment must be returned. If the new service needs an engineer or a different network connection, avoid cancelling the old service separately unless the new provider tells you to do so.</p>
      </>
    ),
    faqs: [
      { question: 'Do I still need to cancel my broadband myself under One Touch Switching?', answer: 'Usually no. In most standard fixed-line switches, the new provider handles the transfer with the old one. You should still read the switch confirmation carefully and check whether there are any early termination charges or equipment return requirements.' },
      { question: 'Does One Touch Switching mean I can leave my contract for free?', answer: 'No. One Touch Switching makes switching simpler, but it does not automatically remove early termination charges. If you are still within your minimum term, the old provider may still charge you unless you have a separate right to leave.' },
      { question: 'Does One Touch Switching work with every broadband provider?', answer: 'It covers most standard fixed-line broadband switches, but some moves involving different networks or new full-fibre installations can involve extra steps. If you are switching to or from a cable or altnet provider, ask the new provider exactly how the transfer will work.' },
      { question: 'Will I lose broadband during the switch?', answer: 'Most standard switches should involve little or no downtime. Delays are more likely where a new full-fibre installation or engineer visit is required.' },
      { question: 'Is One Touch Switching still a temporary or pilot scheme?', answer: 'No. Ofcom closed its dedicated One Touch Switch enforcement programme on 11 June 2026, around three years after opening it, having found that more than 2 million customers had already switched successfully using the process. It is now the industry\'s permanent standard, though Ofcom can still take targeted action against any individual provider found to be obstructing it.' },
    ],
  },

  'broadband-contract-end-rights': {
    body: (
      <>
        <p>When your broadband contract ends, your service usually does not stop. What usually changes is the price. Many providers move customers from a discounted introductory rate onto a higher standard tariff, which is why being <strong>out of contract</strong> is one of the easiest ways to overpay for broadband in the UK.</p>

        <h2>What happens when your contract ends</h2>
        <p>Your broadband service normally keeps running on a rolling basis unless you switch, renegotiate, or cancel it. The problem is that the monthly charge often rises once the fixed term ends. That means the action point is not technical continuity. It is price control.</p>
        <p>Recent reporting on Ofcom&apos;s 2026 pricing and consumer engagement findings said that <strong>28% of broadband customers were out of contract</strong> and often paying <strong>£7 to £9 more per month</strong> than people still in contract. Checking the end date and renewal price can therefore prevent a substantial avoidable increase.</p>

        <h2>What your provider should make clear</h2>
        <ul>
          <li>When your current contract or discount period ends</li>
          <li>What the monthly price becomes after that date</li>
          <li>Whether there are lower tariffs available if you stay</li>
          <li>Whether you are free to leave immediately without an early termination fee</li>
        </ul>

        <h2>Your three strongest options once you are out of contract</h2>
        <h3>1. Renegotiate with your current provider</h3>
        <p>If the service has been good and you want a low-friction option, call and ask what retention offers are available. The standard rolling tariff is rarely the best price they can give you.</p>

        <h3>2. Switch to a new provider</h3>
        <p>If a competitor has better value at your postcode, being out of contract puts you in the strongest possible position. You can usually move without an exit fee, and One Touch Switching often makes the move easier than many people expect.</p>

        <h3>3. Downgrade to a better-fit tariff</h3>
        <p>Some households are overpaying for speed as well as for contract status. If your home mainly browses, streams, and uses video calls casually, you may not need a premium-speed package.</p>

        <h2>How to avoid the out-of-contract penalty</h2>
        <ul>
          <li>Set a reminder one month before the contract ends</li>
          <li>Check the post-contract price, not just the current price</li>
          <li>Compare fresh deals using your postcode</li>
          <li>Ask your current provider to match the best realistic alternative</li>
          <li>Check whether your household qualifies for a social tariff</li>
        </ul>

        <h2>When it might make sense not to switch immediately</h2>
        <p>If you are moving home soon, waiting a short time may avoid signing a contract you will immediately need to change. Likewise, if a better full-fibre network is due at your address very soon, a short interim solution can be smarter than locking in right away.</p>

        <h2>A practical contract-end checklist</h2>
        <p>Record the current price, post-contract price, notice period and any equipment-return requirement. Then compare services available at your address, ask the existing provider for its best retention offer and choose on total cost rather than the introductory price alone.</p>
        <p>Challenge an exit fee or incorrect final bill through the provider&apos;s formal process and keep the contract, bill and complaint reference. Our <Link href="/guides/broadband-complaints-and-ombudsman-uk">broadband complaints and ombudsman guide</Link> covers deadlock letters, the current ADR waiting period and the evidence needed for escalation.</p>
      </>
    ),
    faqs: [
      { question: 'Does my broadband stop when my contract ends?', answer: 'Usually no. Your provider normally keeps the service running, but often moves you onto a higher rolling price once the initial term ends.' },
      { question: 'Can I leave broadband for free once I am out of contract?', answer: 'In most cases, yes. Once your minimum term has ended, you can usually switch or cancel without an early termination fee. You should still check for any notice requirements or equipment return rules.' },
      { question: 'How much more do people pay when out of contract?', answer: 'Recent reporting on Ofcom findings said many out-of-contract broadband customers pay roughly £7 to £9 more per month than people still in contract. The exact difference depends on the provider and package.' },
      { question: 'Should I renegotiate or switch?', answer: 'Do both. First compare what is available at your postcode, then ask your existing provider whether they can match or beat it. If the answer is weak, switching is often the better-value move.' },
    ],
  },

  'static-ip-business-broadband-explained': {
    body: (
      <>
        <p className="text-lg">
          <strong>A static public IP address keeps the same internet-facing address for your business connection, and most UK business broadband providers now include, discount or add it for roughly £0 to £10 a month plus VAT.</strong> You need one when another system must consistently recognise or connect back to that address. It does not make broadband faster, and it is not a security feature by itself.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Price check:</strong> provider features and the prices below were checked on
            20 September 2026. Business broadband prices are commonly shown without VAT, and
            availability depends on the premises. Confirm the live order summary before signing a
            contract.
          </p>
        </div>

        <h2>What a static IP address changes</h2>
        <p>
          Your broadband router presents an Internet Protocol address to the wider internet. With
          a dynamic service, the provider can replace that address over time. A static IP remains
          assigned to the connection, giving authorised users and services a predictable
          destination or identity.
        </p>
        <p>
          This is different from giving a printer or computer a fixed address inside the office.
          That local network setting does not create a static public IP. Also ask whether the
          provider supplies a public IPv4 address rather than placing the connection behind
          carrier-grade network address translation, which can prevent unsolicited inbound
          connections.
        </p>

        <h2>What is CGNat and why does it matter?</h2>
        <p>
          Carrier-grade network address translation, or CGNat, is how a provider shares one public
          IPv4 address across many customer connections, a response to the industry running out of
          new IPv4 addresses to hand out individually. A connection behind CGNat can browse the web
          normally, but it cannot reliably accept unsolicited inbound connections, so an
          IP-allowlisted portal, an inbound VPN or a self-hosted service will not work correctly
          until the line is moved onto a dedicated, non-shared static IPv4 address.
        </p>
        <p>
          Ask a prospective provider directly whether the specific package you are quoted is
          behind CGNat by default, since this is not always stated on the pricing page. Some
          providers use CGNat on entry-level packages and only supply a dedicated address as a paid
          add-on or on a higher tier.
        </p>

        <h2>When does a business need a static IP?</h2>
        <p>A static address is useful when you have a specific inbound or identification need:</p>
        <ul>
          <li><strong>IP allowlisting:</strong> a supplier, bank or cloud platform accepts connections only from approved office addresses</li>
          <li><strong>An on-site VPN gateway:</strong> remote workers or another branch must connect to a predictable office endpoint</li>
          <li><strong>Remote equipment:</strong> authorised administrators need to reach an on-site firewall, server or monitoring system</li>
          <li><strong>Self-hosted services:</strong> a service at your premises must remain reachable from outside the network</li>
          <li><strong>Business VoIP:</strong> some hosted and on-site VoIP or SIP trunk setups route more reliably from a fixed address, which matters more as the UK approaches the January 2027 PSTN and ISDN switch-off covered in our <Link href="/guides/pstn-switch-off-small-business-uk">PSTN switch-off guide for small businesses</Link></li>
          <li><strong>Multiple public services:</strong> a larger address block may be needed where separate systems cannot share one address through port forwarding</li>
        </ul>
        <p>
          Do not expose CCTV, storage or administration pages directly to the internet merely
          because a static IP makes it possible. A properly secured VPN or managed remote-access
          service is usually a safer route.
        </p>

        <h2>When you probably do not need one</h2>
        <p>
          A dynamic IP is normally sufficient if the business mainly uses hosted email, web-based
          accounting, cloud storage, card terminals, video meetings and ordinary browsing. These
          are outbound connections and do not usually require the office to keep the same public
          address. Faster downloads, better Wi-Fi and improved fault support are separate buying
          decisions covered in our <Link href="/guides/best-business-broadband-providers-uk">best business broadband providers guide</Link>.
        </p>

        <h2>Static IP pricing across major UK business providers</h2>
        <p>Static IP business broadband pricing and inclusion policy vary widely by provider and tier. The table below compares the major national providers checked on 20 September 2026.</p>
        <div role="region" aria-label="Static IP pricing by UK business broadband provider" tabIndex={0} className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Static IP address pricing and policy by UK business broadband provider</caption>
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Static IP policy', 'Typical cost'].map((heading) => (
                  <th key={heading} scope="col" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Zen Internet</th><td className="border border-slate-200 px-4 py-3">Free static IPv4 as standard on every business plan</td><td className="border border-slate-200 px-4 py-3">£0</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">TalkTalk Business</th><td className="border border-slate-200 px-4 py-3">Reported free on Business Full Fibre (FTTP) packages</td><td className="border border-slate-200 px-4 py-3">£0 on FTTP</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Virgin Media Business</th><td className="border border-slate-200 px-4 py-3">Can supply one static IP on request at the time of ordering; independent reporting suggests some higher fibre tiers include more than one</td><td className="border border-slate-200 px-4 py-3">Confirm at order</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">BT Business</th><td className="border border-slate-200 px-4 py-3">Add-on on Essential; included on higher tiers such as Halo</td><td className="border border-slate-200 px-4 py-3">Around £5/month + VAT</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Sky Business</th><td className="border border-slate-200 px-4 py-3">Add-on on entry tiers; independent reporting suggests it is included on the Ultimate tier</td><td className="border border-slate-200 px-4 py-3">Around £5/month + VAT</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Vodafone Business</th><td className="border border-slate-200 px-4 py-3">On request on Essential; included as standard on Pro, up to eight addresses available</td><td className="border border-slate-200 px-4 py-3">Around £5/month + VAT</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Treat every figure in this table as a starting point, not a quote. Where we could confirm a policy only through independent reporting rather than the provider&apos;s own current pricing page, we have flagged it as such above, and you should still ask the provider directly to confirm the live price and whether the specific package quoted to you is behind CGNat by default.
        </p>
        <p>
          Compare the full minimum-term cost. Moving to a dearer package solely to obtain an
          included address can cost more than a modest add-on. If you need several addresses, ask
          for the usable address count, monthly charge, setup work and router requirements in
          writing.
        </p>

        <h2>Static IP security: what it does and does not do</h2>
        <p>
          A fixed IP can support security controls such as allowlisting, but the address itself
          does not encrypt traffic or stop an attack. Because it remains easy to locate, any
          internet-facing service should use a correctly configured firewall, current software,
          restricted ports, strong authentication and monitoring. Limit remote access to the
          smallest group that needs it.
        </p>

        <h2>Five questions to ask before paying for a static IP</h2>
        <ol>
          <li><strong>What system requires it, specifically?</strong> Ask the application supplier or IT administrator to name the exact allowlist, VPN or hosted service that needs a fixed address, rather than buying one speculatively.</li>
          <li><strong>Is the address a static public IPv4 address, and is IPv6 also available?</strong> A local network setting or an IPv6-only address will not satisfy an IPv4 allowlist requirement.</li>
          <li><strong>What is the monthly price excluding and including VAT, and is one address included at your tier?</strong> Business prices are commonly quoted excluding VAT.</li>
          <li><strong>Will the address stay with the service after a package change or premises move?</strong> Some providers reissue a new address in either case.</li>
          <li><strong>What fault-response commitment and backup connection does the package provide?</strong> A static IP does not substitute for a resilience or support upgrade.</li>
        </ol>

        <h2>The practical decision</h2>
        <p>
          Ask the application supplier or IT administrator to state exactly why a fixed public
          address is required. If the answer is allowlisting, an inbound VPN, business VoIP or an
          on-site service, include static IP support in the broadband shortlist. If there is no
          defined use, choose on availability, total cost, upload speed and support instead. Our{' '}
          <Link href="/guides/small-office-broadband-setup-uk">small office broadband setup guide</Link>{' '}
          and <Link href="/guides/leased-line-cost-uk-explained">leased line cost guide</Link> cover
          the wider connectivity decisions that often come up alongside a static IP request.
        </p>
      </>
    ),
    faqs: [
      {
        question: 'Does a small business need a static IP address?',
        answer: 'Only if a system must consistently recognise or reach the business connection. Common reasons include an IP-allowlisted portal, an on-site VPN gateway, business VoIP routing or securely managed equipment at the premises. A small firm that only uses cloud applications, hosted email, video calls and ordinary web services will normally work perfectly well with a dynamic IP address.',
      },
      {
        question: 'Which UK broadband providers offer static IP?',
        answer: 'Zen Internet includes a free static IPv4 address as standard on every business plan, and TalkTalk Business is reported to include one free on its Full Fibre (FTTP) packages. BT Business, Sky Business and Vodafone Business typically charge around £5 a month plus VAT on entry tiers, or include one on a higher tier, while Virgin Media Business can supply one on request at the time of ordering. Confirm the current policy for your exact package before ordering.',
      },
      {
        question: 'Does a static IP make business broadband faster or more reliable?',
        answer: 'No. A static IP keeps the public address predictable, but it does not increase download speed, upload speed, Wi-Fi coverage or fault resilience. Compare those features separately. If downtime matters, look at the provider’s fault-response commitment and backup connectivity rather than treating a fixed address as a reliability upgrade.',
      },
      {
        question: 'How much is a static IP on UK business broadband?',
        answer: 'Typically £0 to around £10 a month plus VAT, depending on the provider and tier. Zen Internet includes one free as standard, TalkTalk Business is reported to include one free on Full Fibre, and BT Business, Sky Business and Vodafone Business typically charge around £5 a month plus VAT on entry tiers when checked on 20 September 2026. Treat these as dated provider examples and compare the full contract cost on the live quote.',
      },
      {
        question: 'What is CGNat and does it stop me getting a static IP?',
        answer: 'Carrier-grade network address translation (CGNat) is where a provider shares one public IPv4 address across several customer connections, so unsolicited inbound connections do not reliably reach your router. It does not stop you buying a static IP; it means the entry-level package you were quoted may need to be upgraded or have a dedicated address added before an allowlisted service, VPN or self-hosted system will work.',
      },
      {
        question: 'Is a static IP address secure?',
        answer: 'A fixed address can help with IP allowlisting, but it is not inherently secure. It also gives attackers a consistent target if an internet-facing system is poorly protected. Use a firewall, install security updates, expose only necessary services and require strong authentication. For remote access, a properly configured VPN or managed service is safer than opening equipment directly to the internet.',
      },
      {
        question: 'Can dynamic DNS replace a static IP?',
        answer: 'Sometimes. Dynamic DNS updates a hostname when your public address changes, which can suit a low-risk service that does not require IP allowlisting. It will not solve every case, particularly if the provider uses carrier-grade network address translation or the third party insists on a fixed source IP. Check the application and provider requirements first.',
      },
    ],
  },

  'student-broadband-by-university-city': {
    body: (
      <>
        <p className="text-lg">
          <strong>The right student broadband deal is determined by the property, not just the university city, but EE, Vodafone, Sky and Virgin Media all now sell dedicated student broadband from around £20 to £26 a month, checked via Student Beans, UNiDAYS or GoCertify.</strong> First check whether internet is included in your accommodation. If you need your own connection, use the full address to compare networks and choose a minimum term that ends no later than your tenancy.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Offer and availability check:</strong> contract options and network information
            on this page were checked on 20 September 2026. Deals can change and availability varies
            by building, so confirm the contract summary, setup cost and installation date before
            ordering.
          </p>
        </div>

        <h2>Student broadband choices by university city</h2>
        <p>
          Treat the table as a city-specific shortlist of checks, not a promise that a provider
          serves every student address. Ofcom&apos;s coverage checker reports predicted services for a
          postcode or address, while each provider performs its own final availability check.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">
              What to check before comparing live student broadband offers at your address.
            </caption>
            <thead>
              <tr className="bg-slate-50">
                {['University city', 'Useful starting point', 'Address-level check'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['London', 'Check national providers, building-focused full-fibre networks and Community Fibre', 'Coverage can vary by street and individual block'],
                ['Manchester, Liverpool and Leeds', 'Compare fixed fibre, cable and any full-fibre network shown for the property', 'Do not assume neighbouring student areas have identical choices'],
                ['Birmingham, Nottingham and Sheffield', 'Start with the exact house or flat, then compare contract length and total cost', 'Ask the landlord whether fibre equipment is already installed'],
                ['Bristol, Cardiff and Newcastle', 'Check fixed broadband alongside a mobile backup for move-in week', 'Test mobile coverage indoors before relying on a router or tethering'],
                ['Glasgow and Edinburgh', 'Compare the networks serving the accommodation rather than city-wide averages', 'Allow time for an engineer if the property is not ready for service'],
                ['Oxford and Cambridge', 'Check the individual address early, especially for older or subdivided properties', 'The fastest city-wide technology may not reach the chosen building'],
                ['Belfast', 'Use the address checker to compare available full-fibre and other fixed services', 'Choose by live package terms, not broad regional coverage'],
                ['Hull', 'Include KCOM in the address check; its Roll student packages are advertised without a minimum contract', 'KCOM states geographical and network restrictions apply'],
              ].map(([city, startingPoint, check]) => (
                <tr key={city} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{city}</td>
                  <td className="px-4 py-3 text-slate-700">{startingPoint}</td>
                  <td className="px-4 py-3 text-slate-600">{check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          Students moving into central Newcastle can use the <Link href="/postcode/ne1">NE1 broadband deals and coverage guide</Link> to compare district evidence, building checks and contract costs before entering the complete flat address with a provider.
        </p>

        <h2>Do you need to buy broadband at all?</h2>
        <p>
          UCAS says university halls usually include broadband, although inclusions vary. Private
          halls may include it too. Read the accommodation agreement and ask whether Wi-Fi reaches
          the bedroom, whether you can connect by Ethernet, and whether there are device or usage
          restrictions. Ordering another fixed line without the landlord&apos;s permission can create
          unnecessary cost or installation problems.
        </p>
        <p>
          In a privately rented house, ask whether an active service will remain after the previous
          tenants leave. An installed router or fibre box does not necessarily mean the account is
          live. Agree which housemate will hold the new account and how the final bill will be
          settled before anyone signs.
        </p>

        <h2>Student discount codes: Student Beans, UNiDAYS and GoCertify</h2>
        <p>
          Several providers now sell student-specific broadband at a discount that is unlocked
          through a third-party verification platform rather than a code typed at checkout. EE and
          Vodafone both accept Student Beans and UNiDAYS; Vodafone also accepts GoCertify. Each
          platform checks that you are enrolled at a UK educational institution, usually through a
          .ac.uk email address or uploaded student documentation, before releasing the discounted
          price and any reward card or voucher. Create the verification account before you start
          the broadband order, since an incomplete check can hold up activation.
        </p>
        <p>
          On 20 September 2026, EE listed student broadband from £22.99 a month on 12- or 24-month
          contracts, with a £30 upfront fee, a reward card worth £50 to £70 depending on the speed
          tier ordered, and a stated price rise to £26.99 in March 2027 and £30.99 in March 2028.
          Vodafone listed 5G home broadband from £20 a month for its 50Mbps tier and £21 a month for
          150Mbps on a 12-month term, each with a further £2 a month off for students and an extra
          £2 off if you also hold an active Vodafone mobile contract, rising to £23.50 and £24.50 a
          month respectively on 1 April 2027; Vodafone separately advertises up to £200 in switching
          credit for new broadband customers. Stating the exact post-discount price and date up
          front, rather than only in the terms, makes it easier to judge the real cost across a full
          course rather than just the headline first-year figure. Treat every figure as a dated
          snapshot rather than a live quote, and re-check the provider&apos;s own page before ordering.
        </p>

        <h2>12-month student broadband or a rolling deal?</h2>
        <h3>Choose 12 months for a full academic-year tenancy</h3>
        <p>
          A 12-month deal is usually the cleaner match when the household will occupy the property
          for a full year. On 20 September 2026, Virgin Media&apos;s student page listed M125 from
          £25.99 a month, M500 from £28.99 a month and Gig1 from £29.99 a month on 12-month terms,
          each requiring a valid .ac.uk email address and with no setup cost for eligible students.
          Sky separately markets its Full Fibre 150, 300 and 900 tiers to students, though its own
          page did not state a specific student discount at the time of checking. Eligibility,
          availability and the live contract summary still need checking before purchase.
        </p>
        <h3>Choose rolling broadband for uncertain or shorter stays</h3>
        <p>
          A monthly rolling service can suit a placement, short course, summer stay or tenancy with
          an uncertain end date. Virgin Media advertises rolling broadband with 30 days&apos; notice,
          and KCOM currently lists no-contract Roll packages for eligible Hull-area postcodes.
          Flexibility may cost more, so compare the total amount for the months you expect to use it.
        </p>
        <h3>Consider 5G or mobile broadband as an alternative or a bridge</h3>
        <p>
          A phone hotspot or 4G or 5G router can cover the period before fixed broadband is
          installed, but Vodafone&apos;s 12-month 5G home broadband student plan is a genuine
          alternative to fixed fibre for a household that does not need the fastest tier, not only a
          short-term bridge. Either way, check indoor 5G signal at the exact address, the data
          allowance and the cancellation terms first. Our <Link href="/guides/best-5g-home-broadband-uk">5G home broadband guide</Link> covers
          how it compares with fixed fibre in more detail. Performance can still fluctuate, and a
          busy shared house may use a large amount of data.
        </p>

        <h2>How city network differences affect your shortlist</h2>
        <p>
          UK cities do not have one uniform broadband market. National networks overlap with cable
          and local full-fibre networks, and some operators serve particular buildings rather than
          every street. London students may see Community Fibre at some addresses, while Hull has
          the locally distinctive KCOM network. Elsewhere, a CityFibre-built connection may be sold
          by one of several retail providers rather than by CityFibre itself: in Luton, for example,
          BroadbandPicker&apos;s <Link href="/postcode/lu1">LU1 broadband deals guide</Link> covers
          CityFibre&apos;s confirmed rollout there and which retail providers currently sell over it.
          In Oxford, a citywide full-fibre rollout announcement does not mean most eligible homes
          have actually switched; BroadbandPicker&apos;s <Link href="/postcode/ox1">OX1 broadband
          deals guide</Link> covers Openreach&apos;s own confirmed uptake figures for the city. In
          Cardiff, dated business-focused full-fibre projects do not necessarily translate into
          residential deals; BroadbandPicker&apos;s <Link href="/postcode/cf10">CF10 broadband deals
          guide</Link> explains the distinction between Cardiff&apos;s city-centre business
          infrastructure and household broadband coverage.
        </p>
        <p>
          City-level percentages are not a substitute for an address check. Ofcom&apos;s 2025 data also
          shows substantial differences in full-fibre coverage between UK nations and local
          authorities. Use that as context only, then check the actual accommodation with Ofcom and
          the shortlisted providers.
        </p>

        <h2>Compare the full student broadband cost</h2>
        <ul>
          <li><strong>Minimum term:</strong> count the months between activation and the tenancy end date</li>
          <li><strong>Monthly charges:</strong> include any stated price change during the contract</li>
          <li><strong>Upfront cost:</strong> check activation, delivery and engineer fees</li>
          <li><strong>Leaving early:</strong> ask for the early termination calculation before signing</li>
          <li><strong>Moving home:</strong> confirm whether moving transfers the service or starts a new minimum term</li>
          <li><strong>Equipment:</strong> record who must return the router and by what date</li>
        </ul>
        <p>
          Ofcom says providers must give you a written contract summary before you are bound. It
          should include key charges, the contract length and cancellation information. Read that
          document rather than relying only on the headline monthly price.
        </p>

        <h2>Order without creating a house-share headache</h2>
        <ol>
          <li>Confirm the tenancy dates and whether broadband is included.</li>
          <li>Run address checks once you have the complete accommodation postcode.</li>
          <li>Choose a realistic speed for simultaneous study, calls, streaming and gaming.</li>
          <li>Pick an account holder who expects to remain for the whole contract.</li>
          <li>Save the contract summary, activation date and equipment return instructions.</li>
          <li>Set a reminder at least one month before the tenancy and minimum term end.</li>
        </ol>
        <p>
          Order early enough to allow for delivery or an engineer visit, but do not activate a
          service before you are entitled to access the property. If installation requires drilling
          or new cabling, get the landlord or managing agent&apos;s permission in writing.
        </p>
      </>
    ),
    faqs: [
      {
        question: 'Which student broadband is best in my university city?',
        answer: 'There is no reliable city-wide winner because networks and offers vary by individual address. Check whether broadband is included, enter the complete accommodation postcode into Ofcom’s checker, and then confirm availability with each provider. Compare contract length, total cost and installation timing. A provider serving one student block may not serve another building nearby.',
      },
      {
        question: 'Can students get a 12-month broadband contract?',
        answer: 'Yes. Virgin Media currently advertises 12-month student broadband for eligible customers with an academic email address, subject to its terms and address availability. Other providers may also offer shorter contracts at particular times. Check that the activation and end dates fit your tenancy, and read the written contract summary for charges and cancellation terms before agreeing.',
      },
      {
        question: 'Is rolling monthly broadband better for students?',
        answer: 'Rolling broadband is useful when your stay is shorter than an academic year or your move-out date is uncertain. It can cost more than a fixed contract, so compare the full cost for the time you expect to use it. Also check the notice period. Virgin Media advertises 30-day rolling broadband, while KCOM lists no-contract student packages in eligible Hull-area postcodes.',
      },
      {
        question: 'Do university halls include broadband?',
        answer: 'Many university halls include broadband, and UCAS says this is usually part of halls accommodation, but the exact service and rules vary. Check the accommodation agreement before buying anything. Ask about bedroom Wi-Fi, Ethernet access, device limits and support. Private halls and rented houses can have different arrangements, even within the same university city.',
      },
      {
        question: 'What happens to student broadband when the tenancy ends?',
        answer: 'Contact the provider before moving and follow the notice and equipment-return rules in your contract. Leaving during a minimum term may trigger an early termination charge, while moving the service can sometimes begin a new term. Do not assume the account ends with the tenancy. Keep proof of cancellation and agree how housemates will divide the final bill.',
      },
      {
        question: 'What is Student Beans or UNiDAYS for broadband?',
        answer: 'Student Beans, UNiDAYS and GoCertify are third-party verification platforms that confirm you are enrolled at a UK educational institution, usually through a .ac.uk email address or student documentation. EE and Vodafone both use Student Beans and UNiDAYS, and Vodafone also accepts GoCertify, to unlock student broadband pricing and any reward card or voucher. Create the verification account before starting the broadband order to avoid delaying activation.',
      },
      {
        question: 'How much does EE or Vodafone student broadband cost?',
        answer: 'On 20 September 2026, EE listed student broadband from £22.99 a month with a £30 upfront fee and a reward card worth £50 to £70 depending on speed, while Vodafone listed 5G home broadband from £20 a month for 50Mbps and £21 a month for 150Mbps on a 12-month term, with a further £2 a month student discount. Treat these as dated examples and confirm the live price for your exact address before ordering.',
      },
    ],
  },

  'small-office-broadband-setup-uk': {
    body: (
      <>
        <p className="text-lg">
          <strong>A good small office broadband setup is more than a fast package: it is choosing the right connection type, planning the network for near-term growth, and setting up a tested backup, because business fibre packages typically add a service-level repair commitment that residential broadband does not.</strong> Plan it before move-in, then test it with the applications and devices the office actually uses.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Information check:</strong> regulator, cyber security and provider guidance on
            this page was verified on 20 September 2026. Availability, support commitments and backup
            features vary by address and package. Confirm them in the written contract before
            ordering.
          </p>
        </div>

        <h2>Small office broadband setup checklist</h2>
        <ol>
          <li>List the cloud services, calls, tills and other systems that stop when internet access fails.</li>
          <li>Count normal and peak users, including visitors and personal devices allowed on the network, and add headroom for near-term growth such as a new starter or a second phone system rather than sizing only for today.</li>
          <li>Check fixed and mobile coverage at the complete office address.</li>
          <li>Get expected download and upload speeds, the minimum term and support commitments in writing.</li>
          <li>Agree the router, cabling and wireless access-point locations before the installation visit.</li>
          <li>Separate staff, guest and equipment access where the router or network design supports it.</li>
          <li>Set up and test mobile backup, including a simulated failure of the main connection.</li>
          <li>Record the network layout, provider contacts and recovery steps for the people responsible.</li>
        </ol>

        <h2>Choose the connection type: full fibre, standard fibre or 5G</h2>
        <p>
          UK business broadband is sold over three main connection types, and the right one depends
          on the workload, the building and how quickly the office needs to be online. Full fibre
          (FTTP), sold by providers including BT Business and Zen Internet and by full-fibre altnets
          in some areas, runs fibre optic cable directly to the premises and gives the fastest,
          most stable speeds for heavy cloud use and video calls. Standard business fibre (FTTC)
          mixes fibre with the older copper cabinet-to-building run; it is more widely available and
          cheaper, and suits light browsing and basic office tasks where FTTP is not yet available.
          5G or 4G mobile business broadband, sold by providers including Three Business and EE
          Business, needs no drilling or engineer visit and can be online the same day, making it a
          genuine primary option for a fast-moving or short-lease office, not only a backup.
        </p>
        <p>
          Three Business, for example, currently advertises unlimited-data 5G broadband with average
          download speeds around 150Mbps, no engineer visit, a 30-day money-back guarantee and
          next-working-day delivery on eligible orders, though its price rises by £1.60 a month
          excluding VAT each April. Treat that as one dated provider example, not a universal 5G
          figure, and check indoor signal at the exact desk before relying on it as the only
          connection.
        </p>

        <h2>Choose the connection around the work</h2>
        <p>
          Start with what happens at the busiest point of the day. Video meetings and sending large
          files depend on upload performance as well as download speed. Cloud telephony, payment
          systems and remote desktops make interruption more costly. Ask the provider for the
          service available at the exact premises rather than relying on a national headline speed.
          If the office still uses a landline for calls, plan the move to digital, router-based
          telephony ahead of the January 2027 PSTN switch-off; our <Link href="/guides/pstn-switch-off-small-business-uk">PSTN switch-off guide for small businesses</Link> covers
          the deadline, alarms, card terminals and testing in detail.
        </p>
        <p>
          Ofcom advises businesses to compare service levels as well as price. A business package
          may offer priority support, a repair commitment, a static IP option or resilience features,
          but the bundle varies. BT Business, for example, states that its Pro-tier Prompt Care
          service aims to fix faults reported before 21:00 by the next working day, with compensation
          of a week&apos;s rental credit for each day it runs late, up to 12 days; treat that as one
          dated provider example of what a service-level commitment can look like, not a promise
          every package makes. Read the service level wording carefully: response time, target fix
          time and guaranteed restoration are not interchangeable promises. If a system needs a
          fixed, identifiable address rather than just a fast connection, our <Link href="/guides/static-ip-business-broadband-explained">static IP business broadband guide</Link> covers
          when that add-on is actually needed and what it costs.
        </p>

        <h2>Plan the router, Wi-Fi and cabling</h2>
        <p>
          Put the router or wireless access point in an open, raised and reasonably central position,
          away from metal, water and electrical equipment that can obstruct or interfere with the
          signal. Do not hide it in a comms cupboard and assume one unit will cover every meeting
          room. Walk the premises and test signal and performance at desks, reception and shared
          spaces after installation.
        </p>
        <p>
          Use Ethernet for fixed equipment where it is practical, especially desktop workstations,
          network storage, printers, access points and other devices that should not depend on radio
          conditions. If the office is spread over several rooms or floors, arrange proper cabling
          and additional access points rather than choosing extenders only after coverage problems
          appear.
        </p>

        <h2>Separate staff and guest access</h2>
        <p>
          If clients or visitors need internet access, use a separate guest network when the router
          or managed Wi-Fi system provides one. Keep router administration available only to the
          people who manage the network. Change any default administration credentials, apply
          firmware and software updates, use WPA3 encryption where the router and devices support
          it, keep the firewall enabled and record who is responsible for reviewing the setup.
        </p>
        <p>
          Broadband resilience is not a data backup. NCSC guidance says organisations should copy
          the data they need to operate and be able to restore it. Keep that process separate from
          the broadband plan so a working connection is not mistaken for protection against lost,
          corrupted or inaccessible files.
        </p>

        <h2>Set up broadband backup that works</h2>
        <p>
          A mobile backup can be a phone hotspot, a separate 4G or 5G router, or a provider feature
          that switches automatically when the fixed line fails. BT Business, for example, documents
          automatic 4G switching for compatible broadband and hub equipment. That is one provider
          implementation, not a feature of every business package.
        </p>
        <ul>
          <li><strong>Check independence:</strong> a second fixed service using the same local infrastructure may share the original point of failure.</li>
          <li><strong>Test indoor signal:</strong> mobile coverage predictions do not guarantee performance inside the office.</li>
          <li><strong>Check capacity:</strong> decide which calls and applications take priority when backup is slower.</li>
          <li><strong>Check data terms:</strong> confirm allowances, traffic controls and additional charges.</li>
          <li><strong>Check power:</strong> the router, fibre termination equipment, switches and access points need electricity during a power cut.</li>
          <li><strong>Practise failover:</strong> disconnect the main service safely and confirm that essential devices reconnect and work.</li>
        </ul>

        <h2>Write down the support and recovery plan</h2>
        <p>
          Keep the provider account number, support route, service address, expected speeds and any
          fault commitment in a shared operational record. Add the make and location of the router,
          fibre equipment, switches and backup device. Note who may restart equipment, who can make
          account changes and which supplier supports the internal network.
        </p>
        <p>
          During a fault, test one wired device before assuming the broadband line has failed. Record
          status lights and error messages, then follow the provider&apos;s checks without repeatedly
          resetting equipment that another service depends on. Tell staff how to use the backup and
          which non-essential activity to pause until the main connection returns.
        </p>

        <h2>Run a launch-day test</h2>
        <ul>
          <li>Confirm the wired speed and compare it with the provider&apos;s written estimate.</li>
          <li>Test Wi-Fi in every normal working area, not only beside the router.</li>
          <li>Make simultaneous video or internet calls and use the main cloud applications.</li>
          <li>Check printers, payment equipment, alarms and phones that depend on the connection.</li>
          <li>Trigger the documented backup process and check how long recovery takes.</li>
          <li>Confirm that a second responsible person can find the support and recovery record.</li>
        </ul>
        <p>
          Repeat the essential tests after changing the router, cabling, provider or office layout.
          The useful outcome is not a perfect speed test on one laptop. It is a setup that supports
          the real working day and has a known response when something breaks.
        </p>
      </>
    ),
    faqs: [
      {
        question: 'What broadband speed does a small office need?',
        answer: 'There is no dependable speed based only on headcount. Count simultaneous video calls, cloud applications, large uploads, guest devices and internet-dependent phones or tills. Ask providers for address-specific download and upload estimates, then leave capacity for busy periods. If interruption would stop trading, support and backup arrangements can matter more than buying the highest advertised headline speed.',
      },
      {
        question: 'Where should a small office broadband router go?',
        answer: 'Place it in an open, raised and reasonably central location, away from metal cabinets, water and equipment that can interfere with Wi-Fi. Test every normal work area after installation. A larger or divided office may need Ethernet cabling and extra wireless access points. Fixed critical equipment should use a wired connection where practical.',
      },
      {
        question: 'Should a small office have backup broadband?',
        answer: 'Yes if losing the connection would stop important work, calls, payments or customer service. The backup could use 4G or 5G, but it should be tested inside the premises and have enough data and capacity for essential applications. Check whether switching is automatic, what happens during a power cut and whether the backup shares infrastructure with the main service.',
      },
      {
        question: 'Is business broadband necessary for a small office?',
        answer: 'Not automatically, but check the terms before using a residential service for business. A business package may add priority support, service commitments, static IP options, guest Wi-Fi or mobile backup. Compare the precise contract against the cost of downtime. A higher monthly price is useful only when the included support and features solve a real operational requirement.',
      },
      {
        question: 'How should guest Wi-Fi be set up in a small office?',
        answer: 'Use a separate guest network if the router or managed Wi-Fi system supports one, and do not give visitors access to the staff network or router administration. Use a suitable guest password, use WPA3 encryption where supported, review it when necessary and keep the router updated. Ask a network professional for help if the office handles sensitive systems or the supplied router cannot provide the required separation.',
      },
      {
        question: 'What is a good SLA for business broadband repairs?',
        answer: 'A useful service-level agreement states an exact target fix time and what happens if the provider misses it, not just a general promise of priority support. BT Business, for example, states that its Pro-tier Prompt Care service aims to fix faults reported before 21:00 by the next working day, with a week\'s rental credit for each day it runs late, up to 12 days. Compare the exact wording and compensation terms across providers rather than assuming every business package includes the same commitment.',
      },
      {
        question: 'Should a small office use 5G broadband instead of a fixed line?',
        answer: 'It can be a genuine primary option, not only a backup, especially for a fast-moving office or a short lease where drilling and an engineer visit are impractical. Three Business, for example, currently advertises unlimited-data 5G broadband with no engineer visit and a 30-day money-back guarantee. Test indoor signal at the exact desk first, and check the data allowance and any scheduled price rise before relying on it as the only connection.',
      },
    ],
  },

  'broadband-for-landlords-and-hmos-uk': {
    body: (
      <>
        <p className="text-lg">
          <strong>The practical answer: a landlord does not automatically have to supply broadband merely because a property is rented or is an HMO, and since the Renters&apos; Rights Act abolished fixed-term tenancies in England from 1 May 2026, a broadband contract can no longer be assumed to end neatly with the tenancy.</strong> Decide whether the landlord or tenants will hold the provider contract, put the payment arrangement in the tenancy agreement, obtain any installation permission and test Wi-Fi throughout the property.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Information check:</strong> housing, regulator and provider guidance on this
            page was verified on 20 September 2026. HMO licensing and tenancy rules vary across the UK
            and by local authority. Check the rules for the property and take legal advice where
            the tenancy or licence conditions are unclear.
          </p>
        </div>

        <h2>Who should arrange and pay for broadband?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Setup', 'Best fit', 'Main advantage', 'Main risk'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Landlord holds the contract', 'Room-by-room HMO with bills included', 'Service can continue when individual tenants change', 'Landlord manages cost, faults and acceptable use'],
                ['Joint tenants arrange it', 'One household renting the whole property', 'Tenants choose the package and control the account', 'The named account holder remains responsible to the provider'],
                ['Broadband ready, tenant activates it', 'Managed building with suitable infrastructure', 'Faster occupation without a fresh physical installation', 'Availability and account model depend on the building and provider'],
              ].map(([setup, fit, advantage, risk]) => (
                <tr key={setup} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{setup}</td>
                  <td className="px-4 py-3 text-slate-700">{fit}</td>
                  <td className="px-4 py-3 text-slate-700">{advantage}</td>
                  <td className="px-4 py-3 text-slate-600">{risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          In England, government guidance says broadband and landline costs may be included in rent
          or charged separately, but included bills must be set out in the tenancy agreement. The
          wider UK position and the wording needed for a particular tenancy can differ, so do not
          treat an informal advert saying &ldquo;bills included&rdquo; as the operating plan.
        </p>

        <h2>The Renters&apos; Rights Act changed how tenancy and broadband terms align</h2>
        <p>
          From 1 May 2026, fixed-term assured shorthold tenancies in England were abolished under
          the Renters&apos; Rights Act. Every tenancy is now a periodic tenancy with no fixed end date,
          so a landlord can no longer assume a household will simply leave when a 12-month tenancy
          &ldquo;ends&rdquo; and neatly hand back a broadband contract at the same time. A tenant can
          now give notice and leave at a point the landlord cannot fix in advance, while the
          property could equally stay occupied by the same household for years.
        </p>
        <p>
          This makes the choice between a landlord-held rolling or flexible broadband contract and a
          long fixed-term deal more consequential than before. A landlord-held account that
          continues regardless of who currently lives in the room avoids repeatedly matching a
          broadband minimum term to a tenancy date that no longer exists in the same way. Where
          tenants hold their own contract, be explicit in the tenancy agreement about who pays any
          early-exit charge if they leave before a fixed broadband term ends, since the tenancy
          itself no longer has a comparable fixed end point to point to; our <Link href="/guides/broadband-contract-end-rights">broadband contract end rights guide</Link> covers
          exit charges and end-of-contract notices in more detail.
        </p>

        <h2>What the tenancy agreement should cover</h2>
        <ul>
          <li>whether broadband is included in rent or paid directly by tenants</li>
          <li>the person or business that holds the provider account</li>
          <li>who reports faults, approves engineer visits and can change the package</li>
          <li>any fair-use or lawful-use rules and how planned outages are communicated</li>
          <li>ownership and return of the router, mesh units and other provider equipment</li>
          <li>what happens to service and charges when occupiers move in or out</li>
        </ul>
        <p>
          Do not promise a particular speed in every room unless the setup has been designed and
          tested to deliver it, and the agreement explains how performance is measured. Broadband
          speed to the router and Wi-Fi performance inside bedrooms are different things.
        </p>

        <h2>Choose the connection at the exact property</h2>
        <p>
          Run provider availability checks using the full address, not only the postcode. Record the
          expected download and upload speeds, minimum term, setup cost, annual price changes and
          fault support before ordering. If broadband is included for several unrelated occupiers,
          compare packages for simultaneous use rather than choosing from the tenant count alone.
        </p>
        <p>
          There is no sound universal Mbps figure for each HMO tenant. Video calls, gaming, large
          uploads and 4K streaming create different loads, while the building layout changes Wi-Fi
          performance. List the likely simultaneous activities, allow sensible headroom and confirm
          whether the provider&apos;s router and support are suitable for the number of rooms and devices.
        </p>

        <h2>Get installation permission before the appointment</h2>
        <p>
          A new connection may involve drilling, external cabling, an optical network terminal or
          work in communal parts of a building. Virgin Media, for example, says a rented home that
          has not had its service before may need landlord permission. Flats and converted buildings
          can also require consent from a freeholder, managing agent or another party.
        </p>
        <p>
          Agree the cable route, entry point, equipment position and responsibility for making good
          before work starts. Cabling that passes through a fire door, a protected escape route or a
          compartment wall needs a competent installer who understands the property&apos;s fire safety
          requirements, not a DIY run of cable under a door. Keep the written approval and
          installation record with the property documents. Leave fixed network equipment such as an
          Openreach ONT at the property when tenants change, and follow the relevant provider&apos;s
          instructions for removable equipment.
        </p>

        <h2>Plan HMO Wi-Fi room by room</h2>
        <p>
          Put the main router in an open, raised and reasonably central location where it can remain
          powered and secure. Ofcom notes that walls and materials such as metal, water and glass can
          weaken Wi-Fi. A router beside the incoming line may therefore be a poor solution for a tall,
          extended or heavily divided HMO.
        </p>
        <ul>
          <li>test every bedroom, living area and study space with doors closed</li>
          <li>test while several residents stream, call or work online at the same time</li>
          <li>use properly planned Ethernet and wireless access points for difficult layouts</li>
          <li>consider a supported mesh system where cabling is impractical</li>
          <li>keep network administration separate from the password shared with residents</li>
        </ul>
        <p>
          Extenders and powerline adapters can help in some properties, but results depend on the
          layout and electrical wiring. Test the chosen design rather than assuming more boxes will
          fix a weak connection.
        </p>

        <h2>Segment the network between unrelated tenants</h2>
        <p>
          A single shared Wi-Fi password on a standard consumer router exposes every tenant&apos;s
          devices to every other tenant on the same network, a real privacy and security risk between
          people who are not one household. The National Residential Landlords Association recommends
          per-room network separation using commercial-grade access points and managed switches rather
          than one flat shared network, specifically to stop tenants&apos; devices and traffic being
          visible to each other. This also narrows a landlord&apos;s own exposure: if one tenant misuses
          the connection, a segmented network makes it easier to isolate and address than a single
          shared password covering the whole building.
        </p>
        <p>
          Use a landlord or management email address that will remain available when tenants leave.
          Store the provider account number, contract end date, equipment list, router administration
          details and fault process securely. Give residents the Wi-Fi credentials they need without
          sharing the provider login or router administration password, change shared credentials
          after a difficult handover, and keep router software updated.
        </p>
        <p>
          If the property uses smart locks, alarms or other managed equipment, separate them from
          resident or guest access where the network supports it and document what stops working
          during a broadband or power failure. Our <Link href="/guides/small-office-broadband-setup-uk">small office broadband setup guide</Link> covers
          the same segmentation and WPA3 principles for a shared building network in more technical
          detail.
        </p>

        <h2>Specialist HMO broadband providers vs standard residential</h2>
        <p>
          Standard residential broadband packages are not designed around several unrelated tenants,
          multiple floors, fire doors and a large number of connected devices. Specialist landlord
          broadband providers exist specifically for this: Landlord Broadband, an NRLA-partnered
          service, offers professionally cabled and networked systems ranging from mesh Wi-Fi for a
          smaller HMO up to full apartment-block networks, a 24/7 UK-based tenant support desk and a
          published no-dead-zone coverage guarantee for qualifying installations, though it does not
          publish fixed prices and instead offers a free property assessment. Virgin Media Business
          separately sells a multi-property package aimed at landlords and letting agents with
          consolidated billing and account management across several rental sites.
        </p>
        <p>
          Before moving an HMO onto a business broadband contract to get a service genuinely designed
          for multiple tenants, check what protection you would lose. Independent reporting suggests
          only a minority of UK providers apply Ofcom&apos;s residential fairness commitments,
          including minimum service guarantees and rights if speed underperforms, to their business
          contracts. A purpose-built multi-tenant HMO product or a specialist landlord broadband
          service can be a safer middle ground than either an ordinary shared residential contract
          used well beyond its intended household size, or a standard business contract that quietly
          drops residential-grade protections.
        </p>

        <h2>Manage tenant changes and contract endings</h2>
        <p>
          A landlord-held account is usually easier to keep continuous across room-by-room tenancy
          changes. Review the deal before its minimum term ends and retain end-of-contract notices.
          Ofcom says broadband contracts are commonly 12, 18 or 24 months and an early exit may
          attract a charge, so match the term to the intended operating model.
        </p>
        <p>
          If tenants hold the contract, the named customer should follow the provider&apos;s moving or
          cancellation process and return any required equipment. Do not assume a new occupier can
          take over another person&apos;s account. Confirm the provider&apos;s process early enough to avoid
          an unwanted cancellation, overlapping order or gap in service; our <Link href="/guides/how-to-switch-broadband-uk">UK broadband switching guide</Link> covers
          the One Touch Switch process a new occupier would use to move to a different provider.
        </p>

        <h2>Landlord and HMO broadband checklist</h2>
        <ol>
          <li>Check the HMO definition, licensing position and any local licence conditions.</li>
          <li>Choose who holds the broadband contract and state who pays in the tenancy agreement.</li>
          <li>Check address-level availability and compare the total contract cost and support.</li>
          <li>Obtain all permissions and agree the installation route in writing.</li>
          <li>Plan router, cabling, access points and secure administration.</li>
          <li>Test every occupied and shared area under realistic simultaneous use.</li>
          <li>Record fault reporting, equipment ownership and tenant handover steps.</li>
          <li>Review the package before the contract ends or the occupancy model changes.</li>
        </ol>
      </>
    ),
    faqs: [
      {
        question: 'Does a landlord have to provide broadband in an HMO?',
        answer: 'Not automatically merely because the property is an HMO. Broadband responsibility normally depends on the tenancy agreement and any promises made to occupiers. If broadband is included, state who holds the account, how the cost is covered and who handles faults. Check the property\'s licence conditions and local council requirements separately because HMO rules vary.',
      },
      {
        question: 'Who should pay for broadband in a rented property?',
        answer: 'Either the landlord or tenants can pay, depending on the tenancy arrangement. A landlord-managed service often suits room-by-room HMOs because it can continue between occupiers. Joint tenants may prefer their own account and package. In England, government guidance says any broadband cost included in rent or charged separately should be set out in the tenancy terms.',
      },
      {
        question: 'What broadband speed does an HMO need?',
        answer: 'There is no reliable speed based only on the number of tenants. Count likely simultaneous video calls, streams, games and uploads, then check the expected download and upload speeds at the exact address. Wi-Fi coverage also matters: test every bedroom and shared space under normal load and plan access points or Ethernet where one router is insufficient.',
      },
      {
        question: 'Do tenants need landlord permission to install broadband?',
        answer: 'They may do if installation changes the property, requires new external cabling or affects communal areas. Virgin Media says a rented home without an existing connection may need landlord permission. The tenancy can also restrict alterations, while a flat may involve a freeholder or managing agent. Obtain written approval for the cable route and equipment position before the appointment.',
      },
      {
        question: 'Should a landlord hold the broadband account for an HMO?',
        answer: 'It can be the cleaner option when broadband is included and individual room tenancies change at different times. The landlord then controls renewals, faults and equipment, but also carries responsibility to the provider. Use a durable management email, restrict account access, document the service offered and plan how residents report problems without sharing administration credentials.',
      },
      {
        question: 'How has the Renters’ Rights Act changed broadband planning for HMOs?',
        answer: 'Since 1 May 2026, fixed-term assured shorthold tenancies in England have been abolished and replaced with periodic tenancies that have no fixed end date. A landlord can no longer assume a broadband contract will naturally end when a fixed tenancy term does, since tenancies themselves no longer have one. A landlord-held rolling or flexible broadband contract, or a clear tenancy clause on who covers an early-exit charge, matters more than it did before.',
      },
      {
        question: 'Do I need a business broadband contract for an HMO?',
        answer: 'Not necessarily. A business contract can offer a service genuinely designed for multiple tenants, but independent reporting suggests only a minority of UK providers extend Ofcom’s residential fairness commitments, including minimum service guarantees, to their business contracts. Compare a specialist landlord broadband product or a purpose-built multi-tenant package against a standard business contract before assuming either automatically suits an HMO.',
      },
    ],
  },

  'leased-line-cost-uk-explained': {
    body: (
      <>
        <p className="text-lg">
          <strong>There is no universal UK leased line price.</strong> Providers build quotes for
          a particular address, bandwidth and term. Published figures are useful for setting an
          initial budget, but only a site-specific written quote can show what a small business
          will actually pay.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Price check:</strong> provider offers and independent estimates on this page
            were verified on 16 August 2026, with BT&apos;s BTnet entry price and a third
            independent guide re-checked on 27 September 2026. They use different locations,
            speeds and contract assumptions, so we report them separately and do not calculate a
            combined average. Confirm VAT, installation, annual changes and the full order terms
            before signing.
          </p>
        </div>

        <h2>Current leased line price examples</h2>
        <p>
          The examples below are not like-for-like quotes. BT&apos;s entry figure applies to a
          restricted bandwidth and long term, while Virgin Media Business publishes starting
          prices for named symmetric speeds. Availability and installation remain subject to the
          provider&apos;s checks.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">
              Advertised provider examples checked on 16 August 2026. Prices are starting points,
              not a quotation for every UK premises.
            </caption>
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Published monthly price', 'What the published offer says', 'Important limit'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['BT Business BTnet', 'From £245', '30Mbps or 50Mbps over a 1Gbps service', '60-month term; wires-only price; installation subject to survey'],
                ['Virgin Media Business DIA', 'From £312', '100Mbps upload and download', 'New service only; address check and legal terms apply'],
                ['Virgin Media Business DIA', 'From £332', '500Mbps upload and download', 'New service only; address check and legal terms apply'],
                ['Virgin Media Business DIA', 'From £358', '1Gbps upload and download', 'New service only; address check and legal terms apply'],
              ].map(([provider, price, offer, limit]) => (
                <tr key={`${provider}-${offer}`} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{provider}</td>
                  <td className="px-4 py-3 text-slate-700">{price}</td>
                  <td className="px-4 py-3 text-slate-700">{offer}</td>
                  <td className="px-4 py-3 text-slate-600">{limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Business telecoms prices are often presented without VAT, but the visible leased-line
          offer must be checked with its order summary and legal terms. Ask the supplier to state
          the monthly amount both excluding and including VAT, even if the business expects to
          recover VAT.
        </p>

        <h2>Why independent price guides disagree</h2>
        <p>
          Independent guides can help with early budgeting, but their populations and methods are
          not interchangeable. AMVIA&apos;s August 2026 guide reports indicative fully managed,
          symmetric prices by area and includes especially low on-net offers. Selectra&apos;s August
          2026 guide gives broader typical SME estimates excluding VAT. Leased Line Comparison&apos;s
          2026 guide gives a third, separately-sourced range by exact bandwidth. We have not combined
          any of them.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Source and population', '100Mbps monthly estimate', '1Gbps monthly estimate', 'Stated basis'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">AMVIA, location bands</td>
                <td className="px-4 py-3 text-slate-700">£69 to £234 in London; £69 to £318 in major cities; up to £320+ in its rural band</td>
                <td className="px-4 py-3 text-slate-700">£129 to £450 urban; up to £650 in its rural band</td>
                <td className="px-4 py-3 text-slate-600">Indicative on-net, fully managed symmetric lines; installation quoted separately</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">Selectra, typical UK SME range</td>
                <td className="px-4 py-3 text-slate-700">£200 to £400</td>
                <td className="px-4 py-3 text-slate-700">£350 to £700</td>
                <td className="px-4 py-3 text-slate-600">Indicative 2026 monthly prices excluding VAT</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">Leased Line Comparison, major-city range</td>
                <td className="px-4 py-3 text-slate-700">£139 to £280</td>
                <td className="px-4 py-3 text-slate-700">£139 to £490</td>
                <td className="px-4 py-3 text-slate-600">2026 pricing guide; also quotes 10Gb from £650, rising to thousands, and a general £139 to £700 range for an average-size business</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The gap is evidence that &ldquo;average leased line cost&rdquo; needs a methodology, not that
          one source should be silently preferred. A business in an on-net city building may see
          an unusually low offer, while a site needing new construction can cost much more.
        </p>

        <h2>Bearer size and ordered speed: a common source of quote confusion</h2>
        <p>
          A leased line quote often separates two numbers: the <strong>bearer</strong>, meaning the
          maximum physical capacity of the fibre installed at the premises, and the speed you
          actually order and pay for on top of it. BT&apos;s own BTnet page, re-checked on 27
          September 2026, advertises &ldquo;30 or 50 Mbps over a 1Gbps service&rdquo; as its entry
          configuration, the same distinction already reflected in the price table above.
          Ordering a lower speed on a higher-capacity bearer is a genuine way to reduce the monthly
          rental now while keeping the option to increase the ordered speed later, usually without
          new construction, cabling or a fresh installation charge. Always ask a supplier to state
          both the bearer size and the committed speed separately, and confirm in writing whether a
          future upgrade needs a new order, a new survey or simply a change to the existing circuit.
          Our{' '}
          <Link href="/guides/static-ip-business-broadband-explained">static IP business broadband
          guide</Link>{' '}covers a related connectivity decision worth checking alongside a leased
          line quote.
        </p>

        <h2>What changes the quote at your premises?</h2>
        <ul>
          <li><strong>Network reach:</strong> the closer suitable provider infrastructure is to the building, the less new work may be needed.</li>
          <li><strong>Committed bandwidth:</strong> compare the guaranteed usable speed, not only the capacity of the bearer carrying it.</li>
          <li><strong>Contract term:</strong> a longer commitment can reduce monthly rental or installation cost but increases the cost of changing plans or moving.</li>
          <li><strong>Construction:</strong> new ducting, fibre routes, wayleaves and work beyond a standard installation can create excess construction charges.</li>
          <li><strong>Service design:</strong> managed routers, firewalls, IP addresses, monitoring and backup circuits can sit outside the basic access price.</li>
          <li><strong>Support:</strong> response or repair commitments, service credits and support hours differ between contracts.</li>
        </ul>

        <h2>Installation cost and excess construction charges</h2>
        <p>
          A low or waived standard installation charge does not necessarily cap the build cost.
          The provider may survey the premises after an order and identify extra civil engineering,
          cabling or permissions. AMVIA&apos;s guide estimates £500 to £2,000 for standard installation
          in its dataset and says some providers waive this on 36 to 60-month terms. Treat that as
          its market estimate, not a limit on an individual site.
        </p>
        <p>
          Ask what happens if the survey finds excess construction charges. The quote should say
          who pays, when the business can cancel, whether a wayleave is needed, what temporary
          service is available and whether the contract starts before or after the circuit is live.
        </p>

        <h2>What you are paying for</h2>
        <p>
          Ofcom defines a leased line as a dedicated, symmetrical and uncontended private
          connection. Dedicated capacity and equal upload and download speeds distinguish it from
          ordinary broadband, but the commercial benefit depends on the contract. Ofcom also notes
          that a stronger service level usually costs more and that an SLA is the provider&apos;s
          contractual quality commitment.
        </p>
        <p>
          Read the SLA rather than relying on the word &ldquo;guaranteed&rdquo;. Check availability targets,
          fault measurement, response and fix commitments, exclusions, service credits and the
          process for claiming them. A target or credit does not prevent downtime, so a business
          that cannot operate offline may still need a genuinely independent backup connection.
        </p>

        <h2>Is a leased line worth it for a small business?</h2>
        <p>
          It can be worth the premium when lost connectivity would stop trading, when large uploads
          or cloud backups need predictable symmetric capacity, or when the business requires a
          specific repair commitment. It is harder to justify for a small office whose work can
          continue briefly on mobile backup and whose address has fast business FTTP at a much lower
          monthly cost.
        </p>
        <p>
          Put a realistic hourly cost on an outage and list the workloads that need guaranteed
          bandwidth. Then compare a leased line with{' '}
          <Link href="/guides/best-business-broadband-providers-uk">business FTTP</Link> plus a
          tested backup. There is no universal winner: the leased line buys dedicated performance
          and contractual support, while FTTP can buy far more headline speed per pound where shared
          capacity and its support terms are acceptable.
        </p>

        <h2>How to compare leased line quotes</h2>
        <ol>
          <li>Give every supplier the same service address, required committed speed and target go-live date.</li>
          <li>Ask for the bearer size and committed bandwidth as separate figures.</li>
          <li>Record monthly rental excluding and including VAT, setup fees and any annual price change.</li>
          <li>Request the survey, wayleave and excess construction charge process in writing.</li>
          <li>Compare contract length, notice, early termination and premises-move terms.</li>
          <li>Compare the SLA definitions, exclusions, service credits and support hours.</li>
          <li>Price required equipment, IP addresses, security, monitoring and backup separately.</li>
          <li>Calculate the full committed cost and keep uncertain construction charges outside the total until confirmed.</li>
        </ol>
      </>
    ),
    faqs: [
      {
        question: 'How much does a leased line cost in the UK?',
        answer: 'There is no reliable universal price. In August 2026, BT advertised an entry BTnet configuration from £245 a month on a 60-month term, while Virgin Media Business showed 100Mbps from £312. Independent guides publish wider and sometimes much lower ranges using different assumptions. Obtain written quotes for the exact premises and compare VAT, installation and contract terms separately.',
      },
      {
        question: 'How much is a 100Mbps leased line?',
        answer: 'Virgin Media Business advertised symmetric 100Mbps from £312 a month when checked on 16 August 2026. Independent estimates differed: Selectra suggested £200 to £400 excluding VAT, while AMVIA reported location bands starting at £69 and reaching £320 or more. These populations and methodologies differ, so they should not be averaged or treated as a quote for your address.',
      },
      {
        question: 'Does leased line pricing include installation and VAT?',
        answer: 'Not necessarily. Business prices are often shown excluding VAT, and a starting monthly price may omit installation, managed equipment and excess construction work. Ask for monthly and one-off amounts both excluding and including VAT. The written quote should also explain what happens after the site survey, who pays excess construction charges and whether standard installation is waived only on a longer contract.',
      },
      {
        question: 'Why is a leased line more expensive than business broadband?',
        answer: 'A leased line provides dedicated, uncontended capacity with equal upload and download speeds, then adds business support and a contractual service level. Standard broadband normally shares network capacity and can have much slower uploads or different repair terms. The premium is worthwhile only if those differences solve an operational risk or workload that cheaper business FTTP and a tested backup cannot handle adequately.',
      },
      {
        question: 'Is a leased line worth it for a small business?',
        answer: 'It depends on the cost of downtime and the need for guaranteed symmetric bandwidth. A leased line can suit a firm that relies on cloud systems, large uploads, internet calls or customer transactions and needs a specific repair commitment. If ordinary business FTTP meets the workload and a mobile backup keeps essential work running, that combination may offer better value. There is no universal winner.',
      },
      {
        question: 'What does "bearer size" mean for a leased line?',
        answer: 'The bearer is the maximum physical capacity of the fibre installed at the premises; the ordered speed is the smaller amount of that capacity you actually pay to use. BT’s own BTnet page, re-checked on 27 September 2026, advertises 30 or 50 Mbps over a 1Gbps bearer as its entry configuration. Ordering below the bearer’s full capacity can lower the monthly rental now while leaving room to increase the ordered speed later, usually without new construction. Ask the supplier to confirm the bearer size and committed speed separately and how a future upgrade would be handled.',
      },
    ],
  },
  'starlink-vs-fibre-broadband-uk': {
    body: (
      <>
        <p className="text-lg">
          <strong>Our verdict:</strong> choose broadband over Openreach Full Fibre when it is
          available with a suitable package at your address. It normally offers the better fixed
          connection and a choice of retail providers. Choose Starlink when a rural or isolated
          property cannot get adequate fixed broadband and you have a clear place to install and
          power the dish. There is no universal winner.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Information check:</strong> service plans, network availability and regulator
            evidence on this page were verified on 16 August 2026. Starlink plans and performance
            vary by location. Openreach availability and the packages sold over its network vary by
            address and retail provider. Check both services for the complete property address.
          </p>
        </div>

        <h2>Starlink and Openreach compared at a glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Question', 'Starlink', 'Broadband over Openreach'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['How it reaches the home', 'Low Earth orbit satellites and a dish at the property', 'Copper, part-fibre or Full Fibre cable, depending on the address'],
                ['Best fit', 'Hard-to-reach homes without adequate fixed broadband', 'Most homes where a suitable fixed package is available'],
                ['Provider relationship', 'Starlink supplies the service and equipment', 'A retail provider sells and supports service over Openreach infrastructure'],
                ['Main installation constraint', 'Clear view of the sky and a suitable powered mounting position', 'A usable network route and any required engineer installation'],
                ['Performance caveat', 'Varies with plan, location, congestion and obstructions', 'Varies with access technology, ordered tier, provider and home network'],
              ].map(([question, starlink, openreach]) => (
                <tr key={question} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{question}</td>
                  <td className="px-4 py-3 text-slate-700">{starlink}</td>
                  <td className="px-4 py-3 text-slate-700">{openreach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>First, Openreach is not a retail broadband provider</h2>
        <p>
          Openreach builds and maintains infrastructure used by hundreds of communications
          providers. You buy the package from a retail provider, which sets the price, speed tier,
          contract, router and customer support. A useful comparison therefore starts with
          Starlink against the specific Openreach-based packages available at your address, not
          Starlink against one imaginary Openreach tariff.
        </p>
        <p>
          The access technology matters too. Openreach Full Fibre, also called FTTP, runs fibre to
          the premises. FTTC uses fibre to the street cabinet and copper for the final section,
          while standard broadband uses more copper. Do not treat all three as equivalent.
        </p>

        <h2>Speed and latency</h2>
        <p>
          Starlink&apos;s current specifications say users typically experience downloads from 45 to
          280Mbps, with a majority above 100Mbps. Its plan-specific expected ranges differ, and the
          company warns that actual performance can fall at busy times. Ofcom separately reported
          that Starlink submitted UK averages of about 210Mbps download and 20Mbps upload for 2025.
          That operator-submitted average covers active connections, so it should not be treated as
          a guaranteed speed for a new customer or combined with Starlink&apos;s plan ranges.
        </p>
        <p>
          Openreach says its Full Fibre network supports retail download tiers up to 1,600Mbps,
          while FTTC reaches up to 76Mbps. Those are technology capabilities, not the speed every
          provider sells or every customer receives. Full Fibre is generally the stronger option
          for consistent, high-capacity service and latency-sensitive gaming or calls. Starlink&apos;s
          Low Earth orbit design performs far better than older satellite systems, but its radio
          path, shared capacity and changing satellite connection add variability.
        </p>

        <h2>Availability in rural and hard-to-reach areas</h2>
        <p>
          This is where Starlink can change the decision. Ofcom&apos;s spring 2026 snapshot found that
          39,000 UK premises could not get decent broadband from a fixed line or fixed wireless
          network. It also said lower-priced Starlink plans had reduced the number unable to access
          an affordable decent service to about 4,000. That is evidence for satellite&apos;s role in
          filling fixed-network gaps, not evidence that every premises can order every Starlink
          plan.
        </p>
        <p>
          Ofcom reported full fibre from all networks at 24.9 million residential premises, or 82%
          of UK homes, as of January 2026. Openreach separately reports the footprint of its own
          network and rollout target. These figures use different network populations and must not
          be combined. Run the Openreach fibre checker, the Ofcom checker and Starlink&apos;s address
          check before comparing packages.
        </p>

        <h2>Installation, weather and power</h2>
        <p>
          Starlink requires an unobstructed view of the sky. Trees, buildings and unsuitable
          mounting positions can interrupt service, so inspect the site with Starlink&apos;s app before
          ordering. The dish and router also need electricity. Starlink describes its equipment as
          weather resilient, but that does not remove the need for a secure installation or make a
          power cut harmless.
        </p>
        <p>
          Openreach Full Fibre normally requires fibre to be brought into the property and an
          optical network terminal installed inside. The router and terminal also need power.
          Where the fibre route already exists, installation may be straightforward; a new overhead
          or underground route can require an engineer and permission from a landlord or landowner.
        </p>

        <h2>Price and contract comparison</h2>
        <p>
          On 16 August 2026, Starlink listed UK Residential plans at £40 for a 100Mbps-capped plan,
          £60 for a 200Mbps-capped plan and £80 for Residential Max, with the lower tiers available
          only in selected areas. Hardware purchase, rental and activation options can differ at
          checkout. These are dated Starlink examples, not a permanent national price table.
        </p>
        <p>
          There is no single Openreach price because retail providers compete over the network.
          Compare the full minimum-term cost, setup charge, scheduled price changes, minimum speed
          information, router and support terms for each live offer. Then add Starlink&apos;s equipment,
          mounting and electricity requirements to its service cost before deciding.
        </p>

        <h2>When Starlink makes sense</h2>
        <ul>
          <li>The fixed-line estimate at the property is inadequate for the household&apos;s needs.</li>
          <li>No suitable full-fibre or fixed-wireless service is available within the required timeframe.</li>
          <li>The dish can maintain a clear sky view from a safe, permitted mounting point.</li>
          <li>The household accepts variable performance and has a plan for power cuts.</li>
          <li>A second, independent connection would materially improve resilience.</li>
        </ul>

        <h2>When Openreach Full Fibre is the better choice</h2>
        <ul>
          <li>A suitable FTTP package is already orderable at the address.</li>
          <li>Low and consistent latency matters for calls, gaming or remote interactive work.</li>
          <li>The household needs a faster tier or regularly moves large uploads and downloads.</li>
          <li>You value a choice of retail providers, contracts and bundled services.</li>
          <li>A fixed installation is practical and the retail provider&apos;s support terms meet your needs.</li>
        </ul>

        <h2>Final verdict</h2>
        <p>
          There is no universal winner, but there is a sensible order of checks. If Openreach Full
          Fibre is available, compare its live retail packages first because a wired FTTP service
          is usually the better everyday connection. If the address is left with slow copper or no
          adequate fixed option, assess Starlink&apos;s address-level plan, total equipment cost and sky
          view. Satellite is most compelling as a solution to an access problem, not as an automatic
          replacement for good full fibre.
        </p>
      </>
    ),
    faqs: [
      {
        question: 'Is Starlink better than Openreach broadband?',
        answer: 'Not universally. Openreach Full Fibre is usually the stronger default where a suitable retail package is available because it offers a fixed wired connection, higher potential speed tiers and provider choice. Starlink can be better at a rural or isolated property limited to slow copper or no adequate fixed broadband, provided the dish has a clear view of the sky.',
      },
      {
        question: 'Is Openreach a broadband provider?',
        answer: 'Openreach is the network company that builds and maintains cables, poles, cabinets and fibre used by many UK communications providers. You do not normally buy home broadband from Openreach. A retail provider sells the package, bills you and handles support, so compare Starlink with specific Openreach-based offers available at your address.',
      },
      {
        question: 'How fast is Starlink broadband in the UK?',
        answer: 'Starlink’s specifications list typical user downloads of 45 to 280Mbps, while plan-specific ranges and caps differ. Ofcom separately reported operator-submitted UK averages of about 210Mbps download and 20Mbps upload for 2025. Neither figure guarantees an individual line: location, plan, congestion, obstructions and time of day can change performance.',
      },
      {
        question: 'Can I get Starlink where Openreach Full Fibre is unavailable?',
        answer: 'Potentially, and this is one of Starlink’s strongest use cases. Availability still depends on Starlink accepting the service address and offering a suitable plan. You also need a safe installation point with an unobstructed view of the sky. Check fixed broadband, fixed wireless and Starlink separately before deciding that the property has no workable alternative.',
      },
      {
        question: 'Does Starlink work in bad weather or during a power cut?',
        answer: 'Starlink says its equipment is designed to withstand rain, sleet, wind and snow, but performance is not guaranteed in every condition. The dish and router require electricity, so normal service stops in a power cut unless you provide suitable backup power. Secure mounting, a clear sky view and safe cabling remain essential.',
      },
      {
        question: 'Should I replace Openreach FTTC with Starlink?',
        answer: 'Compare the address-specific FTTC estimate and measured performance with Starlink’s live plan and total cost. Starlink may provide a useful uplift where a long copper line is slow, but performance varies and equipment is required. Also check whether Openreach Full Fibre or another fixed network is planned, because FTTP will usually be the stronger long-term option when available.',
      },
    ],
  },
  'fttp-vs-fttc-explained': {
    body: (
      <>
        <p className="text-lg">
          <strong>FTTP is the better broadband technology when both options are available.</strong>{' '}
          Fibre to the Premises runs fibre all the way to your property, while Fibre to the
          Cabinet uses copper for the final section from a street cabinet. That gives FTTP higher
          speed potential, stronger uploads and generally better reliability. FTTC can still be
          enough for ordinary browsing and streaming, especially where full fibre is unavailable.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Technology check:</strong> UK definitions, speeds and availability guidance
            were verified on 22 August 2026. A technology&apos;s maximum capability is not a speed
            guarantee. Check the personalised estimate, minimum speed information, installation
            requirements and contract summary for your complete address before ordering.
          </p>
        </div>

        <h2>FTTP vs FTTC at a glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Feature', 'FTTP or full fibre', 'FTTC or part fibre'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Final connection to the home', 'Fibre-optic cable', 'Copper telephone line from the cabinet'],
                ['Openreach download capability', 'Retail tiers can reach gigabit and multi-gigabit speeds', 'Up to about 76 to 80 Mbps'],
                ['Upload performance', 'Usually much faster, depending on provider and tier', 'Typically limited to around 20 Mbps or less'],
                ['Effect of distance', 'Far less affected by the distance to a street cabinet', 'Copper speed normally falls as line length increases'],
                ['Reliability', 'Generally less prone to faults than copper-based FTTC', 'Copper section creates an additional fault and interference risk'],
                ['Installation', 'May require an engineer, new fibre entry and an optical network terminal', 'Usually uses the existing telephone-line route and socket'],
                ['Best fit', 'Busy homes, large downloads, uploads, work and long-term capacity', 'Light or moderate use where full fibre is unavailable or unnecessary'],
              ].map(([feature, fttp, fttc]) => (
                <tr key={feature} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{feature}</td>
                  <td className="px-4 py-3 text-slate-700">{fttp}</td>
                  <td className="px-4 py-3 text-slate-700">{fttc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>What is FTTP broadband?</h2>
        <p>
          FTTP means Fibre to the Premises. It is also called full fibre or Fibre to the Home.
          Fibre-optic cable carries the connection from the network into the property, where it
          terminates at an optical network terminal. Your router connects to that terminal. There
          is no copper telephone line in the broadband path between the local fibre network and
          your home.
        </p>
        <p>
          Full fibre can support much faster downloads and uploads than FTTC. The exact tiers vary
          by network and retail provider. Some UK providers sell 100 to 500 Mbps services, many
          sell gigabit-class packages, and a smaller number offer multi-gigabit tiers. Buying FTTP
          does not automatically mean buying the fastest tier. A household can choose a modest
          full-fibre package and still benefit from the fibre connection&apos;s reliability and future
          upgrade path.
        </p>

        <h2>What is FTTC broadband?</h2>
        <p>
          FTTC means Fibre to the Cabinet. Fibre connects the exchange or network to the green
          cabinet serving your area, but the final section to the property uses the existing
          copper telephone line. In the UK, this service normally uses VDSL technology and may be
          sold as fibre, superfast fibre, part fibre or standard fibre.
        </p>
        <p>
          Openreach describes FTTC downloads as reaching up to 76 Mbps, while Ofcom and current
          parliamentary guidance commonly describe the technology as capable of roughly 30 to 80
          Mbps. These are ranges and maxima, not promises. The length and quality of the copper
          line affect the result, so two homes buying the same package can receive different speed
          estimates.
        </p>

        <h2>Why FTTP is faster than FTTC</h2>
        <p>
          Light travels through fibre with very high capacity and low signal loss. FTTC introduces
          a copper section between the cabinet and property. VDSL performance declines as that
          copper run becomes longer and can also be affected by line quality and electrical
          interference. FTTP removes that final copper bottleneck, allowing providers to offer
          substantially higher and more consistent access speeds.
        </p>
        <p>
          The difference is especially visible in uploads. FTTC packages often provide no more
          than about 20 Mbps upstream, with slower tiers below that. FTTP upload speeds vary widely:
          Openreach-based residential products can remain asymmetric, while several alternative
          networks offer matching upload and download speeds. Check the advertised upload rate
          separately rather than assuming every full-fibre package is symmetrical.
        </p>

        <h2>Is FTTP more reliable than FTTC?</h2>
        <p>
          Generally, yes. Ofcom&apos;s consumer guidance states that FTTP on the Openreach network can
          be more reliable than FTTC because it is less prone to faults. Fibre is not vulnerable
          to the same electrical interference and corrosion issues as the final copper line.
          Removing cabinets and copper joints from the access path also removes potential fault
          points.
        </p>
        <p>
          Full fibre is not immune to outages. A damaged cable, network fault, failed router,
          failed optical terminal or power cut can still interrupt service. Both the FTTP optical
          terminal and router need electricity, and most new digital phone services will not work
          during a power cut without backup power. Reliability also depends on the provider&apos;s
          network management and repair process.
        </p>

        <h2>FTTP vs FTTC for gaming, streaming and home working</h2>
        <p>
          FTTP is the stronger choice for a busy connected household, but the right package speed
          depends on simultaneous use. One 4K stream does not need gigabit broadband. FTTC at a
          solid 50 to 70 Mbps may handle normal browsing, several HD streams and online gaming.
          Problems are more likely when multiple people stream, download games, back up photos and
          join video calls at the same time.
        </p>
        <p>
          Gaming itself uses relatively little bandwidth. Stable latency, low packet loss and a
          good wired or Wi-Fi connection matter more than a huge headline download number. FTTP
          can provide a steadier access line and dramatically shorten game downloads, but moving
          from poor Wi-Fi to faster fibre will not fix an badly positioned router. Test Ethernet
          and Wi-Fi separately.
        </p>
        <p>
          Home workers and creators benefit most from FTTP&apos;s upload capacity. Cloud backups,
          sending video, synchronising large files and hosting several video calls can saturate a
          slow FTTC upload. Compare guaranteed or minimum download information, typical uploads,
          support hours and any service-level commitment rather than treating download speed as
          the only measure of quality.
        </p>

        <h2>How FTTP installation differs from FTTC</h2>
        <p>
          FTTC normally reuses the copper line entering the property, so a provider may activate
          it remotely or arrange work on the existing route. FTTP needs a fibre path into the home.
          An engineer may run fibre from a pole or underground chamber, drill a small entry hole,
          fit an external connection point and install an optical network terminal near a power
          socket inside.
        </p>
        <p>
          Discuss the terminal and router position before drilling begins. Central placement can
          improve Wi-Fi, but the fibre route, power and access constraints affect what is possible.
          Renters should obtain any necessary permission. Flats may need a building wayleave or
          shared infrastructure, so an availability checker showing full fibre in the street does
          not always mean immediate installation in every unit.
        </p>

        <h2>Can you keep a landline with FTTP?</h2>
        <p>
          Full fibre does not use the traditional analogue telephone line to carry broadband.
          Providers that include home phone service normally deliver calls digitally through the
          router or another adapter. Ask whether your number can be ported and whether alarms,
          telecare devices, fax machines or payment terminals are compatible. Digital voice
          normally requires mains power, so vulnerable users should discuss resilience options
          with the provider before switching.
        </p>

        <h2>How to check whether you have FTTP or FTTC</h2>
        <ol>
          <li>Run the network or provider&apos;s full-address availability checker, not a town-level search.</li>
          <li>Look for the terms Full Fibre, FTTP or Fibre to the Premises in the contract summary.</li>
          <li>Check the equipment: FTTP normally has a separate optical network terminal with fibre entering it.</li>
          <li>Do not rely on the word fibre by itself, because older advertising often used it for FTTC.</li>
          <li>Compare the personalised speed range and installation description before ordering.</li>
        </ol>
        <p>
          Ofcom introduced guidance to reduce confusion around broadband technology. Providers
          should use clear terms such as full fibre for FTTP and part fibre for FTTC and explain
          the underlying network. If a deal page remains unclear, ask the provider in writing which
          technology reaches the property.
        </p>

        <h2>Is upgrading from FTTC to FTTP worth it?</h2>
        <p>
          Upgrading is usually worthwhile when the whole-term price is competitive, you need
          faster uploads, the existing copper line is slow or unreliable, or several people share
          the connection. It can also be a sensible long-term choice even on a lower speed tier,
          because later upgrades normally do not require replacing the access line again.
        </p>
        <p>
          FTTC may still be the rational choice if full fibre is unavailable, installation is not
          currently practical, or a stable FTTC estimate already exceeds the household&apos;s needs at
          a meaningfully lower total price. Compare the full minimum-term cost, scheduled price
          changes, setup charges, router, upload rate and guaranteed speed. Do not pay for a
          gigabit package merely because the technology can support it.
        </p>

        <h2>Bottom line</h2>
        <p>
          FTTP wins the technology comparison because fibre reaches the premises and removes the
          speed-limiting copper section. It offers more headroom, better uploads and generally
          stronger reliability. FTTC remains a usable part-fibre service for many homes, but its
          performance depends on the final copper line and tops out at a much lower level. Check
          the exact address, then buy the lowest full-fibre tier that comfortably meets your real
          household use and budget.
        </p>
      </>
    ),
    faqs: [
      { question: 'Is FTTP better than FTTC?', answer: 'Yes, FTTP is the better access technology because fibre runs all the way to the property. It supports much faster downloads and uploads, is less affected by distance and is generally less prone to faults than FTTC. FTTC can still be adequate for moderate household use where full fibre is unavailable or costs materially more.' },
      { question: 'What is the main difference between FTTP and FTTC?', answer: 'FTTP uses fibre-optic cable for the whole network path into the property. FTTC uses fibre only as far as a street cabinet and carries the final section over copper telephone cable. That copper section limits speed, particularly upload speed, and makes performance more dependent on distance and line condition.' },
      { question: 'How fast are FTTP and FTTC in the UK?', answer: 'Openreach describes FTTC as reaching up to about 76 Mbps, with real estimates affected by the copper line. FTTP supports gigabit and, on some networks, multi-gigabit packages. The exact FTTP speed depends on the provider and tier purchased. Always use the personalised address estimate rather than a technology maximum.' },
      { question: 'Does FTTP improve gaming and Wi-Fi?', answer: 'FTTP can shorten downloads and provide a more stable, higher-capacity access line, which helps busy gaming households. It does not automatically fix Wi-Fi dead spots or congestion inside the home. Router position, wireless standard, interference and Ethernet connections still matter, while stable latency and packet loss matter more to live gameplay than headline speed alone.' },
      { question: 'Do I need a new router or engineer for FTTP?', answer: 'An FTTP order often needs an engineer to bring fibre into the property and install an optical network terminal. The provider normally supplies a compatible router, although the exact process depends on existing infrastructure. Agree the equipment position, check power availability and obtain landlord or building permission where required before installation.' },
      { question: 'Can I keep my telephone number when moving from FTTC to FTTP?', answer: 'Usually, if the new provider supports number porting and you request it during the order. Calls will normally move to a digital voice service delivered through the router or an adapter rather than the old analogue line. Check compatibility for alarms or telecare and ask about power-cut resilience before switching.' },
    ],
  },
  'best-mesh-wifi-for-your-broadband-router': {
    body: (
      <>
        <p className="text-lg">
          <strong>The TP-Link Deco BE65 is our best overall mesh Wi-Fi system for a fast UK broadband connection in 2026.</strong>{' '}
          It combines tri-band Wi-Fi 7, four 2.5Gbps ports per unit and wired or wireless backhaul.
          Choose eero 6+ for a simpler, cheaper Wi-Fi 6 setup, Google Nest Wifi Pro for a Google
          Home household, or Netgear Orbi 770 when premium coverage and multi-gigabit ports matter
          more than price. The right choice depends on your broadband speed, property and cabling.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm"><strong>Product check:</strong> specifications, UK availability and recommendation evidence were checked on 22 August 2026. Prices change frequently and manufacturer coverage figures use ideal test conditions. Check the exact model, pack size, subscription features, returns policy and compatibility with your broadband provider before buying.</p>
        </div>

        <h2>Best mesh Wi-Fi systems for UK broadband</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-slate-50">{['System', 'Best for', 'Wi-Fi and ports', 'Main limitation'].map((heading) => <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>{[
              ['TP-Link Deco BE65', 'Best overall for fast full fibre', 'Tri-band Wi-Fi 7; four 2.5Gbps ports', 'Premium price and Wi-Fi 7 benefits need compatible devices'],
              ['Amazon eero 6+', 'Simple setup and good-value Wi-Fi 6', 'Dual-band Wi-Fi 6; two gigabit ports', 'Limited ports and some advanced features require eero Plus'],
              ['Google Nest Wifi Pro', 'Google Home and Matter households', 'Tri-band Wi-Fi 6E; two gigabit ports', 'Cannot mesh with older Nest Wifi or Google Wifi units'],
              ['Netgear Orbi 770', 'Large homes and premium multi-gigabit coverage', 'Tri-band Wi-Fi 7; 2.5Gbps WAN, LAN and backhaul', 'Expensive and physically large'],
            ].map(([system, best, specification, limitation]) => <tr key={system} className="border-b border-slate-100"><td className="px-4 py-3 font-semibold text-slate-900">{system}</td><td className="px-4 py-3 text-slate-700">{best}</td><td className="px-4 py-3 text-slate-700">{specification}</td><td className="px-4 py-3 text-slate-600">{limitation}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>1. TP-Link Deco BE65: best overall mesh Wi-Fi</h2>
        <p>The Deco BE65 is the strongest all-round choice for a household that wants to keep a mesh system through its next broadband upgrade. TP-Link specifies tri-band Wi-Fi 7 across 2.4GHz, 5GHz and 6GHz, with Multi-Link Operation and four 2.5Gbps Ethernet ports on each unit. Those ports allow a multi-gigabit internet connection, wired devices and 2.5Gbps Ethernet backhaul without immediately adding a separate switch.</p>
        <p>It is most useful with gigabit or faster full fibre, several modern devices, or Ethernet cabling between floors. Older phones and laptops still connect because Wi-Fi standards are backwards compatible, but they will not gain Wi-Fi 7 features. Do not confuse the system&apos;s combined theoretical wireless figure with the speed of one device or your broadband line. Real throughput falls with distance, walls, interference and client capability.</p>

        <h2>2. Amazon eero 6+: best simple Wi-Fi 6 mesh</h2>
        <p>eero 6+ is a sensible choice when the problem is patchy coverage rather than multi-gigabit speed. It uses dual-band Wi-Fi 6 with 160MHz channels and has two auto-sensing gigabit Ethernet ports. Setup and day-to-day management are designed around the eero mobile app, which makes it approachable for a household that does not want to tune channels or manage separate access points.</p>
        <p>The trade-offs are important. Two ports fill quickly, wireless backhaul shares radio capacity with connected devices, and a gigabit port limits wired internet throughput to gigabit-class speeds. Some security, filtering and management features sit behind an eero Plus subscription, so compare the useful free feature set with the recurring cost. It remains a good fit for broadband up to around 500Mbps or 1Gbps where simplicity matters.</p>

        <h2>3. Google Nest Wifi Pro: best for Google Home</h2>
        <p>Nest Wifi Pro suits a home already using the Google Home app, Matter and Thread devices. Google lists Wi-Fi 6E, three radio bands, proactive band steering, client roaming, video-call quality controls and two gigabit Ethernet ports per unit. Each router can act as a mesh point, so a two or three-unit pack can extend coverage without choosing different router and satellite hardware.</p>
        <p>Compatibility is the main warning. Google states that Nest Wifi Pro cannot join a mesh with previous-generation Nest Wifi or Google Wifi products. Its Ethernet ports are also limited to 1Gbps, so it is not the right purchase for delivering a multi-gigabit broadband tier to wired devices. The 6GHz band offers useful capacity but has shorter practical reach through walls than 2.4GHz, making node placement particularly important.</p>

        <h2>4. Netgear Orbi 770: best premium system for a large home</h2>
        <p>Orbi 770 is a premium tri-band Wi-Fi 7 system for large or demanding properties. Netgear&apos;s UK specification gives the router a 2.5Gbps internet port and three 2.5Gbps LAN ports, while each satellite has two 2.5Gbps ports. That supports wired backhaul and fast local devices without a gigabit bottleneck. The two-pack is advertised for up to 4,500 square feet, but treat that as a laboratory-style maximum rather than a promise for a brick-built UK home.</p>
        <p>Its cost is difficult to justify for modest broadband or a small flat. Buy it when there is a real need for stronger hardware, a large floor area, multi-gigabit ports or many simultaneous devices. A well-placed cheaper Wi-Fi 6 system with Ethernet backhaul can outperform an expensive wireless mesh whose satellites sit behind several dense walls.</p>

        <h2>What is mesh Wi-Fi and how does it work?</h2>
        <p>A mesh network uses a main router and one or more connected nodes to provide a shared Wi-Fi name around the property. Compatible devices can move between nodes while the system steers them towards an appropriate access point and band. This differs from a basic extender, which may create a separate network name or repeat an already weak signal with less coordinated roaming.</p>
        <p>Nodes communicate through backhaul. Wireless backhaul uses Wi-Fi, which is convenient but consumes radio capacity and weakens when nodes are too far apart. Ethernet backhaul connects nodes by cable and normally provides the fastest, most stable result. Tri-band systems can use a 6GHz or additional band for backhaul, but thick walls and floors still reduce performance. Mesh improves distribution inside the home; it cannot make the broadband line itself faster. Use our guide to <Link href="/guides/fix-wifi-dead-spots-uk">diagnose and fix a Wi-Fi dead spot</Link> before choosing how many nodes to buy.</p>

        <h2>Wi-Fi 6, Wi-Fi 6E or Wi-Fi 7?</h2>
        <p>Wi-Fi 6 is enough for many UK homes and can offer excellent coverage with compatible devices. Wi-Fi 6E adds the 6GHz band, creating more clean capacity at short range. Wi-Fi 7 adds features including Multi-Link Operation and wider channels, with much higher potential throughput. Those advances matter most with new client devices, fast full fibre, congested homes and multi-gigabit wired ports.</p>
        <p>Read our <Link href="/guides/wifi-7-explained-uk">plain-English Wi-Fi 7 guide</Link> for the UK spectrum limits, compatibility checks and an upgrade decision table before paying extra for a Wi-Fi 7 mesh.</p>
        <p>Future-proofing has limits. A Wi-Fi 7 mesh cannot give an older Wi-Fi 5 laptop Wi-Fi 7 performance, and a 100Mbps broadband line remains a 100Mbps line. For a normal two-person home on 100 to 300Mbps broadband, a good Wi-Fi 6 system may be better value. For a gigabit connection expected to remain in service for years, Wi-Fi 7 and 2.5Gbps ports are easier to justify.</p>

        <h2>How many mesh nodes do you need?</h2>
        <p>Start with two units for a typical two-storey home and add a third only when the layout or measured coverage requires it. More nodes are not automatically better. Units placed too close can increase interference, while units placed in existing dead zones have too little signal to relay. Put a wireless satellite part-way between the main router and the problem room, not inside the room where the old Wi-Fi already fails.</p>
        <ul><li><strong>Flat or small home:</strong> test one modern router before buying mesh.</li><li><strong>Typical semi-detached home:</strong> two well-placed nodes are often a sensible starting point.</li><li><strong>Three floors or an extension:</strong> consider three nodes or Ethernet backhaul.</li><li><strong>Thick stone walls or outbuildings:</strong> wired access points, powerline-assisted mesh or professional cabling may work better.</li></ul>

        <h2>How to connect mesh Wi-Fi to your broadband router</h2>
        <ol><li>Confirm whether your provider requires its own router for authentication, digital voice or television.</li><li>Connect the primary mesh unit by Ethernet to the optical terminal, modem or provider router.</li><li>If supported, use modem or bridge mode so the mesh performs routing without double NAT.</li><li>If bridge mode is unavailable, use access-point mode on the mesh or disable the provider router&apos;s Wi-Fi and check gaming, VPN and port-forwarding behaviour.</li><li>Place the next node where it still receives a strong link, then test every important room.</li><li>Update firmware, use WPA2 or WPA3, set a strong administrator password and create a guest network.</li></ol>
        <p>TP-Link&apos;s UK support documentation describes both router and access-point approaches with an existing modem router. Provider implementations differ, particularly Sky authentication and digital voice. Do not remove the ISP hub until you have confirmed that the replacement can establish the connection and retain any telephone or TV service you use.</p>

        <h2>Mesh Wi-Fi buying checklist</h2>
        <ul><li>Match the WAN and LAN port speed to your broadband tier and wired devices.</li><li>Check whether the pack supports Ethernet backhaul and whether every node has usable ports.</li><li>Confirm the Wi-Fi generation used by your actual phones, laptops, televisions and consoles.</li><li>Separate included parental controls and security updates from paid subscriptions.</li><li>Check compatibility with the ISP connection, digital voice and television service.</li><li>Choose the smallest pack that solves the measured coverage problem and buy from a retailer with a practical returns policy.</li></ul>

        <h2>Bottom line</h2>
        <p>Buy the Deco BE65 when you want the best balance of Wi-Fi 7, multi-gigabit ports and flexible backhaul. Choose eero 6+ for straightforward Wi-Fi 6 coverage, Nest Wifi Pro for a Google-centred smart home, or Orbi 770 for a premium large-home network. Before spending, test the broadband beside the existing router. If that test is slow, fix the line or package first. Mesh is the answer to a home coverage problem, not every broadband problem.</p>
      </>
    ),
    faqs: [
      { question: 'What is the best mesh Wi-Fi system in the UK?', answer: 'The TP-Link Deco BE65 is our best overall choice for 2026 because it combines tri-band Wi-Fi 7, four 2.5Gbps ports per unit and wired or wireless backhaul. It is best suited to fast full fibre and modern devices. eero 6+ offers better value when simple Wi-Fi 6 coverage is the main requirement.' },
      { question: 'Will mesh Wi-Fi make my broadband faster?', answer: 'Mesh cannot increase the speed entering your home. It can improve the speed devices receive in rooms where the existing router signal is weak. Test over Ethernet or beside the router first. If that result is already slow, investigate the broadband package or line before buying mesh equipment.' },
      { question: 'Can I use mesh Wi-Fi with a BT, Sky, Virgin Media or other ISP router?', answer: 'Usually, but the correct setup varies. You may use modem or bridge mode, connect the mesh in access-point mode, or retain the provider router for authentication, digital voice or television. Check provider and mesh instructions first because using two routers without the right configuration can cause double NAT and complicate gaming or port forwarding.' },
      { question: 'Is Wi-Fi 7 mesh worth it?', answer: 'Wi-Fi 7 is worth considering for gigabit or multi-gigabit full fibre, new Wi-Fi 7 devices, busy households and buyers keeping the system for several years. A good Wi-Fi 6 mesh is usually better value for broadband below roughly 500Mbps and older devices. Multi-gigabit Ethernet ports can matter as much as the wireless label.' },
      { question: 'How many mesh Wi-Fi nodes do I need?', answer: 'Two units are a sensible starting point for many two-storey UK homes. Larger, three-storey or unusually shaped properties may need three, while a flat may need only one good router. Add nodes based on measurements. Too many nearby units can increase interference, and a satellite placed inside a dead zone cannot relay a strong signal.' },
      { question: 'Is Ethernet backhaul better than wireless mesh?', answer: 'Yes. Ethernet backhaul normally gives each node a faster, more stable link and preserves wireless capacity for phones and laptops. Wireless backhaul is easier to install and can work well with good placement, but walls, floors and distance reduce it. For gigabit broadband or difficult buildings, cabling is often the most effective upgrade.' },
    ],
  },
  'broadband-help-if-you-claim-benefits-uk': {
    body: (
      <>
        <p className="text-lg"><strong>If you or someone in your household receives Universal Credit, you may qualify for a broadband social tariff costing £10 to £24 a month.</strong> These are normal broadband services at a lower price, usually with unlimited data, little or no setup cost, no mid-contract price rise and no fee to leave. Start by asking your current provider, then compare every eligible tariff available at your exact address.</p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5"><p className="mb-0 text-sm"><strong>Tariff check:</strong> Ofcom&apos;s list was last updated on 17 August 2026 and checked for this guide on 22 August 2026. Prices, benefit rules and availability change. Verify the exact tariff with the provider before switching. A benefit does not guarantee that every network serves your address.</p></div>

        <h2>Broadband social tariffs at a glance</h2>
        <div className="overflow-x-auto"><table className="w-full text-sm border-collapse"><thead><tr className="bg-slate-50">{['Example tariff', 'Monthly price', 'Average speed', 'Where available'].map((h) => <th scope="col" key={h} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{h}</th>)}</tr></thead><tbody>{[
          ['Community Fibre Essential', '£12.50', '35 Mbps', 'London network areas'],
          ['4th Utility Social Tariff', '£13.99', '30 Mbps', 'Eligible buildings in England'],
          ['FibreNest Social Tariff', '£14.50', '36 Mbps', 'Eligible new-build estates'],
          ['Fibrus Full Fibre Essential', '£14.99', '50 Mbps', 'Northern Ireland and Cumbria network areas'],
          ['G.Network Essential Fibre', '£15', '50 Mbps', 'London network areas'],
          ['BT Home Essentials No Income', '£16.50', '36 Mbps', 'Widely available in the UK, strict no-income rule'],
          ['Connect Fibre Essentials', '£20', '150 Mbps', 'Selected English network areas'],
        ].map(([tariff, price, speed, area]) => <tr key={tariff} className="border-b border-slate-100"><td className="px-4 py-3 font-semibold text-slate-900">{tariff}</td><td className="px-4 py-3 text-slate-700">{price}</td><td className="px-4 py-3 text-slate-700">{speed}</td><td className="px-4 py-3 text-slate-600">{area}</td></tr>)}</tbody></table></div>
        <p>The table is a selected snapshot from Ofcom, not a complete ranking. The cheapest national-looking price may not be available on your network, while a local full-fibre tariff may provide much faster service. Use Ofcom&apos;s complete current list and the provider&apos;s full-address checker. Do not compare tariffs with different eligibility rules as though price were their only difference.</p>

        <h2>What is a broadband social tariff?</h2>
        <p>A social tariff is a discounted broadband or phone package for people receiving specified benefits or meeting another provider rule. It uses the same network as an ordinary package and is not a separate, lower-quality public network. Providers may call it Essential, Basics, Home Essentials or a similar name, which is why it can be difficult to spot on a normal deals page.</p>
        <p>Ofcom says current tariffs cost £10 to £24 a month. Most offer more than 30 Mbps, unlimited usage and very small or zero setup fees. A social tariff should not rise in price mid-contract, and the customer should be able to leave without an exit fee. Those protections can make it better value than a standard promotional deal whose price rises or jumps after the minimum term.</p>

        <h2>Who qualifies for cheaper broadband?</h2>
        <p>Universal Credit is the broadest route. Ofcom says that if you or someone in the household receives Universal Credit, you could switch to any tariff on its current list. Major providers also commonly accept Pension Credit, income-related Employment and Support Allowance, income-based Jobseeker&apos;s Allowance and Income Support. Some extend eligibility to Personal Independence Payment, Attendance Allowance or other benefits.</p>
        <p>The exact rule belongs to the provider. Some tariffs require the benefit recipient to be the main account holder. BT&apos;s lowest no-income version has a stricter zero-earned-income condition, while other BT Home Essentials options accept people in and out of work on qualifying benefits. PIP alone does not qualify with every provider because it is not means-tested. Read the published list rather than assuming one provider&apos;s rule applies across the market.</p>

        <h2>Broadband for Universal Credit</h2>
        <p>Universal Credit qualifies across Ofcom&apos;s listed social tariffs, but network availability still decides what can be ordered. Ask your current provider first because moving to its own social tariff should be free even during a minimum term. This can preserve the existing line, reduce disruption and avoid an unnecessary installation.</p>
        <p>If the current provider has no suitable tariff, compare other networks. Enter the complete address, check the expected download and upload speeds, then ask whether leaving the existing contract is penalty-free. Ofcom says the old provider might waive an exit charge, but that is not a universal promise when switching to another company. Obtain the exact leaving cost before placing the order.</p>

        <h2>Can you get a social tariff with Pension Credit, PIP or ESA?</h2>
        <p>Pension Credit, income-related ESA, income-based JSA and Income Support are accepted by many major providers. Personal Independence Payment and Attendance Allowance are accepted by some providers, including several regional networks, but not all. Check whether a published Pension Credit rule means Guarantee Credit specifically and whether the account must be in the claimant&apos;s name.</p>
        <p>A household member&apos;s qualifying benefit may be enough under Ofcom&apos;s general explanation, yet the named contract-holder requirement still matters. If necessary, ask whether the provider can change the account holder without interrupting service. Do not email screenshots containing more benefit or identity information than requested. Use the provider&apos;s official application and verification route.</p>

        <h2>How providers check eligibility</h2>
        <p>Many providers can ask the Department for Work and Pensions to confirm whether a customer receives an eligible benefit, with the customer&apos;s permission. The check returns an eligibility result rather than giving the broadband company full details of the claim. Other providers may request a recent letter or online-account evidence. Use only the official website or telephone number and ask how evidence will be stored.</p>
        <p>Eligibility can be checked again, often annually or at the end of a stated period. Ask what happens if the qualifying benefit ends: whether there is notice, a move to a standard tariff, a choice to leave, or another affordability option. Keep the contract summary and any confirmation of the protected price so you can challenge an incorrect bill.</p>

        <h2>How to apply for a broadband social tariff</h2>
        <ol><li>Check whether the current provider appears on Ofcom&apos;s social-tariff list.</li><li>Confirm which household member receives which qualifying benefit.</li><li>Open the provider&apos;s official social-tariff page or call and ask for the named package.</li><li>Give permission for the eligibility check or supply only the evidence requested.</li><li>Confirm the monthly price, setup fee, speed, contract term and annual recheck process.</li><li>Ask in writing whether the current contract and any exit charge will be removed.</li><li>Save the order summary and check the first bill.</li></ol>

        <h2>Will switching affect your benefits or credit score?</h2>
        <p>Taking a social tariff does not normally reduce the qualifying benefit. It is a discounted commercial service, not an extra benefit payment. The eligibility check is designed to confirm entitlement. A provider may still conduct identity, fraud or credit checks under its normal ordering policy, so ask what check applies before submitting a new-provider application if credit history is a concern.</p>
        <p>Moving within the same provider can be simpler than making a new application elsewhere. Do not cancel the old broadband first. Let the provider explain the migration or use One Touch Switch for a change of fixed provider, then keep service active until the switch date is confirmed. Return rented equipment by the deadline and retain proof of postage.</p>

        <h2>Social tariff or a normal broadband deal?</h2>
        <p>A standard introductory deal can sometimes have a lower headline effective cost after cashback or vouchers. MoneySavingExpert notes that regular switchers may find standard new-customer incentives competitive, while social tariffs can be stronger for customers who want a stable long-term price. Compare cash you are certain to receive, not a reward that requires a missed claim process.</p>
        <p>Add every payment, setup cost and scheduled rise across the minimum term. Then compare the post-contract price, exit rights and the time you realistically expect to keep the service. A £20 social tariff with no rise and no exit fee can be safer than a £19 promotional deal with a later increase, but a local £12.50 tariff may be unavailable at your address. There is no universal cheapest provider.</p>

        <h2>What if you are struggling but do not qualify?</h2>
        <p>Contact the provider before missing a payment. Explain what you can afford and ask about a cheaper package, payment plan, bill date change, temporary support or penalty-free downgrade. The February 2026 Telecoms Consumer Charter says participating providers will signpost social tariffs and offer customers in financial difficulty cheaper plans without a penalty and manageable payment plans.</p>
        <p>Also check benefit entitlement through an independent adviser such as Citizens Advice or a benefits calculator, and compare current broadband deals at the address. Do not take expensive short-term credit solely to keep a communications bill current. If disconnection would create a safety or accessibility risk, tell the provider and ask how it records vulnerability and maintains access to essential communications.</p>

        <h2>Bottom line</h2>
        <p>Start with your current provider, because an internal move is usually the quickest and should be free. Universal Credit gives the widest eligibility, while Pension Credit and legacy income-related benefits are accepted by most major providers. PIP and Attendance Allowance depend more heavily on the provider. Compare the exact address, speed and eligibility rather than price alone, and use Ofcom&apos;s current list as the authoritative starting point.</p>
      </>
    ),
    faqs: [
      { question: 'Can I get cheaper broadband on Universal Credit?', answer: 'Yes. Ofcom says that if you or someone in your household receives Universal Credit, you could switch to any social tariff on its current list, subject to network availability and the provider’s account-holder process. Prices currently range from £10 to £24 a month. Ask your existing provider first because an internal move should be free.' },
      { question: 'What is the cheapest broadband social tariff?', answer: 'There is no universal cheapest tariff because prices, eligibility and network coverage differ. Ofcom’s August 2026 list includes packages from £10 a month and selected widely or regionally available examples around £12.50 to £16.50. Check the complete current Ofcom table and the exact address, then compare speed, setup costs and account-holder rules.' },
      { question: 'Can I get a broadband social tariff on PIP?', answer: 'Possibly. Some providers accept Personal Independence Payment or Attendance Allowance, but many major tariffs focus on means-tested benefits such as Universal Credit and Pension Credit. PIP alone does not qualify everywhere. Check each provider’s published eligibility list and whether the benefit recipient must be the main broadband account holder before applying.' },
      { question: 'Can I switch to a social tariff while still in contract?', answer: 'If your current provider offers a social tariff, Ofcom says you can switch to it at any time free of charge. When moving to another provider, the old company might waive an early termination fee, but this is not guaranteed. Ask for the exact leaving charge in writing before ordering and do not cancel the working line yourself first.' },
      { question: 'Do social tariff broadband prices increase?', answer: 'Ofcom says the agreed social-tariff price should not rise mid-contract. Social tariffs also normally have small or zero setup costs and no fee to leave. Eligibility may be checked again, so ask what price and notice apply if the qualifying benefit ends. Keep the contract summary and check every bill against the protected monthly amount.' },
      { question: 'Will a social tariff affect my benefits?', answer: 'Taking a broadband social tariff does not normally reduce your benefit because it is a discounted service, not an additional benefit payment. Providers may verify eligibility through the DWP with permission or request evidence. Ask how often eligibility is rechecked and what happens if the benefit stops, and share documents only through the provider’s official process.' },
    ],
  },
  'january-broadband-deals-uk': {
    body: (
      <>
        <p className="text-lg">
          <strong>January broadband deals are worth comparing, but January is not automatically
          the cheapest month to switch.</strong> Start with your contract status and the offers
          available at your address. The right deal has a suitable speed and a lower whole-term
          cost after fees and stated price changes, not simply a low first-month figure or a
          new-year label.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Seasonal information:</strong> this guide was checked on 21 August 2026 and
            does not present expired January promotions as live offers. Prices, rewards and
            availability can change by date and postcode. Recheck every amount and contract term
            with the provider before ordering.
          </p>
        </div>

        <h2>Are broadband deals better in January?</h2>
        <p>
          There is no dependable evidence that January produces the lowest broadband price for
          every household. Providers run promotions throughout the year, while address-level
          availability, contract timing and retention offers can matter more than the month. Treat
          a January sale as an invitation to compare, not proof that a deal is exceptional.
        </p>
        <p>
          January may still be convenient if a contract has just ended, a household is reviewing
          its budget or an end-of-contract notification shows a higher future price. Ofcom requires
          providers to send that notification between 10 and 40 days before the minimum term ends
          and include the end date, future price and the provider&apos;s best available deals.
        </p>

        <h2>Check whether you can switch without an exit fee</h2>
        <p>
          Confirm the minimum-term end date in your account, contract or provider notification.
          Leaving early can trigger an early termination charge, which may exceed the saving from
          a new offer. Ask the current provider for the exact charge rather than estimating it from
          the number of months remaining.
        </p>
        <p>
          If the minimum term has ended, compare a renewal with offers from other providers. Ofcom&apos;s
          2026 pricing report found a gap between promoted in-contract prices and out-of-contract
          list prices for the household bundles it analysed. That evidence supports acting at
          contract end, but it is not a January-only saving and should not be converted into a
          universal discount for an individual bill.
        </p>

        <h2>Compare the total contract cost</h2>
        <p>
          Calculate what you will pay across every month of the minimum term. Since 17 January
          2025, a new broadband contract cannot use an inflation-linked or percentage-based
          in-contract price-rise term. If a provider includes a specified rise, Ofcom requires it
          to show the increase clearly in pounds and pence and say when it applies.
        </p>
        <p>
          Provider policies still differ. For example, BT and Plusnet publish their own annual
          increase rules and the amount can depend on when a customer joined or renewed. These are
          separate provider terms, not a market average. Read the contract summary shown for the
          exact package at checkout.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Cost item', 'What to record', 'Common mistake'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Monthly payments', 'Each monthly price before and after any scheduled rise', 'Multiplying the introductory price by the full term'],
                ['One-off charges', 'Setup, activation, delivery and installation', 'Ignoring a fee because it is paid separately'],
                ['Rewards', 'Only guaranteed credit, cashback or vouchers you can claim', 'Treating a conditional reward as cash already received'],
                ['Leaving costs', 'Exact early termination charge from the current provider', 'Assuming the new provider will pay it'],
                ['After the term', 'The price and notice rules once the minimum term ends', 'Letting the service roll on without a reminder'],
              ].map(([item, record, mistake]) => (
                <tr key={item} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item}</td>
                  <td className="px-4 py-3 text-slate-700">{record}</td>
                  <td className="px-4 py-3 text-slate-600">{mistake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Match the deal to your address and household</h2>
        <p>
          Enter the full address or postcode before comparing. The same provider may offer
          different technologies and speeds from one street to the next. Use the personalised
          download and upload estimate, minimum speed information and installation requirements,
          rather than assuming the maximum speed in an advert is available to the property.
        </p>
        <ul>
          <li><strong>Light use:</strong> browsing, email and one or two streams need less capacity than a busy shared home.</li>
          <li><strong>Home working:</strong> check upload speed, Wi-Fi coverage and support as well as downloads.</li>
          <li><strong>Gaming:</strong> stable latency and reliability can matter more than the highest headline speed.</li>
          <li><strong>Large households:</strong> allow for simultaneous streams, calls, downloads and connected devices.</li>
        </ul>

        <h2>New customer deal or renewal offer?</h2>
        <p>
          Compare both. A renewal can avoid an installation and keep the existing equipment, while
          switching may produce a lower price, faster technology or better terms. Ask the current
          provider to put its renewal offer in writing, then compare it with the same speed range
          and contract length elsewhere. Do not value convenience at zero, but do not accept a
          loyalty price without checking the market.
        </p>
        <p>
          MoneyHelper recommends looking beyond short promotions and considering longer-term cost,
          speed, usage, contract length and fees. Its consumer guidance and Ofcom&apos;s regulatory
          evidence use different approaches, so neither is turned into a combined score here.
        </p>

        <h2>How to switch after choosing a deal</h2>
        <ol>
          <li>Save the offer page and contract summary, including all prices and the advertised reward terms.</li>
          <li>Check the activation date and do not separately cancel the old broadband unless instructed.</li>
          <li>Under One Touch Switch, contact the new provider and let it coordinate the broadband move.</li>
          <li>Read the switching notice from the old provider, including any exit charge and services affected.</li>
          <li>Return rented equipment by the stated deadline and keep proof of postage.</li>
          <li>Check the first and final bills, then set a reminder before the new minimum term ends.</li>
        </ol>
        <p>
          One Touch Switch covers moves between different fixed networks, but bundled television,
          mobile or other services may need separate action. Confirm what will be cancelled before
          approving the switch.
        </p>

        <h2>January broadband deal checklist</h2>
        <ul>
          <li>Is the current minimum term over, and is any exit charge confirmed?</li>
          <li>Is the advertised package actually available at the full address?</li>
          <li>Does the estimated speed suit the household, including uploads and simultaneous use?</li>
          <li>What is the total minimum-term cost after stated price rises and one-off fees?</li>
          <li>Are cashback, bill credit or vouchers guaranteed, and what must you do to claim them?</li>
          <li>What will the service cost after the minimum term?</li>
          <li>Will linked phone, TV, mobile or email services be affected?</li>
        </ul>

        <h2>Bottom line</h2>
        <p>
          A January promotion is worthwhile only when it beats the realistic alternatives for the
          address after every cost and contract condition is counted. If the existing minimum term
          has ended, compare now rather than paying an out-of-contract price through inertia. If an
          exit fee remains, calculate whether waiting is cheaper. There is no universal best month
          or provider, only the best supported choice for the household at the time it can switch.
        </p>
      </>
    ),
    faqs: [
      {
        question: 'Are broadband deals cheaper in January?',
        answer: 'Not necessarily. Providers promote broadband at different times, and the cheapest option depends on your address, required speed, contract status and total minimum-term cost. January is a useful reminder to compare, especially if your contract has ended, but a new-year label does not prove that an offer is cheaper than deals available in other months.',
      },
      {
        question: 'Should I wait until January to switch broadband?',
        answer: 'Do not wait solely for the calendar if you are already paying an expensive out-of-contract price. Compare live offers and your provider’s renewal terms now. If you are still in a minimum term, check the exact early termination charge and compare it with the potential saving. Your contract end date usually matters more than waiting for a January promotion.',
      },
      {
        question: 'How do I compare January broadband deals fairly?',
        answer: 'Use offers available at your address and compare the same speed needs over the full minimum term. Add every monthly payment, stated pounds-and-pence price rise, setup and delivery fee, then subtract only guaranteed rewards. Check the post-contract price, estimated speeds and exit terms separately. A low introductory price alone does not establish the best-value deal.',
      },
      {
        question: 'Can I switch broadband if I am still in contract?',
        answer: 'You can, but the current provider may charge an early termination fee. Check your contract end date and ask for the exact leaving cost before ordering. Compare that charge with the saving over the new deal’s term. Do not assume a new provider will reimburse it unless the offer terms explicitly say so and you meet every condition.',
      },
      {
        question: 'Does One Touch Switch apply to January broadband deals?',
        answer: 'Yes. The switching process does not depend on the month or promotion. For a move between fixed broadband providers, you normally contact the new provider and it coordinates the switch. Read both providers’ notices carefully because linked television, mobile or other services may not all be cancelled automatically, and rented equipment may need to be returned.',
      },
    ],
  },
  'no-credit-check-broadband-uk': {
    body: (
      <>
        <p className="text-lg">
          <strong>No credit check broadband is available in the UK, but the safest choice depends
          on the product and your circumstances.</strong> Some fixed-line providers are reported to
          accept broadband orders without a credit search, eligible households can consider social
          tariffs, and prepaid mobile data avoids borrowing altogether. Provider policies can
          change, so confirm the check type and all costs before submitting an application.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Policy check:</strong> provider credit-check rules, prices and eligibility were
            reviewed on 22 August 2026. Current independent sources disagree about some brands,
            including NOW Broadband. Ask the provider whether it will run a hard search, soft
            search, identity check or affordability check before you apply.
          </p>
        </div>

        <h2>What does no credit check broadband mean?</h2>
        <p>
          No credit check broadband means the provider does not search your credit file to decide
          whether to accept the order. It does not mean guaranteed service. A provider can still
          verify your identity and address, check that its network serves the property, require a
          valid payment method or refuse an order for fraud-prevention or previous-account reasons.
        </p>
        <p>
          The phrase also covers different products. A normal fixed broadband contract supplies a
          router and connection to the home. Prepaid mobile broadband uses a data SIM in a phone,
          dongle or 4G/5G router. A social tariff is a lower-cost fixed or mobile package for people
          receiving specified benefits. Compare like with like before choosing.
        </p>

        <h2>Does broadband require a credit check?</h2>
        <p>
          Not every broadband order requires the same check. Providers set their own acceptance
          policies and may change them. Experian distinguishes a soft search, which other companies
          cannot see and which does not affect your credit score, from a hard search, which is
          recorded on your report and may affect later applications. An identity check is not
          automatically a credit search.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">
              Routes to getting online when a credit search or poor credit history is a concern.
            </caption>
            <thead>
              <tr className="bg-slate-50">
                {['Route', 'Credit position', 'Best for', 'Main limitation'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Reported no-check fixed broadband', 'Confirm directly before applying', 'A normal home connection without a credit-file search', 'Policies and address availability can change'],
                ['Social tariff', 'Check the provider policy and benefit eligibility', 'Eligible low-income households seeking predictable costs', 'Only specified benefits qualify and the account holder may need to receive them'],
                ['Provider using a soft search', 'Visible to you, not other companies', 'Someone who wants mainstream fixed-line choice without a hard-search footprint', 'Acceptance is still not guaranteed'],
                ['Prepaid mobile broadband', 'No borrowing where service is paid in advance', 'Immediate or temporary access and a fallback after refusal', 'Coverage, data allowance and indoor speed vary'],
              ].map(([route, position, fit, limit]) => (
                <tr key={route} className="border-b border-slate-100 align-top">
                  <td className="px-4 py-3 font-semibold text-slate-900">{route}</td>
                  <td className="px-4 py-3 text-slate-700">{position}</td>
                  <td className="px-4 py-3 text-slate-700">{fit}</td>
                  <td className="px-4 py-3 text-slate-600">{limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Which fixed broadband providers advertise no credit check?</h2>
        <p>
          Current independent guides identify Plusnet and Direct Save Telecom as fixed-line options
          that do not require customers to pass a credit check. That is useful market evidence, not
          a permanent guarantee from BroadbandPicker. Check the provider&apos;s current order terms or
          ask its sales team to confirm the policy in writing before entering personal details.
        </p>
        <p>
          Treat older provider lists carefully. One current independent source says NOW Broadband
          now checks new contracts because the service is powered by Sky, while another current
          comparison page describes NOW as having no credit-rating check. We do not resolve that
          disagreement by guessing. If NOW interests you, ask it directly which search will be run
          for the exact broadband-only order.
        </p>
        <p>
          Direct Save Telecom illustrates another important point: passing no credit check does not
          remove payment obligations. Choose reports strict charges and escalation after failed
          payments. Read the missed-payment, suspension, equipment, setup and early termination
          terms as carefully as the acceptance policy.
        </p>

        <h2>Check social tariffs before paying more</h2>
        <p>
          A social tariff can be the strongest broadband-for-bad-credit route when you qualify,
          because it is designed for affordability rather than sold as expensive specialist credit.
          Ofcom says these packages are available to people claiming Universal Credit, Pension
          Credit and some other benefits. If anyone in the household receives Universal Credit,
          the household can consider every tariff on Ofcom&apos;s list, although the benefit recipient
          normally needs to be the main account holder.
        </p>
        <p>
          Ofcom&apos;s list checked on 22 August 2026 shows social tariffs from £10 to £24 a month, with
          most offering speeds above 30 Mbit/s. It also says setup costs should be very small or
          zero, the price does not rise mid-contract, and customers can leave without an exit fee.
          Eligibility and credit processes remain provider-specific, so confirm both separately.
        </p>
        <ol>
          <li>Check whether you or someone in the household receives a qualifying benefit.</li>
          <li>Ask the current provider whether it offers a social tariff and what evidence it needs.</li>
          <li>Compare Ofcom&apos;s full tariff list if the current provider has no suitable option.</li>
          <li>Confirm speed and availability at the address, plus any identity or credit checks.</li>
          <li>Keep proof of eligibility and review dates because providers may recheck entitlement.</li>
        </ol>
        <p>
          See our <Link href="/guides/cheapest-broadband-uk">guide to cheap broadband</Link> and
          {' '}<Link href="/guides/how-to-switch-broadband-uk">UK switching checklist</Link> before
          moving service.
        </p>

        <h2>Pay-as-you-go mobile broadband as a fallback</h2>
        <p>
          Pay-as-you-go broadband with no credit check normally means mobile data paid before use,
          not a fixed line to the home. Vodafone states that its Pay as you go Plus plans have no
          contract or credit check and also points declined applicants to pay-as-you-go data-only
          SIMs for mobile broadband devices. Other prepaid networks may offer similar products, but
          verify the current terms rather than assuming every monthly SIM is prepaid.
        </p>
        <p>
          Test network coverage where the router will sit, check whether the allowance is genuinely
          unlimited, and read fair-use or traffic-management terms. Mobile performance changes with
          signal, congestion, building materials and location. It can be an effective immediate or
          short-term fallback, but a stable fixed connection may offer more predictable performance
          for home working, gaming and several simultaneous users.
        </p>
        <p>
          A rolling fixed-line contract is a different product and may still involve a check. Read
          our <Link href="/guides/best-rolling-monthly-broadband-deals">rolling monthly broadband guide</Link>
          {' '}and <Link href="/guides/broadband-speeds-explained">broadband speed guide</Link> to
          compare flexibility and capacity.
        </p>

        <h2>What to do after a broadband application is declined</h2>
        <ol>
          <li><strong>Stop before applying repeatedly.</strong> Ask whether the provider made a hard search and which credit reference agency it used.</li>
          <li><strong>Check your statutory credit reports.</strong> Look for an incorrect address, unrecognised account or outdated financial association and dispute genuine errors.</li>
          <li><strong>Ask about alternatives.</strong> A deposit, broadband-only order, social tariff or different payment arrangement may be available, but the provider decides.</li>
          <li><strong>Compare a verified no-check option.</strong> Confirm the policy, service availability and full contract cost before applying.</li>
          <li><strong>Use prepaid mobile data if necessary.</strong> This can provide access while you resolve an error or arrange a fixed service.</li>
        </ol>
        <p>
          A County Court Judgment, default or thin UK credit history does not prove that every
          broadband provider will refuse you, and a no-check product does not guarantee address
          coverage. Providers use different criteria. Focus on one verified route at a time and do
          not pay an unregulated intermediary for a promise of guaranteed broadband acceptance.
        </p>

        <h2>Costs and contract terms to compare</h2>
        <ul>
          <li><strong>Total minimum-term cost:</strong> add monthly charges, scheduled rises, setup, delivery and equipment costs.</li>
          <li><strong>Payment timing:</strong> establish whether service is prepaid or billed after use and what happens if collection fails.</li>
          <li><strong>Contract length:</strong> no credit check does not necessarily mean no contract or no early termination fee.</li>
          <li><strong>Router ownership:</strong> check whether equipment must be returned and what a missing-device charge would be.</li>
          <li><strong>Speed and coverage:</strong> use the full address for fixed broadband and test the relevant network for mobile data.</li>
          <li><strong>Policy evidence:</strong> save the provider&apos;s written answer about the check type and the dated contract summary.</li>
        </ul>

        <h2>Application checklist</h2>
        <p>
          Before pressing submit, confirm the provider serves the full address, the advertised
          speed is an address-specific estimate, the price covers the full minimum term, and the
          named account holder meets any eligibility rule. Ask exactly which credit or identity
          check will occur. Comparing <Link href="/deals">live broadband deals</Link> can show the
          market at your address, but a deal listing alone does not confirm acceptance policy.
        </p>
        <p>
          Keep the contract summary, order confirmation and written answer about the search type.
          Check the first bill against the agreed setup fee, monthly charge and optional extras.
          If anything differs, contact the provider promptly and keep a record of the date, adviser
          and outcome. This evidence is more useful than relying on an undated comparison-page claim.
        </p>

        <h2>Bottom line</h2>
        <p>
          There is no universal best no credit check broadband provider. Start with an eligible
          social tariff if affordability is the priority, a directly verified no-check fixed-line
          provider if you need normal home broadband, or prepaid mobile data if you need a quick
          fallback without borrowing. Confirm the policy and address availability on the day you
          apply, then choose on total cost, speed and payment terms rather than the no-check label
          alone.
        </p>
      </>
    ),
    faqs: [
      {
        question: 'Can I get broadband with a bad credit score or CCJ?',
        answer: 'Yes, possible routes include a fixed provider that confirms it does not run a credit search, an eligible social tariff, a provider willing to use a deposit or alternative arrangement, or prepaid mobile broadband. Acceptance is never universal. Confirm the check type and address availability before applying, especially if a CCJ, default or limited UK credit history is involved.',
      },
      {
        question: 'Which broadband providers do not require a credit check?',
        answer: 'Current independent UK guides identify Plusnet and Direct Save Telecom as fixed-line options without a credit check, but provider policies can change and sources disagree about some other brands. Ask the provider to confirm whether the exact broadband-only order uses a hard search, soft search, identity check or no credit-file search before submitting your application.',
      },
      {
        question: 'Does a broadband credit check affect my credit score?',
        answer: 'It depends on the search. Experian says a soft search is visible to you but not other companies and does not affect your credit score. A hard search is recorded on your credit report and can be seen by other companies. Ask the broadband provider which type it intends to run before you make a formal application.',
      },
      {
        question: 'Can I get pay-as-you-go broadband with no credit check?',
        answer: 'Yes. Prepaid mobile data can provide internet through a phone, dongle or 4G/5G router without borrowing. Vodafone explicitly says its Pay as you go Plus plans have no contract or credit check and offers prepaid data-only SIMs. Check network coverage, the data allowance, equipment cost and indoor performance because this is mobile rather than fixed-line broadband.',
      },
      {
        question: 'Do social tariffs require a credit check?',
        answer: 'There is no single credit-check rule covering every social tariff, so ask the provider directly. Ofcom says social tariffs are for people receiving qualifying benefits, usually require the benefit recipient to be the main account holder, cost £10 to £24 on its current list, do not rise mid-contract and have no exit fee. Benefit eligibility and credit policy are separate checks.',
      },
      {
        question: 'What should I do if a broadband application is declined?',
        answer: 'Ask whether the provider ran a hard search and which credit reference agency it used, then check your statutory reports for genuine errors. Avoid making several applications in quick succession. Ask about a deposit, social tariff or broadband-only alternative, verify a no-check provider directly, or use prepaid mobile data temporarily while you resolve the problem.',
      },
    ],
  },

  'black-friday-broadband-deals-uk': {
    body: (
      <>
        <p className="text-lg">
          <strong>Our verdict:</strong> the best Black Friday broadband deals are the ones that
          reduce your total contract cost for a suitable speed at your address. Black Friday 2026
          falls on 27 November, with Cyber Monday on 30 November. Confirmed 2026 offers are not yet
          widely available as of 23 August, so compare live prices now and check again from early
          November rather than waiting with an expired contract.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm">
            <strong>Current offer status:</strong> this guide was reviewed on 23 August 2026. EE
            says its full 2026 Black Friday details will appear closer to the event, while BT&apos;s
            indexed campaign page still names 2025. We therefore do not present last year&apos;s prices
            or rewards as current deals. Use our <Link href="/compare">postcode comparison</Link>
            {' '}for offers available at your address today.
          </p>
        </div>

        <h2>Black Friday broadband dates and when to compare</h2>
        <p>
          Black Friday is Friday 27 November 2026 and Cyber Monday is Monday 30 November 2026.
          Broadband campaigns often start before the Friday itself. BT says Black Friday sales can
          extend for up to two weeks, while current comparison pages advise checking from early or
          mid-November. These are useful planning signals, not a promise that every provider will
          use the same dates.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">
              A practical checking schedule for the 2026 sale period.
            </caption>
            <thead>
              <tr className="bg-slate-50">
                {['Period', 'What to do', 'Why'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Now to 31 October', 'Record your contract end date, current price and required speed', 'This gives you a real baseline and exposes any early exit charge'],
                ['Early to mid-November', 'Check your address and save the strongest suitable offer', 'Providers may launch campaigns before Black Friday'],
                ['27 to 30 November', 'Recheck price, reward, setup fee and terms before ordering', 'Some promotions change across Black Friday weekend'],
                ['After Cyber Monday', 'Compare remaining live deals with your saved baseline', 'An ordinary December offer can still cost less overall'],
              ].map(([period, action, reason]) => (
                <tr key={period} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{period}</td>
                  <td className="px-4 py-3 text-slate-700">{action}</td>
                  <td className="px-4 py-3 text-slate-600">{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>What Black Friday broadband offers usually include</h2>
        <p>
          UK broadband promotions commonly use monthly discounts, free months, bill credits,
          reward cards, waived setup fees or extras such as streaming subscriptions. Broadband
          Genie&apos;s current explainer groups offers in much the same way. The format does not tell
          you the value: a £100 voucher can lose to a smaller monthly price cut over a 24-month
          contract, and a bundled extra is worth nothing if you would not otherwise buy it.
        </p>
        <ul>
          <li><strong>Reduced monthly price:</strong> check how long it lasts and the later monthly charge.</li>
          <li><strong>Free months or bill credit:</strong> confirm when the credit is applied and whether you must claim it.</li>
          <li><strong>Reward card or voucher:</strong> read the redemption deadline and eligible retailers.</li>
          <li><strong>No setup fee:</strong> include activation, delivery and installation charges, not just the field called setup.</li>
          <li><strong>Broadband and TV bundle:</strong> price the channels you will use and the separate post-promotion terms.</li>
        </ul>

        <h2>Are Black Friday broadband deals worth it?</h2>
        <p>
          They can be, but the sale label is not evidence of a saving. MoneySavingExpert notes that
          providers run offers throughout the year and assesses Black Friday deals individually.
          Ofcom&apos;s 2026 pricing report provides the broader reason to compare: in September 2025,
          promoted prices were below list prices by an average £6.84 a month for superfast dual-play
          bundles and £7.94 for ultrafast dual-play bundles. Those are market averages from a defined
          dataset, not a forecast of your Black Friday saving.
        </p>

        <h3>Calculate the effective monthly cost</h3>
        <p>
          Add every monthly payment expected during the minimum term, including stated annual
          rises, then add setup costs and subtract guaranteed bill credits or rewards. Divide the
          result by the contract length. Our <Link href="/tools/broadband-cost-calculator">broadband
          cost calculator</Link> can help compare changing monthly prices.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">
              Hypothetical 24-month examples showing why the headline offer can mislead. These are
              calculations, not live packages.
            </caption>
            <thead>
              <tr className="bg-slate-50">
                {['Example', 'Contract calculation', 'Effective monthly cost'].map((heading) => (
                  <th scope="col" key={heading} className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">£28 monthly plus £100 reward</td>
                <td className="px-4 py-3 text-slate-700">(£28 × 24 − £100) ÷ 24</td>
                <td className="px-4 py-3 text-slate-700">£23.83 before any stated rise</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">£24 monthly plus £20 setup</td>
                <td className="px-4 py-3 text-slate-700">(£24 × 24 + £20) ÷ 24</td>
                <td className="px-4 py-3 text-slate-700">£24.83 before any stated rise</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Since 17 January 2025, Ofcom requires specified price rises in new consumer contracts to
          be shown upfront in pounds and pence, with their timing. Put each stated increase into the
          calculation. Also compare the price after the minimum term, although that later amount is
          separate from the minimum-term calculation.
        </p>

        <h2>Which providers should you check?</h2>
        <p>
          Start with every suitable network at your address, not a preset national winner. The
          ranking pages consistently watch major providers such as BT, Sky, Virgin Media and
          Vodafone, while local full-fibre networks may also discount service. Read our
          {' '}<Link href="/providers/bt">BT</Link>, <Link href="/providers/sky">Sky</Link>,
          {' '}<Link href="/providers/virgin-media">Virgin Media</Link> and
          {' '}<Link href="/providers/vodafone">Vodafone</Link> reviews, then verify the exact
          package on the provider&apos;s order page.
        </p>
        <p>
          A provider cannot be the best Black Friday broadband choice if it does not serve your
          property or cannot deliver the speed you need. Use an address-level checker because a
          postcode can contain homes connected to different networks or technologies. Compare the
          guaranteed or estimated speed supplied for your line, not only the national advertised
          average.
        </p>

        <h3>Black Friday broadband and TV deals</h3>
        <p>
          TV bundles can carry larger-looking discounts because the normal package costs more. List
          the channels and services you would pay for separately, then compare that value with the
          bundle&apos;s full contract cost. A broadband-only offer plus separate streaming may be
          cheaper for light viewers, while a genuine bundle can suit homes already paying for live
          sport, cinema or premium channels. See our full{' '}
          <Link href="/guides/best-broadband-and-tv-deals">broadband and TV deals comparison</Link>
          {' '}for a year-round view, or check the{' '}
          <Link href="/guides/cheapest-way-to-watch-sky-sports-uk">cheapest ways to watch Sky Sports and TNT Sports</Link>{' '}
          before committing to a sports bundle.
        </p>

        <h2>What to check before ordering</h2>
        <ol>
          <li><strong>Eligibility:</strong> confirm the offer and network are available at your full address.</li>
          <li><strong>Speed:</strong> choose enough capacity for your household rather than buying the highest tier because it is discounted.</li>
          <li><strong>Minimum term:</strong> make sure 18 or 24 months fits any planned move.</li>
          <li><strong>Total price:</strong> include every stated rise, setup cost and required add-on.</li>
          <li><strong>Reward terms:</strong> check claim dates, delivery method and exclusions.</li>
          <li><strong>Switch date:</strong> avoid overlapping bills while keeping service live until the change completes.</li>
        </ol>
        <p>
          Keep a screenshot or PDF of the order summary and terms. It gives you a record of the
          advertised monthly prices, increase dates, minimum speed, reward and setup charge if a
          later bill or claim does not match what you accepted.
        </p>

        <h2>Black Friday deals for existing broadband customers</h2>
        <p>
          Most prominent sale offers target new customers, but existing customers can still ask for
          a renewal, upgrade or retention price. Check the public new-customer offer and competing
          address-level deals before contacting your provider. Ask for the full minimum-term cost in
          writing, not just a monthly discount, and compare it with the cost and practical effort of
          switching.
        </p>
        <p>
          Do not start a new minimum term solely to obtain a voucher or faster tier you do not need.
          If your current contract has ended, Ofcom advises shopping around because providers often
          increase the main monthly price after the minimum term. If it has not ended, obtain the
          exact early termination charge before deciding. Follow our
          {' '}<Link href="/guides/how-to-switch-broadband-uk">UK broadband switching guide</Link>.
        </p>

        <h2>Should you wait until Black Friday?</h2>
        <p>
          Wait and recheck in November if your contract ends near the sale and your current service
          remains competitively priced. Do not pay an inflated out-of-contract price for several
          months in the hope of an unknown saving. Compare the best suitable deal available now
          with the maximum plausible benefit of waiting, and include the extra bills you would pay
          in the meantime.
        </p>
        <p>
          We would start with total contract cost and address availability, then use Black Friday
          as a final price check. A clearly cheaper ordinary offer that meets your speed and contract
          needs beats a heavily advertised seasonal package with a costly annual rise or unwanted
          bundle. See the broader <Link href="/guides/best-broadband-deals-uk">best broadband deals
          guide</Link> and our guide to <Link href="/guides/broadband-deals-with-no-mid-contract-price-rise">deals
          without a mid-contract price rise</Link> before ordering.
        </p>
      </>
    ),
    faqs: [
      {
        question: 'When do Black Friday broadband deals start in the UK?',
        answer: 'Black Friday is 27 November 2026 and Cyber Monday is 30 November. UK broadband providers often begin campaigns in early or mid-November, with some offers changing through the weekend. Exact launch and end dates vary by provider. Start recording live prices from early November, then recheck the full contract cost immediately before ordering.',
      },
      {
        question: 'Are Black Friday broadband deals actually cheaper?',
        answer: 'Some Black Friday broadband deals are cheaper, but a sale label does not prove value. Compare every monthly payment during the minimum term, stated annual rises, setup fees and required extras, then subtract guaranteed credits or rewards. Divide by the contract months. An ordinary offer can win if its effective monthly cost is lower for the speed available at your address.',
      },
      {
        question: 'Which provider has the best Black Friday broadband deals?',
        answer: 'There is no supported universal winner before address-specific 2026 offers are live. Check major providers including BT, Sky, Virgin Media and Vodafone, plus full-fibre networks serving your property. The best choice is the eligible package with suitable speed and the lowest whole-contract cost after price rises, setup charges and usable rewards are included.',
      },
      {
        question: 'Can existing customers get Black Friday broadband deals?',
        answer: 'Existing customers may be offered renewal, upgrade or retention discounts, although the most visible Black Friday promotions commonly target new customers. Compare public new-customer and rival offers first, then ask your provider for its full renewal cost in writing. Check the new minimum term, annual rises and any lost benefits before accepting.',
      },
      {
        question: 'Should I wait for Black Friday to switch broadband?',
        answer: 'Waiting can make sense if your minimum term ends close to 27 November 2026 and your current monthly price is still reasonable. Switch sooner if you are already paying a costly out-of-contract rate and a suitable live deal saves more than waiting might. If you are in contract, obtain the exact early termination charge before comparing either route.',
      },
      {
        question: 'Are Black Friday broadband and TV deals good value?',
        answer: 'A Black Friday broadband and TV bundle is good value only if you would pay for its channels or services separately. Compare the bundle’s full minimum-term cost, stated rises and setup charges with broadband-only service plus your chosen streaming subscriptions. Large headline discounts can reflect a high normal bundle price rather than a lower cost for your household.',
      },
    ],
  },

  'cheapest-way-to-watch-sky-sports-uk': {
    body: (
      <>
        <p><strong>Start with the sport, not the bundle.</strong> Sky Sports and TNT Sports hold different UK rights, so the cheapest legal option is the smallest commitment that carries the competitions you will actually watch. NOW provides Sky Sports without Sky TV, while TNT Sports moved from discovery+ to HBO Max in 2026. A NOW or HBO Max login still needs a line that can hold the picture at kick-off. Size that separately in our <Link href="/guides/best-broadband-for-streaming">broadband for streaming guide</Link>.</p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-0 text-sm"><strong>Price check, 14 September 2026:</strong> prices were checked on 14 September 2026 and are public UK prices, not address-specific quotes. Promotions, retention offers and pay-TV bundles change. Confirm the checkout total, minimum term, picture quality, device limit and any scheduled rise before paying.</p>
        </div>

        <h2>Cheapest Sky Sports and TNT Sports options at a glance</h2>
        <div className="overflow-x-auto" role="region" aria-label="Sky Sports and TNT Sports price comparison" tabIndex={0}>
          <table className="w-full min-w-[46rem] text-sm border-collapse">
            <caption className="pb-3 text-left text-sm text-slate-600">Public prices checked on 14 September 2026. A Saver price is a commitment, even when billed monthly.</caption>
            <thead><tr className="bg-slate-50">{['Route', 'Price', 'Commitment', 'What it covers', 'Best use'].map((heading) => <th scope="col" key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">NOW Sports Day</td><td className="border border-slate-200 px-4 py-3">£14.99 once</td><td className="border border-slate-200 px-4 py-3">24 hours</td><td className="border border-slate-200 px-4 py-3">All 12 Sky Sports channels and Sky Sports+ streams</td><td className="border border-slate-200 px-4 py-3">One match, race or tournament day</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">NOW Sports Saver</td><td className="border border-slate-200 px-4 py-3">£27.99 a month</td><td className="border border-slate-200 px-4 py-3">Check the displayed Saver term</td><td className="border border-slate-200 px-4 py-3">Sky Sports without Sky TV</td><td className="border border-slate-200 px-4 py-3">Regular Sky Sports viewing</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">NOW Sports Flexible</td><td className="border border-slate-200 px-4 py-3">£34.99 a month</td><td className="border border-slate-200 px-4 py-3">Rolling 30 days</td><td className="border border-slate-200 px-4 py-3">Sky Sports without a long minimum term</td><td className="border border-slate-200 px-4 py-3">A month or two of sport</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">HBO Max TNT Sports Saver</td><td className="border border-slate-200 px-4 py-3">£25.99 a month</td><td className="border border-slate-200 px-4 py-3">12 monthly payments</td><td className="border border-slate-200 px-4 py-3">TNT Sports 1, 2, 3 and 4 in Full HD</td><td className="border border-slate-200 px-4 py-3">A full season of TNT Sports</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">HBO Max TNT Sports monthly</td><td className="border border-slate-200 px-4 py-3">£30.99 a month</td><td className="border border-slate-200 px-4 py-3">Monthly</td><td className="border border-slate-200 px-4 py-3">TNT Sports without an entertainment plan</td><td className="border border-slate-200 px-4 py-3">Short seasonal runs</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Cheapest way to watch Sky Sports for your viewing pattern</h2>
        <p>The cheapest way to watch Sky Sports for one event is the <a href="https://www.nowtv.com/membership/watch-sky-sports" target="_blank" rel="noopener noreferrer">official £14.99 NOW Sports Day Membership</a>. It starts immediately, lasts 24 hours and does not renew. Schedule the start carefully if an event spans midnight or two days because the clock cannot be paused.</p>
        <p>For regular viewing, MoneySavingExpert listed the NOW Sports Saver Membership at £27.99 a month when checked for this guide. That costs £335.88 across 12 payments. The flexible £34.99 membership costs £419.88 if left running for a year, but costs less when used for nine months or fewer. This break-even check is more useful than comparing monthly labels alone.</p>
        <p>NOW Sports is Sky Sports without Sky TV: you do not need a satellite dish, Sky broadband or a base entertainment package. It includes all 12 live channels and Sky Sports+ streams. The standard picture is not the whole quality story, however. NOW says Boost adds Full HD and two simultaneous streams, while Ultra Boost adds selected 4K content and three streams. Include that add-on only if your screen, connection and chosen event support it.</p>

        <h2>NOW Sports day pass or month pass?</h2>
        <p>A day pass works for one event in a month. Two £14.99 passes cost £29.98, already more than a £27.99 Saver month, while three cost £44.97 and exceed the £34.99 flexible month. Choose the month option if you expect two or more separate viewing days and the current monthly offer covers them.</p>
        <ul>
          <li><strong>One viewing day:</strong> buy the £14.99 Day Membership.</li>
          <li><strong>Two or more days in 30 days:</strong> compare the live Saver and flexible month prices.</li>
          <li><strong>A full season:</strong> multiply every Saver payment and check when it changes to the standard rolling price.</li>
          <li><strong>4K or household sharing:</strong> add the relevant Boost cost before calling either route cheaper.</li>
        </ul>

        <h2>Cheapest way to watch TNT Sports</h2>
        <p>TNT Sports now streams through HBO Max in the UK. <a href="https://help.hbomax.com/gb/Answer/Detail/000002547" target="_blank" rel="noopener noreferrer">HBO Max lists standalone TNT Sports at £30.99 monthly or £25.99 a month for 12 months</a>. The Saver total is £311.88. It saves £60 over 12 rolling monthly payments, but the remaining instalments stay payable if you stop watching early.</p>
        <p>The standalone plan carries TNT Sports 1, 2, 3 and 4, allows two sports streams at once and provides Full HD. You do not have to buy an HBO entertainment tier. If you want both, HBO Max also sells combined plans, but separating the sport price prevents an entertainment bundle from looking cheaper than it is.</p>
        <p>Existing BT, EE, Sky or Virgin Media customers may have TNT Sports inside an eligible package or as an add-on. Compare only the incremental sports price if you would keep that base service anyway. If a bundle requires broadband or TV you do not otherwise want, compare its whole monthly bill and contract term against direct HBO Max.</p>

        <h2>Sky Sports vs NOW Sports: which costs less?</h2>
        <p>NOW is usually the clearer low-cost choice for Sky Sports alone because it removes the base Sky TV charge. Sky’s published offer checked for this guide charged £22 extra a month for Sky Sports on a new 24-month Sky TV term, with base Sky Stream or Glass TV from £18 a month. That makes the starting combined bill at least £40 a month before optional extras, although it also buys a broader TV service.</p>
        <p>Sky can still be better value for a household already paying for its entertainment channels, recording features or Stream equipment. Compare the full 24-month schedule because the official offer says standard pricing applies later and prices may change. <a href="https://www.ofcom.org.uk/phones-and-broadband/saving-money/telecoms-price-rises-what-are-your-rights" target="_blank" rel="noopener noreferrer">Ofcom requires specified pay-TV contract rises to be shown upfront in pounds and pence</a>.</p>

        <h2>How to watch Premier League football cheaply in the UK</h2>
        <p>Premier League rights are split between Sky Sports and TNT Sports, so first check which broadcaster shows your club’s confirmed fixtures. A NOW day pass is sensible for one Sky match; a NOW month suits a run of Sky fixtures; TNT Sports requires its monthly or Saver plan. Paying for both all year is only justified if your must-watch list genuinely crosses both services.</p>
        <p>Use free-to-air coverage where available for other competitions and highlights, but do not assume a single paid subscription includes every match. NOW explicitly says its Sports Membership does not include TNT Sports, and Box Office events are separate. Our <Link href="/guides/best-broadband-and-tv-deals">broadband and TV deals comparison</Link> is the next step if you want sport, entertainment and broadband on one bill.</p>

        <h2>A four-step sports rights check before subscribing</h2>
        <ol>
          <li><strong>List the competitions:</strong> write down only the leagues, races or tournaments you expect to watch during the next three months.</li>
          <li><strong>Match each rightsholder:</strong> check the official competition and broadcaster schedules because rights and selected fixtures can change.</li>
          <li><strong>Count viewing months:</strong> compare day passes, flexible months and the full unpaid balance of any Saver commitment.</li>
          <li><strong>Add viewing extras:</strong> include Full HD or 4K upgrades, a base TV package and any stated in-contract rise.</li>
        </ol>

        <h2>Our verdict</h2>
        <p>We would buy a NOW day pass for one Sky Sports event, NOW Saver for sustained Sky viewing when the commitment matches the season, and standalone TNT Sports through HBO Max for Champions League or other TNT-led viewing. We would not take a combined pay-TV contract solely for sport unless its full bill beats those direct routes and its extra channels are genuinely useful.</p>
      </>
    ),
    faqs: [
      { question: 'What is the cheapest way to watch Sky Sports without Sky?', answer: 'A £14.99 NOW Sports Day Membership is the cheapest public option for one event. For regular viewing, the NOW Sports Saver price observed on 14 September 2026 was £27.99 a month, while the fully flexible month was £34.99. NOW includes all 12 Sky Sports channels without Sky TV, Sky broadband or a satellite dish, but higher picture quality can cost extra.' },
      { question: 'Is a NOW Sports day pass cheaper than a month pass?', answer: 'A NOW Sports Day Membership is cheaper only for one viewing day in a month. Two £14.99 passes cost £29.98, more than the £27.99 Saver monthly price observed for this guide. Three day passes cost £44.97, more than the £34.99 flexible month. Check the live monthly offer and commitment before buying because promotional prices can change.' },
      { question: 'Can I watch TNT Sports with NOW Sports?', answer: 'No. NOW states that a Sports Membership does not include TNT Sports. NOW carries Sky Sports, while TNT Sports moved to HBO Max in the UK in 2026. HBO Max listed standalone TNT Sports at £30.99 monthly or £25.99 a month for 12 months on 14 September 2026, so watching competitions split across both broadcasters requires two subscriptions or an eligible pay-TV bundle.' },
      { question: 'What is the cheapest way to watch TNT Sports?', answer: 'For a full year, HBO Max’s standalone TNT Sports Saver plan is cheaper at £25.99 a month for 12 months, totalling £311.88. For a shorter spell, the £30.99 rolling monthly plan can cost less overall because there is no remaining annual balance. Both prices were verified from HBO Max on 14 September 2026 and include TNT Sports without an entertainment plan.' },
      { question: 'What is the cheapest way to watch Premier League football in the UK?', answer: 'For one Sky-selected Premier League match, use a £14.99 NOW Sports Day Membership. For several Sky fixtures in a month, compare NOW’s Saver and flexible monthly plans. TNT Sports shows a separate selection and has no day pass, so use its HBO Max monthly plan only for months containing fixtures you want, unless a 12-month Saver commitment costs less for your season.' },
      { question: 'Do I need a TV Licence to watch Sky Sports or TNT Sports?', answer: 'Yes, UK viewers need a TV Licence to watch or record live television on any channel or streaming service, including live sport on NOW, Sky or HBO Max. The subscription fee does not include the licence. The rule also applies when watching live on a phone, laptop or tablet, so include that separate household cost where you do not already hold a licence.' },
    ],
  },

  'esim-explained-uk': {
    body: (
      <>
        <p><strong>An eSIM is a rewritable SIM built into a compatible phone and is the digital replacement for the removable plastic SIM card, not a different type of mobile service.</strong> Your network downloads a secure profile that identifies your account. Once activated, the line can make calls, receive texts and use mobile data in the same way as a physical SIM on the same plan and network.</p>
        <p>The practical gain is that you can activate or move a supported line without waiting for a card in the post. Many compatible phones can also store several profiles and run two lines at once. That can keep work and personal numbers on one phone, or keep a UK number available for calls and security codes while a separate travel eSIM handles data abroad. The exact number of stored and active profiles depends on the handset.</p>

        <h2>How an eSIM works</h2>
        <p>SIM stands for Subscriber Identity Module. A SIM holds the credentials used to authenticate a subscription with a mobile network. With a physical SIM, those credentials are stored on a removable chip. With an eSIM, the embedded chip remains in the device and an operator profile is installed remotely under the GSMA&apos;s consumer eSIM specification.</p>
        <ol>
          <li><strong>You choose an eligible plan.</strong> The mobile provider links an eSIM profile to your order or existing account.</li>
          <li><strong>The profile reaches the phone securely.</strong> This may happen through the provider&apos;s app, a one-use QR code, an activation link or a supported phone-to-phone transfer.</li>
          <li><strong>The phone downloads it over Wi-Fi or mobile data.</strong> The profile is stored on the embedded SIM hardware.</li>
          <li><strong>You label and activate the line.</strong> On a dual-SIM phone, you also choose which line handles calls, messages and mobile data.</li>
          <li><strong>The network authenticates the subscription.</strong> From then on, the eSIM line behaves like the equivalent physical SIM plan.</li>
        </ol>
        <p>An eSIM does not inherently improve signal, speed or coverage. Those still depend on the mobile network, local mast capacity, radio bands, handset and plan. Changing the SIM format while staying on the same network and tariff should not create a stronger signal.</p>

        <h2>Does my phone support eSIM?</h2>
        <p>Check the phone itself before relying on a model-family list, because regional variants and network software can differ. On an iPhone, open <strong>Settings, Mobile Service</strong> and look for <strong>Add eSIM</strong>. On a Pixel, open <strong>Settings, Network and Internet, SIMs</strong> and look for <strong>Add SIM</strong>. Samsung normally places the option under <strong>Settings, Connections, SIM manager</strong>.</p>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
          <h3 className="font-bold text-slate-900">Three checks before you buy</h3>
          <ul>
            <li><strong>Handset check:</strong> dial <strong>*#06#</strong> and look for an EID, or find an Add eSIM option in settings. An EID is the identifier for the embedded SIM hardware.</li>
            <li><strong>Network check:</strong> confirm that the provider supports your exact device and plan type. Phone, tablet and smartwatch eligibility may be different.</li>
            <li><strong>Lock check:</strong> if the eSIM is from another network, confirm that the handset is unlocked. A compatible but network-locked phone can still reject it.</li>
          </ul>
        </div>
        <p>Apple&apos;s UK support and Google&apos;s Pixel help pages maintain model and setup guidance. Older devices, imported variants and some network-supplied models can be exceptions, so use the manufacturer&apos;s page and the chosen network&apos;s compatibility checker together.</p>

        <h2>eSIM versus physical SIM</h2>
        <div className="overflow-x-auto" role="region" aria-label="eSIM and physical SIM comparison" tabIndex={0}>
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <caption className="pb-3 text-left text-sm text-slate-600">The better format depends on your phone, transfer needs and preferred recovery route.</caption>
            <thead><tr className="bg-slate-50"><th className="border border-slate-200 px-4 py-3 text-left">Decision point</th><th className="border border-slate-200 px-4 py-3 text-left">eSIM</th><th className="border border-slate-200 px-4 py-3 text-left">Physical SIM</th></tr></thead>
            <tbody>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Activation</td><td className="border border-slate-200 px-4 py-3">Downloaded by app, QR code, link or supported transfer, usually with an internet connection</td><td className="border border-slate-200 px-4 py-3">Insert the correct card size into the tray</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Changing phone</td><td className="border border-slate-200 px-4 py-3">Transfer digitally where supported, otherwise request a fresh profile or QR code</td><td className="border border-slate-200 px-4 py-3">Move the card if both phones accept the same size</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Two lines</td><td className="border border-slate-200 px-4 py-3">Can add a second profile without a second tray on a compatible dual-SIM phone</td><td className="border border-slate-200 px-4 py-3">Needs a second tray or combination with an eSIM</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Loss or theft</td><td className="border border-slate-200 px-4 py-3">Cannot be pulled out of the phone, but the account and device still need securing</td><td className="border border-slate-200 px-4 py-3">Can be removed and placed in another phone unless account protections stop it</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Recovery</td><td className="border border-slate-200 px-4 py-3">May require provider access, identity checks and Wi-Fi if the phone fails</td><td className="border border-slate-200 px-4 py-3">Often works immediately in a spare compatible unlocked phone</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Best fit</td><td className="border border-slate-200 px-4 py-3">Fast remote setup, dual lines and travel data</td><td className="border border-slate-200 px-4 py-3">Older phones, frequent swaps and simple offline recovery</td></tr>
            </tbody>
          </table>
        </div>
        <p>We would choose eSIM for a compatible everyday phone if the network offers a clear self-service replacement route. We would keep a physical SIM where the line must move quickly between several devices, or where access to the provider account and reliable Wi-Fi during recovery cannot be assumed.</p>

        <h2>Which UK providers support eSIM?</h2>
        <p>All four UK mobile network operators, <strong>EE, O2, Three and Vodafone</strong>, publish consumer eSIM support. Several virtual networks also offer it, but availability is not a permanent yes-or-no fact across every product. A provider may support phones but not watches, new customers but not every existing tariff, or pay monthly but only selected pay-as-you-go routes.</p>
        <p>As checked on 15 September 2026, EE offers eSIM with eligible pay-monthly devices and SIM-only orders; O2 states support for eligible Pay Monthly, SIM Only and Pay As You Go customers; Three offers eSIM with Three Your Way plans and replacement routes in My3 or its app; and Vodafone offers all SIM-only plans as eSIM plus Pay as you go Plus. Recheck the provider&apos;s official eligibility page at checkout because these product rules can change.</p>
        <p>If an eSIM is part of a combined home and mobile offer, compare the two contracts separately before linking them. Our <Link href="/guides/broadband-and-mobile-bundle-discounts-uk">UK broadband and mobile bundle guide</Link> explains how EE One, Vodafone Together and Virgin Media O2 Volt eligibility can affect the overall saving.</p>

        <h2>How to set up an eSIM safely</h2>
        <ol>
          <li><strong>Check compatibility and unlock status.</strong> Confirm the exact handset, software version, network and plan before paying.</li>
          <li><strong>Keep the current line active.</strong> You may need it to receive an account security code. Do not delete its profile at the start.</li>
          <li><strong>Connect to trusted Wi-Fi.</strong> Charge the phone, install current software and display a QR code on a second screen if that is the provider&apos;s method.</li>
          <li><strong>Add the mobile plan.</strong> On iPhone use Settings, Mobile Service, Add eSIM. On Pixel use Settings, Network and Internet, SIMs, Add SIM, Set up an eSIM. Samsung wording varies by model.</li>
          <li><strong>Name each line.</strong> Labels such as Personal, Work or Travel reduce the chance of choosing the wrong data connection.</li>
          <li><strong>Set the defaults deliberately.</strong> Choose the line for calls, texts and mobile data. Turn off data switching if you do not want the phone to use the other line automatically.</li>
          <li><strong>Test before deleting anything.</strong> Make a call, send a text, receive a security code and use mobile data with Wi-Fi switched off.</li>
        </ol>
        <p>A provider QR code may be single-use. Do not post it, forward it casually or throw away the old activation information until setup succeeds. If activation fails, stop repeated scans and follow the provider&apos;s replacement process. Deleting a profile does not necessarily cancel the contract, and cancelling a contract is not the same action as removing an eSIM from a phone.</p>

        <h2>How to switch your number to an eSIM</h2>
        <p>Changing from a physical SIM to an eSIM on the same network is normally a SIM replacement, not a mobile-provider switch. Use the provider&apos;s app, online account, device conversion option or support route. Your existing number and tariff should move to the new profile once the replacement activates, but confirm this in the order summary.</p>
        <p>When moving to a different UK network, first order an eligible eSIM plan. Use a PAC if you want to keep the number or a STAC if you want the old number closed without porting it. The new provider handles the number transfer after receiving the code. Keep the old line and eSIM profile until the transfer completes, then test incoming calls and texts because number ports can finish at a different time from initial eSIM activation.</p>
        <p>Mobile number porting is separate from changing a fixed connection. If you are also moving your home service, our <Link href="/guides/how-to-switch-broadband-uk">UK broadband switching guide</Link> explains One Touch Switch, exit charges and how to avoid cancelling the old broadband too early.</p>
        <p>Moving the same eSIM to a new phone depends on both devices and the network. Apple Quick Transfer and supported Android transfers can move a line during device setup, while other cases require a replacement profile. Backing up the phone does not guarantee that the mobile plan itself will restore, so check the network&apos;s transfer instructions before wiping or trading in the old handset.</p>

        <h2>Using an eSIM for travel</h2>
        <p>A travel eSIM is usually a separate short-term plan downloaded before or during a trip. Many are data-only, so they do not replace the UK phone number for ordinary calls and SMS. A dual-SIM handset can keep the UK line on for incoming calls or security texts while directing mobile data through the travel plan.</p>
        <p>Check the destination network, data allowance, validity start, tethering rules, local phone-number inclusion and support route before buying. Some plans begin when installed; others begin only when they first connect abroad. To avoid an unexpected UK-network roaming bill, select the travel eSIM for mobile data, disable data roaming on the UK line and check whether receiving calls or texts abroad carries a charge. The independent MoneySavingExpert guide also warns that activation policies and roaming settings differ between travel eSIM providers.</p>

        <h2>Common eSIM problems and recovery steps</h2>
        <ul>
          <li><strong>No Add eSIM option:</strong> update the phone, confirm the regional model and check that the network has not restricted the device.</li>
          <li><strong>QR code will not scan:</strong> increase the brightness on the second screen, try manual activation details if supplied, or request a replacement rather than sharing the code.</li>
          <li><strong>Profile installed but no service:</strong> restart the phone, confirm the line is switched on, choose it for mobile data and check the provider&apos;s activation status.</li>
          <li><strong>Calls work but data does not:</strong> verify the selected data line, roaming setting where required and any provider APN instructions.</li>
          <li><strong>Old phone unavailable:</strong> secure the lost device and account, then ask the network for a replacement eSIM. Do not assume a cloud backup contains an active network profile.</li>
        </ul>
        <p>Use the mobile provider&apos;s official support route for activation and account recovery. Apple, Google and Samsung can explain handset settings, but only the network can issue or replace the subscriber profile.</p>
      </>
    ),
    faqs: [
      { question: 'What is an eSIM?', answer: 'An eSIM is a rewritable SIM built into a compatible phone, tablet or watch. Instead of inserting a plastic card, you download a secure mobile-network profile through an app, QR code, activation link or supported device transfer. It performs the same authentication job as a physical SIM and can provide calls, texts and data on an eligible plan.' },
      { question: 'Does an eSIM give better signal than a physical SIM?', answer: 'No. On the same phone, network and tariff, an eSIM does not inherently improve mobile signal, speed or coverage. It changes how the network profile is installed, not the radio connection. Coverage still depends on the operator, local masts, congestion, radio bands, building materials and handset. Compare networks for your location rather than choosing a SIM format for stronger reception.' },
      { question: 'How do I know whether my phone supports eSIM?', answer: 'Look in the phone settings for Add eSIM or Add SIM, or dial *#06# and check whether an EID appears. Then confirm the exact regional handset model and plan on the chosen network\'s compatibility page. An eSIM-capable phone can still be unsuitable if it is locked to another network or the provider does not support that device or tariff.' },
      { question: 'Can I keep my number when I change to eSIM?', answer: 'Yes, in normal cases. Converting a physical SIM to an eSIM with the same provider should move the existing number to the replacement profile. If you change UK network, give the new provider a PAC to port the number. Keep the old line active until the transfer completes, then test incoming calls, outgoing calls, texts and mobile data before deleting the old profile.' },
      { question: 'Which UK mobile networks offer eSIM?', answer: 'EE, O2, Three and Vodafone all publish eSIM support, and several virtual networks offer it too. Eligibility still varies by device, plan, customer type and product: phone, smartwatch, pay monthly and pay-as-you-go support may not match. Check the provider\'s official eSIM page and your exact handset at checkout rather than relying on a permanent network list.' },
      { question: 'Can I use an eSIM and a physical SIM at the same time?', answer: 'Many dual-SIM phones can run an eSIM and a physical SIM together, but the number of profiles stored and lines active depends on the model. You can usually label the lines and choose separate defaults for calls, texts and mobile data. This is useful for work and personal numbers or for retaining a UK number while a travel eSIM supplies data.' },
      { question: 'What happens if I delete my eSIM?', answer: 'Deleting an eSIM removes its network profile from that device but does not necessarily cancel the mobile contract. You may need the provider to issue a replacement profile or QR code before the line works again. Contact the network through its official account or support route, complete its identity checks, and do not assume the original QR code can be reused.' },
    ],
  },

  'broadband-and-mobile-bundle-discounts-uk': {
    body: (
      <>
        <p><strong>Broadband and mobile deals can cut the combined bill, but start by pricing both services separately.</strong> A linked deal is a saving only when the combined minimum-term cost is lower for services you would have chosen anyway. The three main UK schemes work differently: EE One discounts or boosts eligible mobile plans, Vodafone Together applies plan-specific savings, and Virgin Media O2 Volt adds speed, data and roaming benefits rather than one universal cash reduction. Compare the full cost with separate deals before joining.</p>
        <p>Offers and eligibility were checked on 14 September 2026. Prices can vary by address, plan and customer status, so use the figures below as a current explanation of each scheme rather than a quote for your household.</p>

        <h2>UK broadband and mobile discounts at a glance</h2>
        <div className="overflow-x-auto" role="region" aria-label="Broadband and mobile bundle scheme comparison" tabIndex={0}>
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <caption className="pb-3 text-left text-sm text-slate-600">Major linked broadband and mobile schemes checked on 14 September 2026.</caption>
            <thead><tr className="bg-slate-50">{['Scheme', 'Who provides it', 'Main benefit', 'Eligibility check', 'What happens if you leave'].map((heading) => <th scope="col" key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">EE One</td><td className="border border-slate-200 px-4 py-3">EE broadband and EE mobile</td><td className="border border-slate-200 px-4 py-3">Up to £20 a month off eligible new or upgraded mobile plans, plus unlimited-data boosts on eligible existing plans</td><td className="border border-slate-200 px-4 py-3">Services must be eligible and linked to the same EE account</td><td className="border border-slate-200 px-4 py-3">Mobile savings and data boosts are removed if eligibility ends</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Vodafone Together</td><td className="border border-slate-200 px-4 py-3">Vodafone broadband and Vodafone mobile</td><td className="border border-slate-200 px-4 py-3">Plan-specific monthly discounts when two or more eligible services are held</td><td className="border border-slate-200 px-4 py-3">Qualifying UK plans bought through Vodafone; exact saving depends on the combination</td><td className="border border-slate-200 px-4 py-3">The linked discount can stop when a qualifying plan ends</td></tr>
              <tr><td className="border border-slate-200 px-4 py-3 font-semibold">Virgin Media O2 Volt</td><td className="border border-slate-200 px-4 py-3">Virgin Media broadband and O2 Pay Monthly mobile</td><td className="border border-slate-200 px-4 py-3">Broadband speed and mobile-data boosts, plus eligible WiFi and roaming benefits</td><td className="border border-slate-200 px-4 py-3">Eligible services registered at the same household address</td><td className="border border-slate-200 px-4 py-3">Volt benefits depend on retaining eligible services</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Is a broadband and mobile bundle worth it?</h2>
        <p>A broadband and mobile bundle is worth it when both networks suit your address, the included mobile data fits your usage and the full combined cost beats the best separate options. Ofcom says buying services together is often cheaper, but also warns that bundles can be less flexible. Convenience and one account are useful, but they do not turn an expensive plan into good value. Some bundles add a streaming perk on top, such as limited-time Disney+ access on eligible mobile plans; check our <Link href="/guides/best-streaming-services-uk">best streaming services in the UK comparison</Link> before assuming a bundled app replaces a subscription you would otherwise pay for.</p>
        <p>We would start with Vodafone Together for a household that already wants Vodafone broadband and several mobile plans, EE One where EE mobile coverage and unlimited data matter, and Volt where a Virgin Media speed boost or extra O2 data replaces something the household would otherwise buy. We would choose separate providers if a cheaper broadband network and a low-cost SIM save more after every scheduled rise.</p>

        <h2>EE Together discount: what replaced it?</h2>
        <p>The current scheme is <a href="https://ee.co.uk/ee-one" target="_blank" rel="noopener noreferrer">EE One</a>, not EE Together. EE says customers with eligible EE Broadband and EE Pay Monthly mobile on the same account can receive an unlimited-data boost on qualifying existing mobile plans and up to £20 a month off eligible new or upgraded mobile plans. Plans below the stated eligibility threshold and services such as Pay As You Go are excluded.</p>
        <p>The relationship matters because the benefit is conditional. EE says cancelling broadband or mobile removes EE One eligibility, mobile savings and unlimited-data boosts. Its current short terms also state that some EE One mobile prices increase when broadband is cancelled. Read the individual contract summary for the actual replacement price before treating the discount as a permanent saving.</p>

        <h2>Vodafone broadband and mobile discount explained</h2>
        <p><a href="https://www.vodafone.co.uk/broadband-sim-only-deals" target="_blank" rel="noopener noreferrer">Vodafone Together</a> gives eligible customers discounts for holding two or more qualifying Pay Monthly mobile or home broadband plans. The live table checked for this guide showed savings up to £4 a month when broadband was added to an eligible mobile plan, with larger plan-specific savings on some added mobile services. Those figures are not one flat discount for every customer.</p>
        <p>Vodafone&apos;s displayed examples use 24-month plans and show pounds-and-pence increases on future dates. Compare every scheduled monthly payment, not only the starting figure. Confirm that each chosen plan qualifies, whether another promotion can be combined with Together and what price applies when one linked service is cancelled or reaches its minimum-term end first.</p>

        <h2>Virgin Media O2 Volt benefits explained</h2>
        <p><a href="https://www.virginmedia.com/virgin-media-o2" target="_blank" rel="noopener noreferrer">Virgin Media O2 Volt</a> links eligible Virgin Media broadband with O2 Pay Monthly mobile at the same address. Virgin Media says benefits are normally added automatically within 14 days once account addresses match. Eligible customers can receive an upgrade to the next available broadband speed tier and extra O2 mobile data, subject to the scheme&apos;s limits and available tiers.</p>
        <p>Volt is not best described as a universal bill discount. Its value comes from benefits you would otherwise pay for, such as a faster broadband tier or more mobile data. If your current speed and allowance already cover normal use, count those upgrades as £0 in your comparison. The household may have separate Virgin Media and O2 contracts, bills and end dates even though the benefits are linked.</p>

        <h2>What about a BT broadband and mobile bundle?</h2>
        <p>BT Group now presents its main consumer broadband-and-mobile combination through EE One. A search for a BT broadband and mobile bundle can still surface older BT Mobile material, but current buyers should compare EE Broadband and EE Mobile terms rather than assume a historic BT discount still applies. BT and EE belong to the same group, yet the brand, account eligibility and contract named at checkout determine the benefit.</p>
        <p>If you already have BT Broadband, ask for a written quote and check whether it requires moving broadband to EE or starting a separate EE mobile agreement. Compare that route against renewing BT broadband alone and buying a SIM separately. Do not rely on group ownership as proof that two independently held services will qualify for EE One.</p>

        <h2>Broadband and mobile bundle cost worksheet</h2>
        <p>The useful comparison is the first-year and whole-contract cost after benefits, not the biggest percentage shown in an advert. This two-horizon check is common on strong international comparison pages but was uncommon across the UK bundle guides reviewed for this page.</p>
        <div className="overflow-x-auto" role="region" aria-label="Broadband and mobile bundle cost worksheet" tabIndex={0}>
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <caption className="pb-3 text-left text-sm text-slate-600">Fill in the bundle and separate-deal columns using written checkout prices for the same service period.</caption>
            <thead><tr className="bg-slate-50">{['Cost or value', 'Linked bundle', 'Separate providers'].map((heading) => <th scope="col" key={heading} className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>)}</tr></thead>
            <tbody>
              {[
                ['Broadband payments in months 1 to 12', '£___', '£___'],
                ['Mobile airtime payments in months 1 to 12', '£___', '£___'],
                ['Setup, delivery and activation', '£___', '£___'],
                ['Guaranteed credits or cash discounts', 'minus £___', 'minus £___'],
                ['Value of speed or data you would otherwise buy', 'minus £___', 'minus £___'],
                ['First-year total', '£___', '£___'],
                ['Full minimum-term total after scheduled rises', '£___', '£___'],
              ].map(([item, bundle, separate]) => <tr key={item}><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{item}</th><td className="border border-slate-200 px-4 py-3">{bundle}</td><td className="border border-slate-200 px-4 py-3">{separate}</td></tr>)}
            </tbody>
          </table>
        </div>
        <p>For example, do not subtract £10 for extra data if you normally use 8GB and both plans already include 20GB. Do subtract a £4 monthly cash discount that applies for all 24 months, but check whether scheduled price rises affect the underlying plan. Keep benefits and money separate so an unused perk cannot hide a higher bill.</p>

        <h2>Five checks before combining your contracts</h2>
        <ol>
          <li><strong>Check both networks:</strong> verify fixed broadband at the exact address and mobile coverage where each person uses the phone, including indoors.</li>
          <li><strong>Align the dates:</strong> record the minimum-term end date for broadband, mobile airtime and any handset finance. They may not end together.</li>
          <li><strong>Read the exit result:</strong> write down the price and benefit changes if either linked service is cancelled.</li>
          <li><strong>Compare the same usage:</strong> use the broadband speed and mobile allowance you need, not a larger bundled tier simply because it is discounted.</li>
          <li><strong>Keep the contract summaries:</strong> Ofcom says bundled services should receive a written contract summary of up to three pages showing charges, term and cancellation process.</li>
        </ol>

        <h2>Switching broadband and mobile without losing value</h2>
        <p>Broadband and mobile normally switch through separate regulated processes. For fixed broadband, order from the provider you are joining and it should coordinate One Touch Switch where applicable. To keep one mobile number, <a href="https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-mobile" target="_blank" rel="noopener noreferrer">Ofcom says to text PAC to 65075</a> and give the code to the new network. A PAC is valid for 30 days.</p>
        <p>Before starting either switch, ask what happens to the linked discount. Moving one service may remove benefits immediately while the other contract continues at a higher price. Our <Link href="/guides/how-to-switch-broadband-uk">UK broadband switching guide</Link> explains One Touch Switch and exit charges, while the <Link href="/guides/broadband-contract-end-rights">contract end rights guide</Link> covers end-of-contract notices and linked services. If the mobile line is digital, use our <Link href="/guides/esim-explained-uk">eSIM setup and number-transfer guide</Link> before deleting its existing profile.</p>

        <h2>Our verdict on broadband and mobile deals</h2>
        <p>There is no universal cheapest bundle. EE One is the strongest starting point for eligible households that value EE coverage and unlimited data, Vodafone Together deserves the first calculation for multiple Vodafone plans, and Volt can be valuable when its speed or data boost replaces a paid upgrade. In every case, choose the linked scheme only after its full minimum-term cost beats suitable separate deals.</p>
      </>
    ),
    faqs: [
      { question: 'Can I get a discount for having broadband and mobile together?', answer: 'Yes. EE One, Vodafone Together and Virgin Media O2 Volt link eligible UK broadband and mobile services, but the reward differs. EE and Vodafone advertise plan-specific savings, while Volt mainly adds broadband speed and mobile-data benefits. Check the exact account, plan and address rules, then compare the full minimum-term cost with broadband and mobile bought separately.' },
      { question: 'What happened to the EE Together discount?', answer: 'EE now calls its linked household scheme EE One. Eligible EE Broadband and Pay Monthly mobile services on the same account can receive unlimited-data boosts and savings of up to £20 a month on qualifying new or upgraded mobile plans. Eligibility exclusions apply, and EE says the benefits are removed if the qualifying broadband or mobile service ends.' },
      { question: 'How much is the Vodafone broadband and mobile discount?', answer: 'Vodafone Together does not give every household one identical discount. Its public table checked on 14 September 2026 showed up to £4 a month off when eligible broadband was added to a qualifying mobile plan, with different savings for added mobile plans. Confirm the checkout combination, scheduled price rises and whether another promotion can be used at the same time.' },
      { question: 'What do Virgin Media O2 Volt customers get?', answer: 'Eligible Virgin Media broadband and O2 Pay Monthly customers at the same address can receive Volt benefits such as a boost to the next available broadband speed tier, extra O2 mobile data and qualifying WiFi or roaming benefits. Benefits are normally applied after address matching. They are not a universal cash discount, so count only upgrades your household would otherwise buy.' },
      { question: 'Is there a BT broadband and mobile bundle?', answer: 'BT Group currently directs its main consumer broadband-and-mobile benefits through EE One. Do not assume an old BT Mobile discount or a separately held BT Broadband account automatically qualifies. Ask whether the offer requires EE Broadband, which accounts must be linked and what happens to each price if one service ends, then compare BT broadband plus a separate SIM.' },
      { question: 'Is it cheaper to bundle broadband and mobile?', answer: 'It can be, but a discount does not guarantee the lowest combined bill. Add every broadband and mobile payment, setup fee and scheduled rise across the minimum term, then subtract guaranteed credits and only the benefits you would otherwise pay for. Compare that total with suitable address-specific broadband and SIM-only deals from separate providers before accepting the bundle.' },
    ],
  },

  'best-streaming-services-uk': {
    body: (
      <>
        <p><strong>No single streaming service currently covers everything a UK household wants, and prices keep moving: Netflix&apos;s cheapest Standard with adverts plan rose from £5.99 to £7.99 a month on 3 September 2026.</strong> Netflix remains the best all-round choice for most households, Amazon Prime Video suits anyone already paying for Prime delivery, Disney+ suits families, and subscribing to all five major paid services at once currently costs £30.95 a month combined, before any broadband bundle discount.</p>
        <p>Streaming prices and line-ups change often, so treat every figure below as a snapshot verified on 20 September 2026, and check the provider&apos;s own pricing page before you commit.</p>

        <h2>Best streaming services in the UK at a glance</h2>
        <div role="region" aria-label="Streaming services at a glance" tabIndex={0} className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">UK streaming services compared by price and best use</caption>
            <thead>
              <tr className="bg-slate-50">
                {['Service', 'Cheapest price', 'Best for'].map((heading) => (
                  <th key={heading} scope="col" className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Netflix</th><td className="border border-slate-200 px-4 py-3">£7.99/month (Standard with adverts)</td><td className="border border-slate-200 px-4 py-3">Best overall catalogue</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Amazon Prime Video</th><td className="border border-slate-200 px-4 py-3">£8.99/month (with adverts)</td><td className="border border-slate-200 px-4 py-3">Best value if you already pay for Prime</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Disney+</th><td className="border border-slate-200 px-4 py-3">£4.99/month (with adverts)</td><td className="border border-slate-200 px-4 py-3">Best for families</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">NOW Entertainment Membership</th><td className="border border-slate-200 px-4 py-3">£9.99/month (with adverts)</td><td className="border border-slate-200 px-4 py-3">Best no-contract Sky-style entertainment</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Discovery+</th><td className="border border-slate-200 px-4 py-3">£3.99/month (Basic)</td><td className="border border-slate-200 px-4 py-3">Best value factual and reality TV</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Paramount+</th><td className="border border-slate-200 px-4 py-3">£4.99/month (with adverts)</td><td className="border border-slate-200 px-4 py-3">Best for kids&apos; shows and film franchises</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">Apple TV+</th><td className="border border-slate-200 px-4 py-3">£8.99/month</td><td className="border border-slate-200 px-4 py-3">Best for original prestige drama</td></tr>
              <tr><th scope="row" className="border border-slate-200 px-4 py-3 text-left font-semibold">BBC iPlayer, ITVX, Channel 4, My5</th><td className="border border-slate-200 px-4 py-3">Free (TV Licence needed for live TV and iPlayer)</td><td className="border border-slate-200 px-4 py-3">Best free UK catch-up</td></tr>
            </tbody>
          </table>
        </div>

        <h2>How we compare streaming services in the UK</h2>
        <p>Streaming services compared side by side on one factor alone can be misleading, so we weigh up four things together: the cheapest genuine monthly price, how deep and current the content library is, whether the cheapest tier carries adverts, and whether a broadband, mobile or pay-TV provider already bundles or discounts it. Netflix&apos;s <a href="https://www.moneysavingexpert.com/news/2026/09/netflix-hiking-prices-again/" target="_blank" rel="noopener noreferrer">price rise to £7.99 a month, reported by MoneySavingExpert on 8 September 2026</a>, is a reminder that the cheapest option today is not guaranteed to stay cheapest, so revisit this comparison before renewing an annual plan.</p>

        <h2>Which streaming service is best for you?</h2>
        <ul>
          <li><strong>Best overall: Netflix.</strong> The largest and most talked-about original catalogue, now £7.99 a month on the cheapest ad-supported tier after the September 2026 rise.</li>
          <li><strong>Best for families: Disney+.</strong> Disney, Pixar, Marvel and Star Wars content in one library from £4.99 a month, with parental controls built in.</li>
          <li><strong>Best value if you already pay for Prime: Amazon Prime Video.</strong> Included with an existing Amazon Prime membership, so it can be effectively free on top of a subscription many households already hold.</li>
          <li><strong>Best value factual and reality TV: Discovery+.</strong> The cheapest standalone paid tier in this comparison, at £3.99 a month for its Basic entertainment package.</li>
          <li><strong>Best no-contract Sky-style entertainment: NOW.</strong> NOW&apos;s Entertainment Membership brings Sky-style channels and box sets without a Sky dish or long contract, at £9.99 a month with adverts.</li>
        </ul>

        <h2>What is the cheapest streaming service in the UK?</h2>
        <p>Among paid services, Discovery+ Basic is currently the cheapest standalone option at £3.99 a month, with Disney+ and Paramount+ close behind at £4.99 a month on their ad-supported tiers. If cost matters more than any single service, the genuinely free options, BBC iPlayer, ITVX, Channel 4 and My5, cost nothing at all, though a TV Licence is still required to watch live television on any channel or to use BBC iPlayer.</p>
        <p>The cheapest route for a multi-service household is often not paying for each app separately. Several services are effectively bundled with your broadband, mobile or pay-TV package: Sky Signature includes Netflix Standard with adverts, some O2 mobile plans include Disney+ for a limited period, and Sky Cinema customers can receive Paramount+ at no extra charge. Check our <Link href="/guides/best-broadband-and-tv-deals">broadband and TV deals guide</Link> and <Link href="/guides/broadband-and-mobile-bundle-discounts-uk">broadband and mobile bundle guide</Link> before paying full price for a service your existing package may already include.</p>

        <h2>How many streaming services do you actually need?</h2>
        <p><a href="https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/multi-sector/media-nations/2026/media-nations-2026-uk-report.pdf?v=423157" target="_blank" rel="noopener noreferrer">Ofcom&apos;s Media Nations 2026 report, published 29 July 2026, found that 70% of UK households had at least one paid streaming subscription</a> in the first quarter of the year, only two percentage points higher than in 2022. Ofcom describes household streaming take-up as having largely plateaued after its rapid pandemic-era growth, and separately found Netflix and BBC iPlayer are the two services UK viewers most often name as their first choice when they sit down to watch something.</p>
        <p>Most households do not need every service running at once. A practical starting point is one broad entertainment service such as Netflix or Prime Video, plus one specialist service that matches a genuine household interest, such as Disney+ for young children or Discovery+ for factual and reality shows. Rotating a service on and off between key releases, rather than holding every subscription permanently, is a simple way to avoid paying for content nobody in the household is currently watching.</p>

        <h2>The true cost of subscribing to every major streaming service</h2>
        <p>Add up the cheapest ad-supported tier of the five biggest paid UK services, Netflix, Amazon Prime Video, Disney+, Discovery+ and Paramount+, and if you subscribed to all five at once the combined bill is £30.95 a month: £7.99 plus £8.99 plus £4.99 plus £3.99 plus £4.99. That is before NOW, Apple TV+ or a pay-TV package are added on top, and before any broadband or mobile bundle discount is applied.</p>
        <p>Seeing that £30.95 total written out in one place is the clearest way to judge whether a household is genuinely getting value from every subscription it holds, or quietly paying for four services while only ever opening one.</p>

        <h2>Streaming services bundled with your broadband and mobile</h2>
        <p>UK broadband, mobile and pay-TV providers increasingly fold streaming into their own packages rather than leaving customers to buy each app separately. Sky bundles Netflix into Sky Signature and offers Paramount+ free to Sky Cinema customers; Virgin Media&apos;s TV packages include access to several apps through its set-top box; and some EE and O2 mobile plans have included limited-time access to Disney+. Our <Link href="/guides/broadband-and-mobile-bundle-discounts-uk">broadband and mobile bundle discounts guide</Link> compares EE One, Vodafone Together and Virgin Media O2 Volt in detail, and our <Link href="/compare">broadband comparison tool</Link> shows which providers serving your address currently bundle a streaming service.</p>

        <h2>Free ways to watch TV in the UK without a subscription</h2>
        <p>BBC iPlayer, ITVX, Channel 4 and My5 remain free to use and carry no monthly fee. A TV Licence is still required to watch live television on any channel or service, or to use BBC iPlayer, regardless of whether the picture arrives through an aerial or broadband. If your household is trying to reduce paid subscriptions rather than replace an aerial, our <Link href="/guides/freely-and-fetch-tv-explained-uk">Freely TV explainer</Link> covers how free UK channels can be combined with on-demand catch-up over broadband instead of a satellite dish or extra set-top box.</p>

        <h2>Our recommendation</h2>
        <p>Start with one broad paid service, Netflix at £7.99 a month for the widest catalogue or Prime Video if the household already pays for Prime, then add a single specialist service that matches a genuine interest rather than subscribing to all five at £30.95 a month. Check whether your broadband, mobile or pay-TV package already includes or discounts a service before paying full price again, and revisit this comparison whenever a price changes, since Netflix&apos;s September 2026 rise shows the cheapest plan today will not necessarily stay that way.</p>
      </>
    ),
    faqs: [
      { question: 'Which streaming service is best in the UK?', answer: 'Netflix is the best all-round choice for most UK households thanks to its catalogue size and volume of original shows, now £7.99 a month on its cheapest ad-supported tier after the September 2026 price rise. Disney+ is best for families, Amazon Prime Video is best value if you already pay for Prime, and Discovery+ is the cheapest standalone paid option at £3.99 a month.' },
      { question: 'How do UK streaming services compare on price?', answer: 'Streaming services compared on their cheapest ad-supported tier currently run from £3.99 a month (Discovery+ Basic) up to £9.99 a month (NOW Entertainment Membership), with Disney+ and Paramount+ at £4.99, Netflix at £7.99 and Amazon Prime Video and Apple TV+ both at £8.99. BBC iPlayer, ITVX, Channel 4 and My5 remain free, though a TV Licence is separately required for live television and iPlayer.' },
      { question: 'What is the cheapest streaming service in the UK?', answer: 'Discovery+ Basic is currently the cheapest standalone paid streaming service in the UK at £3.99 a month. Disney+ and Paramount+ follow closely at £4.99 a month each on their ad-supported tiers. The genuinely free options, BBC iPlayer, ITVX, Channel 4 and My5, cost nothing, but a TV Licence is still required for live television and BBC iPlayer.' },
      { question: 'How many streaming services do I need?', answer: 'Ofcom\'s Media Nations 2026 report found 70% of UK households have at least one paid streaming subscription, a figure that has largely plateaued since 2022. Most households do not need more than one broad service, such as Netflix or Prime Video, plus one specialist service matching a genuine interest, rather than holding every major subscription at once.' },
      { question: 'Can I bundle streaming services with my broadband?', answer: 'Yes, in some cases. Sky includes Netflix Standard with adverts in Sky Signature and gives Paramount+ free to Sky Cinema customers, while some EE and O2 mobile plans have included limited-time Disney+ access. Check our broadband and mobile bundle discounts guide and broadband comparison tool to see what your current or prospective provider actually includes before paying for a service separately.' },
      { question: 'Is it worth subscribing to every streaming service?', answer: 'Usually not. Subscribing to all five major paid services, Netflix, Amazon Prime Video, Disney+, Discovery+ and Paramount+, at their cheapest tiers currently costs £30.95 a month combined. Most households get better value rotating one or two services that match what they actually watch rather than paying for all five permanently.' },
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

  const { content: taggedBody, toc } = withHeadingIds(content.body)

  const topDeals = getTopDeals(3)
  const category = guideCategories.find((item) => item.slug === guide.category)
  const sourceLinks = [
    { label: 'BroadbandPicker review methodology', href: '/how-we-review-broadband' },
    { label: 'BroadbandPicker editorial policy', href: '/editorial-policy' },
    ...(guide.sources ?? []).map((source) => ({ ...source, external: true as const })),
  ]

  const articleStructuredData = articleJsonLd({
    headline: guide.title,
    description: guide.metaDescription,
    url: `https://broadbandpicker.co.uk/guides/${slug}`,
    datePublished: guide.publishDate,
    dateModified: guide.updatedDate,
    articleSection: category?.label,
    citation: sourceLinks
      .filter((source) => source.href.startsWith('http') || source.href.startsWith('/'))
      .map((source) =>
        source.href.startsWith('http') ? source.href : `https://broadbandpicker.co.uk${source.href}`
      ),
  })

  const movingHowToJsonLd =
    slug === 'moving-house-broadband-checklist-uk'
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'Moving house broadband checklist UK',
          description:
            'Check the new address, decide whether to transfer or place a new order, book dates, pack the router, leave any Openreach fibre box, then stop the old line only after the new one works.',
          totalTime: 'P28D',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Check the new address',
              text: 'As soon as you know the new postcode, check which providers and connection types can serve that exact property.',
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Decide transfer, new order or leave',
              text: 'Ask whether your current provider can serve the new home, what fee applies, and whether the remaining term continues.',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Book two to four weeks ahead',
              text: 'Use the provider home-move process or place a new order. One Touch Switch is for changing provider at your current address, not for overlapping two homes.',
            },
            {
              '@type': 'HowToStep',
              position: 4,
              name: 'Pack the right kit',
              text: 'Take the provider router. Leave any Openreach optical network terminal or fibre modem that belongs to the old property.',
            },
            {
              '@type': 'HowToStep',
              position: 5,
              name: 'Go live, then stop the old line',
              text: 'Plug in on moving day, test the connection, and only then end the old service unless a stop date is already set.',
            },
          ],
        }
      : null

  const switchHowToJsonLd =
    slug === 'how-to-switch-broadband-uk'
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to switch broadband in the UK',
          description:
            'Check your contract, compare an address-specific deal, order with the new provider, then let One Touch Switch handle the cutover.',
          totalTime: 'P14D',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Check your contract end date and exit charge',
              text: 'Find the minimum term end date and any early termination fee before you order a new line.',
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Compare deals for your address',
              text: 'Enter the postcode and compare total contract cost, typical speed and setup fees for packages that can serve that home.',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Order with the new provider',
              text: 'Give accurate account and address details so the new provider can start One Touch Switch.',
            },
            {
              '@type': 'HowToStep',
              position: 4,
              name: 'Change over',
              text: 'Connect the new router or attend the engineer visit. The old broadband should end after the new service starts.',
            },
            {
              '@type': 'HowToStep',
              position: 5,
              name: 'Close the old account',
              text: 'Check the final bill, any refund and equipment-return instructions.',
            },
          ],
        }
      : null

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const tvBundleProductJsonLd =
    slug === 'best-broadband-and-tv-deals'
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'UK broadband and TV bundle packages compared',
          itemListElement: tvBundleOptions.map((bundle, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: `${bundle.provider}: ${bundle.packageName}`,
              description: `${bundle.packageName}: ${bundle.broadbandSpeedMbps}Mbps broadband with TV on a ${bundle.contractMonths}-month contract. ${bundle.highlights.join('. ')}.`,
              image: providerSchemaImage(bundle.providerSlug),
              brand: { '@type': 'Brand', name: bundle.provider },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'GBP',
                price: bundle.monthlyPrice,
                url: `https://broadbandpicker.co.uk${bundle.reviewHref}`,
                availability: 'https://schema.org/InStock',
              },
            },
          })),
        }
      : null

  const updatedDate = new Date(guide.updatedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const hero = guideHero(guide)

  const commercial = getCommercialGuide(slug)
  if (commercial && slug === 'best-broadband-and-tv-deals') {
    const tvProviderSlugs = Array.from(new Set(tvBundleOptions.map((bundle) => bundle.providerSlug)))
    const affiliateUrls = Object.fromEntries(
      tvProviderSlugs
        .map((providerSlug) => [providerSlug, getProviderBySlug(providerSlug)?.affiliateUrl] as const)
        .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
    )
    const renderedAt = new Date().toISOString()
    const related = commercial.relatedSlugs
      .map((relatedSlug) => getGuideBySlug(relatedSlug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    return (
      <CommercialGuideLayout
        guide={guide}
        config={commercial}
        categoryLabel={category?.label}
        updatedDate={updatedDate}
        toc={toc}
        body={taggedBody}
        faqs={content.faqs}
        sourceLinks={sourceLinks}
        related={related}
        jsonLd={[articleStructuredData, faqJsonLd, tvBundleProductJsonLd].filter(
          (data): data is NonNullable<typeof data> => Boolean(data),
        )}
        dealCount={tvBundleOptions.length}
        providers={tvProviderSlugs.map((providerSlug) => ({
          slug: providerSlug,
          name: tvBundleOptions.find((bundle) => bundle.providerSlug === providerSlug)?.provider ?? providerSlug,
        }))}
        affiliateUrls={affiliateUrls}
        renderedAt={renderedAt}
        deals={
          <TvBundleDealCards
            affiliateUrls={affiliateUrls}
            picks={commercial.cardPicks}
            renderedAt={renderedAt}
          />
        }
      />
    )
  }

  return (
    <article>
      <JsonLd data={articleStructuredData} />
      <JsonLd data={faqJsonLd} />
      {switchHowToJsonLd ? <JsonLd data={switchHowToJsonLd} /> : null}
      {movingHowToJsonLd ? <JsonLd data={movingHowToJsonLd} /> : null}
      {tvBundleProductJsonLd ? <JsonLd data={tvBundleProductJsonLd} /> : null}

      <PageHeroBanner
        title={guide.title}
        kicker={guideHeroKicker(guide)}
        lede={firstSentence(guide.excerpt)}
        image={hero.image}
        imageAlt={hero.imageAlt}
        accent={hero.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Guides', href: '/guides' },
          ...(category ? [{ name: category.label, href: '/guides' }] : []),
          { name: guide.title, href: `/guides/${slug}` },
        ]}
      />

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200">
        <span>Updated {updatedDate}</span>
        <span>&middot;</span>
        <span>{guide.readingTime} min read</span>
        <span>&middot;</span>
        <span>Reviewed by BroadbandPicker editorial team</span>
      </div>

      <PostcodeContextBar />

      <CiteableAnswer>{guide.excerpt}</CiteableAnswer>

      {(slug === 'best-broadband-deals-uk' || slug === 'best-broadband-for-students') && (
        <aside className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
          <p className="font-bold text-slate-900">Nottingham city-centre example</p>
          <p className="mt-1">
            Our <Link href="/postcode/ng1" className="font-semibold text-sky-700 hover:underline">NG1 broadband deals guide</Link>{' '}
            shows how district coverage, building access, total contract cost and tenancy length change the shortlist for one local area.
          </p>
        </aside>
      )}

      {slug === 'broadband-speeds-explained' && (
        <aside className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
          <p className="font-bold text-slate-900">Reading speed and coverage example</p>
          <p className="mt-1">
            The <Link href="/postcode/rg1" className="font-semibold text-sky-700 hover:underline">RG1 broadband deals guide</Link>{' '}
            shows why a district coverage percentage, an address-specific speed estimate and the speed a household needs are three different facts.
          </p>
        </aside>
      )}

      {guide.keyTakeaways && guide.keyTakeaways.length > 0 && (
        <section className="mb-10 rounded-xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Key Takeaways</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {guide.keyTakeaways.map((takeaway) => (
              <li key={takeaway} className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {takeaway}
              </li>
            ))}
          </ul>
        </section>
      )}

      {toc.length >= 3 && (
        <nav aria-label="Table of contents" className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">On this page</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {toc.map((entry) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`} className="text-sky-700 hover:underline">
                  {entry.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {slug === 'broadband-deals-with-cashback' && <CashbackDealComparison />}
      {slug === 'best-broadband-and-tv-deals' && <TvBundleComparisonTable />}

      <div className="prose prose-slate max-w-none mb-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:my-4 [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:pl-6 [&_li]:text-slate-700 [&_li]:mb-2 [&_strong]:text-slate-900 [&_table]:my-6 [&_th]:font-semibold [&_th]:text-slate-700 [&_td]:text-slate-700">
        {taggedBody}
      </div>

      {slug === 'how-to-switch-broadband-uk' && (
        <p className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-slate-700">
          Former Shell Energy Broadband customers now manage their service through TalkTalk. Our{' '}
          <Link href="/providers/shell-energy" className="font-semibold text-sky-700 hover:underline">
            Shell Energy broadband migration guide
          </Link>{' '}
          explains the account change, historic packages and checks to make before switching.
        </p>
      )}

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

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Editorial and Source Notes</h2>
        <p className="mb-4 text-sm text-slate-600">
          We review guides against our published methodology and add source links where external
          verification materially helps the reader check claims, dates, and regulator-backed
          context.
        </p>
        <ul className="space-y-2 text-sm">
          {sourceLinks.map((source) => (
            <li key={source.href}>
              {'external' in source && source.external ? (
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline"
                >
                  {source.label}
                </a>
              ) : (
                <Link href={source.href} className="text-sky-600 hover:underline">
                  {source.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <NewsletterSignup variant="guide" source="guide-end" />
      </div>

      {/* Related guides */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Related guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides
            .filter((g) => g.slug !== slug)
            .sort((a, b) => {
              const aPriority = a.category === guide.category ? 0 : 1
              const bPriority = b.category === guide.category ? 0 : 1
              return aPriority - bPriority
            })
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
    </article>
  )
}
