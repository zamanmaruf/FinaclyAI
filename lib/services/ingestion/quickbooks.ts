import { query } from '../../db-utils'
import { ConnectionManager } from '../connections'

export interface QBOObject {
  id: string
  type: 'Deposit' | 'Payment' | 'Invoice' | 'Journal' | 'Transfer' | 'Bill' | 'BillPayment'
  txnDate: string
  amount: number
  currency: string
  memo?: string
  externalRef?: string
  rawData: any
}

export class QBOIngestionService {
  private connectionManager: ConnectionManager

  constructor() {
    this.connectionManager = ConnectionManager.getInstance()
  }

  // Ingest deposits
  async ingestDeposits(companyId: string, since?: Date): Promise<number> {
    try {
      const connection = await this.connectionManager.getActiveConnection(companyId, 'qbo')
      if (!connection) {
        throw new Error('No active QuickBooks connection found')
      }

      const qboClient = this.createQBOClient(connection.authData)
      const realmId = connection.authData.realmId

      console.log(`🔄 Starting QBO deposits ingestion for company ${companyId}`)

      let totalIngested = 0
      let startPosition = 1
      const maxResults = 500

      while (true) {
        const query = this.buildDepositsQuery(since)
        const response = await qboClient.query({
          sql: query,
          startPosition,
          maxResults
        })

        if (!response.QueryResponse || !response.QueryResponse.Deposit) {
          break
        }

        const deposits = Array.isArray(response.QueryResponse.Deposit) 
          ? response.QueryResponse.Deposit 
          : [response.QueryResponse.Deposit]

        for (const deposit of deposits) {
          await this.storeQBOObject(companyId, 'Deposit', deposit)
          totalIngested++
        }

        if (deposits.length < maxResults) {
          break
        }

        startPosition += maxResults
        console.log(`📊 Ingested ${deposits.length} deposits (total: ${totalIngested})`)
      }

      // Update connection last synced
      await this.connectionManager.updateLastSynced(connection.id)

      console.log(`✅ QBO deposits ingestion complete: ${totalIngested} deposits`)
      return totalIngested

    } catch (error) {
      console.error('Error ingesting QBO deposits:', error)
      throw error
    }
  }

  // Ingest payments
  async ingestPayments(companyId: string, since?: Date): Promise<number> {
    try {
      const connection = await this.connectionManager.getActiveConnection(companyId, 'qbo')
      if (!connection) {
        throw new Error('No active QuickBooks connection found')
      }

      const qboClient = this.createQBOClient(connection.authData)
      const realmId = connection.authData.realmId

      console.log(`🔄 Starting QBO payments ingestion for company ${companyId}`)

      let totalIngested = 0
      let startPosition = 1
      const maxResults = 500

      while (true) {
        const query = this.buildPaymentsQuery(since)
        const response = await qboClient.query({
          sql: query,
          startPosition,
          maxResults
        })

        if (!response.QueryResponse || !response.QueryResponse.Payment) {
          break
        }

        const payments = Array.isArray(response.QueryResponse.Payment) 
          ? response.QueryResponse.Payment 
          : [response.QueryResponse.Payment]

        for (const payment of payments) {
          await this.storeQBOObject(companyId, 'Payment', payment)
          totalIngested++
        }

        if (payments.length < maxResults) {
          break
        }

        startPosition += maxResults
        console.log(`📊 Ingested ${payments.length} payments (total: ${totalIngested})`)
      }

      console.log(`✅ QBO payments ingestion complete: ${totalIngested} payments`)
      return totalIngested

    } catch (error) {
      console.error('Error ingesting QBO payments:', error)
      throw error
    }
  }

  // Ingest invoices (V1 feature)
  async ingestInvoices(companyId: string, since?: Date): Promise<number> {
    try {
      const connection = await this.connectionManager.getActiveConnection(companyId, 'qbo')
      if (!connection) {
        throw new Error('No active QuickBooks connection found')
      }

      const qboClient = this.createQBOClient(connection.authData)
      const realmId = connection.authData.realmId

      console.log(`🔄 Starting QBO invoices ingestion for company ${companyId}`)

      let totalIngested = 0
      let startPosition = 1
      const maxResults = 500

      while (true) {
        const query = this.buildInvoicesQuery(since)
        const response = await qboClient.query({
          sql: query,
          startPosition,
          maxResults
        })

        if (!response.QueryResponse || !response.QueryResponse.Invoice) {
          break
        }

        const invoices = Array.isArray(response.QueryResponse.Invoice) 
          ? response.QueryResponse.Invoice 
          : [response.QueryResponse.Invoice]

        for (const invoice of invoices) {
          await this.storeQBOObject(companyId, 'Invoice', invoice)
          totalIngested++
        }

        if (invoices.length < maxResults) {
          break
        }

        startPosition += maxResults
        console.log(`📊 Ingested ${invoices.length} invoices (total: ${totalIngested})`)
      }

      console.log(`✅ QBO invoices ingestion complete: ${totalIngested} invoices`)
      return totalIngested

    } catch (error) {
      console.error('Error ingesting QBO invoices:', error)
      throw error
    }
  }

  // Build deposits query
  private buildDepositsQuery(since?: Date): string {
    let query = `
      SELECT Id, TxnDate, TotalAmt, PrivateNote, DocNumber, 
             DepositToAccountRef, Line, MetaData
      FROM Deposit 
      WHERE Active = true
    `

    if (since) {
      const sinceStr = since.toISOString().split('T')[0]
      query += ` AND TxnDate >= '${sinceStr}'`
    }

    query += ' ORDER BY TxnDate DESC'
    return query
  }

  // Build payments query
  private buildPaymentsQuery(since?: Date): string {
    let query = `
      SELECT Id, TxnDate, TotalAmt, PrivateNote, DocNumber,
             CustomerRef, PaymentMethodRef, Line, MetaData
      FROM Payment 
      WHERE Active = true
    `

    if (since) {
      const sinceStr = since.toISOString().split('T')[0]
      query += ` AND TxnDate >= '${sinceStr}'`
    }

    query += ' ORDER BY TxnDate DESC'
    return query
  }

  // Build invoices query
  private buildInvoicesQuery(since?: Date): string {
    let query = `
      SELECT Id, TxnDate, TotalAmt, PrivateNote, DocNumber,
             CustomerRef, Line, MetaData, Balance
      FROM Invoice 
      WHERE Active = true
    `

    if (since) {
      const sinceStr = since.toISOString().split('T')[0]
      query += ` AND TxnDate >= '${sinceStr}'`
    }

    query += ' ORDER BY TxnDate DESC'
    return query
  }

  // Store QBO object in database
  private async storeQBOObject(companyId: string, objType: string, obj: any): Promise<void> {
    try {
      // Extract amount (convert to cents)
      const amount = Math.round((obj.TotalAmt || 0) * 100)
      
      // Extract currency (default to CAD if not specified)
      const currency = obj.CurrencyRef?.value || 'CAD'
      
      // Extract external reference from DocNumber or PrivateNote
      const externalRef = obj.DocNumber || this.extractExternalRef(obj.PrivateNote)
      
      // Extract memo
      const memo = obj.PrivateNote || ''

      await query(`
        INSERT INTO qbo_objects (
          company_id, obj_type, qbo_id, txn_date, amount, currency,
          memo, external_ref, raw_jsonb, imported_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (company_id, qbo_id) DO UPDATE SET
          obj_type = EXCLUDED.obj_type,
          txn_date = EXCLUDED.txn_date,
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          memo = EXCLUDED.memo,
          external_ref = EXCLUDED.external_ref,
          raw_jsonb = EXCLUDED.raw_jsonb,
          imported_at = CURRENT_TIMESTAMP
      `, [
        companyId,
        objType,
        obj.Id,
        obj.TxnDate,
        amount,
        currency,
        memo,
        externalRef,
        JSON.stringify(obj)
      ])
    } catch (error) {
      console.error('Error storing QBO object:', error)
      throw error
    }
  }

  // Extract external reference from memo/note
  private extractExternalRef(memo: string): string | null {
    if (!memo) return null
    
    // Look for patterns like "stripe_payout:po_123" or "payout:po_123"
    const patterns = [
      /stripe_payout:([a-zA-Z0-9_]+)/i,
      /payout:([a-zA-Z0-9_]+)/i,
      /external_ref:([a-zA-Z0-9_]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = memo.match(pattern)
      if (match) {
        return match[1]
      }
    }
    
    return null
  }

  // Create QBO client
  private createQBOClient(authData: any): any {
    const OAuthClient = require('intuit-oauth')
    const oauthClient = new OAuthClient({
      clientId: process.env.INTUIT_CLIENT_ID,
      clientSecret: process.env.INTUIT_CLIENT_SECRET,
      environment: process.env.INTUIT_ENVIRONMENT || 'sandbox',
      redirectUri: process.env.INTUIT_REDIRECT_URI
    })

    // Set the tokens
    oauthClient.setToken({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_in: 3600,
      x_refresh_token_expires_in: 8726400,
      token_type: 'Bearer'
    })

    return oauthClient
  }

  // Get ingestion statistics
  async getIngestionStats(companyId: string): Promise<{
    totalDeposits: number
    totalPayments: number
    totalInvoices: number
    lastIngested: Date | null
    typeBreakdown: { [key: string]: number }
  }> {
    try {
      const depositsResult = await query(`
        SELECT COUNT(*) as count FROM qbo_objects 
        WHERE company_id = $1 AND obj_type = 'Deposit'
      `, [companyId])

      const paymentsResult = await query(`
        SELECT COUNT(*) as count FROM qbo_objects 
        WHERE company_id = $1 AND obj_type = 'Payment'
      `, [companyId])

      const invoicesResult = await query(`
        SELECT COUNT(*) as count FROM qbo_objects 
        WHERE company_id = $1 AND obj_type = 'Invoice'
      `, [companyId])

      const lastIngestedResult = await query(`
        SELECT MAX(imported_at) as last_imported
        FROM qbo_objects WHERE company_id = $1
      `, [companyId])

      const typeBreakdownResult = await query(`
        SELECT obj_type, COUNT(*) as count
        FROM qbo_objects 
        WHERE company_id = $1 
        GROUP BY obj_type
      `, [companyId])

      const typeBreakdown: { [key: string]: number } = {}
      typeBreakdownResult.rows.forEach((row: any) => {
        typeBreakdown[row.obj_type] = parseInt(row.count)
      })

      return {
        totalDeposits: parseInt(depositsResult.rows[0].count),
        totalPayments: parseInt(paymentsResult.rows[0].count),
        totalInvoices: parseInt(invoicesResult.rows[0].count),
        lastIngested: lastIngestedResult.rows[0].last_imported,
        typeBreakdown
      }
    } catch (error) {
      console.error('Error getting QBO ingestion stats:', error)
      return {
        totalDeposits: 0,
        totalPayments: 0,
        totalInvoices: 0,
        lastIngested: null,
        typeBreakdown: {}
      }
    }
  }
}
