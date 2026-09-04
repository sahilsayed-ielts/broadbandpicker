/**
 * "On this page" jump-link nav. Long-form pages that rank (Ofcom, Uswitch
 * guides) answer in the first screen, then let the reader skip straight to
 * the section that matters instead of scrolling — this is worth close to
 * nothing on a short page, so only render it once there's a real list of
 * sections to jump to (see the `links.length < 3` guard in callers).
 *
 * See docs/home page UX/page-category-ux-ctr-plan.md ("on-this-page jump
 * links" gap) — required on any new guide, review, comparison or research
 * page template with more than a couple of sections.
 */
export interface OnThisPageLink {
  href: string
  label: string
}

interface OnThisPageNavProps {
  links: OnThisPageLink[]
  className?: string
}

export default function OnThisPageNav({ links, className }: OnThisPageNavProps) {
  if (links.length < 3) return null

  return (
    <nav
      className={`mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 ${className ?? ''}`}
      aria-label="On this page"
    >
      <p className="font-bold text-slate-900">On this page</p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="font-semibold text-sky-700 underline">
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
