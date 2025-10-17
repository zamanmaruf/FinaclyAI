const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkSignups() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 Checking signups in database...')
    
    // Get all signups
    const result = await client.query('SELECT * FROM signups ORDER BY created_at DESC')
    
    console.log(`📊 Total signups: ${result.rows.length}`)
    
    if (result.rows.length > 0) {
      console.log('\n📋 Recent signups:')
      result.rows.forEach((signup, index) => {
        console.log(`\n${index + 1}. ${signup.full_name}`)
        console.log(`   Email: ${signup.email}`)
        console.log(`   Company: ${signup.company_name}`)
        console.log(`   Tools: ${signup.current_tools || 'Not specified'}`)
        console.log(`   Referral: ${signup.referral_source || 'Not specified'}`)
        console.log(`   Signed up: ${signup.created_at}`)
      })
    } else {
      console.log('❌ No signups found in database')
    }
    
  } catch (error) {
    console.error('❌ Error checking signups:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

checkSignups()
