import PrioritySeoPage, { priorityMetadata } from '@/components/PrioritySeoPage'

export const metadata = priorityMetadata('serviceRankings')

export default function Page() {
  return <PrioritySeoPage pageKey="serviceRankings" />
}
