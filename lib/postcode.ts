const UK_POSTCODE_REGEX = /^([A-Z]{1,2}[0-9][0-9A-Z]?)\s?([0-9][A-Z]{2})$/i
const POSTCODE_AREA_REGEX = /^([A-Z]{1,2}[0-9][0-9A-Z]?)/i

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
