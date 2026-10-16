import { requestContractReminder } from '@/lib/alerts'
import { parseAlertRequest } from '@/lib/alertRequest'
import { CONTRACT_CONSENT_TEXT } from '@/lib/newsletterCopy'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const parsed = await parseAlertRequest(request, CONTRACT_CONSENT_TEXT)
  if (!parsed.ok) return parsed.response
  if (parsed.honeypot) return Response.json({ ok: true, count: 0 })

  const body = parsed.body
  try {
    const result = await requestContractReminder({
      email: parsed.email,
      providerSlug: typeof body.providerSlug === 'string' ? body.providerSlug : undefined,
      providerName: typeof body.providerName === 'string' ? body.providerName : undefined,
      contractEnd: typeof body.contractEnd === 'string' ? body.contractEnd : '',
      ip: parsed.ip,
      sourcePath: parsed.sourcePath,
    })
    if (!result.ok) return Response.json({ error: result.error }, { status: result.status })
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Contract reminder signup failed', error)
    return Response.json({ error: 'We could not send a confirmation email just now. Please try again later.' }, { status: 500 })
  }
}
