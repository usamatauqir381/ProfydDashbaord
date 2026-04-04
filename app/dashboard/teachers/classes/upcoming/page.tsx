import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Upcoming Classes"
      description="Upcoming scheduled classes."
      mode="classes"
      filters={ status: "scheduled" }
      createHref=undefined
    />
  )
}
