import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Workload"
      description="Track teacher workload and capacity."
      mode="management"
      filters={}
      createHref=undefined
    />
  )
}
