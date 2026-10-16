'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import AffiliateCTA from '@/components/AffiliateCTA'
import { trackEvent } from '@/lib/analytics'

interface HyperopticVsCommunityFibreComparisonProps {
  hyperopticAffiliateUrl: string
  communityFibreAffiliateUrl: string
}

const VERIFIED_DATE = '6 September 2026'

const costRows = [
  {
    period: 'Sep 2026 to Mar 2027 (7 months, before the first April rise)',
    hyperoptic: '7 × £19 = £133',
    communityFibre: '7 × £19 = £133',
  },
  {
    period: 'Apr 2027 to Mar 2028 (12 months)',
    hyperoptic: '12 × £23 = £276',
    communityFibre: '12 × £22 = £264',
  },
  {
    period: 'Apr 2028 to Aug 2028 (5 months, to the 24th month)',
    hyperoptic: '5 × £27 = £135',
    communityFibre: '5 × £25 = £125',
  },
]

const hyperopticPros = [
  'Available in 64 UK towns and cities, so it can be in play outside London',
  '150 Mb from £19 a month and 500 Mb from £20 a month on 24-month terms, checked on the Hyperoptic homepage on 16 October 2026',
  'Rolling monthly 1 Gb offer at £29 a month until 5 October 2026, plus a 30-day decide window on new service',
  'Fair Fibre social tariff from £13 a month for 150 Mb if you receive a qualifying benefit at an eligible location',
  'Typical peak wired one-device speeds published as 159/157 Mb on 150 Mb, 527/523 Mb on 500 Mb and 900/900 Mb on 1 Gb',
]
const hyperopticCons = [
  'Residential top speed stops at 1 Gb, with 900 Mb typical at peak on a single wired device',
  'Fixed-term prices rise by £4 every April, larger than Community Fibre\'s current £3 on 24-month plans',
  'Independent trackers still list an activation fee on some Hyperoptic terms, so confirm the checkout total',
  'Fair Fibre needs qualifying benefits and is only at certain locations, unlike Community Fibre Essential',
]
const communityFibrePros = [
  'Essential 35 Mbps from £12.50 a month is open to anyone, with no benefits check',
  '5 Gig top tier, which Hyperoptic does not sell to homes',
  'No setup fee on the current published range, including Essential',
  'April 2027 rise on current 24-month plans is £3 a month, smaller than Hyperoptic\'s £4',
  'Ofcom 2025 satisfaction of 92% versus an 84% industry average, kept separate from Trustpilot',
]
const communityFibreCons = [
  'London-focused network, with only partial expansion into Surrey and Sussex, so most UK addresses cannot order it',
  'No rolling monthly option to match Hyperoptic\'s current 1 Gb offer',
  'A direct fetch of communityfibre.co.uk packages is JS-rendered, so live prices still have to be confirmed at the postcode checker',
  'Router range in larger flats is a recurring review theme, so a mesh add-on may be extra',
]

const priorities = {
  lowest_london_cost: {
    label: 'Lowest 24-month cost in London',
    provider: 'Community Fibre',
    slug: 'community-fibre',
    reason:
      'Where both networks are already in the building, Community Fibre is the cheaper 24-month path at 150 Mbps on a like-for-like £19 intro: £522 against Hyperoptic\'s £544 once the disclosed April rises are included. Essential 35 Mbps from £12.50 a month is also open to anyone.',
  },
  outside_london: {
    label: 'I live outside London',
    provider: 'Hyperoptic',
    slug: 'hyperoptic',
    reason:
      'Community Fibre does not build outside London except in parts of Surrey and Sussex. Hyperoptic currently lists 64 UK towns and cities and had passed 2 million homes by July 2026. Check the Hyperoptic checker first; if the building is not wired, neither of these two is a realistic option.',
  },
  fastest_top_speed: {
    label: 'Fastest residential top speed',
    provider: 'Community Fibre',
    slug: 'community-fibre',
    reason:
      'Community Fibre sells 5 Gig. Hyperoptic\'s residential cap is 1 Gb, with 900 Mb typical at peak on one wired device. Most homes will not use 5 Gig on Wi-Fi, but if the top advertised speed is the priority and you are in the Community Fibre footprint, it wins this comparison.',
  },
  shorter_contract: {
    label: 'Rolling monthly or a shorter commitment',
    provider: 'Hyperoptic',
    slug: 'hyperoptic',
    reason:
      'Hyperoptic is advertising 1 Gb on rolling monthly at £29 until 5 October 2026, and it gives 30 days to decide after service starts. Community Fibre\'s current range is 12, 18 or 24 months, with Essential on 12 months. Confirm the live term at checkout because offers change.',
  },
  low_cost_tariff: {
    label: 'Lowest-cost or social tariff',
    provider: 'Community Fibre',
    slug: 'community-fibre',
    reason:
      'In London, Community Fibre Essential 35 Mbps from £12.50 a month has no benefits test. Hyperoptic Fair Fibre is cheaper on speed, from £13 a month for 150 Mb, but only if you receive a qualifying benefit at an eligible location. Outside London, Fair Fibre is the one of these two that can apply.',
  },
} as const

type Priority = keyof typeof priorities

export default function HyperopticVsCommunityFibreComparison({
  hyperopticAffiliateUrl,
  communityFibreAffiliateUrl,
}: HyperopticVsCommunityFibreComparisonProps) {
  const [selected, setSelected] = useState<Priority>('lowest_london_cost')
  const [result, setResult] = useState<Priority | null>(null)
  const started = useRef(false)

  function selectPriority(priority: Priority) {
    setSelected(priority)
    setResult(null)
    if (!started.current) {
      started.current = true
      trackEvent('hyperoptic_cf_comparison_started', { priority })
    }
  }

  function completeComparison() {
    setResult(selected)
    trackEvent('hyperoptic_cf_comparison_completed', {
      priority: selected,
      recommended_provider: priorities[selected].slug,
    })
  }

  const recommendation = result ? priorities[result] : null

  return (
    <>
      <section id="availability-first" className="mb-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-bold text-slate-900">Availability first</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Hyperoptic vs Community Fibre is only a real choice where both own-network full-fibre builds
          already reach the building. Neither uses Openreach. Follow the three steps before you treat
          any monthly price as comparable.
        </p>
        <ol className="mt-4 space-y-3 text-sm text-slate-700">
          <li>
            <span className="font-semibold text-slate-900">Step 1.</span> If you are outside London,
            Community Fibre is unlikely to be available at all except in parts of Surrey and Sussex.
            Hyperoptic is the only one of the two that can be in play, and only in a wired building
            among its 64 UK towns and cities.
          </li>
          <li>
            <span className="font-semibold text-slate-900">Step 2.</span> If you are in London, run
            both provider checkers. A postcode in a served borough does not mean your block is
            connected. Wayleave permission still matters in rented or leasehold flats.
          </li>
          <li>
            <span className="font-semibold text-slate-900">Step 3.</span> Only then compare the same
            speed tier, the same contract length, setup fees and the disclosed April rise. A 150 Mbps
            24-month plan is the fairest like-for-like starting point on this page.
          </li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-3">
          <AffiliateCTA
            href={hyperopticAffiliateUrl}
            providerName="Hyperoptic"
            providerSlug="hyperoptic"
            placement="hyperoptic_vs_cf_availability"
            label="Check Hyperoptic availability"
            size="md"
          />
          <AffiliateCTA
            href={communityFibreAffiliateUrl}
            providerName="Community Fibre"
            providerSlug="community-fibre"
            placement="hyperoptic_vs_cf_availability"
            label="Check Community Fibre availability"
            size="md"
            variant="outline"
          />
        </div>
      </section>

      <section id="contract-facts" className="mb-10 scroll-mt-24">
        <h3 className="text-xl font-bold text-slate-900">Contract facts</h3>
        <p className="mt-2 mb-4 text-sm leading-relaxed text-slate-600">
          Standardised facts for the 150 Mbps 24-month comparison, checked on {VERIFIED_DATE}.
          Missing or address-specific items are labelled rather than invented. Promotional 500 Mb and
          Essential 35 figures sit in the notes, not in the headline 150 Mbps row.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Contract facts</p>
            <h4 className="mt-1 text-lg font-bold text-slate-900">Hyperoptic 150 Mb</h4>
            <p className="mt-1 text-sm font-semibold text-slate-800">From £19 a month</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Intro monthly price</dt>
                <dd className="font-medium text-slate-900">£19, 24-month term</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Disclosed April rise</dt>
                <dd className="font-medium text-slate-900">£4 every April</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">24-month total</dt>
                <dd className="font-medium text-slate-900">£544</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Typical peak wired speed</dt>
                <dd className="font-medium text-slate-900">159 down / 157 up</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Setup</dt>
                <dd className="font-medium text-slate-900">Confirm at checkout</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Data cap</dt>
                <dd className="font-medium text-slate-900">Unlimited</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Availability constraint</dt>
                <dd className="font-medium text-right text-slate-900">64 UK towns and cities, building must be wired</dd>
              </div>
            </dl>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Contract facts</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-bold text-slate-900">Community Fibre 150 Mbps</h4>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Best value</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">From £19 a month on the matching 24-month intro</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Intro monthly price</dt>
                <dd className="font-medium text-slate-900">£19 on 24-month terms (checked 16 Oct 2026)</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Disclosed April rise</dt>
                <dd className="font-medium text-slate-900">£3 every April on current 24-month plans</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">24-month total</dt>
                <dd className="font-medium text-slate-900">£522 at the £19 intro</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Typical peak wired speed</dt>
                <dd className="font-medium text-slate-900">150 / 150 advertised symmetrical</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Setup</dt>
                <dd className="font-medium text-slate-900">Free on current published plans</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Data cap</dt>
                <dd className="font-medium text-slate-900">Unlimited</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Availability constraint</dt>
                <dd className="font-medium text-right text-slate-900">London, plus parts of Surrey and Sussex</dd>
              </div>
            </dl>
          </article>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Hyperoptic also advertised 500 Mb from £20 a month on 24-month terms on 16 October 2026,
          only £1 more than its 150 Mb plan. Community Fibre Essential 35 Mbps from £12.50 a
          month is a different, slower product and is not mixed into this 150 Mbps card.
        </p>
      </section>

      <section id="cost-150" className="mb-10 scroll-mt-24">
        <h3 className="text-xl font-bold text-slate-900">24-month cost at 150 Mbps</h3>
        <p className="mt-2 mb-4 text-sm leading-relaxed text-slate-600">
          Worked example for an order on {VERIFIED_DATE} using Hyperoptic’s homepage 150 Mb from £19
          with a £4 April rise, against Community Fibre’s matching £19 intro with a £3 April rise.
          Address-level offers can be lower. This is a cash total, not a ranking score.
        </p>
        <div
          className="overflow-x-auto rounded-xl border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
          role="region"
          aria-label="24-month cost at 150 Mbps for Hyperoptic and Community Fibre. Scroll horizontally to view every column."
          tabIndex={0}
        >
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">Period</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">Hyperoptic 150 Mb</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">Community Fibre 150 Mbps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {costRows.map((row) => (
                <tr key={row.period}>
                  <th scope="row" className="px-4 py-3 text-left font-medium text-slate-900">{row.period}</th>
                  <td className="px-4 py-3 text-slate-700">{row.hyperoptic}</td>
                  <td className="px-4 py-3 text-slate-700">{row.communityFibre}</td>
                </tr>
              ))}
              <tr className="bg-slate-50">
                <th scope="row" className="px-4 py-3 text-left font-semibold text-slate-900">24-month total</th>
                <td className="px-4 py-3 font-semibold text-slate-900">£544</td>
                <td className="px-4 py-3 font-semibold text-slate-900">£522</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Prices checked on both providers&apos; own sites on 16 October 2026. Confirm the live
          checkout price for your building. Setup is included as £0 for Community Fibre and as
          unknown for Hyperoptic, because the homepage promo cards did not state an activation fee
          while some independent tables still do.
        </p>
      </section>

      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Hyperoptic and Community Fibre pros and cons</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="font-bold text-slate-900 mb-3">Hyperoptic</h4>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700">Hyperoptic pros</p>
            <ul className="mt-1 mb-3 space-y-1.5 text-sm text-slate-700">
              {hyperopticPros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Hyperoptic cons</p>
            <ul className="mt-1 space-y-1.5 text-sm text-slate-700">
              {hyperopticCons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-900">Community Fibre</h4>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800">Fastest</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700">Community Fibre pros</p>
            <ul className="mt-1 mb-3 space-y-1.5 text-sm text-slate-700">
              {communityFibrePros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Community Fibre cons</p>
            <ul className="mt-1 space-y-1.5 text-sm text-slate-700">
              {communityFibreCons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="wins-when" className="mb-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">When each provider is the better starting point</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Choose Community Fibre if</h4>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>Both networks already reach your London building and you want the lower 24-month cost</li>
              <li>You want Essential 35 Mbps from £12.50 a month with no benefits check</li>
              <li>You want 5 Gig, the fastest residential tier in this matchup</li>
              <li>A free setup fee and a £3 April rise matter more than rolling monthly</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Choose Hyperoptic if</h4>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>You live outside London, where Community Fibre does not build</li>
              <li>Your flat is already wired for Hyperoptic and Community Fibre is not in the block</li>
              <li>You want rolling monthly 1 Gb, a 30-day decide window, or Fair Fibre from £13 on qualifying benefits</li>
              <li>You may move to another UK city and want the same brand to remain a possibility</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Hyperoptic also earns a <span className="font-semibold text-slate-800">Best contract flexibility</span> label
          in this matchup because of rolling monthly 1 Gb and the 30-day decide window. That is not
          the same as being cheaper or faster.
        </p>
      </section>

      <section
        className="mb-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7"
        aria-labelledby="hyperoptic-cf-decision-heading"
      >
        <h3 id="hyperoptic-cf-decision-heading" className="text-xl font-bold text-slate-900">
          Which provider fits your main priority?
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Choose the one factor that matters most. The result uses the sourced national figures on
          this page. It is a starting point, not an address-level availability check, and it does
          not collect a postcode.
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-900">Your main broadband priority</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                  name="hyperoptic-cf-priority"
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
                  href={recommendation.slug === 'hyperoptic' ? hyperopticAffiliateUrl : communityFibreAffiliateUrl}
                  providerName={recommendation.provider}
                  providerSlug={recommendation.slug}
                  placement="hyperoptic_vs_cf_decision_result"
                  label={`Check ${recommendation.provider} availability`}
                  size="md"
                />
                <Link
                  href="/compare"
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
        <h3 className="text-xl font-bold text-slate-900 mb-3">Related Hyperoptic and Community Fibre comparisons</h3>
        <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <li>
            <Link href="/providers/hyperoptic" className="text-sky-600 underline hover:text-sky-700">
              Full Hyperoptic broadband review
            </Link>
          </li>
          <li>
            <Link href="/providers/community-fibre" className="text-sky-600 underline hover:text-sky-700">
              Full Community Fibre broadband review
            </Link>
          </li>
          <li>
            <Link href="/providers/compare/community-fibre-vs-hyperoptic" className="text-sky-600 underline hover:text-sky-700">
              Community Fibre vs Hyperoptic
            </Link>
          </li>
          <li>
            <Link href="/providers/compare/hyperoptic-vs-youfibre" className="text-sky-600 underline hover:text-sky-700">
              Hyperoptic vs YouFibre broadband
            </Link>
          </li>
          <li>
            <Link href="/providers/compare/zzoomm-vs-hyperoptic" className="text-sky-600 underline hover:text-sky-700">
              Zzoomm vs Hyperoptic broadband
            </Link>
          </li>
          <li>
            <Link href="/providers/compare/bt-vs-hyperoptic" className="text-sky-600 underline hover:text-sky-700">
              BT vs Hyperoptic broadband
            </Link>
          </li>
          <li>
            <Link href="/postcode/london" className="text-sky-600 underline hover:text-sky-700">
              London broadband deals by area
            </Link>
          </li>
          <li>
            <Link href="/guides/how-to-switch-broadband-uk" className="text-sky-600 underline hover:text-sky-700">
              How to switch broadband provider in the UK
            </Link>
          </li>
        </ul>
      </section>
    </>
  )
}
