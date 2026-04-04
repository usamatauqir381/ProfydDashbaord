import { TeachersSharedPage } from "@/components/teachers/shared-page"

export default function Page() {
  return (
    <TeachersSharedPage
      title="Leave History"
      description="Historical leave records."
      mode="leaves"
      filters={}
      createHref=undefined
    />
  )
}
