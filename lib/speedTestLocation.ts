import { getPostcodeArea } from '@/data/postcodes'
import { extractPostcodeArea } from '@/lib/postcode'
import { setStoredPostcode } from '@/lib/postcodeStorage'

export type SpeedTestPlace = {
  postcode: string
  area: string
  district: string | null
  inUk: boolean
  pagePrefix: string | null
  kmFromLondon: number
}

export type LocationRequestResult =
  | { ok: true; place: SpeedTestPlace }
  | { ok: false; reason: 'denied' | 'unavailable' | 'timeout' | 'unsupported' }

const SKIP_KEY = 'bp_speedtest_skip_location'
const UK_LAT = { min: 49.8, max: 60.9 }
const UK_LON = { min: -8.7, max: 1.9 }
const LONDON_LAT = 51.5074
const LONDON_LON = -0.1278

export function skippedLocationThisVisit(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(SKIP_KEY) === '1'
  } catch {
    return false
  }
}

export function skipLocationThisVisit(): void {
  try {
    sessionStorage.setItem(SKIP_KEY, '1')
  } catch {
    /* ignore */
  }
}

export async function queryGeoPermission(): Promise<PermissionState | 'unsupported'> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return 'unsupported'
  if (!navigator.permissions?.query) return 'prompt'
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    return status.state
  } catch {
    return 'prompt'
  }
}

function inUk(lat: number, lon: number): boolean {
  return lat >= UK_LAT.min && lat <= UK_LAT.max && lon >= UK_LON.min && lon <= UK_LON.max
}

function kmBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}

function pagePrefixFor(postcode: string, outcode?: string): string | null {
  const outward = (extractPostcodeArea(postcode) ?? outcode ?? '').toUpperCase()
  if (!outward) return null
  if (getPostcodeArea(outward)) return outward.toLowerCase()
  const shortened = outward.replace(/[A-Z]$/i, '')
  if (shortened && shortened !== outward && getPostcodeArea(shortened)) {
    return shortened.toLowerCase()
  }
  return null
}

function getPosition(timeoutMs: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: timeoutMs,
      maximumAge: 300000,
    })
  })
}

function geolocationFailure(error: unknown): LocationRequestResult {
  const code = error && typeof error === 'object' && 'code' in error ? Number(error.code) : 0
  if (code === 1) return { ok: false, reason: 'denied' }
  if (code === 2) return { ok: false, reason: 'unavailable' }
  if (code === 3) return { ok: false, reason: 'timeout' }
  return { ok: false, reason: 'denied' }
}

async function lookupPostcode(lat: number, lon: number): Promise<SpeedTestPlace | null> {
  const url = `https://api.postcodes.io/postcodes?lon=${encodeURIComponent(String(lon))}&lat=${encodeURIComponent(String(lat))}&limit=1&radius=1000`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) return null
  const data = (await response.json()) as {
    result?: { postcode?: string; outcode?: string; admin_district?: string }[] | null
  }
  const hit = data.result?.[0]
  if (!hit?.postcode) return null
  const outward = extractPostcodeArea(hit.postcode) ?? hit.outcode?.toUpperCase() ?? null
  if (!outward) return null
  const pagePrefix = pagePrefixFor(hit.postcode, hit.outcode)
  const area = pagePrefix ?? outward.toLowerCase()
  return {
    postcode: hit.postcode,
    area,
    district: hit.admin_district ?? null,
    inUk: true,
    pagePrefix,
    kmFromLondon: Math.round(kmBetween(lat, lon, LONDON_LAT, LONDON_LON)),
  }
}

export async function requestSpeedTestLocation(): Promise<LocationRequestResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return { ok: false, reason: 'unsupported' }
  }
  try {
    const position = await getPosition(8000)
    const lat = position.coords.latitude
    const lon = position.coords.longitude
    const kmFromLondon = Math.round(kmBetween(lat, lon, LONDON_LAT, LONDON_LON))
    if (!inUk(lat, lon)) {
      return {
        ok: true,
        place: { postcode: '', area: '', district: null, inUk: false, pagePrefix: null, kmFromLondon },
      }
    }
    try {
      const place = await lookupPostcode(lat, lon)
      if (!place) {
        return {
          ok: true,
          place: { postcode: '', area: '', district: null, inUk: true, pagePrefix: null, kmFromLondon },
        }
      }
      if (place.pagePrefix) setStoredPostcode(place.postcode, place.pagePrefix)
      return { ok: true, place }
    } catch {
      return {
        ok: true,
        place: { postcode: '', area: '', district: null, inUk: true, pagePrefix: null, kmFromLondon },
      }
    }
  } catch (error) {
    return geolocationFailure(error)
  }
}
