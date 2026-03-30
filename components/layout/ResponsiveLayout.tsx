"use client"

import { ReactNode } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"  // Correct import path
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { cn } from "@/lib/utils"

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/30">
        {/* Desktop Sidebar */}
        {isDesktop && <DashboardSidebar />}
        
        {/* Mobile Navigation */}
        {!isDesktop && <MobileNav />}
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-auto",
          !isDesktop && "pb-16",
          className
        )}>
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}