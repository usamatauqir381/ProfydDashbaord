import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Topics Covered"
      description="Topics completed by the teacher."
      mode="teaching-record"
      filters={}
      createHref=undefined
    />
  )
}
