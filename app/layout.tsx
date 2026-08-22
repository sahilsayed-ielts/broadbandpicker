import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Link from 'next/link'
import './globals.css'
import PostcodeChecker from '@/components/PostcodeChecker'
import NewsletterSignup from '@/components/NewsletterSignup'
import CookieBanner from '@/components/CookieBanner'
import CookiePreferencesButton from '@/components/CookiePreferencesButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const adsensePublisherId = 'ca-pub-9056289061141918'

export const metadata: Metadata = {
  metadataBase: new URL('https://broadbandpicker.co.uk'),
  title: {
    default: 'Compare Broadband Deals UK | BroadbandPicker',
    template: '%s | BroadbandPicker',
  },
  description:
    'Compare the best broadband deals in the UK. Find cheap fibre and full-fibre packages from BT, Sky, Virgin Media, EE and more. Free postcode checker.',
  alternates: {
    canonical: 'https://broadbandpicker.co.uk',
    languages: { 'en-GB': 'https://broadbandpicker.co.uk' },
  },
  openGraph: {
    siteName: 'BroadbandPicker',
    locale: 'en_GB',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="BroadbandPicker home">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="7" fill="#0EA5E9" />
              <path d="M6 18c2-4 4-6 8-6s6 2 8 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M9 18c1-2 2-3 5-3s4 1 5 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="14" cy="18" r="1.5" fill="white" />
            </svg>
            <span className="font-bold text-slate-900 text-lg">BroadbandPicker</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium" aria-label="Main navigation">
            <Link href="/compare" className="text-slate-600 hover:text-sky-600 transition-colors">Compare</Link>
            <Link href="/deals" className="text-slate-600 hover:text-sky-600 transition-colors">Deals</Link>
            <Link href="/providers" className="text-slate-600 hover:text-sky-600 transition-colors">Providers</Link>
            <Link href="/postcode" className="text-slate-600 hover:text-sky-600 transition-colors">Postcode</Link>
            <Link href="/guides" className="text-slate-600 hover:text-sky-600 transition-colors">Guides</Link>
            <Link href="/tools/broadband-match" className="text-slate-600 hover:text-sky-600 transition-colors">Match</Link>
            <Link href="/speed-test" className="text-slate-600 hover:text-sky-600 transition-colors">Speed Test</Link>
          </nav>

          {/* Header postcode checker */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xs">
            <PostcodeChecker placeholder="Your postcode" />
          </div>

          {/* Mobile menu button */}
          <MobileMenuButton />
        </div>
      </div>
    </header>
  )
}

function MobileMenuButton() {
  return (
    <details className="lg:hidden relative">
      <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-slate-100 text-slate-600">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="sr-only">Open navigation menu</span>
      </summary>
      <nav className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50" aria-label="Mobile navigation">
        {[
          { href: '/compare', label: 'Compare' },
          { href: '/deals', label: 'Deals' },
          { href: '/providers', label: 'Providers' },
          { href: '/postcode', label: 'Postcode' },
          { href: '/guides', label: 'Guides' },
          { href: '/tools/broadband-match', label: 'Broadband Match' },
          { href: '/speed-test', label: 'Speed Test' },
          { href: '/about', label: 'About' },
          { href: '/contact', label: 'Contact' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </details>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <NewsletterSignup source="footer" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Compare</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/compare" className="hover:text-white transition-colors">All providers</Link></li>
              <li><Link href="/deals" className="hover:text-white transition-colors">Best deals</Link></li>
              <li><Link href="/providers" className="hover:text-white transition-colors">Provider reviews</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tools/broadband-match" className="hover:text-white transition-colors">Broadband Match quiz</Link></li>
              <li><Link href="/speed-test" className="hover:text-white transition-colors">Speed test</Link></li>
              <li><Link href="/tools/broadband-cost-calculator" className="hover:text-white transition-colors">Cost calculator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Find Broadband</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/postcode" className="hover:text-white transition-colors">By postcode</Link></li>
              <li><Link href="/postcode/london" className="hover:text-white transition-colors">London</Link></li>
              <li><Link href="/postcode/manchester" className="hover:text-white transition-colors">Manchester</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Guides</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/guides/how-to-switch-broadband-uk" className="hover:text-white transition-colors">How to switch</Link></li>
              <li><Link href="/guides/best-broadband-deals-uk" className="hover:text-white transition-colors">Best deals</Link></li>
              <li><Link href="/guides/broadband-speeds-explained" className="hover:text-white transition-colors">Speed guide</Link></li>
              <li><Link href="/guides" className="hover:text-white transition-colors">All guides</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/research/uk-broadband-customer-satisfaction" className="hover:text-white transition-colors">Research</Link></li>
              <li><Link href="/editorial-policy" className="hover:text-white transition-colors">Editorial policy</Link></li>
              <li><Link href="/how-we-make-money" className="hover:text-white transition-colors">How we make money</Link></li>
              <li><Link href="/how-we-review-broadband" className="hover:text-white transition-colors">How we review</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy policy</Link></li>
              <li>
                <CookiePreferencesButton />
              </li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of use</Link></li>
              <li><Link href="/broadband-glossary" className="hover:text-white transition-colors">Broadband glossary</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 space-y-4">
          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/broadbandPicker"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BroadbandPicker on X (Twitter)"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @broadbandPicker
            </a>
          </div>

          <p className="text-xs text-slate-300 max-w-3xl">
            BroadbandPicker.co.uk is a free comparison service. We may receive a commission when you click through to a provider and take out a service. This does not affect our editorial independence or the prices you are quoted. All prices shown are monthly. Contract terms, prices and availability are subject to change — always verify with the provider before signing up.
          </p>
          <p className="text-xs text-slate-400">
            &copy; {year} BroadbandPicker.co.uk — We are not affiliated with any broadband provider. All trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="en-GB" className={`${inter.variable} h-full`}>
      <head>
        <link rel="alternate" hrefLang="en-GB" href="https://broadbandpicker.co.uk" />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />

        {gaId && (
          <>
            {/* Consent Mode v2 defaults — all optional storage denied until valid consent. */}
            <Script id="ga-consent-default" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
