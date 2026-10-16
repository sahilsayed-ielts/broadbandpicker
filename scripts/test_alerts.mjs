#!/usr/bin/env node
/**
 * End-to-end test of lib/alerts.ts with an in-memory Supabase fake and a mail
 * catcher: price-drop signup -> confirm -> price drop email -> cancel, and
 * contract reminder signup -> confirm -> due reminder -> sent once.
 *
 *   node scripts/test_alerts.mjs
 *
 * No network, no real database, no real email.
 */
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jiti = createJiti(import.meta.url, { alias: { '@': root }, interopDefault: true })

// ---- in-memory Supabase fake (only the query shapes lib/alerts.ts uses) ----
const tables = { deal_watches: [], contract_reminders: [], alert_runs: [] }
const unique = { deal_watches: ['email', 'deal_id'], alert_runs: ['run_date'] }
let idSeq = 0

function builder(table) {
  const filters = []
  let op = 'select'
  let payload = null
  let conflict = null
  const api = {
    select() { return api },
    eq(col, val) { filters.push((r) => r[col] === val); return api },
    in(col, vals) { filters.push((r) => vals.includes(r[col])); return api },
    lte(col, val) { filters.push((r) => r[col] <= val); return api },
    limit() { return api },
    insert(rows) { op = 'insert'; payload = [].concat(rows); return api },
    upsert(rows, opts) { op = 'upsert'; payload = [].concat(rows); conflict = opts?.onConflict?.split(','); return api },
    update(vals) { op = 'update'; payload = vals; return api },
    then(resolve) { resolve(run()) },
  }
  function run() {
    const rows = tables[table]
    if (op === 'select') return { data: rows.filter((r) => filters.every((f) => f(r))).map((r) => ({ ...r })), error: null }
    if (op === 'update') {
      rows.filter((r) => filters.every((f) => f(r))).forEach((r) => Object.assign(r, payload))
      return { data: null, error: null }
    }
    for (const row of payload) {
      const keys = conflict ?? unique[table]
      const existing = keys && rows.find((r) => keys.every((k) => r[k] === row[k]))
      if (existing && op === 'insert') return { data: null, error: { code: '23505', message: 'duplicate' } }
      if (existing) Object.assign(existing, row)
      else rows.push({ id: `id-${++idSeq}`, created_at: new Date().toISOString(), ...row })
    }
    return { data: null, error: null }
  }
  return api
}
const fakeDb = { from: (table) => builder(table) }

const outbox = []
const fakeSend = async (msg) => { outbox.push(msg) }

const alerts = await jiti.import(path.join(root, 'lib/alerts.ts'))
const { getAllDeals } = await jiti.import(path.join(root, 'lib/deals.ts'))
const { dealId } = await jiti.import(path.join(root, 'lib/dealId.ts'))
const { providers } = await jiti.import(path.join(root, 'data/providers.ts'))
alerts.setAlertDepsForTests({ db: () => fakeDb, send: fakeSend, mailReady: () => true })

const tokenFrom = (msg) => decodeURIComponent(/token=([A-Za-z0-9_%-]+)/.exec(msg.text)[1])
let passed = 0
const ok = (label) => { passed += 1; console.log(`  ok  ${label}`) }

// ---------------------------------------------------------------- price drop
console.log('Price-drop alerts')
const deal = getAllDeals().find((d) => d.provider.slug === 'bt')
const id = dealId(deal.provider.slug, deal.packageName)

let res = await alerts.requestPriceWatch({ email: 'Test@Example.com', dealIds: [id, 'nope::missing'] })
assert.deepEqual(res, { ok: true, count: 1 }); ok('signup accepts a real deal and ignores an unknown id')
assert.equal(tables.deal_watches[0].status, 'pending'); ok('row starts pending (double opt-in)')
assert.equal(tables.deal_watches[0].email, 'test@example.com'); ok('email normalised')
assert.equal(outbox.length, 1); assert.match(outbox[0].subject, /Confirm/); ok('confirmation email sent')
const priceToken = tokenFrom(outbox[0])

let run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.priceDropEmails, 0); ok('pending watch is never emailed')

assert.equal(await alerts.confirmAlert('price', 'x'.repeat(32)), 'invalid'); ok('unknown token rejected')
assert.equal(await alerts.confirmAlert('price', priceToken), 'confirmed'); ok('confirm activates watch')
assert.equal(await alerts.confirmAlert('price', priceToken), 'already'); ok('second confirm is a no-op')

res = await alerts.requestPriceWatch({ email: 'test@example.com', dealIds: [id] })
assert.deepEqual(res, { ok: true, count: 0 }); ok('re-subscribing an active watch sends nothing new')

run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.priceDropEmails, 0); ok('no email when price unchanged')

const bt = providers.find((p) => p.slug === 'bt')
// Deal prices come from the checked package when one exists, else the entry price.
const pkg = bt.packages?.find((k) => `${bt.name} ${k.packageName}` === deal.packageName)
const setPrice = (v) => { if (pkg) pkg.monthlyPrice = v; else bt.monthlyPriceFrom = v }
const original = pkg ? pkg.monthlyPrice : bt.monthlyPriceFrom
outbox.length = 0
setPrice(original - 2)
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.priceDropEmails, 1); ok('price drop detected')
assert.match(outbox[0].subject, /Price drop/); assert.match(outbox[0].text, new RegExp(`now £${(original - 2).toFixed(2)}`)); ok('email names the new price')
assert.ok(outbox[0].unsubscribeUrl.includes('/api/alerts/cancel?kind=price')); ok('email carries one-click cancel URL')
assert.equal(Number(tables.deal_watches[0].last_price), original - 2); ok('last_price updated')

run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.priceDropEmails, 0); ok('same drop is not emailed twice')

setPrice(original + 1)
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.priceDropEmails, 0); assert.equal(Number(tables.deal_watches[0].last_price), original + 1); ok('rise tracked silently')
setPrice(original)
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.priceDropEmails, 1); ok('fall back after a rise is reported')

assert.equal(await alerts.cancelAlert('price', priceToken), 'cancelled'); ok('cancel works')
setPrice(original - 5)
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.priceDropEmails, 1 - 1); ok('cancelled watch gets no email')
setPrice(original)

// ------------------------------------------------------- contract reminders
console.log('Contract reminders')
const today = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const plus = (n) => { const d = new Date(today); d.setUTCDate(d.getUTCDate() + n); return iso(d) }

assert.ok(alerts.validateContractEnd(iso(today))); ok('today is rejected as an end date')
assert.ok(alerts.validateContractEnd(plus(4 * 365))); ok('more than three years ahead is rejected')
assert.equal(alerts.remindOnFor(plus(90)), plus(60)); ok('reminder is 30 days before the end date')
assert.equal(alerts.remindOnFor(plus(10)), iso(today)); ok('end date under 30 days away reminds today')

outbox.length = 0
res = await alerts.requestContractReminder({ email: 'r@example.com', providerSlug: 'sky', contractEnd: plus(10) })
assert.equal(res.ok, true); ok('reminder signup accepted')
res = await alerts.requestContractReminder({ email: 'r@example.com', contractEnd: plus(10) })
assert.equal(res.ok, false); ok('provider is required')
const reminderToken = tokenFrom(outbox[0])
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.remindersSent, 0); ok('unconfirmed reminder not sent')
assert.equal(await alerts.confirmAlert('contract', reminderToken), 'confirmed'); ok('reminder confirmed')
outbox.length = 0
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.remindersSent, 1); assert.match(outbox[0].subject, /Sky contract ends on/); ok('due reminder sent')
assert.match(outbox[0].text, /10 to 40 days/); ok('reminder explains the Ofcom notice')
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.remindersSent, 0); ok('reminder sent exactly once')

await alerts.requestContractReminder({ email: 'later@example.com', providerName: 'Some Altnet', contractEnd: plus(200) })
await alerts.confirmAlert('contract', tokenFrom(outbox[outbox.length - 1]))
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.remindersSent, 0); ok('future reminder waits for its date')

// ------------------------------------------------------- once-a-day guard
console.log('Daily guard')
tables.alert_runs.length = 0
run = await alerts.runDailyAlerts()
assert.equal(run.skipped, null); ok('first cron run of the day proceeds')
run = await alerts.runDailyAlerts()
assert.equal(run.skipped, 'already_ran_today'); ok('second cron run the same day is skipped')
alerts.setAlertDepsForTests({ mailReady: () => false })
run = await alerts.runDailyAlerts({ force: true })
assert.equal(run.skipped, 'mail_not_configured'); ok('nothing runs without domain mail')

console.log(`\n${passed} checks passed`)
