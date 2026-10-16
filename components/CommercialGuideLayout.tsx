import Link from 'next/link'
import type { ReactNode } from 'react'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FAQAccordion from '@/components/FAQAccordion'
import NewsletterSignup from '@/components/NewsletterSignup'
import Logo from '@/components/Logo'
import GuideHeroBanner from '@/components/GuideHeroBanner'
import PostcodeContextBar from '@/components/PostcodeContextBar'
import ProviderLogo from '@/components/ProviderLogo'
import {
  GuideHelpfulPrompt,
  GuideJumpSelect,
  GuideMobileDealBar,
  GuideShareRow,
} from '@/components/CommercialGuideClient'
import { JsonLd } from '@/lib/jsonLd'
import type { TocEntry } from '@/lib/extractHeadings'
import type { CommercialGuideConfig } from '@/data/commercialGuides'
import type { GuideMetadata } from '@/data/guides'
import type { FAQItem } from '@/types'

interface SourceLink {
  label: string
  href: string
  external?: boolean
}

interface CommercialGuideLayoutProps {
  guide: GuideMetadata
  config: CommercialGuideConfig
  categoryLabel?: string
  updatedDate: string
  toc: TocEntry[]
  body: ReactNode
  faqs: FAQItem[]
  sourceLinks: SourceLink[]
  related: GuideMetadata[]
  jsonLd: object[]
  /** The guide's deal list (cards, filters, sort), rendered in the deals block. */
  deals: ReactNode
  dealCount: number
  providers: { slug: string; name: string }[]
  affiliateUrls: Record<string, string>
  renderedAt: string
}

const DEALS_ID = 'deals'
const HERO_ID = 'guide-hero'

function shortPickLabel(label: string): string {
  const short = label.replace(/^Best (overall )?for /, '')
  return short.charAt(0).toUpperCase() + short.slice(1)
}

function gbp(value: number): string {
  return `£${value.toFixed(2)}`
}

/**
 * Deals-first layout for commercial guides ("best X deals"): verdict and
 * postcode check in the first screen, deal cards next, then the full
 * editorial guide with a sticky shortlist panel. Content is unchanged from the
 * article layout; only its order and presentation differ.
 */
export default function CommercialGuideLayout({
  guide,
  config,
  categoryLabel,
  updatedDate,
  toc,
  body,
  faqs,
  sourceLinks,
  related,
  jsonLd,
  deals,
  dealCount,
  providers,
  affiliateUrls,
  renderedAt,
}: CommercialGuideLayoutProps) {
  const url = `https://broadbandpicker.co.uk/guides/${guide.slug}`

  return (
    <article>
      {jsonLd.map((data, index) => (
        <JsonLd key={index} data={data} />
      ))}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 [&_nav]:mb-3">
          <BreadcrumbNav
            items={[
              { name: 'Home', href: '/' },
              { name: 'Guides', href: '/guides' },
              ...(categoryLabel ? [{ name: categoryLabel, href: '/guides' }] : []),
              { name: guide.title, href: `/guides/${guide.slug}` },
            ]}
          />
          <PostcodeContextBar />
        </div>
      </div>

      <header id={HERO_ID}>
        <GuideHeroBanner
          eyebrow={config.heroEyebrow}
          title={guide.title}
          excerpt={guide.excerpt}
          meta={[`Updated ${updatedDate}`, `${guide.readingTime} min read`, 'Reviewed by BroadbandPicker editorial team']}
          trust={
            <ul className="flex flex-wrap gap-2 text-xs font-semibold">
              <li className="rounded-full bg-white/10 px-3 py-1 text-slate-100">Independent comparison</li>
              <li>
                <Link href="/how-we-make-money" className="block rounded-full bg-white/10 px-3 py-1 text-slate-100 hover:bg-white/20">
                  We may earn a commission. It doesn&apos;t change the order.
                </Link>
              </li>
              <li>
                <a href={`#${config.methodologyAnchor}`} className="block rounded-full bg-white/10 px-3 py-1 text-slate-100 hover:bg-white/20">
                  How we chose
                </a>
              </li>
              <li className="rounded-full bg-white/10 px-3 py-1 text-slate-100">
                {dealCount} bundles from {providers.length} providers
              </li>
            </ul>
          }
          needs={config.needs}
          affiliateUrls={affiliateUrls}
          providers={providers}
          checkedNote={config.checkedNote}
          dealsId={DEALS_ID}
          renderedAt={renderedAt}
        />
      </header>

      <section aria-labelledby="quick-answer" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="quick-answer" className="text-sm font-bold uppercase tracking-wide text-sky-800">
              Our verdict
            </h2>
            <a href={`#${DEALS_ID}`} className="text-sm font-semibold text-sky-700 hover:underline">
              Compare all {dealCount} bundles &darr;
            </a>
          </div>
          <ul className="grid gap-4 md:grid-cols-3">
            {config.picks.map((pick) => (
              <li key={pick.label} className="grid content-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <ProviderLogo slug={pick.providerSlug} name={pick.provider} width={64} height={32} />
                  <p className="whitespace-nowrap text-right text-xs text-slate-500">
                    from <span className="text-base font-bold tabular-nums text-slate-900">{gbp(pick.fromPrice)}</span>/mo
                  </p>
                </div>
                <p className="font-semibold leading-snug text-slate-900">
                  {pick.label}: {pick.provider}
                </p>
                <p className="text-sm text-slate-600">{pick.reason}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500">
            Prices, channels and availability change by address. Virgin Media in particular does not reach every home.
          </p>
        </div>
      </section>

      <section id={DEALS_ID} aria-labelledby="deals-title" className="scroll-mt-4 bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 grid gap-1">
            <h2 id="deals-title" className="text-2xl font-extrabold tracking-tight text-slate-900">
              {config.dealsTitle}
            </h2>
            <p className="text-sm text-slate-600">{config.dealsIntro}</p>
          </div>
          {deals}
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              Example packages verified against provider sites and trade press (Sky, Virgin Media: 24 August 2026;
              EE TV: 1 September 2026). Confirm the live quote before ordering.
            </span>
            <a href={`#${config.methodologyAnchor}`} className="font-semibold text-sky-700 hover:underline">
              About these results
            </a>
            <span>Totals include published setup fees. Where a provider hasn&apos;t published one, the card says so.</span>
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
        <div className="min-w-0">
          {guide.keyTakeaways && guide.keyTakeaways.length > 0 && (
            <section className="mb-8 rounded-xl border border-sky-200 bg-sky-50 p-6">
              <h2 className="mb-3 text-lg font-bold text-slate-900">Key Takeaways</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                {guide.keyTakeaways.map((takeaway) => (
                  <li key={takeaway} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {toc.length >= 3 && (
            <nav aria-label="Table of contents" className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">On this page</p>
              <ul className="hidden grid-cols-2 gap-x-6 gap-y-1.5 text-sm lg:grid">
                {toc.map((entry) => (
                  <li key={entry.id}>
                    <a href={`#${entry.id}`} className="text-sky-700 hover:underline">
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
              <GuideJumpSelect toc={toc} />
            </nav>
          )}

          <div className="prose prose-slate mb-10 max-w-none [&_abbr]:cursor-help [&_abbr]:decoration-sky-500 [&_abbr]:decoration-dotted [&_abbr]:underline-offset-4 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:scroll-mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_li]:mb-2 [&_li]:text-slate-700 [&_ol]:my-4 [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-slate-700 [&_strong]:text-slate-900 [&_table]:my-6 [&_td]:text-slate-700 [&_th]:font-semibold [&_th]:text-slate-700 [&_ul]:my-4 [&_ul]:pl-6">
            {body}
          </div>

          <h2 className="mb-4 text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <FAQAccordion items={faqs} />

          <section aria-label="About the reviewers" className="mt-10 grid grid-cols-[56px_1fr] gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <Logo size={56} showWordmark={false} />
            <div className="grid gap-2 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Reviewed by the BroadbandPicker editorial team</p>
              <p>
                We check provider facts and offer examples against official UK sources and record the date of each
                check. Commission never decides which deals appear or their order.
              </p>
              <p className="flex flex-wrap gap-x-4 gap-y-1">
                <Link href="/how-we-review-broadband" className="font-semibold text-sky-700 hover:underline">How we review</Link>
                <Link href="/editorial-policy" className="font-semibold text-sky-700 hover:underline">Editorial policy</Link>
                <Link href="/about" className="font-semibold text-sky-700 hover:underline">About us</Link>
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-xl font-bold text-slate-900">Editorial and Source Notes</h2>
            <p className="mb-4 text-sm text-slate-600">
              We review guides against our published methodology and add source links where external verification
              materially helps the reader check claims, dates, and regulator-backed context.
            </p>
            <ul className="space-y-2 text-sm">
              {sourceLinks.map((source) => (
                <li key={source.href}>
                  {source.external ? (
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">
                      {source.label}
                    </a>
                  ) : (
                    <Link href={source.href} className="text-sky-700 hover:underline">
                      {source.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10">
            <NewsletterSignup variant="guide" source="commercial-guide-end" />
          </div>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Related guides</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/guides/${item.slug}`}
                    className="group block rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
                  >
                    <h3 className="mb-1 text-sm font-semibold text-slate-900 transition-colors group-hover:text-sky-700">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500">{item.readingTime} min read</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 grid gap-4">
            <GuideHelpfulPrompt slug={guide.slug} />
            <GuideShareRow url={url} title={guide.title} />
          </div>
        </div>

        <aside aria-label="Shortlist" className="hidden lg:block">
          <div className="sticky top-6 grid gap-4">
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5">
              <p className="font-bold text-slate-900">Top picks</p>
              <ul className="grid gap-3">
                {config.picks.map((pick) => (
                  <li key={pick.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-sm">
                    <ProviderLogo slug={pick.providerSlug} name={pick.provider} width={44} height={22} />
                    <span className="leading-snug text-slate-700">{shortPickLabel(pick.label)}</span>
                    <span className="font-bold tabular-nums text-slate-900">{gbp(pick.fromPrice)}</span>
                  </li>
                ))}
              </ul>
              <a href={`#${DEALS_ID}`} className="rounded-lg bg-sky-700 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-sky-800">
                See all {dealCount} bundles
              </a>
              <p className="text-xs text-slate-500">We may earn a commission. It doesn&apos;t change the order.</p>
            </div>
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-5">
              <p className="font-bold text-slate-900">Not ready to switch?</p>
              <p className="text-sm text-slate-600">Save deals with the heart icon and come back to them later.</p>
              <Link href="/saved-deals" className="text-sm font-semibold text-sky-700 hover:underline">
                View saved deals
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <GuideMobileDealBar dealsId={DEALS_ID} heroId={HERO_ID} label={config.mobileCta} />
    </article>
  )
}
