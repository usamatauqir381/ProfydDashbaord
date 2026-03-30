"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function DebugAuthPage() {
  const { user, isLoading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSessionInfo(session)
    }
    checkSession()
  }, [])

  const handleRefreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    console.log('Refresh result:', { data, error })
    setSessionInfo(data.session)
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Auth Debug Page</h1>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Auth Context</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ user, isLoading }, null, 2)}
        </pre>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Direct Supabase Session</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      </div>

      <Button onClick={handleRefreshSession}>Refresh Session</Button>
    </div>
  )
}