import request from 'supertest'
import { getTestPool, cleanupTestData } from '../../lib/test-utils/db'

describe('Accountant Partner API', () => {
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

  describe('POST /api/accountant-partner', () => {
    it('should create an accountant partner with valid data', async () => {
      const partnerData = {
        email: 'partner@accountingfirm.com',
        fullName: 'Jane Smith',
        companyName: 'Smith & Associates',
        role: 'accountant',
        companySize: '11-50',
        pspStack: ['stripe', 'paypal'],
        ledgerStack: ['quickbooks', 'xero'],
        country: 'CA',
        phone: '+1234567890',
        clientCount: '50-100',
        verticals: ['retail', 'ecommerce', 'services'],
        certification: 'QBO ProAdvisor',
        timeline: 'Q1 2025',
        utmSource: 'linkedin',
        utmMedium: 'social',
        utmCampaign: 'partner-program'
      }

      const response = await request('http://localhost:3000')
        .post('/api/accountant-partner')
        .send(partnerData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Thank you for joining our Partner Program')

      // Verify database insertion
      const result = await pool.query('SELECT * FROM accountant_partners WHERE email = $1', [partnerData.email])
      expect(result.rows.length).toBe(1)
      expect(result.rows[0].email).toBe(partnerData.email)
      expect(result.rows[0].role).toBe(partnerData.role)
      expect(result.rows[0].company_size).toBe(partnerData.companySize)
      expect(result.rows[0].stack_psp).toEqual(partnerData.pspStack)
      expect(result.rows[0].stack_ledger).toEqual(partnerData.ledgerStack)
      expect(result.rows[0].client_count).toBe(partnerData.clientCount)
      expect(result.rows[0].verticals).toEqual(partnerData.verticals)
      expect(result.rows[0].certification).toBe(partnerData.certification)
      expect(result.rows[0].timeline).toBe(partnerData.timeline)
      expect(result.rows[0].utm_source).toBe(partnerData.utmSource)
      expect(result.rows[0].utm_medium).toBe(partnerData.utmMedium)
      expect(result.rows[0].utm_campaign).toBe(partnerData.utmCampaign)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid-email',
        fullName: '',
        role: 'invalid-role',
        clientCount: 'invalid',
        verticals: [],
        certification: '',
        timeline: ''
      }

      const response = await request('http://localhost:3000')
        .post('/api/accountant-partner')
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toContain('Invalid email')
      expect(response.body.error).toContain('Full name is required')
      expect(response.body.error).toContain('Invalid role')
      expect(response.body.error).toContain('Invalid client count')
      expect(response.body.error).toContain('At least one vertical required')
      expect(response.body.error).toContain('Certification is required')
      expect(response.body.error).toContain('Timeline is required')
    })

    it('should enforce rate limiting', async () => {
      const partnerData = {
        email: 'partner@example.com',
        fullName: 'John Doe',
        companyName: 'Test Firm',
        role: 'accountant',
        companySize: '11-50',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        clientCount: '10-25',
        verticals: ['retail'],
        certification: 'QBO ProAdvisor',
        timeline: 'Q1 2025'
      }

      // Make 6 requests (limit is 5)
      const requests = []
      for (let i = 0; i < 6; i++) {
        requests.push(
          request('http://localhost:3000')
            .post('/api/accountant-partner')
            .send({ ...partnerData, email: `partner${i}@example.com` })
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
      const partnerData = {
        email: 'duplicate@accountingfirm.com',
        fullName: 'John Doe',
        companyName: 'Test Firm',
        role: 'accountant',
        companySize: '11-50',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        clientCount: '10-25',
        verticals: ['retail'],
        certification: 'QBO ProAdvisor',
        timeline: 'Q1 2025'
      }

      // First request should succeed
      const response1 = await request('http://localhost:3000')
        .post('/api/accountant-partner')
        .send(partnerData)
        .expect(200)

      expect(response1.body.success).toBe(true)

      // Second request with same email should return 409
      const response2 = await request('http://localhost:3000')
        .post('/api/accountant-partner')
        .send(partnerData)
        .expect(409)

      expect(response2.body.error).toContain('Email already registered')
    })

    it('should validate client count options', async () => {
      const invalidClientCounts = ['invalid', '0', '10000+', '']

      for (const clientCount of invalidClientCounts) {
        const response = await request('http://localhost:3000')
          .post('/api/accountant-partner')
          .send({
            email: 'test@example.com',
            fullName: 'John Doe',
            companyName: 'Test Firm',
            role: 'accountant',
            companySize: '11-50',
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA',
            clientCount,
            verticals: ['retail'],
            certification: 'QBO ProAdvisor',
            timeline: 'Q1 2025'
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid client count')
      }
    })

    it('should validate verticals', async () => {
      const invalidVerticals = ['invalid', 'none', []]

      for (const verticals of invalidVerticals) {
        const response = await request('http://localhost:3000')
          .post('/api/accountant-partner')
          .send({
            email: 'test@example.com',
            fullName: 'John Doe',
            companyName: 'Test Firm',
            role: 'accountant',
            companySize: '11-50',
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA',
            clientCount: '10-25',
            verticals,
            certification: 'QBO ProAdvisor',
            timeline: 'Q1 2025'
          })
          .expect(400)

        expect(response.body.error).toContain('At least one vertical required')
      }
    })

    it('should validate certification options', async () => {
      const invalidCertifications = ['invalid', 'none', '']

      for (const certification of invalidCertifications) {
        const response = await request('http://localhost:3000')
          .post('/api/accountant-partner')
          .send({
            email: 'test@example.com',
            fullName: 'John Doe',
            companyName: 'Test Firm',
            role: 'accountant',
            companySize: '11-50',
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA',
            clientCount: '10-25',
            verticals: ['retail'],
            certification,
            timeline: 'Q1 2025'
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid certification')
      }
    })

    it('should validate timeline options', async () => {
      const invalidTimelines = ['invalid', 'never', '']

      for (const timeline of invalidTimelines) {
        const response = await request('http://localhost:3000')
          .post('/api/accountant-partner')
          .send({
            email: 'test@example.com',
            fullName: 'John Doe',
            companyName: 'Test Firm',
            role: 'accountant',
            companySize: '11-50',
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA',
            clientCount: '10-25',
            verticals: ['retail'],
            certification: 'QBO ProAdvisor',
            timeline
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid timeline')
      }
    })

    it('should handle multiple verticals', async () => {
      const partnerData = {
        email: 'multi-vertical@accountingfirm.com',
        fullName: 'John Doe',
        companyName: 'Test Firm',
        role: 'accountant',
        companySize: '11-50',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        clientCount: '50-100',
        verticals: ['retail', 'ecommerce', 'services', 'manufacturing', 'healthcare'],
        certification: 'QBO ProAdvisor',
        timeline: 'Q2 2025'
      }

      const response = await request('http://localhost:3000')
        .post('/api/accountant-partner')
        .send(partnerData)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify all verticals stored
      const result = await pool.query('SELECT verticals FROM accountant_partners WHERE email = $1', [partnerData.email])
      expect(result.rows[0].verticals).toEqual(partnerData.verticals)
    })

    it('should handle optional phone field', async () => {
      const partnerData = {
        email: 'nophone@accountingfirm.com',
        fullName: 'John Doe',
        companyName: 'Test Firm',
        role: 'accountant',
        companySize: '11-50',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        clientCount: '10-25',
        verticals: ['retail'],
        certification: 'QBO ProAdvisor',
        timeline: 'Q1 2025'
        // phone is optional
      }

      const response = await request('http://localhost:3000')
        .post('/api/accountant-partner')
        .send(partnerData)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify phone is null in database
      const result = await pool.query('SELECT phone FROM accountant_partners WHERE email = $1', [partnerData.email])
      expect(result.rows[0].phone).toBeNull()
    })

    it('should validate phone format when provided', async () => {
      const invalidPhones = ['123', 'invalid-phone', '123-456-789']

      for (const phone of invalidPhones) {
        const response = await request('http://localhost:3000')
          .post('/api/accountant-partner')
          .send({
            email: 'test@example.com',
            fullName: 'John Doe',
            companyName: 'Test Firm',
            role: 'accountant',
            companySize: '11-50',
            pspStack: ['stripe'],
            ledgerStack: ['quickbooks'],
            country: 'CA',
            clientCount: '10-25',
            verticals: ['retail'],
            certification: 'QBO ProAdvisor',
            timeline: 'Q1 2025',
            phone
          })
          .expect(400)

        expect(response.body.error).toContain('Invalid phone format')
      }
    })

    it('should store referrer information', async () => {
      const partnerData = {
        email: 'referrer@accountingfirm.com',
        fullName: 'John Doe',
        companyName: 'Test Firm',
        role: 'accountant',
        companySize: '11-50',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        clientCount: '10-25',
        verticals: ['retail'],
        certification: 'QBO ProAdvisor',
        timeline: 'Q1 2025',
        referrer: 'https://linkedin.com'
      }

      const response = await request('http://localhost:3000')
        .post('/api/accountant-partner')
        .send(partnerData)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify referrer stored
      const result = await pool.query('SELECT referrer FROM accountant_partners WHERE email = $1', [partnerData.email])
      expect(result.rows[0].referrer).toBe('https://linkedin.com')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error by dropping the table temporarily
      await pool.query('DROP TABLE IF EXISTS accountant_partners')
      
      const partnerData = {
        email: 'error@accountingfirm.com',
        fullName: 'John Doe',
        companyName: 'Test Firm',
        role: 'accountant',
        companySize: '11-50',
        pspStack: ['stripe'],
        ledgerStack: ['quickbooks'],
        country: 'CA',
        clientCount: '10-25',
        verticals: ['retail'],
        certification: 'QBO ProAdvisor',
        timeline: 'Q1 2025'
      }

      const response = await request('http://localhost:3000')
        .post('/api/accountant-partner')
        .send(partnerData)
        .expect(500)

      expect(response.body.error).toContain('Database error')
    })
  })
})
