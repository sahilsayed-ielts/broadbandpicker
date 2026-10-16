import { confirmAlert, type AlertKind } from '@/lib/alerts'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** POST only, from the button on /alerts/confirm-alert, so mail scanners that prefetch links cannot confirm. */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    return Response.json({ outcome: 'invalid' }, { status: 400 })
  }
  const kind: AlertKind | null = body.kind === 'price' || body.kind === 'contract' ? body.kind : null
  if (!kind) return Response.json({ outcome: 'invalid' }, { status: 400 })
  const outcome = await confirmAlert(kind, typeof body.token === 'string' ? body.token : undefined)
  return Response.json({ outcome }, { status: outcome === 'unavailable' ? 503 : 200 })
}
