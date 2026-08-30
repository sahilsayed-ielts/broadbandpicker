'use client'

import { useState } from 'react'
import Link from 'next/link'

const HOUSEHOLDS = [
  {
    id: 'one',
    label: 'One or two people',
    range: '30 to 80 Mbps',
    detail:
      'HD streaming, browsing and the odd video call. A gigabit here is a personality, not a need.',
  },
  {
    id: 'wfh',
    label: 'Working from home',
    range: '80 to 150 Mbps',
    detail:
      'Upload and ping matter more than the download brag. Two Zooms plus iPlayer will show a weak uplink.',
  },
  {
    id: 'family',
    label: 'Busy family',
    range: '150 to 300 Mbps',
    detail:
      'Several 4K streams, consoles and homework at once. Full fibre helps because the upload stays useful at 7pm.',
  },
  {
    id: 'packed',
    label: 'Packed house',
    range: '300 Mbps and up',
    detail:
      'HMO, students, creators, lots of devices. Check the postcode first. A vanity gigabit on copper is still copper.',
  },
] as const

export default function HomepageSpeedNeed() {
  const [active, setActive] = useState<(typeof HOUSEHOLDS)[number]['id']>('family')
  const current = HOUSEHOLDS.find((item) => item.id === active) ?? HOUSEHOLDS[2]

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HOUSEHOLDS.map((item) => {
          const selected = item.id === active
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              aria-pressed={selected}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                selected
                  ? 'border-sky-500 bg-sky-50 shadow-sm ring-2 ring-sky-200'
                  : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm font-bold text-slate-900">{item.label}</p>
              <p className="mt-2 text-lg font-extrabold text-sky-700">{item.range}</p>
            </button>
          )
        })}
      </div>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm font-semibold text-slate-900">{current.label}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{current.detail}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/tools/broadband-match"
            className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white transition-transform hover:bg-sky-600 hover:scale-[1.02]"
          >
            Match my household
          </Link>
          <Link
            href="/guides/broadband-speeds-explained"
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          >
            Speed guide
          </Link>
        </div>
      </div>
    </div>
  )
}
