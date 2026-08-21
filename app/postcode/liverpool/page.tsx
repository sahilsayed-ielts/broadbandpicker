import PrioritySeoPage, { priorityMetadata } from '@/components/PrioritySeoPage'

export const metadata = priorityMetadata('liverpool')

export default function Page() {
  return <PrioritySeoPage pageKey="liverpool" />
}
