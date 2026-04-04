import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Yearly Classes"
      description="Yearly classes overview. Replace with year-range filtering if needed."
      mode="classes"
      filters={}
      createHref=undefined
    />
  )
}
