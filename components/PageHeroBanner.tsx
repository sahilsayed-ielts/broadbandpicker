import Image from 'next/image'
import Link from 'next/link'
import type { PageHeroAccent, PageHeroCta } from '@/lib/pageHero'

const ACCENT: Record<
  PageHeroAccent,
  { overlay: string; kicker: string; primary: string }
> = {
  sky: {
    overlay: 'bg-gradient-to-t from-slate-950 via-slate-950/80 to-sky-950/25',
    kicker: 'border-sky-300/40 bg-sky-500/15 text-sky-100',
    primary: 'bg-sky-500 text-slate-950 hover:bg-sky-400',
  },
  cyan: {
    overlay: 'bg-gradient-to-t from-slate-950 via-slate-950/80 to-cyan-950/25',
    kicker: 'border-cyan-300/40 bg-cyan-500/15 text-cyan-100',
    primary: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
  },
  emerald: {
    overlay: 'bg-gradient-to-t from-slate-950 via-slate-950/80 to-emerald-950/20',
    kicker: 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100',
    primary: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
  },
  indigo: {
    overlay: 'bg-gradient-to-t from-slate-950 via-slate-950/80 to-indigo-950/20',
    kicker: 'border-indigo-300/40 bg-indigo-500/15 text-indigo-100',
    primary: 'bg-indigo-400 text-slate-950 hover:bg-indigo-300',
  },
  fuchsia: {
    overlay: 'bg-gradient-to-t from-slate-950 via-slate-950/75 to-fuchsia-950/30',
    kicker: 'border-fuchsia-300/40 bg-fuchsia-500/15 text-fuchsia-100',
    primary: 'bg-fuchsia-500 text-white hover:bg-fuchsia-400',
  },
  amber: {
    overlay: 'bg-gradient-to-t from-slate-950 via-slate-950/80 to-amber-950/20',
    kicker: 'border-amber-300/40 bg-amber-500/15 text-amber-100',
    primary: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
  },
}

export default function PageHeroBanner({
  title,
  kicker,
  lede,
  image,
  imageAlt,
  accent = 'sky',
  ctas,
  priority = true,
}: {
  title: string
  kicker?: string
  lede?: string
  image: string
  imageAlt: string
  accent?: PageHeroAccent
  ctas?: PageHeroCta[]
  priority?: boolean
}) {
  const theme = ACCENT[accent]

  return (
    <header className="relative isolate overflow-hidden bg-slate-950 text-white">
      <Image
        src={image}
        alt={imageAlt}
        width={1600}
        height={900}
        priority={priority}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className={`absolute inset-0 ${theme.overlay}`} />
      <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8">
        {kicker ? (
          <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${theme.kicker}`}>
            {kicker}
          </p>
        ) : null}
        <h1 className={`max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl ${kicker ? 'mt-4' : ''}`}>
          {title}
        </h1>
        {lede ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">{lede}</p>
        ) : null}
        {ctas && ctas.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {ctas.map((cta) =>
              cta.external ? (
                <a
                  key={`${cta.href}-${cta.label}`}
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass(cta.variant ?? 'primary', theme.primary)}
                >
                  {cta.label}
                </a>
              ) : (
                <Link
                  key={`${cta.href}-${cta.label}`}
                  href={cta.href}
                  className={buttonClass(cta.variant ?? 'primary', theme.primary)}
                >
                  {cta.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
      </div>
    </header>
  )
}

function buttonClass(variant: 'primary' | 'secondary', primary: string): string {
  const base = 'inline-flex min-h-11 items-center rounded-lg px-4 py-2 font-semibold'
  if (variant === 'secondary') {
    return `${base} border border-white/30 text-white hover:bg-white/10`
  }
  return `${base} ${primary}`
}
