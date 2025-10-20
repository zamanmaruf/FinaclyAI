import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { decrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { exceptionId, fixType } = body

    if (!exceptionId) {
      return NextResponse.json(
        { error: 'Exception ID is required' },
        { status: 400 }
      )
    }

    // Get exception details
    const exceptionResult = await query(
      'SELECT * FROM exceptions WHERE id = $1 AND company_id = $2 AND status = $3',
      [exceptionId, 1, 'open']
    )

    if (exceptionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Exception not found or already resolved' },
        { status: 404 }
      )
    }

    const exception = exceptionResult.rows[0]

    // Handle different fix types
    if (fixType === 'create_qbo_entry' && exception.exception_type === 'stripe_charge') {
      // Get Stripe charge details - try to find a Stripe charge ID
      let stripeId = exception.related_stripe_id || body.relatedStripeId
      
      // If no Stripe ID is stored, try to find one from recent charges
      if (!stripeId) {
        // Look for a recent Stripe charge that matches the amount and date from description
        const amountMatch = exception.description.match(/\$(\d+\.?\d*)/)
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1])
          const chargeResult = await query(
            'SELECT id FROM stripe_charges WHERE company_id = $1 AND amount = $2 ORDER BY created_at DESC LIMIT 1',
            [1, amount] // Amount is already in dollars
          )
          if (chargeResult.rows.length > 0) {
            stripeId = chargeResult.rows[0].id
          }
        }
      }
      
      if (!stripeId) {
        return NextResponse.json(
          { error: 'No Stripe charge ID found for this exception' },
          { status: 400 }
        )
      }
      const chargeResult = await query(
        'SELECT * FROM stripe_charges WHERE id = $1 AND company_id = $2',
        [stripeId, 1]
      )

      if (chargeResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Stripe charge not found' },
          { status: 404 }
        )
      }

      const charge = chargeResult.rows[0]

      // Get QuickBooks credentials
      const qboCredentialsResult = await query(
        'SELECT encrypted_credentials FROM api_credentials WHERE company_id = $1 AND service = $2 AND is_active = true',
        [1, 'quickbooks']
      )

      if (qboCredentialsResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'QuickBooks not connected. Please connect QuickBooks first.' },
          { status: 400 }
        )
      }

      // For now, we'll create a simple QBO transaction record
      // In a real implementation, you'd call the QuickBooks API
      const qboTransactionId = `qbo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Insert QBO transaction
      await query(`
        INSERT INTO qbo_transactions (
          id, company_id, type, amount, currency, txn_date, memo, status, created_at, imported_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        qboTransactionId,
        1,
        'SalesReceipt',
        charge.amount,
        charge.currency,
        charge.created_at,
        `Stripe charge ${charge.id} - Auto-created by Finacly AI`,
        'active'
      ])

      // Create transaction match
      await query(`
        INSERT INTO transaction_matches (
          company_id, stripe_charge_id, qbo_transaction_id, match_confidence, match_type, matched_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [
        1,
        charge.id,
        qboTransactionId,
        100,
        'auto_fix'
      ])

      // Mark exception as resolved
      await query(
        'UPDATE exceptions SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['resolved', exceptionId]
      )

      return NextResponse.json({
        success: true,
        message: 'Exception fixed successfully',
        data: {
          exceptionId,
          qboTransactionId,
          matchCreated: true
        }
      })
    }

    // Handle qbo_transaction exceptions
    if (fixType === 'create_qbo_entry' && exception.exception_type === 'qbo_transaction') {
      // For QBO transaction exceptions, we need to find a matching Stripe charge
      // and create a match between them
      
      // Get the QBO transaction details - try to find QBO ID
      let qboId = exception.related_qbo_id || body.relatedQboId
      
      // If no QBO ID is stored, try to find one from recent transactions
      if (!qboId) {
        // Look for a recent QBO transaction that matches the amount from description
        const amountMatch = exception.description.match(/\$(\d+\.?\d*)/)
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1])
          const qboResult = await query(
            'SELECT id FROM qbo_transactions WHERE company_id = $1 AND amount = $2 ORDER BY created_at DESC LIMIT 1',
            [1, amount]
          )
          if (qboResult.rows.length > 0) {
            qboId = qboResult.rows[0].id
          }
        }
      }
      
      if (!qboId) {
        return NextResponse.json(
          { error: 'No QBO transaction ID found for this exception' },
          { status: 400 }
        )
      }

      const qboResult = await query(
        'SELECT * FROM qbo_transactions WHERE id = $1 AND company_id = $2',
        [qboId, 1]
      )

      if (qboResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'QBO transaction not found' },
          { status: 404 }
        )
      }

      const qboTransaction = qboResult.rows[0]

      // Try to find a matching Stripe charge by amount and date
      const stripeResult = await query(
        'SELECT * FROM stripe_charges WHERE company_id = $1 AND amount = $2 ORDER BY created_at DESC LIMIT 1',
        [1, qboTransaction.amount]
      )

      if (stripeResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'No matching Stripe charge found for this QBO transaction' },
          { status: 404 }
        )
      }

      const stripeCharge = stripeResult.rows[0]

      // Create transaction match
      await query(`
        INSERT INTO transaction_matches (
          company_id, stripe_charge_id, qbo_transaction_id, match_confidence, match_type, matched_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [
        1,
        stripeCharge.id,
        qboTransaction.id,
        100,
        'auto_fix'
      ])

      // Mark exception as resolved
      await query(
        'UPDATE exceptions SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['resolved', exceptionId]
      )

      return NextResponse.json({
        success: true,
        message: 'QBO transaction exception fixed successfully',
        data: {
          exceptionId,
          stripeChargeId: stripeCharge.id,
          qboTransactionId: qboTransaction.id,
          matchCreated: true
        }
      })
    }

    // Default case - try to fix based on exception type
    if (exception.exception_type === 'stripe_charge' && (exception.related_stripe_id || body.relatedStripeId)) {
      // Use the same logic as create_qbo_entry
      const stripeId = exception.related_stripe_id || body.relatedStripeId
      const chargeResult = await query(
        'SELECT * FROM stripe_charges WHERE id = $1 AND company_id = $2',
        [stripeId, 1]
      )

      if (chargeResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Stripe charge not found' },
          { status: 404 }
        )
      }

      const charge = chargeResult.rows[0]

      // Get QuickBooks credentials
      const qboCredentialsResult = await query(
        'SELECT encrypted_credentials FROM api_credentials WHERE company_id = $1 AND service = $2 AND is_active = true',
        [1, 'quickbooks']
      )

      if (qboCredentialsResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'QuickBooks not connected. Please connect QuickBooks first.' },
          { status: 400 }
        )
      }

      // Create QBO transaction record
      const qboTransactionId = `qbo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Insert QBO transaction
      await query(`
        INSERT INTO qbo_transactions (
          id, company_id, type, amount, currency, txn_date, memo, status, created_at, imported_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        qboTransactionId,
        1,
        'SalesReceipt',
        charge.amount,
        charge.currency,
        charge.created_at,
        `Stripe charge ${charge.id} - Auto-created by Finacly AI`,
        'active'
      ])

      // Create transaction match
      await query(`
        INSERT INTO transaction_matches (
          company_id, stripe_charge_id, qbo_transaction_id, match_confidence, match_type, matched_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [
        1,
        charge.id,
        qboTransactionId,
        100,
        'auto_fix'
      ])

      // Mark exception as resolved
      await query(
        'UPDATE exceptions SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['resolved', exceptionId]
      )

      return NextResponse.json({
        success: true,
        message: 'Exception fixed successfully',
        data: {
          exceptionId,
          qboTransactionId,
          matchCreated: true
        }
      })
    }

    // Handle bank_transaction exceptions
    if (fixType === 'create_qbo_entry' && exception.exception_type === 'bank_transaction') {
      // Get bank transaction ID
      let bankId = exception.related_bank_id || body.relatedBankId
      
      // If no bank ID, extract amount from description and find matching transaction
      if (!bankId) {
        const amountMatch = exception.description.match(/\$(\d+\.?\d*)/)
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1])
          const bankResult = await query(
            'SELECT id FROM bank_transactions WHERE company_id = $1 AND amount = $2 ORDER BY date DESC LIMIT 1',
            [1, amount]
          )
          if (bankResult.rows.length > 0) {
            bankId = bankResult.rows[0].id
          }
        }
      }
      
      if (!bankId) {
        return NextResponse.json(
          { error: 'No bank transaction ID found for this exception' },
          { status: 400 }
        )
      }

      // Get bank transaction details
      const bankResult = await query(
        'SELECT * FROM bank_transactions WHERE id = $1 AND company_id = $2',
        [bankId, 1]
      )

      if (bankResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Bank transaction not found' },
          { status: 404 }
        )
      }

      const bankTransaction = bankResult.rows[0]
      
      // Determine if deposit or withdrawal based on amount sign or description
      const isDeposit = bankTransaction.amount > 0 || 
                        exception.description.toLowerCase().includes('deposit')
      
      let stripeChargeId = null
      let qboTransactionId = null
      
      if (isDeposit) {
        // For deposits: try to match with Stripe charge
        const stripeResult = await query(
          'SELECT id FROM stripe_charges WHERE company_id = $1 AND amount = $2 ORDER BY created_at DESC LIMIT 1',
          [1, Math.abs(bankTransaction.amount)]
        )
        if (stripeResult.rows.length > 0) {
          stripeChargeId = stripeResult.rows[0].id
        }
        
        // Also try to match with QBO transaction
        const qboResult = await query(
          'SELECT id FROM qbo_transactions WHERE company_id = $1 AND amount = $2 ORDER BY created_at DESC LIMIT 1',
          [1, Math.abs(bankTransaction.amount)]
        )
        if (qboResult.rows.length > 0) {
          qboTransactionId = qboResult.rows[0].id
        }
      } else {
        // For withdrawals: match with any QBO transaction (since we only have SalesReceipt types)
        const qboResult = await query(
          'SELECT id FROM qbo_transactions WHERE company_id = $1 AND amount = $2 ORDER BY created_at DESC LIMIT 1',
          [1, Math.abs(bankTransaction.amount)]
        )
        if (qboResult.rows.length > 0) {
          qboTransactionId = qboResult.rows[0].id
        }
      }
      
      // Create 3-way match (or 2-way if only some found)
      if (!stripeChargeId && !qboTransactionId) {
        return NextResponse.json(
          { error: 'No matching Stripe charge or QBO transaction found for this bank transaction' },
          { status: 404 }
        )
      }
      
      await query(`
        INSERT INTO transaction_matches (
          company_id, bank_transaction_id, stripe_charge_id, qbo_transaction_id, 
          match_confidence, match_type, matched_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      `, [
        1,
        bankTransaction.id,
        stripeChargeId,
        qboTransactionId,
        100,
        'auto_fix'
      ])

      // Mark exception as resolved
      await query(
        'UPDATE exceptions SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['resolved', exceptionId]
      )

      return NextResponse.json({
        success: true,
        message: 'Bank transaction exception fixed successfully',
        data: {
          exceptionId,
          bankTransactionId: bankTransaction.id,
          stripeChargeId,
          qboTransactionId,
          matchType: stripeChargeId && qboTransactionId ? '3-way' : '2-way',
          matchCreated: true
        }
      })
    }

    return NextResponse.json(
      { error: `Fix type "${fixType || 'default'}" not supported for exception type "${exception.exception_type}"` },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error fixing exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
