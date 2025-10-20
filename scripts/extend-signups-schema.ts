import { query } from '../lib/db'

async function extendSignupsSchema() {
  try {
    console.log('🔄 Extending signups table schema...')
    
    // Add new columns to existing signups table
    await query(`
      ALTER TABLE signups 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50),
      ADD COLUMN IF NOT EXISTS company_size VARCHAR(20),
      ADD COLUMN IF NOT EXISTS stack_psp TEXT[],
      ADD COLUMN IF NOT EXISTS stack_ledger TEXT[],
      ADD COLUMN IF NOT EXISTS country VARCHAR(10),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
      ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
      ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100),
      ADD COLUMN IF NOT EXISTS utm_term VARCHAR(100),
      ADD COLUMN IF NOT EXISTS utm_content VARCHAR(100),
      ADD COLUMN IF NOT EXISTS referrer TEXT,
      ADD COLUMN IF NOT EXISTS ip_address INET,
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `)
    
    // Create index for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_signups_email ON signups(email)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_signups_created_at ON signups(created_at)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_signups_role ON signups(role)
    `)
    
    // Create rate limiting table
    await query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        ip_address INET NOT NULL,
        email VARCHAR(255),
        endpoint VARCHAR(100) NOT NULL,
        request_count INTEGER DEFAULT 1,
        window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ip_address, email, endpoint, window_start)
      )
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_email ON rate_limits(ip_address, email)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start)
    `)
    
    console.log('✅ Database schema extended successfully!')
    console.log('📊 New columns added:')
    console.log('   - role (Owner/Accountant/Controller/Other)')
    console.log('   - company_size (1-10, 11-50, 51-200, 200+)')
    console.log('   - stack_psp (Stripe/PayPal/Square array)')
    console.log('   - stack_ledger (QBO/Xero array)')
    console.log('   - country, phone, UTM parameters')
    console.log('   - referrer, ip_address, user_agent')
    console.log('   - updated_at timestamp')
    console.log('🔒 Rate limiting table created')
    
  } catch (error) {
    console.error('❌ Error extending database schema:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  extendSignupsSchema()
    .then(() => {
      console.log('🎉 Schema extension complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Schema extension failed:', error)
      process.exit(1)
    })
}

export default extendSignupsSchema
