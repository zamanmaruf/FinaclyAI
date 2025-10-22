const { Pool } = require('pg')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function setupTestDatabase() {
  console.log('🔧 Setting up test database...')
  
  const testUrl = process.env.DATABASE_URL_TEST || 'postgresql://postgres:postgres@localhost:5432/finacly_test'
  const pool = new Pool({
    connectionString: testUrl,
  })

  try {
    // Create test database if it doesn't exist
    const adminPool = new Pool({
      connectionString: testUrl.replace('/finacly_test', '/postgres'),
    })

    try {
      await adminPool.query('CREATE DATABASE finacly_test')
      console.log('✅ Test database created')
    } catch (error) {
      if (error.code === '42P04') {
        console.log('ℹ️  Test database already exists')
      } else {
        throw error
      }
    } finally {
      await adminPool.end()
    }

    // Run database migrations
    console.log('📊 Running database migrations...')
    
    // Read and execute the reconciliation schema
    const schemaPath = path.join(__dirname, 'init-reconciliation-db.ts')
    if (fs.existsSync(schemaPath)) {
      try {
        execSync('npx ts-node scripts/init-reconciliation-db.ts', { stdio: 'inherit' })
        console.log('✅ Database schema applied')
      } catch (error) {
        console.error('❌ Failed to apply database schema:', error.message)
        throw error
      }
    }

    // Create test data
    console.log('🌱 Seeding test data...')
    
    // This would call your seed functions
    // await seedTestData(pool)
    
    console.log('✅ Test database setup complete')
    
  } catch (error) {
    console.error('❌ Test database setup failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  setupTestDatabase()
}

module.exports = { setupTestDatabase }
