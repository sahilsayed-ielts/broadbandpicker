import type { Metadata } from 'next'
import { getPartnerBrandOptions } from '@/data/partnerBrandOptions'
import PartnerOnboardingForm from '@/components/PartnerOnboardingForm'
import PageHeroBanner from '@/components/PageHeroBanner'
import { hubHero } from '@/lib/pageHero'

const HERO = hubHero()

export const metadata: Metadata = {
  title: { absolute: 'Partner Content Questionnaire | BroadbandPicker' },
  robots: { index: false, follow: false },
}

export default function PartnerOnboardingPage() {
  const brandOptions = getPartnerBrandOptions()

  return (
    <div>
      <PageHeroBanner
        title="Tell us about your broadband service"
        kicker="Partner questionnaire"
        lede="This goes straight to our editorial team and shapes how we cover you on BroadbandPicker: your packages, pricing, coverage, and what makes you worth recommending."
        image={HERO.image}
        imageAlt={HERO.imageAlt}
        accent={HERO.accent}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-6 border-b border-slate-200">
        <span>Takes about 10 minutes</span>
        <span>&middot;</span>
        <span>Save partial answers by submitting, then reply to any of our emails to update it</span>
      </div>

      <div className="mt-8">
        <PartnerOnboardingForm brandOptions={brandOptions} />
      </div>
      </div>
    </div>
  )
}
