/**
 * Centralized logging utility for settings operations
 * Provides consistent logging format and structured data
 */
interface LogData {
  [key: string]: any
}

export class SettingsLogger {
  private static createLogMessage(category: string, action: string, data?: LogData): string {
    return data ? `${category}: ${action}` : `${category}: ${action}`
  }

  private static formatData(data?: LogData): LogData | undefined {
    return data && Object.keys(data).length > 0 ? data : undefined
  }

  static start(action: string, data?: LogData): void {
    console.log(`🎯 Settings: Starting ${action}`, this.formatData(data))
  }

  static saving(preferences: any): void {
    console.log('💾 Settings: Saving preferences through domain layer:', preferences)
  }

  static success(action: string): void {
    console.log(`✅ Settings: ${action} successful`)
  }

  static refresh(action: string): void {
    console.log(`🔄 Settings: Provider state refreshed after ${action.toLowerCase()}`)
  }

  static error(action: string, error: any): void {
    console.error(`❌ Settings: Failed ${action.toLowerCase()}`, error)
  }

  // Repository specific logging
  static repositoryStart(operation: string, data?: LogData): void {
    console.log(`💾 UserRepository: Starting ${operation} with:`, this.formatData(data))
  }

  static repositoryCurrentState(operation: string, data: LogData): void {
    console.log(`📋 UserRepository: Current user preferences before ${operation}:`, data)
  }

  static repositoryMerged(operation: string, data: LogData): void {
    console.log(`🎯 UserRepository: Merged user preferences after ${operation}:`, data)
  }

  static repositorySuccess(operation: string): void {
    console.log(`✅ UserRepository: ${operation} saved to storage successfully`)
  }

  static repositoryError(operation: string, error: any): void {
    console.error(`❌ UserRepository: Failed to ${operation.toLowerCase()}`, error)
  }

  static repositoryFound(operation: string): void {
    console.log(`📦 UserRepository: Found raw data in storage, parsing...`)
  }

  static repositoryNotFound(operation: string): void {
    console.log(`📭 UserRepository: No user data found in storage`)
  }

  static repositoryRetrieved(data: LogData): void {
    console.log('📊 UserRepository: Retrieved user data from storage:', data)
  }

  // Provider specific logging
  static providerStart(action: string): void {
    console.log(`🚀 UserPreferencesProvider: Starting ${action}`)
  }

  static providerLoaded(data: LogData): void {
    console.log('✅ UserPreferencesProvider: Loaded user preferences from storage:', data)
  }

  static providerSuccess(action: string): void {
    console.log(`🎯 UserPreferencesProvider: ${action} updated successfully`)
  }

  static providerRefreshing(): void {
    console.log('🔄 UserPreferencesProvider: Refreshing user preferences')
  }

  static providerRefreshed(data: LogData): void {
    console.log('✅ UserPreferencesProvider: Refreshed user preferences:', data)
  }

  static providerError(action: string, error: any): void {
    console.error(`❌ UserPreferencesProvider: Failed to ${action.toLowerCase()}`, error)
  }

  static providerFallback(action: string): void {
    console.log(`🔄 UserPreferencesProvider: Falling back to ${action}`)
  }

  static providerNotReady(): void {
    console.log('🔧 UserPreferencesProvider: Use case not ready yet')
  }
}

/**
 * Type-safe logging helper for common settings operations
 */
export const settingsLog = {
  theme: {
    mode: (mode: string) => SettingsLogger.start('Updating theme mode', { mode }),
    accentColor: (accentColor: string) => SettingsLogger.start('Updating accent color', { accentColor })
  },
  display: {
    fontSize: (fontSize: string) => SettingsLogger.start('Updating font size', { fontSize }),
    fontFamily: (fontFamily: string) => SettingsLogger.start('Updating font family', { fontFamily }),
    lineHeight: (lineHeight: number) => SettingsLogger.start('Updating line height', { lineHeight }),
    compactMode: (compactMode: boolean) => SettingsLogger.start('Updating compact mode', { compactMode })
  }
} as const