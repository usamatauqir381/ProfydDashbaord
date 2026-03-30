import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: []
  }

  try {
    // Step 1: Check environment
    results.steps.push({
      step: 'Environment Check',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    })

    // Step 2: Create client with SSR
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    results.steps.push({ step: 'Client created', success: true })

    // Step 3: Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    results.steps.push({
      step: 'Auth check',
      authenticated: !!user,
      user: user?.email,
      error: authError?.message
    })

    // Step 4: Try to query the monthly_training_summary table
    const { data, error, status } = await supabase
      .from('monthly_training_summary')
      .select('count', { count: 'exact', head: true })

    results.steps.push({
      step: 'Table query',
      status,
      success: !error,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      } : null,
      hasData: !!data
    })

    // Step 5: Try to list tables (requires higher privileges)
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5)

    results.steps.push({
      step: 'List tables',
      success: !tablesError,
      tables: tables?.map(t => t.table_name),
      error: tablesError?.message
    })

  } catch (error: any) {
    results.error = {
      message: error.message,
      stack: error.stack
    }
  }

  return NextResponse.json(results)
}