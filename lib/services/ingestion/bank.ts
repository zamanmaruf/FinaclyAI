import { query } from '../../db-utils'
import { ConnectionManager } from '../connections'
import { getCursor, saveCursor } from '../../db-utils'

export interface BankAccount {
  id: string
  name: string
  type: string
  subtype: string
  mask: string
}

export interface BankTransaction {
  transaction_id: string
  account_id: string
  amount: number
  iso_currency_code: string
  date: string
  name: string
  merchant_name?: string
  category?: string[]
  pending: boolean
}

export class BankIngestionService {
  private connectionManager: ConnectionManager

  constructor() {
    this.connectionManager = ConnectionManager.getInstance()
  }

  // Sync transactions for a specific account
  async syncTransactions(companyId: string, accountId: string): Promise<number> {
    try {
      const connection = await this.connectionManager.getActiveConnection(companyId, 'plaid')
      if (!connection) {
        throw new Error('No active Plaid connection found')
      }

      const plaidClient = this.createPlaidClient()
      const accessToken = connection.authData.access_token
      
      // Get current cursor
      const cursor = await getCursor(companyId, 'plaid', `transactions_${accountId}`)
      
      console.log(`🔄 Starting bank transactions sync for account ${accountId}`)

      let totalAdded = 0
      let totalModified = 0
      let totalRemoved = 0
      let hasMore = true
      let currentCursor = cursor

      while (hasMore) {
        const request = {
          access_token: accessToken,
          cursor: currentCursor,
          count: 500 // Maximum allowed by Plaid
        }

        const response = await plaidClient.transactionsSync(request)
        
        // Store added transactions
        for (const transaction of response.added) {
          await this.storeTransaction(companyId, accountId, transaction)
          totalAdded++
        }

        // Store modified transactions
        for (const transaction of response.modified) {
          await this.storeTransaction(companyId, accountId, transaction)
          totalModified++
        }

        // Handle removed transactions
        for (const transactionId of response.removed) {
          await this.removeTransaction(companyId, accountId, transactionId)
          totalRemoved++
        }

        // Update cursor
        currentCursor = response.next_cursor
        hasMore = response.has_more

        console.log(`📊 Sync batch: +${response.added.length} ~${response.modified.length} -${response.removed.length}`)
      }

      // Save final cursor
      await saveCursor(companyId, 'plaid', `transactions_${accountId}`, currentCursor || '')

      // Update connection last synced
      await this.connectionManager.updateLastSynced(connection.id)

      console.log(`✅ Bank transactions sync complete: +${totalAdded} ~${totalModified} -${totalRemoved}`)
      return totalAdded + totalModified

    } catch (error) {
      console.error('Error syncing bank transactions:', error)
      throw error
    }
  }

  // Initial sync for a new account
  async initialSync(companyId: string, accountId: string): Promise<void> {
    try {
      console.log(`🔄 Starting initial bank sync for account ${accountId}`)
      
      // For initial sync, we don't use a cursor
      const connection = await this.connectionManager.getActiveConnection(companyId, 'plaid')
      if (!connection) {
        throw new Error('No active Plaid connection found')
      }

      const plaidClient = this.createPlaidClient()
      const accessToken = connection.authData.access_token

      // Get transactions for the last 2 years (Plaid's maximum)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - 2)

      const request = {
        access_token: accessToken,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        account_ids: [accountId]
      }

      const response = await plaidClient.transactionsGet(request)
      
      let totalStored = 0
      for (const transaction of response.transactions) {
        await this.storeTransaction(companyId, accountId, transaction)
        totalStored++
      }

      // Set initial cursor
      await saveCursor(companyId, 'plaid', `transactions_${accountId}`, response.request_id)

      console.log(`✅ Initial bank sync complete: ${totalStored} transactions`)

    } catch (error) {
      console.error('Error during initial bank sync:', error)
      throw error
    }
  }

  // Get all accounts for a company
  async getAccounts(companyId: string): Promise<BankAccount[]> {
    try {
      const connection = await this.connectionManager.getActiveConnection(companyId, 'plaid')
      if (!connection) {
        throw new Error('No active Plaid connection found')
      }

      const plaidClient = this.createPlaidClient()
      const accessToken = connection.authData.access_token

      const request = {
        access_token: accessToken
      }

      const response = await plaidClient.accountsGet(request)
      
      // Store accounts in database
      const accounts: BankAccount[] = []
      for (const account of response.accounts) {
        await this.storeAccount(companyId, account)
        accounts.push({
          id: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask
        })
      }

      return accounts

    } catch (error) {
      console.error('Error getting bank accounts:', error)
      return []
    }
  }

  // Store account in database
  private async storeAccount(companyId: string, account: any): Promise<void> {
    try {
      await query(`
        INSERT INTO bank_accounts (
          company_id, provider, provider_account_id, name, currency
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (company_id, provider, provider_account_id) DO UPDATE SET
          name = EXCLUDED.name,
          currency = EXCLUDED.currency
      `, [
        companyId,
        'plaid',
        account.account_id,
        account.name,
        account.balances.iso_currency_code || 'USD'
      ])
    } catch (error) {
      console.error('Error storing bank account:', error)
      throw error
    }
  }

  // Store transaction in database
  private async storeTransaction(companyId: string, accountId: string, transaction: any): Promise<void> {
    try {
      // First, get the internal account ID
      const accountResult = await query(`
        SELECT id FROM bank_accounts 
        WHERE company_id = $1 AND provider_account_id = $2
      `, [companyId, accountId])

      if (accountResult.rows.length === 0) {
        console.warn(`Bank account ${accountId} not found for company ${companyId}`)
        return
      }

      const internalAccountId = accountResult.rows[0].id

      await query(`
        INSERT INTO bank_transactions (
          company_id, account_id, provider_tx_id, amount, currency,
          posted_date, description, category_guess, raw_jsonb, imported_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (company_id, account_id, provider_tx_id) DO UPDATE SET
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          posted_date = EXCLUDED.posted_date,
          description = EXCLUDED.description,
          category_guess = EXCLUDED.category_guess,
          raw_jsonb = EXCLUDED.raw_jsonb,
          imported_at = CURRENT_TIMESTAMP
      `, [
        companyId,
        internalAccountId,
        transaction.transaction_id,
        Math.round(transaction.amount * 100), // Convert to cents
        transaction.iso_currency_code,
        transaction.date,
        transaction.name,
        transaction.category ? transaction.category[0] : null,
        JSON.stringify(transaction)
      ])
    } catch (error) {
      console.error('Error storing bank transaction:', error)
      throw error
    }
  }

  // Remove transaction from database
  private async removeTransaction(companyId: string, accountId: string, transactionId: string): Promise<void> {
    try {
      await query(`
        DELETE FROM bank_transactions 
        WHERE company_id = $1 AND provider_tx_id = $2
      `, [companyId, transactionId])
    } catch (error) {
      console.error('Error removing bank transaction:', error)
      throw error
    }
  }

  // Create Plaid client
  private createPlaidClient(): any {
    const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')
    
    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    })

    return new PlaidApi(configuration)
  }

  // Get sync statistics
  async getSyncStats(companyId: string): Promise<{
    totalAccounts: number
    totalTransactions: number
    lastSync: Date | null
    accountBreakdown: { [key: string]: number }
  }> {
    try {
      const accountsResult = await query(`
        SELECT COUNT(*) as count
        FROM bank_accounts WHERE company_id = $1
      `, [companyId])

      const transactionsResult = await query(`
        SELECT COUNT(*) as count, MAX(imported_at) as last_imported
        FROM bank_transactions WHERE company_id = $1
      `, [companyId])

      const accountBreakdownResult = await query(`
        SELECT ba.name, COUNT(bt.id) as transaction_count
        FROM bank_accounts ba
        LEFT JOIN bank_transactions bt ON ba.id = bt.account_id
        WHERE ba.company_id = $1
        GROUP BY ba.id, ba.name
      `, [companyId])

      const accountBreakdown: { [key: string]: number } = {}
      accountBreakdownResult.rows.forEach((row: any) => {
        accountBreakdown[row.name] = parseInt(row.transaction_count)
      })

      return {
        totalAccounts: parseInt(accountsResult.rows[0].count),
        totalTransactions: parseInt(transactionsResult.rows[0].count),
        lastSync: transactionsResult.rows[0].last_imported,
        accountBreakdown
      }
    } catch (error) {
      console.error('Error getting sync stats:', error)
      return {
        totalAccounts: 0,
        totalTransactions: 0,
        lastSync: null,
        accountBreakdown: {}
      }
    }
  }
}
