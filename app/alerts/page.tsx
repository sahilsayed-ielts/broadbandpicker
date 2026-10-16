import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import CiteableAnswer from '@/components/CiteableAnswer'
import FAQAccordion from '@/components/FAQAccordion'
import NewsletterSignup from '@/components/NewsletterSignup'
import PageHeroBanner from '@/components/PageHeroBanner'
import { JsonLd } from '@/lib/jsonLd'
import { DEFAULT_GUIDE_CTAS, hubHero } from '@/lib/pageHero'
import { SITE_URL } from '@/lib/siteSchema'
import type { FAQItem } from '@/types'

const HERO = hubHero()
const PAGE_URL = `${SITE_URL}/alerts`
const DESCRIPTION =
  'Get weekly UK broadband deal roundups from BroadbandPicker by email. Optional postcode. Confirm in your inbox. Unsubscribe any time.'

export const metadata: Metadata = {
  title: { absolute: 'Broadband Deal Alerts by Email | BroadbandPicker' },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Broadband deal alerts by email | BroadbandPicker',
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: `${SITE_URL}${HERO.image}`, width: 1600, height: 900, alt: HERO.imageAlt }],
  },
}

const faqs: FAQItem[] = [
  {
    question: 'What emails will BroadbandPicker send me?',
    answer:
      'A weekly roundup of UK broadband deals worth checking, and occasional switching or speed guides. We name BroadbandPicker as the sender. We do not sell your address or add unnamed partners on the same tick.',
  },
  {
    question: 'Why do you ask for a postcode?',
    answer:
      'It is optional. If you give a UK postcode we store the outward code only, so later emails can mention deals that can serve that area. A newsletter is not an availability check, so we do not ask for your street address here.',
  },
  {
    question: 'Why is there a confirmation email?',
    answer:
      'UK marketing email needs your consent, and the address has to be yours. We send nothing about deals until you click the confirmation link. That also stops a mistyped address from being emailed.',
  },
  {
    question: 'How do I stop the emails?',
    answer:
      'Every message includes an unsubscribe link. You can also email privacy@broadbandpicker.co.uk. We keep a suppression record so we do not email that address again unless you sign up and confirm later.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Broadband deal alerts by email',
      url: PAGE_URL,
      description: DESCRIPTION,
      isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
}

export default function AlertsPage() {
  return (
    <div>
      <JsonLd data={jsonLd} />
      <PageHeroBanner
        title="Broadband deal alerts by email"
        kicker="Free updates"
        lede="Weekly UK deal roundups from BroadbandPicker, plus occasional switching guides. Confirm in your inbox. Unsubscribe any time."
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: 'Deal alerts', href: '/alerts' },
          ]}
        />
        <p className="mb-6 text-sm">
          <Link href="/alerts/weekly" className="font-semibold text-sky-700 hover:underline">
            Read this week’s live roundup
          </Link>
          , the same stack the email uses.
        </p>
        <CiteableAnswer title="The short version">
          Enter your email, optionally a UK postcode, and tick the box that names BroadbandPicker,
          weekly deal roundups and occasional guides. We then email a confirmation link. We do not
          send deal emails until you click it. That is how a UK comparison site should collect
          addresses: named sender, named content, unticked consent, easy stop.
        </CiteableAnswer>

        <NewsletterSignup variant="page" source="alerts-page" />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900">What you get</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>A weekly roundup of UK broadband deals worth checking</li>
              <li>Occasional switching and speed guides, as named on the form</li>
              <li>An unsubscribe link in every message</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900">What you do not get</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Daily blasts or unnamed “partner” marketing on the same tick</li>
              <li>A full-address capture pretending to be a newsletter</li>
              <li>Deal emails before you confirm the address</li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-600 leading-relaxed">
          Alerts sit beside the{' '}
          <Link href="/compare" className="text-sky-700 hover:underline">
            postcode checker
          </Link>
          . The checker is for availability. This form is only for email. Read the{' '}
          <Link href="/privacy-policy" className="text-sky-700 hover:underline">
            privacy policy
          </Link>{' '}
          for retention and your rights, or{' '}
          <Link href="/contact" className="text-sky-700 hover:underline">
            contact us
          </Link>
          .
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-12 mb-4">Questions</h2>
        <FAQAccordion items={faqs} />
      </div>
    </div>
  )
}
