'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Provider } from '@/types'
import {
  topMatches,
  computeMinimumSpeed,
  type QuizAnswers,
  type ReasonForLooking,
  type HouseholdSize,
  type UseCase,
  type ContractPreference,
  type MatchResult,
} from '@/lib/broadbandMatch'

interface BroadbandMatchQuizProps {
  providers: Provider[]
}

const REASON_OPTIONS: { value: ReasonForLooking; label: string; icon: string }[] = [
  { value: 'new', label: "I'm new to broadband", icon: '✨' },
  { value: 'moving', label: "I'm moving house", icon: '📦' },
  { value: 'switching-price', label: "I want a better price", icon: '💰' },
  { value: 'switching-speed', label: "I want faster speeds", icon: '⚡' },
]

const HOUSEHOLD_OPTIONS: { value: HouseholdSize; label: string; sub: string }[] = [
  { value: '1-2', label: '1–2 people', sub: 'Light to moderate use' },
  { value: '3-4', label: '3–4 people', sub: 'Several devices at once' },
  { value: '5+', label: '5+ people', sub: 'A busy, connected household' },
]

const USE_CASE_OPTIONS: { value: UseCase; label: string; icon: string }[] = [
  { value: 'wfh', label: 'Work from home / video calls', icon: '💻' },
  { value: 'gaming', label: 'Online gaming', icon: '🎮' },
  { value: 'streaming-4k', label: '4K streaming', icon: '📺' },
  { value: 'streaming-hd', label: 'HD streaming', icon: '🎬' },
  { value: 'browsing', label: 'Everyday browsing', icon: '🌐' },
  { value: 'smart-home', label: 'Smart home devices', icon: '🏠' },
]

const BUDGET_OPTIONS = [25, 35, 45, 60]

const CONTRACT_OPTIONS: { value: ContractPreference; label: string; sub: string }[] = [
  { value: 'flexible', label: 'Flexible', sub: 'Shortest contract available' },
  { value: 'standard', label: "Doesn't matter", sub: "I'll take the best value" },
  { value: 'no-preference', label: 'No preference', sub: 'Show me everything' },
]

const TOTAL_STEPS = 6

export default function BroadbandMatchQuiz({ providers }: BroadbandMatchQuizProps) {
  const [step, setStep] = useState(1)
  const [reason, setReason] = useState<ReasonForLooking | null>(null)
  const [household, setHousehold] = useState<HouseholdSize | null>(null)
  const [useCases, setUseCases] = useState<UseCase[]>([])
  const [budget, setBudget] = useState<number | null>(null)
  const [contractPreference, setContractPreference] = useState<ContractPreference | null>(null)
  const [postcode, setPostcode] = useState('')
  const [results, setResults] = useState<MatchResult[] | null>(null)

  function toggleUseCase(value: UseCase) {
    setUseCases((prev) => (prev.includes(value) ? prev.filter((u) => u !== value) : [...prev, value]))
  }

  function goNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      return
    }
    const answers: QuizAnswers = {
      reason: reason!,
      household: household!,
      useCases,
      budget: budget!,
      contractPreference: contractPreference!,
      postcode,
    }
    setResults(topMatches(answers, providers, 3))
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1))
  }

  function restart() {
    setStep(1)
    setReason(null)
    setHousehold(null)
    setUseCases([])
    setBudget(null)
    setContractPreference(null)
    setPostcode('')
    setResults(null)
  }

  const canProceed =
    (step === 1 && reason !== null) ||
    (step === 2 && household !== null) ||
    (step === 3 && useCases.length > 0) ||
    (step === 4 && budget !== null) ||
    (step === 5 && contractPreference !== null) ||
    step === 6

  if (results) {
    const minSpeed = computeMinimumSpeed({ household: household!, useCases })
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sky-400 text-sm font-semibold uppercase tracking-widest">Your matches</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Based on your answers, we&apos;d suggest around {minSpeed.download} Mbps
          </h2>
          <p className="text-slate-400 mt-2 text-sm">Here are your best-fit providers, ranked for your household.</p>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={result.provider.slug}
              className="rounded-2xl bg-slate-800/60 border border-slate-700 p-5 sm:p-6 animate-[fadeIn_0.4s_ease-out]"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      index === 0 ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{result.provider.name}</h3>
                    <p className="text-xs text-slate-400">
                      {result.matchedSpeed.download} Mbps &middot; {result.matchedSpeed.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white tabular-nums">£{result.provider.monthlyPriceFrom.toFixed(2)}</div>
                  <div className="text-xs text-slate-400">per month</div>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5">
                {result.reasons.map((reason) => (
                  <li key={reason} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-sky-400 mt-0.5">&rarr;</span>
                    {reason}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={result.provider.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm transition-colors"
                >
                  Get {result.provider.name} deal &rarr;
                </a>
                <Link
                  href={`/providers/${result.provider.slug}`}
                  className="px-5 py-2.5 border border-slate-600 hover:border-slate-500 text-slate-300 font-semibold rounded-lg text-sm transition-colors"
                >
                  Read full review
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button onClick={restart} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            &larr; Start again
          </button>
          <p className="text-xs text-slate-500 max-w-sm text-center sm:text-right">
            Availability and exact package pricing vary by address. We may earn a commission if you buy after
            clicking through — this does not change the ranking above.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div key={step} className="animate-[slideIn_0.35s_ease-out]">
        {step === 1 && (
          <fieldset>
            <legend className="text-xl sm:text-2xl font-extrabold text-white mb-5">Why are you looking for broadband?</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REASON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReason(opt.value)}
                  className={`text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    reason === opt.value
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <p className="text-white font-semibold mt-2">{opt.label}</p>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-xl sm:text-2xl font-extrabold text-white mb-5">How many people will use this connection?</legend>
            <div className="space-y-3">
              {HOUSEHOLD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHousehold(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    household === opt.value
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <p className="text-white font-semibold">{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
                  </div>
                  {household === opt.value && <span className="text-sky-400">&#10003;</span>}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="text-xl sm:text-2xl font-extrabold text-white mb-2">What will you use it for?</legend>
            <p className="text-sm text-slate-400 mb-5">Select all that apply.</p>
            <div className="grid grid-cols-2 gap-3">
              {USE_CASE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleUseCase(opt.value)}
                  className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                    useCases.includes(opt.value)
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <p className="text-white text-sm font-semibold mt-1.5 leading-snug">{opt.label}</p>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset>
            <legend className="text-xl sm:text-2xl font-extrabold text-white mb-5">What&apos;s your monthly budget?</legend>
            <div className="grid grid-cols-2 gap-3">
              {BUDGET_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setBudget(amount)}
                  className={`px-5 py-4 rounded-xl border-2 transition-all text-center ${
                    budget === amount
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <p className="text-white font-bold">Up to £{amount}</p>
                  <p className="text-xs text-slate-400 mt-0.5">per month</p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setBudget(9999)}
                className={`col-span-2 px-5 py-4 rounded-xl border-2 transition-all text-center ${
                  budget === 9999 ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <p className="text-white font-bold">No strict limit</p>
                <p className="text-xs text-slate-400 mt-0.5">Show me the best option regardless of price</p>
              </button>
            </div>
          </fieldset>
        )}

        {step === 5 && (
          <fieldset>
            <legend className="text-xl sm:text-2xl font-extrabold text-white mb-5">Contract preference?</legend>
            <div className="space-y-3">
              {CONTRACT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setContractPreference(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    contractPreference === opt.value
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <p className="text-white font-semibold">{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
                  </div>
                  {contractPreference === opt.value && <span className="text-sky-400">&#10003;</span>}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 6 && (
          <fieldset>
            <legend className="text-xl sm:text-2xl font-extrabold text-white mb-2">Your postcode</legend>
            <p className="text-sm text-slate-400 mb-5">
              Optional — helps us flag local availability. We never store this beyond your session.
            </p>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
              maxLength={8}
              className="w-full px-5 py-4 rounded-xl bg-slate-800 border-2 border-slate-700 focus:border-sky-500 outline-none text-white placeholder:text-slate-500"
            />
          </fieldset>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canProceed}
          className="px-8 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-full text-sm transition-colors"
        >
          {step === TOTAL_STEPS ? 'See my matches' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
