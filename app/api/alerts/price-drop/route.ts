import { requestPriceWatch } from '@/lib/alerts'
import { parseAlertRequest } from '@/lib/alertRequest'
import { PRICE_DROP_CONSENT_TEXT } from '@/lib/newsletterCopy'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const parsed = await parseAlertRequest(request, PRICE_DROP_CONSENT_TEXT)
  if (!parsed.ok) return parsed.response
  if (parsed.honeypot) return Response.json({ ok: true, count: 0 })

  const dealIds = Array.isArray(parsed.body.dealIds)
    ? parsed.body.dealIds.filter((id): id is string => typeof id === 'string' && id.length <= 160)
    : []
  if (dealIds.length === 0) {
    return Response.json({ error: 'Save at least one deal first.' }, { status: 400 })
  }
  try {
    const result = await requestPriceWatch({ email: parsed.email, dealIds, ip: parsed.ip, sourcePath: parsed.sourcePath })
    if (!result.ok) return Response.json({ error: result.error }, { status: result.status })
    return Response.json({ ok: true, count: result.count })
  } catch (error) {
    console.error('Price-drop alert signup failed', error)
    return Response.json({ error: 'We could not send a confirmation email just now. Please try again later.' }, { status: 500 })
  }
}
