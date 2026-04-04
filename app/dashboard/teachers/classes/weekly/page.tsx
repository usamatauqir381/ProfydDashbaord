import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Weekly Classes"
      description="Weekly classes overview. Replace with range filters if needed."
      mode="classes"
      filters={}
      createHref=undefined
    />
  )
}
