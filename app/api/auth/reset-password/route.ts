import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'
import { createAdminClient } from '@/lib/supabase/admin'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if user exists in Supabase Auth
    let userExists = false
    try {
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) {
        console.error('listUsers error:', error)
      } else {
        userExists = data.users.some((u) => u.email?.toLowerCase() === email.toLowerCase())
      }
    } catch (err) {
      console.error('User lookup error:', err)
    }

    // Always return success for security, even if user does not exist
    if (!userExists) {
      return NextResponse.json({ success: true, token: 'mock-token' })
    }

    // Remove old unused tokens for this email
    const { error: deleteError } = await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', email)
      .eq('used', false)

    if (deleteError) {
      console.error('Delete old tokens error:', deleteError)
    }

    const code = generateCode()
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email,
        code,
        token,
        expires_at: expiresAt,
        used: false,
      })

    if (insertError) {
      console.error('Insert reset token error:', insertError)
      return NextResponse.json({ error: 'Failed to create reset request' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.verify()

    await transporter.sendMail({
      from: `"App Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Use the code below:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px;">
            ${code}
          </div>
          <p>This code expires in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}