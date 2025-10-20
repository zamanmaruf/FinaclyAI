import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { PlaidApi, Configuration, PlaidEnvironments, TransactionsSyncRequest } from 'plaid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, cursor } = body

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Get Plaid credentials
    const credentialsResult = await query(
      'SELECT encrypted_credentials FROM api_credentials WHERE company_id = $1 AND service = $2 AND is_active = true',
      [companyId, 'plaid']
    )

    if (credentialsResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Plaid not connected. Please connect your bank account first.' },
        { status: 400 }
      )
    }

    const credentials = JSON.parse(credentialsResult.rows[0].encrypted_credentials)
    
    // Handle both encrypted and plain credentials
    let accessToken, accounts
    try {
      // Try to decrypt (for encrypted credentials)
      accessToken = decrypt(credentials.access_token)
      accounts = credentials.accounts
    } catch (error) {
      // If decryption fails, assume it's plain text (for development)
      console.log('Using plain text credentials (not encrypted)')
      accessToken = credentials.access_token
      accounts = credentials.accounts
    }
    
    console.log('Using access token:', accessToken.substring(0, 20) + '...')

    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    })

    const client = new PlaidApi(configuration)

    // Record sync start
    const syncHistoryId = await query(`
      INSERT INTO sync_history (company_id, service, sync_type, status, started_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
    `, [companyId, 'plaid', 'incremental', 'started'])

    let transactionsCount = 0
    let errors: string[] = []

    try {
      // Get the last cursor from database if not provided
      let lastCursor = cursor
      if (!lastCursor) {
        const cursorResult = await query(
          'SELECT plaid_cursor FROM api_credentials WHERE company_id = $1 AND service = $2',
          [companyId, 'plaid']
        )
        lastCursor = cursorResult.rows[0]?.plaid_cursor || ''
      }

      // Sync transactions using the recommended /transactions/sync endpoint
      console.log(`🔄 Syncing Plaid transactions for company ${companyId}`)
      
      const syncRequest: TransactionsSyncRequest = {
        access_token: accessToken,
        cursor: lastCursor,
        count: 500, // Maximum number of transactions to fetch
      }

      const response = await client.transactionsSync(syncRequest)
      
      // Process added transactions
      for (const transaction of response.data.added) {
        try {
          await query(`
            INSERT INTO bank_transactions (
              id, company_id, plaid_account_id, amount, currency, date, 
              name, merchant_name, category, pending, imported_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET
              amount = EXCLUDED.amount,
              pending = EXCLUDED.pending,
              imported_at = CURRENT_TIMESTAMP
          `, [
            transaction.transaction_id,
            companyId,
            transaction.account_id,
            transaction.amount, // Plaid returns amount as decimal
            transaction.iso_currency_code || 'USD',
            transaction.date,
            transaction.name,
            transaction.merchant_name,
            transaction.category ? transaction.category.join(', ') : null,
            transaction.pending
          ])
          transactionsCount++
        } catch (transactionError) {
          console.error(`Error inserting transaction ${transaction.transaction_id}:`, transactionError)
          errors.push(`Failed to import transaction ${transaction.transaction_id}`)
        }
      }

      // Process modified transactions
      for (const transaction of response.data.modified) {
        try {
          await query(`
            UPDATE bank_transactions 
            SET amount = $1, pending = $2, imported_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND company_id = $4
          `, [
            transaction.amount,
            transaction.pending,
            transaction.transaction_id,
            companyId
          ])
        } catch (transactionError) {
          console.error(`Error updating transaction ${transaction.transaction_id}:`, transactionError)
          errors.push(`Failed to update transaction ${transaction.transaction_id}`)
        }
      }

      // Process removed transactions
      for (const removedTransaction of response.data.removed) {
        try {
          await query(`
            DELETE FROM bank_transactions 
            WHERE id = $1 AND company_id = $2
          `, [removedTransaction.transaction_id, companyId])
        } catch (transactionError) {
          console.error(`Error removing transaction ${removedTransaction.transaction_id}:`, transactionError)
          errors.push(`Failed to remove transaction ${removedTransaction.transaction_id}`)
        }
      }

      // Update the cursor in credentials
      const newCursor = response.data.next_cursor
      if (newCursor) {
        await query(`
          UPDATE api_credentials 
          SET plaid_cursor = $1, updated_at = CURRENT_TIMESTAMP
          WHERE company_id = $2 AND service = $3
        `, [newCursor, companyId, 'plaid'])
      }

      // Update sync history
      await query(`
        UPDATE sync_history 
        SET status = $1, records_fetched = $2, completed_at = CURRENT_TIMESTAMP, error_message = $3
        WHERE id = $4
      `, [
        errors.length > 0 ? 'completed_with_errors' : 'completed',
        transactionsCount,
        errors.length > 0 ? errors.join('; ') : null,
        syncHistoryId.rows[0].id
      ])

      console.log(`✅ Plaid sync completed: ${transactionsCount} transactions processed`)

      return NextResponse.json({
        success: true,
        message: 'Plaid sync completed successfully',
        data: {
          transactionsCount,
          added: response.data.added.length,
          modified: response.data.modified.length,
          removed: response.data.removed.length,
          nextCursor: response.data.next_cursor,
          errors: errors.length > 0 ? errors : undefined
        }
      })

    } catch (syncError: any) {
      console.error('Plaid sync error:', syncError)
      
      // Update sync history with error
      await query(`
        UPDATE sync_history 
        SET status = $1, completed_at = CURRENT_TIMESTAMP, error_message = $2
        WHERE id = $3
      `, ['failed', syncError.message, syncHistoryId.rows[0].id])

      return NextResponse.json(
        { error: 'Failed to sync Plaid data', details: syncError.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in Plaid sync:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
