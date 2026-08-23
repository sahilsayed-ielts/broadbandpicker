interface RatingStarsProps {
  score: number
  outOf?: number
  size?: number
  showScore?: boolean
}

export default function RatingStars({ score, outOf = 5, size = 16, showScore = true }: RatingStarsProps) {
  const pct = Math.max(0, Math.min(1, score / outOf))
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${score.toFixed(1)} out of ${outOf}`}>
      <span className="relative inline-flex" style={{ width: size * 5, height: size }}>
        <span className="absolute inset-0 flex gap-0.5 text-slate-200" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex gap-0.5 text-amber-400 overflow-hidden"
          style={{ width: `${pct * 100}%` }}
          aria-hidden="true"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} />
          ))}
        </span>
      </span>
      {showScore && <span className="text-sm font-semibold text-slate-900">{score.toFixed(1)}</span>}
    </span>
  )
}

function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.959c.3.92-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.287-3.96a1 1 0 00-.364-1.117L2.062 9.386c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69z" />
    </svg>
  )
}
