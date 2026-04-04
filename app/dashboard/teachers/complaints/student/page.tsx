import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Student Complaints"
      description="Complaints raised by students."
      mode="complaints"
      filters={ raised_by_type: "student" }
      createHref=undefined
    />
  )
}
