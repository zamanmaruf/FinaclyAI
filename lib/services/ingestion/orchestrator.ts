import { query } from '../../db-utils'
import { createSyncJob, updateSyncJobStatus, trackEvent } from '../../db-utils'
import { StripeIngestionService } from './stripe'
import { BankIngestionService } from './bank'
import { QBOIngestionService } from './quickbooks'

export interface SyncResult {
  jobId: string
  companyId: string
  status: 'completed' | 'failed' | 'partial'
  results: {
    stripe?: {
      payouts: number
      balanceTransactions: number
    }
    bank?: {
      accounts: number
      transactions: number
    }
    qbo?: {
      deposits: number
      payments: number
      invoices: number
    }
  }
  errors: string[]
  duration: number
  startedAt: Date
  completedAt: Date
}

export class IngestionOrchestrator {
  private stripeService: StripeIngestionService
  private bankService: BankIngestionService
  private qboService: QBOIngestionService

  constructor() {
    this.stripeService = new StripeIngestionService()
    this.bankService = new BankIngestionService()
    this.qboService = new QBOIngestionService()
  }

  // Main sync method for a company
  async syncCompany(companyId: string, since?: Date): Promise<SyncResult> {
    const startTime = Date.now()
    const jobId = await createSyncJob(companyId, 'full_sync', { since })
    
    console.log(`🔄 Starting full sync for company ${companyId} (job: ${jobId})`)
    
    await updateSyncJobStatus(jobId, 'running')
    await trackEvent('sync_started', companyId, { jobId, since })

    const results: SyncResult['results'] = {}
    const errors: string[] = []

    try {
      // Check which providers are connected
      const connections = await this.getConnectedProviders(companyId)
      console.log(`📊 Connected providers: ${connections.join(', ')}`)

      // Run ingestion for each connected provider in parallel
      const ingestionPromises: Promise<any>[] = []

      if (connections.includes('stripe')) {
        ingestionPromises.push(
          this.syncStripe(companyId, since)
            .then(result => { results.stripe = result })
            .catch(error => {
              errors.push(`Stripe sync failed: ${error.message}`)
              console.error('Stripe sync error:', error)
            })
        )
      }

      if (connections.includes('plaid')) {
        ingestionPromises.push(
          this.syncBank(companyId)
            .then(result => { results.bank = result })
            .catch(error => {
              errors.push(`Bank sync failed: ${error.message}`)
              console.error('Bank sync error:', error)
            })
        )
      }

      if (connections.includes('qbo')) {
        ingestionPromises.push(
          this.syncQBO(companyId, since)
            .then(result => { results.qbo = result })
            .catch(error => {
              errors.push(`QBO sync failed: ${error.message}`)
              console.error('QBO sync error:', error)
            })
        )
      }

      // Wait for all ingestion to complete
      await Promise.all(ingestionPromises)

      const duration = Date.now() - startTime
      const completedAt = new Date()

      // Determine overall status
      const status = errors.length === 0 ? 'completed' : 
                    Object.keys(results).length > 0 ? 'partial' : 'failed'

      const syncResult: SyncResult = {
        jobId,
        companyId,
        status,
        results,
        errors,
        duration,
        startedAt: new Date(startTime),
        completedAt
      }

      // Update job status
      if (status === 'completed') {
        await updateSyncJobStatus(jobId, 'completed')
        await trackEvent('sync_completed', companyId, { 
          jobId, 
          duration, 
          results: Object.keys(results).length 
        })
      } else {
        await updateSyncJobStatus(jobId, 'failed', errors.join('; '))
        await trackEvent('sync_failed', companyId, { 
          jobId, 
          duration, 
          errors: errors.length 
        })
      }

      console.log(`✅ Sync completed for company ${companyId}: ${status}`)
      return syncResult

    } catch (error) {
      const duration = Date.now() - startTime
      await updateSyncJobStatus(jobId, 'failed', error instanceof Error ? error.message : 'Unknown error')
      await trackEvent('sync_failed', companyId, { jobId, duration, error: error instanceof Error ? error.message : 'Unknown error' })

      console.error(`❌ Sync failed for company ${companyId}:`, error)
      throw error
    }
  }

  // Sync Stripe data
  private async syncStripe(companyId: string, since?: Date): Promise<{
    payouts: number
    balanceTransactions: number
  }> {
    console.log(`🔄 Syncing Stripe data for company ${companyId}`)
    
    const payouts = await this.stripeService.ingestPayouts(companyId, since)
    
    // Get all payouts and sync their balance transactions
    const payoutIds = await query(`
      SELECT payout_id FROM stripe_payouts 
      WHERE company_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [companyId])

    let totalBalanceTxns = 0
    for (const payout of payoutIds.rows) {
      const txns = await this.stripeService.ingestBalanceTransactions(companyId, payout.payout_id)
      totalBalanceTxns += txns
    }

    return {
      payouts,
      balanceTransactions: totalBalanceTxns
    }
  }

  // Sync bank data
  private async syncBank(companyId: string): Promise<{
    accounts: number
    transactions: number
  }> {
    console.log(`🔄 Syncing bank data for company ${companyId}`)
    
    // Get all bank accounts
    const accounts = await this.bankService.getAccounts(companyId)
    
    let totalTransactions = 0
    for (const account of accounts) {
      const txns = await this.bankService.syncTransactions(companyId, account.id)
      totalTransactions += txns
    }

    return {
      accounts: accounts.length,
      transactions: totalTransactions
    }
  }

  // Sync QuickBooks data
  private async syncQBO(companyId: string, since?: Date): Promise<{
    deposits: number
    payments: number
    invoices: number
  }> {
    console.log(`🔄 Syncing QBO data for company ${companyId}`)
    
    const deposits = await this.qboService.ingestDeposits(companyId, since)
    const payments = await this.qboService.ingestPayments(companyId, since)
    const invoices = await this.qboService.ingestInvoices(companyId, since)

    return {
      deposits,
      payments,
      invoices
    }
  }

  // Get connected providers for a company
  private async getConnectedProviders(companyId: string): Promise<string[]> {
    const result = await query(`
      SELECT provider FROM connections 
      WHERE company_id = $1 AND status = 'connected'
    `, [companyId])

    return result.rows.map((row: any) => row.provider)
  }

  // Get sync progress for a job
  async getSyncProgress(jobId: string): Promise<{
    status: string
    progress: number
    details: any
  } | null> {
    try {
      const result = await query(`
        SELECT status, metadata, started_at, completed_at
        FROM sync_jobs WHERE id = $1
      `, [jobId])

      if (result.rows.length === 0) {
        return null
      }

      const job = result.rows[0]
      const metadata = job.metadata ? JSON.parse(job.metadata) : {}
      
      // Calculate progress based on status
      let progress = 0
      if (job.status === 'pending') progress = 0
      else if (job.status === 'running') progress = 50
      else if (job.status === 'completed') progress = 100
      else if (job.status === 'failed') progress = 100

      return {
        status: job.status,
        progress,
        details: {
          startedAt: job.started_at,
          completedAt: job.completed_at,
          metadata
        }
      }
    } catch (error) {
      console.error('Error getting sync progress:', error)
      return null
    }
  }

  // Get sync history for a company
  async getSyncHistory(companyId: string, limit: number = 10): Promise<{
    jobId: string
    status: string
    startedAt: Date
    completedAt?: Date
    duration?: number
    results?: any
  }[]> {
    try {
      const result = await query(`
        SELECT id, status, started_at, completed_at, metadata
        FROM sync_jobs 
        WHERE company_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [companyId, limit])

      return result.rows.map((row: any) => {
        const metadata = row.metadata ? JSON.parse(row.metadata) : {}
        const duration = row.completed_at && row.started_at 
          ? new Date(row.completed_at).getTime() - new Date(row.started_at).getTime()
          : undefined

        return {
          jobId: row.id,
          status: row.status,
          startedAt: row.started_at,
          completedAt: row.completed_at,
          duration,
          results: metadata.results
        }
      })
    } catch (error) {
      console.error('Error getting sync history:', error)
      return []
    }
  }

  // Trigger manual sync for a company
  async triggerManualSync(companyId: string, since?: Date): Promise<string> {
    try {
      console.log(`🔄 Triggering manual sync for company ${companyId}`)
      
      // Check if there's already a running sync
      const runningSync = await query(`
        SELECT id FROM sync_jobs 
        WHERE company_id = $1 AND status IN ('pending', 'running')
        ORDER BY created_at DESC 
        LIMIT 1
      `, [companyId])

      if (runningSync.rows.length > 0) {
        throw new Error('Sync already in progress for this company')
      }

      // Start the sync (this will run asynchronously)
      const result = await this.syncCompany(companyId, since)
      return result.jobId

    } catch (error) {
      console.error('Error triggering manual sync:', error)
      throw error
    }
  }
}
