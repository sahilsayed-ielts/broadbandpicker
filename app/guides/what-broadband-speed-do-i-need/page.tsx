import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getGuideBySlug } from '@/data/guides'
import WhatBroadbandSpeedGuide from '@/components/WhatBroadbandSpeedGuide'

const PATH = '/guides/what-broadband-speed-do-i-need'
const BANNER = 'https://broadbandpicker.co.uk/guides/speed-need/banner.jpg'

export async function generateMetadata(): Promise<Metadata> {
  const guide = getGuideBySlug('what-broadband-speed-do-i-need')
  if (!guide) return {}
  return {
    title: { absolute: guide.metaTitle },
    description: guide.metaDescription,
    alternates: { canonical: `https://broadbandpicker.co.uk${PATH}` },
    authors: [{ name: 'BroadbandPicker editorial team', url: 'https://broadbandpicker.co.uk/about' }],
    category: guide.category,
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `https://broadbandpicker.co.uk${PATH}`,
      type: 'article',
      publishedTime: guide.publishDate,
      modifiedTime: guide.updatedDate,
      locale: 'en_GB',
      images: [{ url: BANNER, width: 1600, height: 900, alt: 'UK living room used as a home office at dusk, original BroadbandPicker artwork' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [BANNER],
    },
  }
}

export default function WhatBroadbandSpeedPage() {
  if (!getGuideBySlug('what-broadband-speed-do-i-need')) notFound()
  return <WhatBroadbandSpeedGuide />
}
