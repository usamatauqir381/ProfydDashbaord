import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Progress Updates"
      description="Student progress updates logged by teacher."
      mode="teaching-record"
      filters={}
      createHref=undefined
    />
  )
}
