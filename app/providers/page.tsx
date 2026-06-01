import type { Metadata } from 'next'
import Link from 'next/link'
import { providers } from '@/data/providers'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import ProviderLogo from '@/components/ProviderLogo'

export const metadata: Metadata = {
  title: 'UK Broadband Provider Reviews 2026',
  description:
    'In-depth reviews of every major UK broadband provider — BT, Sky, Virgin Media, EE, TalkTalk, Vodafone, Plusnet and more. Compare speeds, prices, and customer ratings.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/providers' },
  openGraph: {
    title: 'UK Broadband Provider Reviews 2026 | BroadbandPicker',
    description: 'In-depth reviews of every major UK broadband provider.',
    url: 'https://broadbandpicker.co.uk/providers',
  },
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'UK Broadband Providers',
  itemListElement: providers.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: p.name,
    url: `https://broadbandpicker.co.uk/providers/${p.slug}`,
  })),
}

function Stars({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${score} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(score) ? 'text-amber-400' : 'text-slate-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-slate-500">{score.toFixed(1)}</span>
    </span>
  )
}

export default function ProvidersPage() {
  const sorted = [...providers].sort((a, b) => b.trustpilotScore - a.trustpilotScore)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Provider reviews', href: '/providers' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        UK Broadband Provider Reviews
      </h1>
      <p className="text-slate-600 mb-8 max-w-2xl">
        We&apos;ve reviewed every major UK broadband provider to help you choose the right one.
        Sorted by customer rating.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((p) => {
          const maxSpeed = p.speeds.reduce((a, b) => (b.download > a.download ? b : a))
          return (
            <Link
              key={p.slug}
              href={`/providers/${p.slug}`}
              className="block bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <ProviderLogo slug={p.slug} name={p.name} width={80} height={40} />
                <Stars score={p.trustpilotScore} />
              </div>

              <h2 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-1">
                {p.name} Broadband
              </h2>

              <div className="text-sm text-slate-600 space-y-1 mb-4">
                <div>
                  From{' '}
                  <span className="font-semibold text-slate-900">
                    £{p.monthlyPriceFrom.toFixed(2)}/mo
                  </span>
                </div>
                <div>
                  Up to{' '}
                  <span className="font-semibold text-slate-900">{maxSpeed.download} Mbps</span>
                </div>
                <div>
                  Covers{' '}
                  <span className="font-semibold text-slate-900">{p.coveragePercent}%</span> of UK
                  homes
                </div>
              </div>

              <ul className="text-sm text-slate-600 space-y-1 mb-4">
                {p.highlights.slice(0, 2).map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>

              <span className="text-sky-600 text-sm font-semibold">
                Read review &rarr;
              </span>
            </Link>
          )
        })}
      </div>

      <div className="mt-10 p-6 bg-slate-50 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Not sure which provider to choose?
        </h2>
        <p className="text-slate-600 text-sm mb-4">
          Use our comparison tool to see all providers side by side, or enter your postcode to
          see which providers serve your area.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/compare"
            className="px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg text-sm hover:bg-sky-600 transition-colors"
          >
            Compare all providers
          </Link>
          <Link
            href="/guides/how-to-switch-broadband-uk"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            How to switch broadband
          </Link>
        </div>
      </div>
    </div>
  )
}
