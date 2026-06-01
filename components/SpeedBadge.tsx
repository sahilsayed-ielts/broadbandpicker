interface SpeedBadgeProps {
  download: number
  className?: string
}

function getTier(download: number): { label: string; colour: string } {
  if (download >= 900) return { label: 'Gigabit', colour: 'bg-purple-100 text-purple-800' }
  if (download >= 300) return { label: 'Ultrafast', colour: 'bg-sky-100 text-sky-800' }
  if (download >= 30) return { label: 'Superfast', colour: 'bg-green-100 text-green-700' }
  return { label: 'Standard', colour: 'bg-slate-100 text-slate-700' }
}

export default function SpeedBadge({ download, className = '' }: SpeedBadgeProps) {
  const { label, colour } = getTier(download)
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colour} ${className}`}
    >
      {label}
    </span>
  )
}
