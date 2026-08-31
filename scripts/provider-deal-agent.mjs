import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const outputPath = path.join(repoRoot, 'data', 'provider-live-deals.json')
const reportPath = path.join(repoRoot, 'docs', 'provider-deal-sync-report.md')

const providerConfigs = [
  ['bt', 'BT', 'https://www.bt.com/broadband'],
  ['sky', 'Sky', 'https://www.sky.com/shop/broadband'],
  ['virgin-media', 'Virgin Media', 'https://www.virginmedia.com/broadband'],
  ['ee', 'EE', 'https://ee.co.uk/broadband'],
  ['talktalk', 'TalkTalk', 'https://www.talktalk.co.uk/broadband'],
  ['plusnet', 'Plusnet', 'https://www.plus.net/broadband/'],
  ['vodafone', 'Vodafone', 'https://www.vodafone.co.uk/broadband'],
  ['now-broadband', 'NOW Broadband', 'https://www.nowtv.com/broadband'],
  ['hyperoptic', 'Hyperoptic', 'https://www.hyperoptic.com/'],
  ['community-fibre', 'Community Fibre', 'https://www.communityfibre.co.uk/'],
  ['zen-internet', 'Zen Internet', 'https://www.zen.co.uk/broadband'],
  ['toob', 'Toob', 'https://www.toob.co.uk/'],
].map(([slug, name, sourceUrl]) => ({
  slug,
  name,
  sourceUrl,
  affiliateUrl: sourceUrl,
  sourceLabel: `${name} official broadband deals page`,
}))

const isDryRun = process.argv.includes('--dry-run')
const providerFilterArg = process.argv.find((arg) => arg.startsWith('--provider='))
const providerFilter = providerFilterArg?.split('=')[1] ?? null

const allowedTypes = new Set(['ADSL', 'FTTC', 'FTTP', 'Cable', '5G'])
const broadbandKeywords = ['broadband', 'fibre', 'fiber', 'full fibre', 'full fiber', 'gigabit', 'wifi']

function normalizeWhitespace(value) {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function parsePrice(value) {
  const match = value.match(/£\s?(\d+(?:\.\d{1,2})?)/i)
  return match ? Number.parseFloat(match[1]) : null
}

function parseSpeed(value) {
  const match = value.match(/(\d{1,4})\s?(Gbps|Gb|Mbps|Mb)\b/i)
  if (!match) return null

  const amount = Number.parseInt(match[1], 10)
  return match[2].toLowerCase().startsWith('g') ? amount * 1000 : amount
}

function parseContractLength(value) {
  const match = value.match(/(\d{1,2})\s*month/i)
  return match ? Number.parseInt(match[1], 10) : null
}

function parseSetupFee(value) {
  if (/\b(?:setup|activation|installation|upfront)\b/i.test(value) && /\bfree\b/i.test(value)) {
    return 0
  }

  const match = value.match(
    /\b(?:setup|activation|installation|upfront)\b[^£\d]{0,20}£\s?(\d+(?:\.\d{1,2})?)/i
  )
  return match ? Number.parseFloat(match[1]) : null
}

function inferType(value, download) {
  const lower = value.toLowerCase()
  if (lower.includes('cable')) return 'Cable'
  if (lower.includes('5g') || lower.includes('4g')) return '5G'
  if (lower.includes('fttp') || lower.includes('full fibre') || lower.includes('full fiber')) {
    return 'FTTP'
  }
  if (lower.includes('fttc') || lower.includes('superfast') || lower.includes('part fibre')) {
    return 'FTTC'
  }
  if (lower.includes('adsl') || lower.includes('standard broadband')) return 'ADSL'
  if (download >= 100) return 'FTTP'
  if (download >= 30) return 'FTTC'
  return 'ADSL'
}

function inferUpload(download, type, sourceText) {
  const explicit = sourceText.match(/upload[^0-9]{0,20}(\d{1,4})\s?(?:Mb|Mbps|Gb|Gbps)\b/i)
  if (explicit) {
    const amount = Number.parseInt(explicit[1], 10)
    return /gb/i.test(explicit[0]) ? amount * 1000 : amount
  }

  if (type === 'FTTP') {
    if (download >= 900) return 110
    if (download >= 500) return 75
    if (download >= 150) return 30
    return 20
  }

  if (type === 'Cable') {
    if (download >= 1000) return 104
    if (download >= 500) return 52
    if (download >= 250) return 36
    return 20
  }

  if (type === 'FTTC') {
    if (download >= 70) return 19
    if (download >= 60) return 17
    return 9
  }

  if (type === '5G') return 20
  return 1
}

function looksBroadbandRelated(value) {
  const lower = value.toLowerCase()
  return broadbandKeywords.some((keyword) => lower.includes(keyword))
}

function collectJsonTextCandidates(node, candidates = []) {
  if (!node) return candidates

  if (typeof node === 'string') {
    const cleaned = normalizeWhitespace(node)
    if (cleaned.length >= 24 && cleaned.length <= 220 && looksBroadbandRelated(cleaned)) {
      candidates.push(cleaned)
    }
    return candidates
  }

  if (Array.isArray(node)) {
    node.forEach((entry) => collectJsonTextCandidates(entry, candidates))
    return candidates
  }

  if (typeof node === 'object') {
    const directText = [
      node.name,
      node.title,
      node.description,
      node.summary,
      node.label,
      node.body,
      node.text,
      node.html,
    ]
      .filter(Boolean)
      .map((entry) => normalizeWhitespace(String(entry)))
      .filter((entry) => entry.length >= 24 && entry.length <= 220 && looksBroadbandRelated(entry))

    candidates.push(...directText)
    Object.values(node).forEach((value) => collectJsonTextCandidates(value, candidates))
  }

  return candidates
}

function extractScriptJsonBlocks(html) {
  const blocks = []
  const scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/gi

  for (const match of html.matchAll(scriptPattern)) {
    const content = match[1]?.trim()
    if (!content) continue

    if (content.startsWith('{') || content.startsWith('[')) {
      try {
        blocks.push(JSON.parse(content))
      } catch {}
    }
  }

  return blocks
}

function extractVisibleTextLines(html) {
  const $ = cheerio.load(html)
  $('script, style, noscript, svg').remove()

  return [...new Set(
    $('body')
      .text()
      .split('\n')
      .map((line) => normalizeWhitespace(line))
      .filter((line) => line.length >= 24 && line.length <= 220)
  )]
}

function pickPageDefaultContract(lines) {
  const lengths = lines
    .map((line) => parseContractLength(line))
    .filter((value) => typeof value === 'number')

  if (lengths.length === 0) return null

  const counts = new Map()
  for (const value of lengths) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function buildOfferFromText(text, sourceUrl, pageDefaultContractLength) {
  if (!looksBroadbandRelated(text)) return null

  const monthlyPrice = parsePrice(text)
  const download = parseSpeed(text)
  if (!monthlyPrice || !download) return null

  const contractLength = parseContractLength(text) ?? pageDefaultContractLength
  if (!contractLength) return null

  const type = inferType(text, download)
  if (!allowedTypes.has(type)) return null

  const setupFee = parseSetupFee(text) ?? 0
  const packageName = normalizeWhitespace(
    text
      .split(/(?:from £|£\s?\d)/i)[0]
      .replace(/[|•·]+/g, ' ')
  )

  return {
    packageName: packageName || `${download}Mbps broadband`,
    download,
    upload: inferUpload(download, type, text),
    type,
    monthlyPrice,
    contractLength,
    setupFee,
    sourceUrl,
  }
}

function validateOffer(offer) {
  return (
    offer.monthlyPrice >= 5 &&
    offer.monthlyPrice <= 100 &&
    offer.download >= 10 &&
    offer.download <= 2000 &&
    offer.contractLength >= 1 &&
    offer.contractLength <= 36
  )
}

function dedupeOffers(offers) {
  const unique = new Map()

  for (const offer of offers) {
    const key = [
      offer.packageName.toLowerCase(),
      offer.download,
      offer.monthlyPrice,
      offer.contractLength,
    ].join('|')

    if (!unique.has(key)) {
      unique.set(key, offer)
    }
  }

  return [...unique.values()].sort(
    (a, b) => a.monthlyPrice - b.monthlyPrice || a.download - b.download
  )
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent':
        'BroadbandPickerDealSyncBot/1.0 (+https://broadbandpicker.co.uk/how-we-review-broadband)',
      accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) {
    throw new Error(`Fetch failed with ${response.status} ${response.statusText}`)
  }

  return {
    finalUrl: response.url,
    html: await response.text(),
  }
}

async function loadExistingLiveDeals() {
  try {
    return JSON.parse(await fs.readFile(outputPath, 'utf8'))
  } catch {
    return { generatedAt: null, providers: {} }
  }
}

function extractOffersFromHtml(html, finalUrl) {
  const scriptBlocks = extractScriptJsonBlocks(html)
  const jsonCandidates = scriptBlocks.flatMap((block) => collectJsonTextCandidates(block))
  const visibleTextLines = extractVisibleTextLines(html)
  const pageDefaultContractLength = pickPageDefaultContract([...jsonCandidates, ...visibleTextLines])

  const offers = dedupeOffers(
    [...jsonCandidates, ...visibleTextLines]
      .map((candidate) => buildOfferFromText(candidate, finalUrl, pageDefaultContractLength))
      .filter(Boolean)
      .filter(validateOffer)
  )

  const notes = []
  if (pageDefaultContractLength) {
    notes.push(`The extractor inferred a default ${pageDefaultContractLength}-month contract from the page context when individual rows omitted it.`)
  }
  if (scriptBlocks.length > 0) {
    notes.push(`Parsed ${scriptBlocks.length} embedded script payloads before visible-text fallback.`)
  }

  return {
    offers,
    notes,
    extractionMethod: scriptBlocks.length > 0 ? 'embedded-json-plus-visible-text' : 'visible-text',
  }
}

function buildReport(results, nextData) {
  const lines = [
    '# Provider Deal Sync Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Dataset timestamp: ${nextData.generatedAt ?? 'unchanged'}`,
    '',
    '| Provider | Status | Offers | Notes |',
    '| --- | --- | ---: | --- |',
  ]

  for (const result of results) {
    lines.push(
      `| ${result.name} | ${result.status} | ${result.offerCount} | ${result.note.replace(/\|/g, '\\|')} |`
    )
  }

  return `${lines.join('\n')}\n`
}

async function main() {
  const existing = await loadExistingLiveDeals()
  const selectedProviders = providerFilter
    ? providerConfigs.filter((provider) => provider.slug === providerFilter)
    : providerConfigs

  if (selectedProviders.length === 0) {
    throw new Error(`No provider config matched "${providerFilter}".`)
  }

  const nextData = {
    generatedAt: existing.generatedAt,
    providers: { ...existing.providers },
  }
  const today = new Date().toISOString().slice(0, 10)
  const results = []
  let successCount = 0

  for (const provider of selectedProviders) {
    try {
      const { html, finalUrl } = await fetchHtml(provider.sourceUrl)
      const extraction = extractOffersFromHtml(html, finalUrl)

      if (extraction.offers.length === 0) {
        throw new Error('No validated broadband offers were extracted from the provider page.')
      }

      nextData.providers[provider.slug] = {
        slug: provider.slug,
        providerName: provider.name,
        sourceLabel: provider.sourceLabel,
        sourceUrl: finalUrl,
        affiliateUrl: provider.affiliateUrl,
        verifiedAt: today,
        extractionMethod: extraction.extractionMethod,
        offers: extraction.offers,
        notes: extraction.notes,
      }
      successCount += 1

      results.push({
        name: provider.name,
        status: 'updated',
        offerCount: extraction.offers.length,
        note: extraction.notes[0] ?? `Synced using ${extraction.extractionMethod}.`,
      })
    } catch (error) {
      results.push({
        name: provider.name,
        status: existing.providers[provider.slug] ? 'kept previous snapshot' : 'needs review',
        offerCount: existing.providers[provider.slug]?.offers?.length ?? 0,
        note: error instanceof Error ? error.message : 'Unknown sync failure.',
      })
    }
  }

  if (successCount > 0) {
    nextData.generatedAt = today
  }

  await fs.writeFile(reportPath, buildReport(results, nextData))

  if (!isDryRun && successCount > 0) {
    await fs.writeFile(outputPath, `${JSON.stringify(nextData, null, 2)}\n`)
    const indexNowKey = 'c4e8f1a07b3d49e2a6c85f0d1b9e2476'
    try {
      const ping = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: 'broadbandpicker.co.uk',
          key: indexNowKey,
          keyLocation: `https://broadbandpicker.co.uk/${indexNowKey}.txt`,
          urlList: [
            'https://broadbandpicker.co.uk/',
            'https://broadbandpicker.co.uk/deals',
            'https://broadbandpicker.co.uk/compare',
            'https://broadbandpicker.co.uk/providers',
            ...selectedProviders.map((provider) => `https://broadbandpicker.co.uk/providers/${provider.slug}`),
          ],
        }),
      })
      console.log(`IndexNow ping HTTP ${ping.status}`)
    } catch (error) {
      console.warn('IndexNow ping failed:', error instanceof Error ? error.message : error)
    }
  }

  console.table(results)
  console.log(`Report written to ${path.relative(repoRoot, reportPath)}`)
  if (!isDryRun && successCount > 0) {
    console.log(`Live deal data written to ${path.relative(repoRoot, outputPath)}`)
  } else if (isDryRun) {
    console.log('Dry run complete; no data file was updated.')
  } else {
    console.log('No providers passed validation, so the live deal dataset was left unchanged.')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
