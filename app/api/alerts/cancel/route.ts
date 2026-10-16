import { cancelAlert, type AlertKind } from '@/lib/alerts'
import { SITE_URL } from '@/lib/siteSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function kindOf(value: string | null): AlertKind | null {
  return value === 'price' || value === 'contract' ? value : null
}

/** Link in the email: cancel, then show the result page. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const kind = kindOf(url.searchParams.get('kind'))
  const outcome = kind ? await cancelAlert(kind, url.searchParams.get('token') ?? undefined) : 'invalid'
  const target = new URL('/alerts/cancelled', SITE_URL)
  target.searchParams.set('kind', kind ?? 'price')
  target.searchParams.set('outcome', outcome)
  return Response.redirect(target.toString(), 303)
}

/** RFC 8058 one-click unsubscribe from the mail client's own button. */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const kind = kindOf(url.searchParams.get('kind'))
  if (!kind) return Response.json({ error: 'Unknown alert type' }, { status: 400 })
  const outcome = await cancelAlert(kind, url.searchParams.get('token') ?? undefined)
  return Response.json({ ok: outcome === 'cancelled', outcome })
}
