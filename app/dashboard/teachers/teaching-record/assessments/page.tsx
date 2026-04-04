import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Assessments"
      description="Assessment records linked with teaching logs."
      mode="teaching-record"
      filters={}
      createHref=undefined
    />
  )
}
