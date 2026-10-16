import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AffiliateCTA from '@/components/AffiliateCTA'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import ShareBar from '@/components/ShareBar'
import { comparisonPath } from '@/lib/shareCodes'
import { SITE_URL } from '@/lib/siteSchema'
import { matchFromCode } from './data'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const m = matchFromCode(code)
  if (!m) return { robots: { index: false, follow: false } }
  const title = `Broadband Match shortlist: ${m.providers.map((p) => p.name).join(', ')}`
  const description = `A household needing around ${m.minSpeed} Mbps was matched with ${m.providers.map((p) => p.name).join(', ')}. Take the free quiz to find yours.`
  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/tools/broadband-match` },
    openGraph: { title: `${title} | BroadbandPicker`, description, url: `${SITE_URL}/tools/broadband-match/result/${code}` },
  }
}

export default async function MatchResultPage({ params }: Props) {
  const { code } = await params
  const m = matchFromCode(code)
  if (!m) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Tools', href: '/tools' }, { name: 'Broadband Match', href: '/tools/broadband-match' }, { name: 'Shared shortlist', href: `/tools/broadband-match/result/${code}` }]} />
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Shared Broadband Match shortlist</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Matched for a household needing around {m.minSpeed} Mbps</h1>
      <p className="mt-3 text-slate-600">
        Someone took the Broadband Match quiz and shared their top {m.providers.length === 1 ? 'provider' : `${m.providers.length} providers`}.
        Your household may need something different, so take the quiz yourself before choosing.
      </p>
      <ol className="mt-6 space-y-3">
        {m.providers.map((p, i) => (
          <li key={p.slug} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-xs font-bold uppercase text-sky-700">#{i + 1} match</p>
              <p className="text-lg font-bold text-slate-900">{p.name}</p>
              <p className="text-sm text-slate-500">From £{p.monthlyPriceFrom.toFixed(2)}/mo · up to {Math.max(...p.speeds.map((s) => s.download))} Mbps</p>
            </div>
            <div className="flex items-center gap-3">
              <AffiliateCTA href={p.affiliateUrl} providerName={p.name} providerSlug={p.slug} placement="shared_match" size="sm" />
              <Link href={`/providers/${p.slug}`} className="text-sm font-semibold text-sky-700 hover:underline">Review</Link>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/tools/broadband-match" className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800">Take the quiz myself</Link>
        {m.providers.length >= 2 && (
          <Link href={comparisonPath(m.providers.map((p) => p.slug))} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Compare these side by side</Link>
        )}
      </div>
      <div className="mt-8">
        <ShareBar url={`/tools/broadband-match/result/${code}`} title="Broadband Match shortlist" text={`Broadband Match picked ${m.providers.map((p) => p.name).join(', ')}:`} contentType="broadband_match_result" itemId={m.providers.map((p) => p.slug).join(',')} placement="match_result_page" />
      </div>
      <p className="mt-6 text-xs text-slate-500">National from-prices. Availability depends on your address. We may earn a commission if you buy through these links; it does not change the ranking.</p>
    </div>
  )
}
