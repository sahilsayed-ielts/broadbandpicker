import PrioritySeoPage, { priorityMetadata } from '@/components/PrioritySeoPage'

export const metadata = priorityMetadata('glasgow')

export default function Page() {
  return <PrioritySeoPage pageKey="glasgow" />
}
