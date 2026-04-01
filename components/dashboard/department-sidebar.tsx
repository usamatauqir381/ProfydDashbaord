"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { getDepartmentById } from "@/lib/departments"
import { DEPARTMENT_SIDEBAR_ITEMS } from "@/lib/constants/department-sidebar-config"
import { 
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  BookOpen,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  FileText,
  Settings,
  UserPlus,
  Shield,
  BarChart,
  CheckSquare,
  AlertCircle,
  Crown,
  LogOut,
  ChevronDown,
  ChevronLeft,
  Bell,
  Search,
  Home,
  User,
  Menu,
  X,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Download,
  Filter,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Star,
  Target,
  Trophy,
  TrendingDown,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Define types for sidebar items
interface SidebarSubItem {
  title: string
  href: string
  icon?: string
}

interface SidebarItem {
  title: string
  href: string
  icon: string
  subItems?: SidebarSubItem[]
}

// Icon mapping
const Icons: Record<string, React.FC<any>> = {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  BookOpen,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  FileText,
  Settings,
  UserPlus,
  Shield,
  BarChart,
  CheckSquare,
  AlertCircle,
  Crown,
  LogOut,
  ChevronDown,
  ChevronLeft,
  Bell,
  Search,
  Home,
  User,
  Menu,
  X,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Download,
  Filter,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Star,
  Target,
  Trophy,
  TrendingDown
}

const getIcon = (iconName: string) => {
  return Icons[iconName] || LayoutDashboard
}

interface DepartmentSidebarProps {
  departmentId: string
}

export function DepartmentSidebar({ departmentId }: DepartmentSidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Get sidebar items and cast to unknown first then to SidebarItem[]
  const rawItems = DEPARTMENT_SIDEBAR_ITEMS[departmentId as keyof typeof DEPARTMENT_SIDEBAR_ITEMS] || []
  const sidebarItems = rawItems as unknown as SidebarItem[]
  
  const userDepartment = user ? getDepartmentById(user.department) : null

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const getInitials = () => {
    if (!user) return "U"
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`
  }

  return (
    <Sidebar className="h-screen flex flex-col border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="border-b px-4 py-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">BMS</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Back to Main Dashboard */}
      <div className="px-4 py-3 border-b bg-gray-50/50">
        <Link 
          href="/dashboard"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Main Dashboard
        </Link>
      </div>

      {/* Department Title */}
      <div className="px-4 py-3 border-b bg-primary/5">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-primary">
          {departmentId.charAt(0).toUpperCase() + departmentId.slice(1)} Department
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {userDepartment?.name || "Training & Development"}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => {
                  const Icon = getIcon(item.icon)
                  const hasSubItems = item.subItems && item.subItems.length > 0
                  const isItemActive = isActive(item.href)
                  
                  if (hasSubItems) {
                    const isOpen = openMenus.includes(item.title)
                    
                    return (
                      <Collapsible
                        key={item.href}
                        open={isOpen}
                        onOpenChange={() => toggleMenu(item.title)}
                        className="w-full"
                      >
                        <SidebarMenuItem className="mb-2">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              isActive={isItemActive}
                              className="w-full justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </div>
                              <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                isOpen && "transform rotate-180"
                              )} />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-6 space-y-1 mt-1">
                            {item.subItems?.map((subItem) => {
                              const SubIcon = subItem.icon ? getIcon(subItem.icon) : FileText
                              const isSubActive = isActive(subItem.href)
                              return (
                                <SidebarMenuButton
                                  key={subItem.href}
                                  asChild
                                  isActive={isSubActive}
                                  size="sm"
                                  className="pl-8"
                                >
                                  <Link href={subItem.href}>
                                    <SubIcon className="h-3.5 w-3.5" />
                                    <span className="text-sm">{subItem.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              )
                            })}
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }
                  
                  return (
                    <SidebarMenuItem key={item.href} className="mb-2">
                      <SidebarMenuButton asChild isActive={isItemActive}>
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
      </div>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t p-2 shrink-0">
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="gap-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            {/* Avatar */}
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Name + Role */}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.firstName || "User"} {user?.lastName || ""}
              </span>
              <span className="truncate text-muted-foreground text-xs capitalize">
                {user?.role?.replace("_", " ") || "User"}
              </span>
            </div>

            {/* Icon */}
            <MoreHorizontal className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side="right"
          align="end"
          sideOffset={4}
        >
          {/* Top User Info */}
          <div className="flex items-center gap-2 px-2 py-2 text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Menu Items */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={signOut}
            className="text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>
    </Sidebar>
  )
}