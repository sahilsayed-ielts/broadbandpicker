'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { isEditorialAdPath } from '@/lib/adsense'

/** Pause Google ad requests on commercial and utility pages; allow them on guides and research. */
export default function AdSenseRequestGate() {
  const pathname = usePathname()

  useEffect(() => {
    const ads = (window.adsbygoogle = window.adsbygoogle || [])
    ads.pauseAdRequests = isEditorialAdPath(pathname) ? 0 : 1
  }, [pathname])

  return null
}
