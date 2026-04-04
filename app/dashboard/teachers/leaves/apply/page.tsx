import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Apply Leave"
      description="Teacher leave application records. Add your form here."
      mode="leaves"
      filters={ status: "pending" }
      createHref=undefined
    />
  )
}
