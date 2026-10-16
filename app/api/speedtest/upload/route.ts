export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: Request) {
  if (request.body) {
    const reader = request.body.getReader()
    while (true) {
      const { done } = await reader.read()
      if (done) break
    }
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-transform',
      'CDN-Cache-Control': 'no-store',
    },
  })
}
