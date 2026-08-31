import { guides } from '@/data/guides'
import { SITE_URL } from '@/lib/siteSchema'

export const dynamic = 'force-static'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET() {
  const items = [...guides]
    .sort((a, b) => b.updatedDate.localeCompare(a.updatedDate))
    .map((guide) => {
      const url = `${SITE_URL}/guides/${guide.slug}`
      return [
        '<item>',
        `<title>${escapeXml(guide.title)}</title>`,
        `<link>${url}</link>`,
        `<guid>${url}</guid>`,
        `<pubDate>${new Date(`${guide.publishDate}T00:00:00Z`).toUTCString()}</pubDate>`,
        `<description>${escapeXml(guide.excerpt || guide.metaDescription)}</description>`,
        '</item>',
      ].join('')
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>BroadbandPicker guides</title>
<link>${SITE_URL}/guides</link>
<description>UK broadband guides from BroadbandPicker. Independent comparison, rankings not sold.</description>
<language>en-GB</language>
${items}
</channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
