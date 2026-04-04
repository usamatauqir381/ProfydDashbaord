import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Complaint Alerts"
      description="Complaint-related notifications."
      mode="notifications"
      filters={ type: "complaint" }
      createHref=undefined
    />
  )
}
