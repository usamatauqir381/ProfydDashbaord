import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Support Complaints"
      description="Complaints raised by support department."
      mode="complaints"
      filters={ raised_by_type: "support" }
      createHref=undefined
    />
  )
}
