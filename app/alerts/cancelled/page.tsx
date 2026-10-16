import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'Alert cancelled | BroadbandPicker' },
  robots: { index: false, follow: false },
}

export default async function AlertCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[]; outcome?: string | string[] }>
}) {
  const params = await searchParams
  const kind = (Array.isArray(params.kind) ? params.kind[0] : params.kind) === 'contract' ? 'contract' : 'price'
  const outcome = Array.isArray(params.outcome) ? params.outcome[0] : params.outcome
  const ok = outcome === 'cancelled'
  const what = kind === 'price' ? 'price-drop alerts' : 'contract reminder'

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        {ok ? `Your ${what} ${kind === 'price' ? 'are' : 'is'} cancelled` : outcome === 'unavailable' ? 'Something went wrong on our side' : 'That link is not valid'}
      </h1>
      <p className="mt-3 leading-relaxed text-slate-600">
        {ok
          ? 'We will not send any more emails for this alert. Other BroadbandPicker emails you signed up for separately are not affected.'
          : outcome === 'unavailable'
            ? 'Please try the link in the email again in a few minutes.'
            : 'Use the link in the most recent BroadbandPicker email, or contact us and we will remove you by hand.'}
      </p>
      <p className="mt-6 flex flex-wrap justify-center gap-4">
        <Link href="/deals" className="font-semibold text-sky-700 hover:underline">See current deals</Link>
        {!ok && <Link href="/contact" className="font-semibold text-sky-700 hover:underline">Contact us</Link>}
      </p>
    </div>
  )
}
