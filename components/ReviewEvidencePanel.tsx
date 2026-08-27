import Link from 'next/link'
import type { Provider } from '@/types'
import { getProviderReviewEvidence, type ReviewEvidenceMetric } from '@/data/provider-review-evidence'

const toneStyles: Record<ReviewEvidenceMetric['tone'], string> = {
  positive: 'border-emerald-200 bg-emerald-50',
  neutral: 'border-slate-200 bg-slate-50',
  caution: 'border-amber-200 bg-amber-50',
}

function EvidenceCard({ metric }: { metric: ReviewEvidenceMetric }) {
  const external = metric.sourceUrl.startsWith('http')

  return (
    <article className={`rounded-xl border p-4 ${toneStyles[metric.tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{metric.label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{metric.value}</p>
      <p className="mt-1 text-xs text-slate-500">{metric.period}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{metric.context}</p>
      {external ? (
        <a
          href={metric.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm font-semibold text-sky-700 hover:underline"
        >
          {metric.sourceLabel} <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <Link href={metric.sourceUrl} className="mt-3 inline-flex text-sm font-semibold text-sky-700 hover:underline">
          {metric.sourceLabel}
        </Link>
      )}
    </article>
  )
}

export default function ReviewEvidencePanel({
  providers,
  heading = 'Customer-review evidence',
}: {
  providers: Provider[]
  heading?: string
}) {
  const evidence = providers.map((provider) => ({
    provider,
    metrics: getProviderReviewEvidence(provider),
  }))

  return (
    <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="review-evidence-heading">
      <div className="max-w-3xl">
        <h2 id="review-evidence-heading" className="text-xl font-bold text-slate-900">
          {heading}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          These signals are shown separately because they measure different things. Ofcom complaints
          record serious escalations, surveys measure experiences across a sample, and public reviews
          reflect self-selecting recent sentiment. We never combine them into an invented trust score.
        </p>
      </div>

      <div className={`mt-5 grid gap-6 ${providers.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {evidence.map(({ provider, metrics }) => (
          <div key={provider.slug}>
            {providers.length > 1 && <h3 className="mb-3 text-lg font-bold text-slate-900">{provider.name}</h3>}
            {metrics.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <EvidenceCard key={`${provider.slug}-${metric.label}`} metric={metric} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                {provider.name} is no longer sold to new customers. Historic review scores are not
                presented as evidence for its successor service.
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
        Missing a metric does not mean a provider performed badly. Some providers are below Ofcom’s
        reporting threshold or were not named in a comparable survey. Read our{' '}
        <Link href="/research/uk-broadband-customer-satisfaction" className="font-semibold text-sky-700 hover:underline">
          evidence dashboard
        </Link>{' '}
        and{' '}
        <Link href="/how-we-review-broadband" className="font-semibold text-sky-700 hover:underline">
          review methodology
        </Link>
        .
      </p>
    </section>
  )
}

