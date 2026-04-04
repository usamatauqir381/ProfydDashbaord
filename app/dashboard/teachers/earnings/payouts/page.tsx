import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Payouts"
      description="Teacher payout history."
      mode="earnings"
      filters={}
      createHref=undefined
    />
  )
}
