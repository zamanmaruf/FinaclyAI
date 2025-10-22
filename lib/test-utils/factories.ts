// Test data creation utilities - NO MOCK DATA
// These functions create minimal test records for E2E testing

export interface CompanyData {
  company_id?: number
  name: string
  home_currency: string
  country: string
  created_at: Date
}

export interface UserData {
  email: string
  name: string
  role: 'owner' | 'accountant' | 'controller' | 'bookkeeper'
  company_id: number
  created_at: Date
}

export interface StripePayoutData {
  company_id: number
  payout_id: string
  provider_tx_id?: string
  amount: number
  amount_gross: number
  amount_fee: number
  currency: string
  arrival_date: Date
  status: 'paid' | 'pending' | 'failed'
  created_at: Date
}

export interface BankTransactionData {
  company_id: number
  account_id: number
  provider_tx_id: string
  amount: number
  currency: string
  date: Date
  description: string
  category_guess?: string
  created_at: Date
}

export interface QBOObjectData {
  company_id: number
  obj_type: 'Deposit' | 'Payment' | 'Invoice' | 'Journal' | 'Transfer' | 'Bill' | 'BillPayment'
  qbo_id: string
  txn_date: Date
  amount: number
  currency: string
  memo?: string
  external_ref?: string
  created_at: Date
}

export interface ExceptionData {
  company_id: number
  exception_type: string
  entity_refs: Record<string, any>
  evidence_jsonb: Record<string, any>
  proposed_action: string
  confidence: number
  status: 'open' | 'resolved' | 'ignored'
  created_at: Date
}

export interface MatchData {
  company_id: number
  left_ref: string
  right_ref: string
  left_type: 'payout' | 'bank' | 'qbo'
  right_type: 'payout' | 'bank' | 'qbo'
  strategy: string
  confidence: number
  created_at: Date
}

// Company Factory - creates minimal test company
export function createCompany(overrides: Partial<CompanyData> = {}): CompanyData {
  return {
    name: 'Test Company',
    home_currency: 'CAD',
    country: 'CA',
    created_at: new Date(),
    ...overrides,
  }
}

// User Factory - creates minimal test user
export function createUser(overrides: Partial<UserData> = {}): UserData {
  return {
    email: 'test@example.com',
    name: 'Test User',
    role: 'owner',
    company_id: 1,
    created_at: new Date(),
    ...overrides,
  }
}

// Stripe Payout Factory - creates minimal payout record
export function createStripePayout(overrides: Partial<StripePayoutData> = {}): StripePayoutData {
  return {
    company_id: 1,
    payout_id: 'po_test_001',
    amount: 1000,
    amount_gross: 1030,
    amount_fee: 30,
    currency: 'CAD',
    arrival_date: new Date(),
    status: 'paid',
    created_at: new Date(),
    ...overrides,
  }
}

// Bank Transaction Factory - creates minimal bank transaction
export function createBankTransaction(overrides: Partial<BankTransactionData> = {}): BankTransactionData {
  return {
    company_id: 1,
    account_id: 1,
    provider_tx_id: 'bt_test_001',
    amount: 1000,
    currency: 'CAD',
    date: new Date(),
    description: 'STRIPE PAYOUT',
    category_guess: 'Transfer',
    created_at: new Date(),
    ...overrides,
  }
}

// QBO Object Factory - creates minimal QBO object
export function createQBOObject(overrides: Partial<QBOObjectData> = {}): QBOObjectData {
  return {
    company_id: 1,
    obj_type: 'Deposit',
    qbo_id: 'qbo_test_001',
    txn_date: new Date(),
    amount: 1000,
    currency: 'CAD',
    memo: 'Test deposit',
    external_ref: 'stripe_payout:po_test_001',
    created_at: new Date(),
    ...overrides,
  }
}

// Exception Factory - creates minimal exception
export function createException(overrides: Partial<ExceptionData> = {}): ExceptionData {
  return {
    company_id: 1,
    exception_type: 'unmatched_payout',
    entity_refs: { payout_id: 'po_test_001' },
    evidence_jsonb: { amount: 1000, currency: 'CAD' },
    proposed_action: 'create_deposit',
    confidence: 0.9,
    status: 'open',
    created_at: new Date(),
    ...overrides,
  }
}

// Match Factory - creates minimal match
export function createMatch(overrides: Partial<MatchData> = {}): MatchData {
  return {
    company_id: 1,
    left_ref: 'po_test_001',
    right_ref: 'bt_test_001',
    left_type: 'payout',
    right_type: 'bank',
    strategy: 'amount_date_match',
    confidence: 0.95,
    created_at: new Date(),
    ...overrides,
  }
}

// Helper function to create test data with unique identifiers
export function createTestData(companyId: number, suffix: string = '001') {
  return {
    company: createCompany({ company_id: companyId }),
    user: createUser({ company_id: companyId }),
    payout: createStripePayout({ 
      company_id: companyId, 
      payout_id: `po_test_${suffix}`,
      provider_tx_id: `bt_test_${suffix}`
    }),
    bankTransaction: createBankTransaction({ 
      company_id: companyId,
      provider_tx_id: `bt_test_${suffix}`
    }),
    qboObject: createQBOObject({ 
      company_id: companyId,
      qbo_id: `qbo_test_${suffix}`,
      external_ref: `stripe_payout:po_test_${suffix}`
    }),
    exception: createException({ 
      company_id: companyId,
      entity_refs: { payout_id: `po_test_${suffix}` }
    }),
    match: createMatch({ 
      company_id: companyId,
      left_ref: `po_test_${suffix}`,
      right_ref: `bt_test_${suffix}`
    })
  }
}