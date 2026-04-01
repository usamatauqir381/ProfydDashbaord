"use client"

import Link from "next/link"
import {
  MoreHorizontal,
  User,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react"
import { ReactNode } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

// Type for the user object
interface User {
  firstName?: string
  lastName?: string
  role?: string
  // Add other user fields as needed
}

// Props for the main component
interface AccountSwitcherProps {
  user: User | null
  signOut: () => void
  /** Custom trigger button (if not provided, uses default sidebar button) */
  trigger?: ReactNode
  /** Whether to wrap the trigger in SidebarMenuButton (default true when trigger not provided) */
  useSidebarStyle?: boolean
  /** Additional menu items to inject before the logout item */
  extraMenuItems?: ReactNode
}

// Helper to get initials
const getInitials = (user: User | null): string => {
  if (!user) return "U"
  return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`
}

// Reusable dropdown content (can be used anywhere)
interface UserMenuContentProps {
  user: User | null
  signOut: () => void
  extraMenuItems?: ReactNode
}

function UserMenuContent({ user, signOut, extraMenuItems }: UserMenuContentProps) {
  return (
    <>
      {/* Top user info */}
      <div className="flex items-center gap-2 px-2 py-2 text-sm">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarFallback className="rounded-lg">
            {getInitials(user)}
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

      {/* Default menu items */}
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

      {/* Extra menu items (if any) */}
      {extraMenuItems && (
        <>
          <DropdownMenuSeparator />
          {extraMenuItems}
        </>
      )}

      <DropdownMenuSeparator />

      {/* Logout */}
      <DropdownMenuItem onClick={signOut} className="text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </DropdownMenuItem>
    </>
  )
}

// Main AccountSwitcher component – now more flexible
export function AccountSwitcher({
  user,
  signOut,
  trigger,
  useSidebarStyle = true,
  extraMenuItems,
}: AccountSwitcherProps) {
  const defaultTrigger = (
    <SidebarMenuButton
      size="lg"
      className="gap-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs">
          {getInitials(user)}
        </AvatarFallback>
      </Avatar>

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">
          {user?.firstName || "User"} {user?.lastName || ""}
        </span>
        <span className="truncate text-muted-foreground text-xs capitalize">
          {user?.role?.replace("_", " ") || "User"}
        </span>
      </div>

      <MoreHorizontal className="ml-auto size-4" />
    </SidebarMenuButton>
  )

  const content = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (useSidebarStyle ? defaultTrigger : defaultTrigger)}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="right"
        align="end"
        sideOffset={4}
      >
        <UserMenuContent
          user={user}
          signOut={signOut}
          extraMenuItems={extraMenuItems}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // If we are using the sidebar style (default), we wrap in SidebarMenu/SidebarMenuItem.
  // Otherwise, we just return the dropdown directly.
  if (useSidebarStyle && !trigger) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>{content}</SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return content
}