import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Link from 'next/link'
import './globals.css'
import PostcodeChecker from '@/components/PostcodeChecker'
import NewsletterSignup from '@/components/NewsletterSignup'
import CookieBanner from '@/components/CookieBanner'
import CookiePreferencesButton from '@/components/CookiePreferencesButton'
import Logo from '@/components/Logo'
import MainNav from '@/components/MainNav'
import MobileNav from '@/components/MobileNav'
import AiReferralTracker from '@/components/AiReferralTracker'
import { JsonLd } from '@/lib/jsonLd'
import { siteOrganizationGraph } from '@/lib/siteSchema'

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
  icons: {
    icon: [{ url: '/broadbandpicker-favicon-96.png', type: 'image/png', sizes: '96x96' }],
    shortcut: '/broadbandpicker-favicon-96.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    siteName: 'BroadbandPicker',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'BroadbandPicker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Broadband Deals UK | BroadbandPicker',
    description:
      'Compare the best broadband deals in the UK. Find cheap fibre and full-fibre packages from BT, Sky, Virgin Media, EE and more. Free postcode checker.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

function TrustStrip() {
  return (
    <div className="hidden border-b border-slate-800 bg-slate-900 text-sky-100 sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
        <p className="text-[11px] font-medium tracking-wide">
          Independent UK broadband comparison. Rankings are not sold.
        </p>
        <div className="flex items-center gap-4 text-[11px] font-semibold">
          <Link href="/how-we-make-money" className="text-sky-300 transition-colors hover:text-white">
            How we make money
          </Link>
          <Link href="/how-we-review-broadband" className="text-sky-300 transition-colors hover:text-white">
            How we review
          </Link>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div id="top">
      <TrustStrip />
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              href="/"
              className="flex flex-shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
              aria-label="BroadbandPicker home"
            >
              <Logo />
              <span className="hidden border-l border-slate-200 pl-2.5 text-[11px] font-medium leading-tight text-slate-500 xl:block">
                UK broadband
                <br />
                comparison
              </span>
            </Link>

            <MainNav />

            <div className="hidden max-w-sm flex-1 items-center gap-2 lg:flex">
              <PostcodeChecker placeholder="Check your postcode" />
            </div>

            <MobileNav />
          </div>
        </div>
      </header>
    </div>
  )
}

const FOOTER_COLUMNS: { heading: string; links: { href: string; label: string; component?: 'cookie' }[] }[] = [
  {
    heading: 'Compare',
    links: [
      { href: '/compare', label: 'All providers' },
      { href: '/deals', label: 'Best deals' },
      { href: '/providers', label: 'Provider reviews' },
    ],
  },
  {
    heading: 'Tools',
    links: [
      { href: '/tools/broadband-match', label: 'Broadband Match quiz' },
      { href: '/speed-test', label: 'Speed test' },
      { href: '/tools/broadband-cost-calculator', label: 'Cost calculator' },
    ],
  },
  {
    heading: 'In your area',
    links: [
      { href: '/postcode', label: 'Broadband by postcode' },
      { href: '/postcode/london', label: 'London' },
      { href: '/postcode/manchester', label: 'Manchester' },
    ],
  },
  {
    heading: 'Guides',
    links: [
      { href: '/guides/how-to-switch-broadband-uk', label: 'How to switch' },
      { href: '/guides/broadband-social-tariffs-uk', label: 'Social tariffs' },
      { href: '/guides/full-fibre-broadband-explained', label: 'Full fibre' },
      { href: '/guides/cheapest-broadband-uk', label: 'Cheapest broadband' },
      { href: '/guides/broadband-speeds-explained', label: 'Speed guide' },
      { href: '/guides', label: 'All guides' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
      { href: '/research/uk-broadband-customer-satisfaction', label: 'Research' },
      { href: '/editorial-policy', label: 'Editorial policy' },
      { href: '/how-we-make-money', label: 'How we make money' },
      { href: '/how-we-review-broadband', label: 'How we review' },
      { href: 'mailto:partnerships@broadbandpicker.co.uk', label: 'Partnerships' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/privacy-policy', label: 'Privacy policy' },
      { href: '#', label: 'Cookie preferences', component: 'cookie' },
      { href: '/cookie-policy', label: 'Cookie policy' },
      { href: '/terms', label: 'Terms of use' },
      { href: '/broadband-glossary', label: 'Broadband glossary' },
    ],
  },
]

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative mt-auto overflow-hidden bg-slate-900 text-slate-400">
      <img
        src="/illustrations/blob-green-sky.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 w-[280px] opacity-30"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-8 border-b border-slate-800 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Logo size={36} wordmarkClassName="text-white" />
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              BroadbandPicker is a free UK comparison site. You enter a postcode, we show the
              broadband deals that can actually serve that address, and you pick a package by
              price, speed and contract. We may earn a commission if you sign up. That does not
              buy a higher rank.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="https://x.com/broadbandPicker"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BroadbandPicker on X (Twitter)"
              className="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-300 transition-all hover:scale-105 hover:border-sky-500 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="transition-transform group-hover:rotate-6"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @broadbandPicker
            </a>
            <a
              href="https://www.instagram.com/broadbandpicker/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BroadbandPicker on Instagram"
              className="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-300 transition-all hover:scale-105 hover:border-sky-500 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
                className="transition-transform group-hover:rotate-6"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
              @broadbandpicker
            </a>
            </div>
          </div>
          <div className="w-full max-w-sm">
            <p className="mb-2 text-sm font-semibold text-white">Check broadband in your area</p>
            <p className="mb-3 text-xs text-slate-500">Availability is by address, never by a national advert.</p>
            <PostcodeChecker placeholder="Check your postcode" />
          </div>
        </div>

        <div className="mb-10">
          <NewsletterSignup source="footer" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-2 mb-10">
          {FOOTER_COLUMNS.map((column) => (
            <details key={column.heading} open className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between text-white font-semibold text-sm mb-3 py-1 marker:content-none [&::-webkit-details-marker]:hidden lg:pointer-events-none lg:cursor-default">
                {column.heading}
                <svg
                  className="h-3.5 w-3.5 text-slate-500 transition-transform group-open:rotate-180 lg:hidden"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <ul className="space-y-2 text-sm pb-3">
                {column.links.map((link) =>
                  link.component === 'cookie' ? (
                    <li key={link.label}>
                      <CookiePreferencesButton />
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </details>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 space-y-4">
          <p className="text-xs text-slate-300 max-w-3xl">
            BroadbandPicker.co.uk is a free comparison service. We may receive a commission when you click through to a provider and take out a service. This does not affect our editorial independence or the prices you are quoted. All prices shown are monthly. Contract terms, prices and availability are subject to change, so always verify with the provider before signing up.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              &copy; {year} BroadbandPicker.co.uk. We are not affiliated with any broadband provider. All trademarks belong to their respective owners.
            </p>
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
            >
              Back to top
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </a>
          </div>
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
        <JsonLd data={siteOrganizationGraph} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <AiReferralTracker />

        {gaId && (
          <>
            {/* Consent Mode v2 defaults: all optional storage denied until valid consent. */}
            <Script id="ga-consent-default" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`gtag('js',new Date());gtag('config','${gaId}',{send_page_view:true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
