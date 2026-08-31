import Link from 'next/link'
import type { Provider } from '@/types'
import ProviderLogo from '@/components/ProviderLogo'

export default function HomepageLogoRail({ providers }: { providers: Provider[] }) {
  return (
    <section className="border-b border-slate-200 bg-slate-50 py-8" aria-label="UK broadband providers we compare">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Compare deals from Britain&apos;s biggest broadband providers
        </p>
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {providers.map((provider) => (
            <li key={provider.slug}>
              <Link
                href={`/providers/${provider.slug}`}
                className="group relative block h-16 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
              >
                <ProviderLogo
                  slug={provider.slug}
                  name={provider.name}
                  fillTile
                  className={
                    provider.slug === 'now-broadband'
                      ? 'rounded-xl border-0 bg-black'
                      : 'rounded-xl border-0 bg-white'
                  }
                />
                {provider.retiredDate ? (
                  <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-amber-50 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-800">
                    Retired
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
