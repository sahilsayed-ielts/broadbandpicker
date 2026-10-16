import { CONSENT_TEXT } from '@/lib/newsletterCopy'
import { NEWSLETTER_PUBLIC } from '@/lib/newsletterPublic'
import { rateLimited } from '@/lib/rateLimit'
import {
  clientIp,
  isValidEmail,
  mailConfigured,
  normaliseEmail,
  normalisePostcodeArea,
  requestSubscription,
} from '@/lib/newsletter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PER_IP = 8
const PER_EMAIL = 4

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid request body.')
  }

  const website = typeof body.website === 'string' ? body.website.trim() : ''
  const renderedAt = typeof body.renderedAt === 'number' ? body.renderedAt : 0
  if (website) return Response.json({ ok: true })
  if (renderedAt && Date.now() - renderedAt < 1500) return badRequest('Please try again.')

  const email = typeof body.email === 'string' ? normaliseEmail(body.email) : ''
  const postcode = typeof body.postcode === 'string' ? body.postcode.trim() : ''
  const source = typeof body.source === 'string' ? body.source.trim().slice(0, 120) : 'unknown'
  const sourcePath = typeof body.sourcePath === 'string' ? body.sourcePath.trim().slice(0, 200) : ''
  const consent = body.consent === true
  const consentText = typeof body.consentText === 'string' ? body.consentText.trim() : ''

  if (!email || !isValidEmail(email)) return badRequest('Please enter a valid email address.')
  if (postcode && !normalisePostcodeArea(postcode)) {
    return badRequest('Enter a UK postcode if you want area alerts, or leave it blank.')
  }
  if (!NEWSLETTER_PUBLIC) {
    return Response.json({ error: 'Alerts are not open for signup yet.' }, { status: 503 })
  }
  if (!consent) {
    return badRequest('Tick the box if you want BroadbandPicker to email you.')
  }
  if (consentText && consentText !== CONSENT_TEXT) {
    return badRequest('Please tick the consent box on this page and try again.')
  }
  if (!mailConfigured()) {
    console.error('Alerts: MAIL_SMTP_HOST / MAIL_SMTP_USER / MAIL_SMTP_PASS must be a broadbandpicker.co.uk mailbox, not Gmail')
    return Response.json(
      { error: 'Alerts are not available right now. Please try again later.' },
      { status: 503 },
    )
  }

  const ip = clientIp(request)
  if (ip && rateLimited(`ip:${ip}`, PER_IP)) {
    return Response.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }
  if (rateLimited(`email:${email}`, PER_EMAIL)) {
    return Response.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  try {
    await requestSubscription({
      email,
      postcode,
      source,
      sourcePath,
      ip,
      userAgent: request.headers.get('user-agent') || undefined,
    })
  } catch (error) {
    console.error('Alerts subscribe failed', error)
    return Response.json(
      { error: 'We could not send a confirmation email just now. Please try again later.' },
      { status: 500 },
    )
  }

  return Response.json({ ok: true })
}
