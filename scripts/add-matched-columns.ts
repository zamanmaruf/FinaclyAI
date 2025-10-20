const { query } = require('../lib/db')
const { config } = require('dotenv')

// Load environment variables
config({ path: '.env.local' })

async function addMatchedColumns() {
  try {
    console.log('🔧 Adding is_matched columns to transaction tables...')

    // Add is_matched column to stripe_charges
    await query(`
      ALTER TABLE stripe_charges 
      ADD COLUMN IF NOT EXISTS is_matched BOOLEAN DEFAULT FALSE
    `)
    console.log('✅ Added is_matched column to stripe_charges')

    // Add is_matched column to stripe_payouts
    await query(`
      ALTER TABLE stripe_payouts 
      ADD COLUMN IF NOT EXISTS is_matched BOOLEAN DEFAULT FALSE
    `)
    console.log('✅ Added is_matched column to stripe_payouts')

    // Add is_matched column to bank_transactions
    await query(`
      ALTER TABLE bank_transactions 
      ADD COLUMN IF NOT EXISTS is_matched BOOLEAN DEFAULT FALSE
    `)
    console.log('✅ Added is_matched column to bank_transactions')

    // Add is_matched column to qbo_transactions
    await query(`
      ALTER TABLE qbo_transactions 
      ADD COLUMN IF NOT EXISTS is_matched BOOLEAN DEFAULT FALSE
    `)
    console.log('✅ Added is_matched column to qbo_transactions')

    // Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_stripe_charges_is_matched ON stripe_charges(is_matched);
      CREATE INDEX IF NOT EXISTS idx_stripe_payouts_is_matched ON stripe_payouts(is_matched);
      CREATE INDEX IF NOT EXISTS idx_bank_transactions_is_matched ON bank_transactions(is_matched);
      CREATE INDEX IF NOT EXISTS idx_qbo_transactions_is_matched ON qbo_transactions(is_matched);
    `)
    console.log('✅ Created indexes for is_matched columns')

    console.log('🎉 Successfully added is_matched columns to all transaction tables!')
  } catch (error) {
    console.error('❌ Error adding is_matched columns:', error)
    throw error
  }
}

if (require.main === module) {
  addMatchedColumns()
    .then(() => console.log('✅ Column addition complete'))
    .catch((err) => console.error('💥 Column addition failed:', err))
}
