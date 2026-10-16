import { clientIp, isValidEmail, mailConfigured, normaliseEmail } from '@/lib/newsletter'
import { NEWSLETTER_PUBLIC } from '@/lib/newsletterPublic'
import { rateLimited } from '@/lib/rateLimit'

export type ParsedAlertRequest =
  | { ok: true; body: Record<string, unknown>; email: string; ip?: string; sourcePath: string; honeypot: boolean }
  | { ok: false; response: Response }

function fail(error: string, status = 400): { ok: false; response: Response } {
  return { ok: false, response: Response.json({ error }, { status }) }
}

/**
 * Shared checks for public alert signups: open/closed flag, honeypot,
 * minimum fill time, email, consent tick (matched to the exact wording shown),
 * mail configured, and per-IP / per-email rate limits.
 */
export async function parseAlertRequest(request: Request, consentText: string): Promise<ParsedAlertRequest> {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return fail('Invalid request body.')
  }
  const sourcePath = typeof body.sourcePath === 'string' ? body.sourcePath.trim().slice(0, 200) : ''
  if (typeof body.website === 'string' && body.website.trim()) {
    return { ok: true, body, email: '', sourcePath, honeypot: true }
  }
  const renderedAt = typeof body.renderedAt === 'number' ? body.renderedAt : 0
  if (renderedAt && Date.now() - renderedAt < 1500) return fail('Please try again.')
  if (!NEWSLETTER_PUBLIC) return fail('Email alerts are not open yet.', 503)

  const email = typeof body.email === 'string' ? normaliseEmail(body.email) : ''
  if (!email || !isValidEmail(email)) return fail('Please enter a valid email address.')
  if (body.consent !== true) return fail('Tick the box so we know you want these emails.')
  if (typeof body.consentText === 'string' && body.consentText.trim() !== consentText) {
    return fail('Please tick the consent box on this page and try again.')
  }
  if (!mailConfigured()) return fail('Email alerts are not available right now. Please try again later.', 503)

  const ip = clientIp(request)
  if ((ip && rateLimited(`alert-ip:${ip}`, 10)) || rateLimited(`alert-email:${email}`, 5)) {
    return fail('Too many attempts. Please try again later.', 429)
  }
  return { ok: true, body, email, ip, sourcePath, honeypot: false }
}
