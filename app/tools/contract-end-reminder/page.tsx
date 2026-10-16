import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import ContractReminderTool from '@/components/ContractReminderTool'
import FAQAccordion from '@/components/FAQAccordion'
import PageHeroBanner from '@/components/PageHeroBanner'
import { providers } from '@/data/providers'
import { JsonLd } from '@/lib/jsonLd'
import { DEFAULT_GUIDE_CTAS, categoryHero } from '@/lib/pageHero'
import { softwareApplicationJsonLd } from '@/lib/siteSchema'

const HERO = categoryHero('deals-and-pricing')
const PAGE_URL = 'https://broadbandpicker.co.uk/tools/contract-end-reminder'
const REVIEWED_DATE = '2026-10-16'

export const metadata: Metadata = {
  title: 'Broadband Contract End Reminder | Free Calendar or Email Alert',
  description:
    'Set a free reminder 30 days before your broadband contract ends, by calendar or email, so you can compare deals before you move to a higher out-of-contract price.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Broadband Contract End Reminder | BroadbandPicker',
    description: 'A reminder 30 days before your broadband contract ends, by calendar or email.',
    url: PAGE_URL,
    type: 'website',
  },
}

const faqs = [
  {
    question: 'What happens when my broadband contract ends?',
    answer:
      'Your service carries on, but most providers move you to their standard out-of-contract price, which is usually higher than the deal you signed up to. You can leave at that point without an early termination charge, or agree a new deal.',
  },
  {
    question: 'Will my provider tell me my contract is ending?',
    answer:
      'Yes. Ofcom rules require your provider to send an end-of-contract notification between 10 and 40 days before the minimum term ends, including the price you will pay afterwards and its best deals for you. A reminder 30 days out gives you time to compare before that letter arrives.',
  },
  {
    question: 'Where do I find my contract end date?',
    answer:
      'Look in your provider account or app, on a recent bill, or in the contract summary you were sent when you signed up. If you cannot find it, ask the provider; they must tell you.',
  },
  {
    question: 'What do you do with my email address?',
    answer:
      'If you choose the email option we store your address, provider and end date to send one reminder, and nothing else. The calendar option sends nothing to us at all: the file is created in your browser.',
  },
]

const toolGraph = softwareApplicationJsonLd({
  name: 'BroadbandPicker contract end reminder',
  url: PAGE_URL,
  description: 'A free reminder 30 days before a UK broadband contract ends, as a calendar file or a single email.',
  dateModified: REVIEWED_DATE,
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    ...toolGraph['@graph'],
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

export default function ContractEndReminderPage() {
  const options = providers
    .filter((p) => !p.retiredDate)
    .map((p) => ({ slug: p.slug, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main className="bg-white">
      <JsonLd data={jsonLd} />
      <PageHeroBanner
        title="Broadband contract end reminder"
        kicker="Free UK broadband tool"
        lede="Tell us when your contract ends and we will remind you 30 days before, so you can compare deals instead of rolling onto a higher out-of-contract price."
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
        ctas={DEFAULT_GUIDE_CTAS}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 text-slate-700 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { name: 'Home', href: '/' },
            { name: 'Tools', href: '/tools' },
            { name: 'Contract end reminder', href: '/tools/contract-end-reminder' },
          ]}
        />
        <p className="mb-6 text-sm text-slate-500">Free · No account · Reviewed {REVIEWED_DATE}</p>
        <ContractReminderTool providers={options} />

        <section aria-labelledby="why" className="mt-12 rounded-2xl border border-sky-200 bg-sky-50 p-6 sm:p-8">
          <h2 id="why" className="text-2xl font-bold text-slate-900">Why 30 days before?</h2>
          <p className="mt-3 leading-relaxed">
            Your provider must write to you 10 to 40 days before your contract ends. A reminder at 30 days means you
            already know what else is available when that letter arrives, so you can switch, or use a cheaper deal to
            ask your provider for a better price. Switching most home broadband is now led by the new provider under
            Ofcom&apos;s One Touch Switch process, so you rarely need to contact your old one.
          </p>
          <p className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/guides/how-to-switch-broadband-uk" className="text-sky-700 hover:underline">How to switch broadband</Link>
            <Link href="/guides/broadband-deals-with-no-mid-contract-price-rise" className="text-sky-700 hover:underline">Deals with no mid-contract price rise</Link>
            <Link href="/compare" className="text-sky-700 hover:underline">Compare providers</Link>
          </p>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Questions</h2>
          <FAQAccordion items={faqs} />
        </section>
      </div>
    </main>
  )
}
