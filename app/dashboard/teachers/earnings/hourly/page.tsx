import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Hourly Earnings"
      description="Weekday hourly earnings breakdown."
      mode="earnings"
      filters={}
      createHref=undefined
    />
  )
}
