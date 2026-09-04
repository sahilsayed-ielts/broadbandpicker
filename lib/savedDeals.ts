'use client'

/**
 * Save-a-deal-for-later, backed by localStorage only — no account, no
 * backend. 46% of the affiliate/comparison sites benchmarked ship this;
 * BroadbandPicker had nothing a visitor who isn't ready to switch today
 * could come back to. See docs/home page UX/affiliate-ux-functionality-benchmark.md.
 *
 * Any new deal-listing component (a table, a card grid, a provider deals
 * page) should render <SaveDealButton /> next to its Get Deal CTA — that is
 * the whole integration; this module is the storage side.
 */

const STORAGE_KEY = 'bbp_saved_deals'
const CHANGE_EVENT = 'bbp:saved-deals-changed'

export interface SavedDeal {
  id: string
  providerSlug: string
  providerName: string
  packageName: string
  monthlyPrice: number
  download: number
  contractLength: number
  savedAt: string
}

export function dealId(providerSlug: string, packageName: string): string {
  return `${providerSlug}::${packageName}`
}

function readAll(): SavedDeal[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(deals: SavedDeal[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deals))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // Private browsing / storage disabled — saving silently no-ops.
  }
}

export function getSavedDeals(): SavedDeal[] {
  return readAll()
}

export function isDealSaved(id: string): boolean {
  return readAll().some((deal) => deal.id === id)
}

export function saveDeal(deal: Omit<SavedDeal, 'savedAt'>): void {
  const all = readAll()
  if (all.some((d) => d.id === deal.id)) return
  writeAll([...all, { ...deal, savedAt: new Date().toISOString() }])
}

export function removeSavedDeal(id: string): void {
  writeAll(readAll().filter((deal) => deal.id !== id))
}

export function toggleSavedDeal(deal: Omit<SavedDeal, 'savedAt'>): boolean {
  const wasSaved = isDealSaved(deal.id)
  if (wasSaved) {
    removeSavedDeal(deal.id)
  } else {
    saveDeal(deal)
  }
  return !wasSaved
}

/** Fires on every save/remove, including from other components in the same tab. */
export function onSavedDealsChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
