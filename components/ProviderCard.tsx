import Link from 'next/link'
import type { Provider } from '@/types'
import AffiliateCTA from './AffiliateCTA'
import SpeedBadge from './SpeedBadge'
import ProviderLogo from './ProviderLogo'

interface ProviderCardProps {
  provider: Provider
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const topSpeed = provider.speeds.reduce((a, b) => (b.download > a.download ? b : a))

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <ProviderLogo slug={provider.slug} name={provider.name} width={80} height={40} />
        <SpeedBadge download={topSpeed.download} />
      </div>

      <div className="mb-3">
        <span className="text-2xl font-bold text-slate-900">£{provider.monthlyPriceFrom.toFixed(2)}</span>
        <span className="text-slate-500 text-sm">/mo</span>
      </div>

      <ul className="space-y-1 mb-4">
        {provider.highlights.map((h, i) => (
          <li key={i} className="text-sm text-slate-600 flex items-start gap-1.5">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {h}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <AffiliateCTA
          href={provider.affiliateUrl}
          providerName={provider.name}
          providerSlug={provider.slug}
          placement="provider_card"
          className="flex-1 text-center"
        />
        <Link
          href={`/providers/${provider.slug}`}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Review
        </Link>
      </div>
    </div>
  )
}
