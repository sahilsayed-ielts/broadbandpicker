import Script from 'next/script'
import { ADSENSE_PUBLISHER_ID, ADSENSE_SCRIPT_SRC } from '@/lib/adsense'

/** Load AdSense only on editorial layouts. Do not import from the root layout. */
export default function AdSenseScript() {
  return (
    <Script
      id="adsense-client"
      src={ADSENSE_SCRIPT_SRC}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      data-ad-client={ADSENSE_PUBLISHER_ID}
    />
  )
}
