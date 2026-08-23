# Homepage visual redesign: analysis and what shipped

Evidence: `scripts/analyze_homepage_visual_design.py`, run 2026-08-23
against 5 UK broadband comparison/affiliate homepages
(`homepage-visual-design-scan.json` in this folder). This is a static
HTTP scrape, not a rendered screenshot — see the caveat in that file's
`method` field before treating any finding as a confirmed final render.

## What the scan found

| Site | Total `<img>` | Inline `<svg>` | CSS bg-image refs | Gradients | Interactive JS libs detected |
|---|---|---|---|---|---|
| Uswitch | 68 | **195** | 5 | 3 | none |
| Which? Switch Broadband | 11 | 16 | 0 | 0 | none |
| broadband.co.uk | 35 | 18 | 0 | 0 | none |
| choose.co.uk | 72 | 9 | 5 | 2 | none |
| MoneySavingExpert | — | — | — | — | blocked (403) |

Sample image `alt` text across every readable site was overwhelmingly
**provider brand logos** (Virgin Media, Vodafone, Zen, Plusnet, Hyperoptic,
Sky...), plus a couple of trust elements on Uswitch ("Uswitch Trustscore",
"author"). Not one readable site's sampled images suggested lifestyle
photography of people or houses.

## The finding that shaped the redesign

**Nobody in this vertical uses a stock-photo hero banner.** The dominant
visual language is heavy inline SVG (icons, trust badges) plus provider
logos — Uswitch alone ships 195 inline SVGs. No carousel/animation
library (Swiper, Slick, AOS, Framer Motion, Lottie, GSAP) was detected on
any readable site, consistent with a conservative, trust-first design
posture that makes sense for a finance-adjacent, YMYL-relevant category.

This matters because the request was for a "similar styled UX" to popular
sites in this specific industry, plus a personal preference for images,
illustrations and interactivity. Those aren't in conflict: the redesign
below delivers modern, illustrated and interactive, executed in the SVG
idiom that's actually proven here — not stock photography, which no
competitor in this vertical actually uses either.

## What shipped

- **`scripts/generate_homepage_illustrations.py`** generates 7 original,
  on-brand SVG illustrations into `public/illustrations/` — a hero
  "connectivity network" graphic (nodes/homes linked to a central hub),
  three colour-filled step icons (postcode, compare, switch) replacing the
  previous thin-stroke line icons, two soft gradient blob decorations, and
  a Broadband Match quiz illustration. All generated programmatically
  (parametric SVG paths, seeded so results are reproducible), not copied
  or adapted from any competitor's actual artwork.
- **Hero section**: the network illustration now sits behind the hero copy
  on `lg+` screens as a banner visual, keeping the postcode checker and
  headline as the untouched, always-visible primary content — no JS
  dependency gates anything above the fold.
- **"How BroadbandPicker Works"**: the three step icons are now
  colour-filled illustrations instead of single-stroke outlines, in
  larger badges, with a hover scale and a staggered scroll-reveal
  (`components/ScrollReveal.tsx`, an `IntersectionObserver` fade/slide-up
  respecting `prefers-reduced-motion`).
- **Broadband Match promo**: restructured from centred text-only to a
  two-column layout with the quiz illustration and a background blob,
  wrapped in the same scroll-reveal treatment.
- Both blob decorations are `aria-hidden`, `pointer-events-none` and
  purely decorative — they never sit in front of interactive content or
  affect layout flow.

## Deliberately not done

- No stock photography was added or sourced — the evidence above says
  this industry doesn't use it, and sourcing real photos of UK homes/
  people would mean either paying for licensed stock (a budget decision,
  not mine to make unilaterally) or using placeholder imagery that would
  misrepresent the brand.
- No carousel/slider library was added — none of the scanned competitors
  use one, and adding one without a clear content need (nothing on the
  homepage requires paging through more items than fit on screen) would
  be interactivity for its own sake.
- Content and copy were not changed as part of this pass — this was a
  visual/UX pass only, per the brief.
