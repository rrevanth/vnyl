/**
 * Storage service interface for persistent data storage
 * Infrastructure layer will implement this interface using AsyncStorage, MMKV, or other storage solutions
 */

export interface StorageOptions {
  encrypt?: boolean
  expiry?: number // milliseconds
  compress?: boolean
}

export interface StorageItem<T = unknown> {
  value: T
  timestamp: number
  expiry?: number
}

export interface IStorageService {
  // Basic operations
  set<T>(key: string, value: T, options?: StorageOptions): Promise<void>
  get<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  
  // Batch operations
  setMultiple<T>(items: { key: string; value: T; options?: StorageOptions }[]): Promise<void>
  getMultiple<T>(keys: string[]): Promise<{ key: string; value: T | null }[]>
  removeMultiple(keys: string[]): Promise<void>
  
  // Key management
  getAllKeys(): Promise<string[]>
  hasKey(key: string): Promise<boolean>
  getSize(): Promise<number>
  
  // Pattern-based operations
  getKeysMatching(pattern: RegExp): Promise<string[]>
  removeKeysMatching(pattern: RegExp): Promise<string[]>
  
  // Expiry management
  setWithExpiry<T>(key: string, value: T, expiryMs: number): Promise<void>
  getWithoutExpiry<T>(key: string): Promise<StorageItem<T> | null>
  cleanupExpiredItems(): Promise<string[]>
  
  // JSON operations (for complex objects)
  setJson<T>(key: string, value: T, options?: StorageOptions): Promise<void>
  getJson<T>(key: string): Promise<T | null>
  
  // User-specific storage
  setUserData<T>(userId: string, key: string, value: T, options?: StorageOptions): Promise<void>
  getUserData<T>(userId: string, key: string): Promise<T | null>
  removeUserData(userId: string, key: string): Promise<void>
  clearUserData(userId: string): Promise<void>
  getUserKeys(userId: string): Promise<string[]>
  
  // App-specific storage namespaces
  setAppData<T>(namespace: string, key: string, value: T, options?: StorageOptions): Promise<void>
  getAppData<T>(namespace: string, key: string): Promise<T | null>
  removeAppData(namespace: string, key: string): Promise<void>
  clearAppData(namespace: string): Promise<void>
  
  // Cache-like operations with TTL
  setCache<T>(key: string, value: T, ttlMs: number): Promise<void>
  getCache<T>(key: string): Promise<T | null>
  invalidateCache(keyPattern?: RegExp): Promise<string[]>
  
  // Encrypted storage for sensitive data
  setSecure<T>(key: string, value: T): Promise<void>
  getSecure<T>(key: string): Promise<T | null>
  removeSecure(key: string): Promise<void>
  
  // Storage statistics and monitoring
  getStorageStats(): Promise<{
    totalKeys: number
    totalSize: number
    expiredKeys: number
    encryptedKeys: number
    oldestEntry: number
    newestEntry: number
  }>
  
  // Migration and backup
  exportData(keys?: string[]): Promise<Record<string, unknown>>
  importData(data: Record<string, unknown>, overwrite?: boolean): Promise<string[]>
  
  // Memory management
  optimize(): Promise<{
    removedExpired: number
    removedOrphaned: number
    compressedEntries: number
  }>
}