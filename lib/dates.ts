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
