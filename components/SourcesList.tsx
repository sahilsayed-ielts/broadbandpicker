import Link from 'next/link'

export type SourceItem = {
  label: string
  href: string
  note?: string
  external?: boolean
}

export default function SourcesList({
  sources,
  intro,
}: {
  sources: SourceItem[]
  intro?: string
}) {
  if (sources.length === 0) return null
  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-3">Sources</h2>
      {intro ? <p className="mb-4 text-sm text-slate-600">{intro}</p> : null}
      <ul className="space-y-2 text-sm">
        {sources.map((source) => (
          <li key={source.href}>
            {source.external || source.href.startsWith('http') ? (
              <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                {source.label}
              </a>
            ) : (
              <Link href={source.href} className="text-sky-600 hover:underline">
                {source.label}
              </Link>
            )}
            {source.note ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{source.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
