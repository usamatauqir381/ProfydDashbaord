// app/api/training/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Check department
  if (session.user.user_metadata?.department !== 'T&D') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Proceed with data fetch
  const { data } = await supabase
    .from('interviews')
    .select('*')
  
  return NextResponse.json(data)
}