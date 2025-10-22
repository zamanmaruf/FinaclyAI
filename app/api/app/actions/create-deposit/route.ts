import { NextRequest, NextResponse } from 'next/server'
import { QBOActionsExecutor } from '@/lib/services/actions/qbo-executor'
import { generateIdempotencyFingerprint } from '@/lib/db-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, userId, payload, idempotencyKey } = body

    if (!companyId || !userId || !payload) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: companyId, userId, payload' },
        { status: 400 }
      )
    }

    // Generate idempotency fingerprint if not provided
    const fingerprint = idempotencyKey || generateIdempotencyFingerprint(
      companyId,
      'create_deposit',
      [payload.DocNumber || 'unknown'],
      [payload.Line?.[0]?.Amount || 0],
      [payload.TxnDate || new Date().toISOString().split('T')[0]]
    )

    // Check for existing execution
    const { checkIdempotency } = await import('@/lib/db-utils')
    const isDuplicate = await checkIdempotency(fingerprint)
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: 'Duplicate request detected', idempotencyKey: fingerprint },
        { status: 409 }
      )
    }

    console.log(`🔄 Creating QBO deposit for company ${companyId}`)

    const executor = new QBOActionsExecutor()
    const result = await executor.createDeposit(payload, companyId, userId)

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        qboId: result.qboId,
        type: result.type,
        amount: result.amount,
        currency: result.currency,
        txnDate: result.txnDate,
        externalRef: result.externalRef,
        idempotencyKey: fingerprint
      },
      message: 'Deposit created successfully'
    })

  } catch (error: any) {
    console.error('Error creating deposit:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create deposit', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}