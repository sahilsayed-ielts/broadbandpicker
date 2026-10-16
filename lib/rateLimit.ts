/**
 * Best-effort in-memory rate limit for public form endpoints. Each serverless
 * instance keeps its own window, so this stops casual abuse, not a botnet.
 */
const WINDOW_MS = 60 * 60 * 1000
const hits = new Map<string, number[]>()

export function rateLimited(key: string, max: number, windowMs = WINDOW_MS): boolean {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((stamp) => now - stamp < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)
  return false
}
