import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: { absolute: 'Cookie Policy | BroadbandPicker' },
  description: 'How BroadbandPicker uses essential and optional cookies, including analytics consent and affiliate tracking.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/cookie-policy' },
}

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Cookie policy', href: '/cookie-policy' }]} />
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Cookie Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: 9 August 2026</p>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3">
        <p>This policy explains how BroadbandPicker uses cookies and similar browser storage on broadbandpicker.co.uk.</p>

        <h2>Essential storage</h2>
        <p>We use browser storage to remember your cookie choice and support core site functions. This does not require analytics or advertising consent.</p>

        <h2>Analytics cookies</h2>
        <p>With your permission, Google Analytics helps us understand which pages are used and how the site performs. Analytics storage is denied by default and is enabled only after you select “Accept analytics”. You can continue using the site after selecting “Essential only”.</p>

        <h2>Affiliate tracking</h2>
        <p>When you follow a clearly labelled affiliate link, the destination provider or affiliate network may set its own tracking cookie to attribute a later purchase. Those third parties control their cookies after you leave BroadbandPicker and provide their own privacy information.</p>

        <h2>Advertising cookies</h2>
        <p>BroadbandPicker has installed the Google AdSense site-verification code but does not currently serve approved display advertising. Advertising consent remains denied by default. Before requesting personalised advertising consent or serving approved ads in the UK or EEA, we will enable a Google-certified consent platform and keep this policy updated.</p>

        <h2>Change your choice</h2>
        <p>Use the “Cookie preferences” button in the footer at any time to review or change your analytics choice. You can also remove cookies and local storage using your browser settings.</p>

        <h2>More information</h2>
        <p>See our <Link href="/privacy-policy" className="text-sky-600 hover:underline">privacy policy</Link> or email <a href="mailto:privacy@broadbandpicker.co.uk" className="text-sky-600 hover:underline">privacy@broadbandpicker.co.uk</a>.</p>
      </div>
    </div>
  )
}
