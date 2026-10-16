import { alertsAdminSession, cronAuthorized } from '@/lib/alertsAuth'
import { isValidEmail, listConfirmedSubscribers, mailConfigured, normaliseEmail, sendWeeklyRoundup } from '@/lib/newsletter'
import { buildWeeklyIssue } from '@/lib/weeklyNewsletter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

async function authorised(request: Request): Promise<boolean> {
  if (cronAuthorized(request)) return true
  return alertsAdminSession()
}

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const result = await sendWeeklyRoundup({})
  return Response.json({ ok: true, auto: true, ...result })
}

export async function POST(request: Request) {
  if (!(await authorised(request))) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const mode = body.mode === 'test' ? 'test' : 'all'
  const testTo = typeof body.testTo === 'string' ? normaliseEmail(body.testTo) : ''
  if (mode === 'test' && !isValidEmail(testTo)) {
    return Response.json({ error: 'Enter a test email address.' }, { status: 400 })
  }
  if (!mailConfigured()) {
    return Response.json(
      {
        error: 'Domain mail is not configured. Set MAIL_SMTP_HOST for noreply@broadbandpicker.co.uk. Gmail is not used for the list.',
        mailConfigured: false,
      },
      { status: 503 },
    )
  }

  const result = await sendWeeklyRoundup({ testTo: mode === 'test' ? testTo : undefined })
  return Response.json({
    ok: true,
    ...result,
    confirmedCount: (await listConfirmedSubscribers()).length,
  })
}
