import type { Metadata } from 'next'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: 'Contact BroadbandPicker',
  description:
    'Get in touch with the BroadbandPicker team. For editorial enquiries, affiliate partnerships, or general questions.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/contact' },
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Contact', href: '/contact' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Contact Us</h1>

      <p className="text-slate-600 mb-8">
        We&apos;re a small team. We aim to respond to all enquiries within 2 business days.
      </p>

      <div className="space-y-6 mb-10">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-bold text-slate-900 mb-1">Editorial enquiries</h2>
          <p className="text-sm text-slate-600 mb-2">
            Questions about our reviews, guides, or how we compare providers.
          </p>
          <a
            href="mailto:editorial@broadbandpicker.co.uk"
            className="text-sky-600 text-sm font-medium hover:underline"
          >
            editorial@broadbandpicker.co.uk
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-bold text-slate-900 mb-1">Affiliate partnerships</h2>
          <p className="text-sm text-slate-600 mb-2">
            Interested in listing your broadband product on BroadbandPicker.
          </p>
          <a
            href="mailto:partnerships@broadbandpicker.co.uk"
            className="text-sky-600 text-sm font-medium hover:underline"
          >
            partnerships@broadbandpicker.co.uk
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-bold text-slate-900 mb-1">General & press</h2>
          <p className="text-sm text-slate-600 mb-2">
            All other enquiries, including press and media.
          </p>
          <a
            href="mailto:hello@broadbandpicker.co.uk"
            className="text-sky-600 text-sm font-medium hover:underline"
          >
            hello@broadbandpicker.co.uk
          </a>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
        <p className="font-semibold text-slate-900 mb-2">Important note</p>
        <p>
          BroadbandPicker is a comparison service — we cannot help with issues related to your
          broadband service, billing disputes, or technical problems. For those issues, please
          contact your broadband provider directly.
        </p>
      </div>
    </div>
  )
}
