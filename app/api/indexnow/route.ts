import { NextResponse } from 'next/server'
import { submitIndexNow } from '@/lib/indexNow'

const CORE_URLS = [
  'https://broadbandpicker.co.uk/',
  'https://broadbandpicker.co.uk/deals',
  'https://broadbandpicker.co.uk/compare',
  'https://broadbandpicker.co.uk/providers',
]

export async function POST(request: Request) {
  let urls = CORE_URLS
  try {
    const body = (await request.json()) as { urls?: string[] }
    if (Array.isArray(body.urls) && body.urls.length > 0) {
      urls = body.urls
    }
  } catch {
    urls = CORE_URLS
  }
  const result = await submitIndexNow(urls)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}

export async function GET() {
  const result = await submitIndexNow(CORE_URLS)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
