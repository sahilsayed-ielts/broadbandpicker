type BadgeType = 'Best Value' | 'Fastest' | "Editor's Pick"

interface DealBadgeProps {
  type: BadgeType
}

const config: Record<BadgeType, { bg: string; text: string; icon: React.ReactNode }> = {
  'Best Value': {
    bg: 'bg-green-700',
    text: 'text-white',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M6 1l1.545 3.13L11 4.635l-2.5 2.436.59 3.44L6 8.87l-3.09 1.64.59-3.44L1 4.635l3.455-.505L6 1z" />
      </svg>
    ),
  },
  'Fastest': {
    bg: 'bg-sky-700',
    text: 'text-white',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h6M7 4l2 2-2 2" />
      </svg>
    ),
  },
  "Editor's Pick": {
    bg: 'bg-amber-700',
    text: 'text-white',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <circle cx="6" cy="6" r="5" />
      </svg>
    ),
  },
}

export default function DealBadge({ type }: DealBadgeProps) {
  const { bg, text, icon } = config[type]
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${bg} ${text}`}
    >
      {icon}
      {type}
    </span>
  )
}
