import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard, OgStat } from '@/lib/og/card'
import { parseSpeedCode } from '@/lib/shareCodes'
import { speedColor, speedLabel } from '@/lib/speedResult'

export const alt = 'Broadband speed test result from BroadbandPicker'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const r = parseSpeedCode(code)
  return new ImageResponse(
    (
      <OgCard eyebrow="Speed test" title={r ? `${speedLabel(r.download)} broadband: ${r.download} Mbps` : 'Broadband speed test'} footer="Test yours free at broadbandpicker.co.uk/tools/speed-test">
        {r ? (
          <>
            <OgStat label="Download" value={`${r.download}`} sub="Mbps" accent={speedColor(r.download)} />
            <OgStat label="Upload" value={`${r.upload}`} sub="Mbps" />
            <OgStat label="Ping" value={`${r.ping}`} sub="ms" />
          </>
        ) : null}
      </OgCard>
    ),
    size,
  )
}
