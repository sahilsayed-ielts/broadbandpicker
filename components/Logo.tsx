interface LogoProps {
  size?: number
  showWordmark?: boolean
  wordmarkClassName?: string
}

export default function Logo({ size = 28, showWordmark = true, wordmarkClassName = 'text-slate-900' }: LogoProps) {
  return (
    <span className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#0EA5E9" />
        <path d="M6 18c2-4 4-6 8-6s6 2 8 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M9 18c1-2 2-3 5-3s4 1 5 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="18" r="1.5" fill="white" />
      </svg>
      {showWordmark && (
        <span className={`font-bold ${wordmarkClassName}`} style={{ fontSize: size * 0.57 }}>
          BroadbandPicker
        </span>
      )}
    </span>
  )
}
