import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fullName, companyName, currentTools, referralSource } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists (with caching for performance)
    const existingSignup = await query(
      'SELECT id FROM signups WHERE email = $1',
      [email],
      true // Enable caching for this read operation
    )

    if (existingSignup.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Insert new signup
    const result = await query(
      `INSERT INTO signups (email, full_name, company_name, current_tools, referral_source)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [email, fullName, companyName, currentTools, referralSource]
    )

    // Send confirmation email (don't fail if email fails)
    try {
      await sendConfirmationEmail(email, fullName)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Continue - don't fail the signup if email fails
    }

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: 'Successfully registered for early access!'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM signups',
      [],
      true // Enable caching for this read operation
    )
    return NextResponse.json({ count: parseInt(result.rows[0].count) })
  } catch (error) {
    console.error('Count error:', error)
    return NextResponse.json({ count: 0 })
  }
}
