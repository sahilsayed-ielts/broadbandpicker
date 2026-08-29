import type { Metadata } from 'next'
import Link from 'next/link'
import { getPartnerOnboardingToken, isPartnerOnboardingTokenExpired } from '@/data/partnerOnboardingTokens'
import PartnerOnboardingForm from '@/components/PartnerOnboardingForm'

export const metadata: Metadata = {
  title: { absolute: 'Partner Content Questionnaire | BroadbandPicker' },
  robots: { index: false, follow: false },
}

export default async function PartnerOnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const entry = getPartnerOnboardingToken(token)
  const invalid = !entry || isPartnerOnboardingTokenExpired(entry)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 font-bold text-white">
          BP
        </span>
        <span className="text-sm font-semibold text-slate-500">BroadbandPicker Partner Content Questionnaire</span>
      </div>

      {invalid ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">This link isn&apos;t valid</h1>
          <p className="mt-2 text-sm text-slate-600">
            It may have expired or been used already. Get in touch and we&apos;ll send a fresh one.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-800"
          >
            Contact BroadbandPicker
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Tell us about {entry.advertiserName}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
            This goes straight to our editorial team and shapes how we cover {entry.advertiserName}
            {' '}on BroadbandPicker: your packages, pricing, coverage, and what makes you worth
            recommending. Answer what you can, upload anything useful, and skip what doesn&apos;t apply.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-6 border-b border-slate-200">
            <span>Takes about 10 minutes</span>
            <span>&middot;</span>
            <span>Save partial answers by submitting, then reply to request changes any time</span>
          </div>

          <div className="mt-8">
            <PartnerOnboardingForm token={token} advertiserName={entry.advertiserName} />
          </div>
        </>
      )}
    </div>
  )
}
