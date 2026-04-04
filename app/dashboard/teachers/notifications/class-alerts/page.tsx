import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Class Alerts"
      description="Notifications related to classes."
      mode="notifications"
      filters={ type: "class" }
      createHref=undefined
    />
  )
}
