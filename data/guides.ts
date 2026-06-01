export interface GuideMetadata {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  publishDate: string
  updatedDate: string
  excerpt: string
  readingTime: number
}

export const guides: GuideMetadata[] = [
  {
    slug: 'how-to-switch-broadband-uk',
    title: 'How to Switch Broadband in the UK (2026 Guide)',
    metaTitle: 'How to Switch Broadband UK 2026 | Step-by-Step Guide',
    metaDescription: 'Switching broadband is easier than you think. Our step-by-step guide explains how to switch UK broadband providers, avoid penalties, and get the best deal.',
    publishDate: '2026-01-01',
    updatedDate: '2026-06-01',
    excerpt: 'Switching broadband is easier than ever thanks to Ofcom\'s One Touch Switching rules. Here\'s exactly how to do it without losing connection.',
    readingTime: 7,
  },
  {
    slug: 'best-broadband-deals-uk',
    title: 'Best Broadband Deals in the UK Right Now',
    metaTitle: 'Best Broadband Deals UK June 2026 | BroadbandPicker',
    metaDescription: 'Find the best broadband deals available in the UK right now. Updated June 2026. Compare BT, Sky, Virgin Media, EE and more from £17.99/month.',
    publishDate: '2026-01-01',
    updatedDate: '2026-06-01',
    excerpt: 'We\'ve compared every UK broadband deal so you don\'t have to. Here are the best packages available right now, sorted by value.',
    readingTime: 8,
  },
  {
    slug: 'full-fibre-broadband-explained',
    title: 'Full Fibre Broadband Explained: Is FTTP Worth It?',
    metaTitle: 'Full Fibre Broadband Explained | BroadbandPicker',
    metaDescription: 'Full fibre (FTTP) broadband delivers speeds up to 1Gbps with no copper wiring. Find out if it\'s available at your address and whether it\'s worth upgrading.',
    publishDate: '2026-01-15',
    updatedDate: '2026-06-01',
    excerpt: 'Full fibre broadband is the fastest, most reliable connection available. But is it available at your address — and is it worth paying more for?',
    readingTime: 9,
  },
  {
    slug: 'broadband-speeds-explained',
    title: 'Broadband Speeds Explained: What Speed Do You Actually Need?',
    metaTitle: 'Broadband Speeds Explained | BroadbandPicker',
    metaDescription: 'Not sure what broadband speed you need? Our guide explains download vs upload speeds, Mbps vs Gbps, and exactly what speed suits your household.',
    publishDate: '2026-01-20',
    updatedDate: '2026-06-01',
    excerpt: 'Mbps, Gbps, download vs upload — broadband jargon is confusing. This guide cuts through it and tells you exactly what speed you need at home.',
    readingTime: 7,
  },
  {
    slug: 'cheapest-broadband-uk',
    title: 'Cheapest Broadband Deals in the UK 2026',
    metaTitle: 'Cheapest Broadband Deals UK 2026 | BroadbandPicker',
    metaDescription: 'Looking for the cheapest broadband in the UK? Compare the lowest-priced deals from every provider. Budget packages from £17.99/month.',
    publishDate: '2026-01-25',
    updatedDate: '2026-06-01',
    excerpt: 'You don\'t need to spend a fortune on broadband. Here are the cheapest deals available in the UK right now — including tips to negotiate an even lower price.',
    readingTime: 6,
  },
  {
    slug: 'best-broadband-for-working-from-home',
    title: 'Best Broadband for Working From Home UK 2026',
    metaTitle: 'Best Broadband for Working From Home | BroadbandPicker',
    metaDescription: 'Working from home? You need fast, reliable broadband with a strong upload speed. Compare the best home office broadband packages in the UK.',
    publishDate: '2026-02-01',
    updatedDate: '2026-06-01',
    excerpt: 'Working from home demands reliable, fast broadband — especially for video calls. Here\'s what to look for and the best packages available right now.',
    readingTime: 8,
  },
]

export function getGuideBySlug(slug: string): GuideMetadata | undefined {
  return guides.find((g) => g.slug === slug)
}
