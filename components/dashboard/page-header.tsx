"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search } from "@/components/icons"  // Removed ModeToggle import
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DEPARTMENT_DISPLAY_NAMES } from "@/lib/constants/departments"
import { ModeToggle } from "../mode-toggle"

interface PageHeaderProps {
  title?: string
  department?: string
  breadcrumbs?: { label: string; href?: string }[]
}

export function PageHeader({ title, department, breadcrumbs: propBreadcrumbs }: PageHeaderProps) {
  const pathname = usePathname()
  
  // Generate breadcrumbs if not provided
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    // Always start with Dashboard
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' })
    
    // Add department if present
    if (segments.length > 1 && segments[0] === 'dashboard') {
      const deptId = segments[1]
      const deptName = DEPARTMENT_DISPLAY_NAMES[deptId as keyof typeof DEPARTMENT_DISPLAY_NAMES] || deptId
      breadcrumbs.push({ 
        label: deptName, 
        href: `/dashboard/${deptId}` 
      })
      
      // Add remaining segments
      for (let i = 2; i < segments.length; i++) {
        const segment = segments[i]
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        breadcrumbs.push({ 
          label,
          href: i < segments.length - 1 ? `/${segments.slice(0, i + 1).join('/')}` : undefined
        })
      }
    }
    
    return breadcrumbs
  }
  
  const breadcrumbs = propBreadcrumbs || generateBreadcrumbs()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-2" />
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.href || index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.href && index < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Page Title (optional, shows after breadcrumbs) */}
      {title && breadcrumbs.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </>
      )}
      
      <div className="ml-auto flex items-center gap-4">
        {/* Search */}
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div> */}
        <ModeToggle/>
        
        {/* Notifications - ModeToggle removed */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4 text-sm font-medium border-b">Notifications</div>
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-default">
                <span className="font-medium">New interview scheduled</span>
                <span className="text-xs text-muted-foreground">John Doe - Mathematics</span>
                <span className="text-xs text-muted-foreground">5 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-default">
                <span className="font-medium">Trial evaluation pending</span>
                <span className="text-xs text-muted-foreground">Week 2 evaluation for Sarah</span>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-default">
                <span className="font-medium">Parent complaint received</span>
                <span className="text-xs text-muted-foreground">Regarding Mr. Ahmed</span>
                <span className="text-xs text-muted-foreground">3 hours ago</span>
              </DropdownMenuItem>
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full justify-center">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}