import { User, UserPreferences, DEFAULT_USER_PREFERENCES } from '@/src/domain/entities'
import { IUserRepository } from '@/src/domain/repositories'
import { IStorageService, ILoggingService } from '@/src/domain/services'
import { generateUUID } from '@/src/infrastructure/utils'
import { SettingsLogger } from '@/src/presentation/shared/utils/settings-logger'

const STORAGE_KEY = 'vnyl_user_data'
const SCHEMA_VERSION = 1

interface StoredUserData {
  [userId: string]: {
    preferences: UserPreferences
    metadata: {
      userId: string
      createdAt: string
      updatedAt: string
      schemaVersion: number
    }
  }
}

export class UserRepository implements IUserRepository {
  constructor(
    private readonly storageService: IStorageService,
    private readonly logger: ILoggingService
  ) {}

  async getUser(): Promise<User | null> {
    try {
      SettingsLogger.repositoryStart('getUser')
      this.logger.debug('Getting user from storage')

      const rawData = await this.storageService.getItem(STORAGE_KEY)
      if (!rawData) {
        SettingsLogger.repositoryNotFound('getUser')
        this.logger.debug('No user data found in storage')
        return null
      }

      SettingsLogger.repositoryFound('getUser')

      const userData: StoredUserData = JSON.parse(rawData)
      const userIds = Object.keys(userData)

      if (userIds.length === 0) {
        SettingsLogger.repositoryNotFound('getUser')
        this.logger.debug('User data exists but no users found')
        return null
      }

      // For single user app, get the first (and only) user
      const userId = userIds[0]
      const storedUser = userData[userId]

      SettingsLogger.repositoryRetrieved({
        userId: storedUser.metadata.userId,
        themeMode: storedUser.preferences.theme?.mode,
        accentColor: storedUser.preferences.theme?.accentColor,
        fontSize: storedUser.preferences.displaySettings?.fontSize,
        fontFamily: storedUser.preferences.displaySettings?.fontFamily,
        compactMode: storedUser.preferences.displaySettings?.compactMode
      })

      const user: User = {
        userId: storedUser.metadata.userId,
        createdAt: storedUser.metadata.createdAt,
        updatedAt: storedUser.metadata.updatedAt,
        preferences: storedUser.preferences,
        metadata: {
          schemaVersion: storedUser.metadata.schemaVersion
        }
      }

      this.logger.debug('User retrieved successfully', undefined, { userId })
      return user

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      SettingsLogger.repositoryError('get user from storage', errorInstance)
      this.logger.error('Failed to get user from storage', errorInstance)
      throw new Error(`Failed to get user: ${errorInstance.message}`)
    }
  }

  async createUser(): Promise<User> {
    try {
      const userId = generateUUID()
      const now = new Date().toISOString()

      this.logger.info('Creating new user', { userId })

      const user: User = {
        userId,
        createdAt: now,
        updatedAt: now,
        preferences: { ...DEFAULT_USER_PREFERENCES },
        metadata: {
          schemaVersion: SCHEMA_VERSION
        }
      }

      await this.saveUser(user)

      this.logger.info('User created successfully', { userId })
      return user

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to create user', errorInstance)
      throw new Error(`Failed to create user: ${errorInstance.message}`)
    }
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<User> {
    try {
      SettingsLogger.repositoryStart('updatePreferences', {
        preferenceKeys: Object.keys(preferences),
        themeMode: preferences.theme?.mode,
        accentColor: preferences.theme?.accentColor,
        fontSize: preferences.displaySettings?.fontSize,
        fontFamily: preferences.displaySettings?.fontFamily,
        compactMode: preferences.displaySettings?.compactMode
      })

      this.logger.debug('Updating user preferences', undefined, {
        preferenceKeys: Object.keys(preferences)
      })

      const existingUser = await this.getUser()
      if (!existingUser) {
        throw new Error('No user found to update preferences')
      }

      SettingsLogger.repositoryCurrentState('update', {
        userId: existingUser.userId,
        currentThemeMode: existingUser.preferences.theme?.mode,
        currentAccentColor: existingUser.preferences.theme?.accentColor,
        currentFontSize: existingUser.preferences.displaySettings?.fontSize,
        currentFontFamily: existingUser.preferences.displaySettings?.fontFamily,
        currentCompactMode: existingUser.preferences.displaySettings?.compactMode
      })

      const updatedUser: User = {
        ...existingUser,
        updatedAt: new Date().toISOString(),
        preferences: {
          ...existingUser.preferences,
          ...preferences
        }
      }

      SettingsLogger.repositoryMerged('update', {
        userId: updatedUser.userId,
        newThemeMode: updatedUser.preferences.theme?.mode,
        newAccentColor: updatedUser.preferences.theme?.accentColor,
        newFontSize: updatedUser.preferences.displaySettings?.fontSize,
        newFontFamily: updatedUser.preferences.displaySettings?.fontFamily,
        newCompactMode: updatedUser.preferences.displaySettings?.compactMode
      })

      await this.saveUser(updatedUser)

      SettingsLogger.repositorySuccess('User preferences')
      this.logger.info('User preferences updated successfully', {
        userId: updatedUser.userId,
        updatedKeys: Object.keys(preferences)
      })

      return updatedUser

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      SettingsLogger.repositoryError('update user preferences', errorInstance)
      this.logger.error('Failed to update user preferences', errorInstance)
      throw new Error(`Failed to update preferences: ${errorInstance.message}`)
    }
  }

  async resetPreferences(): Promise<User> {
    try {
      this.logger.info('Resetting user preferences to defaults')

      const existingUser = await this.getUser()
      if (!existingUser) {
        throw new Error('No user found to reset preferences')
      }

      const updatedUser: User = {
        ...existingUser,
        updatedAt: new Date().toISOString(),
        preferences: { ...DEFAULT_USER_PREFERENCES }
      }

      await this.saveUser(updatedUser)

      this.logger.info('User preferences reset successfully', {
        userId: updatedUser.userId
      })

      return updatedUser

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to reset user preferences', errorInstance)
      throw new Error(`Failed to reset preferences: ${errorInstance.message}`)
    }
  }

  async deleteUser(): Promise<void> {
    try {
      this.logger.info('Deleting user data')

      await this.storageService.removeItem(STORAGE_KEY)

      this.logger.info('User data deleted successfully')

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to delete user', errorInstance)
      throw new Error(`Failed to delete user: ${errorInstance.message}`)
    }
  }

  private async saveUser(user: User): Promise<void> {
    try {
      // Get existing data or create empty object
      const existingRawData = await this.storageService.getItem(STORAGE_KEY)
      const existingData: StoredUserData = existingRawData ? JSON.parse(existingRawData) : {}

      // Update the user data using simple userId as key
      const userData: StoredUserData = {
        ...existingData,
        [user.userId]: {
          preferences: user.preferences,
          metadata: {
            userId: user.userId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            schemaVersion: user.metadata.schemaVersion
          }
        }
      }

      await this.storageService.setItem(STORAGE_KEY, JSON.stringify(userData))

      this.logger.debug('User saved to storage', undefined, { userId: user.userId })

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to save user to storage', errorInstance)
      throw new Error(`Failed to save user: ${errorInstance.message}`)
    }
  }
}