import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Free Slots"
      description="Teacher free slots available for assignment."
      mode="schedule"
      filters={ slot_type: "free" }
      createHref=undefined
    />
  )
}
