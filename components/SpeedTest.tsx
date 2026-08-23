'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

type Phase = 'idle' | 'ping' | 'download' | 'upload' | 'done'

// Gauge geometry — 270° arc, open at the bottom
const R = 75
const CX = 100
const CY = 100
const CIRC = 2 * Math.PI * R
const GAUGE = CIRC * 0.75  // 270° worth of arc
const GAP   = CIRC * 0.25  // the open 90° gap
const MAX_MBPS = 1000

function arcFill(mbps: number) {
  const pct = Math.min(mbps / MAX_MBPS, 1)
  return GAUGE * pct
}

function speedColor(mbps: number) {
  if (mbps < 20)  return '#ef4444'
  if (mbps < 50)  return '#f97316'
  if (mbps < 100) return '#eab308'
  if (mbps < 300) return '#22c55e'
  return '#0ea5e9'
}

function speedLabel(mbps: number) {
  if (mbps < 10)  return 'Very slow'
  if (mbps < 30)  return 'Basic'
  if (mbps < 100) return 'Standard'
  if (mbps < 300) return 'Fast'
  if (mbps < 600) return 'Superfast'
  return 'Gigabit'
}

function recommendation(dl: number) {
  if (dl < 10)  return 'This result is slow for modern household use. Repeat the test over Ethernet and compare it with the minimum guaranteed speed in your contract.'
  if (dl < 30)  return 'This may support everyday use for a small household, but simultaneous streaming and calls could be limited. Repeat the test before comparing alternatives.'
  if (dl < 100) return 'This is within Ofcom\'s superfast range. It should suit many homes, although actual needs depend on simultaneous users and activities.'
  if (dl < 300) return 'This is a fast result within Ofcom\'s superfast range and should support a busy connected household.'
  return 'This is an ultrafast result under Ofcom\'s speed categories. Compare repeated tests with the service level and price in your contract.'
}

async function measurePing(): Promise<number> {
  const times: number[] = []
  for (let i = 0; i < 5; i++) {
    const t = performance.now()
    await fetch(`/api/speedtest/ping?t=${Date.now()}`, { cache: 'no-store' })
    times.push(performance.now() - t)
  }
  times.sort((a, b) => a - b)
  return times[2] // median of 5
}

async function measureDownload(onTick: (mbps: number) => void): Promise<number> {
  const res = await fetch(`/api/speedtest/download?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok || !res.body) throw new Error('Download failed')
  const reader = res.body.getReader()

  let totalBytes = 0
  let lastBytes = 0
  const t0 = performance.now()
  let lastTick = t0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    const now = performance.now()
    if (now - lastTick > 150) {
      const mbps = ((totalBytes - lastBytes) * 8) / ((now - lastTick) / 1000) / 1e6
      onTick(mbps)
      lastBytes = totalBytes
      lastTick = now
    }
  }

  const elapsed = (performance.now() - t0) / 1000
  return (totalBytes * 8) / elapsed / 1e6
}

async function measureUpload(onTick: (mbps: number) => void): Promise<number> {
  const SIZE = 5 * 1024 * 1024 // 5 MB
  const data = new Uint8Array(SIZE)
  // crypto.getRandomValues caps out at 65536 bytes per call, so fill in chunks.
  // Genuinely random bytes, not a repeating pattern — a predictable payload
  // risks the same silent inflation the download test had if anything in the
  // path ever starts compressing request bodies.
  const RAND_CHUNK = 65536
  for (let offset = 0; offset < SIZE; offset += RAND_CHUNK) {
    crypto.getRandomValues(data.subarray(offset, Math.min(offset + RAND_CHUNK, SIZE)))
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const t0 = performance.now()

    xhr.upload.onprogress = (e) => {
      const elapsed = (performance.now() - t0) / 1000
      if (elapsed > 0 && e.loaded > 0) {
        onTick((e.loaded * 8) / elapsed / 1e6)
      }
    }

    xhr.onload = () => {
      const elapsed = (performance.now() - t0) / 1000
      resolve((SIZE * 8) / elapsed / 1e6)
    }

    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.open('POST', `/api/speedtest/upload?t=${Date.now()}`)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.send(data)
  })
}

export default function SpeedTest() {
  const [phase, setPhase]         = useState<Phase>('idle')
  const [liveSpeed, setLiveSpeed] = useState(0)
  const [ping, setPing]           = useState<number | null>(null)
  const [download, setDownload]   = useState<number | null>(null)
  const [upload, setUpload]       = useState<number | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [jitter, setJitter]       = useState<number | null>(null)

  const runTest = useCallback(async () => {
    trackEvent('speed_test_started')
    setPhase('ping')
    setPing(null); setDownload(null); setUpload(null)
    setLiveSpeed(0); setError(null)

    try {
      // Ping
      const pingSamples = await Promise.all(Array.from({ length: 5 }, async () => measurePing()))
      const pingMs = pingSamples.reduce((sum, value) => sum + value, 0) / pingSamples.length
      const jitterMs = pingSamples.reduce((sum, value) => sum + Math.abs(value - pingMs), 0) / pingSamples.length
      setPing(Math.round(pingMs))
      setJitter(Math.round(jitterMs))

      // Download
      setPhase('download')
      setLiveSpeed(0)
      const dlMbps = await measureDownload((mbps) => setLiveSpeed(mbps))
      const dlFinal = Math.round(dlMbps * 10) / 10
      setDownload(dlFinal)
      setLiveSpeed(dlMbps)

      await new Promise(r => setTimeout(r, 600))

      // Upload
      setPhase('upload')
      setLiveSpeed(0)
      const ulMbps = await measureUpload((mbps) => setLiveSpeed(mbps))
      const ulFinal = Math.round(ulMbps * 10) / 10
      setUpload(ulFinal)
      setLiveSpeed(ulMbps)

      await new Promise(r => setTimeout(r, 600))
      setPhase('done')
      trackEvent('speed_test_completed', {
        ping_ms: Math.round(pingMs),
        download_mbps: dlFinal,
        upload_mbps: ulFinal,
        jitter_ms: Math.round(jitterMs),
        speed_band: speedLabel(dlFinal).toLowerCase(),
      })
    } catch {
      trackEvent('speed_test_failed')
      setError('Test failed. Please check your connection and try again.')
      setPhase('idle')
    }
  }, [])

  // Gauge display: during 'done', show download speed on the dial
  const dialSpeed   = phase === 'done' ? (download ?? 0) : liveSpeed
  const fill        = arcFill(dialSpeed)
  const dialColor   = speedColor(dialSpeed)
  const isRunning   = phase === 'ping' || phase === 'download' || phase === 'upload'
  const phaseLabel  = phase === 'ping' ? 'Testing ping…' : phase === 'download' ? 'Testing download…' : phase === 'upload' ? 'Testing upload…' : ''

  return (
    <div className="max-w-2xl mx-auto">
      {/* Dial */}
      <div className="flex flex-col items-center py-10">
        <div className="relative">
          <svg width="240" height="215" viewBox="0 12 200 188" aria-hidden="true">
            {/* Background track */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeDasharray={`${GAUGE} ${GAP}`}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
            />
            {/* Coloured progress arc */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={dialSpeed > 0 ? dialColor : '#1e293b'}
              strokeWidth="14"
              strokeDasharray={`${fill} ${CIRC - fill}`}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
              style={{ transition: 'stroke-dasharray 0.18s ease, stroke 0.3s ease' }}
            />
          </svg>

          {/* Centre readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pb-4">
            {phase === 'idle' || phase === 'ping' ? (
              <>
                <span className="text-5xl font-black text-white tabular-nums leading-none">
                  {phase === 'ping' ? '—' : '—'}
                </span>
                <span className="text-slate-400 text-sm mt-1">Mbps</span>
              </>
            ) : (
              <>
                <span
                  className="text-5xl font-black tabular-nums leading-none"
                  style={{ color: dialColor }}
                >
                  {dialSpeed < 10
                    ? dialSpeed.toFixed(1)
                    : Math.round(dialSpeed)}
                </span>
                <span className="text-slate-400 text-sm mt-1">Mbps</span>
                {phase === 'done' && download !== null && (
                  <span
                    className="text-xs font-bold mt-1 uppercase tracking-widest"
                    style={{ color: dialColor }}
                  >
                    {speedLabel(download)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Speed indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-2" aria-live="polite">
          {[
            { label: 'Ping', value: ping !== null ? `${ping} ms` : '—' },
            { label: 'Download', value: download !== null ? `${download} Mbps` : '—' },
            { label: 'Upload', value: upload !== null ? `${upload} Mbps` : '—' },
            { label: 'Jitter', value: jitter !== null ? `${jitter} ms` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</div>
              <div className="text-lg font-bold text-white tabular-nums">{value}</div>
            </div>
          ))}
        </div>

        {/* Phase label */}
        <div className="h-6 mt-4">
          {isRunning && (
            <p className="text-sky-400 text-sm font-medium motion-safe:animate-pulse" aria-live="polite">{phaseLabel}</p>
          )}
          {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
        </div>

        {/* Button */}
        {(phase === 'idle' || phase === 'done') && (
          <button
            onClick={runTest}
            className="mt-4 px-10 py-3.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-full text-base transition-colors shadow-lg shadow-sky-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          >
            {phase === 'done' ? 'Test again' : 'Start test'}
          </button>
        )}
      </div>

      {/* Results panel */}
      {phase === 'done' && download !== null && (
        <div className="border-t border-slate-800 pt-8 pb-4 space-y-6">
          <div className="bg-slate-800/60 rounded-2xl p-5">
            <p className="text-sm text-slate-300 leading-relaxed">{recommendation(download)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: 'Ping', value: `${ping} ms`, note: ping! < 20 ? 'Excellent' : ping! < 50 ? 'Good' : 'High' },
              { label: 'Download', value: `${download} Mbps`, note: speedLabel(download) },
              { label: 'Upload', value: `${upload} Mbps`, note: '' },
              { label: 'Jitter', value: `${jitter} ms`, note: jitter! < 10 ? 'Stable' : jitter! < 30 ? 'Variable' : 'Unstable' },
            ].map(({ label, value, note }) => (
              <div key={label} className="bg-slate-800/40 rounded-xl p-4">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</div>
                <div className="text-xl font-black text-white tabular-nums">{value}</div>
                {note && <div className="text-xs text-sky-400 mt-1">{note}</div>}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/compare"
              onClick={() => trackEvent('speed_test_compare_clicked', { speed_band: speedLabel(download).toLowerCase() })}
              className="flex-1 text-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Compare broadband deals →
            </Link>
            <Link
              href="/guides/broadband-speeds-explained"
              className="flex-1 text-center px-6 py-3 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
            >
              What does my speed mean?
            </Link>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Availability and speeds vary by address. We may earn commission if you buy after clicking through.
          </p>
        </div>
      )}
    </div>
  )
}
