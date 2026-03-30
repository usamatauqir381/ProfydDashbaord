"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DepartmentSidebar } from "@/components/dashboard/department-sidebar"
// import { PageHeader } from "@/components/dashboard/page-header"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !isLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isLoading, router, isClient])

  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  const userDepartment = user?.department || 'training'

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar - only once */}
        <DepartmentSidebar departmentId={userDepartment} />
        
        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Header - only once */}
          {/* <PageHeader /> */}
          
          {/* Page Content - no padding here, let pages handle their own padding */}
          <main className="flex-1 overflow-auto bg-white">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}