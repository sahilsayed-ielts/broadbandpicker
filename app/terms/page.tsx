import type { Metadata } from 'next'
import BreadcrumbNav from '@/components/BreadcrumbNav'

export const metadata: Metadata = {
  title: 'Terms of Use | BroadbandPicker',
  description: 'Terms of use for BroadbandPicker.co.uk — a free UK broadband comparison service.',
  alternates: { canonical: 'https://broadbandpicker.co.uk/terms' },
}

export default function TermsPage() {
  const year = new Date().getFullYear()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbNav
        items={[
          { name: 'Home', href: '/' },
          { name: 'Terms of use', href: '/terms' },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Terms of Use</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

      <div className="space-y-6 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3">
        <p>
          By using broadbandpicker.co.uk you agree to these terms. If you do not agree, please do
          not use the site.
        </p>

        <h2>About BroadbandPicker</h2>
        <p>
          BroadbandPicker is a free broadband comparison service. We are not a broadband provider
          and we do not supply broadband services. Any contract you enter into will be directly
          with the broadband provider you choose.
        </p>

        <h2>Accuracy of information</h2>
        <p>
          We make every reasonable effort to ensure that the prices, speeds, and deal terms shown
          on this site are accurate and up to date. However, broadband deals change frequently.
          You should always verify the current price and terms directly with the provider before
          signing up. BroadbandPicker accepts no liability for errors or omissions in the
          information shown.
        </p>

        <h2>Affiliate relationships</h2>
        <p>
          BroadbandPicker earns commission from providers when you click through and sign up via
          our site. This is disclosed throughout the site. Our editorial rankings and reviews are
          not influenced by affiliate relationships.
        </p>

        <h2>Intellectual property</h2>
        <p>
          All content on this site — including text, guides, data, and design — is owned by or
          licensed to BroadbandPicker. You may not reproduce, republish, or distribute our content
          without written permission. Provider names and trademarks are the property of their
          respective owners.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          BroadbandPicker provides information for general guidance only. We are not liable for any
          decisions you make based on information shown on this site, or for any loss arising from
          your use of a broadband provider you find through us.
        </p>

        <h2>Links to third-party websites</h2>
        <p>
          Our site contains affiliate links to third-party provider websites. We are not responsible
          for the content, accuracy, or privacy practices of those sites.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of England and Wales.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the site after any changes
          constitutes acceptance of the updated terms.
        </p>

        <p className="text-sm text-slate-500 pt-4">&copy; {year} BroadbandPicker.co.uk</p>
      </div>
    </div>
  )
}
