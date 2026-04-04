import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Rescheduled Classes"
      description="Rescheduled class records."
      mode="classes"
      filters={ status: "rescheduled" }
      createHref=undefined
    />
  )
}
