import crypto from 'crypto'
import nodemailer, { type Transporter } from 'nodemailer'
import { LOGO_URL, SITE_URL } from '@/lib/siteSchema'

const BRAND_DOMAIN = 'broadbandpicker.co.uk'
const BLOCKED_WEBMAIL = /@(gmail|googlemail|outlook|hotmail|live|msn|yahoo|icloud|me|aol)\./i

export const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'BroadbandPicker'
export const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS || `noreply@${BRAND_DOMAIN}`
export const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO || `hello@${BRAND_DOMAIN}`

function isBrandMailbox(value: string | undefined): value is string {
  if (!value) return false
  const address = value.trim().toLowerCase()
  if (BLOCKED_WEBMAIL.test(address)) return false
  return address.endsWith(`@${BRAND_DOMAIN}`)
}

function publicSmtpUser(): string | undefined {
  const user = process.env.MAIL_SMTP_USER
  return isBrandMailbox(user) ? user : undefined
}

function publicSmtpPass(): string | undefined {
  return process.env.MAIL_SMTP_PASS || undefined
}

/** True only when subscriber mail can go out as BroadbandPicker, never as a personal Gmail. */
export function mailConfigured(): boolean {
  return Boolean(
    process.env.MAIL_SMTP_HOST &&
      publicSmtpUser() &&
      publicSmtpPass() &&
      isBrandMailbox(MAIL_FROM_ADDRESS) &&
      isBrandMailbox(MAIL_REPLY_TO),
  )
}

export function publicFrom(): string {
  return `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`
}

function getPublicTransporter(): Transporter | null {
  const user = publicSmtpUser()
  const pass = publicSmtpPass()
  const host = process.env.MAIL_SMTP_HOST
  if (!mailConfigured() || !user || !pass || !host) return null
  const port = Number(process.env.MAIL_SMTP_PORT || 465)
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function brandedEmailHtml(options: {
  preheader?: string
  title: string
  bodyHtml: string
  unsubscribeUrl?: string | null
}): string {
  const unsub = options.unsubscribeUrl
    ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#64748b;">You can <a href="${escapeHtml(options.unsubscribeUrl)}" style="color:#0284c7;text-decoration:underline;">unsubscribe</a> at any time.</p>`
    : ''
  const preheader = options.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>`
    : ''
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  ${preheader}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0ea5e9;padding:18px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <img src="${LOGO_URL}" width="36" height="36" alt="BroadbandPicker" style="display:block;border:0;border-radius:9px;background:#ffffff;">
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:18px;line-height:1;font-weight:700;color:#ffffff;">BroadbandPicker</p>
                    <p style="margin:6px 0 0;font-size:12px;line-height:1;color:#e0f2fe;">UK broadband comparison</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px;">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f172a;">${escapeHtml(options.title)}</h1>
              <div style="font-size:15px;line-height:1.6;color:#334155;">${options.bodyHtml}</div>
              ${unsub}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                This is an automated message from BroadbandPicker. Do not reply to ${escapeHtml(MAIL_FROM_ADDRESS)}.
                Questions: <a href="${SITE_URL}/contact" style="color:#0284c7;">broadbandpicker.co.uk/contact</a>.
                Privacy: <a href="${SITE_URL}/privacy-policy" style="color:#0284c7;">privacy policy</a>.
              </p>
              <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">
                BroadbandPicker.co.uk is a free UK comparison site. We may earn a commission if you later take out a package through our links. This email is from BroadbandPicker, not from a provider.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendBrandedMail(options: {
  to: string
  subject: string
  text: string
  html: string
  unsubscribeUrl?: string
}): Promise<void> {
  const transporter = getPublicTransporter()
  if (!transporter || !isBrandMailbox(MAIL_FROM_ADDRESS) || !isBrandMailbox(MAIL_REPLY_TO)) {
    throw new Error('Public brand mail is not configured')
  }

  const hiddenMailboxes = [process.env.CONTACT_SMTP_USER, process.env.CONTACT_TO_EMAIL].filter(
    (value): value is string => Boolean(value && BLOCKED_WEBMAIL.test(value)),
  )
  const outgoing = `${MAIL_FROM_ADDRESS} ${MAIL_REPLY_TO} ${options.subject} ${options.text} ${options.html}`
  if (
    BLOCKED_WEBMAIL.test(MAIL_FROM_ADDRESS) ||
    BLOCKED_WEBMAIL.test(MAIL_REPLY_TO) ||
    hiddenMailboxes.some((value) => outgoing.toLowerCase().includes(value.toLowerCase()))
  ) {
    throw new Error('Refusing to send subscriber mail that would expose a personal webmail address')
  }

  const headers: Record<string, string> = {
    'X-Auto-Response-Suppress': 'All',
    'Auto-Submitted': 'auto-generated',
    'List-Id': `<alerts.${BRAND_DOMAIN}>`,
  }
  if (options.unsubscribeUrl) {
    headers['List-Unsubscribe'] = `<${options.unsubscribeUrl}>`
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
  }

  await transporter.sendMail({
    from: publicFrom(),
    sender: MAIL_FROM_ADDRESS,
    replyTo: `"${MAIL_FROM_NAME}" <${MAIL_REPLY_TO}>`,
    envelope: { from: MAIL_FROM_ADDRESS, to: options.to },
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    headers,
    messageId: `<${crypto.randomUUID()}@${BRAND_DOMAIN}>`,
  })
}
