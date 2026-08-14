const UK_POSTCODE_REGEX = /^([A-Z]{1,2}[0-9][0-9A-Z]?)\s?([0-9][A-Z]{2})$/i
const POSTCODE_AREA_REGEX = /^([A-Z]{1,2}[0-9][0-9A-Z]?)/i

// Fix the most common user error: letter O instead of digit 0 at the
// start of the inward code, and missing space between outward/inward.
export function sanitizePostcode(raw: string): string {
  let s = raw.trim().toUpperCase().replace(/\s/g, '')
  if (s.length >= 5) {
    const i = s.length - 3
    // Inward code always starts with a digit — replace letter O with 0
    if (s[i] === 'O') s = s.slice(0, i) + '0' + s.slice(i + 1)
    // Reinsert the space
    return s.slice(0, i) + ' ' + s.slice(i)
  }
  return s
}

export function isValidUKPostcode(postcode: string): boolean {
  return UK_POSTCODE_REGEX.test(postcode.trim())
}

export function extractPostcodeArea(postcode: string): string | null {
  const match = postcode.trim().match(POSTCODE_AREA_REGEX)
  return match ? match[1].toUpperCase() : null
}

export function normalisePostcodeForUrl(postcode: string): string {
  const area = extractPostcodeArea(postcode)
  return area ? area.toLowerCase() : ''
}

export function formatPostcodeDisplay(prefix: string): string {
  return prefix.toUpperCase()
}
