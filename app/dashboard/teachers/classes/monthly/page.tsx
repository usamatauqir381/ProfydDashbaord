import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Monthly Classes"
      description="Monthly classes overview. Replace with month-range filtering if needed."
      mode="classes"
      filters={}
      createHref=undefined
    />
  )
}
