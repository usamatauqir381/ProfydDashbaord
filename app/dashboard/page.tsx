"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function DashboardRootPage() {
  const router = useRouter()
  const { user, supabaseUser, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    const department =
      user?.department ||
      (supabaseUser?.user_metadata?.department as string | undefined) ||
      "training"

    router.replace(`/dashboard/${department}`)
  }, [user, supabaseUser, isLoading, router])

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  )
}