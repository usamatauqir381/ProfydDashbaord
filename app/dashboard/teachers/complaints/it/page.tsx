import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="IT Complaints"
      description="Technical complaints linked to teacher classes or profile."
      mode="complaints"
      filters={ raised_by_type: "it" }
      createHref=undefined
    />
  )
}
