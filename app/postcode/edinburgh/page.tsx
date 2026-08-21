import PrioritySeoPage, { priorityMetadata } from '@/components/PrioritySeoPage'

export const metadata = priorityMetadata('edinburgh')

export default function Page() {
  return <PrioritySeoPage pageKey="edinburgh" />
}
