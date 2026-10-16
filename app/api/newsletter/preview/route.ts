import { buildWeeklyIssue, weeklyIssueEmailHtml } from '@/lib/weeklyNewsletter'
import { SITE_URL } from '@/lib/siteSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const issue = buildWeeklyIssue()
  const html = weeklyIssueEmailHtml(issue, `${SITE_URL}/alerts/unsubscribe`)
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
