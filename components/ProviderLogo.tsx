'use client'

import Image from 'next/image'

interface ProviderLogoProps {
  slug: string
  name: string
  width?: number
  height?: number
  className?: string
  preload?: boolean
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
}: ProviderLogoProps) {
  const themeClass = providerTheme[slug] ?? 'bg-white border-slate-100'

  return (
    <div
      className={`flex items-center justify-center rounded border p-2 ${themeClass} ${className}`}
      style={{ width, minHeight: height }}
      aria-label={`${name} logo`}
    >
      <Image
        src={`/logos/${slug}.svg`}
        alt={`${name} broadband`}
        width={width - 16}
        height={height - 8}
        className="object-contain"
        preload={preload}
        onError={() => {}}
      />
    </div>
  )
}
