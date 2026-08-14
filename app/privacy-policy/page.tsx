import type { Metadata } from 'next'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | BroadbandPicker' },
  description: 'BroadbandPicker privacy policy — how we collect, use, and protect your personal data.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  const year = new Date().getFullYear()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Privacy policy', href: '/privacy-policy' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: 9 August 2026</p>

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
          <li><strong>Usage data</strong> via analytics cookies — pages visited, clicks, and session duration</li>
          <li><strong>Contact information</strong> (name, email) if you contact us directly</li>
        </ul>
        <p>We do not collect payment information or sensitive personal data.</p>

        <h2>How we use your data</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To show you broadband deals relevant to your postcode area</li>
          <li>To improve our website through analytics</li>
          <li>To respond to enquiries you send us</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use essential browser storage to remember your choices and, with permission, Google
          Analytics cookies to understand how visitors use our site. Analytics storage is denied
          by default. Google AdSense site-verification code is installed, but we do not currently
          serve approved display advertising and advertising consent remains denied by default.
          We do not sell personal data. See our{' '}
          <a href="/cookie-policy" className="text-sky-600 hover:underline">cookie policy</a>.
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
          We use Google Analytics for consented website analytics, Google AdSense for site
          verification and future approved advertising, and affiliate networks or broadband
          providers when you choose to follow an affiliate link. Read{' '}
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
  )
}
