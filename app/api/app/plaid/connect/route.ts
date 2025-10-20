import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Check if Plaid is connected for this company
    const result = await query(
      'SELECT * FROM api_credentials WHERE company_id = $1 AND service = $2 AND is_active = true',
      [companyId, 'plaid']
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        connected: false,
        message: 'Plaid not connected'
      })
    }

    const credentials = result.rows[0]
    const credentialData = credentials.encrypted_credentials ? JSON.parse(credentials.encrypted_credentials) : null
    
    return NextResponse.json({
      connected: true,
      accounts: credentialData?.accounts || [],
      connectedAt: credentials.created_at,
      institutionId: credentialData?.institution_id
    })

  } catch (error) {
    console.error('Error checking Plaid connection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
