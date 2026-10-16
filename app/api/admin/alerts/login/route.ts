import { ALERTS_ADMIN_COOKIE, alertsAdminConfigured, alertsAdminLoginToken } from '@/lib/alertsAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!alertsAdminConfigured()) {
    return Response.json({ error: 'Set ALERTS_ADMIN_SECRET (12+ characters) in Vercel first.' }, { status: 503 })
  }
  let body: { secret?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
  const token = alertsAdminLoginToken(typeof body.secret === 'string' ? body.secret : '')
  if (!token) {
    return Response.json({ error: 'That password is not right.' }, { status: 401 })
  }
  const response = Response.json({ ok: true })
  const secure = process.env.VERCEL === '1' ? '; Secure' : ''
  response.headers.append(
    'Set-Cookie',
    `${ALERTS_ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${60 * 60 * 24 * 14}`,
  )
  return response
}
