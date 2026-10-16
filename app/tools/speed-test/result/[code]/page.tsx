import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import ShareBar from '@/components/ShareBar'
import { parseSpeedCode } from '@/lib/shareCodes'
import { shareExperience, speedColor, speedLabel } from '@/lib/speedResult'
import { SITE_URL } from '@/lib/siteSchema'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const r = parseSpeedCode(code)
  if (!r) return { robots: { index: false, follow: false } }
  const title = `Speed test result: ${r.download} Mbps download`
  const description = `${speedLabel(r.download)} broadband: ${r.download} Mbps down, ${r.upload} Mbps up, ${r.ping} ms ping. Run the free BroadbandPicker speed test to compare yours.`
  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/tools/speed-test` },
    openGraph: { title: `${title} | BroadbandPicker`, description, url: `${SITE_URL}/tools/speed-test/result/${code}` },
  }
}

export default async function SpeedResultPage({ params }: Props) {
  const { code } = await params
  const r = parseSpeedCode(code)
  if (!r) notFound()
  const label = speedLabel(r.download)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Tools', href: '/tools' }, { name: 'Speed test', href: '/tools/speed-test' }, { name: 'Shared result', href: `/tools/speed-test/result/${code}` }]} />
      <div className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">Shared speed test result</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          <span style={{ color: speedColor(r.download) }}>{r.download} Mbps</span> download
        </h1>
        <p className="mt-2 text-slate-300">{label} broadband, measured on the BroadbandPicker speed test.</p>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          {[
            { k: 'Download', v: `${r.download} Mbps` },
            { k: 'Upload', v: `${r.upload} Mbps` },
            { k: 'Ping', v: `${r.ping} ms` },
          ].map((item) => (
            <div key={item.k} className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs text-slate-400">{item.k}</dt>
              <dd className="mt-1 text-lg font-bold tabular-nums">{item.v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-6 grid gap-2 sm:grid-cols-3">
          {shareExperience(r.download, r.upload, r.ping).map((item) => (
            <li key={item.label} className="rounded-xl bg-slate-800 p-3 text-sm">
              <span className="text-slate-400">{item.label}</span>
              <span className="mt-2 flex gap-1" aria-label={`${item.score} out of 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`h-2 w-2 rounded-full ${i < item.score ? 'bg-sky-400' : 'bg-slate-600'}`} />
                ))}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/tools/speed-test" className="flex-1 rounded-xl bg-sky-500 px-6 py-3 text-center font-bold text-white hover:bg-sky-600">
            Test my own speed
          </Link>
          <Link href="/compare" className="flex-1 rounded-xl border border-slate-600 px-6 py-3 text-center font-semibold text-slate-200 hover:border-slate-400">
            Compare faster deals
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <ShareBar
          url={`/tools/speed-test/result/${code}`}
          title={`Broadband speed: ${r.download} Mbps`}
          text={`This broadband tested at ${r.download} Mbps down, ${r.upload} Mbps up. How does yours compare?`}
          contentType="speed_test_result"
          itemId={label.toLowerCase()}
          placement="speed_result_page"
        />
      </div>
      <p className="mt-6 text-xs text-slate-500">
        A single browser test to our London server, not an Ofcom-accredited line test. Speeds vary by time of day, Wi-Fi and device.
        Read <Link href="/guides/what-broadband-speed-do-i-need" className="underline">what speed you need</Link>.
      </p>
    </div>
  )
}
