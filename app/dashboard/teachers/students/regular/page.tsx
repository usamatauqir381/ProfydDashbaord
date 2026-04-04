import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Regular Students"
      description="Students currently taking regular paid classes."
      mode="students"
      filters={ class_type: "regular" }
      createHref=undefined
    />
  )
}
