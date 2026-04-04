import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Raised by Teacher"
      description="Complaints raised by the teacher for support or escalation."
      mode="complaints"
      filters={ raised_by_type: "teacher" }
      createHref=undefined
    />
  )
}
