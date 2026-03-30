import { DepartmentSidebar } from "@/components/dashboard/department-sidebar"
import { PageHeader } from "@/components/dashboard/page-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Use DepartmentSidebar for training department - shows training-specific menu */}
        <DepartmentSidebar departmentId="training" />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <PageHeader />
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}