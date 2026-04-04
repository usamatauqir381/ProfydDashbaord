import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Pending Complaints"
      description="Pending complaints requiring action."
      mode="complaints"
      filters={ status: "pending" }
      createHref=undefined
    />
  )
}
