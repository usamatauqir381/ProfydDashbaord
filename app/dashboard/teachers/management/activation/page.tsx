import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Activation Control"
      description="Activate or deactivate teacher profiles."
      mode="management"
      filters={}
      createHref=undefined
    />
  )
}
