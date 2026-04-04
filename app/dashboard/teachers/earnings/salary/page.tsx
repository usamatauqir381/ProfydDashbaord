import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Salary Summary"
      description="Monthly teacher salary summary."
      mode="earnings"
      filters={}
      createHref=undefined
    />
  )
}
