export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // Drain the body so the browser upload completes accurately
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
      'Cache-Control': 'no-store',
    },
  })
}
