import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Assigned Trials"
      description="Trials assigned to this teacher."
      mode="trials"
      filters={ outcome: "assigned" }
      createHref=undefined
    />
  )
}
