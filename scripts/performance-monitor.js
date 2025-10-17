#!/usr/bin/env node

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function monitorPerformance() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 Performance Monitoring Report')
    console.log('================================')
    
    // Database connection stats
    console.log('\n📊 Database Pool Statistics:')
    console.log(`Total connections: ${pool.totalCount}`)
    console.log(`Idle connections: ${pool.idleCount}`)
    console.log(`Waiting connections: ${pool.waitingCount}`)
    
    // Query performance test
    console.log('\n⚡ Query Performance Test:')
    const startTime = Date.now()
    
    const result = await client.query('SELECT COUNT(*) as count FROM signups')
    const queryTime = Date.now() - startTime
    
    console.log(`Signup count query: ${queryTime}ms`)
    console.log(`Total signups: ${result.rows[0].count}`)
    
    // Memory usage
    const memUsage = process.memoryUsage()
    console.log('\n💾 Memory Usage:')
    console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`)
    console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`)
    console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`)
    console.log(`External: ${Math.round(memUsage.external / 1024 / 1024)}MB`)
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:')
    if (queryTime > 100) {
      console.log('⚠️  Database queries are slow (>100ms)')
      console.log('   Consider adding database indexes')
    } else {
      console.log('✅ Database queries are performing well')
    }
    
    if (memUsage.heapUsed > 100 * 1024 * 1024) {
      console.log('⚠️  High memory usage detected')
      console.log('   Consider implementing memory optimization')
    } else {
      console.log('✅ Memory usage is within acceptable limits')
    }
    
  } catch (error) {
    console.error('❌ Performance monitoring error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

monitorPerformance()
