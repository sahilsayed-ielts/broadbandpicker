export type SpeedSample = { at: number; mbps: number }

export type SpeedTestResult = {
  pingMs: number
  jitterMs: number
  loadedPingMs: number | null
  downloadMbps: number
  uploadMbps: number
  downloadSustainMbps: number
  uploadSustainMbps: number
  streams: number
  durationMs: number
}

const PING_WARMUP = 2
const PING_COUNT = 10
const DOWNLOAD_STREAMS = 6
const UPLOAD_STREAMS = 4
const TEST_MS = 8000
const WARMUP_MS = 2000
const SAMPLE_MS = 200
const DOWNLOAD_CHUNK = 8 * 1024 * 1024
const UPLOAD_CHUNK = 4 * 1024 * 1024

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

function meanConsecutiveDiff(values: number[]): number {
  if (values.length < 2) return 0
  let total = 0
  for (let i = 1; i < values.length; i += 1) total += Math.abs(values[i] - values[i - 1])
  return total / (values.length - 1)
}

async function onePing(): Promise<number> {
  const started = performance.now()
  const response = await fetch(`/api/speedtest/ping?t=${Date.now()}&r=${Math.random()}`, {
    cache: 'no-store',
  })
  if (!response.ok && response.status !== 204) throw new Error('Ping failed')
  return performance.now() - started
}

export async function measureIdleLatency(): Promise<{ pingMs: number; jitterMs: number; samples: number[] }> {
  for (let i = 0; i < PING_WARMUP; i += 1) {
    await onePing()
  }
  const samples: number[] = []
  for (let i = 0; i < PING_COUNT; i += 1) {
    samples.push(await onePing())
  }
  return {
    pingMs: median(samples),
    jitterMs: meanConsecutiveDiff(samples),
    samples,
  }
}

async function consumeDownload(signal: AbortSignal, onBytes: (bytes: number) => void): Promise<void> {
  try {
  while (!signal.aborted) {
    const response = await fetch(`/api/speedtest/download?bytes=${DOWNLOAD_CHUNK}&t=${Date.now()}&r=${Math.random()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-store', 'Accept-Encoding': 'identity' },
      signal,
    })
    if (!response.ok || !response.body) throw new Error('Download failed')
    const reader = response.body.getReader()
    while (!signal.aborted) {
      const { done, value } = await reader.read()
      if (done) break
      onBytes(value.byteLength)
    }
    try {
      await reader.cancel()
    } catch {
      /* already aborted */
    }
  }
  } catch (error) {
    if (signal.aborted) return
    throw error
  }
}

function randomPayload(size: number): Uint8Array {
  const data = new Uint8Array(size)
  const chunk = 65536
  for (let offset = 0; offset < size; offset += chunk) {
    crypto.getRandomValues(data.subarray(offset, Math.min(offset + chunk, size)))
  }
  return data
}

function postChunk(payload: Uint8Array, signal: AbortSignal, onBytes: (bytes: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `/api/speedtest/upload?t=${Date.now()}&r=${Math.random()}`)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.setRequestHeader('Cache-Control', 'no-store')
    let lastLoaded = 0
    const abort = () => {
      xhr.abort()
      resolve()
    }
    signal.addEventListener('abort', abort, { once: true })
    xhr.upload.onprogress = (event) => {
      if (event.loaded > lastLoaded) {
        onBytes(event.loaded - lastLoaded)
        lastLoaded = event.loaded
      }
    }
    xhr.onload = () => {
      signal.removeEventListener('abort', abort)
      if (payload.byteLength > lastLoaded) onBytes(payload.byteLength - lastLoaded)
      resolve()
    }
    xhr.onerror = () => {
      signal.removeEventListener('abort', abort)
      if (signal.aborted) resolve()
      else reject(new Error('Upload failed'))
    }
    xhr.send(payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength) as ArrayBuffer)
  })
}

async function consumeUpload(payload: Uint8Array, signal: AbortSignal, onBytes: (bytes: number) => void): Promise<void> {
  try {
    while (!signal.aborted) {
      await postChunk(payload, signal, onBytes)
    }
  } catch (error) {
    if (signal.aborted) return
    throw error
  }
}

async function runSaturated(
  workers: number,
  durationMs: number,
  startWorker: (signal: AbortSignal, onBytes: (bytes: number) => void) => Promise<void>,
  onTick: (mbps: number) => void,
): Promise<{ headline: number; sustain: number; samples: SpeedSample[] }> {
  const controller = new AbortController()
  const started = performance.now()
  let bytes = 0
  let lastBytes = 0
  let lastAt = started
  const samples: SpeedSample[] = []

  const jobs = Array.from({ length: workers }, () =>
    startWorker(controller.signal, (chunk) => {
      bytes += chunk
    }).catch((error) => {
      if (!controller.signal.aborted) throw error
    }),
  )

  await new Promise<void>((resolve, reject) => {
    const timer = window.setInterval(() => {
      const now = performance.now()
      const deltaBytes = bytes - lastBytes
      const deltaMs = now - lastAt
      if (deltaMs > 0) {
        const mbps = (deltaBytes * 8) / (deltaMs / 1000) / 1e6
        samples.push({ at: now - started, mbps })
        if (now - started > WARMUP_MS) onTick(mbps)
      }
      lastBytes = bytes
      lastAt = now
      if (now - started >= durationMs) {
        window.clearInterval(timer)
        controller.abort()
        resolve()
      }
    }, SAMPLE_MS)

    Promise.all(jobs).catch((error) => {
      window.clearInterval(timer)
      controller.abort()
      reject(error)
    })
  })

  await Promise.allSettled(jobs)
  const saturated = samples.filter((sample) => sample.at >= WARMUP_MS).map((sample) => sample.mbps).filter((value) => value > 0)
  const sustainWindow = samples.filter((sample) => sample.at >= durationMs - 3000).map((sample) => sample.mbps).filter((value) => value > 0)
  const fallback = samples.map((sample) => sample.mbps).filter((value) => value > 0)
  return {
    headline: percentile(saturated.length ? saturated : fallback, 0.9),
    sustain: median(sustainWindow.length ? sustainWindow : saturated.length ? saturated : fallback),
    samples,
  }
}

export async function runProfessionalSpeedTest(
  onPhase: (phase: 'ping' | 'download' | 'upload', liveMbps: number) => void,
): Promise<SpeedTestResult> {
  const started = performance.now()
  onPhase('ping', 0)
  const idle = await measureIdleLatency()

  onPhase('download', 0)
  let loadedPingMs: number | null = null
  const loadedTimer = window.setTimeout(() => {
    void (async () => {
      try {
        const loaded = []
        for (let i = 0; i < 5; i += 1) loaded.push(await onePing())
        loadedPingMs = median(loaded)
      } catch {
        loadedPingMs = null
      }
    })()
  }, TEST_MS - 2500)

  const download = await runSaturated(
    DOWNLOAD_STREAMS,
    TEST_MS,
    (signal, onBytes) => consumeDownload(signal, onBytes),
    (mbps) => onPhase('download', mbps),
  )
  window.clearTimeout(loadedTimer)

  onPhase('upload', 0)
  const payload = randomPayload(UPLOAD_CHUNK)
  const upload = await runSaturated(
    UPLOAD_STREAMS,
    TEST_MS,
    (signal, onBytes) => consumeUpload(payload, signal, onBytes),
    (mbps) => onPhase('upload', mbps),
  )

  return {
    pingMs: idle.pingMs,
    jitterMs: idle.jitterMs,
    loadedPingMs,
    downloadMbps: download.headline,
    uploadMbps: upload.headline,
    downloadSustainMbps: download.sustain,
    uploadSustainMbps: upload.sustain,
    streams: DOWNLOAD_STREAMS,
    durationMs: performance.now() - started,
  }
}

export function roundMbps(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  if (value < 10) return Math.round(value * 10) / 10
  return Math.round(value)
}
