import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Completed Trials"
      description="Completed trial history."
      mode="trials"
      filters={ outcome: "completed" }
      createHref=undefined
    />
  )
}
