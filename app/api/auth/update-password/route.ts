import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()
    
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in your custom users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    })
    
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}