import type { Metadata } from 'next'
import { getPartnerBrandOptions } from '@/data/partnerBrandOptions'
import PartnerOnboardingForm from '@/components/PartnerOnboardingForm'

export const metadata: Metadata = {
  title: { absolute: 'Partner Content Questionnaire | BroadbandPicker' },
  robots: { index: false, follow: false },
}

export default function PartnerOnboardingPage() {
  const brandOptions = getPartnerBrandOptions()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 font-bold text-white">
          BP
        </span>
        <span className="text-sm font-semibold text-slate-500">BroadbandPicker Partner Content Questionnaire</span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
        Tell us about your broadband service
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
        This goes straight to our editorial team and shapes how we cover you on BroadbandPicker:
        your packages, pricing, coverage, and what makes you worth recommending. Answer what you
        can, upload anything useful, and skip what doesn&apos;t apply.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-6 border-b border-slate-200">
        <span>Takes about 10 minutes</span>
        <span>&middot;</span>
        <span>Save partial answers by submitting, then reply to any of our emails to update it</span>
      </div>

      <div className="mt-8">
        <PartnerOnboardingForm brandOptions={brandOptions} />
      </div>
    </div>
  )
}
