import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Transferred Students"
      description="Students transferred away from this teacher."
      mode="students"
      filters={ status: "transferred" }
      createHref=undefined
    />
  )
}
