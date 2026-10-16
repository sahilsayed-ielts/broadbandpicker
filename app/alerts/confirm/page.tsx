import type { Metadata } from 'next'
import Link from 'next/link'
import AlertsResultTracker from '@/components/AlertsResultTracker'
import NewsletterSignup from '@/components/NewsletterSignup'
import { confirmSubscription } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: { absolute: 'Confirm deal alerts | BroadbandPicker' },
  robots: { index: false, follow: false },
}

export default async function ConfirmAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const params = await searchParams
  const token = Array.isArray(params.token) ? params.token[0] : params.token
  const result = await confirmSubscription(token)

  if (result.ok) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertsResultTracker event="newsletter_signup" status={result.status} />
        <h1 className="text-2xl font-bold text-slate-900">
          {result.status === 'already_confirmed' ? 'Already confirmed' : 'You are on the list'}
        </h1>
        <p className="mt-3 text-slate-600 leading-relaxed">
          {result.status === 'already_confirmed'
            ? 'This address was already confirmed for BroadbandPicker weekly deal roundups and occasional switching guides.'
            : 'Thanks. We will email weekly UK broadband deal roundups and occasional switching guides. Every message includes an unsubscribe link.'}
        </p>
        <p className="mt-6">
          <Link href="/deals" className="font-semibold text-sky-700 hover:underline">
            See current deals
          </Link>
        </p>
      </div>
    )
  }

  if (result.reason === 'expired') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900 text-center">That link has expired</h1>
        <p className="mt-3 text-slate-600 text-center leading-relaxed">
          Confirmation links last 48 hours. Sign up again and we will send a fresh email.
        </p>
        <div className="mt-8">
          <NewsletterSignup variant="page" source="confirm-expired" />
        </div>
      </div>
    )
  }

  if (result.reason === 'unsubscribed') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900 text-center">This address is unsubscribed</h1>
        <p className="mt-3 text-slate-600 text-center leading-relaxed">
          We will not email it unless you sign up again and tick the consent box.
        </p>
        <div className="mt-8">
          <NewsletterSignup variant="page" source="confirm-resubscribe" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">That confirmation link is not valid</h1>
      <p className="mt-3 text-slate-600 leading-relaxed">
        Use the button in the most recent BroadbandPicker email, or sign up again on the alerts page.
      </p>
      <p className="mt-6">
        <Link href="/alerts" className="font-semibold text-sky-700 hover:underline">
          Go to deal alerts
        </Link>
      </p>
    </div>
  )
}
