import { Pool } from 'pg'
import { createTestScenario } from '../utils/db-helpers'

export interface TestScenario {
  name: string
  setup: (pool: Pool) => Promise<any>
  cleanup: (pool: Pool) => Promise<void>
  assertions: (pool: Pool, data: any) => Promise<void>
}

export const happyPathScenario: TestScenario = {
  name: 'happy-path',
  setup: async (pool: Pool) => {
    return await createTestScenario(pool, 'happy-path')
  },
  cleanup: async (pool: Pool) => {
    await pool.query('DELETE FROM matches WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%happy-path%\')')
    await pool.query('DELETE FROM exceptions WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%happy-path%\')')
    await pool.query('DELETE FROM stripe_payouts WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%happy-path%\')')
    await pool.query('DELETE FROM bank_transactions WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%happy-path%\')')
    await pool.query('DELETE FROM connections WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%happy-path%\')')
    await pool.query('DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%happy-path%\')')
    await pool.query('DELETE FROM companies WHERE name LIKE \'%happy-path%\'')
  },
  assertions: async (pool: Pool, data: any) => {
    const { company } = data
    
    // Assert 5 payouts created
    const payoutCount = await pool.query('SELECT COUNT(*) as count FROM stripe_payouts WHERE company_id = $1', [company.id])
    expect(parseInt(payoutCount.rows[0].count)).toBe(5)
    
    // Assert 5 bank transactions created
    const txCount = await pool.query('SELECT COUNT(*) as count FROM bank_transactions WHERE company_id = $1', [company.id])
    expect(parseInt(txCount.rows[0].count)).toBe(5)
    
    // Assert connections created
    const connCount = await pool.query('SELECT COUNT(*) as count FROM connections WHERE company_id = $1', [company.id])
    expect(parseInt(connCount.rows[0].count)).toBe(3)
  }
}

export const ambiguousMatchScenario: TestScenario = {
  name: 'ambiguous-match',
  setup: async (pool: Pool) => {
    return await createTestScenario(pool, 'ambiguous-match')
  },
  cleanup: async (pool: Pool) => {
    await pool.query('DELETE FROM bank_transactions WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%ambiguous%\')')
    await pool.query('DELETE FROM stripe_payouts WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%ambiguous%\')')
    await pool.query('DELETE FROM connections WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%ambiguous%\')')
    await pool.query('DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%ambiguous%\')')
    await pool.query('DELETE FROM companies WHERE name LIKE \'%ambiguous%\'')
  },
  assertions: async (pool: Pool, data: any) => {
    const { company } = data
    
    // Assert 1 payout created
    const payoutCount = await pool.query('SELECT COUNT(*) as count FROM stripe_payouts WHERE company_id = $1', [company.id])
    expect(parseInt(payoutCount.rows[0].count)).toBe(1)
    
    // Assert 2 bank transactions created
    const txCount = await pool.query('SELECT COUNT(*) as count FROM bank_transactions WHERE company_id = $1', [company.id])
    expect(parseInt(txCount.rows[0].count)).toBe(2)
  }
}

export const cashDepositScenario: TestScenario = {
  name: 'cash-deposit',
  setup: async (pool: Pool) => {
    return await createTestScenario(pool, 'cash-deposit')
  },
  cleanup: async (pool: Pool) => {
    await pool.query('DELETE FROM bank_transactions WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%cash%\' OR name LIKE \'%Cash%\')')
    await pool.query('DELETE FROM connections WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%cash%\' OR name LIKE \'%Cash%\')')
    await pool.query('DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%cash%\' OR name LIKE \'%Cash%\')')
    await pool.query('DELETE FROM companies WHERE name LIKE \'%cash%\' OR name LIKE \'%Cash%\'')
  },
  assertions: async (pool: Pool, data: any) => {
    const { company } = data
    
    // Assert 1 bank transaction with CASH keyword created
    const txResult = await pool.query(`
      SELECT * FROM bank_transactions 
      WHERE company_id = $1 AND description LIKE '%CASH%'
    `, [company.id])
    
    expect(txResult.rows.length).toBe(1)
    expect(txResult.rows[0].amount).toBe(1200)
  }
}

export const internalTransferScenario: TestScenario = {
  name: 'internal-transfer',
  setup: async (pool: Pool) => {
    return await createTestScenario(pool, 'internal-transfer')
  },
  cleanup: async (pool: Pool) => {
    await pool.query('DELETE FROM bank_transactions WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%transfer%\' OR name LIKE \'%Transfer%\')')
    await pool.query('DELETE FROM connections WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%transfer%\' OR name LIKE \'%Transfer%\')')
    await pool.query('DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%transfer%\' OR name LIKE \'%Transfer%\')')
    await pool.query('DELETE FROM companies WHERE name LIKE \'%transfer%\' OR name LIKE \'%Transfer%\'')
  },
  assertions: async (pool: Pool, data: any) => {
    const { company } = data
    
    // Assert 2 bank transactions with equal/opposite amounts
    const txResult = await pool.query(`
      SELECT * FROM bank_transactions 
      WHERE company_id = $1 
      ORDER BY amount DESC
    `, [company.id])
    
    expect(txResult.rows.length).toBe(2)
    expect(txResult.rows[0].amount).toBe(500)
    expect(txResult.rows[1].amount).toBe(-500)
  }
}

export const multiCurrencyScenario: TestScenario = {
  name: 'multi-currency',
  setup: async (pool: Pool) => {
    return await createTestScenario(pool, 'multi-currency')
  },
  cleanup: async (pool: Pool) => {
    await pool.query('DELETE FROM bank_transactions WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%currency%\' OR name LIKE \'%Currency%\')')
    await pool.query('DELETE FROM stripe_payouts WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%currency%\' OR name LIKE \'%Currency%\')')
    await pool.query('DELETE FROM connections WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%currency%\' OR name LIKE \'%Currency%\')')
    await pool.query('DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%currency%\' OR name LIKE \'%Currency%\')')
    await pool.query('DELETE FROM companies WHERE name LIKE \'%currency%\' OR name LIKE \'%Currency%\'')
  },
  assertions: async (pool: Pool, data: any) => {
    const { company } = data
    
    // Assert USD payout and CAD bank transaction
    const payoutResult = await pool.query(`
      SELECT * FROM stripe_payouts 
      WHERE company_id = $1 AND currency = 'USD'
    `, [company.id])
    
    const txResult = await pool.query(`
      SELECT * FROM bank_transactions 
      WHERE company_id = $1 AND currency = 'CAD'
    `, [company.id])
    
    expect(payoutResult.rows.length).toBe(1)
    expect(txResult.rows.length).toBe(1)
    expect(payoutResult.rows[0].amount).toBe(1000)
    expect(txResult.rows[0].amount).toBe(1350)
  }
}

export const tokenExpiryScenario: TestScenario = {
  name: 'token-expiry',
  setup: async (pool: Pool) => {
    return await createTestScenario(pool, 'token-expiry')
  },
  cleanup: async (pool: Pool) => {
    await pool.query('DELETE FROM connections WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%token%\' OR name LIKE \'%Token%\')')
    await pool.query('DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%token%\' OR name LIKE \'%Token%\')')
    await pool.query('DELETE FROM companies WHERE name LIKE \'%token%\' OR name LIKE \'%Token%\'')
  },
  assertions: async (pool: Pool, data: any) => {
    const { company } = data
    
    // Assert expired connection
    const connResult = await pool.query(`
      SELECT * FROM connections 
      WHERE company_id = $1 AND provider = 'qbo' AND status = 'expired'
    `, [company.id])
    
    expect(connResult.rows.length).toBe(1)
  }
}

export const networkErrorScenario: TestScenario = {
  name: 'network-error',
  setup: async (pool: Pool) => {
    return await createTestScenario(pool, 'network-error')
  },
  cleanup: async (pool: Pool) => {
    await pool.query('DELETE FROM connections WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%network%\' OR name LIKE \'%Network%\')')
    await pool.query('DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%network%\' OR name LIKE \'%Network%\')')
    await pool.query('DELETE FROM companies WHERE name LIKE \'%network%\' OR name LIKE \'%Network%\'')
  },
  assertions: async (pool: Pool, data: any) => {
    const { company } = data
    
    // Assert company created
    const companyResult = await pool.query('SELECT * FROM companies WHERE id = $1', [company.id])
    expect(companyResult.rows.length).toBe(1)
  }
}

export const idempotencyScenario: TestScenario = {
  name: 'idempotency',
  setup: async (pool: Pool) => {
    return await createTestScenario(pool, 'idempotency')
  },
  cleanup: async (pool: Pool) => {
    await pool.query('DELETE FROM qbo_objects WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%idempotency%\' OR name LIKE \'%Idempotency%\')')
    await pool.query('DELETE FROM connections WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%idempotency%\' OR name LIKE \'%Idempotency%\')')
    await pool.query('DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%idempotency%\' OR name LIKE \'%Idempotency%\')')
    await pool.query('DELETE FROM companies WHERE name LIKE \'%idempotency%\' OR name LIKE \'%Idempotency%\'')
  },
  assertions: async (pool: Pool, data: any) => {
    const { company } = data
    
    // Assert existing QBO object with external_ref
    const qboResult = await pool.query(`
      SELECT * FROM qbo_objects 
      WHERE company_id = $1 AND external_ref = 'stripe_payout:po_123'
    `, [company.id])
    
    expect(qboResult.rows.length).toBe(1)
    expect(qboResult.rows[0].qbo_id).toBe('qbo_123')
  }
}

export const allScenarios: TestScenario[] = [
  happyPathScenario,
  ambiguousMatchScenario,
  cashDepositScenario,
  internalTransferScenario,
  multiCurrencyScenario,
  tokenExpiryScenario,
  networkErrorScenario,
  idempotencyScenario
]

export function getScenario(name: string): TestScenario | undefined {
  return allScenarios.find(scenario => scenario.name === name)
}

export function getAllScenarioNames(): string[] {
  return allScenarios.map(scenario => scenario.name)
}
