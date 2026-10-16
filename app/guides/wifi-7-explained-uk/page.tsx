import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getGuideBySlug } from '@/data/guides'
import Wifi7ExplainedGuide from '@/components/Wifi7ExplainedGuide'

const PATH = '/guides/wifi-7-explained-uk'
const BANNER = 'https://broadbandpicker.co.uk/guides/wifi-7/banner.jpg'

export async function generateMetadata(): Promise<Metadata> {
  const guide = getGuideBySlug('wifi-7-explained-uk')
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
      images: [{ url: BANNER, width: 1600, height: 900, alt: 'UK living room with a glowing home router, original BroadbandPicker artwork' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [BANNER],
    },
  }
}

export default function Wifi7ExplainedPage() {
  if (!getGuideBySlug('wifi-7-explained-uk')) notFound()
  return <Wifi7ExplainedGuide />
}
