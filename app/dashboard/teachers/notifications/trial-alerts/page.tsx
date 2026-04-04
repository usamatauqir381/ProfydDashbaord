import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Trial Alerts"
      description="Notifications related to trials."
      mode="notifications"
      filters={ type: "trial" }
      createHref=undefined
    />
  )
}
