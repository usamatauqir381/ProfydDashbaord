import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Today Classes"
      description="Classes scheduled for today."
      mode="classes"
      filters={ class_date: new Date().toISOString().split("T")[0] }
      createHref=undefined
    />
  )
}
