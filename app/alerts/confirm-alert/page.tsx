import type { Metadata } from 'next'
import AlertConfirmButton from '@/components/AlertConfirmButton'

export const metadata: Metadata = {
  title: { absolute: 'Confirm your alert | BroadbandPicker' },
  robots: { index: false, follow: false },
}

export default async function ConfirmAlertPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[]; token?: string | string[] }>
}) {
  const params = await searchParams
  const kindParam = Array.isArray(params.kind) ? params.kind[0] : params.kind
  const token = (Array.isArray(params.token) ? params.token[0] : params.token) ?? ''
  const kind = kindParam === 'contract' ? 'contract' : 'price'
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <AlertConfirmButton kind={kind} token={token} />
    </div>
  )
}
