import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AffiliateCTA from '@/components/AffiliateCTA'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import ProviderLogo from '@/components/ProviderLogo'
import ShareBar from '@/components/ShareBar'
import { providerComparisons } from '@/data/provider-comparisons'
import { providerDatasetUpdatedDate } from '@/data/providers'
import { comparisonPath } from '@/lib/shareCodes'
import { SITE_URL } from '@/lib/siteSchema'
import type { Provider } from '@/types'
import { maxDownload, providersForCombo } from './data'

type Props = { params: Promise<{ combo: string }> }

function names(list: Provider[]) {
  return list.map((p) => p.name).join(' vs ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { combo } = await params
  const list = providersForCombo(combo)
  if (!list) return { robots: { index: false, follow: false } }
  const title = `${names(list)}: broadband compared`
  const description = `Side-by-side: ${list.map((p) => `${p.name} from £${p.monthlyPriceFrom.toFixed(2)}/mo, up to ${maxDownload(p)} Mbps`).join('; ')}.`
  return {
    title,
    description,
    // Personal share links: one canonical comparison hub, no index bloat.
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/compare` },
    openGraph: { title: `${title} | BroadbandPicker`, description, url: `${SITE_URL}${comparisonPath(list.map((p) => p.slug))}` },
  }
}

export default async function SharedComparisonPage({ params }: Props) {
  const { combo } = await params
  const list = providersForCombo(combo)
  if (!list) notFound()

  const slugs = list.map((p) => p.slug)
  const headToHead = list.length === 2
    ? providerComparisons.find(
        (c) => (c.providerA === slugs[0] && c.providerB === slugs[1]) || (c.providerA === slugs[1] && c.providerB === slugs[0]),
      )
    : undefined
  const cheapest = [...list].sort((a, b) => a.monthlyPriceFrom - b.monthlyPriceFrom)[0]
  const fastest = [...list].sort((a, b) => maxDownload(b) - maxDownload(a))[0]
  const verified = new Date(providerDatasetUpdatedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const rows: { label: string; value: (p: Provider) => string; best?: (p: Provider) => boolean }[] = [
    { label: 'Price from', value: (p) => `£${p.monthlyPriceFrom.toFixed(2)}/mo`, best: (p) => p.slug === cheapest.slug },
    { label: 'Fastest package', value: (p) => `${maxDownload(p)} Mbps`, best: (p) => p.slug === fastest.slug },
    { label: 'Contract options', value: (p) => `${p.contractLengths.join(' / ')} months` },
    { label: 'Setup fee', value: (p) => (p.setupFee === 0 ? 'Free' : `£${p.setupFee.toFixed(2)}`) },
    { label: 'UK coverage', value: (p) => `${p.coveragePercent}%` },
    { label: 'Trustpilot score', value: (p) => `${p.trustpilotScore.toFixed(1)} / 5` },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Compare', href: '/compare' }, { name: names(list), href: comparisonPath(slugs) }]} />
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Shared comparison</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">{names(list)}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Someone shared this shortlist with you. These are national starting prices checked on {verified}. What you can
        order depends on your address, so check your postcode before deciding.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="p-4 text-left font-semibold text-slate-500"><span className="sr-only">Measure</span></th>
              {list.map((p) => (
                <th key={p.slug} scope="col" className="p-4 text-left">
                  <ProviderLogo slug={p.slug} name={p.name} width={96} height={48} />
                  <span className="mt-2 block text-base font-bold text-slate-900">{p.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-slate-100 last:border-0">
                <th scope="row" className="p-4 text-left font-medium text-slate-500">{row.label}</th>
                {list.map((p) => (
                  <td key={p.slug} className="p-4 font-semibold text-slate-900">
                    {row.value(p)}
                    {row.best?.(p) && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Best here</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="p-4 text-left font-medium text-slate-500">Good to know</th>
              {list.map((p) => (
                <td key={p.slug} className="p-4 align-top text-slate-700">
                  <ul className="list-disc space-y-1 pl-4">
                    {p.pros.slice(0, 2).map((pro) => <li key={pro}>{pro}</li>)}
                  </ul>
                </td>
              ))}
            </tr>
            <tr className="bg-slate-50">
              <th scope="row" className="p-4"><span className="sr-only">Next step</span></th>
              {list.map((p) => (
                <td key={p.slug} className="space-y-2 p-4">
                  <AffiliateCTA href={p.affiliateUrl} providerName={p.name} providerSlug={p.slug} placement="shared_comparison" size="sm" className="w-full text-center" />
                  <Link href={`/providers/${p.slug}`} className="block text-center text-sm font-semibold text-sky-700 hover:underline">Read our review</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/compare?p=${slugs.join(',')}#provider-finalists`} className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800">
          Edit this comparison
        </Link>
        {headToHead && (
          <Link href={`/providers/compare/${headToHead.slug}`} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Read the full {names(list)} verdict
          </Link>
        )}
        <Link href="/postcode" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Check my postcode
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <ShareBar
          url={comparisonPath(slugs)}
          title={`Broadband comparison: ${names(list)}`}
          text={`Comparing ${list.map((p) => p.name).join(', ')} for our broadband:`}
          contentType="comparison"
          itemId={slugs.join(',')}
          placement="shared_comparison_page"
          label="Pass it on"
        />
      </div>
      <p className="mt-6 text-xs text-slate-500">
        We may earn a commission if you buy through links on this page. It does not change the order or the figures. <Link href="/how-we-make-money" className="underline">How we make money</Link>.
      </p>
    </div>
  )
}
