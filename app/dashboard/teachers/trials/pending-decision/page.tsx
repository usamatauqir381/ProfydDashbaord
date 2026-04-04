import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Pending Trial Decisions"
      description="Trials awaiting final decision."
      mode="trials"
      filters={ outcome: "pending_decision" }
      createHref=undefined
    />
  )
}
