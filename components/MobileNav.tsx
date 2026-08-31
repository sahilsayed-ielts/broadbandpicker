'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { guideCategories } from '@/data/guides'
import PostcodeChecker from './PostcodeChecker'
import { ICONS, PROVIDER_QUICK_LINKS, POSTCODE_QUICK_LINKS, TOOL_LINKS } from './MainNav'

const sectionLinkClass =
  'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-slate-700 transition-colors active:bg-sky-50 active:text-sky-700'

interface AccordionSectionProps {
  id: string
  title: string
  icon: ReactNode
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

function AccordionSection({ id, title, icon, isOpen, onToggle, children }: AccordionSectionProps) {
  const panelId = `${id}-panel`
  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex min-h-12 w-full items-center justify-between gap-2 py-3 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-sky-600">{icon}</span>
          <span className="text-[15px] font-semibold text-slate-900">{title}</span>
        </span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-600' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* CSS-only accordion: animating grid-template-rows means we never need
          to measure content height in JS, and it degrades gracefully. */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-3">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const uid = useId()

  // Auto-close whenever the route actually changes underneath the menu.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock background scroll and allow Escape to close while the panel is open.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    panelRef.current?.querySelector<HTMLElement>('input, a, button')?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggleSection(id: string) {
    setExpanded((current) => (current === id ? null : id))
  }

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition-colors active:bg-slate-100"
      >
        <span className="flex flex-col gap-1.5">
          <span className={`block h-0.5 w-6 rounded-full bg-current transition-transform duration-300 ease-out ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 rounded-full bg-current transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`block h-0.5 w-6 rounded-full bg-current transition-transform duration-300 ease-out ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </span>
        <span className="sr-only">{open ? 'Close navigation menu' : 'Open navigation menu'}</span>
      </button>

      {/* Backdrop: tapping anywhere outside the panel closes it. */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        id="mobile-nav-panel"
        ref={panelRef}
        className={`fixed inset-x-0 top-16 z-50 origin-top transition-all duration-300 ease-out ${
          open ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        } ${open ? '' : 'pointer-events-none'}`}
      >
        <nav
          className="max-h-[calc(100vh-4rem)] overflow-y-auto rounded-b-2xl border-t border-slate-200 bg-white px-4 pb-6 pt-4 shadow-2xl"
          aria-label="Mobile navigation"
        >
          <div
            className="mb-4 transition-all duration-300 ease-out"
            style={{ transitionDelay: open ? '40ms' : '0ms', opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(6px)' }}
          >
            <p className="mb-2 px-1 text-sm font-semibold text-slate-900">Check broadband in your area</p>
            <PostcodeChecker placeholder="Check your postcode" />
          </div>

          <div
            className="mb-1 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 transition-all duration-300 ease-out"
            style={{ transitionDelay: open ? '80ms' : '0ms', opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(6px)' }}
          >
            <Link href="/compare" className="flex min-h-11 items-center justify-center rounded-lg bg-sky-700 px-3 py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.97] active:bg-sky-800">
              Compare
            </Link>
            <Link href="/deals" className="flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 transition-transform active:scale-[0.97] active:bg-slate-50">
              Deals
            </Link>
          </div>

          <div
            className="transition-all duration-300 ease-out"
            style={{ transitionDelay: open ? '110ms' : '0ms', opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(6px)' }}
          >
            <AccordionSection id={`${uid}-providers`} title="Providers" icon={ICONS.providers} isOpen={expanded === 'providers'} onToggle={() => toggleSection('providers')}>
              <Link href="/providers" className={sectionLinkClass}>All providers</Link>
              <Link href="/providers/compare" className={sectionLinkClass}>Provider vs provider</Link>
              <div className="grid grid-cols-2 gap-1 px-3 pt-1">
                {PROVIDER_QUICK_LINKS.map((p) => (
                  <Link key={p.slug} href={`/providers/${p.slug}`} className="flex min-h-11 items-center rounded-lg px-2 text-sm text-slate-600 active:bg-sky-50 active:text-sky-700">
                    {p.name}
                  </Link>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection id={`${uid}-postcode`} title="In your area" icon={ICONS.postcode} isOpen={expanded === 'postcode'} onToggle={() => toggleSection('postcode')}>
              <Link href="/postcode" className={sectionLinkClass}>Find your area</Link>
              <div className="grid grid-cols-2 gap-1 px-3 pt-1">
                {POSTCODE_QUICK_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="flex min-h-11 items-center rounded-lg px-2 text-sm text-slate-600 active:bg-sky-50 active:text-sky-700">
                    {l.label}
                  </Link>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection id={`${uid}-guides`} title="Guides" icon={ICONS.guides} isOpen={expanded === 'guides'} onToggle={() => toggleSection('guides')}>
              {guideCategories.map((cat) => (
                <Link key={cat.slug} href={`/guides#${cat.slug}`} className={sectionLinkClass}>
                  {cat.label}
                </Link>
              ))}
              <Link href="/guides" className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold text-sky-700 active:bg-sky-50">
                Browse all guides &rarr;
              </Link>
            </AccordionSection>

            <AccordionSection id={`${uid}-tools`} title="Tools" icon={ICONS.tools} isOpen={expanded === 'tools'} onToggle={() => toggleSection('tools')}>
              {TOOL_LINKS.map((tool) => (
                <Link key={tool.href} href={tool.href} className={sectionLinkClass}>
                  {tool.label}
                </Link>
              ))}
            </AccordionSection>
          </div>

          <div
            className="border-t border-slate-100 pt-3 transition-all duration-300 ease-out"
            style={{ transitionDelay: open ? '140ms' : '0ms', opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(6px)' }}
          >
            <div className="grid grid-cols-2 gap-1">
              <Link href="/about" className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-500 active:bg-slate-50">About</Link>
              <Link href="/contact" className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-500 active:bg-slate-50">Contact</Link>
              <Link href="/how-we-make-money" className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-500 active:bg-slate-50">How we make money</Link>
              <Link href="/how-we-review-broadband" className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-500 active:bg-slate-50">How we review</Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
