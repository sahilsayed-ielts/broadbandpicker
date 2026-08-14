'use client'

import { OPEN_CONSENT_EVENT } from './CookieBanner'

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="hover:text-white transition-colors"
    >
      Cookie preferences
    </button>
  )
}
