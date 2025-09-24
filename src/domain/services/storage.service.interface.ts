export interface IStorageService {
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<string | null>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
  getAllKeys(): Promise<readonly string[]>
  multiGet(keys: readonly string[]): Promise<readonly (readonly [string, string | null])[]>
  multiSet(keyValuePairs: readonly (readonly [string, string])[]): Promise<void>
  multiRemove(keys: readonly string[]): Promise<void>
}