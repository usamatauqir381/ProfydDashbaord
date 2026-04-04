import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Parent Complaints"
      description="Complaints raised by parents."
      mode="complaints"
      filters={ raised_by_type: "parent" }
      createHref=undefined
    />
  )
}
