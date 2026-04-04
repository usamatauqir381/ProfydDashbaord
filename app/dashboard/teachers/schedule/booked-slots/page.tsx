import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Booked Slots"
      description="Booked teacher slots."
      mode="schedule"
      filters={ slot_type: "booked" }
      createHref=undefined
    />
  )
}
