import type { Metadata } from 'next'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import SavedDealsClient from '@/components/SavedDealsClient'
import PageHeroBanner from '@/components/PageHeroBanner'
import { DEFAULT_GUIDE_CTAS, categoryHero } from '@/lib/pageHero'

const HERO = categoryHero('deals-and-pricing')

export const metadata: Metadata = {
  title: 'Your Saved Deals | BroadbandPicker',
  description: 'Broadband deals you saved for later, stored only in this browser.',
  // Personal, per-browser localStorage list — nothing here to index.
  robots: { index: false, follow: true },
}

export default function SavedDealsPage() {
  return (
    <div>
      <PageHeroBanner
        title="Your saved deals"
        kicker="This device only"
        lede="Saved on this device only. Nothing is sent to us or shared. Clearing your browser data clears this list."
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Saved deals', href: '/saved-deals' }]} />
      <SavedDealsClient />
      </div>
    </div>
  )
}
