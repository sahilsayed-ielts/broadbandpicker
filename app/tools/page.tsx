import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import PageHeroBanner from '@/components/PageHeroBanner'
import { JsonLd } from '@/lib/jsonLd'
import { DEFAULT_GUIDE_CTAS, hubHero } from '@/lib/pageHero'
import { SITE_URL } from '@/lib/siteSchema'

const HERO = hubHero()
const PAGE_URL = `${SITE_URL}/tools`
const DESCRIPTION =
  'Free UK broadband tools: measure your speed, match a package to your household, and work out the true monthly cost before you switch.'

export const metadata: Metadata = {
  title: { absolute: 'Broadband Tools | Speed Test, Match and Cost Calculator' },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Broadband Tools | BroadbandPicker',
    description: 'Speed test, Broadband Match and a true-cost calculator for UK broadband.',
    url: PAGE_URL,
    images: [{ url: `${SITE_URL}${HERO.image}`, width: 1600, height: 900, alt: HERO.imageAlt }],
  },
}

const tools = [
  {
    href: '/tools/speed-test',
    title: 'Broadband speed test',
    description:
      'Measure download, upload, ping and jitter to our London server, then compare deals for your area if you allow location.',
  },
  {
    href: '/tools/broadband-match',
    title: 'Broadband Match',
    description:
      'Answer a few questions about your household and get a ranked shortlist from live package data, not the cheapest headline alone.',
  },
  {
    href: '/tools/broadband-cost-calculator',
    title: 'Cost calculator',
    description:
      'Turn an advertised price, setup fee and cashback into a true average monthly cost and cost per Mbps.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Broadband tools',
  url: PAGE_URL,
  description: DESCRIPTION,
  isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/` },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.title,
      url: `${SITE_URL}${tool.href}`,
    })),
  },
}

export default function ToolsPage() {
  return (
    <div>
      <JsonLd data={jsonLd} />
      <PageHeroBanner
        title="Broadband tools"
        kicker="Free UK checkers"
        lede="Measure your connection, match a package to your household, and work out the true monthly cost before you switch."
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Tools', href: '/tools' }]} />
        <p className="mb-8 text-sm text-slate-500">Free to use · No registration</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-slate-200 p-5 transition-all hover:border-sky-400 hover:shadow-sm"
            >
              <h2 className="font-bold text-slate-900">{tool.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.description}</p>
            </Link>
          ))}
        </div>
        <section className="mt-10 rounded-xl border border-sky-200 bg-sky-50 p-6" aria-labelledby="tool-next-steps">
          <h2 id="tool-next-steps" className="text-xl font-bold text-slate-900">What to do after using a tool</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Turn your result into a decision with our practical guides and address-level checks.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <Link href="/guides/best-broadband-for-gaming-uk" className="font-semibold text-sky-700 hover:underline">Best broadband for gaming →</Link>
            <Link href="/guides/best-broadband-for-rural-areas-uk" className="font-semibold text-sky-700 hover:underline">Best rural broadband →</Link>
            <Link href="/guides/best-streaming-services-uk" className="font-semibold text-sky-700 hover:underline">Best streaming services →</Link>
            <Link href="/postcode/b15" className="font-semibold text-sky-700 hover:underline">Check availability in B15 →</Link>
            <Link href="/providers/compare" className="font-semibold text-sky-700 hover:underline">Compare two providers →</Link>
            <Link href="/compare" className="font-semibold text-sky-700 hover:underline">Compare all available deals →</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
