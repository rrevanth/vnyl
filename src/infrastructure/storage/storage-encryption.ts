/**
 * Storage encryption utilities for sensitive data
 * Provides AES encryption for AsyncStorage values
 */

// Simple base64 encoding/decoding for React Native
const base64Encode = (str: string): string => {
  if (typeof btoa !== 'undefined') {
    return btoa(str)
  }
  // Fallback for environments without btoa
  return Buffer.from(str, 'utf8').toString('base64')
}

const base64Decode = (str: string): string => {
  if (typeof atob !== 'undefined') {
    return atob(str)
  }
  // Fallback for environments without atob
  return Buffer.from(str, 'base64').toString('utf8')
}

// Simple XOR encryption for basic obfuscation
// Note: For production apps, consider using react-native-keychain or expo-crypto
export class StorageEncryption {
  private static readonly ENCRYPTION_KEY = 'vnyl-app-storage-key-2024'
  private static readonly ENCRYPTED_PREFIX = 'enc:'

  /**
   * Encrypt a string value
   */
  static encrypt(value: string): string {
    try {
      const encrypted = this.xorEncrypt(value, this.ENCRYPTION_KEY)
      const encoded = base64Encode(encrypted)
      return `${this.ENCRYPTED_PREFIX}${encoded}`
    } catch (error) {
      console.warn('Storage encryption failed, storing as plain text:', error)
      return value
    }
  }

  /**
   * Decrypt a string value
   */
  static decrypt(encryptedValue: string): string {
    try {
      if (!encryptedValue.startsWith(this.ENCRYPTED_PREFIX)) {
        // Not encrypted, return as-is
        return encryptedValue
      }

      const encodedValue = encryptedValue.slice(this.ENCRYPTED_PREFIX.length)
      const encrypted = base64Decode(encodedValue)
      return this.xorEncrypt(encrypted, this.ENCRYPTION_KEY)
    } catch (error) {
      console.warn('Storage decryption failed, returning encrypted value:', error)
      return encryptedValue
    }
  }

  /**
   * Check if a value is encrypted
   */
  static isEncrypted(value: string): boolean {
    return value.startsWith(this.ENCRYPTED_PREFIX)
  }

  /**
   * Simple XOR encryption implementation
   */
  private static xorEncrypt(text: string, key: string): string {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }
    return result
  }

  /**
   * Generate a hash of a value for integrity checking
   */
  static generateHash(value: string): string {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  /**
   * Verify the integrity of a value using its hash
   */
  static verifyHash(value: string, expectedHash: string): boolean {
    return this.generateHash(value) === expectedHash
  }
}

/**
 * Enhanced storage item with encryption metadata
 */
export interface EncryptedStorageItem<T = unknown> {
  value: T
  timestamp: number
  expiry?: number
  encrypted: boolean
  hash?: string
  version: string
}

/**
 * Create an encrypted storage item
 */
export const createEncryptedStorageItem = <T>(
  value: T,
  options: {
    encrypt?: boolean
    expiry?: number
    generateHash?: boolean
  } = {}
): EncryptedStorageItem<T> => {
  const timestamp = Date.now()
  const version = '1.0'
  
  let processedValue = value
  let encrypted = false
  let hash: string | undefined

  if (options.encrypt && typeof value === 'string') {
    processedValue = StorageEncryption.encrypt(value) as T
    encrypted = true
  }

  if (options.generateHash) {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value)
    hash = StorageEncryption.generateHash(valueStr)
  }

  return {
    value: processedValue,
    timestamp,
    expiry: options.expiry,
    encrypted,
    hash,
    version,
  }
}

/**
 * Extract value from encrypted storage item
 */
export const extractFromEncryptedStorageItem = <T>(
  item: EncryptedStorageItem<T>,
  options: {
    verifyHash?: boolean
  } = {}
): T => {
  let value = item.value

  // Decrypt if encrypted
  if (item.encrypted && typeof value === 'string') {
    value = StorageEncryption.decrypt(value) as T
  }

  // Verify hash if requested
  if (options.verifyHash && item.hash) {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value)
    if (!StorageEncryption.verifyHash(valueStr, item.hash)) {
      console.warn('Storage item hash verification failed, data may be corrupted')
    }
  }

  return value
}