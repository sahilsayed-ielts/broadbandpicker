import { indexCsv } from '@/lib/priceIndex'

export const dynamic = 'force-static'

export function GET() {
  return new Response(indexCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="broadbandpicker-uk-broadband-price-index.csv"',
    },
  })
}
