import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function POST(request: Request) {
  console.log('🔵 API called: /api/auth/reset-password')
  
  try {
    const { email } = await request.json()
    console.log('🔵 Email received:', email)
    
    if (!email) {
      console.log('🔴 No email provided')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('🔴 Invalid email format')
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    console.log('🔵 Supabase client created')
    
    const code = generateCode()
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    console.log('🔵 Generated code:', code)
    console.log('🔵 Generated token:', token)
    console.log('🔵 Expires at:', expiresAt)

    // Delete any existing unused tokens for this email
    const { error: deleteError } = await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', email)
      .eq('used', false)
    
    if (deleteError) {
      console.log('🔴 Delete error:', deleteError)
    } else {
      console.log('🔵 Existing tokens deleted')
    }

    // Store in database
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email,
        token,
        code,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      console.error('🔴 Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create reset request' },
        { status: 500 }
      )
    }

    console.log('🔵 Code stored in database')
    console.log('=========================================')
    console.log(`🔐 PASSWORD RESET CODE FOR ${email}: ${code}`)
    console.log('=========================================')

    return NextResponse.json({ 
      success: true, 
      message: 'Reset code sent to your email',
      token,
      devCode: code
    })
    
  } catch (error) {
    console.error('🔴 Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}