import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Assignments"
      description="Assign students and trials to teachers."
      mode="management"
      filters={}
      createHref=undefined
    />
  )
}
