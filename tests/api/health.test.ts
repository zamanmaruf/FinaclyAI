import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

describe('API: Health Check', () => {
  it('should return ok status with database up', async () => {
    const response = await fetch(`${BASE_URL}/api/health`)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.db).toBe('up')
  })

  it('should return 2xx status code', async () => {
    const response = await fetch(`${BASE_URL}/api/health`)
    expect(response.ok).toBe(true)
  })
})

