import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard, OgStat } from '@/lib/og/card'
import { maxDownload, providersForCombo } from './data'

export const alt = 'Broadband provider comparison from BroadbandPicker'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ combo: string }> }) {
  const { combo } = await params
  const list = providersForCombo(combo) ?? []
  return new ImageResponse(
    (
      <OgCard eyebrow="Comparison" title={list.map((p) => p.name).join(' vs ') || 'Broadband comparison'}>
        {list.map((p) => (
          <OgStat key={p.slug} label={p.name} value={`£${p.monthlyPriceFrom.toFixed(2)}`} sub={`a month · up to ${maxDownload(p)} Mbps`} />
        ))}
      </OgCard>
    ),
    size,
  )
}
