import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Completed Students"
      description="Students whose assignment cycle is completed."
      mode="students"
      filters={ status: "completed" }
      createHref=undefined
    />
  )
}
