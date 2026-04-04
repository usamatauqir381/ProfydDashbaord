import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Manual Entries"
      description="Manual teaching records entered by teacher."
      mode="teaching-record"
      filters={}
      createHref=undefined
    />
  )
}
