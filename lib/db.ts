import { Pool } from 'pg'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

console.log('🔗 Database connection string:', process.env.DATABASE_URL)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Performance optimizations
  max: 20, // Maximum number of clients in the pool
  min: 5,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used this many times
})

// Simple in-memory cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

export async function query(text: string, params?: any[], useCache = false) {
  const cacheKey = useCache ? `${text}:${JSON.stringify(params)}` : null
  
  // Check cache first for read operations
  if (useCache && cacheKey) {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
  }
  
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    
    // Cache the result for read operations
    if (useCache && cacheKey && result.rows) {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
    }
    
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  } finally {
    client.release()
  }
}

export async function getClient() {
  return await pool.connect()
}

// Initialize database schema
export async function initDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        company_name VARCHAR(255),
        current_tools TEXT,
        referral_source VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
