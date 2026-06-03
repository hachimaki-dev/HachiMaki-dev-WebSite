import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * useSubscriptions — Handle email subscription (public)
 * @returns {{ subscribe: function, loading: boolean, error: string|null }}
 */
export function useSubscriptions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const subscribe = useCallback(async ({ email, subscribeStreams, subscribeNewsletter }) => {
    setLoading(true)
    setError(null)

    // Call the RPC we defined in the migration
    const { error: rpcError } = await supabase.rpc('subscribe_email', {
      email_input: email,
      streams_input: subscribeStreams,
      newsletter_input: subscribeNewsletter,
    })

    setLoading(false)

    if (rpcError) {
      setError(rpcError.message)
      return { success: false, error: rpcError.message }
    }

    return { success: true }
  }, [])

  return { subscribe, loading, error }
}
