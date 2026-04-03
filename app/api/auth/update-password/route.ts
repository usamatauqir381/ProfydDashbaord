import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email, newPassword, resetSessionToken } = await request.json()

    if (!email || !newPassword || !resetSessionToken) {
      return NextResponse.json(
        { error: 'Email, new password and reset session token required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: session, error: sessionError } = await supabase
      .from('password_reset_sessions')
      .select('*')
      .eq('email', email)
      .eq('token', resetSessionToken)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired reset session' },
        { status: 400 }
      )
    }

    const { data, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('List users error:', listError)
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }

    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    const { error: markUsedError } = await supabase
      .from('password_reset_sessions')
      .update({ used: true })
      .eq('id', session.id)

    if (markUsedError) {
      console.error('Mark session used error:', markUsedError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}