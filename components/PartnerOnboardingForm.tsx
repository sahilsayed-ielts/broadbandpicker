'use client'

import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { trackEvent } from '@/lib/analytics'
import type { PartnerBrandOption } from '@/data/partnerBrandOptions'

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface PackageRow {
  packageName: string
  download: string
  upload: string
  technology: string
  monthlyPrice: string
  contractLength: string
  setupFee: string
}

const TECHNOLOGIES = ['FTTP / Full Fibre', 'FTTC / Part Fibre', 'Cable', 'Fixed Wireless', 'Satellite', 'Other']

const SEGMENTS = [
  'Families',
  'Gamers',
  'Remote workers',
  'Students',
  'Small business',
  'Budget-conscious',
  'Rural / underserved areas',
]

const PROMO_CHANNELS = [
  'Blog / article content',
  'Comparison tables',
  'Email newsletter',
  'Social media',
  'Paid search (non-brand terms only)',
]

const OTHER_BRAND_VALUE = '__other__'

const STEPS = [
  'Your brand',
  'Packages & pricing',
  'Coverage',
  'Positioning',
  'Trust & evidence',
  'Deals & exclusives',
  'How to promote you',
  'Files & notes',
]

const emptyPackage = (): PackageRow => ({
  packageName: '',
  download: '',
  upload: '',
  technology: TECHNOLOGIES[0],
  monthlyPrice: '',
  contractLength: '',
  setupFee: '',
})

const inputClass =
  'w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500'
const labelClass = 'mb-1 block text-sm font-semibold text-slate-900'

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function PillGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            selected.includes(option)
              ? 'border-sky-500 bg-sky-50 text-sky-700'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default function PartnerOnboardingForm({ brandOptions }: { brandOptions: PartnerBrandOption[] }) {
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [packages, setPackages] = useState<PackageRow[]>([emptyPackage()])
  const [segments, setSegments] = useState<string[]>([])
  const [promoChannels, setPromoChannels] = useState<string[]>([])
  const [brandSlug, setBrandSlug] = useState('')
  const renderedAt = useRef(Date.now())

  const isOtherBrand = brandSlug === OTHER_BRAND_VALUE
  const lastStep = STEPS.length - 1

  function updatePackage(index: number, field: keyof PackageRow, value: string) {
    setPackages((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function toggle(current: string[], setter: (v: string[]) => void, value: string) {
    setter(current.includes(value) ? current.filter((s) => s !== value) : [...current, value])
  }

  function goNext() {
    if (step === 0 && !brandSlug) {
      setError('Please select which brand this is for.')
      return
    }
    setError('')
    setStep((s) => Math.min(s + 1, lastStep))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step !== lastStep) return
    setStatus('sending')
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    data.set('packages', JSON.stringify(packages.filter((p) => p.packageName.trim() || p.download.trim())))
    data.set('targetSegments', JSON.stringify(segments))
    data.set('promoChannels', JSON.stringify(promoChannels))
    data.set('renderedAt', String(renderedAt.current))

    try {
      const res = await fetch('/api/partner-onboarding', { method: 'POST', body: data })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('sent')
      trackEvent('partner_onboarding_submit', { brand: brandSlug })
      form.reset()
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-bold text-green-900">Thanks, that&apos;s with our editorial team</p>
        <p className="mt-2 text-sm text-green-800">
          We&apos;ll use this to plan and write BroadbandPicker&apos;s coverage of you. If anything
          changes on your end, just reply to any of our emails to update it.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-sky-500 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
      </div>

      <div hidden={step !== 0}>
        <Section title="Your brand">
          <div>
            <label htmlFor="brandSlug" className={labelClass}>Which brand is this for?</label>
            <select
              id="brandSlug"
              name="brandSlug"
              required
              value={brandSlug}
              onChange={(e) => setBrandSlug(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>Select your brand</option>
              {brandOptions.map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
              <option value={OTHER_BRAND_VALUE}>My brand isn&apos;t listed</option>
            </select>
          </div>
          {isOtherBrand && (
            <div>
              <label htmlFor="otherBrandName" className={labelClass}>Your brand name</label>
              <input id="otherBrandName" name="otherBrandName" type="text" maxLength={200} className={inputClass} />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contactName" className={labelClass}>Your name</label>
              <input id="contactName" name="contactName" type="text" required maxLength={200} className={inputClass} />
            </div>
            <div>
              <label htmlFor="contactEmail" className={labelClass}>Your email</label>
              <input id="contactEmail" name="contactEmail" type="email" required maxLength={320} className={inputClass} />
            </div>
            <div>
              <label htmlFor="contactRole" className={labelClass}>Role (optional)</label>
              <input id="contactRole" name="contactRole" type="text" maxLength={150} placeholder="e.g. Affiliate Manager" className={inputClass} />
            </div>
            <div>
              <label htmlFor="companyWebsite" className={labelClass}>Company website</label>
              <input id="companyWebsite" name="companyWebsite" type="url" required placeholder="https://" className={inputClass} />
            </div>
          </div>
        </Section>
      </div>

      <div hidden={step !== 1}>
        <Section title="Packages & pricing" hint="Add each package you'd like us to compare. Leave rows blank to skip.">
          <div className="space-y-4">
            {packages.map((row, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input aria-label="Package name" placeholder="Package name" value={row.packageName} onChange={(e) => updatePackage(i, 'packageName', e.target.value)} className={inputClass} />
                  <select aria-label="Technology" value={row.technology} onChange={(e) => updatePackage(i, 'technology', e.target.value)} className={inputClass}>
                    {TECHNOLOGIES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                  <input aria-label="Download speed in Mbps" placeholder="Download (Mbps)" inputMode="numeric" value={row.download} onChange={(e) => updatePackage(i, 'download', e.target.value)} className={inputClass} />
                  <input aria-label="Upload speed in Mbps" placeholder="Upload (Mbps)" inputMode="numeric" value={row.upload} onChange={(e) => updatePackage(i, 'upload', e.target.value)} className={inputClass} />
                  <input aria-label="Monthly price in pounds" placeholder="Monthly price (£)" inputMode="decimal" value={row.monthlyPrice} onChange={(e) => updatePackage(i, 'monthlyPrice', e.target.value)} className={inputClass} />
                  <input aria-label="Contract length in months" placeholder="Contract length (months)" inputMode="numeric" value={row.contractLength} onChange={(e) => updatePackage(i, 'contractLength', e.target.value)} className={inputClass} />
                  <input aria-label="Setup fee in pounds" placeholder="Setup fee (£, 0 if none)" inputMode="decimal" value={row.setupFee} onChange={(e) => updatePackage(i, 'setupFee', e.target.value)} className={inputClass} />
                  {packages.length > 1 && (
                    <button type="button" onClick={() => setPackages((rows) => rows.filter((_, idx) => idx !== i))} className="text-sm font-semibold text-red-600 hover:underline">
                      Remove this package
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setPackages((rows) => [...rows, emptyPackage()])} className="text-sm font-semibold text-sky-700 hover:underline">
            + Add another package
          </button>
        </Section>
      </div>

      <div hidden={step !== 2}>
        <Section title="Coverage & footprint">
          <div>
            <label htmlFor="coverageAreas" className={labelClass}>Which UK regions, cities or postcode areas do you cover?</label>
            <textarea id="coverageAreas" name="coverageAreas" rows={3} className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="coveragePercent" className={labelClass}>% of premises you can reach (optional)</label>
              <input id="coveragePercent" name="coveragePercent" type="text" inputMode="decimal" className={inputClass} />
            </div>
            <div>
              <label htmlFor="coverageCheckerUrl" className={labelClass}>Link to your coverage checker (optional)</label>
              <input id="coverageCheckerUrl" name="coverageCheckerUrl" type="url" placeholder="https://" className={inputClass} />
            </div>
          </div>
        </Section>
      </div>

      <div hidden={step !== 3}>
        <Section title="What makes you different">
          <div>
            <span className={labelClass}>Who is this best for? (select any)</span>
            <PillGroup options={SEGMENTS} selected={segments} onToggle={(v) => toggle(segments, setSegments, v)} />
          </div>
          <div>
            <label htmlFor="highlights" className={labelClass}>Top 3-5 things we should know about you</label>
            <textarea id="highlights" name="highlights" rows={4} placeholder="One per line works well" className={inputClass} />
          </div>
          <div>
            <label htmlFor="priceRisePolicy" className={labelClass}>Do prices ever rise mid-contract? Be specific, this is one of readers&apos; most-asked questions</label>
            <textarea id="priceRisePolicy" name="priceRisePolicy" rows={3} className={inputClass} />
          </div>
        </Section>
      </div>

      <div hidden={step !== 4}>
        <Section title="Trust & evidence">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="trustpilotUrl" className={labelClass}>Trustpilot profile link (optional)</label>
              <input id="trustpilotUrl" name="trustpilotUrl" type="url" placeholder="https://" className={inputClass} />
            </div>
            <div>
              <label htmlFor="trustpilotScore" className={labelClass}>Trustpilot score (optional)</label>
              <input id="trustpilotScore" name="trustpilotScore" type="text" inputMode="decimal" placeholder="e.g. 4.3" className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="serviceStats" className={labelClass}>Any published customer service or Ofcom complaints data? (optional)</label>
            <textarea id="serviceStats" name="serviceStats" rows={2} className={inputClass} />
          </div>
          <div>
            <label htmlFor="awards" className={labelClass}>Awards or independent recognition (optional)</label>
            <textarea id="awards" name="awards" rows={2} className={inputClass} />
          </div>
        </Section>
      </div>

      <div hidden={step !== 5}>
        <Section title="Deals & exclusives">
          <div>
            <label htmlFor="exclusiveOffer" className={labelClass}>Any exclusive code or offer for BroadbandPicker readers? (optional)</label>
            <textarea id="exclusiveOffer" name="exclusiveOffer" rows={2} className={inputClass} />
          </div>
          <div>
            <label htmlFor="rewardOrCashback" className={labelClass}>Reward cards, cashback or sign-up bonuses (optional)</label>
            <textarea id="rewardOrCashback" name="rewardOrCashback" rows={2} className={inputClass} />
          </div>
        </Section>
      </div>

      <div hidden={step !== 6}>
        <Section title="How should we promote you" hint="This shapes how our content team writes about you, so it stays inside your own guidelines.">
          <div>
            <span className={labelClass}>Where are you comfortable being featured? (select any)</span>
            <PillGroup options={PROMO_CHANNELS} selected={promoChannels} onToggle={(v) => toggle(promoChannels, setPromoChannels, v)} />
          </div>
          <div>
            <label htmlFor="disclosureRequirement" className={labelClass}>How should we disclose our relationship with you? (optional)</label>
            <input id="disclosureRequirement" name="disclosureRequirement" type="text" placeholder="e.g. a specific phrase you require, or 'standard affiliate disclosure is fine'" className={inputClass} />
          </div>
          <div>
            <label htmlFor="brandAssetRules" className={labelClass}>Any rules for using your logo or brand assets? (optional)</label>
            <textarea id="brandAssetRules" name="brandAssetRules" rows={2} className={inputClass} />
          </div>
          <div>
            <label htmlFor="postingFrequencyNotes" className={labelClass}>Any preference on how often we feature or mention you? (optional)</label>
            <textarea id="postingFrequencyNotes" name="postingFrequencyNotes" rows={2} className={inputClass} />
          </div>
        </Section>
      </div>

      <div hidden={step !== 7}>
        <Section title="Files" hint="Logo, content guidelines, full terms & conditions, rate card, brand guidelines — whatever's useful.">
          <div>
            <label htmlFor="logo" className={labelClass}>Logo (optional)</label>
            <input id="logo" name="logo" type="file" accept="image/*" className="block w-full text-sm text-slate-600" />
          </div>
          <div>
            <label htmlFor="documents" className={labelClass}>Content guidelines, T&amp;Cs, rate card, brand materials (optional, up to 5 files)</label>
            <input id="documents" name="documents" type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="block w-full text-sm text-slate-600" />
          </div>
        </Section>
        <div className="mt-6">
          <Section title="Anything else">
            <textarea id="additionalNotes" name="additionalNotes" rows={3} placeholder="Optional" className={inputClass} />
          </Section>
        </div>
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            className="rounded-lg border-2 border-slate-200 px-5 py-3 font-bold text-slate-700 transition-colors hover:border-slate-300"
          >
            Back
          </button>
        )}
        {step < lastStep ? (
          <button
            type="button"
            onClick={goNext}
            className="ml-auto rounded-lg bg-sky-700 px-5 py-3 font-bold text-white transition-colors hover:bg-sky-800"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === 'sending'}
            className="ml-auto rounded-lg bg-sky-700 px-5 py-3 font-bold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </button>
        )}
      </div>
    </form>
  )
}
