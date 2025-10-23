// composables/useSecureEncryption.ts
// Production-grade encryption using Web Crypto API for client-side hashing
// Note: In production, password hashing should be done server-side

export const useSecureEncryption = () => {
  // Convert ArrayBuffer to hex string for storage
  const bufferToHex = (buffer: ArrayBuffer): string => {
    const array = new Uint8Array(buffer)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Convert hex string back to ArrayBuffer
  const hexToBuffer = (hex: string): ArrayBuffer => {
    const matches = hex.match(/.{1,2}/g)
    if (!matches) throw new Error('Invalid hex string')
    const array = new Uint8Array(matches.map(byte => parseInt(byte, 16)))
    return array.buffer
  }

  // Hash password using PBKDF2
  const hashPassword = async (password: string): Promise<string> => {
    try {
      // Generate random salt
      const saltBuffer = crypto.getRandomValues(new Uint8Array(16)).buffer
      const encoder = new TextEncoder()
      const passwordBuffer = encoder.encode(password).buffer

      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      )

      // Derive key using PBKDF2
      const derivedKey = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      )
      
      // Return salt:hash format for storage
      return `${bufferToHex(saltBuffer)}:${bufferToHex(derivedKey)}`
    } catch (error) {
      console.error('Password hashing failed:', error)
      throw new Error('Failed to hash password')
    }
  }

  // Verify password against stored hash
  const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
    try {
      const [saltHex, hashHex] = storedHash.split(':')
      if (!saltHex || !hashHex) {
        throw new Error('Invalid hash format')
      }

      const saltBuffer = hexToBuffer(saltHex)
      const storedHashBuffer = hexToBuffer(hashHex)
      
      const encoder = new TextEncoder()
      const passwordBuffer = encoder.encode(password).buffer

      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      )

      // Derive key with same parameters
      const derivedKey = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      )

      // Compare the derived key with the stored hash
      const derivedArray = new Uint8Array(derivedKey)
      const storedArray = new Uint8Array(storedHashBuffer)

      // Constant-time comparison to prevent timing attacks
      if (derivedArray.length !== storedArray.length) {
        return false
      }

      let result = 0
      for (let i = 0; i < derivedArray.length; i++) {
        result |= derivedArray[i] ^ storedArray[i]
      }

      return result === 0
    } catch (error) {
      console.error('Password verification failed:', error)
      return false
    }
  }

  // Migrate old XOR-encrypted passwords to new secure format
  const migrateOldPassword = async (plainPassword: string, oldEncryptedPassword: string): Promise<string> => {
    try {
      // First verify using old method
      const { decrypt } = useEncryption()
      const decryptedPassword = decrypt(oldEncryptedPassword)
      
      if (decryptedPassword === plainPassword) {
        // Password matches, create new secure hash
        return await hashPassword(plainPassword)
      }
      
      throw new Error('Password verification failed during migration')
    } catch (error) {
      console.error('Migration failed:', error)
      throw new Error('Failed to migrate password')
    }
  }

  // Check if a password hash is using the new secure format
  const isSecureHash = (hash: string): boolean => {
    // Secure hashes have salt:hash format with specific lengths
    const parts = hash.split(':')
    return parts.length === 2 && parts[0].length === 32 && parts[1].length === 64
  }

  // Secure random token generation
  const generateSecureToken = (length: number = 32): string => {
    const buffer = crypto.getRandomValues(new Uint8Array(length)).buffer
    return bufferToHex(buffer)
  }

  // Generate secure session ID
  const generateSessionId = (): string => {
    return generateSecureToken(16) // 128-bit session ID
  }

  return {
    hashPassword,
    verifyPassword,
    migrateOldPassword,
    isSecureHash,
    generateSecureToken,
    generateSessionId
  }
}