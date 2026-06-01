import type { Provider } from '@/types'
import AffiliateCTA from './AffiliateCTA'
import SpeedBadge from './SpeedBadge'
import ProviderLogo from './ProviderLogo'

interface ComparisonTableProps {
  providers: Provider[]
}

function Stars({ score }: { score: number }) {
  const stars = Math.round(score)
  return (
    <span className="flex items-center gap-0.5" aria-label={`${score} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${n <= stars ? 'text-amber-400' : 'text-slate-300'}`}
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

export default function ComparisonTable({ providers }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[700px] text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Provider</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">From</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Max speed</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Contract</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Setup</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Coverage</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Rating</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {providers.map((p) => {
            const maxSpeed = p.speeds.reduce((a, b) => (b.download > a.download ? b : a))
            return (
              <tr key={p.slug} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <ProviderLogo slug={p.slug} name={p.name} width={72} height={36} />
                </td>
                <td className="px-4 py-4">
                  <span className="font-bold text-slate-900">£{p.monthlyPriceFrom.toFixed(2)}</span>
                  <span className="text-slate-400 text-xs">/mo</span>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold">{maxSpeed.download} Mbps</div>
                  <SpeedBadge download={maxSpeed.download} className="mt-1" />
                </td>
                <td className="px-4 py-4 text-slate-600">{p.contractLengths.join(' / ')} mo</td>
                <td className="px-4 py-4">
                  {p.setupFee === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    `£${p.setupFee}`
                  )}
                </td>
                <td className="px-4 py-4 text-slate-600">{p.coveragePercent}%</td>
                <td className="px-4 py-4">
                  <Stars score={p.trustpilotScore} />
                </td>
                <td className="px-4 py-4">
                  <AffiliateCTA href={p.affiliateUrl} providerName={p.name} size="sm" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
