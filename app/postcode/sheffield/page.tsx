import PrioritySeoPage, { priorityMetadata } from '@/components/PrioritySeoPage'

export const metadata = priorityMetadata('sheffield')

export default function Page() {
  return <PrioritySeoPage pageKey="sheffield" />
}
