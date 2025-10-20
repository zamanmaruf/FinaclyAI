import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import OAuthClient from 'intuit-oauth'

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

    // Get QuickBooks credentials
    const credentialsResult = await query(
      'SELECT encrypted_credentials FROM api_credentials WHERE company_id = $1 AND service = $2 AND is_active = true',
      [companyId, 'quickbooks']
    )

    if (credentialsResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'QuickBooks not connected. Please connect your QuickBooks account first.' },
        { status: 400 }
      )
    }

    const credentials = JSON.parse(credentialsResult.rows[0].encrypted_credentials)
    const tokenData = JSON.parse(decrypt(credentials.tokens))
    const realmId = credentials.realm_id

    // Initialize OAuth client
    const oauthClient = new OAuthClient({
      clientId: process.env.QBO_CLIENT_ID!,
      clientSecret: process.env.QBO_CLIENT_SECRET!,
      environment: process.env.INTUIT_ENV as 'sandbox' | 'production' || 'sandbox',
      redirectUri: process.env.QBO_REDIRECT_URI!
    })

    // Set the tokens
    oauthClient.setToken(tokenData)

    // Set default date range if not provided (last 30 days)
    const defaultEndDate = new Date()
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)

    const syncStartDate = startDate ? new Date(startDate) : defaultStartDate
    const syncEndDate = endDate ? new Date(endDate) : defaultEndDate

    // Format dates for QuickBooks API (YYYY-MM-DD)
    const qbStartDate = syncStartDate.toISOString().split('T')[0]
    const qbEndDate = syncEndDate.toISOString().split('T')[0]

    // Record sync start
    const syncHistoryId = await query(`
      INSERT INTO sync_history (company_id, service, sync_type, status, started_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
    `, [companyId, 'quickbooks', 'full', 'started'])

    let paymentsCount = 0
    let depositsCount = 0
    let invoicesCount = 0
    let salesReceiptsCount = 0
    let errors: string[] = []

    try {
      // Sync Payments
      console.log(`🔄 Syncing QuickBooks payments for company ${companyId}`)
      
      const paymentsQuery = `SELECT * FROM Payment WHERE TxnDate >= '${qbStartDate}' AND TxnDate <= '${qbEndDate}'`
      const paymentsResponse = await oauthClient.makeApiCall({
        url: `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent(paymentsQuery)}`,
        method: 'GET'
      })

      if (paymentsResponse.json && paymentsResponse.json.QueryResponse && paymentsResponse.json.QueryResponse.Payment) {
        const payments = Array.isArray(paymentsResponse.json.QueryResponse.Payment) 
          ? paymentsResponse.json.QueryResponse.Payment 
          : [paymentsResponse.json.QueryResponse.Payment]

        for (const payment of payments) {
          try {
            await query(`
              INSERT INTO qbo_transactions (
                id, company_id, type, amount, currency, txn_date, 
                customer_ref, memo, status, created_at, imported_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO UPDATE SET
                amount = EXCLUDED.amount,
                status = EXCLUDED.status,
                imported_at = CURRENT_TIMESTAMP
            `, [
              payment.Id,
              companyId,
              'payment',
              payment.TotalAmt,
              'USD', // QuickBooks typically uses USD
              payment.TxnDate,
              payment.CustomerRef?.value,
              payment.PrivateNote,
              payment.SyncToken ? 'active' : 'pending',
              payment.MetaData?.CreateTime
            ])
            paymentsCount++
          } catch (paymentError) {
            console.error(`Error inserting payment ${payment.Id}:`, paymentError)
            errors.push(`Failed to import payment ${payment.Id}`)
          }
        }
      }

      // Sync Deposits
      console.log(`🔄 Syncing QuickBooks deposits for company ${companyId}`)
      
      const depositsQuery = `SELECT * FROM Deposit WHERE TxnDate >= '${qbStartDate}' AND TxnDate <= '${qbEndDate}'`
      const depositsResponse = await oauthClient.makeApiCall({
        url: `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent(depositsQuery)}`,
        method: 'GET'
      })

      if (depositsResponse.json && depositsResponse.json.QueryResponse && depositsResponse.json.QueryResponse.Deposit) {
        const deposits = Array.isArray(depositsResponse.json.QueryResponse.Deposit) 
          ? depositsResponse.json.QueryResponse.Deposit 
          : [depositsResponse.json.QueryResponse.Deposit]

        for (const deposit of deposits) {
          try {
            await query(`
              INSERT INTO qbo_transactions (
                id, company_id, type, amount, currency, txn_date, 
                customer_ref, memo, status, created_at, imported_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO UPDATE SET
                amount = EXCLUDED.amount,
                status = EXCLUDED.status,
                imported_at = CURRENT_TIMESTAMP
            `, [
              deposit.Id,
              companyId,
              'deposit',
              deposit.TotalAmt,
              'USD',
              deposit.TxnDate,
              deposit.CustomerRef?.value,
              deposit.PrivateNote,
              deposit.SyncToken ? 'active' : 'pending',
              deposit.MetaData?.CreateTime
            ])
            depositsCount++
          } catch (depositError) {
            console.error(`Error inserting deposit ${deposit.Id}:`, depositError)
            errors.push(`Failed to import deposit ${deposit.Id}`)
          }
        }
      }

      // Sync Invoices
      console.log(`🔄 Syncing QuickBooks invoices for company ${companyId}`)
      
      const invoicesQuery = `SELECT * FROM Invoice WHERE Balance > '0' AND TxnDate >= '${qbStartDate}' AND TxnDate <= '${qbEndDate}'`
      const invoicesResponse = await oauthClient.makeApiCall({
        url: `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent(invoicesQuery)}`,
        method: 'GET'
      })

      if (invoicesResponse.json && invoicesResponse.json.QueryResponse && invoicesResponse.json.QueryResponse.Invoice) {
        const invoices = Array.isArray(invoicesResponse.json.QueryResponse.Invoice) 
          ? invoicesResponse.json.QueryResponse.Invoice 
          : [invoicesResponse.json.QueryResponse.Invoice]

        for (const invoice of invoices) {
          try {
            await query(`
              INSERT INTO qbo_transactions (
                id, company_id, type, amount, currency, txn_date, 
                customer_ref, memo, status, created_at, imported_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO UPDATE SET
                amount = EXCLUDED.amount,
                status = EXCLUDED.status,
                imported_at = CURRENT_TIMESTAMP
            `, [
              invoice.Id,
              companyId,
              'invoice',
              invoice.Balance,
              'USD',
              invoice.TxnDate,
              invoice.CustomerRef?.value,
              invoice.PrivateNote,
              'unpaid',
              invoice.MetaData?.CreateTime
            ])
            invoicesCount++
          } catch (invoiceError) {
            console.error(`Error inserting invoice ${invoice.Id}:`, invoiceError)
            errors.push(`Failed to import invoice ${invoice.Id}`)
          }
        }
      }

      // Sync Sales Receipts
      console.log(`🔄 Syncing QuickBooks sales receipts for company ${companyId}`)
      
      const salesReceiptsQuery = `SELECT * FROM SalesReceipt WHERE TxnDate >= '${qbStartDate}' AND TxnDate <= '${qbEndDate}'`
      const salesReceiptsResponse = await oauthClient.makeApiCall({
        url: `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent(salesReceiptsQuery)}`,
        method: 'GET'
      })

      if (salesReceiptsResponse.json && salesReceiptsResponse.json.QueryResponse && salesReceiptsResponse.json.QueryResponse.SalesReceipt) {
        const salesReceipts = Array.isArray(salesReceiptsResponse.json.QueryResponse.SalesReceipt) 
          ? salesReceiptsResponse.json.QueryResponse.SalesReceipt 
          : [salesReceiptsResponse.json.QueryResponse.SalesReceipt]

        for (const salesReceipt of salesReceipts) {
          try {
            await query(`
              INSERT INTO qbo_transactions (
                id, company_id, type, amount, currency, txn_date, 
                customer_ref, memo, status, created_at, imported_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO UPDATE SET
                amount = EXCLUDED.amount,
                status = EXCLUDED.status,
                imported_at = CURRENT_TIMESTAMP
            `, [
              salesReceipt.Id,
              companyId,
              'salesreceipt',
              salesReceipt.TotalAmt,
              'USD',
              salesReceipt.TxnDate,
              salesReceipt.CustomerRef?.value,
              salesReceipt.PrivateNote,
              salesReceipt.SyncToken ? 'active' : 'pending',
              salesReceipt.MetaData?.CreateTime
            ])
            salesReceiptsCount++
          } catch (salesReceiptError) {
            console.error(`Error inserting sales receipt ${salesReceipt.Id}:`, salesReceiptError)
            errors.push(`Failed to import sales receipt ${salesReceipt.Id}`)
          }
        }
      }

      // Update sync history
      await query(`
        UPDATE sync_history 
        SET status = $1, records_fetched = $2, completed_at = CURRENT_TIMESTAMP, error_message = $3
        WHERE id = $4
      `, [
        errors.length > 0 ? 'completed_with_errors' : 'completed',
        paymentsCount + depositsCount + invoicesCount + salesReceiptsCount,
        errors.length > 0 ? errors.join('; ') : null,
        syncHistoryId.rows[0].id
      ])

      console.log(`✅ QuickBooks sync completed: ${paymentsCount} payments, ${depositsCount} deposits, ${invoicesCount} invoices, ${salesReceiptsCount} sales receipts`)

      return NextResponse.json({
        success: true,
        message: 'QuickBooks sync completed successfully',
        data: {
          paymentsCount,
          depositsCount,
          invoicesCount,
          salesReceiptsCount,
          errors: errors.length > 0 ? errors : undefined,
          dateRange: {
            start: syncStartDate.toISOString(),
            end: syncEndDate.toISOString()
          }
        }
      })

    } catch (syncError: any) {
      console.error('QuickBooks sync error:', syncError)
      
      // Update sync history with error
      await query(`
        UPDATE sync_history 
        SET status = $1, completed_at = CURRENT_TIMESTAMP, error_message = $2
        WHERE id = $3
      `, ['failed', syncError.message, syncHistoryId.rows[0].id])

      return NextResponse.json(
        { error: 'Failed to sync QuickBooks data', details: syncError.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in QuickBooks sync:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
