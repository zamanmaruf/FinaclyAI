import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, startDate, endDate } = body

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Get Stripe credentials
    const credentialsResult = await query(
      'SELECT encrypted_credentials FROM api_credentials WHERE company_id = $1 AND service = $2 AND is_active = true',
      [companyId, 'stripe']
    )

    if (credentialsResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Stripe not connected. Please connect your Stripe account first.' },
        { status: 400 }
      )
    }

    const credentials = JSON.parse(credentialsResult.rows[0].encrypted_credentials)
    const apiKey = decrypt(credentials.api_key)

    // Initialize Stripe with company's API key
    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-09-30.clover',
    })

    // Set default date range if not provided (last 30 days)
    const defaultEndDate = new Date()
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)

    const syncStartDate = startDate ? new Date(startDate) : defaultStartDate
    const syncEndDate = endDate ? new Date(endDate) : defaultEndDate

    // Record sync start
    const syncHistoryId = await query(`
      INSERT INTO sync_history (company_id, service, sync_type, status, started_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
    `, [companyId, 'stripe', 'full', 'started'])

    let chargesCount = 0
    let payoutsCount = 0
    let errors: string[] = []

    try {
      // Sync Charges
      console.log(`🔄 Syncing Stripe charges for company ${companyId} from ${syncStartDate.toISOString()} to ${syncEndDate.toISOString()}`)
      
      const charges = await stripe.charges.list({
        created: {
          gte: Math.floor(syncStartDate.getTime() / 1000),
          lte: Math.floor(syncEndDate.getTime() / 1000),
        },
        limit: 100,
      })

      for (const charge of charges.data) {
        try {
          await query(`
            INSERT INTO stripe_charges (
              id, company_id, amount, currency, fee, net, customer_id, 
              description, payout_id, status, created_at, imported_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, to_timestamp($11), CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET
              amount = EXCLUDED.amount,
              fee = EXCLUDED.fee,
              net = EXCLUDED.net,
              status = EXCLUDED.status,
              payout_id = EXCLUDED.payout_id,
              imported_at = CURRENT_TIMESTAMP
          `, [
            charge.id,
            companyId,
            charge.amount / 100, // Convert from cents
            charge.currency,
            charge.application_fee_amount ? charge.application_fee_amount / 100 : null,
            charge.amount - (charge.application_fee_amount || 0) / 100,
            charge.customer as string,
            charge.description,
            charge.transfer_data?.destination as string,
            charge.status,
            charge.created
          ])
          chargesCount++
        } catch (chargeError) {
          console.error(`Error inserting charge ${charge.id}:`, chargeError)
          errors.push(`Failed to import charge ${charge.id}`)
        }
      }

      // Sync Payouts
      console.log(`🔄 Syncing Stripe payouts for company ${companyId}`)
      
      const payouts = await stripe.payouts.list({
        created: {
          gte: Math.floor(syncStartDate.getTime() / 1000),
          lte: Math.floor(syncEndDate.getTime() / 1000),
        },
        limit: 100,
      })

      for (const payout of payouts.data) {
        try {
          await query(`
            INSERT INTO stripe_payouts (
              id, company_id, amount, currency, arrival_date, status, created_at, imported_at
            ) VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7), CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET
              amount = EXCLUDED.amount,
              status = EXCLUDED.status,
              arrival_date = EXCLUDED.arrival_date,
              imported_at = CURRENT_TIMESTAMP
          `, [
            payout.id,
            companyId,
            payout.amount / 100, // Convert from cents
            payout.currency,
            new Date(payout.arrival_date * 1000).toISOString().split('T')[0], // Convert to date
            payout.status,
            payout.created
          ])

          // Also fetch balance transactions for this payout to link charges
          try {
            const balanceTransactions = await stripe.balanceTransactions.list({
              payout: payout.id,
              limit: 100,
            })

            for (const bt of balanceTransactions.data) {
              if (bt.source && typeof bt.source === 'object' && 'id' in bt.source) {
                // Update the charge with the payout ID
                await query(`
                  UPDATE stripe_charges 
                  SET payout_id = $1 
                  WHERE id = $2 AND company_id = $3
                `, [payout.id, bt.source.id as string, companyId])
              }
            }
          } catch (btError) {
            console.error(`Error fetching balance transactions for payout ${payout.id}:`, btError)
          }

          payoutsCount++
        } catch (payoutError) {
          console.error(`Error inserting payout ${payout.id}:`, payoutError)
          errors.push(`Failed to import payout ${payout.id}`)
        }
      }

      // Update sync history
      await query(`
        UPDATE sync_history 
        SET status = $1, records_fetched = $2, completed_at = CURRENT_TIMESTAMP, error_message = $3
        WHERE id = $4
      `, [
        errors.length > 0 ? 'completed_with_errors' : 'completed',
        chargesCount + payoutsCount,
        errors.length > 0 ? errors.join('; ') : null,
        syncHistoryId.rows[0].id
      ])

      console.log(`✅ Stripe sync completed: ${chargesCount} charges, ${payoutsCount} payouts`)

      return NextResponse.json({
        success: true,
        message: 'Stripe sync completed successfully',
        data: {
          chargesCount,
          payoutsCount,
          errors: errors.length > 0 ? errors : undefined,
          dateRange: {
            start: syncStartDate.toISOString(),
            end: syncEndDate.toISOString()
          }
        }
      })

    } catch (syncError) {
      console.error('Stripe sync error:', syncError)
      
      // Update sync history with error
      await query(`
        UPDATE sync_history 
        SET status = $1, completed_at = CURRENT_TIMESTAMP, error_message = $2
        WHERE id = $3
        `, ['failed', (syncError as Error).message, syncHistoryId.rows[0].id])

      return NextResponse.json(
        { error: 'Failed to sync Stripe data', details: (syncError as Error).message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in Stripe sync:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
