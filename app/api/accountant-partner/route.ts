import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendConfirmationEmail, sendSignupNotificationEmail } from '@/lib/email'

interface AccountantPartnerData {
  email: string
  fullName: string
  companyName: string
  role: string
  companySize: string
  clientCount: string
  verticals: string[]
  qboProAdvisor: boolean
  timeline: string
  country: string
  phone?: string
}

export async function POST(request: NextRequest) {
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''
  
  try {
    const body: AccountantPartnerData = await request.json()
    const { 
      email, 
      fullName, 
      companyName, 
      role, 
      companySize,
      clientCount,
      verticals,
      qboProAdvisor,
      timeline,
      country,
      phone
    } = body

    // Validate required fields
    if (!email || !fullName || !companyName || !role || !companySize || !clientCount || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for existing signup
    const existingSignup = await query(
      'SELECT id FROM signups WHERE email = $1',
      [email]
    )

    if (existingSignup.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Extract UTM parameters
    const url = new URL(request.url)
    const utmSource = url.searchParams.get('utm_source')
    const utmMedium = url.searchParams.get('utm_medium')
    const utmCampaign = url.searchParams.get('utm_campaign')
    const referrer = request.headers.get('referer')

    // Insert accountant partner signup
    const result = await query(
      `INSERT INTO signups (
        email, full_name, company_name, role, company_size, 
        country, phone, utm_source, utm_medium, utm_campaign,
        referrer, ip_address, user_agent, created_at,
        current_tools, referral_source
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP,
        $14, $15
      ) RETURNING id, created_at`,
      [
        email, fullName, companyName, role, companySize,
        country, phone, utmSource, utmMedium, utmCampaign,
        referrer, ipAddress, userAgent,
        JSON.stringify({
          clientCount,
          verticals,
          qboProAdvisor,
          timeline,
          partnerProgram: true
        }),
        'accountant_partner'
      ]
    )

    // Send confirmation email to customer
    try {
      await sendConfirmationEmail(email, fullName)
    } catch (emailError) {
      console.error('Customer confirmation email failed:', emailError)
    }

    // Send notification email to finacly.ai.inc@gmail.com
    try {
      await sendSignupNotificationEmail({
        email,
        fullName,
        role: 'Accountant Partner',
        companyName,
        companySize: clientCount,
        stackPsp: [],
        stackLedger: ['QuickBooks Online'],
        country: 'Canada', // Default for accountant partners
        phone
      })
    } catch (emailError) {
      console.error('Notification email failed:', emailError)
    }

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: 'Successfully registered for the Accountant Partner Program!'
    })

  } catch (error) {
    console.error('Accountant partner signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
