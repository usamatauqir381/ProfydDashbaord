import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Received Complaints"
      description="Complaints raised against this teacher."
      mode="complaints"
      filters={}
      createHref=undefined
    />
  )
}
