#!/usr/bin/env tsx
/**
 * One-time migration script to encrypt existing plaintext tokens
 * 
 * This script:
 * 1. Reads existing QboToken records and encrypts accessToken and refreshToken
 * 2. Reads existing BankItem records and encrypts accessToken
 * 3. Writes encrypted values to new *Encrypted columns
 * 4. Keeps old columns intact (marked deprecated in schema)
 * 
 * Run with: npm run migrate:encrypt
 */

import { PrismaClient } from '@prisma/client'
import { encrypt } from '../src/server/crypto'

const prisma = new PrismaClient()

interface MigrationResult {
  qboTokens: { success: number; failed: number; skipped: number }
  bankItems: { success: number; failed: number; skipped: number }
}

async function migrateQboTokens(): Promise<{ success: number; failed: number; skipped: number }> {
  console.log('\n📋 Migrating QBO tokens...')
  
  const tokens = await prisma.qboToken.findMany()
  console.log(`Found ${tokens.length} QBO token(s)`)
  
  let success = 0
  let failed = 0
  let skipped = 0
  
  for (const token of tokens) {
    try {
      // Skip if already encrypted
      if (token.accessTokenEncrypted && token.refreshTokenEncrypted) {
        console.log(`  ⏭️  QBO token ${token.realmId}: already encrypted, skipping`)
        skipped++
        continue
      }
      
      // Encrypt tokens
      const accessTokenEncrypted = encrypt(token.accessToken)
      const refreshTokenEncrypted = encrypt(token.refreshToken)
      
      // Update record
      await prisma.qboToken.update({
        where: { id: token.id },
        data: {
          accessTokenEncrypted,
          refreshTokenEncrypted,
        },
      })
      
      console.log(`  ✅ QBO token ${token.realmId}: encrypted successfully`)
      success++
    } catch (error) {
      console.error(`  ❌ QBO token ${token.realmId}: failed to encrypt`, error)
      failed++
    }
  }
  
  return { success, failed, skipped }
}

async function migrateBankItems(): Promise<{ success: number; failed: number; skipped: number }> {
  console.log('\n📋 Migrating Plaid/Bank items...')
  
  const items = await prisma.bankItem.findMany()
  console.log(`Found ${items.length} bank item(s)`)
  
  let success = 0
  let failed = 0
  let skipped = 0
  
  for (const item of items) {
    try {
      // Skip if already encrypted
      if (item.accessTokenEncrypted) {
        console.log(`  ⏭️  Bank item ${item.itemId}: already encrypted, skipping`)
        skipped++
        continue
      }
      
      // Encrypt access token
      const accessTokenEncrypted = encrypt(item.accessToken)
      
      // Update record
      await prisma.bankItem.update({
        where: { id: item.id },
        data: {
          accessTokenEncrypted,
        },
      })
      
      console.log(`  ✅ Bank item ${item.itemId}: encrypted successfully`)
      success++
    } catch (error) {
      console.error(`  ❌ Bank item ${item.itemId}: failed to encrypt`, error)
      failed++
    }
  }
  
  return { success, failed, skipped }
}

async function main() {
  console.log('🔐 Starting token encryption migration...\n')
  console.log('This script will encrypt existing plaintext tokens using SECRET_ENCRYPTION_KEY')
  console.log('Encrypted tokens will be written to new *Encrypted columns')
  console.log('Original plaintext columns will remain intact (marked deprecated)\n')
  
  const result: MigrationResult = {
    qboTokens: { success: 0, failed: 0, skipped: 0 },
    bankItems: { success: 0, failed: 0, skipped: 0 },
  }
  
  try {
    // Migrate QBO tokens
    result.qboTokens = await migrateQboTokens()
    
    // Migrate Bank items
    result.bankItems = await migrateBankItems()
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Migration Summary')
    console.log('='.repeat(60))
    
    console.log('\nQBO Tokens:')
    console.log(`  ✅ Success: ${result.qboTokens.success}`)
    console.log(`  ❌ Failed:  ${result.qboTokens.failed}`)
    console.log(`  ⏭️  Skipped: ${result.qboTokens.skipped}`)
    
    console.log('\nBank Items:')
    console.log(`  ✅ Success: ${result.bankItems.success}`)
    console.log(`  ❌ Failed:  ${result.bankItems.failed}`)
    console.log(`  ⏭️  Skipped: ${result.bankItems.skipped}`)
    
    const totalFailed = result.qboTokens.failed + result.bankItems.failed
    const totalSuccess = result.qboTokens.success + result.bankItems.success
    const totalSkipped = result.qboTokens.skipped + result.bankItems.skipped
    
    console.log('\nTotal:')
    console.log(`  ✅ Success: ${totalSuccess}`)
    console.log(`  ❌ Failed:  ${totalFailed}`)
    console.log(`  ⏭️  Skipped: ${totalSkipped}`)
    console.log('')
    
    if (totalFailed > 0) {
      console.error('❌ Migration completed with errors')
      process.exit(1)
    } else {
      console.log('✅ Migration completed successfully!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

