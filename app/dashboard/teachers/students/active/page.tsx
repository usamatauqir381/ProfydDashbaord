import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Active Students"
      description="Students currently active with this teacher."
      mode="students"
      filters={ status: "active" }
      createHref=undefined
    />
  )
}
