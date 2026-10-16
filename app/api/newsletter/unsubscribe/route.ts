import { unsubscribeSubscription } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function tokenFrom(request: Request): string | undefined {
  const url = new URL(request.url)
  const query = url.searchParams.get('token')
  if (query) return query
  return undefined
}

export async function POST(request: Request) {
  let token = tokenFrom(request)
  const contentType = request.headers.get('content-type') || ''
  if (!token && contentType.includes('application/json')) {
    try {
      const body = (await request.json()) as { token?: string }
      if (typeof body.token === 'string') token = body.token
    } catch {
      // Keep the query-string token if JSON is empty or invalid.
    }
  }
  const result = await unsubscribeSubscription(token)
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 400 })
  }
  return Response.json({ ok: true })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token') || ''
  return Response.redirect(`${new URL(request.url).origin}/alerts/unsubscribe?token=${encodeURIComponent(token)}`, 302)
}
