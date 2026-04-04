import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Teachers Management"
      description="Manager and admin overview for all teachers."
      mode="management"
      filters={}
      createHref=undefined
    />
  )
}
