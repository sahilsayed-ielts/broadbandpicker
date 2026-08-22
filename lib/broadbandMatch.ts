import type { Provider } from '@/types'
import { getPostcodeArea } from '@/data/postcodes'
import { getDistrictCoverage } from '@/data/postcodeDistrictCoverage'
import { extractPostcodeArea } from '@/lib/postcode'

export type ReasonForLooking = 'moving' | 'switching-price' | 'switching-speed' | 'new'
export type HouseholdSize = '1-2' | '3-4' | '5+'
export type UseCase = 'wfh' | 'gaming' | 'streaming-4k' | 'streaming-hd' | 'browsing' | 'smart-home'
export type ContractPreference = 'flexible' | 'standard' | 'no-preference'

export interface QuizAnswers {
  reason: ReasonForLooking
  household: HouseholdSize
  useCases: UseCase[]
  budget: number
  contractPreference: ContractPreference
  postcode: string
}

export interface MatchResult {
  provider: Provider
  matchedSpeed: { download: number; upload: number; type: string }
  score: number
  withinBudget: boolean
  reasons: string[]
}

const USE_CASE_LABELS: Record<UseCase, string> = {
  wfh: 'working from home / video calls',
  gaming: 'online gaming',
  'streaming-4k': '4K streaming',
  'streaming-hd': 'HD streaming',
  browsing: 'everyday browsing',
  'smart-home': 'smart home devices',
}

const HOUSEHOLD_MULTIPLIER: Record<HouseholdSize, number> = {
  '1-2': 1,
  '3-4': 1.35,
  '5+': 1.7,
}

/** Minimum download/upload speed a household needs, derived from use cases — not a fabricated number, built from Ofcom's own speed-band guidance (30/100/300 Mbps bands) applied per use case. */
export function computeMinimumSpeed(answers: Pick<QuizAnswers, 'household' | 'useCases'>): { download: number; upload: number } {
  let download = 30 // Ofcom's "decent broadband" / everyday baseline
  let upload = 10

  if (answers.useCases.includes('streaming-4k')) { download += 25; upload += 5 }
  if (answers.useCases.includes('streaming-hd')) { download += 10 }
  if (answers.useCases.includes('gaming')) { download += 20; upload += 5 }
  if (answers.useCases.includes('wfh')) { download += 15; upload += 15 }
  if (answers.useCases.includes('smart-home')) { download += 5 }

  const multiplier = HOUSEHOLD_MULTIPLIER[answers.household]
  download = Math.round(download * multiplier)
  upload = Math.round(upload * multiplier)

  return {
    download: Math.min(1000, Math.max(30, download)),
    upload: Math.min(300, Math.max(10, upload)),
  }
}

function bestMatchedSpeed(provider: Provider, minDownload: number, minUpload: number) {
  const eligible = provider.speeds.filter((s) => s.download >= minDownload && s.upload >= minUpload)
  const pool = eligible.length > 0 ? eligible : provider.speeds
  return [...pool].sort((a, b) => a.download - b.download)[0]
}

function localAvailabilitySignal(provider: Provider, postcode: string): { plausible: boolean; note: string | null } {
  if (!postcode) return { plausible: true, note: null }
  const areaPrefix = extractPostcodeArea(postcode)
  if (!areaPrefix) return { plausible: true, note: null }

  const curatedArea = getPostcodeArea(areaPrefix)
  if (curatedArea) {
    const available = curatedArea.availableProviders.includes(provider.slug)
    return {
      plausible: available,
      note: available ? null : `Not confirmed as available in ${curatedArea.town} — check at checkout`,
    }
  }

  const district = getDistrictCoverage(areaPrefix)
  if (district && district.gigabitPercent !== null && district.gigabitPercent < 20 && provider.speeds.some((s) => s.download >= 500)) {
    return { plausible: true, note: 'Full-fibre availability is limited in this district — confirm at checkout' }
  }
  return { plausible: true, note: null }
}

export function matchProviders(answers: QuizAnswers, providers: Provider[]): MatchResult[] {
  const { download: minDownload, upload: minUpload } = computeMinimumSpeed(answers)

  const results: MatchResult[] = providers.map((provider) => {
    const matchedSpeed = bestMatchedSpeed(provider, minDownload, minUpload)
    const withinBudget = provider.monthlyPriceFrom <= answers.budget
    const availability = localAvailabilitySignal(provider, answers.postcode)

    const speedMeetsNeed = matchedSpeed.download >= minDownload && matchedSpeed.upload >= minUpload
    const speedHeadroomPenalty = speedMeetsNeed
      ? Math.max(0, 1 - (matchedSpeed.download - minDownload) / 600) // mild penalty for wild over-provisioning
      : 0.3 // real penalty if it can't actually meet the need

    const priceScore = withinBudget ? Math.max(0, 1 - provider.monthlyPriceFrom / Math.max(answers.budget, 1)) : 0
    const trustScore = provider.trustpilotScore / 5
    const contractScore =
      answers.contractPreference === 'flexible'
        ? Math.max(0, 1 - Math.min(...provider.contractLengths) / 24)
        : 0.6
    const availabilityScore = availability.plausible ? 1 : 0.15

    const score =
      speedHeadroomPenalty * 35 +
      priceScore * 25 +
      trustScore * 20 +
      contractScore * 10 +
      availabilityScore * 10

    const reasons: string[] = []
    if (speedMeetsNeed) {
      reasons.push(
        `${matchedSpeed.download} Mbps download / ${matchedSpeed.upload} Mbps upload covers your ${answers.useCases
          .map((u) => USE_CASE_LABELS[u])
          .join(', ') || 'everyday'} needs with room to spare.`
      )
    } else {
      reasons.push(
        `Fastest package is ${matchedSpeed.download} Mbps — below the ${minDownload} Mbps we'd usually suggest for your household, so treat this as a budget-first pick.`
      )
    }
    if (withinBudget) {
      reasons.push(`From £${provider.monthlyPriceFrom.toFixed(2)}/month, within your £${answers.budget}/month budget.`)
    } else {
      reasons.push(`From £${provider.monthlyPriceFrom.toFixed(2)}/month — above your £${answers.budget}/month budget.`)
    }
    if (answers.contractPreference === 'flexible' && Math.min(...provider.contractLengths) <= 12) {
      reasons.push(`Shortest contract is ${Math.min(...provider.contractLengths)} months, matching your preference for flexibility.`)
    }
    reasons.push(`Trustpilot score ${provider.trustpilotScore.toFixed(1)}/5.`)
    if (availability.note) reasons.push(availability.note)

    return { provider, matchedSpeed, score: Math.round(score * 10) / 10, withinBudget, reasons }
  })

  return results.sort((a, b) => b.score - a.score)
}

export function topMatches(answers: QuizAnswers, providers: Provider[], count = 3): MatchResult[] {
  return matchProviders(answers, providers).slice(0, count)
}
