import { query } from '../../db-utils'
import { ConnectionManager } from '../connections'
import { saveCursor } from '../../db-utils'

export interface StripePayout {
  id: string
  amount_net: number
  amount_gross: number
  amount_fee: number
  currency: string
  arrival_date: string
  status: string
  created: number
}

export interface StripeBalanceTransaction {
  id: string
  amount: number
  currency: string
  type: string
  source_id?: string
  payout_id?: string
  created: number
  fee: number
  net: number
  description?: string
}

export class StripeIngestionService {
  private connectionManager: ConnectionManager

  constructor() {
    this.connectionManager = ConnectionManager.getInstance()
  }

  // Ingest payouts for a company
  async ingestPayouts(companyId: string, since?: Date): Promise<number> {
    try {
      const connection = await this.connectionManager.getActiveConnection(companyId, 'stripe')
      if (!connection) {
        throw new Error('No active Stripe connection found')
      }

      const stripe = this.createStripeClient(connection.authData)
      let totalIngested = 0
      let hasMore = true
      let startingAfter: string | undefined

      console.log(`🔄 Starting Stripe payouts ingestion for company ${companyId}`)

      while (hasMore) {
        const params: any = {
          limit: 100
        }

        if (since) {
          params.created = {
            gte: Math.floor(since.getTime() / 1000)
          }
        }

        if (startingAfter) {
          params.starting_after = startingAfter
        }

        const payouts = await stripe.payouts.list(params)
        
        if (payouts.data.length === 0) {
          break
        }

        // Process and store payouts
        for (const payout of payouts.data) {
          await this.storePayout(companyId, payout)
          totalIngested++
        }

        // Update cursor for incremental sync
        if (payouts.data.length > 0) {
          const lastPayout = payouts.data[payouts.data.length - 1]
          await saveCursor(companyId, 'stripe', 'payouts', lastPayout.id)
        }

        hasMore = payouts.has_more
        startingAfter = payouts.data[payouts.data.length - 1]?.id

        console.log(`📊 Ingested ${payouts.data.length} payouts (total: ${totalIngested})`)
      }

      // Update connection last synced
      await this.connectionManager.updateLastSynced(connection.id)

      console.log(`✅ Stripe payouts ingestion complete: ${totalIngested} payouts`)
      return totalIngested

    } catch (error) {
      console.error('Error ingesting Stripe payouts:', error)
      throw error
    }
  }

  // Ingest balance transactions for a specific payout
  async ingestBalanceTransactions(companyId: string, payoutId: string): Promise<number> {
    try {
      const connection = await this.connectionManager.getActiveConnection(companyId, 'stripe')
      if (!connection) {
        throw new Error('No active Stripe connection found')
      }

      const stripe = this.createStripeClient(connection.authData)
      let totalIngested = 0
      let hasMore = true
      let startingAfter: string | undefined

      console.log(`🔄 Starting balance transactions ingestion for payout ${payoutId}`)

      while (hasMore) {
        const params: any = {
          payout: payoutId,
          limit: 100
        }

        if (startingAfter) {
          params.starting_after = startingAfter
        }

        const balanceTransactions = await stripe.balanceTransactions.list(params)
        
        if (balanceTransactions.data.length === 0) {
          break
        }

        // Process and store balance transactions
        for (const txn of balanceTransactions.data) {
          await this.storeBalanceTransaction(companyId, txn)
          totalIngested++
        }

        hasMore = balanceTransactions.has_more
        startingAfter = balanceTransactions.data[balanceTransactions.data.length - 1]?.id

        console.log(`📊 Ingested ${balanceTransactions.data.length} balance transactions (total: ${totalIngested})`)
      }

      console.log(`✅ Balance transactions ingestion complete: ${totalIngested} transactions`)
      return totalIngested

    } catch (error) {
      console.error('Error ingesting balance transactions:', error)
      throw error
    }
  }

  // Backfill historical data
  async backfill(companyId: string, days: number = 90): Promise<void> {
    try {
      const since = new Date()
      since.setDate(since.getDate() - days)

      console.log(`🔄 Starting Stripe backfill for ${days} days (since ${since.toISOString()})`)

      // Ingest payouts
      const payoutCount = await this.ingestPayouts(companyId, since)
      
      // Get all payouts and ingest their balance transactions
      const payouts = await query(`
        SELECT payout_id FROM stripe_payouts 
        WHERE company_id = $1 AND created_at >= $2
      `, [companyId, since])

      let totalBalanceTxns = 0
      for (const payout of payouts.rows) {
        const txnCount = await this.ingestBalanceTransactions(companyId, payout.payout_id)
        totalBalanceTxns += txnCount
      }

      console.log(`✅ Stripe backfill complete: ${payoutCount} payouts, ${totalBalanceTxns} balance transactions`)

    } catch (error) {
      console.error('Error during Stripe backfill:', error)
      throw error
    }
  }

  // Store payout in database
  private async storePayout(companyId: string, payout: any): Promise<void> {
    try {
      await query(`
        INSERT INTO stripe_payouts (
          company_id, payout_id, amount_net, amount_gross, amount_fee,
          currency, arrival_date, status, created_at, imported_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (payout_id) DO UPDATE SET
          amount_net = EXCLUDED.amount_net,
          amount_gross = EXCLUDED.amount_gross,
          amount_fee = EXCLUDED.amount_fee,
          currency = EXCLUDED.currency,
          arrival_date = EXCLUDED.arrival_date,
          status = EXCLUDED.status,
          imported_at = CURRENT_TIMESTAMP
      `, [
        companyId,
        payout.id,
        payout.amount,
        payout.amount + payout.fees.total,
        payout.fees.total,
        payout.currency,
        new Date(payout.arrival_date * 1000).toISOString().split('T')[0],
        payout.status,
        new Date(payout.created * 1000)
      ])
    } catch (error) {
      console.error('Error storing payout:', error)
      throw error
    }
  }

  // Store balance transaction in database
  private async storeBalanceTransaction(companyId: string, txn: any): Promise<void> {
    try {
      await query(`
        INSERT INTO stripe_balance_txns (
          company_id, balance_id, amount, currency, type, source_id,
          payout_id, created, fee, net, data_jsonb, imported_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
        ON CONFLICT (balance_id) DO UPDATE SET
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          type = EXCLUDED.type,
          source_id = EXCLUDED.source_id,
          payout_id = EXCLUDED.payout_id,
          created = EXCLUDED.created,
          fee = EXCLUDED.fee,
          net = EXCLUDED.net,
          data_jsonb = EXCLUDED.data_jsonb,
          imported_at = CURRENT_TIMESTAMP
      `, [
        companyId,
        txn.id,
        txn.amount,
        txn.currency,
        txn.type,
        txn.source,
        txn.payout,
        new Date(txn.created * 1000),
        txn.fee,
        txn.net,
        JSON.stringify(txn)
      ])
    } catch (error) {
      console.error('Error storing balance transaction:', error)
      throw error
    }
  }

  // Create Stripe client
  private createStripeClient(authData: any): any {
    const Stripe = require('stripe')
    return new Stripe(authData.api_key || authData.secret_key, {
      apiVersion: '2025-09-30.clover'
    })
  }

  // Get ingestion statistics
  async getIngestionStats(companyId: string): Promise<{
    totalPayouts: number
    totalBalanceTxns: number
    lastIngested: Date | null
    currencyBreakdown: { [key: string]: number }
  }> {
    try {
      const payoutsResult = await query(`
        SELECT COUNT(*) as count, MAX(imported_at) as last_imported
        FROM stripe_payouts WHERE company_id = $1
      `, [companyId])

      const balanceTxnsResult = await query(`
        SELECT COUNT(*) as count
        FROM stripe_balance_txns WHERE company_id = $1
      `, [companyId])

      const currencyResult = await query(`
        SELECT currency, COUNT(*) as count
        FROM stripe_payouts 
        WHERE company_id = $1 
        GROUP BY currency
      `, [companyId])

      const currencyBreakdown: { [key: string]: number } = {}
      currencyResult.rows.forEach((row: any) => {
        currencyBreakdown[row.currency] = parseInt(row.count)
      })

      return {
        totalPayouts: parseInt(payoutsResult.rows[0].count),
        totalBalanceTxns: parseInt(balanceTxnsResult.rows[0].count),
        lastIngested: payoutsResult.rows[0].last_imported,
        currencyBreakdown
      }
    } catch (error) {
      console.error('Error getting ingestion stats:', error)
      return {
        totalPayouts: 0,
        totalBalanceTxns: 0,
        lastIngested: null,
        currencyBreakdown: {}
      }
    }
  }
}
