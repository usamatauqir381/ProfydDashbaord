import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Completed Classes"
      description="Completed class history."
      mode="classes"
      filters={ status: "completed" }
      createHref=undefined
    />
  )
}
