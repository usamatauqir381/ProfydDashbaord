import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Today Trials"
      description="Today trial sessions."
      mode="trials"
      filters={ trial_date: new Date().toISOString().split("T")[0] }
      createHref=undefined
    />
  )
}
