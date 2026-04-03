import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email, code, token } = await request.json()

    if (!email || !code || !token) {
      return NextResponse.json(
        { error: 'Email, code and token required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: resetData, error: fetchError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (fetchError || !resetData) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    const { error: usedError } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetData.id)

    if (usedError) {
      return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
    }

    const resetSessionToken = randomBytes(32).toString('hex')
    const sessionExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: sessionInsertError } = await supabase
      .from('password_reset_sessions')
      .insert({
        email,
        token: resetSessionToken,
        expires_at: sessionExpiry,
        used: false,
      })

    if (sessionInsertError) {
      return NextResponse.json({ error: 'Failed to create reset session' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      resetSessionToken,
    })
  } catch (error: any) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}