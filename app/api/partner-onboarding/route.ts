import nodemailer from 'nodemailer'
import { getPartnerOnboardingToken, isPartnerOnboardingTokenExpired } from '@/data/partnerOnboardingTokens'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_FILE_BYTES = 8 * 1024 * 1024
const MAX_DOCUMENTS = 5

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

function str(data: FormData, key: string): string {
  const value = data.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  let data: FormData
  try {
    data = await request.formData()
  } catch {
    return badRequest('Invalid form submission.')
  }

  // Honeypot: a real visitor never fills this hidden field.
  if (str(data, 'website')) {
    return Response.json({ ok: true })
  }
  const renderedAt = Number(data.get('renderedAt') || 0)
  if (renderedAt && Date.now() - renderedAt < 1500) {
    return badRequest('Please try again.')
  }

  const token = str(data, 'token')
  const entry = token ? getPartnerOnboardingToken(token) : undefined
  if (!entry || isPartnerOnboardingTokenExpired(entry)) {
    return badRequest('This link has expired or is no longer valid.')
  }

  const contactName = str(data, 'contactName')
  const contactEmail = str(data, 'contactEmail')
  if (!contactName || contactName.length > 200) return badRequest('Please enter your name.')
  if (!contactEmail || contactEmail.length > 320 || !EMAIL_RE.test(contactEmail)) {
    return badRequest('Please enter a valid email address.')
  }

  let packages: unknown[] = []
  try {
    packages = JSON.parse(str(data, 'packages') || '[]')
  } catch {
    packages = []
  }
  let targetSegments: unknown[] = []
  try {
    targetSegments = JSON.parse(str(data, 'targetSegments') || '[]')
  } catch {
    targetSegments = []
  }

  const submission = {
    advertiserSlug: entry.advertiserSlug,
    advertiserName: entry.advertiserName,
    submittedAt: new Date().toISOString(),
    contact: {
      name: contactName,
      email: contactEmail,
      role: str(data, 'contactRole'),
      companyWebsite: str(data, 'companyWebsite'),
    },
    packages,
    coverage: {
      areas: str(data, 'coverageAreas'),
      coveragePercent: str(data, 'coveragePercent'),
      checkerUrl: str(data, 'coverageCheckerUrl'),
    },
    positioning: {
      targetSegments,
      highlights: str(data, 'highlights'),
      priceRisePolicy: str(data, 'priceRisePolicy'),
    },
    trust: {
      trustpilotUrl: str(data, 'trustpilotUrl'),
      trustpilotScore: str(data, 'trustpilotScore'),
      serviceStats: str(data, 'serviceStats'),
      awards: str(data, 'awards'),
    },
    deals: {
      exclusiveOffer: str(data, 'exclusiveOffer'),
      rewardOrCashback: str(data, 'rewardOrCashback'),
    },
    additionalNotes: str(data, 'additionalNotes'),
  }

  // Files are emailed as attachments rather than persisted to disk — this
  // app has no durable file storage configured, and email is already the
  // working notification channel for every other form on the site.
  const attachments: { filename: string; content: Buffer; contentType?: string }[] = []
  const uploadedFileNames: string[] = []

  const logo = data.get('logo')
  if (logo instanceof File && logo.size > 0) {
    if (logo.size > MAX_FILE_BYTES) return badRequest('Logo file is too large (8MB max).')
    attachments.push({
      filename: logo.name,
      content: Buffer.from(await logo.arrayBuffer()),
      contentType: logo.type || undefined,
    })
    uploadedFileNames.push(logo.name)
  }

  const documents = data.getAll('documents').filter((f): f is File => f instanceof File && f.size > 0)
  if (documents.length > MAX_DOCUMENTS) return badRequest(`Please upload at most ${MAX_DOCUMENTS} documents.`)
  for (const doc of documents) {
    if (doc.size > MAX_FILE_BYTES) return badRequest(`"${doc.name}" is too large (8MB max per file).`)
    attachments.push({
      filename: doc.name,
      content: Buffer.from(await doc.arrayBuffer()),
      contentType: doc.type || undefined,
    })
    uploadedFileNames.push(doc.name)
  }

  attachments.push({
    filename: `onboarding-${entry.advertiserSlug}-${new Date().toISOString().slice(0, 10)}.json`,
    content: Buffer.from(JSON.stringify(submission, null, 2)),
    contentType: 'application/json',
  })

  const smtpUser = process.env.CONTACT_SMTP_USER
  const smtpPass = process.env.CONTACT_SMTP_PASS
  const toEmail = process.env.CONTACT_TO_EMAIL || 'sayedsahil.elt@gmail.com'

  if (!smtpUser || !smtpPass) {
    console.error('Partner onboarding: CONTACT_SMTP_USER / CONTACT_SMTP_PASS not configured')
    return Response.json({ error: 'Could not submit right now. Please try again later.' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  })

  try {
    await transporter.sendMail({
      from: `"BroadbandPicker Partner Onboarding" <${smtpUser}>`,
      to: toEmail,
      replyTo: `"${contactName}" <${contactEmail}>`,
      subject: `[Partner onboarding] ${entry.advertiserName} — content questionnaire submitted`,
      text: `New partner onboarding submission from ${entry.advertiserName}.\n\nSee the attached JSON for the full structured response. A copy can be imported with:\n\npython3 scripts/awin_sync.py import-onboarding-response --advertiser ${entry.advertiserSlug} --file <saved-json-path>\n\nContact: ${contactName} <${contactEmail}>`,
      html: `
        <p>New partner onboarding submission from <strong>${escapeHtml(entry.advertiserName)}</strong>.</p>
        <p><strong>Contact:</strong> ${escapeHtml(contactName)} &lt;${escapeHtml(contactEmail)}&gt;</p>
        <p>Full structured answers are attached as JSON. To bring it into the Awin tracking folder:</p>
        <pre>python3 scripts/awin_sync.py import-onboarding-response --advertiser ${escapeHtml(entry.advertiserSlug)} --file &lt;saved-json-path&gt;</pre>
        <p>Uploaded files: ${uploadedFileNames.length ? escapeHtml(uploadedFileNames.join(', ')) : 'none'}</p>
      `,
      attachments,
    })
  } catch (error) {
    console.error('Partner onboarding: failed to send email', error)
    return Response.json({ error: 'Could not submit right now. Please try again later.' }, { status: 500 })
  }

  // Best-effort durable log — non-critical, never blocks the submission.
  try {
    const supabase = createServerClient()
    await supabase.from('partner_onboarding_responses').insert({
      advertiser_slug: entry.advertiserSlug,
      advertiser_name: entry.advertiserName,
      token,
      submission,
      uploaded_file_names: uploadedFileNames,
    })
  } catch (error) {
    console.error('Partner onboarding: Supabase insert failed (non-critical)', error)
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
