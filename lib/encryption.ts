import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'd2e6096461c05754f1f473b7032dfefaa4f2321b33782aa56030660c0ca6e2a4'
const ALGORITHM = 'aes-256-gcm'

// Only validate in production
if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required in production')
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be 64 characters (32 bytes) in hex format')
}

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY || '', 'hex'), iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decrypt(encrypted: string): string {
  try {
    const parts = encrypted.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }
    
    const [ivHex, authTagHex, encryptedText] = parts
    
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY || '', 'hex'), iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
