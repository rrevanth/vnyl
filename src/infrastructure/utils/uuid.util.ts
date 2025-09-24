/**
 * Simple UUID v4 generator without external dependencies
 * Uses crypto.getRandomValues() for secure random number generation
 */
export const generateUUID = (): string => {
  // Check if we're in a React Native environment with crypto support
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser/React Native with crypto support
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const array = new Uint8Array(1)
      crypto.getRandomValues(array)
      const r = array[0] % 16
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  } else {
    // Fallback for environments without crypto (should not happen in RN)
    console.warn('crypto.getRandomValues not available, using Math.random fallback')
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}

/**
 * Validates if a string is a valid UUID v4 format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}