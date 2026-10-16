/**
 * Shared "live month" freshness helper.
 *
 * Page-1 UK comparison hubs date their titles to the current month (e.g.
 * "Best Broadband Deals UK September 2026"); a stale month in the snippet
 * reads as a dead page even at a good rank. Any page whose title or copy
 * claims to be the current month's deals must compute it here, not hard-code
 * a month string, so it never goes stale again.
 *
 * See docs/home page UX/page-category-ux-ctr-plan.md for the evidence.
 */
export function currentMonthYear(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/** ISO week key such as 2026-W38, used as the weekly issue id. */
export function isoWeekKey(date = new Date()): string {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function formatUkDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
