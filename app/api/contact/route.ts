import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

const REASONS = new Set(['general', 'editorial', 'partnerships'])
const REASON_LABEL: Record<string, string> = {
  general: 'General enquiry',
  editorial: 'Editorial enquiry',
  partnerships: 'Affiliate partnership',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const reason = typeof body.reason === 'string' ? body.reason : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const website = typeof body.website === 'string' ? body.website.trim() : '' // honeypot
  const renderedAt = typeof body.renderedAt === 'number' ? body.renderedAt : 0

  // Honeypot: a real visitor never fills this hidden field. Report success
  // without sending mail so the bot has no signal it was caught.
  if (website) {
    return Response.json({ ok: true })
  }

  // A bot that fills and submits a form in under 1.5s is not reading it.
  if (renderedAt && Date.now() - renderedAt < 1500) {
    return badRequest('Please try again.')
  }

  if (!name || name.length > 200) return badRequest('Please enter your name.')
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) return badRequest('Please enter a valid email address.')
  if (!REASONS.has(reason)) return badRequest('Please select a reason for your message.')
  if (!message || message.length < 10) return badRequest('Please enter a message of at least 10 characters.')
  if (message.length > 5000) return badRequest('Message is too long.')

  const smtpUser = process.env.CONTACT_SMTP_USER
  const smtpPass = process.env.CONTACT_SMTP_PASS
  const toEmail = process.env.CONTACT_TO_EMAIL || 'sayedsahil.elt@gmail.com'

  if (!smtpUser || !smtpPass) {
    console.error('Contact form: CONTACT_SMTP_USER / CONTACT_SMTP_PASS not configured')
    return Response.json({ error: 'Message could not be sent right now. Please try again later.' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  })

  try {
    await transporter.sendMail({
      from: `"BroadbandPicker Contact Form" <${smtpUser}>`,
      to: toEmail,
      replyTo: `"${name}" <${email}>`,
      subject: `[BroadbandPicker] ${REASON_LABEL[reason]} — ${name}`,
      text: `New message from the BroadbandPicker contact form.\n\nName: ${name}\nEmail: ${email}\nReason: ${REASON_LABEL[reason]}\n\nMessage:\n${message}`,
      html: `
        <p>New message from the BroadbandPicker contact form.</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}<br>
        <strong>Email:</strong> ${escapeHtml(email)}<br>
        <strong>Reason:</strong> ${escapeHtml(REASON_LABEL[reason])}</p>
        <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    })
  } catch (error) {
    console.error('Contact form: failed to send email', error)
    return Response.json({ error: 'Message could not be sent right now. Please try again later.' }, { status: 500 })
  }

  return Response.json({ ok: true })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
