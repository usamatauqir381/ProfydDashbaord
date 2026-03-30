import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, code, token } = await request.json()
    
    if (!email || !code || !token) {
      return NextResponse.json(
        { error: 'Email, code, and token are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verify the code
    const { data: resetData, error: verifyError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (verifyError || !resetData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Code verified successfully' 
    })
    
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}