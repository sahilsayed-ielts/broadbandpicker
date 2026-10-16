export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 10

const headers = {
  'Cache-Control': 'no-store, no-transform',
  'CDN-Cache-Control': 'no-store',
}

export async function HEAD() {
  return new Response(null, { status: 204, headers })
}

export async function GET() {
  return new Response(null, { status: 204, headers })
}
