import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Resolved Complaints"
      description="Resolved complaint records."
      mode="complaints"
      filters={ status: "resolved" }
      createHref=undefined
    />
  )
}
