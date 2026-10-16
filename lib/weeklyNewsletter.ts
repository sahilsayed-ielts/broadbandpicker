import { guides } from '@/data/guides'
import { providers, providerDatasetUpdatedDate } from '@/data/providers'
import { currentMonthYear, formatUkDate, isoWeekKey } from '@/lib/dates'
import { brandedEmailHtml, escapeHtml } from '@/lib/mail'
import { latestMonth, monthLabel, priceIndex } from '@/lib/priceIndex'
import { SITE_URL } from '@/lib/siteSchema'

export type WeeklyProviderRow = {
  name: string
  slug: string
  fromPrice: number
  speedLabel: string
  verifiedDate: string
}

export type WeeklyGuideRow = {
  title: string
  slug: string
  excerpt: string
  updatedDate: string
}

export type WeeklyLink = {
  name: string
  href: string
  detail?: string
}

export type WeeklyPriceChange = {
  name: string
  slug: string
  from: number
  to: number
}

export type WeeklyIssue = {
  weekKey: string
  monthYear: string
  subject: string
  preheader: string
  title: string
  lede: string
  providers: WeeklyProviderRow[]
  guides: WeeklyGuideRow[]
  geo: WeeklyLink[]
  tools: WeeklyLink[]
  checklist: string[]
  datasetDate: string
  priceChanges: WeeklyPriceChange[]
  indexMedian: number | null
  indexMonth: string
  previousIndexMonth: string | null
}

/** Entry-price changes between the last two index months (scripts/build_price_index.py). */
function priceChangesFromIndex(): { changes: WeeklyPriceChange[]; previous: string | null } {
  const months = priceIndex.months
  if (months.length < 2) return { changes: [], previous: null }
  const prev = months[months.length - 2]
  const latest = months[months.length - 1]
  const changes = Object.entries(latest.prices)
    .filter(([slug, price]) => slug in prev.prices && Math.abs(prev.prices[slug] - price) >= 0.005)
    .map(([slug, price]) => ({ name: priceIndex.names[slug] ?? slug, slug, from: prev.prices[slug], to: price }))
    .sort((a, b) => (a.to - a.from) - (b.to - b.from))
  return { changes, previous: prev.month }
}

export function buildWeeklyIssue(date = new Date()): WeeklyIssue {
  const monthYear = currentMonthYear()
  const index = priceChangesFromIndex()
  const weekKey = isoWeekKey(date)
  const active = providers.filter((provider) => !provider.retiredDate)
  const rows = [...active]
    .sort((a, b) => a.monthlyPriceFrom - b.monthlyPriceFrom || a.name.localeCompare(b.name))
    .slice(0, 5)
    .map((provider) => {
      const fastest = [...provider.speeds].sort((a, b) => b.download - a.download)[0]
      const speedLabel = fastest
        ? `Packages from ${provider.speeds[0]?.download ?? fastest.download} Mbps`
        : 'See speeds on the provider page'
      return {
        name: provider.name,
        slug: provider.slug,
        fromPrice: provider.monthlyPriceFrom,
        speedLabel,
        verifiedDate: provider.pricingVerifiedDate || providerDatasetUpdatedDate,
      }
    })

  const guideRows = [...guides]
    .sort((a, b) => b.updatedDate.localeCompare(a.updatedDate))
    .slice(0, 3)
    .map((guide) => ({
      title: guide.title,
      slug: guide.slug,
      excerpt: guide.excerpt.slice(0, 180),
      updatedDate: guide.updatedDate,
    }))

  return {
    weekKey,
    monthYear,
    subject: `BroadbandPicker weekly roundup, ${monthYear}`,
    preheader: 'From-prices to check at your address, plus new switching and speed guides. Unsubscribe any time.',
    title: `Weekly broadband roundup, ${monthYear}`,
    lede:
      'This is BroadbandPicker’s weekly look at UK broadband worth checking. From-prices are a snapshot, not a national cheapest promise. Availability is by address, so use the postcode checker before you switch. We may earn a commission if you take out a package through our links. That does not buy a higher rank.',
    providers: rows,
    guides: guideRows,
    geo: [
      { name: 'London', href: '/postcode/london' },
      { name: 'Manchester', href: '/postcode/manchester' },
      { name: 'Birmingham', href: '/postcode/birmingham' },
      { name: 'Glasgow', href: '/postcode/glasgow' },
    ],
    tools: [
      { name: 'Speed test', href: '/tools/speed-test', detail: 'Measure download, upload and ping' },
      { name: 'Broadband Match', href: '/tools/broadband-match', detail: 'Rank packages for your household' },
      { name: 'Cost calculator', href: '/tools/broadband-cost-calculator', detail: 'True monthly cost, not the headline' },
      { name: 'Contract end reminder', href: '/tools/contract-end-reminder', detail: 'A nudge 30 days before your deal ends' },
    ],
    checklist: [
      'Subject names BroadbandPicker and the month',
      'Lede says check at your address',
      'Five from-prices from the live provider dataset',
      'Three recently updated guides',
      'GEO hubs, not a fake nationwide cheapest',
      'Commission disclosure and unsubscribe',
      'From is noreply@broadbandpicker.co.uk, never a personal Gmail',
    ],
    datasetDate: providerDatasetUpdatedDate,
    priceChanges: index.changes,
    indexMedian: latestMonth().basket.median,
    indexMonth: latestMonth().month,
    previousIndexMonth: index.previous,
  }
}

function gbp(value: number): string {
  return `£${value.toFixed(2)}`
}

export function weeklyIssueEmailHtml(issue: WeeklyIssue, unsubscribeUrl?: string | null): string {
  const providerRows = issue.providers
    .map((row) => {
      const url = `${SITE_URL}/providers/${row.slug}`
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-weight:700;color:#0f172a;">${escapeHtml(row.name)}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;">From ${gbp(row.fromPrice)} a month · ${escapeHtml(row.speedLabel)} · verified ${escapeHtml(formatUkDate(row.verifiedDate))}</p>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;">
          <a href="${url}" style="color:#0284c7;font-weight:700;text-decoration:none;">View</a>
        </td>
      </tr>`
    })
    .join('')

  const guideBlocks = issue.guides
    .map((guide) => {
      const url = `${SITE_URL}/guides/${guide.slug}`
      return `<p style="margin:0 0 12px;"><a href="${url}" style="color:#0284c7;font-weight:700;text-decoration:none;">${escapeHtml(guide.title)}</a><br>
        <span style="font-size:13px;color:#64748b;">Updated ${escapeHtml(formatUkDate(guide.updatedDate))}</span></p>`
    })
    .join('')

  const geo = issue.geo
    .map((item) => `<a href="${SITE_URL}${item.href}" style="color:#0284c7;margin-right:12px;">${escapeHtml(item.name)}</a>`)
    .join('')

  const tools = issue.tools
    .map((item) => `<p style="margin:0 0 8px;"><a href="${SITE_URL}${item.href}" style="color:#0284c7;font-weight:700;">${escapeHtml(item.name)}</a> · <span style="color:#64748b;font-size:13px;">${escapeHtml(item.detail || '')}</span></p>`)
    .join('')

  const priceChangeHtml = issue.priceChanges.length > 0
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${issue.priceChanges.map((c) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><a href="${SITE_URL}/providers/${c.slug}" style="color:#0f172a;font-weight:700;text-decoration:none;">${escapeHtml(c.name)}</a></td>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;"><span style="color:#94a3b8;">${gbp(c.from)}</span> → <strong style="color:${c.to < c.from ? '#15803d' : '#b45309'};">${gbp(c.to)}</strong></td>
      </tr>`).join('')}</table>`
    : `<p style="margin:0;color:#475569;">No provider entry-price changes recorded since ${escapeHtml(issue.previousIndexMonth ? monthLabel(issue.previousIndexMonth) : 'our last check')}.</p>`

  const bodyHtml = `
    <p style="margin:0 0 16px;">${escapeHtml(issue.lede)}</p>
    <h2 style="margin:24px 0 8px;font-size:16px;color:#0f172a;">Price changes</h2>
    ${priceChangeHtml}
    <p style="margin:8px 0 0;font-size:13px;color:#64748b;">Median entry price across tracked providers: ${issue.indexMedian !== null ? gbp(issue.indexMedian) : '–'} a month (${escapeHtml(monthLabel(issue.indexMonth))}). <a href="${SITE_URL}/research/broadband-price-index" style="color:#0284c7;">See the price index</a></p>
    <p style="margin:0 0 16px;"><a href="${SITE_URL}/compare" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Check deals at your postcode</a></p>
    <h2 style="margin:24px 0 8px;font-size:16px;color:#0f172a;">From-prices to check this week</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${providerRows}</table>
    <p style="margin:12px 0 0;font-size:13px;color:#64748b;">Prices are monthly from-prices on BroadbandPicker, verified ${escapeHtml(formatUkDate(issue.datasetDate))}. Your address may differ. Always confirm with the provider.</p>
    <h2 style="margin:24px 0 8px;font-size:16px;color:#0f172a;">Guides worth opening</h2>
    ${guideBlocks}
    <h2 style="margin:24px 0 8px;font-size:16px;color:#0f172a;">Broadband in your area</h2>
    <p style="margin:0 0 16px;">${geo}</p>
    <h2 style="margin:24px 0 8px;font-size:16px;color:#0f172a;">Free tools</h2>
    ${tools}
    <p style="margin:20px 0 0;font-size:13px;"><a href="${SITE_URL}/alerts/weekly" style="color:#0284c7;">Read this week’s roundup on the site</a></p>
  `

  return brandedEmailHtml({
    preheader: issue.preheader,
    title: issue.title,
    bodyHtml,
    unsubscribeUrl,
  })
}

export function weeklyIssueEmailText(issue: WeeklyIssue, unsubscribeUrl?: string | null): string {
  const lines = [
    issue.title,
    '',
    issue.lede,
    '',
    `Check deals at your postcode: ${SITE_URL}/compare`,
    '',
    'Price changes',
    ...(issue.priceChanges.length > 0
      ? issue.priceChanges.map((c) => `- ${c.name}: ${gbp(c.from)} -> ${gbp(c.to)} a month`)
      : [`No provider entry-price changes recorded since ${issue.previousIndexMonth ? monthLabel(issue.previousIndexMonth) : 'our last check'}.`]),
    `Price index: ${SITE_URL}/research/broadband-price-index`,
    '',
    'From-prices to check this week',
    ...issue.providers.map(
      (row) =>
        `- ${row.name}: from ${gbp(row.fromPrice)} a month. ${row.speedLabel}. ${SITE_URL}/providers/${row.slug}`,
    ),
    '',
    'Guides',
    ...issue.guides.map((guide) => `- ${guide.title}: ${SITE_URL}/guides/${guide.slug}`),
    '',
    'In your area',
    ...issue.geo.map((item) => `- ${item.name}: ${SITE_URL}${item.href}`),
    '',
    'Tools',
    ...issue.tools.map((item) => `- ${item.name}: ${SITE_URL}${item.href}`),
    '',
    `Web twin: ${SITE_URL}/alerts/weekly`,
    `How we make money: ${SITE_URL}/how-we-make-money`,
  ]
  if (unsubscribeUrl) {
    lines.push('', `Unsubscribe: ${unsubscribeUrl}`)
  }
  return lines.join('\n')
}
