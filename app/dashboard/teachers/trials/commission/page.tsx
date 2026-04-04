import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Trial Commission"
      description="Commission entries earned from won trials."
      mode="trials"
      filters={ outcome: "won" }
      createHref=undefined
    />
  )
}
