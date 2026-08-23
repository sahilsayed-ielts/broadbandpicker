import { randomFillSync } from 'node:crypto'

export const dynamic = 'force-dynamic'

const CHUNK = 65536 // 64 KB per enqueue
const TOTAL = 10 * 1024 * 1024 // 10 MB total

export async function GET() {
  let sent = 0

  const stream = new ReadableStream({
    pull(controller) {
      if (sent >= TOTAL) {
        controller.close()
        return
      }
      // Genuinely random bytes on every chunk. A deterministic or repeated
      // pattern here gets flattened by Vercel's automatic Brotli/gzip
      // compression before it ever leaves the edge — the browser then
      // reports the decompressed byte count while only a tiny fraction of
      // that actually crossed the network, wildly inflating the result.
      // True high-entropy data can't be meaningfully compressed, so what
      // the client measures matches what really transferred.
      controller.enqueue(randomFillSync(new Uint8Array(CHUNK)))
      sent += CHUNK
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(TOTAL),
      'Cache-Control': 'no-store',
    },
  })
}
