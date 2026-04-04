import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Missed Classes"
      description="Missed class records."
      mode="classes"
      filters={ status: "missed" }
      createHref=undefined
    />
  )
}
