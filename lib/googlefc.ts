export const GOOGLE_CMP_PENDING_EVENT = 'bbp:google-cmp-pending'

type GoogleFcMessage = {
  proceed: (allow: boolean) => void
}

type GoogleFc = {
  callbackQueue?: Array<(() => void) | Record<string, () => void>>
  showRevocationMessage?: () => void
  getGoogleConsentModeValues?: () => Record<string, unknown>
  controlledMessagingFunction?: (message: GoogleFcMessage) => void
}

declare global {
  interface Window {
    googlefc?: GoogleFc
    __bbpGoogleFcMessage?: GoogleFcMessage
    adsbygoogle?: Array<Record<string, unknown>> & { pauseAdRequests?: number }
  }
}

export function proceedGoogleCmp(allow: boolean) {
  if (typeof window === 'undefined') return
  const message = window.__bbpGoogleFcMessage
  window.__bbpGoogleFcMessage = undefined
  if (message && typeof message.proceed === 'function') {
    message.proceed(allow)
  }
}

export function showGoogleAdChoices() {
  if (typeof window === 'undefined') return
  const googlefc = window.googlefc
  if (!googlefc) return
  googlefc.callbackQueue = googlefc.callbackQueue || []
  googlefc.callbackQueue.push(() => {
    googlefc.showRevocationMessage?.()
  })
}

export function hasPendingGoogleCmp() {
  return typeof window !== 'undefined' && Boolean(window.__bbpGoogleFcMessage)
}
