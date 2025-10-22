import { query } from '../lib/db.js'

export async function initReconciliationDatabase() {
  try {
    console.log('🔄 Initializing reconciliation database schema...')

    // 1. Core Entities (Section 2.1)
    await query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        home_currency VARCHAR(3) DEFAULT 'CAD',
        country VARCHAR(100) DEFAULT 'Canada',
        settings_jsonb JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ companies table created')

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ users table created')

    await query(`
      CREATE TABLE IF NOT EXISTS connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL CHECK (provider IN ('stripe', 'qbo', 'plaid', 'flinks', 'paypal', 'square', 'xero')),
        status VARCHAR(20) DEFAULT 'connected' CHECK (status IN ('connected', 'expired', 'revoked')),
        auth_encrypted JSONB NOT NULL,
        last_synced_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, provider)
      )
    `)
    console.log('✅ connections table created')

    await query(`
      CREATE TABLE IF NOT EXISTS provider_cursors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        cursor_token TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, provider, resource)
      )
    `)
    console.log('✅ provider_cursors table created')

    // 2. Source Data Tables (Section 2.2)
    await query(`
      CREATE TABLE IF NOT EXISTS stripe_payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        payout_id VARCHAR(255) UNIQUE NOT NULL,
        amount_net BIGINT NOT NULL,
        amount_gross BIGINT NOT NULL,
        amount_fee BIGINT NOT NULL,
        currency VARCHAR(3) NOT NULL,
        arrival_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ stripe_payouts table created')

    await query(`
      CREATE TABLE IF NOT EXISTS stripe_balance_txns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        balance_id VARCHAR(255) UNIQUE NOT NULL,
        amount BIGINT NOT NULL,
        currency VARCHAR(3) NOT NULL,
        type VARCHAR(50) NOT NULL,
        source_id VARCHAR(255),
        payout_id VARCHAR(255),
        created TIMESTAMP WITH TIME ZONE NOT NULL,
        fee BIGINT DEFAULT 0,
        net BIGINT NOT NULL,
        data_jsonb JSONB NOT NULL,
        imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ stripe_balance_txns table created')

    await query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, provider, provider_account_id)
      )
    `)
    console.log('✅ bank_accounts table created')

    await query(`
      CREATE TABLE IF NOT EXISTS bank_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
        provider_tx_id VARCHAR(255) NOT NULL,
        amount BIGINT NOT NULL,
        currency VARCHAR(3) NOT NULL,
        posted_date DATE NOT NULL,
        description TEXT,
        category_guess VARCHAR(100),
        raw_jsonb JSONB NOT NULL,
        imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, account_id, provider_tx_id)
      )
    `)
    console.log('✅ bank_transactions table created')

    await query(`
      CREATE TABLE IF NOT EXISTS qbo_objects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        obj_type VARCHAR(50) NOT NULL CHECK (obj_type IN ('Deposit', 'Payment', 'Invoice', 'Journal', 'Transfer', 'Bill', 'BillPayment')),
        qbo_id VARCHAR(255) NOT NULL,
        txn_date DATE NOT NULL,
        amount BIGINT NOT NULL,
        currency VARCHAR(3) NOT NULL,
        memo TEXT,
        external_ref VARCHAR(255),
        raw_jsonb JSONB NOT NULL,
        imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, qbo_id)
      )
    `)
    console.log('✅ qbo_objects table created')

    // 3. Derived Data Tables (Section 2.3)
    await query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        left_ref VARCHAR(255) NOT NULL,
        right_ref VARCHAR(255) NOT NULL,
        left_type VARCHAR(20) NOT NULL CHECK (left_type IN ('payout', 'bank', 'qbo')),
        right_type VARCHAR(20) NOT NULL CHECK (right_type IN ('payout', 'bank', 'qbo')),
        strategy VARCHAR(50) NOT NULL,
        confidence DECIMAL(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, left_ref, right_ref)
      )
    `)
    console.log('✅ matches table created')

    await query(`
      CREATE TABLE IF NOT EXISTS exceptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        subtype VARCHAR(50),
        entity_refs JSONB NOT NULL,
        evidence_jsonb JSONB NOT NULL,
        proposed_action VARCHAR(50) CHECK (proposed_action IN ('create_qbo_deposit', 'mark_invoice_paid', 'create_transfer', 'create_expense', 'ignore')),
        confidence DECIMAL(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by UUID REFERENCES users(id)
      )
    `)
    console.log('✅ exceptions table created')

    await query(`
      CREATE TABLE IF NOT EXISTS audit_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        actor_type VARCHAR(20) NOT NULL,
        actor_id VARCHAR(255) NOT NULL,
        verb VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        payload_jsonb JSONB NOT NULL,
        hash VARCHAR(64) NOT NULL,
        prev_hash VARCHAR(64),
        trace_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ audit_events table created')

    // 4. Additional Tables for Orchestration
    await query(`
      CREATE TABLE IF NOT EXISTS sync_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        job_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ sync_jobs table created')

    await query(`
      CREATE TABLE IF NOT EXISTS sync_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        cron_expression VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_run TIMESTAMP WITH TIME ZONE,
        next_run TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ sync_schedules table created')

    // 5. Indexes for Performance (Section 2)
    console.log('🔄 Creating indexes...')

    // Bank transactions indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_bank_transactions_company_amount_date 
      ON bank_transactions(company_id, amount, posted_date)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_bank_transactions_company_account 
      ON bank_transactions(company_id, account_id)
    `)

    // Stripe payouts indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_stripe_payouts_company_amount_date 
      ON stripe_payouts(company_id, amount_net, arrival_date)
    `)

    // QBO objects indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_qbo_objects_company_type_amount_date 
      ON qbo_objects(company_id, obj_type, amount, txn_date)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_qbo_objects_external_ref 
      ON qbo_objects(company_id, external_ref)
    `)

    // Matches indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_matches_company_left 
      ON matches(company_id, left_type, left_ref)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_matches_company_right 
      ON matches(company_id, right_type, right_ref)
    `)

    // Exceptions indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_exceptions_company_status 
      ON exceptions(company_id, status)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_exceptions_company_type 
      ON exceptions(company_id, type)
    `)

    // Audit events indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_events_company_entity 
      ON audit_events(company_id, entity_type, entity_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_events_company_created 
      ON audit_events(company_id, created_at)
    `)

    // Connections indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_connections_company_provider 
      ON connections(company_id, provider)
    `)

    // Provider cursors indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_provider_cursors_company_provider 
      ON provider_cursors(company_id, provider, resource)
    `)

    console.log('✅ All indexes created')

    console.log('🎉 Reconciliation database schema initialization complete!')

  } catch (error) {
    console.error('❌ Error initializing reconciliation database:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  initReconciliationDatabase()
    .then(() => {
      console.log('✅ Database initialization completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error)
      process.exit(1)
    })
}
