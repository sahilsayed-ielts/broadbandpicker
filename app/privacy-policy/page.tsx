import type { Metadata } from 'next'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import PageHeroBanner from '@/components/PageHeroBanner'
import { DEFAULT_GUIDE_CTAS, hubHero } from '@/lib/pageHero'

const HERO = hubHero()

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | BroadbandPicker' },
  description: 'BroadbandPicker privacy policy: how we collect, use, and protect your personal data.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  const year = new Date().getFullYear()

  return (
    <div>
      <PageHeroBanner
        title="Privacy Policy"
        kicker="Legal"
        lede="How we collect, use, and protect your personal data."
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Privacy policy', href: '/privacy-policy' },
        ]}
      />
      <p className="text-sm text-slate-500 mb-8">Last updated: 20 September 2026</p>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3">
        <p>
          BroadbandPicker (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates
          broadbandpicker.co.uk. This privacy policy explains how we collect, use, and protect your
          personal data when you use our website.
        </p>

        <h2>Data we collect</h2>
        <p>We collect the following data when you use our site:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Postcodes</strong> you enter into our postcode checker (not linked to your identity)</li>
          <li><strong>Approximate location</strong>, only if you allow it in the browser on the speed test. Coordinates stay in your browser and are sent to the public UK postcodes.io lookup so we can show the nearest postcode district. We do not store coordinates on our servers or send them to analytics.</li>
          <li><strong>Usage data</strong> via analytics cookies: pages visited, clicks, and session duration</li>
          <li><strong>Contact information</strong> (name, email) if you contact us directly</li>
          <li><strong>Deal-alert subscriptions</strong> if you ask for emails: your email address, an optional UK postcode outward code, the consent wording you ticked, the page you were on, the time, a hashed IP address, and whether you confirmed or unsubscribed</li>
        </ul>
        <p>We do not collect payment information or sensitive personal data. We do not ask for a full street address on the alerts form.</p>

        <h2>How we use your data</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To show you broadband deals relevant to your postcode area</li>
          <li>To attach a speed-test result to a UK postcode district when you allow location</li>
          <li>To improve our website through analytics</li>
          <li>To respond to enquiries you send us</li>
          <li>To send BroadbandPicker deal-alert emails you asked for, after you confirm the address</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use essential browser storage to remember your choices and, with permission, Google
          Analytics cookies to understand how visitors use our site. Analytics storage is denied
          by default. We do not sell personal data. See our{' '}
          <a href="/cookie-policy" className="text-sky-600 hover:underline">cookie policy</a>.
        </p>

        <h2>Google advertising</h2>
        <p>
          Selected editorial pages may load Google AdSense so that, once Google approves the site,
          display ads can appear next to original guide and research copy. Advertising storage,
          ad user data and ad personalisation remain denied by default. Personalised ads in the
          UK, EEA and Switzerland are requested only after Google&apos;s certified IAB TCF consent
          message, which includes an equal choice not to consent.
        </p>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s
          prior visits to this website or other websites. Google&apos;s use of advertising cookies
          enables it and its partners to serve ads based on visits to this site and/or other sites
          on the internet.
        </p>
        <p>
          You may opt out of personalised advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
            Google Ads Settings
          </a>
          {' '}or{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
            www.aboutads.info
          </a>
          .
        </p>

        <h2>Deal alerts by email</h2>
        <p>
          If you use the alerts form, you are asking BroadbandPicker to email you weekly UK
          broadband deal roundups and occasional switching guides. That is electronic mail
          marketing under the Privacy and Electronic Communications Regulations (PECR). We rely
          on your consent, not on a “soft opt-in”: you are not buying a service from us when you
          type your email. The tick box is unticked. It names BroadbandPicker, the channel (email)
          and the content. Using the postcode checker does not sign you up.
        </p>
        <p>
          We then send a confirmation email. We do not send deal roundups until you click the
          link. That records that the address is yours. Every later message identifies BroadbandPicker
          and includes an unsubscribe link. You can also email{' '}
          <a href="mailto:privacy@broadbandpicker.co.uk" className="text-sky-600 hover:underline">
            privacy@broadbandpicker.co.uk
          </a>
          . After you unsubscribe we keep a suppression record so we do not email that address
          again unless you sign up and confirm later.
        </p>
        <p>
          Alerts come from BroadbandPicker at noreply@broadbandpicker.co.uk. The weekly roundup
          is also published at /alerts/weekly so you can read the same issue on the site. They are automated,
          so do not reply to that address; use the contact page instead. Subscription records are
          stored in the database used by this site. We hash the IP address seen at signup and do
          not store the raw IP. We do not sell the list or share it with broadband providers as a
          marketing list.
        </p>

        <h2>Affiliate links</h2>
        <p>
          When you click a &ldquo;Get Deal&rdquo; button, you are redirected to a provider&apos;s
          website via an affiliate tracking link. We receive a commission if you sign up. The
          provider may set their own cookies. Please refer to the relevant provider&apos;s privacy
          policy for information about how they use your data after you click through.
        </p>

        <h2>Data retention</h2>
        <p>
          Google Analytics data is configured for a limited retention period and may also be
          retained in aggregated reports. Direct enquiries are retained only as long as reasonably
          necessary to answer and administer them. Postcode searches are not stored permanently.
          Confirmed alert subscriptions are kept until you unsubscribe. We then keep a suppression
          record. Unconfirmed signups are not used for deal emails; confirmation links expire after
          48 hours.
        </p>

        <h2>Your rights</h2>
        <p>
          Under UK GDPR, you have the right to access, rectify, or erase personal data we hold
          about you. To exercise these rights, email us at{' '}
          <a href="mailto:privacy@broadbandpicker.co.uk" className="text-sky-600 hover:underline">
            privacy@broadbandpicker.co.uk
          </a>
          .
        </p>

        <h2>Third-party services</h2>
        <p>
          We use Google Analytics for consented website analytics, Google AdSense on selected
          editorial pages, and affiliate networks or broadband providers when you choose to follow
          an affiliate link. Alert emails are sent by BroadbandPicker from
          noreply@broadbandpicker.co.uk. Read{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Google&apos;s privacy policy</a>{' '}
          and the destination provider&apos;s privacy information for details of their processing.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The date at the top of this page shows when
          it was last revised.
        </p>

        <p className="text-sm text-slate-500 pt-4">
          &copy; {year} BroadbandPicker.co.uk
        </p>
      </div>
      </div>
    </div>
  )
}
