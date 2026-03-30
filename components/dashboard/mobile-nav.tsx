"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { departments } from "@/lib/departments"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Get the current department from pathname
  const getCurrentDepartment = () => {
    const segments = pathname.split('/')
    if (segments.length >= 3 && segments[1] === 'dashboard') {
      return segments[2]
    }
    return null
  }

  const currentDepartment = getCurrentDepartment()
  const currentDeptData = departments.find(d => d.id === currentDepartment)

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="flex h-16 items-center justify-around px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
              <div className="flex h-16 items-center border-b px-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary" />
                  <span className="font-semibold">BMS</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Departments List */}
              <div className="py-4">
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                  DEPARTMENTS
                </div>
                {departments.map((dept) => (
                  <div key={dept.id} className="mb-2">
                    <Link
                      href={`/dashboard/${dept.id}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-2 text-sm transition-colors hover:bg-accent",
                        pathname.startsWith(`/dashboard/${dept.id}`) && "bg-accent text-primary font-medium"
                      )}
                    >
                      <div className="h-5 w-5" style={{ color: dept.color }} />
                      <span>{dept.name}</span>
                    </Link>
                    
                    {/* Show subpages if in this department */}
                    {pathname.startsWith(`/dashboard/${dept.id}`) && dept.pages && (
                      <div className="ml-8 mt-1 space-y-1 border-l pl-2">
                        {dept.pages.map((page) => (
                          <Link
                            key={page.id}
                            href={page.path}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-accent/50",
                              pathname === page.path && "bg-accent/50 text-primary"
                            )}
                          >
                            <span>{page.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Quick nav items */}
          <Link href="/dashboard" className="flex flex-col items-center">
            <div className={cn(
              "rounded-full p-1.5",
              pathname === "/dashboard" && "bg-primary/10"
            )}>
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xs">Home</span>
          </Link>
          
          {/* Current department quick link */}
          {currentDepartment && currentDeptData && (
            <Link href={`/dashboard/${currentDepartment}`} className="flex flex-col items-center">
              <div className={cn(
                "rounded-full p-1.5",
                pathname === `/dashboard/${currentDepartment}` && "bg-primary/10"
              )}>
                <div className="h-5 w-5" style={{ color: currentDeptData.color }} />
              </div>
              <span className="text-xs">{currentDeptData.name.split(' ')[0]}</span>
            </Link>
          )}
          
          <Link href="/dashboard/reports" className="flex flex-col items-center">
            <div className={cn(
              "rounded-full p-1.5",
              pathname === "/dashboard/reports" && "bg-primary/10"
            )}>
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xs">Reports</span>
          </Link>
        </div>
      </nav>
    </>
  )
}