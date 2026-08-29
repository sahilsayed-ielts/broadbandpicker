import tokensData from './partner-onboarding-tokens.json'

export interface PartnerOnboardingTokenEntry {
  advertiserSlug: string
  advertiserName: string
  createdAt: string
  expiresAt: string
}

interface TokensFile {
  generatedAt: string
  tokens: Record<string, PartnerOnboardingTokenEntry>
}

const data = tokensData as TokensFile

export function getPartnerOnboardingToken(token: string): PartnerOnboardingTokenEntry | undefined {
  return data.tokens[token]
}

export function isPartnerOnboardingTokenExpired(entry: PartnerOnboardingTokenEntry): boolean {
  return new Date(entry.expiresAt).getTime() < Date.now()
}
