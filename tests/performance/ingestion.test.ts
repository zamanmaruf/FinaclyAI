import { getTestPool, cleanupTestData } from '../../lib/test-utils/db'
import { createTestCompany, createTestUser, createTestConnections } from '../utils/db-helpers'
import { mockStripeAPI, mockQBOAPI, mockPlaidAPI } from '../utils/api-helpers'

describe('Performance: Ingestion', () => {
  let pool: any
  let company: any

  beforeAll(async () => {
    pool = getTestPool()
  })

  beforeEach(async () => {
    await cleanupTestData()
    company = await createTestCompany(pool, { name: 'Performance Test Company' })
    await createTestUser(pool, company.id)
    await createTestConnections(pool, company.id)
  })

  afterAll(async () => {
    await pool.end()
  })

  it('should ingest 10k Stripe charges in under 5 minutes', async () => {
    // Mock large Stripe dataset
    const nock = require('nock')
    const stripeScope = nock('https://api.stripe.com')
      .get('/v1/balance_transactions')
      .reply(200, {
        object: 'list',
        data: Array.from({ length: 10000 }, (_, i) => ({
          id: `txn_${i}`,
          amount: 1000 + i,
          currency: 'cad',
          type: 'charge',
          fee: 30,
          net: 970 + i
        })),
        has_more: false
      })

    const startTime = Date.now()
    
    const { StripeIngestionService } = await import('../../lib/services/ingestion/stripe')
    const stripeService = new StripeIngestionService(pool)
    
    const result = await stripeService.ingestBalanceTransactions(company.id)
    const endTime = Date.now()
    
    const duration = endTime - startTime
    const durationMinutes = duration / (1000 * 60)
    
    expect(result.success).toBe(true)
    expect(result.balanceTransactionsIngested).toBe(10000)
    expect(durationMinutes).toBeLessThan(5) // Under 5 minutes
    
    // Verify all transactions ingested
    const txCount = await pool.query('SELECT COUNT(*) as count FROM stripe_balance_txns WHERE company_id = $1', [company.id])
    expect(parseInt(txCount.rows[0].count)).toBe(10000)
    
    console.log(`✅ Ingested 10k charges in ${durationMinutes.toFixed(2)} minutes`)
    
    stripeScope.done()
  })

  it('should ingest 100 payouts in under 30 seconds', async () => {
    const nock = require('nock')
    const stripeScope = nock('https://api.stripe.com')
      .get('/v1/payouts')
      .reply(200, {
        object: 'list',
        data: Array.from({ length: 100 }, (_, i) => ({
          id: `po_${i}`,
          amount: 1000 + i,
          currency: 'cad',
          status: 'paid'
        })),
        has_more: false
      })

    const startTime = Date.now()
    
    const { StripeIngestionService } = await import('../../lib/services/ingestion/stripe')
    const stripeService = new StripeIngestionService(pool)
    
    const result = await stripeService.ingestPayouts(company.id)
    const endTime = Date.now()
    
    const duration = endTime - startTime
    const durationSeconds = duration / 1000
    
    expect(result.success).toBe(true)
    expect(result.payoutsIngested).toBe(100)
    expect(durationSeconds).toBeLessThan(30) // Under 30 seconds
    
    console.log(`✅ Ingested 100 payouts in ${durationSeconds.toFixed(2)} seconds`)
    
    stripeScope.done()
  })

  it('should ingest 3k bank transactions in under 2 minutes', async () => {
    const nock = require('nock')
    const plaidScope = nock('https://sandbox.plaid.com')
      .post('/transactions/sync')
      .reply(200, {
        added: Array.from({ length: 3000 }, (_, i) => ({
          transaction_id: `bt_${i}`,
          account_id: 'acc_123',
          amount: 1000 + i,
          date: '2025-01-15',
          name: `Transaction ${i}`,
          category: ['Transfer', 'Deposit']
        })),
        modified: [],
        removed: [],
        next_cursor: 'cursor_123',
        has_more: false
      })

    const startTime = Date.now()
    
    const { BankIngestionService } = await import('../../lib/services/ingestion/bank')
    const bankService = new BankIngestionService(pool)
    
    const result = await bankService.syncTransactions(company.id, 'acc_123')
    const endTime = Date.now()
    
    const duration = endTime - startTime
    const durationMinutes = duration / (1000 * 60)
    
    expect(result.success).toBe(true)
    expect(result.transactionsIngested).toBe(3000)
    expect(durationMinutes).toBeLessThan(2) // Under 2 minutes
    
    console.log(`✅ Ingested 3k bank transactions in ${durationMinutes.toFixed(2)} minutes`)
    
    plaidScope.done()
  })

  it('should handle memory usage efficiently', async () => {
    const initialMemory = process.memoryUsage()
    
    // Mock large dataset
    const nock = require('nock')
    const stripeScope = nock('https://api.stripe.com')
      .get('/v1/payouts')
      .reply(200, {
        object: 'list',
        data: Array.from({ length: 5000 }, (_, i) => ({
          id: `po_${i}`,
          amount: 1000 + i,
          currency: 'cad',
          status: 'paid'
        })),
        has_more: false
      })

    const { StripeIngestionService } = await import('../../lib/services/ingestion/stripe')
    const stripeService = new StripeIngestionService(pool)
    
    await stripeService.ingestPayouts(company.id)
    
    const finalMemory = process.memoryUsage()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024)
    
    // Memory increase should be reasonable (under 100MB for 5k records)
    expect(memoryIncreaseMB).toBeLessThan(100)
    
    console.log(`✅ Memory usage increased by ${memoryIncreaseMB.toFixed(2)}MB`)
    
    stripeScope.done()
  })

  it('should handle concurrent ingestion efficiently', async () => {
    const startTime = Date.now()
    
    // Mock APIs for all providers
    const stripeScope = mockStripeAPI('success')
    const qboScope = mockQBOAPI('success')
    const plaidScope = mockPlaidAPI('success')
    
    const { IngestionOrchestrator } = await import('../../lib/services/ingestion/orchestrator')
    const orchestrator = new IngestionOrchestrator(pool)
    
    // Run concurrent ingestion
    const promises = Array.from({ length: 5 }, () => orchestrator.syncCompany(company.id))
    const results = await Promise.all(promises)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    const durationSeconds = duration / 1000
    
    // All should succeed
    results.forEach(result => {
      expect(result.success).toBe(true)
    })
    
    // Should complete in reasonable time (under 30 seconds for 5 concurrent runs)
    expect(durationSeconds).toBeLessThan(30)
    
    console.log(`✅ Completed 5 concurrent ingestion runs in ${durationSeconds.toFixed(2)} seconds`)
    
    stripeScope.done()
    qboScope.done()
    plaidScope.done()
  })

  it('should handle database connection pooling efficiently', async () => {
    const initialConnections = await pool.query('SELECT COUNT(*) as count FROM pg_stat_activity WHERE datname = current_database()')
    const initialCount = parseInt(initialConnections.rows[0].count)
    
    // Mock large dataset
    const nock = require('nock')
    const stripeScope = nock('https://api.stripe.com')
      .get('/v1/payouts')
      .reply(200, {
        object: 'list',
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: `po_${i}`,
          amount: 1000 + i,
          currency: 'cad',
          status: 'paid'
        })),
        has_more: false
      })

    const { StripeIngestionService } = await import('../../lib/services/ingestion/stripe')
    const stripeService = new StripeIngestionService(pool)
    
    await stripeService.ingestPayouts(company.id)
    
    const finalConnections = await pool.query('SELECT COUNT(*) as count FROM pg_stat_activity WHERE datname = current_database()')
    const finalCount = parseInt(finalConnections.rows[0].count)
    
    // Connection count should not increase significantly
    const connectionIncrease = finalCount - initialCount
    expect(connectionIncrease).toBeLessThan(5) // Should not create more than 5 new connections
    
    console.log(`✅ Connection pool usage: ${connectionIncrease} new connections`)
    
    stripeScope.done()
  })
})
