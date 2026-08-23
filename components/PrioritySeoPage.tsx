import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import { priorityPages, type PriorityPageKey } from '@/data/priority-pages'

const BASE = 'https://broadbandpicker.co.uk'

export function priorityMetadata(key: PriorityPageKey): Metadata {
  const page = priorityPages[key]
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `${BASE}${page.path}` },
    authors: [{ name: 'BroadbandPicker editorial team', url: `${BASE}/about` }],
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `${BASE}${page.path}`, type: 'article', modifiedTime: page.updated },
  }
}

export default function PrioritySeoPage({ pageKey }: { pageKey: PriorityPageKey }) {
  const page = priorityPages[pageKey]
  const reviewedDate = new Date(`${page.updated}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': page.schemaType,
        '@id': `${BASE}${page.path}#main`,
        name: page.title,
        description: page.metaDescription,
        url: `${BASE}${page.path}`,
        dateModified: page.updated,
        author: { '@type': 'Organization', name: 'BroadbandPicker editorial team' },
        publisher: { '@type': 'Organization', name: 'BroadbandPicker', url: BASE },
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
      },
    ],
  }

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BreadcrumbNav items={page.breadcrumbs} />
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">{page.eyebrow}</p>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-2 leading-tight">{page.title}</h1>
          <p className="text-xl text-slate-600 mt-4 leading-relaxed">{page.dek}</p>
          <p className="text-sm text-slate-500 mt-4">Last researched and reviewed: {reviewedDate} · By the BroadbandPicker editorial team</p>
        </header>

        <aside className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-slate-700">
          <strong>Commercial disclosure:</strong> BroadbandPicker may receive commission if you follow a provider link and buy a service. Commission does not determine our conclusions or the price you pay. Prices, service terms and availability must be confirmed with the provider for your address.
        </aside>

        <section className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 p-6" aria-labelledby="quick-answer">
          <h2 id="quick-answer" className="text-2xl font-bold text-slate-900">The quick answer</h2>
          <p className="mt-3 leading-relaxed text-slate-700">{page.quickAnswer}</p>
        </section>

        {pageKey === 'satisfaction' && (
          <p className="mt-5 text-sm text-slate-600">For the current provider-by-provider conclusion, read our <Link href="/research/broadband-customer-service-rankings-uk" className="text-sky-700 underline">best customer service broadband provider ranking</Link>.</p>
        )}

        {pageKey === 'serviceRankings' && (
          <nav className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-label="Related provider and research pages">
            <p className="font-bold text-slate-900">Check the evidence, then compare the shortlist</p>
            <p className="mt-2 text-sm text-slate-600"><Link href="/research/uk-broadband-customer-satisfaction" className="text-sky-700 underline">Customer satisfaction evidence dashboard</Link> · <Link href="/providers/plusnet" className="text-sky-700 underline">Plusnet review</Link> · <Link href="/providers/sky" className="text-sky-700 underline">Sky review</Link> · <Link href="/providers/virgin-media" className="text-sky-700 underline">Virgin Media review</Link></p>
          </nav>
        )}

        {page.table && (
          <section className="mt-12" aria-labelledby="comparison">
            <h2 id="comparison" className="text-2xl font-bold text-slate-900">{page.table.title}</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl mt-5">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-white"><tr>{page.table.headers.map(header => <th key={header} scope="col" className="text-left px-4 py-3">{header}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-200">{page.table.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-4 py-3 align-top ${index === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>
        )}

        <div className="mt-12 space-y-10 text-slate-700 leading-relaxed">
          {page.sections.map(section => (
            <section key={section.heading}>
              <h2 className="text-2xl font-bold text-slate-900">{section.heading}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph} className="mt-3">{paragraph}</p>)}
              {section.bullets && <ul className="list-disc pl-6 mt-4 space-y-2">{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-2xl bg-slate-900 text-white p-7">
          <h2 className="text-2xl font-bold">Check options for your address</h2>
          <p className="text-slate-300 mt-3">Broadband availability, prices and speeds vary by postcode. Compare the live choices before deciding.</p>
          <Link href="/compare" className="inline-block mt-5 bg-sky-500 hover:bg-sky-600 rounded-lg px-5 py-3 font-bold">Compare broadband options</Link>
        </section>

        <section className="mt-12" aria-labelledby="faqs">
          <h2 id="faqs" className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">{page.faqs.map(faq => <details key={faq.question} className="py-5 group"><summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between">{faq.question}<span aria-hidden="true">+</span></summary><p className="mt-3 leading-relaxed">{faq.answer}</p></details>)}</div>
        </section>

        <section className="mt-12 border-t border-slate-200 pt-8 text-sm">
          <h2 className="text-lg font-bold text-slate-900">Sources and methodology</h2>
          <p className="mt-2 text-slate-600">We use official provider pages and primary UK regulatory or government sources. We do not copy competitor rankings. Provider claims are treated as claims and availability-dependent details are not presented as universal facts.</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">{page.sources.map(source => <li key={source.href}><a href={source.href} rel="noopener noreferrer" className="text-sky-700 underline">{source.label}</a>{source.verified && <span className="text-slate-500"> · Verified {new Date(`${source.verified}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>}</li>)}</ul>
          <p className="mt-4"><Link href="/how-we-review-broadband" className="text-sky-700 underline">Review methodology</Link> · <Link href="/editorial-policy" className="text-sky-700 underline">Editorial policy</Link> · <Link href="/how-we-make-money" className="text-sky-700 underline">How we make money</Link></p>
        </section>
      </div>
    </main>
  )
}
