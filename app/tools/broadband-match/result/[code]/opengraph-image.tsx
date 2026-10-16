import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard, OgStat } from '@/lib/og/card'
import { matchFromCode } from './data'

export const alt = 'Broadband Match shortlist from BroadbandPicker'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const m = matchFromCode(code)
  return new ImageResponse(
    (
      <OgCard eyebrow="Broadband Match" title={m ? `Our shortlist: around ${m.minSpeed} Mbps` : 'Broadband Match'} footer="Find your match at broadbandpicker.co.uk/tools/broadband-match">
        {m?.providers.map((p, i) => (
          <OgStat key={p.slug} label={`#${i + 1} match`} value={p.name} sub={`from £${p.monthlyPriceFrom.toFixed(2)} a month`} />
        ))}
      </OgCard>
    ),
    size,
  )
}
