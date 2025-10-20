import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendConfirmationEmail, sendSignupNotificationEmail } from '@/lib/email'
import crypto from 'crypto'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5

interface LeadData {
  email: string
  fullName: string
  companyName: string
  role: string
  companySize: string
  stackPsp: string[]
  stackLedger: string[]
  country: string
  phone?: string
}

// Check rate limit
async function checkRateLimit(ipAddress: string, email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW)
  
  try {
    const result = await query(
      `SELECT SUM(request_count) as total_requests 
       FROM rate_limits 
       WHERE (ip_address = $1 OR email = $2) 
       AND window_start > $3`,
      [ipAddress, email, windowStart]
    )
    
    const totalRequests = parseInt(result.rows[0]?.total_requests || '0')
    return totalRequests < RATE_LIMIT_MAX_REQUESTS
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return true // Allow request if rate limit check fails
  }
}

// Record rate limit
async function recordRateLimit(ipAddress: string, email: string) {
  try {
    await query(
      `INSERT INTO rate_limits (ip_address, email, endpoint, request_count, window_start)
       VALUES ($1, $2, 'lead', 1, CURRENT_TIMESTAMP)
       ON CONFLICT (ip_address, email, endpoint, window_start)
       DO UPDATE SET request_count = rate_limits.request_count + 1`,
      [ipAddress, email]
    )
  } catch (error) {
    console.error('Rate limit recording failed:', error)
  }
}

// Generate idempotency hash
function generateIdempotencyHash(email: string, campaign?: string): string {
  return crypto
    .createHash('sha256')
    .update(`${email}:${campaign || 'default'}`)
    .digest('hex')
}

export async function POST(request: NextRequest) {
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''
  
  try {
    const body: LeadData = await request.json()
    const { 
      email, 
      fullName, 
      companyName, 
      role, 
      companySize, 
      stackPsp, 
      stackLedger, 
      country, 
      phone 
    } = body

    // Validate required fields
    if (!email || !fullName || !companyName || !role || !companySize || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check rate limit
    const isWithinRateLimit = await checkRateLimit(ipAddress, email)
    if (!isWithinRateLimit) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Generate idempotency hash
    const idempotencyHash = generateIdempotencyHash(email)
    
    // Check for existing signup with same hash
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

    // Extract UTM parameters from request
    const url = new URL(request.url)
    const utmSource = url.searchParams.get('utm_source')
    const utmMedium = url.searchParams.get('utm_medium')
    const utmCampaign = url.searchParams.get('utm_campaign')
    const utmTerm = url.searchParams.get('utm_term')
    const utmContent = url.searchParams.get('utm_content')
    const referrer = request.headers.get('referer')

    // Insert new lead
    const result = await query(
      `INSERT INTO signups (
        email, full_name, company_name, role, company_size, 
        stack_psp, stack_ledger, country, phone,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        referrer, ip_address, user_agent, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP
      ) RETURNING id, created_at`,
      [
        email, fullName, companyName, role, companySize,
        stackPsp, stackLedger, country, phone,
        utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
        referrer, ipAddress, userAgent
      ]
    )

    // Record rate limit
    await recordRateLimit(ipAddress, email)

    // Send confirmation email to customer (don't fail if email fails)
    try {
      await sendConfirmationEmail(email, fullName)
    } catch (emailError) {
      console.error('Customer confirmation email failed:', emailError)
      // Continue - don't fail the signup if email fails
    }

    // Send notification email to finacly.ai.inc@gmail.com
    try {
      await sendSignupNotificationEmail({
        email,
        fullName,
        role,
        companyName,
        companySize,
        stackPsp,
        stackLedger,
        country,
        phone
      })
    } catch (emailError) {
      console.error('Notification email failed:', emailError)
      // Continue - don't fail the signup if notification email fails
    }

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: 'Successfully registered for early access!'
    })

  } catch (error) {
    console.error('Lead capture error:', error)
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
      true // Enable caching
    )
    return NextResponse.json({ count: parseInt(result.rows[0].count) })
  } catch (error) {
    console.error('Count error:', error)
    return NextResponse.json({ count: 0 })
  }
}
