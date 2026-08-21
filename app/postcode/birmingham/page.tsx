import PrioritySeoPage, { priorityMetadata } from '@/components/PrioritySeoPage'

export const metadata = priorityMetadata('birmingham')

export default function Page() {
  return <PrioritySeoPage pageKey="birmingham" />
}
