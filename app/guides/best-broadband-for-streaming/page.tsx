import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getGuideBySlug } from '@/data/guides'
import StreamingBroadbandGuide from '@/components/StreamingBroadbandGuide'

const PATH = '/guides/best-broadband-for-streaming'
const BANNER = 'https://broadbandpicker.co.uk/guides/streaming/banner.jpg'

export async function generateMetadata(): Promise<Metadata> {
  const guide = getGuideBySlug('best-broadband-for-streaming')
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
      images: [{ url: BANNER, width: 1600, height: 900, alt: 'UK living room watching a football match on a large television, original BroadbandPicker artwork' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [BANNER],
    },
  }
}

export default function BestBroadbandForStreamingPage() {
  if (!getGuideBySlug('best-broadband-for-streaming')) notFound()
  return <StreamingBroadbandGuide />
}
