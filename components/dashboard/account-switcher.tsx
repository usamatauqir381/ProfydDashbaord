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
import { Button } from "@/components/ui/button"

interface UserType {
  firstName?: string
  lastName?: string
  role?: string
}

interface AccountSwitcherProps {
  user: UserType | null
  signOut: () => void
  trigger?: ReactNode
  useSidebarStyle?: boolean
  extraMenuItems?: ReactNode
  compact?: boolean
  dropdownSide?: "top" | "right" | "bottom" | "left"
  dropdownAlign?: "start" | "center" | "end"
}

const getInitials = (user: UserType | null): string => {
  if (!user) return "U"
  return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`
}

interface UserMenuContentProps {
  user: UserType | null
  signOut: () => void
  extraMenuItems?: ReactNode
}

function UserMenuContent({ user, signOut, extraMenuItems }: UserMenuContentProps) {
  return (
    <>
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

      {extraMenuItems && (
        <>
          <DropdownMenuSeparator />
          {extraMenuItems}
        </>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={signOut} className="text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </DropdownMenuItem>
    </>
  )
}

export function AccountSwitcher({
  user,
  signOut,
  trigger,
  useSidebarStyle = true,
  extraMenuItems,
  compact = false,
  dropdownSide = "right",
  dropdownAlign = "end",
}: AccountSwitcherProps) {
  const compactTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-xl border bg-background/50 hover:bg-muted"
    >
      <Avatar className="h-8 w-8 rounded-full">
        <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs">
          {getInitials(user)}
        </AvatarFallback>
      </Avatar>
    </Button>
  )

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
        <span className="truncate text-xs capitalize text-muted-foreground">
          {user?.role?.replace("_", " ") || "User"}
        </span>
      </div>

      <MoreHorizontal className="ml-auto size-4" />
    </SidebarMenuButton>
  )

  const finalTrigger = trigger || (compact ? compactTrigger : defaultTrigger)

  const content = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{finalTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side={dropdownSide}
        align={dropdownAlign}
        sideOffset={8}
      >
        <UserMenuContent
          user={user}
          signOut={signOut}
          extraMenuItems={extraMenuItems}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (useSidebarStyle && !trigger && !compact) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>{content}</SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return content
}