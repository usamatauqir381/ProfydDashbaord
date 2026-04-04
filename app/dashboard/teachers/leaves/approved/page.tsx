import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Approved Leaves"
      description="Approved leave records."
      mode="leaves"
      filters={ status: "approved" }
      createHref=undefined
    />
  )
}
