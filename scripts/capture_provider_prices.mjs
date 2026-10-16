// Capture provider pricing pages for the monthly price re-check.
//
//   node scripts/capture_provider_prices.mjs
//
// Renders each official pricing page in headless Chrome (many build prices in
// the browser, so plain fetches see nothing), dismisses cookie banners, clicks
// contract tabs where needed and saves the visible text to
// docs/price-checks/<date>/<provider>-<n>.txt. A person then reads the text and
// updates data/provider-price-checks.json, then runs `npm run index:build`.
// Never copy a price that is not on the provider's own page.
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'docs', 'price-checks', new Date().toISOString().slice(0, 10))
mkdirSync(OUT, { recursive: true })
// Pages that showed real package prices on 16 October 2026. Providers marked
// "postcode" hide prices until an address is entered, so they need a manual check.
const TARGETS = {
  bt: ['https://www.bt.com/broadband/deals'],
  'virgin-media': ['https://www.virginmedia.com/broadband'],
  'now-broadband': ['https://www.nowtv.com/broadband'],
  hyperoptic: ['https://www.hyperoptic.com/'],
  'community-fibre': ['https://www.communityfibre.co.uk/', { url: 'https://www.communityfibre.co.uk/', click: '12 Months' }],
  toob: ['https://www.toob.co.uk/'],
  zzoomm: ['https://www.zzoomm.com/'],
  'highland-broadband': ['https://highlandbroadband.com/broadband/packages-pricing/'],
  'connect-fibre': ['https://www.connectfibre.co.uk/price-book'],
  'pine-media': ['https://pinemedia.net/'],
  giffgaff: ['https://www.giffgaff.com/broadband'],
  youfibre: ['https://www.youfibre.com/'],
  onestream: ['https://onestream.co.uk/'],
  cuckoo: ['https://cuckoo.co/legal/price-list'],
  'national-broadband': ['https://www.national-broadband.co.uk/'],
  vodafone: ['https://www.vodafone.co.uk/broadband'],
  // postcode or bot wall on 16 Oct 2026: sky, ee, plusnet, talktalk, zen-internet, trooli, gigaclear
}

const PORT = 9334
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--disable-gpu', '--window-size=1366,2000',
  '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'bbp-prices-'))}`, 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let wsUrl
for (let i = 0; i < 50 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl } catch { await sleep(200) }
}
const ws = new WebSocket(wsUrl)
await new Promise((r) => ws.addEventListener('open', r))
let seq = 0
const pending = new Map()
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } })
const send = (method, params = {}) => new Promise((resolve) => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })) })
const evaluate = async (expression, ms = 15000) => { const r = await Promise.race([send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }), sleep(ms).then(() => null)]); return r?.result?.result?.value }
await send('Page.enable')
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: true }) })
import { existsSync } from 'node:fs'

for (const [slug, urls] of Object.entries(TARGETS)) {
  for (const [i, target] of urls.entries()) {
    const url = typeof target === 'string' ? target : target.url
    const click = typeof target === 'string' ? null : target.click
    if (existsSync(path.join(OUT, `${slug}-${i}.txt`))) continue
    try {
      await Promise.race([send('Page.navigate', { url }), sleep(20000)])
      await sleep(7000)
      // dismiss common cookie banners, then scroll to trigger lazy sections
      await evaluate(`(() => { const t = /^(accept( all)?( cookies)?|allow all|agree|i agree|ok|got it)$/i; [...document.querySelectorAll('button, a')].filter(b => t.test((b.innerText||'').trim())).slice(0,2).forEach(b => b.click()) })()`)
      await sleep(1500)
      if (click) { await evaluate(`(() => { const el = [...document.querySelectorAll('button, a, label, [role=tab], span, div')].reverse().find(e => (e.innerText||'').trim() === ${JSON.stringify(click)}); if (el) el.click() })()`); await sleep(2500) }
      await evaluate(`(async () => { for (let y = 0; y < Math.min(document.body.scrollHeight, 30000); y += 900) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 250)) } })()`)
      await sleep(2000)
      const text = await evaluate(`location.href + '\\n' + document.title + '\\n\\n' + document.body.innerText`)
      writeFileSync(path.join(OUT, `${slug}-${i}.txt`), text || '')
      console.log(`${slug}-${i} ${(text || '').length} chars ${url}`)
    } catch (e) {
      console.log(`${slug}-${i} FAILED ${url} ${e.message}`)
    }
  }
}
ws.close(); chrome.kill(); process.exit(0)
