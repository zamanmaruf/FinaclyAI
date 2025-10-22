import { POST } from '@/app/api/lead/route'
import { NextRequest } from 'next/server'

describe('Lead API - Direct Function Test', () => {
  afterAll(async () => {
    // Wait for any pending async operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000))
  })
  it('should create a lead with valid data', async () => {
    const leadData = {
      email: `test-${Date.now()}@example.com`,
      fullName: 'John Doe',
      companyName: 'Test Company',
      role: 'owner',
      companySize: '1-10',
      stackPsp: ['stripe'],
      stackLedger: ['quickbooks'],
      country: 'CA',
      phone: '+1234567890'
    }

    // Create a mock NextRequest
    const request = new NextRequest('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    })

    // Call the API function directly
    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.message).toContain('Successfully registered for early access')
  })

  it('should handle duplicate email', async () => {
    const leadData = {
      email: `duplicate-${Date.now()}@example.com`,
      fullName: 'John Doe',
      companyName: 'Test Company',
      role: 'owner',
      companySize: '1-10',
      stackPsp: ['stripe'],
      stackLedger: ['quickbooks'],
      country: 'CA'
    }

    // First request - should succeed
    const request1 = new NextRequest('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    })

    const response1 = await POST(request1)
    expect(response1.status).toBe(200)

    // Second request with same email - should fail with duplicate
    const request2 = new NextRequest('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    })

    const response2 = await POST(request2)
    expect(response2.status).toBe(409)
    
    const responseData = await response2.json()
    expect(responseData.error).toBe('Email already registered')
  })

  it('should validate required fields', async () => {
    const incompleteData = {
      email: 'test@example.com',
      // Missing required fields
    }

    const request = new NextRequest('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData)
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('Missing required fields')
  })
})
