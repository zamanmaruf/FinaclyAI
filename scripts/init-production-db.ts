import { query } from '../lib/db'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

export async function initProductionDatabase() {
  try {
    console.log('🚀 Initializing production database schema...')
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL)

    // Companies/Users table
    await query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'inactive',
        subscription_tier VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created companies table')

    // API Credentials (encrypted)
    await query(`
      CREATE TABLE IF NOT EXISTS api_credentials (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        service VARCHAR(50) NOT NULL,
        encrypted_credentials TEXT NOT NULL,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created api_credentials table')

    // Stripe Charges
    await query(`
      CREATE TABLE IF NOT EXISTS stripe_charges (
        id VARCHAR(255) PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        fee DECIMAL(12,2),
        net DECIMAL(12,2),
        customer_id VARCHAR(255),
        description TEXT,
        payout_id VARCHAR(255),
        status VARCHAR(50),
        created_at TIMESTAMP NOT NULL,
        imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created stripe_charges table')

    // Stripe Payouts
    await query(`
      CREATE TABLE IF NOT EXISTS stripe_payouts (
        id VARCHAR(255) PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        arrival_date DATE NOT NULL,
        status VARCHAR(50),
        created_at TIMESTAMP NOT NULL,
        imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created stripe_payouts table')

    // Bank Transactions (from Plaid)
    await query(`
      CREATE TABLE IF NOT EXISTS bank_transactions (
        id VARCHAR(255) PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        plaid_account_id VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        date DATE NOT NULL,
        name TEXT,
        merchant_name TEXT,
        category TEXT,
        pending BOOLEAN DEFAULT false,
        imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created bank_transactions table')

    // QuickBooks Transactions
    await query(`
      CREATE TABLE IF NOT EXISTS qbo_transactions (
        id VARCHAR(255) PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        txn_date DATE NOT NULL,
        customer_ref VARCHAR(255),
        memo TEXT,
        status VARCHAR(50),
        created_at TIMESTAMP NOT NULL,
        imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created qbo_transactions table')

    // Transaction Matches
    await query(`
      CREATE TABLE IF NOT EXISTS transaction_matches (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        stripe_charge_id VARCHAR(255),
        stripe_payout_id VARCHAR(255),
        bank_transaction_id VARCHAR(255),
        qbo_transaction_id VARCHAR(255),
        match_confidence DECIMAL(5,2),
        match_type VARCHAR(50),
        matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        matched_by VARCHAR(50) DEFAULT 'system'
      )
    `)
    console.log('✅ Created transaction_matches table')

    // Exceptions (Unmatched/Issues)
    await query(`
      CREATE TABLE IF NOT EXISTS exceptions (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        exception_type VARCHAR(100) NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium',
        description TEXT NOT NULL,
        related_stripe_id VARCHAR(255),
        related_bank_id VARCHAR(255),
        related_qbo_id VARCHAR(255),
        suggested_action TEXT,
        status VARCHAR(50) DEFAULT 'open',
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created exceptions table')

    // Sync History
    await query(`
      CREATE TABLE IF NOT EXISTS sync_history (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        service VARCHAR(50) NOT NULL,
        sync_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        records_fetched INTEGER DEFAULT 0,
        error_message TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `)
    console.log('✅ Created sync_history table')

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_stripe_charges_company ON stripe_charges(company_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_stripe_charges_payout ON stripe_charges(payout_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_stripe_payouts_company ON stripe_payouts(company_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_bank_transactions_company ON bank_transactions(company_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_qbo_transactions_company ON qbo_transactions(company_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_exceptions_company_status ON exceptions(company_id, status)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_transaction_matches_company ON transaction_matches(company_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_api_credentials_company_service ON api_credentials(company_id, service)`)
    console.log('✅ Created database indexes')

    console.log('🎉 Production database schema initialized successfully!')
    
  } catch (error) {
    console.error('❌ Error initializing production database:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  initProductionDatabase()
    .then(() => {
      console.log('✅ Database initialization complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error)
      process.exit(1)
    })
}
