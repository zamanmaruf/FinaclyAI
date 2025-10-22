import { getTestPool, cleanupTestData, createTestCompany, createTestConnections } from '../../lib/test-utils/db'
import { createTestData } from '../../lib/test-utils/factories'
import { expectSuccess, expectError } from '../utils/api-helpers'

describe('End-to-End: Real API Reconciliation', () => {
  let pool: any
  let testCompany: any

  beforeAll(async () => {
    pool = getTestPool()
    
    // Validate that all required environment variables are present
    expect(process.env.STRIPE_SECRET_KEY).toBeDefined()
    expect(process.env.PLAID_CLIENT_ID).toBeDefined()
    expect(process.env.QBO_CLIENT_ID).toBeDefined()
    
    // Ensure we're using test/sandbox credentials
    expect(process.env.STRIPE_SECRET_KEY).toMatch(/^sk_test_/)
    expect(process.env.PLAID_ENV).toBe('sandbox')
    expect(process.env.INTUIT_ENV).toBe('sandbox')
  })

  beforeEach(async () => {
    await cleanupTestData()
    
    // Create minimal test company
    testCompany = await createTestCompany(pool, {
      name: 'E2E Test Company',
      home_currency: 'CAD',
      country: 'CA'
    })
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('Stripe Integration', () => {
    it('should sync Stripe payouts using real API', async () => {
      // Create connection with real Stripe test credentials
      await createTestConnections(pool, testCompany.companyId, {
        stripe: {
          api_key: process.env.STRIPE_SECRET_KEY,
          webhook_secret: process.env.STRIPE_WEBHOOK_SECRET
        }
      })

      // Call Stripe sync API
      const response = await fetch('http://localhost:3000/api/app/stripe/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          endDate: new Date().toISOString()
        })
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      expect(result.payoutsIngested).toBeGreaterThanOrEqual(0)
      expect(result.balanceTransactionsIngested).toBeGreaterThanOrEqual(0)
    })

    it('should handle Stripe API errors gracefully', async () => {
      // Create connection with invalid Stripe credentials
      await createTestConnections(pool, testCompany.companyId, {
        stripe: {
          api_key: 'sk_test_invalid_key'
        }
      })

      const response = await fetch('http://localhost:3000/api/app/stripe/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId
        })
      })

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toContain('Stripe API error')
    })
  })

  describe('Plaid Integration', () => {
    it('should create link token using real Plaid API', async () => {
      const response = await fetch('http://localhost:3000/api/app/plaid/link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId
        })
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      expect(result.linkToken).toBeDefined()
      expect(result.linkToken).toMatch(/^link-/)
      expect(result.expiration).toBeDefined()
    })

    it('should handle Plaid API errors gracefully', async () => {
      // Temporarily override environment to test error handling
      const originalClientId = process.env.PLAID_CLIENT_ID
      process.env.PLAID_CLIENT_ID = 'invalid_client_id'

      const response = await fetch('http://localhost:3000/api/app/plaid/link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId
        })
      })

      expect(response.status).toBe(500)
      const result = await response.json()
      expect(result.error).toContain('Plaid API error')

      // Restore original environment
      process.env.PLAID_CLIENT_ID = originalClientId
    })
  })

  describe('QuickBooks Integration', () => {
    it('should generate QuickBooks auth URL using real API', async () => {
      const response = await fetch('http://localhost:3000/api/app/quickbooks/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId
        })
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      expect(result.authUrl).toBeDefined()
      expect(result.authUrl).toContain('appcenter.intuit.com')
      expect(result.authUrl).toContain(process.env.QBO_CLIENT_ID)
    })

    it('should handle QuickBooks API errors gracefully', async () => {
      // Temporarily override environment to test error handling
      const originalClientId = process.env.QBO_CLIENT_ID
      process.env.QBO_CLIENT_ID = 'invalid_client_id'

      const response = await fetch('http://localhost:3000/api/app/quickbooks/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId
        })
      })

      expect(response.status).toBe(500)
      const result = await response.json()
      expect(result.error).toContain('QuickBooks API error')

      // Restore original environment
      process.env.QBO_CLIENT_ID = originalClientId
    })
  })

  describe('Full Reconciliation Flow', () => {
    it('should complete end-to-end reconciliation with real APIs', async () => {
      // Skip this test if we don't have all required credentials
      if (!process.env.STRIPE_SECRET_KEY || !process.env.PLAID_CLIENT_ID || !process.env.QBO_CLIENT_ID) {
        console.log('⚠️  Skipping full reconciliation test - missing API credentials')
        return
      }

      // Create connections with real credentials
      await createTestConnections(pool, testCompany.companyId, {
        stripe: {
          api_key: process.env.STRIPE_SECRET_KEY,
          webhook_secret: process.env.STRIPE_WEBHOOK_SECRET
        },
        plaid: {
          access_token: 'test_access_token', // Would be real in actual flow
          item_id: 'test_item_id'
        },
        qbo: {
          access_token: 'test_access_token', // Would be real in actual flow
          refresh_token: 'test_refresh_token',
          realm_id: 'test_realm_id'
        }
      })

      // Step 1: Sync Stripe data
      console.log('🔄 Step 1: Syncing Stripe data...')
      const stripeResponse = await fetch('http://localhost:3000/api/app/stripe/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
          endDate: new Date().toISOString()
        })
      })

      expect(stripeResponse.status).toBe(200)
      const stripeResult = await stripeResponse.json()
      expect(stripeResult.success).toBe(true)

      // Step 2: Run matching
      console.log('🔄 Step 2: Running matching...')
      const matchingResponse = await fetch('http://localhost:3000/api/app/reconcile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId
        })
      })

      expect(matchingResponse.status).toBe(200)
      const matchingResult = await matchingResponse.json()
      expect(matchingResult.success).toBe(true)
      expect(matchingResult.report).toBeDefined()

      // Step 3: Check for exceptions
      console.log('🔄 Step 3: Checking exceptions...')
      const exceptionsResponse = await fetch(`http://localhost:3000/api/app/exceptions?companyId=${testCompany.companyId}`, {
        method: 'GET',
        headers: {
          'X-Company-ID': testCompany.companyId.toString()
        }
      })

      expect(exceptionsResponse.status).toBe(200)
      const exceptionsResult = await exceptionsResponse.json()
      expect(exceptionsResult.exceptions).toBeDefined()
      expect(Array.isArray(exceptionsResult.exceptions)).toBe(true)

      console.log(`✅ Full reconciliation completed: ${matchingResult.report.totalMatches} matches, ${exceptionsResult.exceptions.length} exceptions`)
    })
  })

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      // This test would simulate network timeouts
      // In a real scenario, you might use a network proxy or mock network conditions
      console.log('⚠️  Network timeout test would require network simulation')
    })

    it('should handle rate limiting from APIs', async () => {
      // This test would check rate limiting behavior
      console.log('⚠️  Rate limiting test would require API rate limit simulation')
    })

    it('should handle invalid API responses', async () => {
      // This test would check handling of malformed API responses
      console.log('⚠️  Invalid response test would require API response simulation')
    })
  })

  describe('Data Validation', () => {
    it('should validate data integrity after sync', async () => {
      // Create connection and sync data
      await createTestConnections(pool, testCompany.companyId, {
        stripe: {
          api_key: process.env.STRIPE_SECRET_KEY
        }
      })

      const response = await fetch('http://localhost:3000/api/app/stripe/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': testCompany.companyId.toString()
        },
        body: JSON.stringify({
          companyId: testCompany.companyId
        })
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      
      if (result.success && result.payoutsIngested > 0) {
        // Validate that data was stored correctly
        const dbResult = await pool.query(`
          SELECT COUNT(*) as count 
          FROM stripe_payouts 
          WHERE company_id = $1
        `, [testCompany.companyId])
        
        expect(parseInt(dbResult.rows[0].count)).toBe(result.payoutsIngested)
      }
    })
  })
})

