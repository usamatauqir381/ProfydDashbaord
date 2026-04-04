import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Weekend Schedule"
      description="Weekend-specific slots and classes."
      mode="schedule"
      filters={ is_weekend: true }
      createHref=undefined
    />
  )
}
