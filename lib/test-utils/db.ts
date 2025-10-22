import { Pool } from 'pg'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

let testPool: Pool | null = null

export interface TestDBConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}

export function getTestDBConfig(): TestDBConfig {
  // Use the existing DATABASE_URL for tests
  const testUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
  if (!testUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const url = new URL(testUrl)
  return {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  }
}

export function getTestPool(): Pool {
  if (!testPool) {
    // Use the existing database connection from lib/db.ts
    const { Pool } = require('pg')
    const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_TEST
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    
    testPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return testPool!
}

export async function setupTestDB(): Promise<void> {
  const config = getTestDBConfig()
  
  // Create test database if it doesn't exist
  const adminPool = new Pool({
    host: config.host,
    port: config.port,
    database: 'postgres', // Connect to default database
    user: config.user,
    password: config.password,
  })

  try {
    await adminPool.query(`CREATE DATABASE ${config.database}`)
    console.log(`✅ Test database ${config.database} created`)
  } catch (error: any) {
    if (error.code === '42P04') {
      console.log(`ℹ️  Test database ${config.database} already exists`)
    } else {
      throw error
    }
  } finally {
    await adminPool.end()
  }

  // Run migrations on test database
  const testPool = getTestPool()
  
  try {
    // Read and execute the reconciliation schema
    const schemaPath = join(process.cwd(), 'scripts', 'init-reconciliation-db.ts')
    const schemaContent = readFileSync(schemaPath, 'utf8')
    
    // Extract SQL from the TypeScript file (basic approach)
    const sqlMatches = schemaContent.match(/await pool\.query\(`([^`]+)`/g)
    if (sqlMatches) {
      for (const match of sqlMatches) {
        const sql = match.replace(/await pool\.query\(`/, '').replace(/`$/, '')
        await testPool.query(sql)
      }
    }
    
    console.log('✅ Test database schema applied')
  } catch (error) {
    console.error('❌ Failed to apply test database schema:', error)
    throw error
  }
}

export async function teardownTestDB(): Promise<void> {
  if (testPool) {
    await testPool.end()
    testPool = null
  }
}

export async function cleanupTestData(): Promise<void> {
  const pool = getTestPool()
  
  // Truncate all tables in correct order (respecting foreign keys)
  const tables = [
    'audit_events',
    'exceptions', 
    'matches',
    'sync_jobs',
    'sync_schedules',
    'provider_cursors',
    'qbo_objects',
    'bank_transactions',
    'bank_accounts',
    'stripe_balance_txns',
    'stripe_payouts',
    'connections',
    'users',
    'companies',
    'signups',
    'accountant_partners',
    'rate_limits'
  ]

  try {
    // Check which tables exist and only truncate those
    for (const table of tables) {
      try {
        await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`)
      } catch (error: any) {
        // Table doesn't exist, skip it
        if (error.code === '42P01') {
          continue
        }
        throw error
      }
    }
    
    console.log('✅ Test data cleaned up')
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error)
    // Don't throw error in tests, just log it
    console.log('ℹ️  Some tables may not exist yet, continuing...')
  }
}

// Create minimal test company and user for E2E tests
export async function createTestCompany(pool: Pool, overrides: any = {}): Promise<any> {
  const companyResult = await pool.query(`
    INSERT INTO companies (name, home_currency, country, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id
  `, [
    overrides.name || 'Test Company',
    overrides.home_currency || 'CAD',
    overrides.country || 'CA'
  ])
  
  const companyId = companyResult.rows[0].id

  const userResult = await pool.query(`
    INSERT INTO users (email, name, role, company_id, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id
  `, [
    overrides.email || 'test@example.com',
    overrides.name || 'Test User',
    overrides.role || 'owner',
    companyId
  ])

  return {
    companyId,
    userId: userResult.rows[0].id,
    company: companyResult.rows[0]
  }
}

// Create test connections with real API credentials (for E2E tests)
export async function createTestConnections(pool: Pool, companyId: number, credentials: {
  stripe?: any
  plaid?: any
  qbo?: any
}): Promise<void> {
  if (credentials.stripe) {
    await pool.query(`
      INSERT INTO connections (company_id, provider, status, auth_encrypted, created_at)
      VALUES ($1, 'stripe', 'connected', $2, NOW())
    `, [companyId, JSON.stringify(credentials.stripe)])
  }

  if (credentials.plaid) {
    await pool.query(`
      INSERT INTO connections (company_id, provider, status, auth_encrypted, created_at)
      VALUES ($1, 'plaid', 'connected', $2, NOW())
    `, [companyId, JSON.stringify(credentials.plaid)])
  }

  if (credentials.qbo) {
    await pool.query(`
      INSERT INTO connections (company_id, provider, status, auth_encrypted, created_at)
      VALUES ($1, 'qbo', 'connected', $2, NOW())
    `, [companyId, JSON.stringify(credentials.qbo)])
  }
}