import { query } from '../lib/db'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function createTestCompany() {
  try {
    console.log('🏢 Creating test company...')

    // Create a test company
    const result = await query(`
      INSERT INTO companies (name, email, status, subscription_tier)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
      'Test Company Inc.',
      'test@example.com',
      'active',
      'growth'
    ])

    const companyId = result.rows[0].id
    console.log(`✅ Created test company with ID: ${companyId}`)

    // Also create the original company if it doesn't exist
    try {
      const originalResult = await query(`
        INSERT INTO companies (name, email, status, subscription_tier)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [
        'Finacly AI Demo Company',
        'demo@finacly.ai',
        'active',
        'growth'
      ])

      if (originalResult.rows.length > 0) {
        console.log(`✅ Created demo company with ID: ${originalResult.rows[0].id}`)
      } else {
        console.log('📝 Demo company already exists')
      }
    } catch (error) {
      console.log('📝 Demo company already exists or error:', (error as Error).message)
    }

    console.log('🎉 Test company setup complete!')
    
  } catch (error) {
    console.error('❌ Error creating test company:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  createTestCompany()
    .then(() => {
      console.log('✅ Test company creation complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Test company creation failed:', error)
      process.exit(1)
    })
}
