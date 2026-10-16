import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import NewsletterSignup from '@/components/NewsletterSignup'
import PageHeroBanner from '@/components/PageHeroBanner'
import { JsonLd } from '@/lib/jsonLd'
import { formatUkDate } from '@/lib/dates'
import { hubHero } from '@/lib/pageHero'
import { SITE_URL } from '@/lib/siteSchema'
import { buildWeeklyIssue } from '@/lib/weeklyNewsletter'

const HERO = hubHero()
const PAGE_URL = `${SITE_URL}/alerts/weekly`

export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
  const issue = buildWeeklyIssue()
  return {
    title: { absolute: `${issue.title} | BroadbandPicker` },
    description: issue.preheader,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title: issue.title,
      description: issue.preheader,
      url: PAGE_URL,
    },
  }
}

export default function WeeklyRoundupPage() {
  const issue = buildWeeklyIssue()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: issue.title,
    description: issue.preheader,
    datePublished: issue.datasetDate,
    dateModified: issue.datasetDate,
    url: PAGE_URL,
    author: { '@type': 'Organization', name: 'BroadbandPicker' },
    publisher: { '@type': 'Organization', name: 'BroadbandPicker', url: SITE_URL },
  }

  return (
    <div>
      <JsonLd data={jsonLd} />
      <PageHeroBanner
        title={issue.title}
        kicker={`Issue ${issue.weekKey}`}
        lede={issue.lede}
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
        ctas={[
          { href: '/compare', label: 'Check deals at your postcode', variant: 'primary' },
          { href: '/alerts', label: 'Get this by email', variant: 'secondary' },
        ]}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: 'Deal alerts', href: '/alerts' },
            { name: 'This week', href: '/alerts/weekly' },
          ]}
        />

        <h2 className="text-xl font-bold text-slate-900">From-prices to check this week</h2>
        <p className="mt-2 text-sm text-slate-500">
          Snapshot verified {formatUkDate(issue.datasetDate)}. Your address may differ.
        </p>
        <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {issue.providers.map((row) => (
            <li key={row.slug} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-bold text-slate-900">{row.name}</p>
                <p className="text-sm text-slate-500">
                  From £{row.fromPrice.toFixed(2)} a month · {row.speedLabel}
                </p>
              </div>
              <Link href={`/providers/${row.slug}`} className="text-sm font-semibold text-sky-700 hover:underline">
                View
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl font-bold text-slate-900">Guides worth opening</h2>
        <ul className="mt-4 space-y-4">
          {issue.guides.map((guide) => (
            <li key={guide.slug}>
              <Link href={`/guides/${guide.slug}`} className="font-semibold text-sky-700 hover:underline">
                {guide.title}
              </Link>
              <p className="text-sm text-slate-500">Updated {formatUkDate(guide.updatedDate)}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl font-bold text-slate-900">Broadband in your area</h2>
        <p className="mt-3 flex flex-wrap gap-3">
          {issue.geo.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-sky-700 hover:border-sky-400">
              {item.name}
            </Link>
          ))}
        </p>

        <h2 className="mt-10 text-xl font-bold text-slate-900">Free tools</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {issue.tools.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block rounded-xl border border-slate-200 p-4 hover:border-sky-400">
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-slate-500">
          We may earn a commission if you take out a package through our links.{' '}
          <Link href="/how-we-make-money" className="text-sky-700 hover:underline">
            How we make money
          </Link>
          .
        </p>

        <div className="mt-10">
          <NewsletterSignup variant="page" source="weekly-roundup" />
        </div>
      </div>
    </div>
  )
}
