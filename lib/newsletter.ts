import crypto from 'crypto'
import { brandedEmailHtml, escapeHtml, mailConfigured, sendBrandedMail } from '@/lib/mail'
import { CONSENT_TEXT, CONSENT_VERSION } from '@/lib/newsletterCopy'
import { buildWeeklyIssue, weeklyIssueEmailHtml, weeklyIssueEmailText } from '@/lib/weeklyNewsletter'
import { extractPostcodeArea, isValidUKPostcode, sanitizePostcode } from '@/lib/postcode'
import { SITE_URL } from '@/lib/siteSchema'
import { createServerClient } from '@/lib/supabase'

export { mailConfigured } from '@/lib/mail'

export { CONSENT_TEXT, CONSENT_VERSION } from '@/lib/newsletterCopy'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000
const UNSUB_TTL_MS = 400 * 24 * 60 * 60 * 1000

export type SubscriberStatus = 'pending' | 'confirmed' | 'unsubscribed'
export type TokenAction = 'confirm' | 'unsubscribe'

export type SubscribeInput = {
  email: string
  postcode?: string
  source: string
  sourcePath?: string
  ip?: string
  userAgent?: string
}

export type SubscribeResult = {
  ok: true
}

export type ConfirmResult =
  | { ok: true; status: 'confirmed' | 'already_confirmed' }
  | { ok: false; reason: 'missing' | 'invalid' | 'expired' | 'unsubscribed' }

export type UnsubscribeResult =
  | { ok: true; status: 'unsubscribed' | 'already_unsubscribed' }
  | { ok: false; reason: 'missing' | 'invalid' | 'expired' }

type TokenPayload = {
  v: 1
  a: 'c' | 'u'
  e: string
  p: string
  t: number
}

function signingSecret(): string {
  return (
    process.env.NEWSLETTER_SIGNING_SECRET ||
    process.env.CONTACT_SMTP_PASS ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'broadbandpicker-alerts'
  )
}

export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value) && value.length <= 320
}

export function normalisePostcodeArea(value: string | undefined): string | null {
  if (!value) return null
  const cleaned = sanitizePostcode(value)
  if (!cleaned) return null
  if (isValidUKPostcode(cleaned)) return extractPostcodeArea(cleaned)
  const area = extractPostcodeArea(cleaned)
  if (area && /^[A-Z]{1,2}[0-9][0-9A-Z]?$/.test(area)) return area
  return null
}

export function hashIp(ip: string | undefined): string | null {
  if (!ip) return null
  const salt = signingSecret()
  return crypto.createHash('sha256').update(`${ip}|${salt}`).digest('hex')
}

export function makeToken(action: TokenAction, email: string, postcodeArea: string | null): string {
  const payload: TokenPayload = {
    v: 1,
    a: action === 'confirm' ? 'c' : 'u',
    e: normaliseEmail(email),
    p: postcodeArea || '',
    t: Date.now(),
  }
  const raw = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', signingSecret()).update(raw).digest('base64url')
  return `${raw}.${sig}`
}

export function readToken(
  token: string | undefined,
  expected: TokenAction,
): { ok: true; email: string; postcodeArea: string | null; issuedAt: number } | { ok: false; reason: 'missing' | 'invalid' | 'expired' } {
  if (!token) return { ok: false, reason: 'missing' }
  const parts = token.split('.')
  if (parts.length !== 2) return { ok: false, reason: 'invalid' }
  const [raw, sig] = parts
  const expectedSig = crypto.createHmac('sha256', signingSecret()).update(raw).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, reason: 'invalid' }
  try {
    const payload = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as TokenPayload
    if (payload.v !== 1 || typeof payload.e !== 'string' || !isValidEmail(payload.e)) {
      return { ok: false, reason: 'invalid' }
    }
    const action = payload.a === 'c' ? 'confirm' : payload.a === 'u' ? 'unsubscribe' : null
    if (action !== expected) return { ok: false, reason: 'invalid' }
    const ttl = expected === 'confirm' ? CONFIRM_TTL_MS : UNSUB_TTL_MS
    if (typeof payload.t !== 'number' || Date.now() - payload.t > ttl) {
      return { ok: false, reason: 'expired' }
    }
    return {
      ok: true,
      email: normaliseEmail(payload.e),
      postcodeArea: payload.p || null,
      issuedAt: payload.t,
    }
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}

export function confirmUrl(email: string, postcodeArea: string | null): string {
  return `${SITE_URL}/alerts/confirm?token=${encodeURIComponent(makeToken('confirm', email, postcodeArea))}`
}

export function unsubscribeUrl(email: string, postcodeArea: string | null): string {
  return `${SITE_URL}/alerts/unsubscribe?token=${encodeURIComponent(makeToken('unsubscribe', email, postcodeArea))}`
}

async function sendUserMail(options: {
  to: string
  subject: string
  text: string
  title: string
  bodyHtml: string
  preheader?: string
  unsubscribeUrl?: string
}) {
  if (!mailConfigured()) throw new Error('Mail is not configured')
  const html = brandedEmailHtml({
    preheader: options.preheader,
    title: options.title,
    bodyHtml: options.bodyHtml,
    unsubscribeUrl: options.unsubscribeUrl,
  })
  await sendBrandedMail({
    to: options.to,
    subject: options.subject,
    text: options.text,
    html,
    unsubscribeUrl: options.unsubscribeUrl,
  })
}

async function sendConfirmationEmail(email: string, postcodeArea: string | null) {
  const url = confirmUrl(email, postcodeArea)
  const unsub = unsubscribeUrl(email, postcodeArea)
  const text = [
    'Confirm your BroadbandPicker deal alerts',
    '',
    'You asked BroadbandPicker to email you weekly UK broadband deal roundups and occasional switching guides.',
    'We will not send those emails until you confirm this address.',
    '',
    `Confirm: ${url}`,
    '',
    'This link expires in 48 hours. If you did not request this, you can ignore this message.',
    `Unsubscribe: ${unsub}`,
  ].join('\n')
  await sendUserMail({
    to: email,
    subject: 'Confirm your BroadbandPicker deal alerts',
    title: 'Confirm your deal alerts',
    preheader: 'Click to confirm. We will not send deal emails until you do.',
    text,
    unsubscribeUrl: unsub,
    bodyHtml: `<p style="margin:0 0 12px;">You asked BroadbandPicker to email you weekly UK broadband deal roundups and occasional switching guides.</p>
     <p style="margin:0 0 12px;">We will not send those emails until you confirm this address.</p>
     <p style="margin:24px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Confirm my email</a></p>
     <p style="margin:0;font-size:13px;color:#64748b;">This link expires in 48 hours. If you did not request this, ignore this message.</p>`,
  })
}

async function sendWelcomeEmail(email: string, postcodeArea: string | null) {
  const unsub = unsubscribeUrl(email, postcodeArea)
  const areaBit = postcodeArea ? ` We have your postcode area as ${postcodeArea} so later emails can mention deals that can serve that area.` : ''
  const text = [
    'You are on the BroadbandPicker deal alerts list.',
    '',
    `We will email weekly UK broadband deal roundups and occasional switching guides.${areaBit}`,
    'We will not pass your address to providers or unnamed “partners”.',
    '',
    `Unsubscribe: ${unsub}`,
    `Privacy: ${SITE_URL}/privacy-policy`,
  ].join('\n')
  await sendUserMail({
    to: email,
    subject: 'You are on BroadbandPicker deal alerts',
    title: 'You are on the list',
    preheader: 'Weekly UK broadband deal roundups from BroadbandPicker.',
    text,
    unsubscribeUrl: unsub,
    bodyHtml: `<p style="margin:0 0 12px;">Thanks for confirming. We will email weekly UK broadband deal roundups and occasional switching guides.${escapeHtml(areaBit)}</p>
     <p style="margin:0 0 12px;">We will not pass your address to providers or unnamed partners.</p>
     <p style="margin:0;"><a href="${SITE_URL}/deals" style="color:#0284c7;">See current deals</a> · <a href="${SITE_URL}/alerts" style="color:#0284c7;">How alerts work</a></p>`,
  })
}

async function sendAlreadySubscribedEmail(email: string, postcodeArea: string | null) {
  const unsub = unsubscribeUrl(email, postcodeArea)
  const text = [
    'This address is already confirmed for BroadbandPicker deal alerts.',
    '',
    `Unsubscribe: ${unsub}`,
  ].join('\n')
  await sendUserMail({
    to: email,
    subject: 'You are already on BroadbandPicker deal alerts',
    title: 'Already confirmed',
    text,
    unsubscribeUrl: unsub,
    bodyHtml: `<p style="margin:0 0 12px;">This address is already confirmed for BroadbandPicker weekly deal roundups and occasional switching guides.</p>
     <p style="margin:0;">If you did not mean to submit the form again, you can ignore this message.</p>`,
  })
}

async function notifyOperator(kind: string, details: Record<string, string | null | undefined>) {
  const to = process.env.CONTACT_TO_EMAIL
  if (!to || !mailConfigured()) return
  const lines = Object.entries(details)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
  try {
    await sendUserMail({
      to,
      subject: `[BroadbandPicker alerts] ${kind}`,
      title: kind,
      text: `${kind}\n\n${lines}\n`,
      bodyHtml: `<pre style="font-family:monospace;font-size:13px;white-space:pre-wrap;">${escapeHtml(`${kind}\n\n${lines}`)}</pre>`,
    })
  } catch (error) {
    console.error('Alerts operator notice failed', error)
  }
}

type StoredSubscriber = {
  email: string
  postcode_area: string | null
  source: string
  confirmed: boolean
  status?: SubscriberStatus
  consent_at?: string
  consent_text?: string
  consent_version?: string
  source_url?: string | null
  ip_hash?: string | null
  confirmed_at?: string | null
  unsubscribed_at?: string | null
}

async function persist(row: StoredSubscriber): Promise<'ok' | 'missing' | 'error'> {
  let client
  try {
    client = createServerClient()
  } catch {
    return 'missing'
  }
  const full = {
    email: row.email,
    postcode_area: row.postcode_area,
    source: row.source,
    confirmed: row.confirmed,
    status: row.status,
    consent_at: row.consent_at,
    consent_text: row.consent_text,
    consent_version: row.consent_version,
    source_url: row.source_url,
    ip_hash: row.ip_hash,
    confirmed_at: row.confirmed_at,
    unsubscribed_at: row.unsubscribed_at,
  }
  const slim = {
    email: row.email,
    postcode_area: row.postcode_area,
    source: row.source,
    confirmed: row.confirmed,
  }
  const { error: fullError } = await client.from('email_subscribers').upsert(full, { onConflict: 'email' })
  if (!fullError) return 'ok'
  const { error: slimError } = await client.from('email_subscribers').upsert(slim, { onConflict: 'email' })
  if (!slimError) return 'ok'
  console.error('Alerts persist failed', fullError.message, slimError.message)
  return 'error'
}

async function readSubscriber(email: string): Promise<Record<string, unknown> | null> {
  try {
    const client = createServerClient()
    const { data, error } = await client.from('email_subscribers').select('*').eq('email', email).maybeSingle()
    if (error) return null
    return data
  } catch {
    return null
  }
}

function isConfirmed(row: Record<string, unknown> | null): boolean {
  if (!row) return false
  if (row.status === 'confirmed') return true
  if (row.status === 'unsubscribed') return false
  return row.confirmed === true
}

function isUnsubscribed(row: Record<string, unknown> | null): boolean {
  if (!row) return false
  return row.status === 'unsubscribed'
}

export async function requestSubscription(input: SubscribeInput): Promise<SubscribeResult> {
  const email = normaliseEmail(input.email)
  const postcodeArea = normalisePostcodeArea(input.postcode)
  const source = (input.source || 'unknown').slice(0, 120)
  const now = new Date().toISOString()
  const existing = await readSubscriber(email)

  if (isConfirmed(existing) && !isUnsubscribed(existing)) {
    await sendAlreadySubscribedEmail(email, (existing?.postcode_area as string) || postcodeArea)
    return { ok: true }
  }

  await persist({
    email,
    postcode_area: postcodeArea || (existing?.postcode_area as string) || null,
    source,
    confirmed: false,
    status: 'pending',
    consent_at: now,
    consent_text: CONSENT_TEXT,
    consent_version: CONSENT_VERSION,
    source_url: input.sourcePath ? `${SITE_URL}${input.sourcePath}` : null,
    ip_hash: hashIp(input.ip),
    confirmed_at: null,
    unsubscribed_at: null,
  })

  await sendConfirmationEmail(email, postcodeArea)
  return { ok: true }
}

export async function confirmSubscription(token: string | undefined): Promise<ConfirmResult> {
  const parsed = readToken(token, 'confirm')
  if (!parsed.ok) return parsed
  const existing = await readSubscriber(parsed.email)
  if (isUnsubscribed(existing)) return { ok: false, reason: 'unsubscribed' }
  if (isConfirmed(existing)) return { ok: true, status: 'already_confirmed' }

  const now = new Date().toISOString()
  const postcodeArea = parsed.postcodeArea || (existing?.postcode_area as string) || null
  await persist({
    email: parsed.email,
    postcode_area: postcodeArea,
    source: typeof existing?.source === 'string' ? existing.source : 'confirm',
    confirmed: true,
    status: 'confirmed',
    consent_at: typeof existing?.consent_at === 'string' ? existing.consent_at : now,
    consent_text: typeof existing?.consent_text === 'string' ? existing.consent_text : CONSENT_TEXT,
    consent_version: typeof existing?.consent_version === 'string' ? existing.consent_version : CONSENT_VERSION,
    source_url: typeof existing?.source_url === 'string' ? existing.source_url : null,
    ip_hash: typeof existing?.ip_hash === 'string' ? existing.ip_hash : null,
    confirmed_at: now,
    unsubscribed_at: null,
  })
  await sendWelcomeEmail(parsed.email, postcodeArea)
  await notifyOperator('confirmed', {
    email: parsed.email,
    postcode_area: postcodeArea,
    source: typeof existing?.source === 'string' ? existing.source : 'confirm',
    confirmed_at: now,
    consent_version: CONSENT_VERSION,
  })
  return { ok: true, status: 'confirmed' }
}

export async function unsubscribeSubscription(token: string | undefined): Promise<UnsubscribeResult> {
  const parsed = readToken(token, 'unsubscribe')
  if (!parsed.ok) return parsed
  const existing = await readSubscriber(parsed.email)
  if (isUnsubscribed(existing)) return { ok: true, status: 'already_unsubscribed' }

  const now = new Date().toISOString()
  const postcodeArea = parsed.postcodeArea || (existing?.postcode_area as string) || null
  await persist({
    email: parsed.email,
    postcode_area: postcodeArea,
    source: typeof existing?.source === 'string' ? existing.source : 'unsubscribe',
    confirmed: false,
    status: 'unsubscribed',
    consent_at: typeof existing?.consent_at === 'string' ? existing.consent_at : now,
    consent_text: typeof existing?.consent_text === 'string' ? existing.consent_text : CONSENT_TEXT,
    consent_version: typeof existing?.consent_version === 'string' ? existing.consent_version : CONSENT_VERSION,
    source_url: typeof existing?.source_url === 'string' ? existing.source_url : null,
    ip_hash: typeof existing?.ip_hash === 'string' ? existing.ip_hash : null,
    confirmed_at: typeof existing?.confirmed_at === 'string' ? existing.confirmed_at : null,
    unsubscribed_at: now,
  })
  await notifyOperator('unsubscribed', {
    email: parsed.email,
    postcode_area: postcodeArea,
    unsubscribed_at: now,
  })
  return { ok: true, status: 'unsubscribed' }
}

export async function listConfirmedSubscribers(): Promise<{ email: string; postcodeArea: string | null }[]> {
  try {
    const client = createServerClient()
    const { data, error } = await client
      .from('email_subscribers')
      .select('email,postcode_area,status,confirmed')
    if (error || !data) return []
    return data
      .filter((row) => row.status !== 'unsubscribed' && (row.status === 'confirmed' || row.confirmed === true))
      .map((row) => ({
        email: normaliseEmail(String(row.email || '')),
        postcodeArea: typeof row.postcode_area === 'string' ? row.postcode_area : null,
      }))
      .filter((row) => isValidEmail(row.email))
  } catch {
    return []
  }
}

async function claimWeekSend(weekKey: string): Promise<'ok' | 'already' | 'no_store'> {
  try {
    const client = createServerClient()
    const { error } = await client.from('newsletter_sends').insert({ week_key: weekKey, sent_count: 0, failed_count: 0 })
    if (!error) return 'ok'
    if (error.code === '23505') return 'already'
    console.error('newsletter_sends insert', error.message)
    return 'no_store'
  } catch {
    return 'no_store'
  }
}

async function recordWeekSend(weekKey: string, sent: number, failed: number): Promise<void> {
  try {
    const client = createServerClient()
    await client.from('newsletter_sends').upsert({
      week_key: weekKey,
      sent_count: sent,
      failed_count: failed,
      sent_at: new Date().toISOString(),
    }, { onConflict: 'week_key' })
  } catch {
    // Preview and send still work if the log table is missing.
  }
}

export async function sendWeeklyRoundup(options: {
  testTo?: string
}): Promise<{ sent: number; failed: number; skipped: string | null; weekKey: string }> {
  const issue = buildWeeklyIssue()
  if (!mailConfigured()) {
    return { sent: 0, failed: 0, skipped: 'mail_not_configured', weekKey: issue.weekKey }
  }

  if (!options.testTo) {
    const claim = await claimWeekSend(issue.weekKey)
    if (claim === 'already') {
      return { sent: 0, failed: 0, skipped: 'already_sent_this_week', weekKey: issue.weekKey }
    }
  }

  const recipients = options.testTo
    ? [{ email: normaliseEmail(options.testTo), postcodeArea: null }]
    : await listConfirmedSubscribers()

  if (recipients.length === 0) {
    return { sent: 0, failed: 0, skipped: 'no_confirmed_subscribers', weekKey: issue.weekKey }
  }

  let sent = 0
  let failed = 0
  for (const recipient of recipients) {
    const unsub = unsubscribeUrl(recipient.email, recipient.postcodeArea)
    try {
      await sendBrandedMail({
        to: recipient.email,
        subject: issue.subject,
        text: weeklyIssueEmailText(issue, unsub),
        html: weeklyIssueEmailHtml(issue, unsub),
        unsubscribeUrl: unsub,
      })
      sent += 1
    } catch (error) {
      failed += 1
      console.error('Weekly roundup send failed', error)
    }
  }
  if (!options.testTo) await recordWeekSend(issue.weekKey, sent, failed)
  return { sent, failed, skipped: null, weekKey: issue.weekKey }
}

export function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim()
  return request.headers.get('x-real-ip') || undefined
}
