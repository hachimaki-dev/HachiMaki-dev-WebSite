import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * useAuth — Authentication hook
 * @returns {{ user: object|null, loading: boolean, signIn: function, signOut: function, error: string|null }}
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    /* Get initial session */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    /* Listen for auth changes */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email, password) => {
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return false
    }
    setLoading(false)
    return true
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    const { error: authError } = await supabase.auth.signOut()
    if (authError) {
      setError(authError.message)
    }
  }, [])

  return { user, loading, error, signIn, signOut }
}
