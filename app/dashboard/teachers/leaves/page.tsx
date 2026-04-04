import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Leaves"
      description="Teacher leave records and approvals."
      mode="leaves"
      filters={}
      createHref="/dashboard/teachers/leaves/apply"
    />
  )
}
