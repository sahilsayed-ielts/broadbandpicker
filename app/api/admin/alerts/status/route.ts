import { alertsAdminConfigured, alertsAdminSession } from '@/lib/alertsAuth'
import { listConfirmedSubscribers, mailConfigured } from '@/lib/newsletter'
import { WEEKLY_SEND, nextWeeklySendLabel } from '@/lib/sendSchedule'
import { buildWeeklyIssue } from '@/lib/weeklyNewsletter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  if (!(await alertsAdminSession())) {
    return Response.json({ error: 'Unauthorised', adminConfigured: alertsAdminConfigured() }, { status: 401 })
  }
  const issue = buildWeeklyIssue()
  const confirmed = await listConfirmedSubscribers()
  return Response.json({
    ok: true,
    mailConfigured: mailConfigured(),
    confirmedCount: confirmed.length,
    weekKey: issue.weekKey,
    subject: issue.subject,
    checklist: issue.checklist,
    sendDay: WEEKLY_SEND.dayName,
    sendWhen: WEEKLY_SEND.london,
    nextSendAt: nextWeeklySendLabel(),
    cron: WEEKLY_SEND.cron,
  })
}
