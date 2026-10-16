import { ImageResponse } from 'next/og'
import { getProviderComparisonBySlug } from '@/data/provider-comparisons'
import { getProviderBySlug } from '@/data/providers'
import { OG_SIZE, OgCard } from '@/lib/og/card'

export const alt = 'Broadband provider head-to-head from BroadbandPicker'
export const size = OG_SIZE
export const contentType = 'image/png'

function clip(text: string, max = 70) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getProviderComparisonBySlug(slug)
  const a = c ? getProviderBySlug(c.providerA) : undefined
  const b = c ? getProviderBySlug(c.providerB) : undefined
  const side = (name: string, price: number, bestFor: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: 526, flexShrink: 0, background: '#1E293B', borderRadius: 20, padding: '24px 28px', marginRight: 20 }}>
      <div style={{ display: 'flex', fontSize: 40, fontWeight: 800 }}>{name}</div>
      <div style={{ display: 'flex', fontSize: 26, color: '#7DD3FC', marginTop: 6 }}>{`from £${price.toFixed(2)} a month`}</div>
      <div style={{ display: 'flex', width: 470, fontSize: 24, lineHeight: 1.35, color: '#CBD5E1', marginTop: 16 }}>{`Best for: ${clip(bestFor, 90)}`}</div>
    </div>
  )
  return new ImageResponse(
    (
      <OgCard eyebrow="Head to head" title={a && b ? `${a.name} vs ${b.name}` : 'Broadband head to head'}>
        {c && a && b ? (
          <>
            {side(a.name, a.monthlyPriceFrom, c.bestForA)}
            {side(b.name, b.monthlyPriceFrom, c.bestForB)}
          </>
        ) : null}
      </OgCard>
    ),
    size,
  )
}
