import Link from 'next/link'
import { guides, guideCategories } from '@/data/guides'

export const ICONS = {
  providers: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />
    </svg>
  ),
  postcode: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  guides: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  tools: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
  ),
}

export const PROVIDER_QUICK_LINKS = [
  { slug: 'bt', name: 'BT' },
  { slug: 'sky', name: 'Sky' },
  { slug: 'virgin-media', name: 'Virgin Media' },
  { slug: 'ee', name: 'EE' },
]

export const POSTCODE_QUICK_LINKS = [
  { href: '/postcode/london', label: 'London' },
  { href: '/postcode/manchester', label: 'Manchester' },
  { href: '/postcode/birmingham', label: 'Birmingham' },
  { href: '/postcode/glasgow', label: 'Glasgow' },
  { href: '/postcode/leeds', label: 'Leeds' },
]

export const TOOL_LINKS = [
  { href: '/tools/broadband-match', label: 'Broadband Match', desc: 'Get a personalised, ranked recommendation' },
  { href: '/speed-test', label: 'Speed Test', desc: 'Check your current connection speed' },
  { href: '/tools/broadband-cost-calculator', label: 'Cost Calculator', desc: 'True monthly cost, not just the headline price' },
]

const dropdownPanel =
  'invisible absolute left-1/2 top-full z-40 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 ' +
  'group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ' +
  'group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100'

const triggerClass =
  'flex items-center gap-1 text-slate-600 transition-colors hover:text-sky-600 group-hover:text-sky-600 group-focus-within:text-sky-600'

function Chevron() {
  return (
    <svg className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function MainNav() {
  return (
    <nav className="hidden lg:flex items-center gap-6 text-sm font-medium" aria-label="Main navigation">
      <Link href="/compare" className="text-slate-600 hover:text-sky-600 transition-colors">Compare</Link>
      <Link href="/deals" className="text-slate-600 hover:text-sky-600 transition-colors">Deals</Link>

      {/* Providers */}
      <div className="group relative">
        <button type="button" className={triggerClass}>
          Providers
          <Chevron />
        </button>
        <div className={`${dropdownPanel} w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg`}>
          <Link href="/providers" className="flex items-start gap-3 rounded-lg p-2 hover:bg-sky-50">
            <span className="mt-0.5 text-sky-600">{ICONS.providers}</span>
            <span>
              <span className="block font-semibold text-slate-900">All providers</span>
              <span className="block text-xs text-slate-500">Every major UK broadband provider reviewed</span>
            </span>
          </Link>
          <Link href="/providers/compare" className="flex items-start gap-3 rounded-lg p-2 hover:bg-sky-50">
            <span className="mt-0.5 text-sky-600">{ICONS.providers}</span>
            <span>
              <span className="block font-semibold text-slate-900">Provider vs provider</span>
              <span className="block text-xs text-slate-500">Head-to-head comparisons</span>
            </span>
          </Link>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Popular providers</p>
            <div className="grid grid-cols-2 gap-1">
              {PROVIDER_QUICK_LINKS.map((p) => (
                <Link key={p.slug} href={`/providers/${p.slug}`} className="rounded-lg px-2 py-1.5 text-slate-700 hover:bg-sky-50 hover:text-sky-700">
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Postcode */}
      <div className="group relative">
        <button type="button" className={triggerClass}>
          Postcode
          <Chevron />
        </button>
        <div className={`${dropdownPanel} w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg`}>
          <Link href="/postcode" className="flex items-start gap-3 rounded-lg p-2 hover:bg-sky-50">
            <span className="mt-0.5 text-sky-600">{ICONS.postcode}</span>
            <span>
              <span className="block font-semibold text-slate-900">Find your area</span>
              <span className="block text-xs text-slate-500">Real Ofcom-backed coverage for any UK postcode</span>
            </span>
          </Link>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Popular areas</p>
            <div className="grid grid-cols-2 gap-1">
              {POSTCODE_QUICK_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-lg px-2 py-1.5 text-slate-700 hover:bg-sky-50 hover:text-sky-700">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guides mega-menu */}
      <div className="group relative">
        <button type="button" className={triggerClass}>
          Guides
          <Chevron />
        </button>
        <div className={`${dropdownPanel} w-[760px] rounded-xl border border-slate-200 bg-white p-6 shadow-lg`}>
          <div className="grid grid-cols-3 gap-6">
            {guideCategories.map((cat) => {
              const examples = guides.filter((g) => g.category === cat.slug).slice(0, 3)
              return (
                <div key={cat.slug}>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-sky-600 flex-shrink-0">{ICONS.guides}</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{cat.label}</p>
                      <p className="text-xs text-slate-500 leading-snug">{cat.description}</p>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 pl-6">
                    {examples.map((g) => (
                      <li key={g.slug}>
                        <Link href={`/guides/${g.slug}`} className="block rounded px-1 py-0.5 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700">
                          {g.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <Link href="/guides" className="text-sm font-semibold text-sky-600 hover:text-sky-800">
              Browse all {guides.length} guides &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="group relative">
        <button type="button" className={triggerClass}>
          Tools
          <Chevron />
        </button>
        <div className={`${dropdownPanel} w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg`}>
          {TOOL_LINKS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="flex items-start gap-3 rounded-lg p-2 hover:bg-sky-50">
              <span className="mt-0.5 text-sky-600">{ICONS.tools}</span>
              <span>
                <span className="block font-semibold text-slate-900">{tool.label}</span>
                <span className="block text-xs text-slate-500">{tool.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
