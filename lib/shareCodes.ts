/**
 * URL codes for shareable results. Everything a share page shows is in its
 * path, so share pages need no database and their Open Graph image can be
 * rendered from the same params. All parsers are strict and return null on
 * anything unexpected (share URLs are user-editable).
 */

// ---- Provider comparison: /compare/shared/bt-vs-sky-vs-ee ------------------

export const MAX_COMPARE = 3

export function comparisonPath(slugs: string[]): string {
  return `/compare/shared/${slugs.slice(0, MAX_COMPARE).join('-vs-')}`
}

export function parseComparison(combo: string, validSlugs: Set<string>): string[] | null {
  const slugs = decodeURIComponent(combo).toLowerCase().split('-vs-')
  const unique = [...new Set(slugs)]
  if (unique.length < 2 || unique.length > MAX_COMPARE) return null
  if (!unique.every((slug) => validSlugs.has(slug))) return null
  return unique
}

// ---- Speed test: /tools/speed-test/result/72-18-12 (down-up-ping) ---------

export type SpeedShare = { download: number; upload: number; ping: number }

export function speedCode(r: SpeedShare): string {
  return `${Math.round(r.download)}-${Math.round(r.upload)}-${Math.round(r.ping)}`
}

export function parseSpeedCode(code: string): SpeedShare | null {
  const m = /^(\d{1,5})-(\d{1,5})-(\d{1,4})$/.exec(code)
  if (!m) return null
  const [download, upload, ping] = m.slice(1).map(Number)
  if (download > 10000 || upload > 10000 || ping > 5000) return null
  return { download, upload, ping }
}

// ---- Cost calculator: /tools/broadband-cost-calculator/result/2999-24-0-0-500
// price in pence, months, setup pence, cashback pence, speed Mbps (0 = none)

export type CostShare = { monthly: number; months: number; setup: number; cashback: number; speed: number | null }

export function costCode(c: CostShare): string {
  const p = (v: number) => Math.max(0, Math.round(v * 100))
  return `${p(c.monthly)}-${Math.round(c.months)}-${p(c.setup)}-${p(c.cashback)}-${Math.round(c.speed ?? 0)}`
}

export function parseCostCode(code: string): CostShare | null {
  const m = /^(\d{1,6})-(\d{1,2})-(\d{1,6})-(\d{1,6})-(\d{1,5})$/.exec(code)
  if (!m) return null
  const [monthlyP, months, setupP, cashbackP, speed] = m.slice(1).map(Number)
  if (months < 1 || months > 36 || monthlyP === 0) return null
  return { monthly: monthlyP / 100, months, setup: setupP / 100, cashback: cashbackP / 100, speed: speed > 0 ? speed : null }
}

export function costTotals(c: CostShare) {
  const totalContractCost = c.monthly * c.months + c.setup - c.cashback
  const trueMonthlyCost = totalContractCost / c.months
  return {
    totalContractCost,
    trueMonthlyCost,
    difference: trueMonthlyCost - c.monthly,
    costPerMbps: c.speed ? trueMonthlyCost / c.speed : null,
  }
}

// ---- Broadband Match: /tools/broadband-match/result/bt.sky.ee-100 ----------

export type MatchShare = { slugs: string[]; minSpeed: number }

export function matchCode(m: MatchShare): string {
  return `${m.slugs.slice(0, 3).join('.')}-${Math.round(m.minSpeed)}`
}

export function parseMatchCode(code: string, validSlugs: Set<string>): MatchShare | null {
  const m = /^([a-z0-9.-]+)-(\d{1,5})$/.exec(decodeURIComponent(code).toLowerCase())
  if (!m) return null
  const slugs = [...new Set(m[1].split('.'))]
  if (slugs.length < 1 || slugs.length > 3 || !slugs.every((s) => validSlugs.has(s))) return null
  return { slugs, minSpeed: Number(m[2]) }
}
