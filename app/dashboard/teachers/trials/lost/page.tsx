import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Lost Trials"
      description="Trials not converted."
      mode="trials"
      filters={ outcome: "lost" }
      createHref=undefined
    />
  )
}
