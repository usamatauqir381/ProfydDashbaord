import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Schedule Exceptions"
      description="Blocked slots, leave blocks, or one-off schedule exceptions."
      mode="schedule"
      filters={ slot_type: "blocked" }
      createHref=undefined
    />
  )
}
