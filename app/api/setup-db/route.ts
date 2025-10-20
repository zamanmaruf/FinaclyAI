import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setting up production database tables...')
    
    // Create signups table
    await query(`
      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        company_size VARCHAR(50) NOT NULL,
        stack_psp TEXT[] DEFAULT '{}',
        stack_ledger TEXT[] DEFAULT '{}',
        country VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        utm_term VARCHAR(100),
        utm_content VARCHAR(100),
        referrer TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ signups table created')
    
    // Create rate_limits table
    await query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        email VARCHAR(255) NOT NULL,
        endpoint VARCHAR(100) NOT NULL,
        request_count INTEGER DEFAULT 1,
        window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ip_address, email, endpoint, window_start)
      )
    `)
    console.log('✅ rate_limits table created')
    
    // Create accountant_partners table
    await query(`
      CREATE TABLE IF NOT EXISTS accountant_partners (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        client_count VARCHAR(50) NOT NULL,
        verticals TEXT[] DEFAULT '{}',
        qbo_pro_advisor BOOLEAN DEFAULT FALSE,
        onboarding_timeline VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ accountant_partners table created')
    
    // Create analytics_events table
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        payload JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ analytics_events table created')
    
    return NextResponse.json({
      success: true,
      message: 'Production database setup complete!'
    })

  } catch (error) {
    console.error('❌ Production database setup failed:', error)
    return NextResponse.json(
      { error: 'Database setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
