import { runDailyAlerts } from '@/lib/alerts'
import { alertsAdminSession, cronAuthorized } from '@/lib/alertsAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/** Vercel Cron, once a day: price-drop emails and due contract reminders. */
export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }
  try {
    return Response.json({ ok: true, ...(await runDailyAlerts()) })
  } catch (error) {
    console.error('Daily alerts failed', error)
    return Response.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

/** Admin re-run from /admin/alerts (ignores the once-a-day claim). */
export async function POST(request: Request) {
  if (!cronAuthorized(request) && !(await alertsAdminSession())) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }
  try {
    return Response.json({ ok: true, ...(await runDailyAlerts({ force: true })) })
  } catch (error) {
    console.error('Daily alerts failed', error)
    return Response.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
