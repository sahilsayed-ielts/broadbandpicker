import type { ReactNode } from 'react'
import Link from 'next/link'
import { guideCategories } from '@/data/guides'
import PostcodeChecker from './PostcodeChecker'
import { ICONS, PROVIDER_QUICK_LINKS, POSTCODE_QUICK_LINKS, TOOL_LINKS } from './MainNav'

const sectionLinkClass =
  'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-slate-700 active:bg-sky-50'

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
      <p className="flex items-center gap-2 px-3 pb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
        <span className="text-sky-600">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  )
}

export default function MobileNav() {
  return (
    <details className="lg:hidden relative">
      <summary className="flex list-none min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg p-2 text-slate-600 active:bg-slate-100">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="sr-only">Open navigation menu</span>
      </summary>

      {/* Full-width slide-down panel — not a small anchored dropdown, so it works the
          same way on a narrow phone or a tablet held in portrait. */}
      <nav
        className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 shadow-lg"
        aria-label="Mobile navigation"
      >
        <div className="mb-4">
          <p className="mb-2 px-1 text-sm font-semibold text-slate-900">Find deals in your area</p>
          <PostcodeChecker placeholder="Your postcode" />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <Link href="/compare" className="min-h-11 flex items-center justify-center rounded-lg bg-sky-700 px-3 py-2.5 text-sm font-bold text-white active:bg-sky-800">
            Compare
          </Link>
          <Link href="/deals" className="min-h-11 flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 active:bg-slate-50">
            Deals
          </Link>
        </div>

        <div className="space-y-3">
          <Section title="Providers" icon={ICONS.providers}>
            <Link href="/providers" className={sectionLinkClass}>All providers</Link>
            <Link href="/providers/compare" className={sectionLinkClass}>Provider vs provider</Link>
            <div className="grid grid-cols-2 gap-1 px-3 pt-1">
              {PROVIDER_QUICK_LINKS.map((p) => (
                <Link key={p.slug} href={`/providers/${p.slug}`} className="min-h-11 flex items-center rounded-lg px-2 text-sm text-slate-600 active:bg-sky-50">
                  {p.name}
                </Link>
              ))}
            </div>
          </Section>

          <Section title="Postcode" icon={ICONS.postcode}>
            <Link href="/postcode" className={sectionLinkClass}>Find your area</Link>
            <div className="grid grid-cols-2 gap-1 px-3 pt-1">
              {POSTCODE_QUICK_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="min-h-11 flex items-center rounded-lg px-2 text-sm text-slate-600 active:bg-sky-50">
                  {l.label}
                </Link>
              ))}
            </div>
          </Section>

          <Section title="Guides" icon={ICONS.guides}>
            {guideCategories.map((cat) => (
              <Link key={cat.slug} href={`/guides#${cat.slug}`} className={sectionLinkClass}>
                {cat.label}
              </Link>
            ))}
            <Link href="/guides" className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold text-sky-700 active:bg-sky-50">
              Browse all guides &rarr;
            </Link>
          </Section>

          <Section title="Tools" icon={ICONS.tools}>
            {TOOL_LINKS.map((tool) => (
              <Link key={tool.href} href={tool.href} className={sectionLinkClass}>
                {tool.label}
              </Link>
            ))}
          </Section>

          <div className="border-t border-slate-100 pt-3">
            <div className="grid grid-cols-2 gap-1">
              <Link href="/about" className="min-h-11 flex items-center rounded-lg px-3 text-sm text-slate-500 active:bg-slate-50">About</Link>
              <Link href="/contact" className="min-h-11 flex items-center rounded-lg px-3 text-sm text-slate-500 active:bg-slate-50">Contact</Link>
            </div>
          </div>
        </div>
      </nav>
    </details>
  )
}
