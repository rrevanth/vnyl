import { User, UserPreferences } from '@/src/domain/entities'

export interface IUserRepository {
  getUser(): Promise<User | null>
  createUser(): Promise<User>
  updatePreferences(preferences: Partial<UserPreferences>): Promise<User>
  resetPreferences(): Promise<User>
  deleteUser(): Promise<void>
}