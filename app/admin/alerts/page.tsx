import type { Metadata } from 'next'
import AlertsEmailer from '@/components/AlertsEmailer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Weekly emailer | BroadbandPicker' },
  robots: { index: false, follow: false },
}

export default function AdminAlertsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Private desk</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Weekly newsletter emailer</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Live preview of this week’s BroadbandPicker roundup, built from the provider dataset and
        latest guides. Same HTML the list receives. Send only after domain SMTP is
        noreply@broadbandpicker.co.uk.
      </p>
      <div className="mt-8">
        <AlertsEmailer />
      </div>
    </div>
  )
}
