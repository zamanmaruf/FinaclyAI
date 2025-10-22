import { StripeIngestionService } from '../../../lib/services/ingestion/stripe'
import { getTestPool, cleanupTestData } from '../../../lib/test-utils/db'
import { createTestCompany, createTestUser, createTestConnections } from '../../utils/db-helpers'
import { mockStripeAPI } from '../../utils/api-helpers'

describe('Stripe Ingestion Service', () => {
  let pool: any
  let stripeService: StripeIngestionService
  let company: any
  let user: any
  let connections: any

  beforeAll(async () => {
    pool = getTestPool()
  })

  beforeEach(async () => {
    await cleanupTestData()
    
    // Create test company and user
    company = await createTestCompany(pool, { name: 'Stripe Test Company' })
    user = await createTestUser(pool, company.id)
    connections = await createTestConnections(pool, company.id)
    
    stripeService = new StripeIngestionService(pool)
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('ingestPayouts', () => {
    it('should ingest payouts successfully', async () => {
      // Mock successful Stripe API response
      const scope = mockStripeAPI('success')
      
      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(2)
      
      // Verify payouts in database
      const payouts = await pool.query('SELECT * FROM stripe_payouts WHERE company_id = $1', [company.id])
      expect(payouts.rows.length).toBe(2)
      expect(payouts.rows[0].payout_id).toBe('po_1234567890abcdef')
      expect(payouts.rows[0].amount).toBe(1000)
      expect(payouts.rows[0].currency).toBe('cad')
      expect(payouts.rows[0].status).toBe('paid')
      
      scope.done()
    })

    it('should handle pagination correctly', async () => {
      // Mock Stripe API with has_more = true
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .reply(200, {
          object: 'list',
          data: [
            { id: 'po_1', amount: 1000, currency: 'cad', status: 'paid' },
            { id: 'po_2', amount: 2000, currency: 'cad', status: 'paid' }
          ],
          has_more: true
        })
        .get('/v1/payouts')
        .query({ starting_after: 'po_2' })
        .reply(200, {
          object: 'list',
          data: [
            { id: 'po_3', amount: 3000, currency: 'cad', status: 'paid' }
          ],
          has_more: false
        })

      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(3)
      
      // Verify all payouts in database
      const payouts = await pool.query('SELECT * FROM stripe_payouts WHERE company_id = $1', [company.id])
      expect(payouts.rows.length).toBe(3)
      
      scope.done()
    })

    it('should handle cursor management for incremental sync', async () => {
      // First sync
      const scope1 = mockStripeAPI('success')
      await stripeService.ingestPayouts(company.id)
      scope1.done()

      // Second sync with cursor
      const nock = require('nock')
      const scope2 = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .query({ created: { gte: expect.any(Number) } })
        .reply(200, {
          object: 'list',
          data: [
            { id: 'po_new', amount: 5000, currency: 'cad', status: 'paid' }
          ],
          has_more: false
        })

      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(1)
      
      // Verify only new payout added
      const payouts = await pool.query('SELECT * FROM stripe_payouts WHERE company_id = $1', [company.id])
      expect(payouts.rows.length).toBe(3) // 2 from first sync + 1 new
      
      scope2.done()
    })

    it('should handle backfill for 90 days', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .query({ created: { gte: expect.any(Number) } })
        .reply(200, {
          object: 'list',
          data: [
            { id: 'po_old_1', amount: 1000, currency: 'cad', status: 'paid', created: Math.floor((Date.now() - 60 * 24 * 60 * 60 * 1000) / 1000) },
            { id: 'po_old_2', amount: 2000, currency: 'cad', status: 'paid', created: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000) }
          ],
          has_more: false
        })

      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(2)
      
      scope.done()
    })

    it('should handle upsert behavior correctly', async () => {
      // First ingestion
      const scope1 = mockStripeAPI('success')
      await stripeService.ingestPayouts(company.id)
      scope1.done()

      // Second ingestion with same data
      const scope2 = mockStripeAPI('success')
      const result = await stripeService.ingestPayouts(company.id)
      scope2.done()

      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(2)
      
      // Verify no duplicates
      const payouts = await pool.query('SELECT * FROM stripe_payouts WHERE company_id = $1', [company.id])
      expect(payouts.rows.length).toBe(2)
    })

    it('should handle 429 rate limit errors', async () => {
      const scope = mockStripeAPI('rate-limit')
      
      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Rate limit exceeded')
      
      scope.done()
    })

    it('should handle 500 server errors', async () => {
      const scope = mockStripeAPI('server-error')
      
      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Server error')
      
      scope.done()
    })

    it('should handle invalid API key', async () => {
      const scope = mockStripeAPI('invalid-key')
      
      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid API key')
      
      scope.done()
    })

    it('should store raw JSON data', async () => {
      const scope = mockStripeAPI('success')
      
      await stripeService.ingestPayouts(company.id)
      
      // Verify raw_jsonb is stored
      const payouts = await pool.query('SELECT raw_jsonb FROM stripe_payouts WHERE company_id = $1', [company.id])
      expect(payouts.rows[0].raw_jsonb).toBeDefined()
      expect(payouts.rows[0].raw_jsonb.id).toBe('po_1234567890abcdef')
      
      scope.done()
    })

    it('should handle different currencies', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .reply(200, {
          object: 'list',
          data: [
            { id: 'po_cad', amount: 1000, currency: 'cad', status: 'paid' },
            { id: 'po_usd', amount: 750, currency: 'usd', status: 'paid' },
            { id: 'po_eur', amount: 850, currency: 'eur', status: 'paid' }
          ],
          has_more: false
        })

      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(3)
      
      // Verify currencies stored correctly
      const payouts = await pool.query('SELECT currency FROM stripe_payouts WHERE company_id = $1 ORDER BY currency', [company.id])
      expect(payouts.rows[0].currency).toBe('cad')
      expect(payouts.rows[1].currency).toBe('eur')
      expect(payouts.rows[2].currency).toBe('usd')
      
      scope.done()
    })

    it('should handle different payout statuses', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .reply(200, {
          object: 'list',
          data: [
            { id: 'po_paid', amount: 1000, currency: 'cad', status: 'paid' },
            { id: 'po_pending', amount: 2000, currency: 'cad', status: 'pending' },
            { id: 'po_failed', amount: 3000, currency: 'cad', status: 'failed' }
          ],
          has_more: false
        })

      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(3)
      
      // Verify statuses stored correctly
      const payouts = await pool.query('SELECT status FROM stripe_payouts WHERE company_id = $1 ORDER BY status', [company.id])
      expect(payouts.rows[0].status).toBe('failed')
      expect(payouts.rows[1].status).toBe('paid')
      expect(payouts.rows[2].status).toBe('pending')
      
      scope.done()
    })
  })

  describe('ingestBalanceTransactions', () => {
    it('should ingest balance transactions successfully', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/balance_transactions')
        .reply(200, {
          object: 'list',
          data: [
            {
              id: 'txn_123',
              amount: 1000,
              currency: 'cad',
              type: 'payout',
              source: 'po_123',
              fee: 30,
              net: 970
            },
            {
              id: 'txn_456',
              amount: 2000,
              currency: 'cad',
              type: 'payout',
              source: 'po_456',
              fee: 60,
              net: 1940
            }
          ],
          has_more: false
        })

      const result = await stripeService.ingestBalanceTransactions(company.id)
      
      expect(result.success).toBe(true)
      expect(result.balanceTransactionsIngested).toBe(2)
      
      // Verify balance transactions in database
      const txs = await pool.query('SELECT * FROM stripe_balance_txns WHERE company_id = $1', [company.id])
      expect(txs.rows.length).toBe(2)
      expect(txs.rows[0].balance_id).toBe('txn_123')
      expect(txs.rows[0].amount).toBe(1000)
      expect(txs.rows[0].fee).toBe(30)
      expect(txs.rows[0].net).toBe(970)
      
      scope.done()
    })

    it('should handle pagination for balance transactions', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/balance_transactions')
        .reply(200, {
          object: 'list',
          data: [
            { id: 'txn_1', amount: 1000, currency: 'cad', type: 'payout' }
          ],
          has_more: true
        })
        .get('/v1/balance_transactions')
        .query({ starting_after: 'txn_1' })
        .reply(200, {
          object: 'list',
          data: [
            { id: 'txn_2', amount: 2000, currency: 'cad', type: 'payout' }
          ],
          has_more: false
        })

      const result = await stripeService.ingestBalanceTransactions(company.id)
      
      expect(result.success).toBe(true)
      expect(result.balanceTransactionsIngested).toBe(2)
      
      scope.done()
    })

    it('should handle different transaction types', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/balance_transactions')
        .reply(200, {
          object: 'list',
          data: [
            { id: 'txn_payout', amount: 1000, currency: 'cad', type: 'payout' },
            { id: 'txn_charge', amount: 500, currency: 'cad', type: 'charge' },
            { id: 'txn_refund', amount: -100, currency: 'cad', type: 'refund' }
          ],
          has_more: false
        })

      const result = await stripeService.ingestBalanceTransactions(company.id)
      
      expect(result.success).toBe(true)
      expect(result.balanceTransactionsIngested).toBe(3)
      
      // Verify transaction types stored
      const txs = await pool.query('SELECT type FROM stripe_balance_txns WHERE company_id = $1 ORDER BY type', [company.id])
      expect(txs.rows[0].type).toBe('charge')
      expect(txs.rows[1].type).toBe('payout')
      expect(txs.rows[2].type).toBe('refund')
      
      scope.done()
    })
  })

  describe('backfill', () => {
    it('should backfill last 90 days of data', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .query({ created: { gte: expect.any(Number) } })
        .reply(200, {
          object: 'list',
          data: [
            { id: 'po_old_1', amount: 1000, currency: 'cad', status: 'paid' },
            { id: 'po_old_2', amount: 2000, currency: 'cad', status: 'paid' }
          ],
          has_more: false
        })

      const result = await stripeService.backfill(company.id, 90)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(2)
      
      scope.done()
    })

    it('should handle backfill with custom days', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .query({ created: { gte: expect.any(Number) } })
        .reply(200, {
          object: 'list',
          data: [
            { id: 'po_30d', amount: 1000, currency: 'cad', status: 'paid' }
          ],
          has_more: false
        })

      const result = await stripeService.backfill(company.id, 30)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(1)
      
      scope.done()
    })
  })

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .delayConnection(5000) // 5 second delay
        .reply(200, {
          object: 'list',
          data: [],
          has_more: false
        })

      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
      
      scope.done()
    })

    it('should handle malformed JSON responses', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .reply(200, 'invalid json')

      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid JSON')
      
      scope.done()
    })

    it('should handle empty responses', async () => {
      const nock = require('nock')
      const scope = nock('https://api.stripe.com')
        .get('/v1/payouts')
        .reply(200, {
          object: 'list',
          data: [],
          has_more: false
        })

      const result = await stripeService.ingestPayouts(company.id)
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBe(0)
      
      scope.done()
    })
  })
})
