import crypto from 'crypto'
import { providers } from '@/data/providers'
import { dealId } from '@/lib/dealId'
import { cheapestEntryDeals, findDealById } from '@/lib/deals'
import { brandedEmailHtml, escapeHtml, mailConfigured, sendBrandedMail } from '@/lib/mail'
import { hashIp, normaliseEmail } from '@/lib/newsletter'
import { ALERT_CONSENT_VERSION, CONTRACT_CONSENT_TEXT, PRICE_DROP_CONSENT_TEXT } from '@/lib/newsletterCopy'
import { SITE_URL } from '@/lib/siteSchema'
import { createServerClient } from '@/lib/supabase'

/**
 * Alerts a visitor sets up for themselves:
 *  - price-drop watches on saved deals (table deal_watches)
 *  - one contract-end reminder (table contract_reminders)
 *
 * Both are double opt-in: rows start 'pending' and only a click on the
 * emailed link makes them 'active'. Each signup gets one random token that
 * confirms and later cancels exactly the rows it created. The daily cron
 * (/api/alerts/daily) does the sending.
 */

export type AlertKind = 'price' | 'contract'

/** Swappable for tests (scripts/test_alerts.ts); production always uses these defaults. */
const deps = {
  db: () => createServerClient(),
  send: sendBrandedMail,
  mailReady: mailConfigured,
}

export function setAlertDepsForTests(overrides: Partial<typeof deps>) {
  Object.assign(deps, overrides)
}

const CONFIRM_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const MAX_WATCHES_PER_SIGNUP = 12
export const REMIND_DAYS_BEFORE = 30

function newToken(): string {
  return crypto.randomBytes(24).toString('base64url')
}

function isToken(value: string | undefined): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{32}$/.test(value)
}

export function alertConfirmUrl(kind: AlertKind, token: string): string {
  return `${SITE_URL}/alerts/confirm-alert?kind=${kind}&token=${encodeURIComponent(token)}`
}

/** GET shows the cancel page; POST supports one-click unsubscribe from mail clients. */
export function alertCancelUrl(kind: AlertKind, token: string): string {
  return `${SITE_URL}/api/alerts/cancel?kind=${kind}&token=${encodeURIComponent(token)}`
}

function money(value: number): string {
  return `£${value.toFixed(2)}`
}

function ukDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London',
  })
}

function todayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

async function send(options: {
  to: string
  subject: string
  title: string
  preheader: string
  bodyHtml: string
  text: string
  cancelUrl?: string
}) {
  await deps.send({
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: brandedEmailHtml({
      title: options.title,
      preheader: options.preheader,
      bodyHtml: options.bodyHtml,
      unsubscribeUrl: options.cancelUrl,
    }),
    unsubscribeUrl: options.cancelUrl,
  })
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">${escapeHtml(label)}</a></p>`

// ---------------------------------------------------------------------------
// Price-drop watches
// ---------------------------------------------------------------------------

export type PriceWatchRequest = {
  email: string
  dealIds: string[]
  ip?: string
  sourcePath?: string
}

export type AlertRequestResult =
  | { ok: true; count: number }
  | { ok: false; status: number; error: string }

export async function requestPriceWatch(input: PriceWatchRequest): Promise<AlertRequestResult> {
  const email = normaliseEmail(input.email)
  const deals = [...new Set(input.dealIds)]
    .slice(0, MAX_WATCHES_PER_SIGNUP)
    .map((id) => findDealById(id))
    .filter((deal): deal is NonNullable<typeof deal> => Boolean(deal))
  if (deals.length === 0) {
    return { ok: false, status: 400, error: 'None of these deals are listed any more. Save a current deal and try again.' }
  }

  const client = deps.db()
  const token = newToken()
  const now = new Date().toISOString()
  const ids = deals.map((deal) => dealId(deal.provider.slug, deal.packageName))
  const { data: existing } = await client
    .from('deal_watches')
    .select('deal_id,status')
    .eq('email', email)
    .in('deal_id', ids)
  const alreadyActive = new Set((existing || []).filter((row) => row.status === 'active').map((row) => row.deal_id as string))

  const fresh = deals.filter((deal) => !alreadyActive.has(dealId(deal.provider.slug, deal.packageName)))
  if (fresh.length === 0) {
    return { ok: true, count: 0 }
  }

  const rows = fresh.map((deal) => ({
    email,
    deal_id: dealId(deal.provider.slug, deal.packageName),
    provider_slug: deal.provider.slug,
    package_name: deal.packageName,
    price_at_save: deal.monthlyPrice,
    last_price: deal.monthlyPrice,
    status: 'pending',
    token,
    consent_at: now,
    consent_text: PRICE_DROP_CONSENT_TEXT,
    consent_version: ALERT_CONSENT_VERSION,
    source_url: input.sourcePath ? `${SITE_URL}${input.sourcePath}` : null,
    ip_hash: hashIp(input.ip),
    created_at: now,
    confirmed_at: null,
    ended_at: null,
  }))
  const { error } = await client.from('deal_watches').upsert(rows, { onConflict: 'email,deal_id' })
  if (error) {
    console.error('deal_watches upsert', error.message)
    return { ok: false, status: 500, error: 'We could not save your alert just now. Please try again later.' }
  }

  const list = fresh.map((deal) => `${deal.packageName} (now ${money(deal.monthlyPrice)}/month)`)
  const confirm = alertConfirmUrl('price', token)
  await send({
    to: email,
    subject: 'Confirm your BroadbandPicker price-drop alert',
    title: 'Confirm your price-drop alert',
    preheader: 'One click and we will email you if these deals get cheaper.',
    text: [
      'You asked BroadbandPicker to email you if these saved deals drop in price:',
      '',
      ...list.map((line) => `- ${line}`),
      '',
      `Confirm: ${confirm}`,
      '',
      'We will not email you until you confirm. If you did not ask for this, ignore this message.',
    ].join('\n'),
    bodyHtml: `<p style="margin:0 0 12px;">You asked BroadbandPicker to email you if these saved deals drop in price:</p>
      <ul style="margin:0 0 12px;padding-left:20px;">${list.map((line) => `<li style="margin:0 0 6px;">${escapeHtml(line)}</li>`).join('')}</ul>
      ${button(confirm, 'Confirm my alert')}
      <p style="margin:0;font-size:13px;color:#64748b;">We will not email you until you confirm. If you did not ask for this, ignore this message.</p>`,
  })
  return { ok: true, count: fresh.length }
}

// ---------------------------------------------------------------------------
// Contract-end reminders
// ---------------------------------------------------------------------------

export type ContractReminderRequest = {
  email: string
  providerSlug?: string
  providerName?: string
  contractEnd: string
  ip?: string
  sourcePath?: string
}

export function validateContractEnd(value: string, now = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Enter the date your contract ends.'
  const end = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(end.getTime())) return 'Enter a real date.'
  const today = todayIso(now)
  if (value <= today) return 'That date has already passed, so you may be out of contract now. Compare deals today instead.'
  if (value > addDays(today, 3 * 366)) return 'Enter a date within the next three years.'
  return null
}

export function remindOnFor(contractEnd: string, now = new Date()): string {
  const target = addDays(contractEnd, -REMIND_DAYS_BEFORE)
  const today = todayIso(now)
  return target < today ? today : target
}

export async function requestContractReminder(input: ContractReminderRequest): Promise<AlertRequestResult> {
  const email = normaliseEmail(input.email)
  const dateError = validateContractEnd(input.contractEnd)
  if (dateError) return { ok: false, status: 400, error: dateError }
  const provider = input.providerSlug ? providers.find((p) => p.slug === input.providerSlug) : undefined
  const providerName = (provider?.name || input.providerName || '').trim().slice(0, 60)
  if (!providerName) return { ok: false, status: 400, error: 'Choose your current provider.' }

  const client = deps.db()
  const token = newToken()
  const now = new Date().toISOString()
  const remindOn = remindOnFor(input.contractEnd)
  const { error } = await client.from('contract_reminders').insert({
    email,
    provider_slug: provider?.slug || null,
    provider_name: providerName,
    contract_end: input.contractEnd,
    remind_on: remindOn,
    status: 'pending',
    token,
    consent_at: now,
    consent_text: CONTRACT_CONSENT_TEXT,
    consent_version: ALERT_CONSENT_VERSION,
    source_url: input.sourcePath ? `${SITE_URL}${input.sourcePath}` : null,
    ip_hash: hashIp(input.ip),
  })
  if (error) {
    console.error('contract_reminders insert', error.message)
    return { ok: false, status: 500, error: 'We could not save your reminder just now. Please try again later.' }
  }

  const confirm = alertConfirmUrl('contract', token)
  const endLabel = ukDate(input.contractEnd)
  const remindLabel = ukDate(remindOn)
  await send({
    to: email,
    subject: 'Confirm your broadband contract reminder',
    title: 'Confirm your contract reminder',
    preheader: `We will remind you on ${remindLabel}, before your ${providerName} contract ends.`,
    text: [
      `You asked BroadbandPicker to remind you before your ${providerName} contract ends on ${endLabel}.`,
      `We will send one email on ${remindLabel}.`,
      '',
      `Confirm: ${confirm}`,
      '',
      'We will not email you until you confirm. If you did not ask for this, ignore this message.',
    ].join('\n'),
    bodyHtml: `<p style="margin:0 0 12px;">You asked BroadbandPicker to remind you before your <strong>${escapeHtml(providerName)}</strong> contract ends on <strong>${escapeHtml(endLabel)}</strong>.</p>
      <p style="margin:0 0 12px;">We will send one email on ${escapeHtml(remindLabel)}, with deals worth comparing.</p>
      ${button(confirm, 'Confirm my reminder')}
      <p style="margin:0;font-size:13px;color:#64748b;">We will not email you until you confirm. If you did not ask for this, ignore this message.</p>`,
  })
  return { ok: true, count: 1 }
}

// ---------------------------------------------------------------------------
// Confirm / cancel
// ---------------------------------------------------------------------------

export type TokenOutcome = 'confirmed' | 'already' | 'cancelled' | 'invalid' | 'expired' | 'unavailable'

function tableFor(kind: AlertKind) {
  return kind === 'price' ? 'deal_watches' : 'contract_reminders'
}

export async function confirmAlert(kind: AlertKind, token: string | undefined): Promise<TokenOutcome> {
  if (!isToken(token)) return 'invalid'
  let client
  try {
    client = deps.db()
  } catch {
    return 'unavailable'
  }
  const table = tableFor(kind)
  const { data, error } = await client.from(table).select('status,created_at').eq('token', token)
  if (error) return 'unavailable'
  if (!data || data.length === 0) return 'invalid'
  if (data.every((row) => row.status === 'cancelled')) return 'cancelled'
  if (data.every((row) => row.status !== 'pending')) return 'already'
  const created = Math.min(...data.map((row) => new Date(row.created_at as string).getTime()))
  if (Date.now() - created > CONFIRM_WINDOW_MS) return 'expired'
  const { error: updateError } = await client
    .from(table)
    .update({ status: 'active', confirmed_at: new Date().toISOString() })
    .eq('token', token)
    .eq('status', 'pending')
  return updateError ? 'unavailable' : 'confirmed'
}

export async function cancelAlert(kind: AlertKind, token: string | undefined): Promise<TokenOutcome> {
  if (!isToken(token)) return 'invalid'
  let client
  try {
    client = deps.db()
  } catch {
    return 'unavailable'
  }
  const table = tableFor(kind)
  const { data, error } = await client.from(table).select('status').eq('token', token)
  if (error) return 'unavailable'
  if (!data || data.length === 0) return 'invalid'
  const { error: updateError } = await client
    .from(table)
    .update({ status: 'cancelled' })
    .eq('token', token)
    .in('status', ['pending', 'active'])
  return updateError ? 'unavailable' : 'cancelled'
}

// ---------------------------------------------------------------------------
// Daily run
// ---------------------------------------------------------------------------

type WatchRow = {
  id: string
  email: string
  deal_id: string
  provider_slug: string
  package_name: string
  last_price: number | string
  token: string
}

type ReminderRow = {
  id: string
  email: string
  provider_slug: string | null
  provider_name: string
  contract_end: string
  token: string
}

export type DailyRunResult = {
  runDate: string
  skipped: string | null
  priceDropEmails: number
  remindersSent: number
  ended: number
  failed: number
}

async function claimRun(runDate: string): Promise<'ok' | 'already'> {
  const client = deps.db()
  const { error } = await client.from('alert_runs').insert({ run_date: runDate })
  if (!error) return 'ok'
  if (error.code === '23505') return 'already'
  throw new Error(`alert_runs insert: ${error.message}`)
}

function priceDropEmail(email: string, drops: { row: WatchRow; was: number; now: number; name: string }[]) {
  const first = drops[0]
  const subject = drops.length === 1
    ? `Price drop: ${first.name} is now ${money(first.now)}/month`
    : `${drops.length} of your saved broadband deals dropped in price`
  const cancel = alertCancelUrl('price', first.row.token)
  const rowsHtml = drops.map((d) => {
    const href = `${SITE_URL}/providers/${d.row.provider_slug}?utm_source=alerts&utm_medium=email&utm_campaign=price_drop`
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;"><a href="${escapeHtml(href)}" style="color:#0f172a;font-weight:700;text-decoration:none;">${escapeHtml(d.name)}</a></td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;"><span style="color:#94a3b8;text-decoration:line-through;">${money(d.was)}</span> <strong style="color:#15803d;">${money(d.now)}</strong>/mo</td>
    </tr>`
  }).join('')
  return {
    to: email,
    subject,
    title: drops.length === 1 ? 'A deal you saved got cheaper' : 'Deals you saved got cheaper',
    preheader: `${first.name}: was ${money(first.was)}, now ${money(first.now)} a month.`,
    text: [
      'Deals you saved on BroadbandPicker dropped in price:',
      '',
      ...drops.map((d) => `- ${d.name}: was ${money(d.was)}, now ${money(d.now)} a month (${SITE_URL}/providers/${d.row.provider_slug})`),
      '',
      'These are national from-prices. Check the price at your address before you order.',
      `Your saved deals: ${SITE_URL}/saved-deals`,
      `Stop these alerts: ${cancel}`,
    ].join('\n'),
    bodyHtml: `<p style="margin:0 0 12px;">Good news. Deals you saved on BroadbandPicker dropped in price:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;">${rowsHtml}</table>
      <p style="margin:16px 0 0;font-size:13px;color:#64748b;">These are national from-prices. Check the price at your address before you order.</p>
      ${button(`${SITE_URL}/saved-deals?utm_source=alerts&utm_medium=email&utm_campaign=price_drop`, 'See my saved deals')}`,
    cancelUrl: cancel,
  }
}

function reminderEmail(row: ReminderRow) {
  const endLabel = ukDate(row.contract_end)
  const cancel = alertCancelUrl('contract', row.token)
  const deals = cheapestEntryDeals(5)
  const utm = 'utm_source=alerts&utm_medium=email&utm_campaign=contract_end'
  const dealRows = deals.map((deal) => `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><a href="${SITE_URL}/providers/${deal.provider.slug}?${utm}" style="color:#0f172a;font-weight:700;text-decoration:none;">${escapeHtml(deal.provider.name)}</a><br><span style="font-size:13px;color:#64748b;">${deal.download} Mbps, ${deal.contractLength}-month contract</span></td>
      <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;">from <strong>${money(deal.monthlyPrice)}</strong>/mo</td>
    </tr>`).join('')
  return {
    to: row.email,
    subject: `Your ${row.provider_name} contract ends on ${endLabel}`,
    title: `Your ${row.provider_name} contract ends soon`,
    preheader: 'Out-of-contract prices are usually higher. Here is what to compare before then.',
    text: [
      `Your ${row.provider_name} broadband contract ends on ${endLabel}.`,
      '',
      'When a contract ends, providers usually move you to a higher out-of-contract price. Ofcom rules mean your provider must also write to you 10 to 40 days before the end date with its best deals.',
      '',
      'Cheapest entry prices on BroadbandPicker today:',
      ...deals.map((deal) => `- ${deal.provider.name}: from ${money(deal.monthlyPrice)}/month, ${deal.download} Mbps (${SITE_URL}/providers/${deal.provider.slug})`),
      '',
      `Compare providers: ${SITE_URL}/compare`,
      `How to switch: ${SITE_URL}/guides/how-to-switch-broadband-uk`,
      '',
      'This is the only reminder we will send for this contract.',
    ].join('\n'),
    bodyHtml: `<p style="margin:0 0 12px;">Your <strong>${escapeHtml(row.provider_name)}</strong> broadband contract ends on <strong>${escapeHtml(endLabel)}</strong>.</p>
      <p style="margin:0 0 12px;">When a contract ends, providers usually move you to a higher out-of-contract price. Ofcom rules mean your provider must also write to you 10 to 40 days before the end date with its best deals, so you can use those to haggle or switch.</p>
      <p style="margin:16px 0 6px;font-weight:700;">Cheapest entry prices on BroadbandPicker today</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;">${dealRows}</table>
      <p style="margin:12px 0 0;font-size:13px;color:#64748b;">National from-prices. Availability and final price depend on your address.</p>
      ${button(`${SITE_URL}/compare?${utm}`, 'Compare providers')}
      <p style="margin:0 0 6px;"><a href="${SITE_URL}/guides/how-to-switch-broadband-uk?${utm}" style="color:#0284c7;">How to switch broadband</a> · <a href="${SITE_URL}/guides/broadband-deals-with-no-mid-contract-price-rise?${utm}" style="color:#0284c7;">Deals with no mid-contract price rise</a></p>
      <p style="margin:12px 0 0;font-size:13px;color:#64748b;">This is the only reminder we will send for this contract.</p>`,
    cancelUrl: cancel,
  }
}

export async function runDailyAlerts(options: { force?: boolean; now?: Date } = {}): Promise<DailyRunResult> {
  const now = options.now ?? new Date()
  const runDate = todayIso(now)
  const result: DailyRunResult = { runDate, skipped: null, priceDropEmails: 0, remindersSent: 0, ended: 0, failed: 0 }
  if (!deps.mailReady()) return { ...result, skipped: 'mail_not_configured' }

  const client = deps.db()
  if (!options.force && (await claimRun(runDate)) === 'already') {
    return { ...result, skipped: 'already_ran_today' }
  }

  // Price drops: one email per address, listing every watched deal that got cheaper.
  const { data: watches, error: watchError } = await client
    .from('deal_watches')
    .select('id,email,deal_id,provider_slug,package_name,last_price,token')
    .eq('status', 'active')
    .limit(5000)
  if (watchError) throw new Error(`deal_watches select: ${watchError.message}`)

  const dropsByEmail = new Map<string, { row: WatchRow; was: number; now: number; name: string }[]>()
  for (const row of (watches || []) as WatchRow[]) {
    const deal = findDealById(row.deal_id)
    if (!deal || deal.provider.retiredDate) {
      await client.from('deal_watches').update({ status: 'ended', ended_at: now.toISOString() }).eq('id', row.id)
      result.ended += 1
      continue
    }
    const was = Number(row.last_price)
    const current = deal.monthlyPrice
    if (Math.abs(current - was) < 0.005) continue
    if (current < was) {
      const list = dropsByEmail.get(row.email) || []
      list.push({ row, was, now: current, name: deal.packageName })
      dropsByEmail.set(row.email, list)
    } else {
      // Track rises silently so a later fall back is reported against the real last price.
      await client.from('deal_watches').update({ last_price: current }).eq('id', row.id)
    }
  }

  for (const [email, drops] of dropsByEmail) {
    try {
      await send(priceDropEmail(email, drops))
      result.priceDropEmails += 1
      for (const drop of drops) {
        await client
          .from('deal_watches')
          .update({ last_price: drop.now, last_notified_at: now.toISOString() })
          .eq('id', drop.row.id)
      }
    } catch (error) {
      result.failed += 1
      console.error('Price-drop email failed', error)
    }
  }

  // Contract-end reminders due today or earlier.
  const { data: reminders, error: reminderError } = await client
    .from('contract_reminders')
    .select('id,email,provider_slug,provider_name,contract_end,token')
    .eq('status', 'active')
    .lte('remind_on', runDate)
    .limit(2000)
  if (reminderError) throw new Error(`contract_reminders select: ${reminderError.message}`)

  for (const row of (reminders || []) as ReminderRow[]) {
    try {
      await send(reminderEmail(row))
      await client.from('contract_reminders').update({ status: 'sent', sent_at: now.toISOString() }).eq('id', row.id)
      result.remindersSent += 1
    } catch (error) {
      result.failed += 1
      console.error('Contract reminder failed', error)
    }
  }

  await client.from('alert_runs').upsert({
    run_date: runDate,
    finished_at: new Date().toISOString(),
    price_drop_sent: result.priceDropEmails,
    reminders_sent: result.remindersSent,
    failed: result.failed,
  }, { onConflict: 'run_date' })
  return result
}
