'use client'

import { useEffect } from 'react'
import {
  CONSENT_KEY,
  CONSENT_UPDATED_EVENT,
  type ConsentState,
} from '@/components/CookieBanner'
import { trackEvent } from '@/lib/analytics'

const AI_EVENT_SENT_KEY = 'bbp_ai_referral_visit_sent'

const AI_SOURCES: Array<{ platform: string; hosts: string[]; aliases: string[] }> = [
  { platform: 'chatgpt', hosts: ['chatgpt.com', 'chat.openai.com'], aliases: ['chatgpt', 'openai'] },
  { platform: 'perplexity', hosts: ['perplexity.ai'], aliases: ['perplexity'] },
  { platform: 'claude', hosts: ['claude.ai'], aliases: ['claude', 'anthropic'] },
  { platform: 'gemini', hosts: ['gemini.google.com'], aliases: ['gemini', 'google_gemini'] },
  { platform: 'copilot', hosts: ['copilot.microsoft.com'], aliases: ['copilot', 'microsoft_copilot'] },
  { platform: 'poe', hosts: ['poe.com'], aliases: ['poe'] },
  { platform: 'you', hosts: ['you.com'], aliases: ['you', 'you.com'] },
  { platform: 'phind', hosts: ['phind.com'], aliases: ['phind'] },
  { platform: 'mistral', hosts: ['chat.mistral.ai', 'mistral.ai'], aliases: ['mistral', 'le_chat'] },
]

function hostname(value: string): string {
  if (!value) return ''
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

function pageType(pathname: string): string {
  if (pathname === '/') return 'homepage'
  if (pathname === '/compare') return 'comparison_hub'
  if (pathname === '/deals') return 'deals_hub'
  if (pathname === '/speed-test') return 'tool'
  if (pathname.startsWith('/providers/compare/')) return 'provider_comparison'
  if (pathname.startsWith('/providers/')) return 'provider_page'
  if (pathname.startsWith('/guides/')) return 'guide'
  if (pathname.startsWith('/tools/')) return 'tool'
  return 'other'
}

function identifyAiSource(): { platform: string; referrerDomain: string } | null {
  const referrerDomain = hostname(document.referrer)
  const params = new URLSearchParams(window.location.search)
  const campaignSource = (params.get('utm_source') || '').trim().toLowerCase()

  for (const source of AI_SOURCES) {
    const hostMatch = source.hosts.some(
      (host) => referrerDomain === host || referrerDomain.endsWith(`.${host}`),
    )
    const campaignMatch = source.aliases.includes(campaignSource)
    if (hostMatch || campaignMatch) {
      return {
        platform: source.platform,
        referrerDomain: referrerDomain || `utm:${campaignSource}`,
      }
    }
  }

  return null
}

export default function AiReferralTracker() {
  useEffect(() => {
    const source = identifyAiSource()
    if (!source) return

    const emit = () => {
      const consent = localStorage.getItem(CONSENT_KEY) as ConsentState
      if (consent !== 'accepted' || sessionStorage.getItem(AI_EVENT_SENT_KEY)) return

      trackEvent('ai_referral_visit', {
        ai_platform: source.platform,
        landing_page: window.location.pathname,
        referrer_domain: source.referrerDomain,
        page_type: pageType(window.location.pathname),
      })
      sessionStorage.setItem(AI_EVENT_SENT_KEY, '1')
    }

    emit()
    window.addEventListener(CONSENT_UPDATED_EVENT, emit)
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, emit)
  }, [])

  return null
}
