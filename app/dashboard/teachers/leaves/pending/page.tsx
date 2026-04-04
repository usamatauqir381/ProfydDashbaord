import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Pending Leaves"
      description="Pending leave requests."
      mode="leaves"
      filters={ status: "pending" }
      createHref=undefined
    />
  )
}
