import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard, OgStat } from '@/lib/og/card'
import { costTotals, parseCostCode } from '@/lib/shareCodes'

export const alt = 'Broadband true-cost calculation from BroadbandPicker'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const c = parseCostCode(code)
  const t = c ? costTotals(c) : null
  return new ImageResponse(
    (
      <OgCard eyebrow="True cost" title={c ? `£${c.monthly.toFixed(2)} a month really costs` : 'Broadband true-cost calculator'} footer="Work out yours at broadbandpicker.co.uk/tools/broadband-cost-calculator">
        {c && t ? (
          <>
            <OgStat label="True monthly cost" value={`£${Math.max(0, t.trueMonthlyCost).toFixed(2)}`} accent={t.difference > 0.005 ? '#FBBF24' : '#4ADE80'} />
            <OgStat label="Whole contract" value={`£${Math.max(0, t.totalContractCost).toFixed(0)}`} sub={`over ${c.months} months`} />
          </>
        ) : null}
      </OgCard>
    ),
    size,
  )
}
