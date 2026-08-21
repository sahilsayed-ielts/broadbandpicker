const STORAGE_KEY = 'bp_postcode'

export interface StoredPostcode {
  postcode: string
  area: string
}

export function getStoredPostcode(): StoredPostcode | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.postcode === 'string' && typeof parsed?.area === 'string') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function setStoredPostcode(postcode: string, area: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ postcode, area }))
    window.dispatchEvent(new Event('bp-postcode-change'))
  } catch {
    // localStorage unavailable (private browsing etc.) — fail silently, no persistence this session
  }
}

export function clearStoredPostcode(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('bp-postcode-change'))
  } catch {
    // ignore
  }
}
