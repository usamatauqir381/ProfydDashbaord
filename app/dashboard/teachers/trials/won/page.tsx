import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Won Trials"
      description="Trials converted successfully."
      mode="trials"
      filters={ outcome: "won" }
      createHref=undefined
    />
  )
}
