'use client'

import Image from 'next/image'

interface ProviderLogoProps {
  slug: string
  name: string
  width?: number
  height?: number
  className?: string
  preload?: boolean
  fillTile?: boolean
}

const providerTheme: Record<string, string> = {
  'now-broadband': 'bg-black border-black',
}

export default function ProviderLogo({
  slug,
  name,
  width = 80,
  height = 40,
  className = '',
  preload = false,
  fillTile = false,
}: ProviderLogoProps) {
  const themeClass = providerTheme[slug] ?? 'bg-white border-slate-200'

  return (
    <div
      className={`relative overflow-hidden rounded border ${themeClass} ${fillTile ? 'h-full w-full' : ''} ${className}`}
      style={fillTile ? undefined : { width, height }}
      aria-label={`${name} logo`}
    >
      <Image
        src={`/logos/${slug}.svg`}
        alt={`${name} broadband`}
        fill
        unoptimized
        sizes={fillTile ? '(max-width: 640px) 33vw, 140px' : `${width}px`}
        className={`object-contain ${fillTile ? 'p-2.5' : 'p-1.5'}`}
        preload={preload}
      />
    </div>
  )
}
