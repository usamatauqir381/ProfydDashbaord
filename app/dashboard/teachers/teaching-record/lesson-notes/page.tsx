import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Lesson Notes"
      description="Lesson note records."
      mode="teaching-record"
      filters={}
      createHref=undefined
    />
  )
}
