import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getGuideBySlug } from '@/data/guides'
import Gta6BroadbandGuide from '@/components/Gta6BroadbandGuide'

const PATH = '/guides/gta-6-broadband-uk'
const BANNER = 'https://broadbandpicker.co.uk/guides/gta-6/banner.jpg'

export async function generateMetadata(): Promise<Metadata> {
  const guide = getGuideBySlug('gta-6-broadband-uk')
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
      images: [{ url: BANNER, width: 1600, height: 900, alt: 'Neon coastal city at night, original BroadbandPicker artwork for GTA 6 launch week' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [BANNER],
    },
  }
}

export default function Gta6BroadbandPage() {
  if (!getGuideBySlug('gta-6-broadband-uk')) notFound()
  return <Gta6BroadbandGuide />
}
