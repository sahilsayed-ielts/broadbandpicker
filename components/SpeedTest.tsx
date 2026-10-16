'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'
import { roundMbps, runProfessionalSpeedTest } from '@/lib/speedTestMeasure'
import {
  queryGeoPermission,
  requestSpeedTestLocation,
  skipLocationThisVisit,
  skippedLocationThisVisit,
  type SpeedTestPlace,
} from '@/lib/speedTestLocation'

type Phase = 'idle' | 'ping' | 'download' | 'upload' | 'done'
type GeoState = PermissionState | 'unsupported' | 'skipped' | 'timeout'

const R = 75
const CX = 100
const CY = 100
const CIRC = 2 * Math.PI * R
const GAUGE = CIRC * 0.75
const GAP = CIRC * 0.25
const MAX_MBPS = 1000

function arcFill(mbps: number) {
  return GAUGE * Math.min(mbps / MAX_MBPS, 1)
}

function speedColor(mbps: number) {
  if (mbps < 20) return '#ef4444'
  if (mbps < 50) return '#f97316'
  if (mbps < 100) return '#eab308'
  if (mbps < 300) return '#22c55e'
  return '#0ea5e9'
}

function speedLabel(mbps: number) {
  if (mbps < 10) return 'Very slow'
  if (mbps < 30) return 'Basic'
  if (mbps < 100) return 'Standard'
  if (mbps < 300) return 'Fast'
  if (mbps < 600) return 'Superfast'
  return 'Gigabit'
}

function recommendation(download: number, upload: number, ping: number, loaded: number | null) {
  const bufferbloat = loaded !== null && loaded - ping > 80
  if (download < 10) {
    return 'This result is slow for modern household use. Repeat over Ethernet, pause other devices, then compare with the minimum guaranteed speed in your contract.'
  }
  if (bufferbloat) {
    return 'Download may look acceptable, but ping rose sharply under load. That usually feels like stalling video calls. Test on Ethernet and check whether a backup or stream was running.'
  }
  if (upload < 5 && download >= 30) {
    return 'Download is in Ofcom’s superfast range, but upload is tight for HD video calls and cloud backup. Full fibre is the usual upgrade if the evening speed holds.'
  }
  if (download < 30) {
    return 'This may support everyday use for a small household. Simultaneous 4K streams and calls could be limited. Repeat at least three times, including once in the evening.'
  }
  if (download < 100) {
    return 'This is within Ofcom’s superfast range. It should suit many homes if the measured upload and evening speed also hold.'
  }
  if (download < 300) {
    return 'This is a fast superfast result and should support a busy connected household, provided Wi-Fi in the room matches this figure.'
  }
  return 'This is an ultrafast result under Ofcom’s speed categories. Compare repeated Ethernet tests with the service level and price in your contract.'
}

function ratingDots(score: number) {
  return Array.from({ length: 5 }, (_, index) => index < score)
}

function experience(download: number, upload: number, ping: number, jitter: number) {
  const browsing = download >= 10 && ping < 100 ? (download >= 30 && ping < 40 ? 5 : 4) : download >= 5 ? 3 : 2
  const streaming = download >= 50 ? 5 : download >= 25 ? 4 : download >= 15 ? 3 : download >= 5 ? 2 : 1
  const calls = upload >= 10 && ping < 50 ? 5 : upload >= 5 && ping < 80 ? 4 : upload >= 3 ? 3 : 2
  const gaming = ping < 30 && jitter < 10 ? 5 : ping < 60 && jitter < 20 ? 4 : ping < 100 ? 3 : 2
  return [
    { label: 'Web browsing', score: browsing },
    { label: 'Video streaming', score: streaming },
    { label: 'Video calls', score: calls },
    { label: 'Online gaming', score: gaming },
  ]
}

export default function SpeedTest() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [liveSpeed, setLiveSpeed] = useState(0)
  const [ping, setPing] = useState<number | null>(null)
  const [download, setDownload] = useState<number | null>(null)
  const [upload, setUpload] = useState<number | null>(null)
  const [jitter, setJitter] = useState<number | null>(null)
  const [loadedPing, setLoadedPing] = useState<number | null>(null)
  const [sustain, setSustain] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [place, setPlace] = useState<SpeedTestPlace | null>(null)
  const [geoState, setGeoState] = useState<GeoState>('prompt')
  const [geoBusy, setGeoBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (skippedLocationThisVisit()) {
        if (!cancelled) setGeoState('skipped')
        return
      }
      const permission = await queryGeoPermission()
      if (cancelled) return
      setGeoState(permission)
      if (permission === 'granted') {
        try {
          const result = await requestSpeedTestLocation()
          if (!cancelled && result.ok) setPlace(result.place)
        } catch {
          /* keep the test usable without a place */
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const askForLocation = useCallback(async () => {
    setGeoBusy(true)
    try {
      const result = await requestSpeedTestLocation()
      if (result.ok) {
        setPlace(result.place)
        setGeoState('granted')
        trackEvent('speed_test_location', { granted: true, in_uk: result.place.inUk ? 1 : 0 })
        return result.place
      }
      setGeoState(
        result.reason === 'denied'
          ? 'denied'
          : result.reason === 'unsupported'
            ? 'unsupported'
            : result.reason === 'timeout' || result.reason === 'unavailable'
              ? 'timeout'
              : 'skipped',
      )
      trackEvent('speed_test_location', { granted: false, in_uk: 0 })
      return null
    } catch {
      setGeoState('denied')
      trackEvent('speed_test_location', { granted: false, in_uk: 0 })
      return null
    } finally {
      setGeoBusy(false)
    }
  }, [])

  const runTest = useCallback(async () => {
    let currentPlace = place
    if (geoState === 'prompt' && !skippedLocationThisVisit()) {
      currentPlace = await askForLocation()
    }
    trackEvent('speed_test_started', {
      device_category: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
      test_context: 'speed-test-page',
    })
    setPhase('ping')
    setPing(null)
    setDownload(null)
    setUpload(null)
    setJitter(null)
    setLoadedPing(null)
    setSustain(null)
    setLiveSpeed(0)
    setError(null)

    try {
      const result = await runProfessionalSpeedTest((nextPhase, mbps) => {
        setPhase(nextPhase)
        setLiveSpeed(mbps)
      })
      const dl = roundMbps(result.downloadMbps)
      const ul = roundMbps(result.uploadMbps)
      const pingMs = Math.round(result.pingMs)
      const jitterMs = Math.round(result.jitterMs)
      setPing(pingMs)
      setJitter(jitterMs)
      setDownload(dl)
      setUpload(ul)
      setLoadedPing(result.loadedPingMs === null ? null : Math.round(result.loadedPingMs))
      setSustain(roundMbps(result.downloadSustainMbps))
      setLiveSpeed(result.downloadMbps)
      setPhase('done')
      trackEvent('speed_test_completed', {
        ping_ms: pingMs,
        download_mbps: dl,
        upload_mbps: ul,
        jitter_ms: jitterMs,
        loaded_ping_ms: result.loadedPingMs === null ? 0 : Math.round(result.loadedPingMs),
        speed_band: speedLabel(dl).toLowerCase(),
        location_used: currentPlace?.inUk ? 1 : 0,
        device_category: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
      })
    } catch {
      trackEvent('speed_test_failed')
      setError('Test failed. Check the connection and try again.')
      setPhase('idle')
    }
  }, [askForLocation, geoState, place])

  const dialSpeed = phase === 'done' ? (download ?? 0) : liveSpeed
  const fill = arcFill(dialSpeed)
  const dialColor = speedColor(dialSpeed)
  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload'
  const phaseLabel =
    phase === 'ping' ? 'Measuring idle ping…' : phase === 'download' ? 'Filling download…' : phase === 'upload' ? 'Filling upload…' : ''

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="flex flex-col items-center py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-400">UK multi-stream test</p>
        <div className="relative">
          <svg width="240" height="215" viewBox="0 12 200 188" aria-hidden="true">
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeDasharray={`${GAUGE} ${GAP}`}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
            />
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={dialSpeed > 0 ? dialColor : '#1e293b'}
              strokeWidth="14"
              strokeDasharray={`${fill} ${CIRC - fill}`}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
              style={{ transition: 'stroke-dasharray 0.18s ease, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pb-4">
            {phase === 'idle' || phase === 'ping' ? (
              <>
                <span className="text-5xl font-black leading-none text-white tabular-nums">—</span>
                <span className="mt-1 text-sm text-slate-400">Mbps</span>
              </>
            ) : (
              <>
                <span className="text-5xl font-black leading-none tabular-nums" style={{ color: dialColor }}>
                  {dialSpeed < 10 ? dialSpeed.toFixed(1) : Math.round(dialSpeed)}
                </span>
                <span className="mt-1 text-sm text-slate-400">Mbps</span>
                {phase === 'done' && download !== null ? (
                  <span className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: dialColor }}>
                    {speedLabel(download)}
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8" aria-live="polite">
          {[
            { label: 'Ping', value: ping !== null ? `${ping} ms` : '—' },
            { label: 'Download', value: download !== null ? `${download} Mbps` : '—' },
            { label: 'Upload', value: upload !== null ? `${upload} Mbps` : '—' },
            { label: 'Jitter', value: jitter !== null ? `${jitter} ms` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">{label}</div>
              <div className="text-lg font-bold tabular-nums text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 h-6">
          {isRunning ? (
            <p className="text-sm font-medium text-sky-400 motion-safe:animate-pulse" aria-live="polite">
              {phaseLabel}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        {phase === 'idle' && geoState === 'prompt' ? (
          <div className="mt-4 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left">
            <p className="text-sm font-semibold text-white">Use your location for a more useful result</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Chrome, Safari and Firefox will show their usual location prompt. You can allow while visiting this
              site, allow this time, or never allow. We use the coordinates only in your browser to confirm you are
              in the UK and find the nearest postcode district. The speed measurement still runs to our London
              server. Coordinates are not sent to analytics.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void askForLocation()}
                disabled={geoBusy}
                className="flex-1 rounded-full bg-sky-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-60"
              >
                {geoBusy ? 'Waiting for browser…' : 'Allow location'}
              </button>
              <button
                type="button"
                onClick={() => {
                  skipLocationThisVisit()
                  setGeoState('skipped')
                  trackEvent('speed_test_location', { granted: false, in_uk: 0 })
                }}
                className="flex-1 rounded-full border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-400"
              >
                Not this time
              </button>
            </div>
          </div>
        ) : null}

        {place?.inUk && place.postcode ? (
          <p className="mt-4 text-sm text-sky-300">
            Near {place.district ? `${place.district}, ` : ''}
            {place.postcode}
            {place.kmFromLondon > 0 ? ` · about ${place.kmFromLondon} km from the London test server` : ''}
          </p>
        ) : null}
        {place?.inUk && !place.postcode ? (
          <p className="mt-4 text-sm text-sky-300">UK location confirmed. The test still uses our London server.</p>
        ) : null}
        {place && !place.inUk ? (
          <p className="mt-4 text-sm text-amber-300">
            Location looks outside the UK. Ping will include the extra distance to London
            {place.kmFromLondon > 0 ? ` (about ${place.kmFromLondon} km)` : ''}.
          </p>
        ) : null}
        {geoState === 'denied' ? (
          <p className="mt-4 text-sm text-slate-400">Location is blocked in the browser. The test still runs to our London server.</p>
        ) : null}
        {geoState === 'timeout' ? (
          <p className="mt-4 text-sm text-slate-400">Could not get a location fix in time. The test still runs to our London server.</p>
        ) : null}
        {geoState === 'unsupported' ? (
          <p className="mt-4 text-sm text-slate-400">This browser cannot share location. The test still runs to our London server.</p>
        ) : null}
        {phase === 'idle' && (geoState === 'skipped' || geoState === 'timeout') ? (
          <button
            type="button"
            onClick={() => void askForLocation()}
            disabled={geoBusy}
            className="mt-3 text-sm font-semibold text-sky-300 underline-offset-2 hover:underline disabled:opacity-60"
          >
            {geoBusy ? 'Waiting for browser…' : 'Share location'}
          </button>
        ) : null}

        {(phase === 'idle' || phase === 'done') && (
          <button
            onClick={runTest}
            disabled={geoBusy}
            className="mt-4 rounded-full bg-sky-500 px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-500/20 transition-colors hover:bg-sky-600 active:bg-sky-700 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          >
            {geoBusy ? 'Waiting for browser…' : phase === 'done' ? 'Test again' : 'Start test'}
          </button>
        )}
      </div>

      {phase === 'done' && download !== null && upload !== null && ping !== null && jitter !== null ? (
        <div className="space-y-6 border-t border-slate-800 pt-8 pb-2">
          <div className="rounded-2xl bg-slate-800/60 p-5">
            <p className="text-sm leading-relaxed text-slate-300">{recommendation(download, upload, ping, loadedPing)}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-4">
            {[
              { label: 'Ping', value: `${ping} ms`, note: ping < 20 ? 'Excellent' : ping < 50 ? 'Good' : 'High' },
              { label: 'Download', value: `${download} Mbps`, note: speedLabel(download) },
              { label: 'Upload', value: `${upload} Mbps`, note: upload < 10 ? 'Watch calls' : 'Usable' },
              { label: 'Jitter', value: `${jitter} ms`, note: jitter < 10 ? 'Stable' : jitter < 30 ? 'Variable' : 'Unstable' },
            ].map(({ label, value, note }) => (
              <div key={label} className="rounded-xl bg-slate-800/40 p-4">
                <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">{label}</div>
                <div className="text-xl font-black tabular-nums text-white">{value}</div>
                {note ? <div className="mt-1 text-xs text-sky-400">{note}</div> : null}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
            <div className="rounded-xl border border-slate-800 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Sustain</div>
              <div className="mt-1 font-semibold tabular-nums">{sustain ?? '—'} Mbps</div>
            </div>
            <div className="rounded-xl border border-slate-800 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Loaded ping</div>
              <div className="mt-1 font-semibold tabular-nums">{loadedPing !== null ? `${loadedPing} ms` : '—'}</div>
            </div>
            <div className="rounded-xl border border-slate-800 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Connections</div>
              <div className="mt-1 font-semibold">6 down / 4 up</div>
            </div>
            <div className="rounded-xl border border-slate-800 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Server</div>
              <div className="mt-1 font-semibold">London</div>
            </div>
            <div className="rounded-xl border border-slate-800 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Your area</div>
              <div className="mt-1 font-semibold">
                {place?.inUk && place.postcode ? place.postcode : place?.inUk ? 'UK' : 'Not shared'}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Likely experience from this snapshot</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {experience(download, upload, ping, jitter).map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-800/40 p-3">
                  <div className="text-xs text-slate-400">{item.label}</div>
                  <div className="mt-2 flex gap-1" aria-label={`${item.score} out of 5`}>
                    {ratingDots(item.score).map((on, index) => (
                      <span key={index} className={`h-2 w-2 rounded-full ${on ? 'bg-sky-400' : 'bg-slate-600'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={place?.inUk && place.pagePrefix ? `/postcode/${place.pagePrefix}` : '/compare'}
              onClick={() => trackEvent('speed_test_compare_clicked', {
                speed_band: speedLabel(download).toLowerCase(),
                cta_placement: 'results-card',
                device_category: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
              })}
              className="flex-1 rounded-xl bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-sky-600"
            >
              {place?.inUk && place.pagePrefix
                ? `Compare deals in ${place.pagePrefix.toUpperCase()}`
                : 'Compare broadband deals →'}
            </Link>
            <Link
              href="/guides/what-broadband-speed-do-i-need"
              className="flex-1 rounded-xl border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-300 transition-colors hover:border-slate-600"
            >
              What speed do I need?
            </Link>
          </div>
          <p className="text-center text-xs text-slate-500">
            Headline download is the 90th percentile after discarding TCP slow start. This is the path to our London server, not an Ofcom-accredited line test. Availability varies by address. We may earn commission if you buy after clicking through.
          </p>
        </div>
      ) : null}
    </div>
  )
}
