import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

describe('API: Stats', () => {
  it('should return stats with valid shape', async () => {
    const response = await fetch(`${BASE_URL}/api/stats`)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('matched')
    expect(data).toHaveProperty('exceptions')
    expect(typeof data.matched).toBe('number')
    expect(typeof data.exceptions).toBe('number')
  })
})

describe('API: Exceptions List', () => {
  it('should return exceptions array', async () => {
    const response = await fetch(`${BASE_URL}/api/exceptions/list`)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('rows')
    expect(Array.isArray(data.rows)).toBe(true)
  })
})

describe('API: Recent Matches', () => {
  it('should return recent matches array', async () => {
    const response = await fetch(`${BASE_URL}/api/matches/recent`)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('items')
    expect(Array.isArray(data.items)).toBe(true)
  })
})

