import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Full Schedule"
      description="Teachers with no free slots available."
      mode="management"
      filters={ status: "full_capacity" }
      createHref=undefined
    />
  )
}
