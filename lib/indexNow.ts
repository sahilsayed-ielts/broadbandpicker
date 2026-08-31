export const INDEXNOW_KEY = 'c4e8f1a07b3d49e2a6c85f0d1b9e2476'
export const INDEXNOW_HOST = 'broadbandpicker.co.uk'
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`

const OWN_ORIGIN = `https://${INDEXNOW_HOST}`

export function ownSiteUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of urls) {
    try {
      const url = new URL(raw)
      if (url.hostname !== INDEXNOW_HOST && url.hostname !== `www.${INDEXNOW_HOST}`) continue
      url.hash = ''
      const href = url.toString()
      if (!seen.has(href)) {
        seen.add(href)
        out.push(href)
      }
    } catch {
      if (raw.startsWith('/') && !seen.has(`${OWN_ORIGIN}${raw}`)) {
        const href = `${OWN_ORIGIN}${raw}`
        seen.add(href)
        out.push(href)
      }
    }
  }
  return out
}

export async function submitIndexNow(urls: string[]): Promise<{ ok: boolean; status: number; submitted: string[] }> {
  const submitted = ownSiteUrls(urls)
  if (submitted.length === 0) {
    return { ok: false, status: 0, submitted }
  }
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: submitted,
    }),
  })
  return { ok: response.ok, status: response.status, submitted }
}
