# Content brief: /providers/compare/hyperoptic-vs-youfibre

Derived from `docs/broadbandpicker-keyword-mapping.xlsx` (Content Gap Roadmap tab).
Use this to write the `ProviderComparison` entry in `data/provider-comparisons.ts` —
the page template at `app/providers/compare/[slug]/page.tsx` is fixed, so every
field below maps to a specific rendered H1/H2/H3 and to the Article + FAQPage
JSON-LD the template already emits.

## Prerequisite — blocks this page

**YouFibre has no provider page yet** (`data/providers.ts` has no `youfibre`
entry). `getProviderBySlug('youfibre')` returning `undefined` triggers
`notFound()` in the comparison template, so this page 404s until a YouFibre
entry exists. Build `/providers/youfibre` first, or in the same batch.

Facts gathered from youfibre.com and hyperoptic.com (2026-08-14) to seed both
entries — verify current pricing/coverage before publishing, per
`/how-we-review-broadband`:

| | Hyperoptic (existing) | YouFibre (needs adding) |
|---|---|---|
| Technology | FTTP, symmetrical | FTTP, symmetrical |
| Speed range | 150–1000 Mbps | up to 1000 Mbps+ (higher tiers advertised) |
| Advertised from-price | £22.00/mo | £25/mo (1000 Mbps, fixed-price to 31/08/26) |
| Contract | 12 or 24 months | Rolling monthly **or** 12-month fixed |
| Setup fee | £0 | Not disclosed on-site — confirm before publishing |
| Coverage | 8% of UK homes, mainly London/major cities | ~500,000 premises passed; exact coverage list not published — needs a postcode-checker confirmation, don't state a % without a source |
| Trustpilot | 4.4/5, highest among majors | Not yet in `createReviewMetadata` — pull live score before writing copy |
| Differentiators | Highest Trustpilot score among major ISPs | Minimum speed guarantee, contract buy-out, price match, rolling-monthly option |

## Focus keyword and secondary keywords

| Role | Keyword | Est. UK volume | Difficulty | CPC | Notes |
|---|---|---|---|---|---|
| **Primary/focus** | hyperoptic vs youfibre broadband | 140/mo | 14 | £1.45 | Low volume but zero competing page exists — easy win, direct commercial-comparison intent |
| Secondary | hyperoptic vs youfibre | — | — | — | Shorter variant, use in H1/title naturally |
| Secondary | youfibre vs hyperoptic | — | — | — | Reversed order — cover in intro/FAQ so both orderings are answered |
| Secondary | hyperoptic or youfibre | — | — | — | Natural-language variant, good FAQ-question fit |
| Supporting | youfibre reviews | 480/mo (est.) | 26 | £1.30 | From the wider gap dataset — weave into the YouFibre card/FAQ |
| Supporting | hyperoptic reviews | ~2,000/mo (est., from `hyperoptic broadband reviews`) | 25 | £1.19 | Already partially served by `/providers/hyperoptic` — link out, don't duplicate |
| Supporting | full fibre broadband under £25 | — | — | — | Both providers compete here; useful for the "Key Differences: Pricing" card |
| Supporting | symmetrical upload speed broadband | — | — | — | Both are FTTP/symmetrical — a genuine shared strength worth a "Key Differences" or intro mention, framed as "what both get right" |

Search intent: **Commercial comparison, BOFU** (someone has narrowed to these two
altnets and wants a decision, not general education). Write for a reader who
already knows what full fibre is — don't re-explain FTTP from scratch; link to
`/guides/full-fibre-broadband-explained` for that instead.

## Field-by-field copy brief (maps to the fixed template)

**`slug`**: `hyperoptic-vs-youfibre`
**`providerA` / `providerB`**: `hyperoptic`, `youfibre` (order chosen for A-Z
consistency with existing slugs, e.g. `bt-vs-sky`, `bt-vs-vodafone`)

**`title`** (renders as **H1**) — put the focus keyword at the front, mirror
the existing title pattern (`"X vs Y Broadband: Which Is Better in 2026?"`):
> Hyperoptic vs YouFibre Broadband: Which Full-Fibre Provider Is Better in 2026?

**`metaTitle`** (≤60 chars ideally):
> Hyperoptic vs YouFibre Broadband 2026 | Full Fibre Compared

**`metaDescription`** (70–165 chars, include focus keyword + a concrete
differentiator):
> Hyperoptic vs YouFibre broadband compared on price, symmetrical speeds, contract length, coverage and Trustpilot score. Which full-fibre altnet wins in 2026?

**`excerpt`** (sits under H1, above the fold — this is the GEO "concise
answer" a generative engine is most likely to quote, so make it stand alone
as a 35–90 word factual summary):
> Hyperoptic and YouFibre are both symmetrical full-fibre (FTTP) altnets rather than Openreach resellers, so the real choice is price, contract flexibility and which one actually reaches your address. Here's how they compare on speed, cost, contract terms and customer satisfaction.

**H2 "Quick Verdict"** → `winner` field. One or two sentences, decisive, no
hedging:
> [Draft once live pricing/coverage is confirmed — do not publish a winner
> based on unverified figures. Placeholder pattern: "YouFibre is the better
> value pick where its rolling-monthly option and lower advertised gigabit
> price both reach your address; Hyperoptic is the safer default given its
> longer track record and higher Trustpilot score, particularly outside
> YouFibre's footprint."]

**H2 provider cards** (auto-generated from `bestForA`/`bestForB` + existing
`Provider` fields — no free text needed beyond these two lines):
- `bestForA` (Hyperoptic): "Households that want a longer-established full-fibre altnet with the strongest Trustpilot score among major ISPs"
- `bestForB` (YouFibre): "Households that want contract flexibility — rolling monthly — plus a price-match and minimum-speed guarantee"

**H2 "At-a-Glance Comparison"**: fully data-driven from the `Provider`
objects (price, max speed, setup fee, contract, coverage, Trustpilot) —
no copywriting needed, just make sure both provider entries have accurate
values before this ships.

**H2 "Key Differences"** → `keyDifferences` (each `label` renders as an
**H3**). Use the focus/secondary keywords naturally inside `detail`, not the
`label`:
1. **Pricing** — "YouFibre currently undercuts Hyperoptic on entry-level gigabit pricing at a fixed monthly rate, while Hyperoptic's from-price sits lower at its base 150 Mbps tier — compare like-for-like speed tiers, not just the headline 'from' price."
2. **Contract flexibility** — "YouFibre offers a genuine rolling-monthly option alongside its 12-month fixed plan; Hyperoptic's shortest term is 12 months with no rolling alternative, which matters for renters or short-term movers."
3. **Coverage** — "Hyperoptic covers roughly 8% of UK homes concentrated in London and major cities; YouFibre's footprint (500,000+ premises) is smaller and regionally different — check both postcode checkers, don't assume overlap."
4. **Guarantees and trust signals** — "YouFibre advertises a minimum speed guarantee and price-match commitment; Hyperoptic's main trust signal is its Trustpilot lead over BT, Sky and Virgin Media combined — weigh a live review score against a guarantee promise."

**H2 "How We Think About This Matchup"** → `intro` (1–2 paragraphs). Lead
with the shared category truth (both symmetrical FTTP altnets, neither is an
Openreach reseller) before differentiating — this is the paragraph most
likely to satisfy a "hyperoptic vs youfibre" AI-overview query directly:
> Both Hyperoptic and YouFibre are full-fibre altnets running their own FTTP networks rather than reselling Openreach — so, unlike a BT-vs-Sky comparison, the underlying infrastructure genuinely differs by address rather than by retail plan. That makes availability the first real filter: check both postcode checkers before comparing price, because most UK addresses will only have one of the two.
> Where both do reach a property, the comparison comes down to contract flexibility, guarantees and current promotional pricing rather than raw speed — both offer symmetrical gigabit-class connections that outperform Openreach FTTC by a wide margin.

**H2 "Final Verdict"** → `verdict` (1–2 paragraphs, decisive, matches
`winner` but with more reasoning):
> [Write after live-data confirmation — same rule as Quick Verdict above.]

**H2 "Frequently Asked Questions"** → `faqs` (also becomes FAQPage JSON-LD —
write each answer as a standalone 35–90 word factual paragraph, GEO-style,
since these are the blocks most likely to get lifted into an AI answer):
1. "Is Hyperoptic or YouFibre faster?" — both offer symmetrical gigabit-class tiers; the faster option at your specific address depends on which tier is sold there, not the brand.
2. "Which is cheaper, Hyperoptic or YouFibre?" — compare like-for-like speed tiers and confirm current promotional pricing directly with each provider, since both run time-limited offers.
3. "Can I get a rolling monthly contract with Hyperoptic or YouFibre?" — YouFibre offers rolling monthly; Hyperoptic's shortest standard term is 12 months.
4. "Do Hyperoptic and YouFibre use the Openreach network?" — no, both build and operate their own independent full-fibre (FTTP) infrastructure.
5. "Which has better coverage, Hyperoptic or YouFibre?" — coverage is address-specific for both; check each provider's own postcode checker rather than assuming national coverage.

**H2 "Editorial and Source Notes"**: template-generated — only `sources`
needs populating. Use primary sources, not competitor marketing copy as fact:
- Ofcom Connected Nations (altnet coverage context) — `https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations`
- Hyperoptic broadband page — `https://www.hyperoptic.com/broadband/`
- YouFibre homepage — `https://youfibre.com/`

## Internal linking plan

- Link to `/providers/hyperoptic` (exists) and `/providers/youfibre` (build
  first — see Prerequisite)
- Link to `/guides/full-fibre-broadband-explained` wherever FTTP is
  mentioned, instead of re-explaining it
- Link to `/compare` and `/providers/compare` per the existing template
  defaults
- Once built, add this page into the `Provider vs comparison` cross-links on
  `/providers/hyperoptic` and (new) `/providers/youfibre`, and consider it as
  a candidate internal link from `/postcode/london` (Hyperoptic's core
  coverage area)

## GEO checklist specific to this page

- [ ] Excerpt and Quick Verdict each stand alone as a complete, quotable
      answer without needing the rest of the page for context
- [ ] Every FAQ answer is 35–90 words, factual, no hedging filler
- [ ] "How We Think About This Matchup" states the one fact a generic
      "X vs Y broadband" article usually gets wrong for altnets — that
      coverage, not plan choice, is the first filter
- [ ] Real, current Trustpilot/pricing figures before publishing — do not
      ship the placeholder Quick Verdict/Final Verdict text above verbatim
- [ ] `updatedDate` set to actual publish date, not copied from another page

## Publishing checklist

1. Add a `youfibre` entry to `data/providers.ts` (pricing, speeds, Trustpilot,
   coverage — confirm live, don't reuse the table above without checking)
2. Add the `hyperoptic-vs-youfibre` entry to `data/provider-comparisons.ts`
   using the fields above
3. No route/sitemap work needed — `app/providers/compare/[slug]/page.tsx`
   and `app/sitemap.ts` both read `providerComparisons` automatically
4. Re-run `python3 scripts/build_keyword_mapping.py` after publishing so the
   Keyword Mapping tab flips this row from "Content gap" to "Existing page"
