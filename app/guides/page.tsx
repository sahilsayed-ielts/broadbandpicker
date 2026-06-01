import type { Metadata } from 'next'
import Link from 'next/link'
import { guides } from '@/data/guides'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: 'Broadband Guides & Advice | BroadbandPicker',
  description:
    'Expert broadband guides to help you choose, switch, and save. How to switch broadband, speed guides, best deals, and more from BroadbandPicker.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/guides' },
  openGraph: {
    title: 'Broadband Guides & Advice | BroadbandPicker',
    description: 'Expert broadband guides — how to switch, what speeds you need, and more.',
    url: 'https://broadbandpicker.co.uk/guides',
  },
}

export default function GuidesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Guides', href: '/guides' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Broadband Guides</h1>
      <p className="text-slate-600 mb-8 max-w-2xl">
        Everything you need to know about choosing, switching, and getting the most out of your
        broadband connection.
      </p>

      <div className="space-y-4">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-1">
                  {guide.title}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{guide.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Updated {new Date(guide.updatedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span>{guide.readingTime} min read</span>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition-colors flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 bg-sky-50 border border-sky-200 rounded-xl">
        <h2 className="font-bold text-slate-900 mb-2">Ready to compare deals?</h2>
        <p className="text-sm text-slate-600 mb-4">
          Enter your postcode to see which providers are available at your address and find the
          best deal for your household.
        </p>
        <Link
          href="/compare"
          className="inline-block px-5 py-2.5 bg-sky-500 text-white font-semibold rounded-lg text-sm hover:bg-sky-600 transition-colors"
        >
          Compare broadband deals
        </Link>
      </div>
    </div>
  )
}
