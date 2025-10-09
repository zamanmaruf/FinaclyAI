import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { env } from '@/env'

/**
 * AES-256-GCM encryption/decryption utility for storing provider tokens at rest.
 * 
 * Uses SECRET_ENCRYPTION_KEY from environment. Fails loudly if key is missing.
 * Returns base64-encoded strings in format: iv:authTag:ciphertext
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

// Derive a 32-byte key from the environment variable
function getEncryptionKey(): Buffer {
  if (!env.SECRET_ENCRYPTION_KEY) {
    console.error('[crypto] ❌ SECRET_ENCRYPTION_KEY is not set. Cannot initialize encryption.')
    throw new Error('SECRET_ENCRYPTION_KEY is required for token encryption')
  }
  
  if (env.SECRET_ENCRYPTION_KEY.length < 32) {
    console.error('[crypto] ❌ SECRET_ENCRYPTION_KEY must be at least 32 characters')
    throw new Error('SECRET_ENCRYPTION_KEY is too short (minimum 32 characters)')
  }
  
  // Use the first 32 bytes of the key (if longer, truncate; if exactly 32, use as-is)
  return Buffer.from(env.SECRET_ENCRYPTION_KEY.slice(0, 32), 'utf-8')
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 * @param plaintext - The string to encrypt
 * @returns Base64-encoded string in format "iv:authTag:ciphertext"
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty plaintext')
  }
  
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
  ciphertext += cipher.final('base64')
  
  const authTag = cipher.getAuthTag()
  
  // Combine iv:authTag:ciphertext
  const combined = `${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext}`
  
  return combined
}

/**
 * Decrypts a ciphertext string that was encrypted with encrypt()
 * @param ciphertext - Base64-encoded string in format "iv:authTag:ciphertext"
 * @returns The decrypted plaintext string
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) {
    throw new Error('Cannot decrypt empty ciphertext')
  }
  
  const parts = ciphertext.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format. Expected "iv:authTag:ciphertext"')
  }
  
  const [ivBase64, authTagBase64, encryptedData] = parts
  
  const key = getEncryptionKey()
  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')
  
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let plaintext = decipher.update(encryptedData, 'base64', 'utf8')
  plaintext += decipher.final('utf8')
  
  return plaintext
}

/**
 * Test helper to verify encryption/decryption is working
 */
export function testCrypto(): boolean {
  try {
    const testString = 'test-token-12345'
    const encrypted = encrypt(testString)
    const decrypted = decrypt(encrypted)
    
    if (testString !== decrypted) {
      console.error('[crypto] ❌ Encryption test failed: decrypted value does not match original')
      return false
    }
    
    console.log('[crypto] ✅ Encryption test passed')
    return true
  } catch (error) {
    console.error('[crypto] ❌ Encryption test failed:', error)
    return false
  }
}

// Run self-test on module load
if (process.env.NODE_ENV !== 'test') {
  try {
    testCrypto()
  } catch (error) {
    console.error('[crypto] ❌ Failed to initialize crypto module:', error)
    if (env.PUBLIC_MODE === 'production') {
      process.exit(1)
    }
  }
}

