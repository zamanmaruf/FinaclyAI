import { query } from '../lib/db.js'

export async function extendExistingTables() {
  try {
    console.log('🔄 Extending existing tables for reconciliation system...')

    // 1. Add company_id to existing signups table
    await query(`
      ALTER TABLE signups 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL
    `)
    console.log('✅ Added company_id to signups table')

    // 2. Create api_credentials table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS api_credentials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        service VARCHAR(50) NOT NULL,
        encrypted_credentials JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, service)
      )
    `)
    console.log('✅ api_credentials table created/verified')

    // 3. Add missing columns to companies table if they don't exist
    await query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS home_currency VARCHAR(3) DEFAULT 'CAD'
    `)
    
    await query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Canada'
    `)
    
    await query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS settings_jsonb JSONB DEFAULT '{}'
    `)
    console.log('✅ Added missing columns to companies table')

    // 4. Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_signups_company 
      ON signups(company_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_api_credentials_company_service 
      ON api_credentials(company_id, service)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_api_credentials_active 
      ON api_credentials(is_active) WHERE is_active = true
    `)

    console.log('✅ Created indexes for extended tables')

    // 5. Migrate existing signups to companies if needed
    // This is a one-time migration to create companies for existing signups
    const orphanedSignups = await query(`
      SELECT id, company_name, country, created_at 
      FROM signups 
      WHERE company_id IS NULL 
      LIMIT 10
    `)

    if (orphanedSignups.rows.length > 0) {
      console.log(`🔄 Found ${orphanedSignups.rows.length} signups without companies, creating companies...`)
      
      for (const signup of orphanedSignups.rows) {
        // Create company for this signup
        const companyResult = await query(`
          INSERT INTO companies (name, country, created_at)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [signup.company_name, signup.country || 'Canada', signup.created_at])

        const companyId = companyResult.rows[0].id

        // Update signup with company_id
        await query(`
          UPDATE signups 
          SET company_id = $1 
          WHERE id = $2
        `, [companyId, signup.id])

        console.log(`✅ Created company for signup ${signup.id}`)
      }
    }

    console.log('🎉 Existing tables extension complete!')

  } catch (error) {
    console.error('❌ Error extending existing tables:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  extendExistingTables()
    .then(() => {
      console.log('✅ Table extension completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Table extension failed:', error)
      process.exit(1)
    })
}
