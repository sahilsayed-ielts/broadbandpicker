export const ADSENSE_PUBLISHER_ID = 'ca-pub-9056289061141918'
export const ADSENSE_PUBLISHER_NUMBER = 'pub-9056289061141918'
export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`
export const FUNDING_CHOICES_SRC = `https://fundingchoicesmessages.google.com/i/${ADSENSE_PUBLISHER_NUMBER}?ers=1`

/** Runs before Google tags so Consent Mode, TCF and ad requests start denied. */
export const GOOGLE_CMP_BOOTSTRAP = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});window.googlefc=window.googlefc||{};window.googlefc.callbackQueue=window.googlefc.callbackQueue||[];window.adsbygoogle=window.adsbygoogle||[];window.adsbygoogle.pauseAdRequests=1;window.googlefc.controlledMessagingFunction=function(message){window.__bbpGoogleFcMessage=message;window.dispatchEvent(new Event('bbp:google-cmp-pending'));};(function(){function signalGooglefcPresent(){if(!window.frames['googlefcPresent']){if(document.body){var iframe=document.createElement('iframe');iframe.style.cssText='width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none';iframe.name='googlefcPresent';document.body.appendChild(iframe)}else{setTimeout(signalGooglefcPresent,0)}}}signalGooglefcPresent()})();`

export function isEditorialAdPath(pathname: string): boolean {
  return pathname === '/guides' || pathname.startsWith('/guides/') || pathname.startsWith('/research/')
}
