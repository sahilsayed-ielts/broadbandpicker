import type { Provider } from '@/types'

export interface ReviewEvidenceMetric {
  label: string
  value: string
  context: string
  period: string
  sourceLabel: string
  sourceUrl: string
  tone: 'positive' | 'neutral' | 'caution'
}

const OFCOM_COMPLAINTS_URL =
  'https://www.ofcom.org.uk/phones-and-broadband/service-quality/ofcom-telecoms-and-pay-tv-complaints-fall-to-record-low'
const WHICH_SURVEY_URL =
  'https://www.which.co.uk/reviews/broadband/article/best-broadband-providers/broadband-provider-reviews-aD1nV9C6cKMa'

const ofcomComplaints: Partial<Record<Provider['slug'], number>> = {
  plusnet: 4,
  sky: 5,
  'virgin-media': 6,
  ee: 6,
  bt: 7,
  vodafone: 8,
  talktalk: 10,
}

const ofcomSatisfaction: Partial<Record<Provider['slug'], number>> = {
  plusnet: 91,
  talktalk: 77,
}

const whichCustomerScore: Partial<Record<Provider['slug'], number>> = {
  'zen-internet': 84,
  hyperoptic: 77,
  'community-fibre': 72,
  plusnet: 71,
}

function complaintTone(rate: number): ReviewEvidenceMetric['tone'] {
  if (rate < 6) return 'positive'
  if (rate > 6) return 'caution'
  return 'neutral'
}

function trustpilotSummary(provider: Provider) {
  if (provider.slug === 'bt') {
    return 'BT has two active profiles, around 4.0 for bt.com and 1.5 for the older broadband-specific profile. We do not merge them.'
  }

  return `A self-selecting public-review signal. Provider invitations and who chooses to review can affect the headline score.`
}

export function getProviderReviewEvidence(provider: Provider): ReviewEvidenceMetric[] {
  if (provider.retiredDate) return []

  const metrics: ReviewEvidenceMetric[] = [
    {
      label: 'Public reviews',
      value: `${provider.trustpilotScore.toFixed(1)} out of 5`,
      context: trustpilotSummary(provider),
      period: `Checked ${provider.reviewedDate}`,
      sourceLabel: 'Trustpilot profile used in this review',
      sourceUrl:
        provider.reviewSources.find((source) => source.href.includes('trustpilot.com'))?.href ??
        `https://uk.trustpilot.com/review/${provider.name.toLowerCase().replaceAll(' ', '')}.com`,
      tone: provider.trustpilotScore >= 4 ? 'positive' : provider.trustpilotScore < 2 ? 'caution' : 'neutral',
    },
  ]

  const complaintRate = ofcomComplaints[provider.slug]
  if (complaintRate !== undefined) {
    metrics.unshift({
      label: 'Ofcom complaints',
      value: `${complaintRate} per 100,000`,
      context:
        complaintRate === 6
          ? 'In line with the fixed-broadband industry average of 6. Lower is better.'
          : `${complaintRate < 6 ? 'Below' : 'Above'} the fixed-broadband industry average of 6. Lower is better.`,
      period: 'Q1 2026',
      sourceLabel: 'Ofcom complaints report',
      sourceUrl: OFCOM_COMPLAINTS_URL,
      tone: complaintTone(complaintRate),
    })
  }

  const satisfaction = ofcomSatisfaction[provider.slug]
  if (satisfaction !== undefined) {
    metrics.push({
      label: 'Ofcom overall satisfaction',
      value: `${satisfaction}%`,
      context:
        satisfaction > 85
          ? 'Above the 85% fixed-broadband sector average in Ofcom’s survey.'
          : 'Below the 85% fixed-broadband sector average in Ofcom’s survey.',
      period: '2024 customer-service research',
      sourceLabel: 'BroadbandPicker evidence dashboard',
      sourceUrl: '/research/uk-broadband-customer-satisfaction',
      tone: satisfaction > 85 ? 'positive' : 'caution',
    })
  }

  const whichScore = whichCustomerScore[provider.slug]
  if (whichScore !== undefined) {
    metrics.push({
      label: 'Which? customer score',
      value: `${whichScore}%`,
      context: 'Combines satisfaction and likelihood to recommend. It is not directly comparable with Ofcom percentages.',
      period: 'January 2026 survey of 5,235 UK adults',
      sourceLabel: 'Which? broadband provider survey',
      sourceUrl: WHICH_SURVEY_URL,
      tone: whichScore >= 75 ? 'positive' : 'neutral',
    })
  }

  return metrics
}

