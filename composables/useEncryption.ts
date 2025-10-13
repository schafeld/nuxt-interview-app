// composables/useEncryption.ts
// Simple encryption/decryption for demo purposes
// In production, use proper encryption libraries and server-side handling

export const useEncryption = () => {
  const ENCRYPTION_KEY = 'vet-app-demo-key-2024'
  
  // Simple XOR-based encryption for demo purposes
  const encrypt = (text: string): string => {
    if (!text) return ''
    
    let encrypted = ''
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i)
      const keyCode = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      encrypted += String.fromCharCode(charCode ^ keyCode)
    }
    
    // Convert to base64 to make it safe for storage
    return btoa(encrypted)
  }
  
  // Decrypt the base64 encoded string
  const decrypt = (encryptedText: string): string => {
    if (!encryptedText) return ''
    
    try {
      // Decode from base64
      const encrypted = atob(encryptedText)
      
      let decrypted = ''
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i)
        const keyCode = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        decrypted += String.fromCharCode(charCode ^ keyCode)
      }
      
      return decrypted
    } catch (error) {
      console.error('Decryption failed:', error)
      return ''
    }
  }
  
  // Verify a password against an encrypted password
  const verifyPassword = (plainPassword: string, encryptedPassword: string): boolean => {
    if (!plainPassword || !encryptedPassword) return false
    
    const decryptedPassword = decrypt(encryptedPassword)
    return decryptedPassword === plainPassword
  }
  
  return {
    encrypt,
    decrypt,
    verifyPassword
  }
}