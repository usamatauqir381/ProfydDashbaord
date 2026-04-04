import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Salary Alerts"
      description="Salary and payout notifications."
      mode="notifications"
      filters={ type: "salary" }
      createHref=undefined
    />
  )
}
