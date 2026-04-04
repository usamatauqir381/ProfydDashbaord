import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Pending Approvals"
      description="Teachers awaiting manager approval."
      mode="management"
      filters={ approval_status: "pending" }
      createHref=undefined
    />
  )
}
