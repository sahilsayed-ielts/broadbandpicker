import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import PageHeroBanner from '@/components/PageHeroBanner'
import { DEFAULT_GUIDE_CTAS, hubHero } from '@/lib/pageHero'

const HERO = hubHero()

export const metadata: Metadata = {
  title: { absolute: 'Cookie Policy | BroadbandPicker' },
  description: 'How BroadbandPicker uses essential and optional cookies, including analytics consent and affiliate tracking.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/cookie-policy' },
}

export default function CookiePolicyPage() {
  return (
    <div>
      <PageHeroBanner
        title="Cookie Policy"
        kicker="Legal"
        lede="How BroadbandPicker uses essential and optional cookies, including analytics consent and affiliate tracking."
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav items={[{ name: 'Home', href: '/' }, { name: 'Cookie policy', href: '/cookie-policy' }]} />
      <p className="text-sm text-slate-500 mb-8">Last updated: 16 September 2026</p>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3">
        <p>This policy explains how BroadbandPicker uses cookies and similar browser storage on broadbandpicker.co.uk.</p>

        <h2>Essential storage</h2>
        <p>We use browser storage to remember your cookie choice and support core site functions. This does not require analytics or advertising consent.</p>

        <h2>Analytics cookies</h2>
        <p>With your permission, Google Analytics helps us understand which pages are used and how the site performs. Analytics storage is denied by default and is enabled only after you select “Accept analytics”. You can continue using the site after selecting “Essential only”.</p>

        <h2>Affiliate tracking</h2>
        <p>When you follow a clearly labelled affiliate link, the destination provider or affiliate network may set its own tracking cookie to attribute a later purchase. Those third parties control their cookies after you leave BroadbandPicker and provide their own privacy information.</p>

        <h2>Advertising cookies</h2>
        <p>
          Selected editorial pages (guides and original research) may load Google AdSense. Third-party
          vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to
          this website or other websites. Google&apos;s use of advertising cookies enables it and its
          partners to serve ads based on those visits.
        </p>
        <p>
          Advertising storage, ad user data and ad personalisation remain denied by default.
          Personalised ads in the UK, EEA and Switzerland use Google&apos;s certified IAB TCF
          consent message (Google LLC CMP). The site bar lets you choose essential cookies only,
          analytics, or open that certified ad-choices message. You can also opt out of personalised
          advertising in{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
            Google Ads Settings
          </a>
          {' '}or at{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
            www.aboutads.info
          </a>
          .
        </p>

        <h2>Location permission</h2>
        <p>
          The speed test may ask the browser for your location. That is a browser permission, not a cookie.
          If you allow it, coordinates stay in your browser and are sent only to the public UK postcodes.io
          lookup so we can show the nearest postcode district. You can allow this visit, allow this time, or
          never allow. See the <Link href="/privacy-policy" className="text-sky-600 hover:underline">privacy policy</Link>.
        </p>

        <h2>Change your choice</h2>
        <p>Use the “Cookie preferences” button in the footer at any time to review analytics or open Google ad choices. You can also remove cookies and local storage using your browser settings.</p>

        <h2>More information</h2>
        <p>See our <Link href="/privacy-policy" className="text-sky-600 hover:underline">privacy policy</Link> or email <a href="mailto:privacy@broadbandpicker.co.uk" className="text-sky-600 hover:underline">privacy@broadbandpicker.co.uk</a>.</p>
      </div>
      </div>
    </div>
  )
}
