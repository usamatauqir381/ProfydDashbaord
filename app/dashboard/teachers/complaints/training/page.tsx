import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Training Complaints"
      description="Complaints or observations raised by training department."
      mode="complaints"
      filters={ raised_by_type: "training" }
      createHref=undefined
    />
  )
}
