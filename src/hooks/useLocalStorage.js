import { useState, useCallback } from 'react'

/**
 * useLocalStorage — Persist UI preferences in localStorage
 * NOT for business data — only for things like theme, sidebar state, etc.
 *
 * @param {string} key
 * @param {*} initialValue
 * @returns {[any, function]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      // Silently fail — localStorage might be full or disabled
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}
