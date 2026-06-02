import { useState, useEffect } from 'react'

/**
 * useMediaQuery — Check if a CSS media query matches
 * @param {string} query - e.g. '(max-width: 768px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)

    mediaQuery.addEventListener('change', handler)
    setMatches(mediaQuery.matches)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}
