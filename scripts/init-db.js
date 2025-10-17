const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function initDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('🔗 Connecting to database...')
    
    // Create signups table
    await client.query(`
      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        company_name VARCHAR(255),
        current_tools TEXT,
        referral_source VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ Database schema initialized successfully!')
    console.log('📊 Created table: signups')
    
    // Test the connection
    const result = await client.query('SELECT NOW() as current_time')
    console.log('🕐 Database time:', result.rows[0].current_time)
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

initDatabase()
  .then(() => {
    console.log('🎉 Database setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error.message)
    process.exit(1)
  })
