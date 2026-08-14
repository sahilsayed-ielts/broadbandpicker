export const dynamic = 'force-dynamic'

const CHUNK = 65536 // 64 KB per enqueue
const TOTAL = 10 * 1024 * 1024 // 10 MB total

// Pre-build one chunk of incompressible pseudo-random data
const TEMPLATE = (() => {
  const buf = new Uint8Array(CHUNK)
  for (let i = 0; i < CHUNK; i++) buf[i] = (i * 37 + 91) & 0xff
  return buf
})()

export async function GET() {
  let sent = 0

  const stream = new ReadableStream({
    pull(controller) {
      if (sent >= TOTAL) {
        controller.close()
        return
      }
      controller.enqueue(TEMPLATE.slice())
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
