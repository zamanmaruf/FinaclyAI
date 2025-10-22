import { Pool } from 'pg'
import { createCompany, createUser, createStripePayout, createBankTransaction, createQBOObject } from '../../lib/test-utils/factories'

export async function createTestCompany(pool: Pool, overrides: any = {}) {
  const companyData = createCompany(overrides)
  const result = await pool.query(`
    INSERT INTO companies (name, home_currency, country, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `, [companyData.name, companyData.home_currency, companyData.country, companyData.created_at])
  
  return { ...companyData, id: result.rows[0].id }
}

export async function createTestUser(pool: Pool, companyId: number, overrides: any = {}) {
  const userData = createUser({ company_id: companyId, ...overrides })
  const result = await pool.query(`
    INSERT INTO users (email, name, role, company_id, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [userData.email, userData.name, userData.role, userData.company_id, userData.created_at])
  
  return { ...userData, id: result.rows[0].id }
}

export async function createTestConnections(pool: Pool, companyId: number) {
  const connections = [
    {
      provider: 'stripe',
      status: 'connected',
      auth_encrypted: JSON.stringify({ api_key: 'sk_test_123' })
    },
    {
      provider: 'qbo', 
      status: 'connected',
      auth_encrypted: JSON.stringify({ access_token: 'qbo_token_123', refresh_token: 'qbo_refresh_123' })
    },
    {
      provider: 'plaid',
      status: 'connected', 
      auth_encrypted: JSON.stringify({ access_token: 'plaid_token_123' })
    }
  ]

  const results = []
  for (const conn of connections) {
    const result = await pool.query(`
      INSERT INTO connections (company_id, provider, status, auth_encrypted, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [companyId, conn.provider, conn.status, conn.auth_encrypted])
    results.push({ ...conn, id: result.rows[0].id })
  }
  
  return results
}

export async function createTestStripePayouts(pool: Pool, companyId: number, count: number = 5) {
  const payouts = []
  for (let i = 0; i < count; i++) {
    const payoutData = createStripePayout({
      company_id: companyId,
      payout_id: `po_test_${i + 1}`,
      amount: 1000 * (i + 1),
      amount_gross: 1000 * (i + 1) + 30,
      amount_fee: 30,
      currency: 'CAD',
      arrival_date: new Date(`2025-01-${10 + i + 1}`),
      status: 'paid'
    })
    
    const result = await pool.query(`
      INSERT INTO stripe_payouts (company_id, payout_id, amount, amount_gross, amount_fee, currency, arrival_date, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      payoutData.company_id, payoutData.payout_id, payoutData.amount, 
      payoutData.amount_gross, payoutData.amount_fee, payoutData.currency,
      payoutData.arrival_date, payoutData.status, payoutData.created_at
    ])
    
    payouts.push({ ...payoutData, id: result.rows[0].id })
  }
  
  return payouts
}

export async function createTestBankTransactions(pool: Pool, companyId: number, count: number = 5) {
  const transactions = []
  for (let i = 0; i < count; i++) {
    const txData = createBankTransaction({
      company_id: companyId,
      account_id: 1,
      provider_tx_id: `bt_test_${i + 1}`,
      amount: 1000 * (i + 1),
      currency: 'CAD',
      date: new Date(`2025-01-${10 + i + 1}`),
      description: `STRIPE PAYOUT ${i + 1}`
    })
    
    const result = await pool.query(`
      INSERT INTO bank_transactions (company_id, account_id, provider_tx_id, amount, currency, date, description, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      txData.company_id, txData.account_id, txData.provider_tx_id, txData.amount,
      txData.currency, txData.date, txData.description, txData.created_at
    ])
    
    transactions.push({ ...txData, id: result.rows[0].id })
  }
  
  return transactions
}

export async function createTestQBOObjects(pool: Pool, companyId: number, count: number = 3) {
  const objects = []
  for (let i = 0; i < count; i++) {
    const objData = createQBOObject({
      company_id: companyId,
      obj_type: 'Deposit',
      qbo_id: `qbo_test_${i + 1}`,
      amount: 1000 * (i + 1),
      currency: 'CAD',
      txn_date: new Date(`2025-01-${10 + i + 1}`),
      external_ref: `stripe_payout:po_test_${i + 1}`
    })
    
    const result = await pool.query(`
      INSERT INTO qbo_objects (company_id, obj_type, qbo_id, txn_date, amount, currency, external_ref, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      objData.company_id, objData.obj_type, objData.qbo_id, objData.txn_date,
      objData.amount, objData.currency, objData.external_ref, objData.created_at
    ])
    
    objects.push({ ...objData, id: result.rows[0].id })
  }
  
  return objects
}

export async function assertDatabaseState(pool: Pool, expected: Record<string, number>) {
  for (const [table, expectedCount] of Object.entries(expected)) {
    const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
    const actualCount = parseInt(result.rows[0].count)
    expect(actualCount).toBe(expectedCount)
  }
}

export async function getMatchCount(pool: Pool, companyId: number): Promise<number> {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM matches WHERE company_id = $1
  `, [companyId])
  return parseInt(result.rows[0].count)
}

export async function getExceptionCount(pool: Pool, companyId: number, exceptionType?: string): Promise<number> {
  let query = `SELECT COUNT(*) as count FROM exceptions WHERE company_id = $1`
  const params: any[] = [companyId]
  
  if (exceptionType) {
    query += ` AND exception_type = $2`
    params.push(exceptionType)
  }
  
  const result = await pool.query(query, params)
  return parseInt(result.rows[0].count)
}

export async function getPayoutCount(pool: Pool, companyId: number): Promise<number> {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM stripe_payouts WHERE company_id = $1
  `, [companyId])
  return parseInt(result.rows[0].count)
}

export async function getBankTransactionCount(pool: Pool, companyId: number): Promise<number> {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM bank_transactions WHERE company_id = $1
  `, [companyId])
  return parseInt(result.rows[0].count)
}

export async function getQBOObjectCount(pool: Pool, companyId: number): Promise<number> {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM qbo_objects WHERE company_id = $1
  `, [companyId])
  return parseInt(result.rows[0].count)
}

export async function getAuditEventCount(pool: Pool, companyId: number): Promise<number> {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM audit_events WHERE company_id = $1
  `, [companyId])
  return parseInt(result.rows[0].count)
}

export async function assertMatchCreated(pool: Pool, payoutId: string, bankTxId: string) {
  const result = await pool.query(`
    SELECT * FROM matches 
    WHERE (left_ref = $1 AND right_ref = $2) 
    OR (left_ref = $2 AND right_ref = $1)
  `, [payoutId, bankTxId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].confidence).toBeGreaterThan(0.8)
}

export async function assertExceptionCreated(pool: Pool, exceptionType: string, entityRefs: Record<string, string>) {
  const result = await pool.query(`
    SELECT * FROM exceptions 
    WHERE exception_type = $1 
    AND entity_refs @> $2
  `, [exceptionType, JSON.stringify(entityRefs)])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].status).toBe('open')
}

export async function assertAuditEventLogged(pool: Pool, verb: string, entityType: string) {
  const result = await pool.query(`
    SELECT * FROM audit_events 
    WHERE verb = $1 AND entity_type = $2
    ORDER BY created_at DESC
    LIMIT 1
  `, [verb, entityType])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].hash).toBeDefined()
}

export async function assertQBOObjectCreated(pool: Pool, externalRef: string) {
  const result = await pool.query(`
    SELECT * FROM qbo_objects 
    WHERE external_ref = $1
  `, [externalRef])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].qbo_id).toBeDefined()
}

export async function getConnectionStatus(pool: Pool, companyId: number, provider: string): Promise<string> {
  const result = await pool.query(`
    SELECT status FROM connections 
    WHERE company_id = $1 AND provider = $2
  `, [companyId, provider])
  
  return result.rows[0]?.status || 'disconnected'
}

export async function updateConnectionStatus(pool: Pool, companyId: number, provider: string, status: string) {
  await pool.query(`
    UPDATE connections 
    SET status = $1, updated_at = NOW()
    WHERE company_id = $2 AND provider = $3
  `, [status, companyId, provider])
}

export async function createTestScenario(pool: Pool, scenario: string) {
  const company = await createTestCompany(pool, { name: `${scenario} Test Company` })
  const user = await createTestUser(pool, company.id)
  const connections = await createTestConnections(pool, company.id)
  
  switch (scenario) {
    case 'happy-path':
      const payouts = await createTestStripePayouts(pool, company.id, 5)
      const bankTxs = await createTestBankTransactions(pool, company.id, 5)
      return { company, user, connections, payouts, bankTxs }
      
    case 'ambiguous-match':
      const payout = await createTestStripePayouts(pool, company.id, 1)
      // Create 2 bank transactions with same amount/date
      await pool.query(`
        INSERT INTO bank_transactions (company_id, account_id, provider_tx_id, amount, currency, date, description, created_at)
        VALUES 
          ($1, 1, 'bt_ambiguous_1', 1000, 'CAD', '2025-01-15', 'STRIPE PAYOUT A', NOW()),
          ($1, 1, 'bt_ambiguous_2', 1000, 'CAD', '2025-01-15', 'STRIPE PAYOUT B', NOW())
      `, [company.id, company.id])
      return { company, user, connections, payout: payout[0] }
      
    case 'cash-deposit':
      await pool.query(`
        INSERT INTO bank_transactions (company_id, account_id, provider_tx_id, amount, currency, date, description, created_at)
        VALUES ($1, 1, 'bt_cash', 1200, 'CAD', '2025-01-15', 'CASH DEPOSIT BRANCH', NOW())
      `, [company.id])
      return { company, user, connections }
      
    case 'internal-transfer':
      await pool.query(`
        INSERT INTO bank_transactions (company_id, account_id, provider_tx_id, amount, currency, date, description, created_at)
        VALUES 
          ($1, 1, 'bt_transfer_1', -500, 'CAD', '2025-01-15', 'TRANSFER TO ACCOUNT B', NOW()),
          ($1, 2, 'bt_transfer_2', 500, 'CAD', '2025-01-15', 'TRANSFER FROM ACCOUNT A', NOW())
      `, [company.id, company.id])
      return { company, user, connections }
      
    case 'multi-currency':
      await pool.query(`
        INSERT INTO stripe_payouts (company_id, payout_id, amount, currency, arrival_date, status, created_at)
        VALUES ($1, 'po_usd', 1000, 'USD', '2025-01-15', 'paid', NOW())
      `, [company.id])
      await pool.query(`
        INSERT INTO bank_transactions (company_id, account_id, provider_tx_id, amount, currency, date, description, created_at)
        VALUES ($1, 1, 'bt_cad', 1350, 'CAD', '2025-01-15', 'STRIPE PAYOUT USD', NOW())
      `, [company.id])
      return { company, user, connections }
      
    default:
      return { company, user, connections }
  }
}
