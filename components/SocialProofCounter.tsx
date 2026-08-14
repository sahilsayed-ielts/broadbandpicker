'use client'

import { useEffect, useState } from 'react'

// Cumulative users added from midnight up to each hour.
// Follows UK web traffic: slow overnight, rises through morning,
// peaks 12–5pm, tapers evening. Ends the day at ~1,020 on top of base.
const CUM_BY_HOUR = [
    0,   8,  14,  18,  23,  32,  52,  88,
  140, 208, 282, 362, 447, 535, 618, 694,
  762, 822, 872, 912, 944, 968, 986, 998,
]

const BASE = 412 // shown at midnight — implies prior usage

function computeTarget(sessionOffset: number): number {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()

  const atHour   = BASE + CUM_BY_HOUR[h]
  const atNext   = BASE + (CUM_BY_HOUR[h + 1] ?? CUM_BY_HOUR[23] + 12)
  const partial  = Math.floor((m / 60) * (atNext - atHour))

  return atHour + partial + sessionOffset
}

function getSessionOffset(): number {
  try {
    const key = 'bbp_sp_offset'
    const stored = sessionStorage.getItem(key)
    if (stored !== null) return parseInt(stored, 10)
    // Each visitor gets a fixed random offset -18…+18
    const offset = Math.floor(Math.random() * 37) - 18
    sessionStorage.setItem(key, String(offset))
    return offset
  } catch {
    return 0
  }
}

export default function SocialProofCounter() {
  const [displayed, setDisplayed] = useState<number | null>(null)

  useEffect(() => {
    const offset = getSessionOffset()
    const target = computeTarget(offset)

    // Count up from target-40 to target over ~1.4s
    const start  = target - 40
    const startTs = performance.now()
    const duration = 1400

    let raf: number

    function tick(now: number) {
      const elapsed = now - startTs
      const pct     = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased   = 1 - Math.pow(1 - pct, 3)
      setDisplayed(Math.round(start + eased * 40))
      if (pct < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    // Increment by 1 every ~90s to stay live through the session
    const interval = setInterval(() => {
      const fresh = computeTarget(offset)
      setDisplayed(fresh)
    }, 90_000)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(interval)
    }
  }, [])

  if (displayed === null) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-5 mb-1">
      {/* Pulsing green dot */}
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
      </span>
      <p className="text-sky-200 text-sm font-medium">
        <span className="text-white font-bold tabular-nums">
          {displayed.toLocaleString('en-GB')}
        </span>{' '}
        people compared deals today
      </p>
    </div>
  )
}
