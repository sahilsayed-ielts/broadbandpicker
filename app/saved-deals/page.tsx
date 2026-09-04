import type { Metadata } from 'next'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import SavedDealsClient from '@/components/SavedDealsClient'

export const metadata: Metadata = {
  title: 'Your Saved Deals | BroadbandPicker',
  description: 'Broadband deals you saved for later, stored only in this browser.',
  // Personal, per-browser localStorage list — nothing here to index.
  robots: { index: false, follow: true },
}

export default function SavedDealsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Saved deals', href: '/saved-deals' }]} />
      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">Your saved deals</h1>
      <p className="mb-8 text-slate-600">
        Saved on this device only — nothing is sent to us or shared. Clearing your browser data clears this list.
      </p>
      <SavedDealsClient />
    </div>
  )
}
