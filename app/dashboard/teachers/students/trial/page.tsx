import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Trial Students"
      description="Students currently in trial stage."
      mode="students"
      filters={ class_type: "trial" }
      createHref=undefined
    />
  )
}
