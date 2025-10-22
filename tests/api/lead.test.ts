import request from 'supertest'
import { NextRequest } from 'next/server'
import { getTestPool, cleanupTestData } from '../../lib/test-utils/db'

describe('Lead Capture API', () => {
  let pool: any

  beforeAll(async () => {
    pool = getTestPool()
  })

  beforeEach(async () => {
    await cleanupTestData()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('POST /api/lead', () => {
    it('should create a lead with valid data', async () => {
      const leadData = {
        email: `test-${Date.now()}@example.com`,
        fullName: 'John Doe',
        companyName: 'Test Company',
        role: 'owner',
        companySize: '1-10',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        phone: '+1234567890',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'launch'
      }

      const response = await request('http://localhost:3000')
        .post('/api/lead')
        .send(leadData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Successfully registered for early access')

      // Verify database insertion
      const result = await pool.query('SELECT * FROM signups WHERE email = $1', [leadData.email])
      expect(result.rows.length).toBe(1)
      expect(result.rows[0].email).toBe(leadData.email)
      expect(result.rows[0].role).toBe(leadData.role)
      expect(result.rows[0].company_size).toBe(leadData.companySize)
      expect(result.rows[0].stack_psp).toEqual(leadData.pspStack)
      expect(result.rows[0].stack_ledger).toEqual(leadData.ledgerStack)
      expect(result.rows[0].utm_source).toBe(leadData.utmSource)
      expect(result.rows[0].utm_medium).toBe(leadData.utmMedium)
      expect(result.rows[0].utm_campaign).toBe(leadData.utmCampaign)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid-email',
        fullName: '',
        role: 'invalid-role'
      }

      const response = await request('http://localhost:3000')
        .post('/api/lead')
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toContain('Invalid email')
      expect(response.body.error).toContain('Full name is required')
      expect(response.body.error).toContain('Invalid role')
    })

    it('should enforce rate limiting', async () => {
      const leadData = {
        email: 'test@example.com',
        fullName: 'John Doe',
        companyName: 'Test Company',
        role: 'owner',
        companySize: '1-10',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA'
      }

      // Make 6 requests (limit is 5)
      const requests = []
      for (let i = 0; i < 6; i++) {
        requests.push(
          request('http://localhost:3000')
            .post('/api/lead')
            .send({ ...leadData, email: `test${i}@example.com` })
        )
      }

      const responses = await Promise.all(requests)
      
      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        expect(responses[i].status).toBe(200)
      }
      
      // 6th should be rate limited
      expect(responses[5].status).toBe(429)
      expect(responses[5].body.error).toContain('Rate limit exceeded')
    })

    it('should handle idempotency for duplicate emails', async () => {
      const leadData = {
        email: 'duplicate@example.com',
        fullName: 'John Doe',
        companyName: 'Test Company',
        role: 'owner',
        companySize: '1-10',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA'
      }

      // First request should succeed
      const response1 = await request('http://localhost:3000')
        .post('/api/lead')
        .send(leadData)
        .expect(200)

      expect(response1.body.success).toBe(true)

      // Second request with same email should return 409
      const response2 = await request('http://localhost:3000')
        .post('/api/lead')
        .send(leadData)
        .expect(409)

      expect(response2.body.error).toContain('Email already registered')
    })

    it('should extract UTM parameters', async () => {
      const leadData = {
        email: 'utm@example.com',
        fullName: 'John Doe',
        companyName: 'Test Company',
        role: 'owner',
        companySize: '1-10',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        utmSource: 'facebook',
        utmMedium: 'social',
        utmCampaign: 'retargeting'
      }

      const response = await request('http://localhost:3000')
        .post('/api/lead')
        .send(leadData)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify UTM parameters stored
      const result = await pool.query('SELECT * FROM signups WHERE email = $1', [leadData.email])
      expect(result.rows[0].utm_source).toBe('facebook')
      expect(result.rows[0].utm_medium).toBe('social')
      expect(result.rows[0].utm_campaign).toBe('retargeting')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error by dropping the table temporarily
      await pool.query('DROP TABLE IF EXISTS signups')
      
      const leadData = {
        email: 'error@example.com',
        fullName: 'John Doe',
        companyName: 'Test Company',
        role: 'owner',
        companySize: '1-10',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA'
      }

      const response = await request('http://localhost:3000')
        .post('/api/lead')
        .send(leadData)
        .expect(500)

      expect(response.body.error).toContain('Database error')
    })

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        ''
      ]

      for (const email of invalidEmails) {
        const response = await request('http://localhost:3000')
          .post('/api/lead')
          .send({
            email,
            fullName: 'John Doe',
            companyName: 'Test Company',
            role: 'owner',
            companySize: '1-10',
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA'
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid email')
      }
    })

    it('should validate role options', async () => {
      const invalidRoles = ['invalid', 'admin', 'user', '']

      for (const role of invalidRoles) {
        const response = await request('http://localhost:3000')
          .post('/api/lead')
          .send({
            email: 'test@example.com',
            fullName: 'John Doe',
            companyName: 'Test Company',
            role,
            companySize: '1-10',
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA'
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid role')
      }
    })

    it('should validate company size options', async () => {
      const invalidSizes = ['invalid', '0', '1000+', '']

      for (const size of invalidSizes) {
        const response = await request('http://localhost:3000')
          .post('/api/lead')
          .send({
            email: 'test@example.com',
            fullName: 'John Doe',
            companyName: 'Test Company',
            role: 'owner',
            companySize: size,
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA'
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid company size')
      }
    })

    it('should validate stack options', async () => {
      const invalidPspStack = ['invalid', 'paypal-invalid']
      const invalidLedgerStack = ['invalid', 'quickbooks-invalid']

      const response = await request('http://localhost:3000')
        .post('/api/lead')
        .send({
          email: 'test@example.com',
          fullName: 'John Doe',
          companyName: 'Test Company',
          role: 'owner',
          companySize: '1-10',
          pspStack: invalidPspStack,
          ledgerStack: invalidLedgerStack,
          country: 'CA'
        })
        .expect(400)

      expect(response.body.error).toContain('Invalid PSP stack')
      expect(response.body.error).toContain('Invalid ledger stack')
    })

    it('should handle optional phone field', async () => {
      const leadData = {
        email: 'nophone@example.com',
        fullName: 'John Doe',
        companyName: 'Test Company',
        role: 'owner',
        companySize: '1-10',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA'
        // phone is optional
      }

      const response = await request('http://localhost:3000')
        .post('/api/lead')
        .send(leadData)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify phone is null in database
      const result = await pool.query('SELECT phone FROM signups WHERE email = $1', [leadData.email])
      expect(result.rows[0].phone).toBeNull()
    })

    it('should validate phone format when provided', async () => {
      const invalidPhones = ['123', 'invalid-phone', '123-456-789']

      for (const phone of invalidPhones) {
        const response = await request('http://localhost:3000')
          .post('/api/lead')
          .send({
            email: 'test@example.com',
            fullName: 'John Doe',
            companyName: 'Test Company',
            role: 'owner',
            companySize: '1-10',
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA',
            phone
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid phone format')
      }
    })

    it('should store referrer information', async () => {
      const leadData = {
        email: 'referrer@example.com',
        fullName: 'John Doe',
        companyName: 'Test Company',
        role: 'owner',
        companySize: '1-10',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        referrer: 'https://google.com'
      }

      const response = await request('http://localhost:3000')
        .post('/api/lead')
        .send(leadData)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify referrer stored
      const result = await pool.query('SELECT referrer FROM signups WHERE email = $1', [leadData.email])
      expect(result.rows[0].referrer).toBe('https://google.com')
    })
  })
})
