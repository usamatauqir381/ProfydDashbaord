import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Deductions"
      description="Teacher deduction records."
      mode="earnings"
      filters={}
      createHref=undefined
    />
  )
}
