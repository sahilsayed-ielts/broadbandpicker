/** Labels shared by the speed test, its share page and its share image. */

export function speedColor(mbps: number) {
  if (mbps < 20) return '#ef4444'
  if (mbps < 50) return '#f97316'
  if (mbps < 100) return '#eab308'
  if (mbps < 300) return '#22c55e'
  return '#0ea5e9'
}

export function speedLabel(mbps: number) {
  if (mbps < 10) return 'Very slow'
  if (mbps < 30) return 'Basic'
  if (mbps < 100) return 'Standard'
  if (mbps < 300) return 'Fast'
  if (mbps < 600) return 'Superfast'
  return 'Gigabit'
}

/** Same thresholds as the live result card, minus gaming (needs jitter, which share links do not carry). */
export function shareExperience(download: number, upload: number, ping: number) {
  const browsing = download >= 10 && ping < 100 ? (download >= 30 && ping < 40 ? 5 : 4) : download >= 5 ? 3 : 2
  const streaming = download >= 50 ? 5 : download >= 25 ? 4 : download >= 15 ? 3 : download >= 5 ? 2 : 1
  const calls = upload >= 10 && ping < 50 ? 5 : upload >= 5 && ping < 80 ? 4 : upload >= 3 ? 3 : 2
  return [
    { label: 'Web browsing', score: browsing },
    { label: 'Video streaming', score: streaming },
    { label: 'Video calls', score: calls },
  ]
}
