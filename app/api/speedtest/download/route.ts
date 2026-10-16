import { randomFillSync } from 'node:crypto'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const CHUNK = 65536
const DEFAULT_BYTES = 8 * 1024 * 1024
const MAX_BYTES = 16 * 1024 * 1024

export async function GET(request: NextRequest) {
  const requested = Number(request.nextUrl.searchParams.get('bytes') ?? DEFAULT_BYTES)
  const total = Number.isFinite(requested) ? Math.min(Math.max(Math.floor(requested), CHUNK), MAX_BYTES) : DEFAULT_BYTES
  let sent = 0

  const stream = new ReadableStream({
    pull(controller) {
      if (sent >= total) {
        controller.close()
        return
      }
      const size = Math.min(CHUNK, total - sent)
      controller.enqueue(randomFillSync(new Uint8Array(size)))
      sent += size
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(total),
      'Content-Encoding': 'identity',
      'Cache-Control': 'no-store, no-transform',
      'CDN-Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
