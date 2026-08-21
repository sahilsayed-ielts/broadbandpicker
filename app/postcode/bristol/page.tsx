import PrioritySeoPage, { priorityMetadata } from '@/components/PrioritySeoPage'

export const metadata = priorityMetadata('bristol')

export default function Page() {
  return <PrioritySeoPage pageKey="bristol" />
}
