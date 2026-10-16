import type { Metadata } from 'next'
import Link from 'next/link'
import AlertsResultTracker from '@/components/AlertsResultTracker'
import NewsletterSignup from '@/components/NewsletterSignup'
import { unsubscribeSubscription } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: { absolute: 'Unsubscribe from deal alerts | BroadbandPicker' },
  robots: { index: false, follow: false },
}

export default async function UnsubscribeAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const params = await searchParams
  const token = Array.isArray(params.token) ? params.token[0] : params.token
  const result = await unsubscribeSubscription(token)

  if (result.ok) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertsResultTracker event="newsletter_unsubscribe" status={result.status} />
        <h1 className="text-2xl font-bold text-slate-900">You are unsubscribed</h1>
        <p className="mt-3 text-slate-600 leading-relaxed">
          We will not send BroadbandPicker deal emails to this address unless you sign up again and
          confirm. The postcode checker and the rest of the site still work without an email.
        </p>
        <p className="mt-6">
          <Link href="/" className="font-semibold text-sky-700 hover:underline">
            Back to BroadbandPicker
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900 text-center">
        {result.reason === 'expired' ? 'That unsubscribe link has expired' : 'That unsubscribe link is not valid'}
      </h1>
      <p className="mt-3 text-slate-600 text-center leading-relaxed">
        Use the unsubscribe link in a recent BroadbandPicker email, or contact{' '}
        <a href="mailto:privacy@broadbandpicker.co.uk" className="text-sky-700 hover:underline">
          privacy@broadbandpicker.co.uk
        </a>
        .
      </p>
      <div className="mt-10">
        <p className="text-sm text-slate-500 mb-3 text-center">If you meant to sign up instead:</p>
        <NewsletterSignup variant="page" source="unsubscribe-page" />
      </div>
    </div>
  )
}
