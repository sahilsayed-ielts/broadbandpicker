import type { TvBundleContentTag, TvBundleOption } from '@/data/tvBroadbandBundles'

/**
 * Contract-cost maths for TV bundles, shared by the deal cards and the guide
 * hero so both always show the same totals.
 */

export type TvBundleSortKey = 'monthly' | 'total' | 'speed'

/** Sent by the hero when a reader picks a need; the deal cards apply it. */
export const TV_NEED_EVENT = 'bp:tv-need'
export interface TvNeedDetail {
  watch: TvBundleContentTag[]
  sort: TvBundleSortKey
}

export function monthIndex(value: string): number {
  const [year, month] = value.split('-').map(Number)
  return year * 12 + (month - 1)
}

export function startMonthOptions(now: Date): { value: string; label: string }[] {
  return [1, 2, 3].map((offset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    }
  })
}

export function priceForMonth(bundle: TvBundleOption, start: number, month: number): number {
  const rise = bundle.priceRise
  if (rise.type === 'steps') {
    return rise.steps.reduce(
      (price, step) => (month >= monthIndex(step.from) ? step.monthlyPrice : price),
      bundle.monthlyPrice,
    )
  }
  if (rise.type === 'annual-april') {
    let rises = 0
    for (let m = start + 1; m <= month; m++) if (m % 12 === 3) rises++
    return bundle.monthlyPrice + rises * rise.amount
  }
  return bundle.monthlyPrice
}

export function contractTotal(bundle: TvBundleOption, startValue: string): number {
  const start = monthIndex(startValue)
  let total = bundle.setup.fee ?? 0
  for (let i = 0; i < bundle.contractMonths; i++) total += priceForMonth(bundle, start, start + i)
  return total
}

/** True when the total leaves out a cost the provider hasn't published yet. */
export function totalIsPartial(bundle: TvBundleOption): boolean {
  return bundle.priceRise.type === 'unconfirmed' || bundle.setup.fee === null
}

export function checkedLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function gbp(value: number): string {
  return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function speedLabel(mbps: number): string {
  return mbps >= 1000 ? `${mbps / 1000}Gbps` : `${mbps}Mbps`
}

