'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import AffiliateCTA from '@/components/AffiliateCTA'
import { trackEvent } from '@/lib/analytics'

interface PlusnetVsSkyComparisonProps {
  plusnetAffiliateUrl: string
  skyAffiliateUrl: string
}

// Every figure below was verified against Plusnet and Sky pricing pages, Ofcom
// releases and independent trackers on 6 September 2026. Openreach-network
// availability and the exact price shown after a postcode check are
// address-specific and can differ from these national headline figures.
const VERIFIED_DATE = '6 September 2026'

const priceTiers = [
  { tier: 'Full Fibre, around 74 to 75 Mbps', plusnet: '£21.99 a month', sky: 'About £23 a month', note: 'Plusnet cheaper' },
  { tier: 'Full Fibre, around 145 to 150 Mbps', plusnet: '£22.99 a month', sky: 'About £24 a month', note: 'Plusnet cheaper' },
  { tier: 'Full Fibre, around 300 Mbps', plusnet: '£24.99 a month', sky: 'No direct match; nearest tier jumps to about 500 or 900 Mbps', note: 'Plusnet only' },
  { tier: 'Full Fibre, around 500 Mbps', plusnet: '£27.99 a month', sky: 'About £27 a month', note: 'Roughly level' },
  { tier: 'Full Fibre, around 900 Mbps', plusnet: '£29.99 a month', sky: 'About £28 a month', note: 'Sky slightly cheaper' },
]

const plusnetPros = [
  'Lower monthly price on the entry and mid full fibre tiers',
  'No setup or activation fee on any current package',
  'Best Ofcom complaints record of any major UK provider, at 4 per 100,000 customers in Q1 2026',
  'UK-based customer service team, handled from Sheffield',
  'Reward card worth roughly £50 to £140 on faster tiers, depending on the current promotion',
]
const plusnetCons = [
  'Broadband only, with no landline and no TV option since 2021',
  'Plusnet Hub Two router uses the older Wi-Fi 5 standard, with no bundled mesh',
  'Scheduled flat price rise of £4 a month every March, in 2027 and 2028 for new customers',
  'Top tier stops at around 900 Mbps, with no multi-gigabit option',
]
const skyPros = [
  'Landline and pay-as-you-go calls included on every plan',
  'Optional Wi-Fi 6 Max Hub with a whole-home speed guarantee for about £3 a month',
  'Discounted Sky TV, Sky Stream and Netflix bundles on the same bill',
  'Second best Ofcom complaints record among the majors, at 5 per 100,000 in Q1 2026',
  'Also sold on the CityFibre network in some areas, with multi-gigabit tiers where available',
]
const skyCons = [
  'Usually a pound or two more than Plusnet on the entry and mid full fibre tiers',
  'A router delivery and activation charge can apply outside a no-setup-fee promotion, so check the checkout total',
  'For customers already in contract, the terms only say prices "may rise" in later years rather than fixing a figure',
  'Only 24-month contracts, with no shorter or rolling option',
]

const headToHead = [
  {
    id: 'cheaper',
    question: 'Is Plusnet or Sky broadband cheaper?',
    answer:
      'Plusnet is the cheaper choice on most tiers. Verified on 6 September 2026, Plusnet Full Fibre started at £21.99 a month and its mid tiers ran £22.99 to £27.99, while the closest Sky full fibre plans were about £23 to £27. Sky is only slightly cheaper near 900 Mbps, at about £28 against Plusnet\'s £29.99, and Plusnet\'s reward card can offset that difference. Sky also has no direct match for Plusnet\'s 300 Mbps tier.',
  },
  {
    id: 'faster',
    question: 'Which is faster, Plusnet or Sky?',
    answer:
      'Neither is faster at the same address. Both sell over the Openreach network, so the top speed and line quality at your property are set by the fibre available there, not by the brand. Both offer full fibre from around 74 Mbps up to about 900 Mbps. Plusnet tends to quote slightly higher average upload speeds on the faster tiers, while Sky quotes higher minimum download guarantees. Run a postcode check with each provider to see the exact speed estimate for your line.',
  },
  {
    id: 'service',
    question: 'Which has better customer service, Plusnet or Sky?',
    answer:
      'Both are strong, and Plusnet is marginally ahead on the independent measure. Ofcom\'s Q1 2026 complaints data recorded Plusnet at 4 complaints per 100,000 customers, the lowest of any major UK provider, with Sky second at 5, both below the industry average of 6. Plusnet\'s support is UK-based from Sheffield. Sky scored 63% for complaint-handling satisfaction in Ofcom\'s 2024 survey, above the 58% average.',
  },
  {
    id: 'reliable',
    question: 'Is Sky broadband more reliable than Plusnet?',
    answer:
      'Reliability at a given address depends on the Openreach line rather than the provider, since both use the same network. On the evidence that is measured the same way for every provider, Ofcom\'s complaints data, Plusnet and Sky are the two best performers among the majors. Sky publishes higher minimum speed guarantees on its full fibre tiers, which can matter if a slow line is a specific worry for you.',
  },
  {
    id: 'router',
    question: 'Which router is better, Plusnet or Sky?',
    answer:
      'Sky has the stronger hardware option. Plusnet includes the Hub Two, a Wi-Fi 5 router with no bundled mesh. Sky\'s standard hub is a step up, and its optional Wi-Fi 6 Max Hub adds a whole-home speed guarantee for about £3 a month. If reliable coverage across a larger home matters, Sky gives you a supported way to get it; with Plusnet you would buy your own mesh system separately.',
  },
  {
    id: 'switch',
    question: 'Should I switch from Sky to Plusnet?',
    answer:
      'Switch to Plusnet if you want a lower bill and do not use a Sky landline or Sky TV. Both run on Openreach, so a move between them normally uses Ofcom\'s One Touch Switch process, where the new provider arranges the handover and there is no gap in service. Check any early exit charge on your current Sky contract first, and confirm the Plusnet price and speed at your postcode before you order.',
  },
  {
    id: 'sky-tv',
    question: 'Can I get Sky TV without choosing Sky broadband?',
    answer:
      'Yes. Sky Stream and NOW deliver Sky channels over any broadband connection, so you can keep Plusnet for internet and stream Sky content separately. What you cannot do is bundle them onto one bill or get the combined broadband and TV discount, which is only available when you take Sky broadband as well.',
  },
]

const priorities = {
  lowest_price: {
    label: 'Lowest monthly price',
    provider: 'Plusnet',
    reason:
      'Plusnet is the cheaper starting point on most tiers, verified on 6 September 2026: Full Fibre from £21.99 a month with no setup fee, against about £23 for the nearest Sky plan. Confirm both checkout totals because address-level offers can differ.',
  },
  phone_line: {
    label: 'Included landline and calls',
    provider: 'Sky',
    reason:
      'Sky includes a home phone line and pay-as-you-go calls on every plan. Plusnet is broadband only and no longer offers a landline to new customers, so if you still use a home phone, Sky is the simpler choice.',
  },
  tv_bundle: {
    label: 'Sky TV on one bill',
    provider: 'Sky',
    reason:
      'Only Sky lets you add discounted Sky TV, Sky Stream or Netflix to the same account. With Plusnet you would pay for a separate streaming service such as NOW and lose the bundle discount.',
  },
  complaints_record: {
    label: 'Best complaints record',
    provider: 'Plusnet',
    reason:
      'Ofcom\'s Q1 2026 data put Plusnet at 4 complaints per 100,000 customers, the lowest of any major provider, with Sky close behind at 5. Both are below the industry average of 6, so this is a narrow win for Plusnet.',
  },
  home_wifi: {
    label: 'Whole-home Wi-Fi and a modern router',
    provider: 'Sky',
    reason:
      'Sky offers an optional Wi-Fi 6 Max Hub with a whole-home speed guarantee for about £3 a month. Plusnet supplies the older Wi-Fi 5 Hub Two with no mesh option, so covering a larger home means buying your own kit.',
  },
  clear_price_rises: {
    label: 'A clear future price schedule',
    provider: 'Plusnet',
    reason:
      'Plusnet discloses a flat £4 a month rise every March, including March 2027 and March 2028, at the point of sale. Sky applied a flat £3 a month rise from April 2026, but its terms only say prices "may rise" in later contract years without fixing a figure.',
  },
} as const

type Priority = keyof typeof priorities

export default function PlusnetVsSkyComparison({
  plusnetAffiliateUrl,
  skyAffiliateUrl,
}: PlusnetVsSkyComparisonProps) {
  const [selected, setSelected] = useState<Priority>('lowest_price')
  const [result, setResult] = useState<Priority | null>(null)
  const started = useRef(false)

  function selectPriority(priority: Priority) {
    setSelected(priority)
    setResult(null)
    if (!started.current) {
      started.current = true
      trackEvent('plusnet_sky_comparison_started', { priority })
    }
  }

  function completeComparison() {
    setResult(selected)
    trackEvent('plusnet_sky_comparison_completed', {
      priority: selected,
      recommended_provider: priorities[selected].provider.toLowerCase(),
    })
  }

  const recommendation = result ? priorities[result] : null

  return (
    <>
      <section id="price-tiers" className="mb-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Plusnet vs Sky broadband price, tier by tier</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Full fibre prices verified on {VERIFIED_DATE} from each provider and cross-checked against
          Uswitch. A widely quoted claim that Sky is cheaper across most speeds does not hold for the
          entry and mid tiers, where Plusnet is consistently a pound or two lower. Prices shown after a
          postcode check can differ from these national figures.
        </p>
        <div
          className="overflow-x-auto rounded-xl border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
          role="region"
          aria-label="Plusnet and Sky full fibre prices by speed tier. Scroll horizontally to view every column."
          tabIndex={0}
        >
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">Speed tier</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">Plusnet</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">Sky</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">Cheaper option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priceTiers.map((row) => (
                <tr key={row.tier}>
                  <th scope="row" className="px-4 py-3 text-left font-medium text-slate-900">{row.tier}</th>
                  <td className="px-4 py-3 text-slate-700">{row.plusnet}</td>
                  <td className="px-4 py-3 text-slate-700">{row.sky}</td>
                  <td className="px-4 py-3 text-slate-700">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          How we label the cheaper option: we compare the current advertised monthly price at each
          matching speed tier, before any reward card, and mark a tier "roughly level" when the gap is
          under a pound. Plusnet adds no setup fee; Sky usually advertises no setup fee but can apply a
          router delivery and activation charge outside a promotion.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <AffiliateCTA
            href={plusnetAffiliateUrl}
            providerName="Plusnet"
            providerSlug="plusnet"
            placement="plusnet_vs_sky_price_table"
            label="Check Plusnet price at my postcode"
            size="md"
          />
          <AffiliateCTA
            href={skyAffiliateUrl}
            providerName="Sky"
            providerSlug="sky"
            placement="plusnet_vs_sky_price_table"
            label="Check Sky price at my postcode"
            size="md"
            variant="outline"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Plusnet and Sky pros and cons</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900 mb-3">Plusnet</h3>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700">Pros</p>
            <ul className="mt-1 mb-3 space-y-1.5 text-sm text-slate-700">
              {plusnetPros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cons</p>
            <ul className="mt-1 space-y-1.5 text-sm text-slate-700">
              {plusnetCons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900 mb-3">Sky</h3>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700">Pros</p>
            <ul className="mt-1 mb-3 space-y-1.5 text-sm text-slate-700">
              {skyPros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cons</p>
            <ul className="mt-1 space-y-1.5 text-sm text-slate-700">
              {skyCons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="head-to-head" className="mb-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Plusnet vs Sky broadband: the common questions</h2>
        <div className="space-y-6">
          {headToHead.map((item) => (
            <div key={item.id} id={item.id} className="scroll-mt-24">
              <h3 className="font-bold text-slate-900 mb-1">{item.question}</h3>
              <p className="text-sm leading-relaxed text-slate-700">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="wins-when" className="mb-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">When Plusnet wins and when Sky wins</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Plusnet wins when</h3>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>You want the lowest monthly price and do not need a landline or TV</li>
              <li>The strongest independently measured complaints record matters to you</li>
              <li>You prefer UK-based support and a price rise schedule fixed at sign-up</li>
              <li>You are happy to add your own mesh Wi-Fi if a larger home needs it</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Sky wins when</h3>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>You still use a home phone line, which Sky includes on every plan</li>
              <li>You want Sky TV, Sky Stream or Netflix discounted on one bill</li>
              <li>You want a Wi-Fi 6 router and a whole-home speed guarantee as a supported add-on</li>
              <li>Higher minimum speed guarantees on the full fibre tiers reassure you</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <AffiliateCTA
            href={plusnetAffiliateUrl}
            providerName="Plusnet"
            providerSlug="plusnet"
            placement="plusnet_vs_sky_wins_when"
            label="See Plusnet deals"
            size="md"
          />
          <AffiliateCTA
            href={skyAffiliateUrl}
            providerName="Sky"
            providerSlug="sky"
            placement="plusnet_vs_sky_wins_when"
            label="See Sky deals"
            size="md"
            variant="outline"
          />
        </div>
      </section>

      <section
        className="mb-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7"
        aria-labelledby="plusnet-sky-decision-heading"
      >
        <h2 id="plusnet-sky-decision-heading" className="text-xl font-bold text-slate-900">
          Which provider fits your main priority?
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Choose the one factor that matters most to your household. The result uses the verified
          national prices and Ofcom evidence on this page, so it is a starting point rather than an
          address-level availability check.
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-900">Your main broadband priority</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(priorities) as Priority[]).map((priority) => (
              <label
                key={priority}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold outline-none transition-colors focus-within:ring-2 focus-within:ring-sky-700 focus-within:ring-offset-2 motion-reduce:transition-none ${
                  selected === priority
                    ? 'border-sky-700 bg-sky-700 text-white'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-sky-500'
                }`}
              >
                <input
                  type="radio"
                  name="plusnet-sky-priority"
                  value={priority}
                  checked={selected === priority}
                  onChange={() => selectPriority(priority)}
                  className="h-4 w-4 shrink-0 accent-sky-700"
                />
                {priorities[priority].label}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={completeComparison}
          className="mt-5 min-h-11 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Show my starting point
        </button>

        <div className="mt-5 min-h-32 rounded-xl bg-white p-5 shadow-sm" aria-live="polite" aria-atomic="true">
          {recommendation ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Start with</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{recommendation.provider}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.reason}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <AffiliateCTA
                  href={recommendation.provider === 'Plusnet' ? plusnetAffiliateUrl : skyAffiliateUrl}
                  providerName={recommendation.provider}
                  providerSlug={recommendation.provider.toLowerCase()}
                  placement="plusnet_vs_sky_decision_result"
                  label={`Check ${recommendation.provider} at my postcode`}
                  size="md"
                />
                <Link
                  href="/compare"
                  onClick={() =>
                    trackEvent('plusnet_sky_compare_deals_clicked', {
                      priority: result ?? 'not_selected',
                      recommended_provider: recommendation.provider.toLowerCase(),
                      cta_location: 'plusnet_sky_decision_tool',
                    })
                  }
                  className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  Compare all UK deals
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              Select a priority, then show the result. You can change your answer freely and no
              personal details are needed.
            </p>
          )}
        </div>
      </section>

      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Related Plusnet and Sky comparisons and guides</h2>
        <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <li>
            <Link href="/providers/plusnet" className="text-sky-600 underline hover:text-sky-700">
              Full Plusnet broadband review
            </Link>
          </li>
          <li>
            <Link href="/providers/sky" className="text-sky-600 underline hover:text-sky-700">
              Full Sky broadband review
            </Link>
          </li>
          <li>
            <Link href="/providers/compare/bt-vs-plusnet" className="text-sky-600 underline hover:text-sky-700">
              BT vs Plusnet broadband
            </Link>
          </li>
          <li>
            <Link href="/providers/compare/sky-vs-virgin-media" className="text-sky-600 underline hover:text-sky-700">
              Sky vs Virgin Media broadband
            </Link>
          </li>
          <li>
            <Link href="/guides/best-broadband-and-tv-deals" className="text-sky-600 underline hover:text-sky-700">
              Best broadband and TV deals
            </Link>
          </li>
          <li>
            <Link href="/guides/how-to-switch-broadband-uk" className="text-sky-600 underline hover:text-sky-700">
              How to switch broadband provider in the UK
            </Link>
          </li>
          <li>
            <Link href="/research/uk-broadband-customer-satisfaction" className="text-sky-600 underline hover:text-sky-700">
              UK broadband customer satisfaction and complaints research
            </Link>
          </li>
          <li>
            <Link href="/providers/compare" className="text-sky-600 underline hover:text-sky-700">
              All BroadbandPicker provider comparisons
            </Link>
          </li>
        </ul>
      </section>
    </>
  )
}
