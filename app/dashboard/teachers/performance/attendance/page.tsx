import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Attendance Performance"
      description="Teacher punctuality and attendance indicators."
      mode="performance"
      filters={}
      createHref=undefined
    />
  )
}
