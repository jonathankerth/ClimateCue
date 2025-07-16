import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for persistent state management
 * Uses localStorage for long-term persistence and sessionStorage for temporary data
 * 
 * @param {string} key - The storage key
 * @param {any} defaultValue - Default value if nothing is stored
 * @param {Object} options - Configuration options
 * @param {boolean} options.session - Use sessionStorage instead of localStorage
 * @param {function} options.serializer - Custom serialization function
 * @param {function} options.deserializer - Custom deserialization function
 * @param {number} options.ttl - Time to live in milliseconds
 * @returns {[any, function]} - [value, setValue] tuple
 */
export const usePersistentState = (
  key,
  defaultValue,
  options = {}
) => {
  const {
    session = false,
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    ttl = null
  } = options

  // Safe storage reference that handles SSR
  const getStorage = () => {
    if (typeof window === 'undefined') return null
    return session ? sessionStorage : localStorage
  }
  
  const isInitialized = useRef(false)
  
  // Initialize state from storage
  const [storedValue, setStoredValue] = useState(() => {
    // Always return defaultValue on server-side to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return defaultValue
    }
    return defaultValue // Return default initially, load from storage after hydration
  })
  
  // Load from storage after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const storage = getStorage()
      if (!storage) return
      
      const item = storage.getItem(key)
      
      if (item === null) {
        return
      }

      const parsed = deserializer(item)
      
      // Check TTL if specified
      if (ttl && parsed._timestamp) {
        const now = Date.now()
        const expiry = parsed._timestamp + ttl
        
        if (now > expiry) {
          storage.removeItem(key)
          return
        }
        
        // Set the actual value without timestamp
        setStoredValue(parsed.value)
        return
      }
      
      setStoredValue(parsed._timestamp ? parsed.value : parsed)
    } catch (error) {
      console.warn(`Error reading ${key} from ${session ? 'sessionStorage' : 'localStorage'}:`, error)
    }
  }, [key, session, ttl, deserializer]) // Load once after mount

  // Update storage when state changes
  const setValue = (value) => {
    try {
      setStoredValue(value)
      
      if (typeof window !== 'undefined') {
        const storage = getStorage()
        if (!storage) return
        
        const dataToStore = ttl 
          ? { value, _timestamp: Date.now() }
          : value
          
        storage.setItem(key, serializer(dataToStore))
      }
    } catch (error) {
      console.error(`Error setting ${key} in ${session ? 'sessionStorage' : 'localStorage'}:`, error)
    }
  }

  // Clear storage item
  const clearValue = () => {
    try {
      setStoredValue(defaultValue)
      if (typeof window !== 'undefined') {
        const storage = getStorage()
        if (storage) {
          storage.removeItem(key)
        }
      }
    } catch (error) {
      console.error(`Error clearing ${key} from ${session ? 'sessionStorage' : 'localStorage'}:`, error)
    }
  }

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined' || session) return

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsed = deserializer(e.newValue)
          setStoredValue(parsed._timestamp ? parsed.value : parsed)
        } catch (error) {
          console.warn(`Error parsing storage change for ${key}:`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, session, deserializer])

  // Mark as initialized after first render
  useEffect(() => {
    isInitialized.current = true
  }, [])

  return [storedValue, setValue, clearValue, isInitialized.current]
}

export default usePersistentState
