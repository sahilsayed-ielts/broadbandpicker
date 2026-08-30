import nodemailer from 'nodemailer'
import PDFDocument from 'pdfkit'
import { getPartnerBrandOptions } from '@/data/partnerBrandOptions'

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

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'brand'
}

interface Submission {
  advertiserSlug: string
  advertiserName: string
  submittedAt: string
  contact: { name: string; email: string; role: string; companyWebsite: string }
  packages: unknown[]
  coverage: { areas: string; coveragePercent: string; checkerUrl: string }
  positioning: { targetSegments: unknown[]; highlights: string; priceRisePolicy: string }
  trust: { trustpilotUrl: string; trustpilotScore: string; serviceStats: string; awards: string }
  deals: { exclusiveOffer: string; rewardOrCashback: string }
  promotion: {
    approvedChannels: unknown[]
    disclosureRequirement: string
    brandAssetRules: string
    postingFrequencyNotes: string
  }
  additionalNotes: string
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

  const brandSlugField = str(data, 'brandSlug')
  const otherBrandName = str(data, 'otherBrandName')
  if (!brandSlugField) return badRequest('Please select which brand this is for.')

  let advertiserSlug = brandSlugField
  let advertiserName = brandSlugField
  if (brandSlugField === '__other__') {
    if (!otherBrandName) return badRequest('Please enter your brand name.')
    advertiserName = otherBrandName
    advertiserSlug = slugify(otherBrandName)
  } else {
    const known = getPartnerBrandOptions().find((b) => b.slug === brandSlugField)
    if (!known) return badRequest('Please select a valid brand.')
    advertiserName = known.name
    advertiserSlug = known.slug
  }

  const contactName = str(data, 'contactName')
  const contactEmail = str(data, 'contactEmail')
  if (!contactName || contactName.length > 200) return badRequest('Please enter your name.')
  if (!contactEmail || contactEmail.length > 320 || !EMAIL_RE.test(contactEmail)) {
    return badRequest('Please enter a valid email address.')
  }

  const parseJsonArray = (key: string): unknown[] => {
    try {
      const parsed = JSON.parse(str(data, key) || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const submission: Submission = {
    advertiserSlug,
    advertiserName,
    submittedAt: new Date().toISOString(),
    contact: {
      name: contactName,
      email: contactEmail,
      role: str(data, 'contactRole'),
      companyWebsite: str(data, 'companyWebsite'),
    },
    packages: parseJsonArray('packages'),
    coverage: {
      areas: str(data, 'coverageAreas'),
      coveragePercent: str(data, 'coveragePercent'),
      checkerUrl: str(data, 'coverageCheckerUrl'),
    },
    positioning: {
      targetSegments: parseJsonArray('targetSegments'),
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
    promotion: {
      approvedChannels: parseJsonArray('promoChannels'),
      disclosureRequirement: str(data, 'disclosureRequirement'),
      brandAssetRules: str(data, 'brandAssetRules'),
      postingFrequencyNotes: str(data, 'postingFrequencyNotes'),
    },
    additionalNotes: str(data, 'additionalNotes'),
  }

  // Files are emailed as attachments rather than persisted anywhere -- no
  // database, no file storage service, zero setup required.
  const attachments: { filename: string; content: Buffer; contentType?: string }[] = []
  const uploadedFileNames: string[] = []

  const logo = data.get('logo')
  if (logo instanceof File && logo.size > 0) {
    if (logo.size > MAX_FILE_BYTES) return badRequest('Logo file is too large (8MB max).')
    attachments.push({ filename: logo.name, content: Buffer.from(await logo.arrayBuffer()), contentType: logo.type || undefined })
    uploadedFileNames.push(logo.name)
  }

  const documents = data.getAll('documents').filter((f): f is File => f instanceof File && f.size > 0)
  if (documents.length > MAX_DOCUMENTS) return badRequest(`Please upload at most ${MAX_DOCUMENTS} documents.`)
  for (const doc of documents) {
    if (doc.size > MAX_FILE_BYTES) return badRequest(`"${doc.name}" is too large (8MB max per file).`)
    attachments.push({ filename: doc.name, content: Buffer.from(await doc.arrayBuffer()), contentType: doc.type || undefined })
    uploadedFileNames.push(doc.name)
  }

  attachments.push({
    filename: `onboarding-${advertiserSlug}-${new Date().toISOString().slice(0, 10)}.json`,
    content: Buffer.from(JSON.stringify(submission, null, 2)),
    contentType: 'application/json',
  })

  let pdfBuffer: Buffer | null = null
  try {
    pdfBuffer = await buildReportPdf(submission)
    attachments.push({
      filename: `onboarding-report-${advertiserSlug}-${new Date().toISOString().slice(0, 10)}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    })
  } catch (error) {
    console.error('Partner onboarding: PDF generation failed (continuing without it)', error)
  }

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
      subject: `[Partner onboarding] ${advertiserName} — content questionnaire submitted`,
      text: `New partner onboarding submission from ${advertiserName}.\n\nA PDF report and the full structured JSON are attached. To bring it into the Awin tracking folder:\n\npython3 scripts/awin_sync.py import-onboarding-response --advertiser ${advertiserSlug} --file <saved-json-path> --materials-dir <folder-with-saved-attachments>\n\nContact: ${contactName} <${contactEmail}>`,
      html: `
        <p>New partner onboarding submission from <strong>${escapeHtml(advertiserName)}</strong>.</p>
        <p><strong>Contact:</strong> ${escapeHtml(contactName)} &lt;${escapeHtml(contactEmail)}&gt;</p>
        <p>A PDF report is attached, plus the full structured answers as JSON. To bring it into the Awin tracking folder:</p>
        <pre>python3 scripts/awin_sync.py import-onboarding-response --advertiser ${escapeHtml(advertiserSlug)} --file &lt;saved-json-path&gt; --materials-dir &lt;folder-with-saved-attachments&gt;</pre>
        <p>Uploaded files: ${uploadedFileNames.length ? escapeHtml(uploadedFileNames.join(', ')) : 'none'}</p>
      `,
      attachments,
    })
  } catch (error) {
    console.error('Partner onboarding: failed to send email', error)
    return Response.json({ error: 'Could not submit right now. Please try again later.' }, { status: 500 })
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

async function buildReportPdf(submission: Submission): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  const accent = '#0369a1'
  const heading = '#0f172a'
  const body = '#334155'

  doc.fillColor(accent).fontSize(20).font('Helvetica-Bold').text('BroadbandPicker', { continued: false })
  doc.fillColor(heading).fontSize(16).font('Helvetica-Bold').text(`Partner content questionnaire: ${submission.advertiserName}`)
  doc.fillColor(body).fontSize(9).font('Helvetica').text(`Submitted ${new Date(submission.submittedAt).toLocaleString('en-GB')}`)
  doc.moveDown(1)

  const section = (title: string) => {
    doc.moveDown(0.6)
    doc.fillColor(accent).fontSize(13).font('Helvetica-Bold').text(title)
    doc.moveTo(doc.x, doc.y + 2).lineTo(doc.page.width - doc.page.margins.right, doc.y + 2).strokeColor('#e2e8f0').stroke()
    doc.moveDown(0.4)
    doc.fillColor(body).fontSize(10).font('Helvetica')
  }

  const field = (label: string, value: string) => {
    if (!value) return
    doc.font('Helvetica-Bold').fillColor(heading).fontSize(10).text(label, { continued: false })
    doc.font('Helvetica').fillColor(body).fontSize(10).text(value)
    doc.moveDown(0.3)
  }

  section('Contact')
  field('Name', submission.contact.name)
  field('Email', submission.contact.email)
  field('Role', submission.contact.role)
  field('Company website', submission.contact.companyWebsite)

  section('Packages & pricing')
  const packages = submission.packages as Record<string, string>[]
  if (packages.length) {
    packages.forEach((p, i) => {
      doc.font('Helvetica-Bold').fillColor(heading).fontSize(10).text(`Package ${i + 1}: ${p.packageName || 'Unnamed'}`)
      doc.font('Helvetica').fillColor(body).fontSize(10).text(
        `${p.technology || ''} — Download ${p.download || '?'} Mbps / Upload ${p.upload || '?'} Mbps — £${p.monthlyPrice || '?'}/mo — ${p.contractLength || '?'} month contract — Setup fee £${p.setupFee || '0'}`
      )
      doc.moveDown(0.3)
    })
  } else {
    doc.text('Not provided.')
  }

  section('Coverage & footprint')
  field('Areas covered', submission.coverage.areas)
  field('Coverage %', submission.coverage.coveragePercent)
  field('Coverage checker', submission.coverage.checkerUrl)

  section('Positioning')
  field('Best for', (submission.positioning.targetSegments as string[]).join(', '))
  field('Highlights', submission.positioning.highlights)
  field('Price-rise policy', submission.positioning.priceRisePolicy)

  section('Trust & evidence')
  field('Trustpilot', [submission.trust.trustpilotScore, submission.trust.trustpilotUrl].filter(Boolean).join(' — '))
  field('Service stats', submission.trust.serviceStats)
  field('Awards', submission.trust.awards)

  section('Deals & exclusives')
  field('Exclusive offer', submission.deals.exclusiveOffer)
  field('Reward / cashback', submission.deals.rewardOrCashback)

  section('How to promote them')
  field('Approved channels', (submission.promotion.approvedChannels as string[]).join(', '))
  field('Disclosure requirement', submission.promotion.disclosureRequirement)
  field('Brand asset rules', submission.promotion.brandAssetRules)
  field('Posting frequency notes', submission.promotion.postingFrequencyNotes)

  if (submission.additionalNotes) {
    section('Anything else')
    doc.text(submission.additionalNotes)
  }

  doc.end()
  return done
}
