import PrioritySeoPage, { priorityMetadata } from '@/components/PrioritySeoPage'

export const metadata = priorityMetadata('manchester')

export default function Page() {
  return <PrioritySeoPage pageKey="manchester" />
}
