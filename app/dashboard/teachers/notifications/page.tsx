import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Notifications"
      description="All teacher notifications."
      mode="notifications"
      filters={}
      createHref=undefined
    />
  )
}
